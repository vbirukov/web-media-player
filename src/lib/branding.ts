import { getPlayerConfig } from "../playerConfig";

/** Брендинг и тексты по умолчанию — задаётся в `setPlayerConfig({ branding })`. */
export type PlayerBranding = {
  /** Короткое имя: сайдбар (если нет sidebar.brand.title), embed, splash */
  appTitle?: string;
  /** og:site_name, суффикс в document.title */
  siteName?: string;
  /** meta/og description для главной */
  siteDescription?: string;
  /** Суффикс в share-описаниях, напр. « — Моя студия» */
  shareAttribution?: string;
  /** Media Session `album` */
  mediaSessionAlbum?: string;
  /** Текст ссылки в embed (полная строка) */
  embedOpenLabel?: string;
  /** Сообщение, если трек не найден в embed */
  embedNotFound?: string;
  /** aria-label сплэш-экрана */
  splashAriaLabel?: string;
  /** «материал» — ед. число для UI */
  itemLabel?: string;
  /** «материалов» — род. падеж мн. числа */
  itemLabelGenitivePlural?: string;
  /** Заголовок share для каталога */
  catalogShareTitle?: string;
};

type ResolvedBranding = {
  appTitle: string;
  siteName: string;
  siteDescription: string;
  shareAttribution: string;
  mediaSessionAlbum: string;
  embedOpenLabel: string;
  embedNotFound: string;
  splashAriaLabel: string;
  itemLabel: string;
  itemLabelGenitivePlural: string;
  catalogShareTitle: string;
};

const FALLBACK: ResolvedBranding = {
  appTitle: "",
  siteName: "Медиатека",
  siteDescription:
    "Мультимедиа-библиотека — аудио, видео и тексты в браузере.",
  shareAttribution: "",
  mediaSessionAlbum: "",
  embedOpenLabel: "Открыть в каталоге",
  embedNotFound: "Материал не найден",
  splashAriaLabel: "Загрузка",
  itemLabel: "материал",
  itemLabelGenitivePlural: "материалов",
  catalogShareTitle: "Каталог",
};

export function resolveBranding(): ResolvedBranding {
  const cfg = getPlayerConfig();
  const b = cfg.branding ?? {};
  const appTitle = (b.appTitle ?? cfg.appName ?? "").trim();
  const siteName = (b.siteName ?? "").trim() || appTitle || FALLBACK.siteName;
  const mediaSessionAlbum =
    (b.mediaSessionAlbum ?? "").trim() || appTitle || siteName || FALLBACK.siteName;
  const splashAriaLabel =
    (b.splashAriaLabel ?? "").trim() || appTitle || siteName || FALLBACK.splashAriaLabel;

  return {
    appTitle,
    siteName,
    siteDescription: (b.siteDescription ?? FALLBACK.siteDescription).trim(),
    shareAttribution: (b.shareAttribution ?? "").trim(),
    mediaSessionAlbum,
    embedOpenLabel: (
      b.embedOpenLabel ??
      (appTitle ? `Открыть в ${appTitle}` : FALLBACK.embedOpenLabel)
    ).trim(),
    embedNotFound: (b.embedNotFound ?? FALLBACK.embedNotFound).trim(),
    splashAriaLabel,
    itemLabel: (b.itemLabel ?? FALLBACK.itemLabel).trim(),
    itemLabelGenitivePlural: (
      b.itemLabelGenitivePlural ?? FALLBACK.itemLabelGenitivePlural
    ).trim(),
    catalogShareTitle: (b.catalogShareTitle ?? FALLBACK.catalogShareTitle).trim(),
  };
}

function withAttribution(text: string, attribution: string): string {
  if (!attribution) return text;
  return `${text} — ${attribution}`;
}

export function shareDescriptionForTrackBranded(
  track: { title: string; folder?: string },
): string {
  const { shareAttribution } = resolveBranding();
  const series = track.folder?.trim();
  const base = series
    ? `«${track.title}» · ${series}`
    : `«${track.title}»`;
  return withAttribution(base, shareAttribution);
}

export function shareDescriptionForFolderBranded(
  folder: string,
  trackCount: number,
): string {
  const { shareAttribution, itemLabelGenitivePlural } = resolveBranding();
  const n =
    trackCount > 0
      ? `${trackCount} ${itemLabelGenitivePlural}`
      : itemLabelGenitivePlural;
  return withAttribution(`«${folder}» — ${n}`, shareAttribution);
}

export function shareDescriptionForCatalogBranded(
  trackCount: number,
  albumCount?: number,
): string {
  const { siteName, shareAttribution, itemLabelGenitivePlural, catalogShareTitle } =
    resolveBranding();
  const albums =
    albumCount != null && albumCount > 0 ? ` · ${albumCount} разделов` : "";
  const label = siteName || catalogShareTitle;
  const base = `${label} — ${trackCount} ${itemLabelGenitivePlural}${albums}`;
  return withAttribution(base, shareAttribution);
}
