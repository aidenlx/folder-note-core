import assertNever from "assert-never";
import { around } from "monkey-around";
import { App, Plugin, PluginManifest } from "obsidian";

import { AddOptionsForFolder, AddOptionsForNote } from "./modules/commands";
import NoteFinder from "./modules/resolver";
import VaultHandler from "./modules/vault-handler";
import { DEFAULT_SETTINGS, FNCoreSettings, FNCoreSettingTab } from "./settings";
import API, { API_NAME, FNCEvents, NoteLoc } from "./typings/api";

const ALX_FOLDER_NOTE = "alx-folder-note";
const API_NAME: API_NAME extends keyof typeof window ? API_NAME : never =
  "FolderNoteAPIv0" as const; // this line will throw error if name out of sync
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
    const plugin = this;
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
    (window[API_NAME] = this.api) &&
      this.register(() => (window[API_NAME] = undefined));
    this.trigger("folder-note:api-ready", this.api);
    this.register(
      around(app.fileManager, {
        // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
        getNewFileParent(next) {
          // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
          return function (sourcePath) {
            if (app.vault.getConfig("newFileLocation") === "current") {
              const pref = plugin.settings.folderNotePref;
              switch (pref) {
                case NoteLoc.Index:
                case NoteLoc.Inside:
                  break;
                case NoteLoc.Outside: {
                  const folder = plugin.finder.getFolderFromNote(sourcePath);
                  if (folder) return folder;
                  break;
                }
                default:
                  assertNever(pref);
              }
            }
            return next.call(app.fileManager, sourcePath);
          };
        },
      }),
    );
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
