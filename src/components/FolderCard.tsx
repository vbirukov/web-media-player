import type { ReactNode } from "react";
import type { SectionFolder } from "../lib/catalogSections";
import { mediaKindIcon, mediaKindLabel } from "../lib/mediaKind";
import type { MediaKind } from "../types/catalog";
import { Icon } from "./icons/Icon";

type Props = {
  folder: SectionFolder;
  onOpen: () => void;
  onShare?: () => void;
  offlineActions?: ReactNode;
};

const KIND_ORDER: MediaKind[] = ["audio", "video", "text"];

function kindSummary(kinds: SectionFolder["kinds"]) {
  return KIND_ORDER.filter((kind) => kinds[kind] > 0)
    .map((kind) => `${kinds[kind]} ${mediaKindLabel[kind]}`)
    .join(", ");
}

function KindCounts({ kinds }: { kinds: SectionFolder["kinds"] }) {
  const items = KIND_ORDER.filter((kind) => kinds[kind] > 0);
  if (!items.length) return null;

  return (
    <span className="folder-card__kinds">
      {items.map((kind) => (
        <span
          key={kind}
          className={`folder-card__kind folder-card__kind--${kind}`}
          title={`${kinds[kind]} ${mediaKindLabel[kind]}`}
        >
          <span>{kinds[kind]}</span>
          <Icon name={mediaKindIcon[kind]} size={12} aria-hidden />
        </span>
      ))}
    </span>
  );
}

export function FolderCard({
  folder,
  onOpen,
  onShare,
  offlineActions,
}: Props) {
  const displayName = folder.label || folder.name;
  const summary = kindSummary(folder.kinds);

  return (
    <article className="folder-card">
      <button
        type="button"
        className="folder-card__open"
        onClick={onOpen}
        aria-label={`${displayName}${summary ? `, ${summary}` : ""}`}
      >
        <span className="folder-card__glyph" aria-hidden>
          <Icon name="folder" size={22} />
        </span>
        <h3 className="folder-card__title">{displayName}</h3>
        <p className="folder-card__meta mini-text">
          <KindCounts kinds={folder.kinds} />
        </p>
      </button>
      {(onShare || offlineActions) && (
        <div className="folder-card__actions card-social">
          {offlineActions}
          {onShare ? (
            <button
              type="button"
              className="ghost round folder-card__share"
              onClick={onShare}
              aria-label={`Поделиться «${displayName}»`}
              title={`Поделиться «${displayName}»`}
            >
              <Icon name="share" size={20} aria-hidden />
            </button>
          ) : null}
        </div>
      )}
    </article>
  );
}
