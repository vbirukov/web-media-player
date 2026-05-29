import type { ReactNode } from "react";
import type { SectionFolder } from "../lib/catalogSections";
import { Icon } from "./icons/Icon";

type Props = {
  folder: SectionFolder;
  onOpen: () => void;
  onShare?: () => void;
  offlineActions?: ReactNode;
};

function kindBadges(kinds: SectionFolder["kinds"]) {
  const parts: string[] = [];
  if (kinds.audio) parts.push(`${kinds.audio} ауд.`);
  if (kinds.video) parts.push(`${kinds.video} вид.`);
  if (kinds.text) parts.push(`${kinds.text} тек.`);
  return parts.join(" · ");
}

export function FolderCard({
  folder,
  onOpen,
  onShare,
  offlineActions,
}: Props) {
  const badges = kindBadges(folder.kinds);
  const countLabel = `${folder.trackCount} ${folder.trackCount === 1 ? "материал" : folder.trackCount < 5 ? "материала" : "материалов"}`;

  return (
    <article className="folder-card">
      <button
        type="button"
        className="folder-card__open"
        onClick={onOpen}
        aria-label={`${folder.name}, ${countLabel}${badges ? `, ${badges}` : ""}`}
      >
        <h3 className="folder-card__title">{folder.name}</h3>
        <p className="folder-card__meta mini-text">
          {countLabel}
          {badges ? ` · ${badges}` : ""}
        </p>
      </button>
      {(onShare || offlineActions) && (
        <div className="folder-card__actions">
          {offlineActions}
          {onShare ? (
            <button
              type="button"
              className="ghost folder-card__share"
              onClick={onShare}
              aria-label={`Поделиться «${folder.name}»`}
            >
              <Icon name="share" size={16} aria-hidden />
              <span>Поделиться</span>
            </button>
          ) : null}
        </div>
      )}
    </article>
  );
}
