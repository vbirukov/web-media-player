import type { Catalog } from "./types/catalog";
import type { ThemeMeta } from "./themes/types";

export type PlayerStorageKeys = {
  user: string;
  catalogRefresh: string;
  catalogCache: string;
  skin?: string;
  appearance?: string;
  heroCollapsed?: string;
  splashSeen?: string;
};

export type PlayerCatalogSource = {
  publicDiskKey: string;
  apiRoot: string;
};

export type PlayerFeatures = {
  offline: boolean;
  pwa: boolean;
  share: boolean;
  /** Видеоплеер (по умолчанию включён) */
  video?: boolean;
  /** Просмотр текстов md/txt/html (по умолчанию включён) */
  text?: boolean;
};

export type PlayerConfig = {
  storage: PlayerStorageKeys;
  catalog: PlayerCatalogSource;
  features: PlayerFeatures;
  getFallbackCatalog: () => Catalog;
  themeOptions: ThemeMeta[];
  /** Предупреждение в консоль, если нет proxy/media в prod */
  appName?: string;
};

let activeConfig: PlayerConfig | null = null;

export function setPlayerConfig(config: PlayerConfig): void {
  activeConfig = config;
}

export function getPlayerConfig(): PlayerConfig {
  if (!activeConfig) {
    throw new Error(
      "[@haiduk/player] Вызови setPlayerConfig() до рендера PlayerApp",
    );
  }
  return activeConfig;
}

export function storageKey(
  key: keyof Omit<
    PlayerStorageKeys,
    "user" | "catalogRefresh" | "catalogCache"
  >,
  fallback: string,
): string {
  const cfg = getPlayerConfig().storage;
  const v = cfg[key];
  return typeof v === "string" && v ? v : fallback;
}
