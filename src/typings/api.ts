import { OpenViewState, TFile, TFolder } from "obsidian";

import FNCore from "../fnc-main";
import { FNCoreSettings } from "../settings";

interface OldConfig {
  /**
   *  Index=0, Inside=1, Outside=2,
   */
  folderNotePref: 0 | 1 | 2;
  deleteOutsideNoteWithFolder: boolean;
  indexName: string;
  autoRename: boolean;
  folderNoteTemplate: string;
}

export enum NoteLoc {
  Index,
  Inside,
  Outside,
}

export type FolderNotePath = {
  /** the parent directory */
  dir: string;
  /** the file name (including extension) */
  name: string;
  /** full filepath that can be used to get TFile */
  path: string;
};
export default interface FolderNoteAPI {
  importSettings(settings: Partial<OldConfig>): void;
  renderCoreSettings(target: HTMLElement): void;
  renderLogLevel(targer: HTMLElement): void;

  getFolderFromNote(note: TFile | string, strategy?: NoteLoc): TFolder | null;
  /**
   * Get path of given note/notePath's folder based on setting
   * @param note notePath or note TFile
   * @param newFolder if the path is used to create new folder
   * @returns folder path, will return null if note basename invaild and newFolder=false
   */
  getFolderPath(
    note: TFile | string,
    newFolder: boolean,
    strategy?: NoteLoc,
  ): string | null;

  getFolderNote(folder: TFolder | string, strategy?: NoteLoc): TFile | null;
  /** Get the path to the folder note for given file based on setting,
   * @returns not guaranteed to exists  */
  getFolderNotePath(
    folder: TFolder | string,
    strategy?: NoteLoc,
  ): FolderNotePath | null;

  /** Generate folder note content for given folder based on template */
  getNewFolderNote(folder: TFolder): string;

  OpenFolderNote(
    folder: TFolder | string,
    dryrun?: boolean,
    config?: { newLeaf?: boolean; openViewState?: OpenViewState },
  ): boolean;
  /**
   * @returns return false if no linked folder found
   */
  DeleteLinkedFolder(file: TFile, dryrun?: boolean): boolean;
  /**
   * Link current note to parent folder, move given file if needed
   * @returns return false if already linked
   */
  LinkToParentFolder(file: TFile, dryrun?: boolean): boolean;
  /**
   * Delete given file as well as linked folder, will prompt for confirmation
   * @returns return false if no linked folder found
   */
  DeleteNoteAndLinkedFolder(target: TFile | TFolder, dryrun?: boolean): boolean;
  /**
   * Create folder based on config and move given file if needed
   * @returns return false if folder already exists
   */
  createFolderForNote(file: TFile, dryrun?: boolean): Promise<boolean>;
  /**
   * @returns return false if folder note not exists
   */
  DeleteFolderNote(folder: TFolder, dryrun?: boolean): boolean;
  /**
   * @returns return false if folder note already exists
   */
  CreateFolderNote(folder: TFolder, dryrun?: boolean): boolean;
}

declare global {
  // Must use var, no const/let
  var FolderNoteAPIv0: FolderNoteAPI | undefined;
}
export type API_NAME = "FolderNoteAPIv0";

export type FNCEvents =
  | [name: "folder-note:api-ready", api: FolderNoteAPI]
  | [name: "folder-note:cfg-changed"]
  | [name: "folder-note:delete", note: TFile, folder: TFolder]
  | [
      name: "folder-note:rename",
      note: [file: TFile, oldPath: string],
      folder: [folder: TFolder, oldPath: string],
    ]
  | [name: "folder-note:create", note: TFile, folder: TFolder];

export const getApi = (plugin: FNCore): FolderNoteAPI => {
  return {
    get renderCoreSettings() {
      return plugin.settingTab.renderCoreSettings;
    },
    get renderLogLevel() {
      return plugin.settingTab.setLogLevel;
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

        plugin.settings = { ...plugin.settings, ...toImport };
        plugin.saveSettings();
      }
    },
    get getNewFolderNote() {
      return plugin.getNewFolderNote;
    },
    get getFolderFromNote() {
      return plugin.resolver.getFolderFromNote;
    },
    get getFolderPath() {
      return plugin.resolver.getFolderPath;
    },
    get getFolderNote() {
      return plugin.resolver.getFolderNote;
    },
    get getFolderNotePath() {
      return plugin.resolver.getFolderNotePath;
    },
    get DeleteLinkedFolder() {
      return plugin.resolver.DeleteLinkedFolder;
    },
    get LinkToParentFolder() {
      return plugin.resolver.LinkToParentFolder;
    },
    get DeleteNoteAndLinkedFolder() {
      return plugin.resolver.DeleteNoteAndLinkedFolder;
    },
    get createFolderForNote() {
      return plugin.resolver.createFolderForNote;
    },
    get DeleteFolderNote() {
      return plugin.resolver.DeleteFolderNote;
    },
    get CreateFolderNote() {
      return plugin.resolver.CreateFolderNote;
    },
    get OpenFolderNote() {
      return plugin.resolver.OpenFolderNote;
    },
  };
};
