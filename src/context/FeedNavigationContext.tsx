import { createContext, useContext, type ReactNode } from "react";
import type { BreadcrumbItem, FeedScope } from "../types/navigation";

export type FeedNavigationValue = {
  feedScope: FeedScope;
  setFeedScope: (scope: FeedScope) => void;
  breadcrumbs: BreadcrumbItem[];
};

const FeedNavigationContext = createContext<FeedNavigationValue | null>(null);

export function FeedNavigationProvider({
  value,
  children,
}: {
  value: FeedNavigationValue;
  children: ReactNode;
}) {
  return (
    <FeedNavigationContext.Provider value={value}>
      {children}
    </FeedNavigationContext.Provider>
  );
}

export function usePlayerNavigation(): FeedNavigationValue {
  const ctx = useContext(FeedNavigationContext);
  if (!ctx) {
    throw new Error(
      "[@vbonline/player] usePlayerNavigation() только внутри PlayerApp",
    );
  }
  return ctx;
}
