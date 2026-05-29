import { useMemo, useState, type ReactNode } from "react";
import type { AppSkin } from "../themes";
import { resolveBranding } from "../lib/branding";
import { getPlayerConfig } from "../playerConfig";
import { Icon } from "./icons/Icon";
import { IconButtonIcon } from "./IconButton";
import { MediaKindFilter as MediaKindFilterBar } from "./MediaKindFilter";
import { ThemeSwitcher } from "./ThemeSwitcher";
import {
  buildCatalogSections,
  type CatalogSectionNav,
} from "../lib/catalogSections";
import { isHierarchicalNavigation } from "../lib/feedNavigation";
import type { MediaKindFilter as MediaKindFilterValue } from "../lib/mediaKind";
import type { Catalog } from "../types/catalog";
import type { FeedScope } from "../types/navigation";
import type { LibraryView, UserState } from "../types/user";

function SidebarBrandBlock({
  onClose,
  skin,
  onSkinChange,
}: {
  onClose: () => void;
  skin: AppSkin;
  onSkinChange: (skin: AppSkin) => void;
}) {
  const { sidebar } = getPlayerConfig();
  const brand = sidebar?.brand;
  const themes = sidebar?.themes;

  const showBrand = brand?.show !== false;
  const showThemes = themes?.show !== false;

  const title = brand?.title ?? resolveBranding().appTitle;
  const logoSrc = brand?.logoSrc !== undefined ? brand.logoSrc : undefined;
  const logoAlt = brand?.logoAlt ?? "";

  const showLogo = logoSrc !== null;
  const src = logoSrc ?? "/brand/logo.webp";

  return (
    <>
      {showThemes ? (
        <div className="sidebar-theme">
          {themes?.label ? (
            <span className="sidebar-theme__label">{themes.label}</span>
          ) : null}
          <ThemeSwitcher skin={skin} onSkinChange={onSkinChange} compact />
        </div>
      ) : null}
      {showBrand ? (
        <div className="brand">
          {showLogo ? (
            <img
              src={src}
              alt={logoAlt}
              className="brand-logo logo-box"
              width={44}
              height={44}
            />
          ) : null}
          {title ? <h1>{title}</h1> : null}
          <IconButtonIcon
            className="sidebar-close"
            icon="close"
            iconSize={22}
            onClick={onClose}
            aria-label="Закрыть меню"
          />
        </div>
      ) : (
        <div className="brand brand--minimal">
          <IconButtonIcon
            className="sidebar-close"
            icon="close"
            iconSize={22}
            onClick={onClose}
            aria-label="Закрыть меню"
          />
        </div>
      )}
    </>
  );
}

type Props = {
  skin: AppSkin;
  onSkinChange: (skin: AppSkin) => void;
  navOpen: boolean;
  onClose: () => void;
  catalog: Catalog;
  user: UserState;
  view: LibraryView;
  mediaKindFilter: MediaKindFilterValue;
  onMediaKindFilterChange: (filter: MediaKindFilterValue) => void;
  feedFolderFilter: string[];
  feedScope: FeedScope;
  focusedFolder: string | null;
  focusedSection: string | null;
  selectedPlaylist: string | null;
  resumeCount: number;
  onSelectView: (view: LibraryView) => void;
  onNavigateCatalog: () => void;
  onNavigateSection: (sectionId: string) => void;
  onNavigateFolder: (sectionId: string, folder: string) => void;
  onScrollToFolder: (folder: string, section?: string) => void;
  onFocusSection: (section: string | null) => void;
  onAddFolderToSelection: (folder: string, sectionId?: string) => void;
  onSelectPlaylist: (playlistId: string) => void;
  onOpenPlaylistModal: () => void;
  onDeletePlaylist: (playlistId: string) => void;
  onShareFolder: (folder: string) => void;
  renderFolderOffline?: (folder: string) => ReactNode;
  offlineSummary?: ReactNode;
};

