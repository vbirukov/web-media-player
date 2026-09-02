import net from "node:net";
import crypto from "node:crypto";
import fs from "node:fs";

const PORT = Number(process.env.CDP_PORT || 9223);
const NAVIGATE_TO = process.env.NAV_TO || "http://localhost:5173/index.html";
const OUT = process.argv[2] || "artifacts/cdp-shot.png";

function makeFrame(payload) {
  const buf = Buffer.from(payload, "utf8");
  const len = buf.length;
  let header;
  if (len < 126) header = Buffer.from([0x81, 0x80 | len]);
  else {
    header = Buffer.alloc(4); header[0] = 0x81; header[1] = 0x80 | 126; header.writeUInt16BE(len, 2);
  }
  const mask = crypto.randomBytes(4);
  const masked = Buffer.from(buf);
  for (let i = 0; i < masked.length; i++) masked[i] ^= mask[i % 4];
  return Buffer.concat([header, mask, masked]);
}

function wsConnect(url) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const key = crypto.randomBytes(16).toString("base64");
    const sock = net.connect(Number(u.port), u.hostname);
    let acc = Buffer.alloc(0);
    let ready = false;
    const pending = new Map();
    let id = 1;
    sock.setNoDelay(true);
    sock.on("connect", () => {
      sock.write(`GET ${u.pathname}${u.search} HTTP/1.1\r\nHost: ${u.hostname}:${u.port}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: ${key}\r\nSec-WebSocket-Version: 13\r\n\r\n`);
    });
    sock.on("data", (d) => {
      acc = Buffer.concat([acc, d]);
      if (!ready) {
        const i = acc.indexOf("\r\n\r\n");
        if (i === -1) return;
        const head = acc.slice(0, i).toString("latin1");
        acc = acc.slice(i + 4);
        if (!/101/.test(head)) { reject(new Error("upgrade failed")); return; }
        ready = true;
        resolve({ send, close });
      }
      // parse frames
      while (acc.length >= 2) {
        const b0 = acc[0], b1 = acc[1];
        const op = b0 & 0x0f; let len = b1 & 0x7f; let off = 2;
        const masked = (b1 & 0x80) !== 0;
        if (len === 126) { if (acc.length < 4) break; len = acc.readUInt16BE(2); off = 4; }
        else if (len === 127) { if (acc.length < 10) break; len = Number(acc.readBigUInt64BE(2)); off = 10; }
        if (masked) off += 4;
        if (acc.length < off + len) break;
        const payload = acc.slice(off, off + len).toString("utf8");
        acc = acc.slice(off + len);
        if (op === 0x1 || op === 0x2) {
          const msg = JSON.parse(payload);
          if (msg.id && pending.has(msg.id)) { const r = pending.get(msg.id); pending.delete(msg.id); r(msg.result); }
        }
      }
    });
    sock.on("error", (e) => { if (!ready) reject(e); });
    function send(method, params = {}) {
      return new Promise((res) => {
        const mid = id++;
        pending.set(mid, res);
        sock.write(makeFrame(JSON.stringify({ id: mid, method, params })));
        setTimeout(() => { if (pending.has(mid)) { pending.delete(mid); res(undefined); } }, 10000);
      });
    }
    function close() { try { sock.end(); } catch {} }
  });
}

async function main() {
  const list = await fetch(`http://127.0.0.1:${PORT}/json`).then((r) => r.json());
  const page = list.find((t) => t.type === "page");
  if (!page) throw new Error("no page tab");
  const c = await wsConnect(page.webSocketDebuggerUrl);
  await c.send("Page.enable");
  await c.send("Page.navigate", { url: NAVIGATE_TO });
  await new Promise((r) => setTimeout(r, 3500));
  const shot = await c.send("Page.captureScreenshot", { format: "png" });
  c.close();
  if (!shot || !shot.data) throw new Error("no data");
  fs.mkdirSync("artifacts", { recursive: true });
  fs.writeFileSync(OUT, Buffer.from(shot.data, "base64"));
  console.log("SAVED", OUT, Buffer.from(shot.data, "base64").length, "bytes");
}
main().then(() => process.exit(0)).catch((e) => { console.error("ERR", e.message); process.exit(1); });
