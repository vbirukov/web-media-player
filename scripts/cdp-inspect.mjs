/*
 * Minimal pure-Node CDP (Chrome DevTools Protocol) inspector.
 * No dependencies. Connects to a debug Chrome, navigates to the app,
 * captures the folder-card tile markup + computed styles + a screenshot.
 *
 * Usage:
 *   node scripts/cdp-inspect.mjs [target-url]
 *
 * Requires a Chrome running with --remote-debugging-port=<port>
 * (default video 9223). The page target URL comes from /json.
 */

const PORT = Number(process.env.CDP_PORT || process.argv[3] || 9223);
const TARGET_URL = process.argv[2] || null;

// ---- tiny WebSocket client (RFC6455) built on net + crypto ----
import net from "node:net";
import crypto from "node:crypto";

function makeFrame(payload) {
  const buf = Buffer.from(payload, "utf8");
  const len = buf.length;
  let header;
  if (len < 126) header = Buffer.from([0x81, 0x80 | len]);
  else if (len < 65536) {
    header = Buffer.alloc(4);
    header[0] = 0x81;
    header[1] = 0x80 | 126;
    header.writeUInt16BE(len, 2);
  } else {
    header = Buffer.alloc(10);
    header[0] = 0x81;
    header[1] = 0x80 | 127;
    header.writeBigUInt64BE(BigInt(len), 2);
  }
  const mask = crypto.randomBytes(4);
  const masked = Buffer.from(buf);
  for (let i = 0; i < masked.length; i++) masked[i] ^= mask[i % 4];
  return Buffer.concat([header, mask, masked]);
}

function parseFrames(chunks) {
  // accumulate into a single buffer and pull complete messages
  const messages = [];
  let buf = chunks.length === 1 ? chunks[0] : Buffer.concat(chunks);
  while (buf.length >= 2) {
    const b0 = buf[0];
    const b1 = buf[1];
    const fin = (b0 & 0x80) !== 0;
    const opcode = b0 & 0x0f;
    const masked = (b1 & 0x80) !== 0;
    let len = b1 & 0x7f;
    let off = 2;
    if (len === 126) {
      if (buf.length < 4) break;
      len = buf.readUInt16BE(2);
      off = 4;
    } else if (len === 127) {
      if (buf.length < 10) break;
      len = Number(buf.readBigUInt64BE(2));
      off = 10;
    }
    if (masked) off += 4;
    if (buf.length < off + len) break;
    const payload = buf.slice(off, off + len);
    buf = buf.slice(off + len);
    if (opcode === 0x8) return { close: true, messages };
    if (opcode !== 0x1 && opcode !== 0x2) continue; // ignore ping/pong/continuation splitting
    messages.push({ fin, opcode, payload: payload.toString("utf8") });
  }
  return { close: false, messages, rest: buf };
}

class CdpClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.nextId = 1;
    this.pending = new Map();
    this.events = new Map();
    this.received = [];
  }
  connect() {
    return new Promise((resolve, reject) => {
      const u = new URL(this.wsUrl);
      const path = u.pathname + u.search;
      const key = crypto.randomBytes(16).toString("base64");
      const sock = net.connect(Number(u.port || 80), u.hostname);
      this.sock = sock;
      sock.setNoDelay(true);
      let handshakeDone = false;
      let chunks = [];
      sock.on("connect", () => {
        sock.write(
          `GET ${path} HTTP/1.1\r\n` +
            `Host: ${u.hostname}:${u.port || 80}\r\n` +
            `Upgrade: websocket\r\n` +
            `Connection: Upgrade\r\n` +
            `Sec-WebSocket-Key: ${key}\r\n` +
            `Sec-WebSocket-Version: 13\r\n\r\n`
        );
      });
      sock.on("data", (d) => {
        chunks.push(d);
        if (!handshakeDone) {
          const all = Buffer.concat(chunks);
          const idx = all.indexOf("\r\n\r\n");
          if (idx === -1) return;
          const head = all.slice(0, idx).toString("latin1");
          chunks = [all.slice(idx + 4)];
          handshakeDone = true;
          if (!/101/.test(head.split("\r\n")[0])) {
            reject(new Error("WebSocket upgrade failed: " + head));
            return;
          }
          resolve();
        }
      });
      sock.on("error", (e) => {
        if (!handshakeDone) reject(e);
      });
      sock.on("data", (d) => {
        if (!handshakeDone) return;
        this._acc = (this._acc || Buffer.alloc(0));
        this._acc = Buffer.concat([this._acc, d]);
        while (true) {
          const { close, messages, rest } = parseFrames([this._acc]);
          this._acc = rest || Buffer.alloc(0);
          for (const m of messages || []) {
            const msg = JSON.parse(m.payload);
            if (msg.id && this.pending.has(msg.id)) {
              const { resolve, reject } = this.pending.get(msg.id);
              this.pending.delete(msg.id);
              if (msg.error) reject(new Error(JSON.stringify(msg.error)));
              else resolve(msg.result);
            } else if (msg.method) {
              const list = this.events.get(msg.method) || [];
              for (const cb of list) cb(msg.params);
            }
          }
          if (close) break;
          if (!this._acc || this._acc.length === 0) break;
        }
      });
    });
  }
  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.nextId++;
      this.pending.set(id, { resolve, reject });
      const frame = makeFrame(JSON.stringify({ id, method, params }));
      this.sock.write(frame);
      // safety timeout
      setTimeout(() => {
        if (this.pending.has(id)) {
          this.pending.delete(id);
          reject(new Error("timeout waiting for " + method));
        }
      }, 15000);
    });
  }
  on(method, cb) {
    if (!this.events.has(method)) this.events.set(method, []);
    this.events.get(method).push(cb);
  }
  once(method, timeoutMs = 20000) {
    return new Promise((resolve, reject) => {
      const t = setTimeout(() => reject(new Error("timeout waiting for " + method)), timeoutMs);
      const cb = (p) => {
        clearTimeout(t);
        this.events.delete(method);
        resolve(p);
      };
      if (!this.events.has(method)) this.events.set(method, []);
      this.events.get(method).push(cb);
    });
  }
  close() {
    try { this.sock.end(); } catch {}
  }
}

