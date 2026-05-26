/**
 * @deprecated Используй getPlayerConfig() / storageKey() из playerConfig.ts
 */
import { getPlayerConfig, storageKey } from "./playerConfig";

export function PUBLIC_KEY() {
  return getPlayerConfig().catalog.publicDiskKey;
}
export function API_ROOT() {
  return getPlayerConfig().catalog.apiRoot;
}
export const getPUBLIC_KEY = PUBLIC_KEY;
export const getAPI_ROOT = API_ROOT;

export function STORAGE_KEY() {
  return getPlayerConfig().storage.user;
}
export function CATALOG_CACHE_KEY() {
  return getPlayerConfig().storage.catalogCache;
}
export function CATALOG_REFRESH_KEY() {
  return getPlayerConfig().storage.catalogRefresh;
}
export function HERO_COLLAPSED_KEY() {
  return storageKey("heroCollapsed", "player-hero-collapsed-v1");
}
export function SPLASH_SEEN_KEY() {
  return storageKey("splashSeen", "player-splash-seen-v1");
}
