import type { ReactNode } from "react";
import type { CatalogSectionNav } from "../lib/catalogSections";
import type { FolderFeedEntry } from "../lib/feedNavigation";
import type { FeedScope } from "../types/navigation";
import { FolderCard } from "./FolderCard";

type Props = {
  mode: "sections" | "folders";
  sectionEntries?: CatalogSectionNav[];
  folderEntries?: FolderFeedEntry[];
  onOpenSection: (sectionId: string) => void;
  onOpenFolder: (scope: Extract<FeedScope, { level: "folder" }>) => void;
  onShareFolder?: (sectionId: string, folder: string) => void;
  renderFolderOffline?: (folder: string) => ReactNode;
};

export function CatalogHierarchyFeed({
  mode,
  sectionEntries = [],
  folderEntries = [],
  onOpenSection,
  onOpenFolder,
  onShareFolder,
  renderFolderOffline,
}: Props) {
  if (mode === "folders") {
    return (
      <div className="cards cards--folders" role="list">
        {folderEntries.map((entry) => (
          <FolderCard
            key={`${entry.sectionId}:${entry.name}`}
            folder={entry}
            onOpen={() =>
              onOpenFolder({
                level: "folder",
                sectionId: entry.sectionId,
                folder: entry.name,
                folderPath: entry.folderPath,
              })
            }
            onShare={
              onShareFolder
                ? () => onShareFolder(entry.sectionId, entry.name)
                : undefined
            }
            offlineActions={renderFolderOffline?.(entry.name)}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="catalog-sections-feed">
      {sectionEntries.map((section) => (
        <section
          key={section.id}
          className="catalog-section-block"
          aria-labelledby={`section-${section.id}`}
        >
          <header className="catalog-section-block__head">
            <h2 id={`section-${section.id}`} className="catalog-section-block__title">
              {section.title}
            </h2>
            <span className="catalog-section-block__count mini-text">
              {section.trackCount} материалов · {section.folders.length} папок
            </span>
            <button
              type="button"
              className="ghost catalog-section-block__open"
              onClick={() => onOpenSection(section.id)}
            >
              Открыть
            </button>
          </header>
          <div className="cards cards--folders cards--nested" role="list">
            {section.folders.map((folder) => (
              <FolderCard
                key={`${section.id}:${folder.name}`}
                folder={folder}
                onOpen={() =>
                  onOpenFolder({
                    level: "folder",
                    sectionId: section.id,
                    folder: folder.name,
                  })
                }
                onShare={
                  onShareFolder
                    ? () => onShareFolder(section.id, folder.name)
                    : undefined
                }
                offlineActions={renderFolderOffline?.(folder.name)}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
