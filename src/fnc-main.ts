import {
  App,
  debounce,
  Debouncer,
  Notice,
  Plugin,
  PluginManifest,
  TFile,
  TFolder,
} from "obsidian";

import { AddOptionsForFolder, AddOptionsForNote } from "./modules/commands";
import NoteFinder from "./modules/resolver";
import VaultHandler from "./modules/vault-handler";
import { DEFAULT_SETTINGS, FNCoreSettings, FNCoreSettingTab } from "./settings";
import API from "./typings/api";

export default class FNCore extends Plugin {
  settings: FNCoreSettings = DEFAULT_SETTINGS;
  vaultHandler = new VaultHandler(this);
  finder: NoteFinder;
  api: API;

  constructor(app: App, manifest: PluginManifest) {
    super(app, manifest);
    let finder = new NoteFinder(this);
    this.finder = finder;
    this.api = {
      get getFolderFromNote() {
        return finder.getFolderFromNote;
      },
      get getFolderNote() {
        return finder.getFolderNote;
      },
      get DeleteLinkedFolder() {
        return finder.DeleteLinkedFolder;
      },
      get LinkToParentFolder() {
        return finder.LinkToParentFolder;
      },
      get DeleteNoteAndLinkedFolder() {
        return finder.DeleteNoteAndLinkedFolder;
      },
      get createFolderForNote() {
        return finder.createFolderForNote;
      },
      get DeleteFolderNote() {
        return finder.DeleteFolderNote;
      },
      get CreateFolderNote() {
        return finder.CreateFolderNote;
      },
    };
  }

  async onload() {
    console.log("loading folder-note-core");

    await this.loadSettings();

    this.addSettingTab(new FNCoreSettingTab(this.app, this));

    AddOptionsForNote(this);
    AddOptionsForFolder(this);
    this.vaultHandler.registerEvent();
  }

  trigger(name: "folder-note:create", note: TFile, folder: TFolder): void;
  trigger(
    name: "folder-note:rename",
    note: [file: TFile, oldPath: string],
    folder: [folder: TFolder, oldPath: string],
  ): void;
  trigger(name: "folder-note:delete", note: TFile, folder: TFolder): void;
  trigger(name: "folder-note:cfg-changed"): void;
  trigger(name: string, ...data: any[]): void {
    this.app.vault.trigger(name, ...data);
  }

  async loadSettings() {
    this.settings = { ...this.settings, ...(await this.loadData()) };
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  getNewFolderNote = (folder: TFolder): string =>
    this.settings.folderNoteTemplate
      .replace(/{{FOLDER_NAME}}/g, folder.name)
      .replace(/{{FOLDER_PATH}}/g, folder.path);
}
