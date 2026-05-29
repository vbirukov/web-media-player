import "./styles/layout.css";

export { PlayerApp } from "./PlayerApp";
export type {
  PlayerHeaderSlotProps,
  PlayerHeroSlotProps,
  PlayerFeedToolbarSlotProps,
} from "./types/slots";
export type {
  FeedScope,
  FolderRef,
  FeedMode,
  BreadcrumbItem,
} from "./types/navigation";
export {
  folderRefFromTrack,
  isHierarchicalNavigation,
  getCatalogNavigationConfig,
} from "./lib/feedNavigation";
export { usePlayerNavigation } from "./context/FeedNavigationContext";
export {
  setPlayerConfig,
  getPlayerConfig,
  storageKey,
  type PlayerConfig,
  type PlayerStorageKeys,
  type PlayerCatalogSource,
  type PlayerFeatures,
  type CatalogNavigationConfig,
} from "./playerConfig";
export { EmbedApp } from "./EmbedApp";
export { DEFAULT_THEME_OPTIONS, getThemeOptions, type AppSkin } from "./themes";
export type { MediaKind, Track, Catalog } from "./types/catalog";
export type { MediaKindFilter } from "./lib/mediaKind";
export type { PlayerBranding } from "./lib/branding";
export { resolveBranding } from "./lib/branding";
export type {
  SidebarConfig,
  SidebarBrandConfig,
  SidebarThemeConfig,
} from "./themes/types";
