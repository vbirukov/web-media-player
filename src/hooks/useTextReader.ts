import {
  useCallback,
  useEffect,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { resolveTrackMediaUrl } from "../lib/resolveMediaUrl";
import { trackKind } from "../lib/mediaKind";
import type { Track } from "../types/catalog";
import type { UserState } from "../types/user";

type ToastPush = (message: string) => void;

type Options = {
  patchTrackUrl: (trackId: string, url: string) => void;
  user: UserState;
  setUser: Dispatch<SetStateAction<UserState>>;
  pushToast: ToastPush;
};

export function useTextReader({
  patchTrackUrl,
  setUser,
  pushToast,
}: Options) {
  const [track, setTrack] = useState<Track | null>(null);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [scrollPct, setScrollPct] = useState(0);

  const close = useCallback(() => {
    setTrack(null);
    setContent("");
    setScrollPct(0);
  }, []);

  const open = useCallback(
    async (item: Track) => {
      if (trackKind(item) !== "text") return;
      setTrack(item);
      setLoading(true);
      setContent("");
      try {
        const url = await resolveTrackMediaUrl(item, patchTrackUrl);
        const res = await fetch(url);
        if (!res.ok) throw new Error(String(res.status));
        const text = await res.text();
        setContent(text);
        setUser((prev) => ({
          ...prev,
          lastTrackId: item.id,
          progress: {
            ...prev.progress,
            [item.id]: {
              position: prev.progress[item.id]?.position ?? 0,
              duration: 100,
              completed: prev.progress[item.id]?.completed ?? false,
              updatedAt: new Date().toISOString(),
            },
          },
        }));
      } catch (e) {
        pushToast(e instanceof Error ? e.message : "Не удалось открыть текст");
        close();
      } finally {
        setLoading(false);
      }
    },
    [close, patchTrackUrl, pushToast, setUser],
  );

  const reportScroll = useCallback(
    (pct: number) => {
      if (!track) return;
      setScrollPct(pct);
      setUser((prev) => ({
        ...prev,
        progress: {
          ...prev.progress,
          [track.id]: {
            position: Math.round(pct),
            duration: 100,
            completed: pct >= 92,
            updatedAt: new Date().toISOString(),
          },
        },
      }));
    },
    [setUser, track],
  );

  useEffect(() => {
    if (!track) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [close, track]);

  return {
    track,
    content,
    loading,
    scrollPct,
    open,
    close,
    reportScroll,
  };
}
