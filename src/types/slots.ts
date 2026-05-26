import type { ReactNode } from "react";
import type { Catalog } from "./catalog";
import type { AppSkin } from "../themes";

export type PlayerHeaderSlotProps = {
  onOpenNav: () => void;
  installPrompt: BeforeInstallPromptEvent | null;
  onInstall: () => void;
  showIosInstallHint: boolean;
  onDismissIosHint: () => void;
  skin: AppSkin;
  onSkinChange: (skin: AppSkin) => void;
};

export type PlayerHeroSlotProps = {
  catalog: Catalog;
  collapsed: boolean;
  onCollapse: () => void;
  onExpand: () => void;
};

export type PlayerAppSlots = {
  renderHeader: (props: PlayerHeaderSlotProps) => ReactNode;
  renderHero?: (props: PlayerHeroSlotProps) => ReactNode;
};
