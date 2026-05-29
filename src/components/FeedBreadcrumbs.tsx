import type { BreadcrumbItem, FeedScope } from "../types/navigation";
import { feedScopeParent } from "../lib/feedNavigation";
import { Icon } from "./icons/Icon";

type Props = {
  breadcrumbs: BreadcrumbItem[];
  scope: FeedScope;
  onNavigate: (scope: FeedScope) => void;
  showBack?: boolean;
};

export function FeedBreadcrumbs({
  breadcrumbs,
  scope,
  onNavigate,
  showBack = true,
}: Props) {
  if (scope.level === "catalog" && breadcrumbs.length <= 1) return null;

  const parent = feedScopeParent(scope);

  return (
    <nav className="feed-breadcrumbs" aria-label="Навигация по каталогу">
      {showBack && scope.level !== "catalog" ? (
        <button
          type="button"
          className="ghost feed-breadcrumbs__back"
          onClick={() => onNavigate(parent)}
        >
          <Icon name="chevron-up" size={18} aria-hidden />
          <span>Назад</span>
        </button>
      ) : null}
      <ol className="feed-breadcrumbs__trail">
        {breadcrumbs.map((item, i) => {
          const isLast = i === breadcrumbs.length - 1;
          return (
            <li key={`${item.scope.level}-${item.label}-${i}`}>
              {isLast ? (
                <span className="feed-breadcrumbs__current" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <button
                  type="button"
                  className="ghost feed-breadcrumbs__link"
                  onClick={() => onNavigate(item.scope)}
                >
                  {item.label}
                </button>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
