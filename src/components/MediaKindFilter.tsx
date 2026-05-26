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

export function MediaKindFilter({ catalog, value, onChange }: Props) {
  const counts = catalogKindCounts(catalog);
  const total = catalog.tracks.length;

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
            {item.label}
            <span className="nav-sublabel">{item.count}</span>
          </button>
        ),
      )}
    </div>
  );
}
