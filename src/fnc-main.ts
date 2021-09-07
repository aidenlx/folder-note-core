import { App, Plugin, PluginManifest, TFile, TFolder } from "obsidian";

import { NoteLoc } from "./misc";
import { AddOptionsForFolder, AddOptionsForNote } from "./modules/commands";
import NoteFinder from "./modules/resolver";
import VaultHandler from "./modules/vault-handler";
import { DEFAULT_SETTINGS, FNCoreSettings, FNCoreSettingTab } from "./settings";
import API, { FNCEvents } from "./typings/api";

const ALX_FOLDER_NOTE = "alx-folder-note";
export default class FNCore extends Plugin {
  settings: FNCoreSettings = DEFAULT_SETTINGS;
  vaultHandler = new VaultHandler(this);
  finder: NoteFinder;
  api: API;

  settingTab = new FNCoreSettingTab(this);

  constructor(app: App, manifest: PluginManifest) {
    super(app, manifest);
    let finder = new NoteFinder(this);
    this.finder = finder;
    let plugin = this;
    this.api = {
      get renderCoreSettings() {
        return plugin.settingTab.renderCoreSettings;
      },
      importSettings: (cfg) => {
        if (cfg.folderNotePref !== undefined) {
          switch (cfg.folderNotePref) {
            case 0:
              cfg.folderNotePref = NoteLoc.Index;
              break;
            case 1:
              cfg.folderNotePref = NoteLoc.Inside;
              break;
            case 2:
              cfg.folderNotePref = NoteLoc.Outside;
              break;
            default:
              break;
          }
          let toImport = Object.fromEntries(
            Object.entries(cfg).filter(([k, v]) => v !== undefined),
          ) as FNCoreSettings;

          this.settings = { ...this.settings, ...toImport };
          this.saveSettings();
        }
      },
      get getNewFolderNote() {
        return plugin.getNewFolderNote;
      },
      get getFolderFromNote() {
        return finder.getFolderFromNote;
      },
      get getFolderPath() {
        return finder.getFolderPath;
      },
      get getFolderNote() {
        return finder.getFolderNote;
      },
      get getFolderNotePath() {
        return finder.getFolderNotePath;
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
    this.trigger("folder-note:api-ready", this.api);
  }

  async onload() {
    console.log("loading folder-note-core");

    await this.loadSettings();

    if (!this.app.plugins.enabledPlugins.has(ALX_FOLDER_NOTE))
      this.addSettingTab(this.settingTab);

    AddOptionsForNote(this);
    AddOptionsForFolder(this);
    this.vaultHandler.registerEvent();
  }

  trigger(...args: FNCEvents): void {
    const [name, ...data] = args;
    this.app.vault.trigger(name, ...data);
  }

  async loadSettings() {
    this.settings = { ...this.settings, ...(await this.loadData()) };
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  getNewFolderNote: API["getNewFolderNote"] = (folder) =>
    this.settings.folderNoteTemplate
      .replace(/{{FOLDER_NAME}}/g, folder.name)
      .replace(/{{FOLDER_PATH}}/g, folder.path);
}
