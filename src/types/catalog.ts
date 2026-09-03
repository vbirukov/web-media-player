export type MediaKind = "audio" | "video" | "text";

export type Track = {
  id: string;
  title: string;
  fileName: string;
  folder: string;
  folderPath: string;
  path: string;
  /** Раздел библиотеки (верхний уровень навигации) */
  section?: string;
  kind?: MediaKind;
  size?: number;
  modified?: string;
  mimeType?: string;
  url?: string;
};

export type Catalog = {
  sourceTitle: string;
  /** id разделов в порядке отображения (физические ключи, напр. «01 RASTAMANSKIE SKAZKI») */
  sections: string[];
  /** Физические имена папок (пути/оффлайн/шеринг строятся по ним) */
  folders: string[];
  tracks: Track[];
  loaded: boolean;
  /**
   * id раздела → отображаемое название (без номеров-префиксов),
   * напр. «01 RASTAMANSKIE SKAZKI» → «RASTAMANSKIE SKAZKI».
   * Нет записи → показываем сам id.
   */
  sectionLabels?: Record<string, string>;
  /**
   * физическое имя папки → отображаемое название карточки,
   * напр. «01 RASTAMANSKIE SKAZKI 1995 - 1997» → «1995 - 1997».
   * Нет записи → показываем физическое имя.
   */
  folderLabels?: Record<string, string>;
};
