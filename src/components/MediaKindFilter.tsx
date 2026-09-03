import {
  catalogKindCounts,
} from "../lib/catalogSections";
import {
  mediaKindLabel,
  type MediaKindFilter,
} from "../lib/mediaKind";
import type { Catalog } from "../types/catalog";

type Props = {
  catalog: Catalog;
  value: MediaKindFilter;
  onChange: (value: MediaKindFilter) => void;
};

/** Сколько разных типов контента есть в каталоге (audio/video/text). */
export function mediaKindVariety(catalog: Catalog): number {
  const counts = catalogKindCounts(catalog);
  return (["audio", "video", "text"] as const).filter((k) => counts[k] > 0).length;
}

export function MediaKindFilter({ catalog, value, onChange }: Props) {
  const counts = catalogKindCounts(catalog);
  const total = catalog.tracks.length;
  const variety = (["audio", "video", "text"] as const).filter(
    (k) => counts[k] > 0,
  ).length;

  if (variety < 2) return null;

  const items: { id: MediaKindFilter; label: string; count: number }[] = [
    { id: "all", label: "Все", count: total },
    { id: "audio", label: mediaKindLabel.audio, count: counts.audio },
    { id: "video", label: mediaKindLabel.video, count: counts.video },
    { id: "text", label: mediaKindLabel.text, count: counts.text },
  ];

  return (
    <div className="media-kind-filter" role="group" aria-label="Тип контента">
      {items.map((item) =>
        item.count === 0 && item.id !== "all" ? null : (
          <button
            key={item.id}
            type="button"
            className={
              value === item.id
                ? "media-kind-filter__btn is-active"
                : "media-kind-filter__btn"
            }
            onClick={() => onChange(item.id)}
          >
            <span className="media-kind-filter__label">{item.label}</span>
            <span className="media-kind-filter__count nav-sublabel">{item.count}</span>
          </button>
        ),
      )}
    </div>
  );
}
