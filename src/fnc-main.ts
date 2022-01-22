import assertNever from "assert-never";
import log from "loglevel";
import { around } from "monkey-around";
import { App, Plugin, PluginManifest } from "obsidian";

import { AddOptionsForFolder, AddOptionsForNote } from "./modules/commands";
import NoteResolver from "./modules/resolver";
import VaultHandler from "./modules/vault-handler";
import { DEFAULT_SETTINGS, FNCoreSettings, FNCoreSettingTab } from "./settings";
import API, { API_NAME, FNCEvents, getApi, NoteLoc } from "./typings/api";

const ALX_FOLDER_NOTE = "alx-folder-note";
const API_NAME: API_NAME extends keyof typeof window ? API_NAME : never =
  "FolderNoteAPIv0" as const; // this line will throw error if name out of sync
export default class FNCore extends Plugin {
  settings: FNCoreSettings = DEFAULT_SETTINGS;
  vaultHandler = new VaultHandler(this);
  resolver = new NoteResolver(this);
  api: API;

  settingTab = new FNCoreSettingTab(this);

  constructor(app: App, manifest: PluginManifest) {
    super(app, manifest);
    log.setDefaultLevel("ERROR");
    const plugin = this;
    this.api = getApi(plugin);
    (window[API_NAME] = this.api) &&
      this.register(() => delete window[API_NAME]);
    this.trigger("folder-note:api-ready", this.api);

    // patch create new note location for outside-same
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
                  const folder = plugin.resolver.getFolderFromNote(sourcePath);
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
    log.info("loading folder-note-core");

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
    log.setLevel(this.settings.logLevel);
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  getNewFolderNote: API["getNewFolderNote"] = (folder) =>
    this.settings.folderNoteTemplate
      .replace(/{{FOLDER_NAME}}/g, folder.name)
      .replace(/{{FOLDER_PATH}}/g, folder.path);
}
