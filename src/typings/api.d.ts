import { TFile, TFolder } from "obsidian";

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

export type FolderNotePath = {
  /** the parent directory */
  dir: string;
  /** the file name (including extension) */
  name: string;
  /** full filepath that can be used to get TFile */
  path: string;
} | null;
export default interface FolderNoteAPI {
  importSettings(settings: Partial<OldConfig>): void;
  renderCoreSettings(target: HTMLElement): void;

  getFolderFromNote(note: TFile | string): TFolder | null;
  /**
   * Get path of given note/notePath's folder based on setting
   * @param note notePath or note TFile
   * @param newFolder if the path is used to create new folder
   * @returns folder path, will return null if note basename invaild and newFolder=false
   */
  getFolderPath(note: TFile | string, newFolder: boolean): string | null;

  getFolderNote(folder: TFolder | string): TFile | null;
  /** Get the path to the folder note for given file based on setting,
   * @returns not guaranteed to exists  */
  getFolderNotePath(folder: TFolder | string): FolderNotePath;

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
  DeleteNoteAndLinkedFolder(file: TFile, dryrun?: boolean): boolean;
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

import "obsidian";

declare module "obsidian" {
  interface Vault {
    exists(normalizedPath: string, sensitive?: boolean): Promise<boolean>;
  }
}
