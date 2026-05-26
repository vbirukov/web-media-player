import { useCallback, useRef } from "react";
import { trackKind } from "../lib/mediaKind";
import type { Track } from "../types/catalog";
import { Icon } from "./icons/Icon";

type Props = {
  track: Track | null;
  content: string;
  loading: boolean;
  onClose: () => void;
  onScrollProgress: (pct: number) => void;
};

function isHtmlTrack(track: Track): boolean {
  const lower = track.fileName.toLowerCase();
  return lower.endsWith(".html") || lower.endsWith(".htm");
}

export function TextViewer({
  track,
  content,
  loading,
  onClose,
  onScrollProgress,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const max = el.scrollHeight - el.clientHeight;
    const pct = max > 0 ? (el.scrollTop / max) * 100 : 100;
    onScrollProgress(pct);
  }, [onScrollProgress]);

  if (!track || trackKind(track) !== "text") return null;

  const html = isHtmlTrack(track);

  return (
    <div className="text-viewer" role="dialog" aria-modal="true" aria-label={track.title}>
      <header className="text-viewer__header">
        <div>
          <span className="pill pill--kind">Текст</span>
          <h2 className="text-viewer__title">{track.title}</h2>
          <p className="text-viewer__folder">{track.folder}</p>
        </div>
        <button
          type="button"
          className="ghost round"
          onClick={onClose}
          aria-label="Закрыть"
        >
          <Icon name="close" size={22} />
        </button>
      </header>
      <div
        ref={scrollRef}
        className="text-viewer__body"
        onScroll={handleScroll}
      >
        {loading ? (
          <p className="text-viewer__loading">Загрузка…</p>
        ) : html ? (
          <iframe
            className="text-viewer__iframe"
            title={track.title}
            sandbox="allow-same-origin"
            srcDoc={content}
          />
        ) : (
          <pre className="text-viewer__pre">{content}</pre>
        )}
      </div>
    </div>
  );
}
