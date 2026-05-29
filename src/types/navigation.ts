export type FolderRef = {
  sectionId: string;
  folder: string;
  folderPath?: string;
};

export type FeedScope =
  | { level: "catalog" }
  | { level: "section"; sectionId: string }
  | { level: "folder"; sectionId: string; folder: string; folderPath?: string }
  | { level: "selection"; folders: FolderRef[] };

export type FeedMode = "tracks" | "folders" | "sections";

export type BreadcrumbItem = {
  label: string;
  scope: FeedScope;
};
