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
  sections: string[];
  folders: string[];
  tracks: Track[];
  loaded: boolean;
};
