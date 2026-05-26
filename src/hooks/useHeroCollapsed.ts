import { useCallback, useState } from "react";
import { getPlayerConfig, storageKey } from "../playerConfig";

function readReturningUser(): boolean {
  try {
    if (
      localStorage.getItem(storageKey("heroCollapsed", "player-hero-collapsed-v1")) ===
      "1"
    )
      return true;
    const raw = localStorage.getItem(getPlayerConfig().storage.user);
    if (!raw) return false;
    const data = JSON.parse(raw) as {
      progress?: Record<string, unknown>;
      likes?: Record<string, unknown>;
    };
    return (
      Object.keys(data.progress ?? {}).length > 0 ||
      Object.keys(data.likes ?? {}).length > 0
    );
  } catch {
    return false;
  }
}

export function useHeroCollapsed() {
  const [collapsed, setCollapsed] = useState(readReturningUser);

  const collapse = useCallback(() => {
    setCollapsed(true);
    try {
      localStorage.setItem(
        storageKey("heroCollapsed", "player-hero-collapsed-v1"),
        "1",
      );
    } catch {
      /* quota */
    }
  }, []);

  const expand = useCallback(() => {
    setCollapsed(false);
    try {
      localStorage.removeItem(
        storageKey("heroCollapsed", "player-hero-collapsed-v1"),
      );
    } catch {
      /* quota */
    }
  }, []);

  return { collapsed, collapse, expand };
}
