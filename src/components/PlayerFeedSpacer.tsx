import { useLayoutEffect, useState } from "react";

const BAR_SELECTORS = [
  ".video-player-bar",
  ".player-bar",
  ".player-bar-restore",
] as const;

function measureBottomInset(): number {
  let inset = 0;
  for (const selector of BAR_SELECTORS) {
    for (const el of document.querySelectorAll<HTMLElement>(selector)) {
      const rect = el.getBoundingClientRect();
      if (rect.height < 1) continue;
      const fromBottom = window.innerHeight - rect.top;
      if (fromBottom > 0) inset = Math.max(inset, fromBottom);
    }
  }
  return Math.ceil(inset);
}

type Props = {
  active: boolean;
};

export function PlayerFeedSpacer({ active }: Props) {
  const [height, setHeight] = useState(0);

  useLayoutEffect(() => {
    if (!active) {
      setHeight(0);
      return;
    }

    const measure = () => {
      setHeight((prev) => {
        const next = measureBottomInset();
        return prev === next ? prev : next;
      });
    };

    measure();

    const observed = new Set<Element>();
    const ro = new ResizeObserver(measure);

    const observeBars = () => {
      for (const selector of BAR_SELECTORS) {
        for (const el of document.querySelectorAll(selector)) {
          if (observed.has(el)) continue;
          observed.add(el);
          ro.observe(el);
        }
      }
    };

    observeBars();

    const mo = new MutationObserver(() => {
      observeBars();
      measure();
    });
    mo.observe(document.body, { childList: true, subtree: true });

    const htmlMo = new MutationObserver(measure);
    htmlMo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    window.addEventListener("resize", measure);
    window.visualViewport?.addEventListener("resize", measure);

    return () => {
      ro.disconnect();
      mo.disconnect();
      htmlMo.disconnect();
      window.removeEventListener("resize", measure);
      window.visualViewport?.removeEventListener("resize", measure);
    };
  }, [active]);

  if (!active || height <= 0) return null;

  return (
    <div
      className="library-feed-player-spacer"
      style={{ height }}
      aria-hidden
    />
  );
}
