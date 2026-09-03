import { useMemo, useState, type ReactNode } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, ChevronDown, ChevronUp, ListPlus, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import type { AppSkin } from "../themes"
import { resolveBranding } from "../lib/branding"
import { getPlayerConfig } from "../playerConfig"
import { Icon } from "./ui/icon"
import { MediaKindFilter as MediaKindFilterBar } from "./MediaKindFilter"
import { ThemeSwitcher } from "./ThemeSwitcher"
import {
  buildCatalogSections,
  type CatalogSectionNav,
} from "../lib/catalogSections"
import { isHierarchicalNavigation } from "../lib/feedNavigation"
import type { MediaKindFilter as MediaKindFilterValue } from "../lib/mediaKind"
import type { Catalog } from "../types/catalog"
import type { FeedScope } from "../types/navigation"
import type { LibraryView, UserState } from "../types/user"

function SidebarBrandBlock({
  onClose,
  skin,
  onSkinChange,
}: {
  onClose: () => void
  skin: AppSkin
  onSkinChange: (skin: AppSkin) => void
}) {
  const { sidebar } = getPlayerConfig()
  const brand = sidebar?.brand
  const themes = sidebar?.themes

  const showBrand = brand?.show !== false
  const showThemes = themes?.show !== false

  const title = brand?.title ?? resolveBranding().appTitle
  const logoSrc = brand?.logoSrc !== undefined ? brand.logoSrc : undefined
  const logoAlt = brand?.logoAlt ?? ""

  const showLogo = logoSrc !== null
  const src = logoSrc ?? "/brand/logo.webp"

  return (
    <>
      {showThemes ? (
        <div className="mb-4">
          {themes?.label ? (
            <span className="text-sm font-medium text-muted-foreground mb-2 block">
              {themes.label}
            </span>
          ) : null}
          <ThemeSwitcher skin={skin} onSkinChange={onSkinChange} compact />
        </div>
      ) : null}
      {showBrand ? (
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {showLogo ? (
              <img
                src={src}
                alt={logoAlt}
                className="w-11 h-11 rounded-lg"
                width={44}
                height={44}
              />
            ) : null}
            {title ? <h1 className="text-xl font-bold">{title}</h1> : null}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Закрыть меню"
            className="h-8 w-8"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      ) : (
        <div className="flex justify-end mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Закрыть меню"
            className="h-8 w-8"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      )}
    </>
  )
}

