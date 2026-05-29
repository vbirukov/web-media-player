import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { setPlayerConfig } from "../playerConfig";
import type { Catalog, Track } from "../types/catalog";
import {
  matchTrackToFolderRef,
  resolveFeedMode,
  resolveSectionForFolderName,
  trackMatchesFeedScope,
} from "./feedNavigation";
import { resolveTrackSection } from "./catalogSections";

const catalog: Catalog = {
  sourceTitle: "test",
  sections: ["Беседы", "Серии знаний"],
  folders: ["Беседы", "Йога сутры Патанджали"],
  tracks: [
    {
      id: "1",
      title: "A",
      fileName: "a.mp3",
      folder: "Беседы",
      folderPath: "/Беседы/a.mp3",
      path: "/Беседы/a.mp3",
      section: "Беседы",
    },
    {
      id: "2",
      title: "B",
      fileName: "b.mp3",
      folder: "Йога сутры Патанджали",
      folderPath: "/Серии знаний/Йога сутры Патанджали/b.mp3",
      path: "/Серии знаний/Йога сутры Патанджали/b.mp3",
      section: "Серии знаний",
    },
    {
      id: "3",
      title: "C",
      fileName: "c.mp3",
      folder: "Беседы",
      folderPath: "/Серии знаний/Беседы/c.mp3",
      path: "/Серии знаний/Беседы/c.mp3",
      section: "Серии знаний",
    },
  ],
  loaded: true,
};

setPlayerConfig({
  storage: { user: "t-u", catalogRefresh: "t-r", catalogCache: "t-c" },
  catalog: { publicDiskKey: "", apiRoot: "" },
  features: { offline: false, pwa: false, share: false },
  getFallbackCatalog: () => catalog,
  themeOptions: [],
  catalogNavigation: {
    mode: "hierarchical",
    catalogRoot: "sections",
    sectionView: "folder-cards",
  },
});

describe("feedNavigation", () => {
  it("resolveTrackSection uses track.section", () => {
    assert.equal(resolveTrackSection(catalog.tracks[1]!), "Серии знаний");
  });

  it("resolveSectionForFolderName disambiguates duplicate folder names", () => {
    assert.equal(resolveSectionForFolderName(catalog, "Беседы"), null);
    assert.equal(
      resolveSectionForFolderName(catalog, "Йога сутры Патанджали"),
      "Серии знаний",
    );
  });

  it("matchTrackToFolderRef respects sectionId", () => {
    const t = catalog.tracks[2]!;
    assert.equal(
      matchTrackToFolderRef(t, { sectionId: "Серии знаний", folder: "Беседы" }),
      true,
    );
    assert.equal(
      matchTrackToFolderRef(t, { sectionId: "Беседы", folder: "Беседы" }),
      false,
    );
  });

  it("trackMatchesFeedScope filters folder within section", () => {
    const track = catalog.tracks[2]! as Track;
    assert.equal(
      trackMatchesFeedScope(
        track,
        {
          level: "folder",
          sectionId: "Серии знаний",
          folder: "Беседы",
        },
        "all",
      ),
      true,
    );
    assert.equal(
      trackMatchesFeedScope(
        track,
        { level: "folder", sectionId: "Беседы", folder: "Беседы" },
        "all",
      ),
      false,
    );
  });

  it("resolveFeedMode at catalog root is sections", () => {
    assert.equal(resolveFeedMode("all", { level: "catalog" }), "sections");
    assert.equal(
      resolveFeedMode("all", { level: "section", sectionId: "Серии знаний" }),
      "folders",
    );
  });
});
