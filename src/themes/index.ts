import type { AppSkin, Appearance, ThemeMeta } from "./types";
import { getPlayerConfig, storageKey } from "../playerConfig";

export type {
  AppSkin,
  BuiltinSkin,
  Appearance,
  ThemeMeta,
  SidebarBrandConfig,
  SidebarThemeConfig,
  SidebarConfig,
} from "./types";
export { jaipurTheme } from "./jaipur";
export { moonDubTheme } from "./moon-dub";
export { rastamanTheme } from "./rastaman";
export { rastamanLightTheme } from "./rastaman-light";
export { motion, motionMs } from "./motion";

export function skinStorageKey(): string {
  return storageKey("skin", "player-skin-v1");
}

export function appearanceStorageKey(): string {
  return storageKey("appearance", "player-appearance-v1");
}

export function getThemeOptions(): ThemeMeta[] {
  return getPlayerConfig().themeOptions;
}

export const DEFAULT_THEME_OPTIONS: ThemeMeta[] = [
  {
    id: "rastaman",
    label: "Раста тёмная",
    shortLabel: "Раста",
    description: "Джунгли, закат, кальян",
    mark: "☽",
    themeColor: "#0c1115",
  },
  {
    id: "rastaman-light",
    label: "Раста светлая",
    shortLabel: "Светлая",
    description: "Солнечный постер, флаг, комикс",
    mark: "☀",
    themeColor: "#fff5bf",
  },
  {
    id: "jaipur",
    label: "Джайпур",
    shortLabel: "Джайпур",
    description: "Розовый город, jali, арки",
    mark: "◆",
    dataTheme: "jaipur",
    themeColor: "#c5796d",
  },
  {
    id: "moon-dub",
    label: "Лунная даб-библиотека",
    shortLabel: "Луна",
    description: "Ночной архив, янтарь, дым",
    mark: "◎",
    themeColor: "#12100e",
  },
];

export function readStoredSkin(): AppSkin {
  try {
    const v = localStorage.getItem(skinStorageKey());
    if (v) {
      const opts = getPlayerConfig().themeOptions;
      if (opts.some((t) => t.id === v)) return v;
    }
  } catch {
    /* private mode or config not ready */
  }
  try {
    if (localStorage.getItem(appearanceStorageKey()) === "light") {
      return "rastaman-light";
    }
  } catch {
    /* private mode */
  }
  const opts = getPlayerConfig().themeOptions;
  return opts[0]?.id ?? "rastaman";
}

export function readStoredAppearance(): Appearance {
  try {
    const v = localStorage.getItem(appearanceStorageKey());
    if (v === "light" || v === "dark") return v;
  } catch {
    /* private mode */
  }
  return "dark";
}

export function applyDocumentTheme(skin: AppSkin) {
  const root = document.documentElement;
  root.setAttribute("data-skin", skin);

  const meta = getPlayerConfig().themeOptions.find((t) => t.id === skin);
  const dataTheme = meta?.dataTheme ?? (skin === "rastaman-light" ? "rastaman-light" : "dark");
  root.setAttribute("data-theme", dataTheme);

  const color = meta?.themeColor ?? "#000000";
  document
    .querySelectorAll('meta[name="theme-color"]')
    .forEach((el) => el.setAttribute("content", color));
}
