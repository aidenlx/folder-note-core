import { TFile, TFolder } from "obsidian";

export default interface FolderNoteAPI {
  getFolderFromNote(note: TFile | string): TFolder | null;

  getFolderNote(folder: TFolder): TFile | null;
  /**
   * @param oldPath oldpath of target folder
   * @param folder renamed folder
   */
  getFolderNote(oldPath: string, folder: TFolder): TFile | null;
  getFolderNote(folder: string | TFolder, findNoteIn?: TFolder): TFile | null;

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
