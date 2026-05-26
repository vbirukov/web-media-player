import { useCallback, useEffect, useState } from "react";
import {
  applyDocumentTheme,
  readStoredSkin,
  skinStorageKey,
  type AppSkin,
} from "../themes";

export function useAppTheme() {
  const [skin, setSkin] = useState<AppSkin>(readStoredSkin);

  useEffect(() => {
    applyDocumentTheme(skin);
    try {
      localStorage.setItem(skinStorageKey(), skin);
    } catch {
      /* quota */
    }
  }, [skin]);

  const setSkinAndPersist = useCallback((next: AppSkin) => {
    setSkin(next);
  }, []);

  return {
    skin,
    setSkin: setSkinAndPersist,
    isJaipur: skin === "jaipur",
    isRastaman: skin === "rastaman",
    isRastamanLight: skin === "rastaman-light",
  };
}
