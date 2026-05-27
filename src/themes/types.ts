/** Встроенные скины. Хост может добавлять свои через `themeOptions`. */
export type BuiltinSkin =
  | "rastaman"
  | "rastaman-light"
  | "jaipur"
  | "moon-dub";

/**
 * AppSkin принимает любую строку — чтобы хост мог зарегистрировать
 * собственные темы и менять их через setPlayerConfig / themeOptions.
 * Встроенные скины по-прежнему типизированы через BuiltinSkin.
 */
export type AppSkin = BuiltinSkin | (string & {});

export type Appearance = "light" | "dark";

export type ThemeMeta = {
  id: AppSkin;
  label: string;
  shortLabel: string;
  description: string;
  /** Символ / эмодзи / иконка для кнопки в ThemeSwitcher */
  mark?: string;
  /** CSS-класс для `<html>` вместо `data-skin`. По умолчанию `data-skin=id`. */
  dataTheme?: string;
  /** `theme-color` в meta (для браузерного chrome). По умолчанию #000. */
  themeColor?: string;
};

/** Конфиг бренда в сайдбаре. */
export type SidebarBrandConfig = {
  /** Показывать блок .brand. По умолчанию true. */
  show?: boolean;
  /** Заголовок рядом с логотипом. По умолчанию — `branding.appTitle` из config */
  title?: string;
  /** URL или data-URI логотипа. null — скрыть img. */
  logoSrc?: string | null;
  /** alt для img логотипа. */
  logoAlt?: string;
};

/** Конфиг секции тем в сайдбаре. */
export type SidebarThemeConfig = {
  /** Показывать строку переключателя тем. По умолчанию true. */
  show?: boolean;
  /** Заголовок секции. По умолчанию нет (compact). */
  label?: string;
};

/** Конфиг секций сайдбара целиком. */
export type SidebarConfig = {
  brand?: SidebarBrandConfig;
  themes?: SidebarThemeConfig;
};