// ---- main ----
function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

async function main() {
  const list = await fetch(`http://127.0.0.1:${PORT}/json`).then((r) => r.json());
  const page = list.find((t) => t.type === "page");
  if (!page) throw new Error("no page target found; open the app in the debug Chrome");
  const ws = page.webSocketDebuggerUrl;
  const cdp = new CdpClient(ws);
  await cdp.connect();
  console.log("CDP connected to", ws);

  // enable domains
  await cdp.send("Page.enable");
  await cdp.send("Runtime.enable");
  try { await cdp.send("DOM.enable"); } catch {}

  const target = TARGET_URL || page.url;
  if (target && target !== page.url) {
    await cdp.send("Page.navigate", { url: target });
    await sleep(3000);
  } else {
    await sleep(800);
  }
  // hard reload to force vite to re-serve latest modules
  try {
    await cdp.send("Page.reload", { ignoreCache: true });
    await sleep(3000);
  } catch (e) {
    console.log("reload skipped:", e.message);
  }

  // Also reload current if it is the app root
  const evalJs = async (expression, awaitPromise = false) => {
    const r = await cdp.send("Runtime.evaluate", {
      expression,
      returnByValue: true,
      awaitPromise,
    });
    if (r.exceptionDetails) throw new Error("eval error: " + JSON.stringify(r.exceptionDetails));
    return r.result?.value;
  };

  const dump = await evalJs(`(() => {
    const card = document.querySelector('.folder-card');
    if (!card) return { found: false, bodySample: document.body.innerText.slice(0, 200) };
    const css = (el, prop) => getComputedStyle(el)[prop];
    const acts = card.querySelector('.folder-card__actions');
    const btns = acts ? Array.from(acts.querySelectorAll('button')) : [];
    const openRect = card.querySelector('.folder-card__open')?.getBoundingClientRect();
    const actsRect = acts?.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();    return {
      found: true,
      cardBox: { w: card.offsetWidth, h: card.offsetHeight },
      title: card.querySelector('.folder-card__title')?.textContent,
      meta: card.querySelector('.folder-card__meta')?.textContent,
      cardDisplay: css(card, 'display'),
      cardFlexDir: css(card, 'flexDirection'),
      cardAlign: css(card, 'alignItems'),
      cardPadding: css(card, 'padding'),
      openFlex: card.querySelector('.folder-card__open') ? css(card.querySelector('.folder-card__open'), 'flex') : null,
      actionsAlign: acts ? css(acts, 'justifyContent') : null,
      actionsMarginLeft: acts ? css(acts, 'marginLeft') : null,
      cardWidth: cardRect.left >= 0 ? Math.round(cardRect.width) : null,
      openRight: openRect ? Math.round(openRect.right - cardRect.left) : null,
      actsLeft: actsRect ? Math.round(actsRect.left - cardRect.left) : null,
      actsRight: actsRect ? Math.round(actsRect.right - cardRect.left) : null,
      actionButtons: btns.map((b) => ({
        cls: b.className,
        w: b.offsetWidth,
        h: b.offsetHeight,
        aria: b.getAttribute('aria-label'),
        text: b.innerText.trim(),
      })),
    };
  })()`);

  console.log("=== FOLDER TILE ===");
  console.log(JSON.stringify(dump, null, 2));

  // screenshot
  try {
    const shot = await Promise.race([
      cdp.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false }),
      sleep(8000).then(() => { throw new Error("screenshot timeout"); }),
    ]);
    const fs = await import("node:fs");
    fs.writeFileSync(new URL("../artifacts/cdp-tile.png", import.meta.url), Buffer.from(shot.data, "base64"));
    console.log("screenshot saved to artifacts/cdp-tile.png");
  } catch (e) {
    console.log("screenshot failed:", e.message);
  }
  cdp.close();
}

main().catch((e) => {
  console.error("CDP_INSPECT_ERROR:", e.message);
  process.exit(1);
});
