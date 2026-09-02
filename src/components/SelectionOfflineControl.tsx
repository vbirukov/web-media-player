import { Icon } from "./icons/Icon";
import type { OfflineFolderJob } from "../hooks/useOfflineLibrary";

type Props = {
  label: string;
  trackCount: number;
  isDownloading: boolean;
  job: OfflineFolderJob | null;
  onDownload: () => void;
  onCancel: () => void;
};

export function SelectionOfflineControl({
  label,
  trackCount,
  isDownloading,
  job,
  onDownload,
  onCancel,
}: Props) {
  if (isDownloading && job) {
    return (
      <button
        type="button"
        className="folder-offline folder-offline--inline ghost"
        onClick={onCancel}
        aria-label={`Скачивание… ${job.done}/${job.total}. Отменить`}
        title={`Скачивание… ${job.done}/${job.total}`}
      >
        <Icon name="loader" size={18} className="icon-spin" aria-hidden />
      </button>
    );
  }

  return (
    <button
      type="button"
      className="folder-offline folder-offline--inline ghost"
      onClick={onDownload}
      aria-label={`Скачать выборку (${trackCount})`}
      title={`Скачать выборку (${trackCount})`}
    >
      <Icon name="download" size={18} aria-hidden />
    </button>
  );
}