type Props = {
  skin: AppSkin
  onSkinChange: (skin: AppSkin) => void
  navOpen: boolean
  onClose: () => void
  catalog: Catalog
  user: UserState
  view: LibraryView
  mediaKindFilter: MediaKindFilterValue
  onMediaKindFilterChange: (filter: MediaKindFilterValue) => void
  feedFolderFilter: string[]
  feedScope: FeedScope
  focusedFolder: string | null
  focusedSection: string | null
  selectedPlaylist: string | null
  resumeCount: number
  onSelectView: (view: LibraryView) => void
  onNavigateCatalog: () => void
  onNavigateSection: (sectionId: string) => void
  onNavigateFolder: (sectionId: string, folder: string) => void
  onScrollToFolder: (folder: string, section?: string) => void
  onFocusSection: (section: string | null) => void
  onAddFolderToSelection: (folder: string, sectionId?: string) => void
  onSelectPlaylist: (playlistId: string) => void
  onOpenPlaylistModal: () => void
  onDeletePlaylist: (playlistId: string) => void
  onShareFolder: (folder: string) => void
  renderFolderOffline?: (folder: string) => ReactNode
  offlineSummary?: ReactNode
}

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
  section: CatalogSectionNav
  expanded: boolean
  onToggle: () => void
  focusedSection: string | null
  focusedFolder: string | null
  feedScope: FeedScope
  selectionActive: boolean
  selectionSet: Set<string>
  hierarchicalNav: boolean
  onNavigateSection: (sectionId: string) => void
  onNavigateFolder: (sectionId: string, folder: string) => void
  onScrollToFolder: (folder: string, section?: string) => void
  onFocusSection: (section: string | null) => void
  onAddFolderToSelection: (folder: string, sectionId?: string) => void
  onShareFolder: (folder: string) => void
  renderFolderOffline?: (folder: string) => ReactNode
}) {
  const isSectionFocused = focusedSection === section.id

  return (
    <div
      className={cn(
        "mb-4",
        isSectionFocused && "bg-accent/50 rounded-lg p-2 -mx-2"
      )}
    >
      <Button
        variant="ghost"
        className="w-full justify-between font-medium"
        onClick={() => {
          if (hierarchicalNav) {
            onNavigateSection(section.id)
            return
          }
          onToggle()
          onFocusSection(section.id)
        }}
        aria-expanded={expanded}
      >
        <span className="flex items-center gap-2">
          {expanded ? (
            <ChevronDown className="h-3.5 w-3.5" />
          ) : (
            <ChevronUp className="h-3.5 w-3.5" />
          )}
          <span>{section.title}</span>
        </span>
        <span className="text-xs text-muted-foreground">{section.trackCount}</span>
      </Button>
      
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-2 space-y-1 pl-4">
              {section.folders.map((folder) => {
                const inSelection = selectionSet.has(folder.name)
                const isActive = focusedFolder === folder.name || inSelection
                const kindHint = [
                  folder.kinds.audio ? `${folder.kinds.audio} ауд.` : "",
                  folder.kinds.video ? `${folder.kinds.video} вид.` : "",
                  folder.kinds.text ? `${folder.kinds.text} тек.` : "",
                ]
                  .filter(Boolean)
                  .join(" · ")

                return (
                  <div
                    key={`${section.id}:${folder.name}`}
                    className={cn(
                      "rounded-md p-2",
                      isActive && "bg-accent"
                    )}
                  >
                    <Button
                      variant="ghost"
                      className="w-full justify-between text-sm h-auto py-1.5"
                      onClick={() => {
                        if (hierarchicalNav) {
                          const atFolder =
                            feedScope.level === "folder" &&
                            feedScope.sectionId === section.id &&
                            feedScope.folder === folder.name
                          if (atFolder) {
                            onScrollToFolder(folder.name, section.id)
                          } else {
                            onNavigateFolder(section.id, folder.name)
                          }
                          return
                        }
                        onScrollToFolder(folder.name, section.id)
                      }}
                    >
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{folder.label || folder.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {kindHint || `${folder.trackCount} материалов`}
                          {inSelection ? " · в выборке" : ""}
                        </span>
                      </div>
                    </Button>
                    
                    {selectionActive && !inSelection ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full mt-1 text-xs gap-1.5"
                        onClick={() => onAddFolderToSelection(folder.name, section.id)}
                      >
                        <ListPlus className="h-3.5 w-3.5" />
                        <span>В выборку</span>
                      </Button>
                    ) : null}
                    
                    {!selectionActive ? renderFolderOffline?.(folder.name) : null}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full mt-1 text-xs gap-1.5"
                      onClick={() => onShareFolder(folder.name)}
                      aria-label={`Поделиться «${folder.label || folder.name}»`}
                    >
                      <Share2 className="h-3.5 w-3.5" />
                      <span>Поделиться</span>
                    </Button>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
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
  const hierarchicalNav = isHierarchicalNavigation()
  const likeCount = Object.keys(user.likes).length
  const extraViews = [
    resumeCount > 0 ? (["resume", `Продолжить · ${resumeCount}`] as const) : null,
    likeCount > 0 ? (["liked", `Лайки · ${likeCount}`] as const) : null,
  ].filter((item): item is readonly ["resume" | "liked", string] => item != null)

  const selectionActive = feedFolderFilter.length > 0
  const selectionSet = useMemo(
    () => new Set(feedFolderFilter),
    [feedFolderFilter]
  )

  const sections = useMemo(
    () => buildCatalogSections(catalog, mediaKindFilter),
    [catalog, mediaKindFilter]
  )

  const [expandedSections, setExpandedSections] = useState<Set<string>>(() => new Set())

  const isExpanded = (id: string) =>
    expandedSections.has(id) || focusedSection === id || sections.length <= 2

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <AnimatePresence>
      {navOpen && (
        <>
          {/* Backdrop with fade */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={onClose}
          />

          {/* Sidebar with slide */}
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed left-0 top-0 bottom-0 w-80 bg-background z-50 shadow-xl overflow-y-auto lg:relative lg:translate-x-0 lg:shadow-none lg:border-r"
          >
            <div className="p-4">
              <SidebarBrandBlock onClose={onClose} skin={skin} onSkinChange={onSkinChange} />

              {/* Sections */}
              <section className="mb-6">
                <h2 className="text-sm font-semibold text-muted-foreground mb-2">Разделы</h2>
                <Button
                  variant={view === "all" ? "secondary" : "ghost"}
                  className="w-full justify-start mb-1"
                  onClick={() => {
                    onSelectView("all")
                    if (hierarchicalNav) onNavigateCatalog()
                  }}
                >
                  Весь каталог{" "}
                  <span className="ml-auto text-xs text-muted-foreground">
                    ({catalog.tracks.length})
                  </span>
                </Button>
                {extraViews.map(([id, label]) => (
                  <Button
                    key={id}
                    variant={view === id ? "secondary" : "ghost"}
                    className="w-full justify-start mb-1"
                    onClick={() => onSelectView(id)}
                  >
                    {label}
                  </Button>
                ))}
              </section>

              {/* Media Kind Filter */}
              <section className="mb-6">
                <h2 className="text-sm font-semibold text-muted-foreground mb-2">Тип контента</h2>
                <MediaKindFilterBar
                  catalog={catalog}
                  value={mediaKindFilter}
                  onChange={onMediaKindFilterChange}
                />
              </section>

              {/* Offline Summary */}
              {offlineSummary ? (
                <section className="mb-6">
                  <h2 className="text-sm font-semibold text-muted-foreground mb-2">Офлайн</h2>
                  {offlineSummary}
                </section>
              ) : null}

              {/* Library Sections */}
              <section className="mb-6">
                <h2 className="text-sm font-semibold text-muted-foreground mb-2">Библиотека</h2>
                <div className="space-y-2">
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

              {/* Playlists */}
              <section>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-sm font-semibold text-muted-foreground">Плейлисты</h2>
                  <Button variant="ghost" size="sm" onClick={onOpenPlaylistModal}>
                    ＋
                  </Button>
                </div>
                <div className="space-y-1">
                  {user.playlists.filter((p) => !p.system).length === 0 ? (
                    <div className="text-sm text-muted-foreground">
                      Пока нет пользовательских плейлистов
                    </div>
                  ) : null}
                  {user.playlists
                    .filter((p) => !p.system)
                    .map((pl) => (
                      <div key={pl.id} className="flex items-center gap-2">
                        <Button
                          variant={selectedPlaylist === pl.id ? "secondary" : "ghost"}
                          className="flex-1 justify-start text-sm"
                          onClick={() => onSelectPlaylist(pl.id)}
                        >
                          {pl.name}{" "}
                          <span className="ml-auto text-xs text-muted-foreground">
                            {pl.trackIds.length}
                          </span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={(e) => {
                            e.stopPropagation()
                            onDeletePlaylist(pl.id)
                          }}
                          aria-label={`Удалить плейлист «${pl.name}»`}
                          title="Удалить плейлист"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                </div>
              </section>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
