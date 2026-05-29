import { resolveBranding } from "./branding";
import { feedListenFilterLabel } from "./listenStatus";
import type { FeedMode } from "../types/navigation";
import type { FeedListenFilter, LibraryView } from "../types/user";

type Args = {
  view: LibraryView;
  feedFolderFilter: string[];
  feedMode?: FeedMode;
  sectionTitle?: string;
  selectedPlaylist: string | null;
  playlistName: string;
  feedListenFilter: FeedListenFilter;
};

export function emptyStateCopy({
  view,
  feedFolderFilter,
  feedMode,
  sectionTitle,
  selectedPlaylist,
  playlistName,
  feedListenFilter,
}: Args): { title: string; hint: string } {
  if (feedMode === "sections") {
    return {
      title: "Разделы пусты",
      hint: "В каталоге нет материалов с текущим фильтром типа контента.",
    };
  }
  if (feedMode === "folders") {
    return {
      title: sectionTitle ? `В «${sectionTitle}» пусто` : "Папок нет",
      hint: "В этом разделе нет папок или они не попали в индекс.",
    };
  }
  const { itemLabelGenitivePlural } = resolveBranding();
  if (
    feedListenFilter !== "all" &&
    view !== "resume" &&
    feedListenFilter in feedListenFilterLabel
  ) {
    const label = feedListenFilterLabel[feedListenFilter as keyof typeof feedListenFilterLabel];
    return {
      title: `Нет ${itemLabelGenitivePlural}: «${label}»`,
      hint: "Смените фильтр или откройте другой раздел каталога.",
    };
  }
  if (feedFolderFilter.length === 1) {
    return {
      title: "В этой серии пусто",
      hint: `В разделе «${feedFolderFilter[0]}» пока нет треков или они не попали в индекс.`,
    };
  }
  if (feedFolderFilter.length > 1) {
    return {
      title: "В выборке пусто",
      hint: "Нет треков по выбранным сериям с текущим фильтром прослушивания.",
    };
  }
  if (view === "resume") {
    return {
      title: "Нечего продолжать",
      hint: `Здесь ${itemLabelGenitivePlural}, которые вы начали и ещё не завершили.`,
    };
  }
  if (view === "liked") {
    return {
      title: "Лайков пока нет",
      hint: `Отмечайте понравившиеся ${itemLabelGenitivePlural} лайком — они соберутся в этом разделе.`,
    };
  }
  if (view === "playlist" && selectedPlaylist) {
    return {
      title: playlistName ? `«${playlistName}» пуст` : "Плейлист пуст",
      hint: "Добавляйте треки кнопками «+ название» на карточках в каталоге.",
    };
  }
  return {
    title: "Каталог пуст",
    hint: "Обновите каталог или проверьте доступ к папке на Яндекс.Диске.",
  };
}