function SectionBlock({
  section,
  expanded,
  onToggle,
  focusedSection,
  focusedFolder,
  feedScope,
  selectionActive,
  selectionSet,
  hierarchicalNav,
  onNavigateSection,
  onNavigateFolder,
  onScrollToFolder,
  onFocusSection,
  onAddFolderToSelection,
  onShareFolder,
  renderFolderOffline,
}: {
  section: CatalogSectionNav;
  expanded: boolean;
  onToggle: () => void;
  focusedSection: string | null;
  focusedFolder: string | null;
  feedScope: FeedScope;
  selectionActive: boolean;
  selectionSet: Set<string>;
  hierarchicalNav: boolean;
  onNavigateSection: (sectionId: string) => void;
  onNavigateFolder: (sectionId: string, folder: string) => void;
  onScrollToFolder: (folder: string, section?: string) => void;
  onFocusSection: (section: string | null) => void;
  onAddFolderToSelection: (folder: string, sectionId?: string) => void;
  onShareFolder: (folder: string) => void;
  renderFolderOffline?: (folder: string) => ReactNode;
}) {
  const isSectionFocused = focusedSection === section.id;

  return (
    <div
      className={
        isSectionFocused
          ? "nav-section-block is-section-active"
          : "nav-section-block"
      }
    >
      <button
        type="button"
        className="nav-section-block__head"
        onClick={() => {
          if (hierarchicalNav) {
            onNavigateSection(section.id);
            return;
          }
          onToggle();
          onFocusSection(section.id);
        }}
        aria-expanded={expanded}
      >
        <Icon
          name={expanded ? "chevron-down" : "chevron-up"}
          size={14}
          aria-hidden
        />
        <span className="nav-item__label">{section.title}</span>
        <span className="nav-sublabel">{section.trackCount}</span>
      </button>
      {expanded ? (
        <div className="nav-section-block__folders">
          {section.folders.map((folder) => {
            const inSelection = selectionSet.has(folder.name);
            const isActive = focusedFolder === folder.name || inSelection;
            const kindHint = [
              folder.kinds.audio ? `${folder.kinds.audio} ауд.` : "",
              folder.kinds.video ? `${folder.kinds.video} вид.` : "",
              folder.kinds.text ? `${folder.kinds.text} тек.` : "",
            ]
              .filter(Boolean)
              .join(" · ");

            return (
              <div
                key={`${section.id}:${folder.name}`}
                className={
                  isActive
                    ? "nav-item nav-item--folder is-active"
                    : "nav-item nav-item--folder"
                }
              >
                <button
                  type="button"
                  className="nav-folder-card__open"
                  onClick={() => {
                    if (hierarchicalNav) {
                      const atFolder =
                        feedScope.level === "folder" &&
                        feedScope.sectionId === section.id &&
                        feedScope.folder === folder.name;
                      if (atFolder) {
                        onScrollToFolder(folder.name, section.id);
                      } else {
                        onNavigateFolder(section.id, folder.name);
                      }
                      return;
                    }
                    onScrollToFolder(folder.name, section.id);
                  }}
                >
                  <span className="nav-item__label">{folder.name}</span>
                  <span className="nav-sublabel">
                    {kindHint || `${folder.trackCount} материалов`}
                    {inSelection ? " · в выборке" : ""}
                  </span>
                </button>
                {selectionActive && !inSelection ? (
                  <button
                    type="button"
                    className="nav-item__share nav-item__share--stacked nav-item__add-selection"
                    onClick={() => onAddFolderToSelection(folder.name, section.id)}
                  >
                    <Icon name="list-plus" size={15} aria-hidden />
                    <span>В выборку</span>
                  </button>
                ) : null}
                {!selectionActive ? renderFolderOffline?.(folder.name) : null}
                <button
                  type="button"
                  className="nav-item__share nav-item__share--stacked"
                  onClick={() => onShareFolder(folder.name)}
                  aria-label={`Поделиться «${folder.name}»`}
                >
                  <Icon name="share" size={15} aria-hidden />
                  <span>Поделиться</span>
                </button>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export function Sidebar({
  skin,
  onSkinChange,
  navOpen,
  onClose,
  catalog,
  user,
  view,
  mediaKindFilter,
  onMediaKindFilterChange,
  feedFolderFilter,
  feedScope,
  focusedFolder,
  focusedSection,
  selectedPlaylist,
  resumeCount,
  onSelectView,
  onNavigateCatalog,
  onNavigateSection,
  onNavigateFolder,
  onScrollToFolder,
  onFocusSection,
  onAddFolderToSelection,
  onSelectPlaylist,
  onOpenPlaylistModal,
  onDeletePlaylist,
  onShareFolder,
  renderFolderOffline,
  offlineSummary,
}: Props) {
  const hierarchicalNav = isHierarchicalNavigation();
  const likeCount = Object.keys(user.likes).length;
  const extraViews = [
    resumeCount > 0 ? (["resume", `Продолжить · ${resumeCount}`] as const) : null,
    likeCount > 0 ? (["liked", `Лайки · ${likeCount}`] as const) : null,
  ].filter((item): item is readonly ["resume" | "liked", string] => item != null);

  const selectionActive = feedFolderFilter.length > 0;
  const selectionSet = useMemo(
    () => new Set(feedFolderFilter),
    [feedFolderFilter],
  );

  const sections = useMemo(
    () => buildCatalogSections(catalog, mediaKindFilter),
    [catalog, mediaKindFilter],
  );

  const [expandedSections, setExpandedSections] = useState<Set<string>>(() => new Set());

  const isExpanded = (id: string) =>
    expandedSections.has(id) || focusedSection === id || sections.length <= 2;

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <>
      <button
        type="button"
        className={navOpen ? "nav-backdrop is-open" : "nav-backdrop"}
        aria-hidden={!navOpen}
        tabIndex={navOpen ? 0 : -1}
        onClick={onClose}
      />
      <aside className={navOpen ? "sidebar is-open" : "sidebar"}>
        <SidebarBrandBlock onClose={onClose} skin={skin} onSkinChange={onSkinChange} />
        <section className="side-section">
          <h2>Разделы</h2>
          <button
            type="button"
            className={view === "all" ? "nav active" : "nav"}
            onClick={() => {
              onSelectView("all");
              if (hierarchicalNav) onNavigateCatalog();
            }}
          >
            Весь каталог{" "}
            <span className="nav-sublabel">({catalog.tracks.length})</span>
          </button>
          {extraViews.map(([id, label]) => (
            <button
              key={id}
              className={view === id ? "nav active" : "nav"}
              onClick={() => onSelectView(id)}
            >
              {label}
            </button>
          ))}
        </section>
        <section className="side-section">
          <h2>Тип контента</h2>
          <MediaKindFilterBar
            catalog={catalog}
            value={mediaKindFilter}
            onChange={onMediaKindFilterChange}
          />
        </section>
        {offlineSummary ? (
          <section className="side-section">
            <h2>Офлайн</h2>
            {offlineSummary}
          </section>
        ) : null}
        <section className="side-section side-section--scroll">
          <h2>Библиотека</h2>
          <div className="side-list side-list--sections">
            {sections.map((section) => (
              <SectionBlock
                key={section.id}
                section={section}
                expanded={isExpanded(section.id)}
                onToggle={() => toggleSection(section.id)}
                focusedSection={focusedSection}
                focusedFolder={focusedFolder}
                feedScope={feedScope}
                selectionActive={selectionActive}
                selectionSet={selectionSet}
                hierarchicalNav={hierarchicalNav}
                onNavigateSection={onNavigateSection}
                onNavigateFolder={onNavigateFolder}
                onScrollToFolder={onScrollToFolder}
                onFocusSection={onFocusSection}
                onAddFolderToSelection={onAddFolderToSelection}
                onShareFolder={onShareFolder}
                renderFolderOffline={renderFolderOffline}
              />
            ))}
          </div>
        </section>
        <section className="side-section">
          <div className="side-head">
            <h2>Плейлисты</h2>
            <button className="ghost round" onClick={onOpenPlaylistModal}>
              ＋
            </button>
          </div>
          <div className="side-list">
            {user.playlists.filter((p) => !p.system).length === 0 ? (
              <div className="mini-text">Пока нет пользовательских плейлистов</div>
            ) : null}
            {user.playlists
              .filter((p) => !p.system)
              .map((pl) => (
                <div key={pl.id} className="nav-item nav-item--playlist">
                  <button
                    type="button"
                    className={selectedPlaylist === pl.id ? "nav active" : "nav"}
                    onClick={() => onSelectPlaylist(pl.id)}
                  >
                    {pl.name} <span>{pl.trackIds.length}</span>
                  </button>
                  <button
                    type="button"
                    className="nav-item__delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeletePlaylist(pl.id);
                    }}
                    aria-label={`Удалить плейлист «${pl.name}»`}
                    title="Удалить плейлист"
                  >
                    <Icon name="close" size={12} />
                  </button>
                </div>
              ))}
          </div>
        </section>
      </aside>
    </>
  );
}
