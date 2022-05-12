import {
  FileManager,
  Notice,
  TAbstractFile,
  TFile,
  TFolder,
  Vault,
} from "obsidian";
import { basename, dirname } from "path";

import FNCore from "../fnc-main";
import { afOp, getRenamedPath, isMd } from "../misc";
import { NoteLoc } from "../typings/api";

export default class VaultHandler {
  // @ts-ignore
  private on: Vault["on"] = (...args) => this.plugin.app.vault.on(...args);
  private delete: Vault["delete"] = (...args) =>
    this.plugin.app.vault.delete(...args);
  private rename: FileManager["renameFile"] = (...args) =>
    this.plugin.app.fileManager.renameFile(...args);

  private get settings() {
    return this.plugin.settings;
  }
  private get finder() {
    return this.plugin.resolver;
  }
  plugin: FNCore;

  constructor(plugin: FNCore) {
    this.plugin = plugin;
  }

  registerEvent = () => {
    this.plugin.registerEvent(this.on("create", this.onChange));
    this.plugin.registerEvent(this.on("rename", this.onRename));
    this.plugin.registerEvent(this.on("delete", this.onDelete));
  };

  private shouldRename(af: TAbstractFile, oldPath?: string): oldPath is string {
    if (!this.settings.autoRename || !oldPath) return false;
    const renameOnly =
      this.settings.folderNotePref !== NoteLoc.Index &&
      dirname(af.path) === dirname(oldPath) // rename only, same loc
        ? true
        : false;
    // sync loc is enabled in folder renames only
    const syncLoc =
      af instanceof TFolder &&
      this.settings.folderNotePref === NoteLoc.Outside &&
      dirname(af.path) !== dirname(oldPath)
        ? true
        : false;
    return renameOnly || syncLoc;
  }

  onRename = (af: TAbstractFile, oldPath: string) => {
    setTimeout(() => this.onChange(af, oldPath), 500);
  }

  onChange = (af: TAbstractFile, oldPath?: string) => {
    const { getFolderNote, getFolderFromNote, getFolderNotePath, getFolderNotePathAfterMove } = this.finder;

    function getOldLinked(af: TFile): TFolder | null;
    function getOldLinked(af: TFolder): TFile | null;
    function getOldLinked(af: TAbstractFile): TFile | TFolder | null;
    // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
    function getOldLinked(af: TAbstractFile): TFile | TFolder | null {
      if (af instanceof TFolder) {
        return getFolderNotePathAfterMove(af, oldPath);
      } else if (af instanceof TFile) {
        return oldPath && isMd(oldPath) ? getFolderFromNote(oldPath) : null;
      } else return null;
    }

    function getLinked(af: TFile): TFolder | null;
    function getLinked(af: TFolder): TFile | null;
    // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
    function getLinked(af: TAbstractFile): TFile | TFolder | null {
      if (af instanceof TFolder) {
        return getFolderNote(af);
      } else if (af instanceof TFile) {
        return getFolderFromNote(af);
      } else return null;
    }

    // markdown <-> non-md
    if (oldPath && af instanceof TFile && isMd(oldPath) !== isMd(af)) {
      const oldLinked = getOldLinked(af);
      if (oldLinked) {
        // folder note -> non-md
        this.plugin.trigger("folder-note:delete", af, oldLinked);
      } else {
        // non-md -> md, check if folder note
        const nowLinked = getFolderFromNote(af);
        if (nowLinked) this.plugin.trigger("folder-note:create", af, nowLinked);
      }
    } else {
      // check if new location contains matched folder and mark if exists
      let newExists = false,
        linked;

      afOp(
        af,
        (file) => {
          linked = getLinked(file);
          if (linked) {
            newExists = true;
            this.plugin.trigger("folder-note:create", file, linked);
          }
        },
        (folder) => {
          linked = getLinked(folder);
          if (linked) {
            newExists = true;
            this.plugin.trigger("folder-note:create", linked, folder);
          }
        },
      );

      // onRename, check if oldPath has any folder note/linked folder
      const oldLinked = getOldLinked(af);
      if (!oldLinked) return;

      const renameTo =
        af instanceof TFolder
          ? getFolderNotePath(af)?.path ?? ""
          : af instanceof TFile
          ? getRenamedPath(oldLinked, af.basename) ?? ""
          : "";

      if (this.shouldRename(af, oldPath))
        if (!newExists && renameTo) {
          this.rename(oldLinked, renameTo);
          afOp(
            af,
            (f) =>
              this.plugin.trigger(
                "folder-note:rename",
                [f, oldPath],
                [oldLinked as TFolder, renameTo],
              ),
            (f) =>
              this.plugin.trigger(
                "folder-note:rename",
                [oldLinked as TFile, renameTo],
                [f, oldPath],
              ),
          );
          return;
        } else {
          const target =
              oldLinked instanceof TFile ? "folder note" : "linked folder",
            baseMessage = `Failed to sync name of ${target}: `,
            errorMessage = newExists
              ? `${target} ${basename(renameTo)} already exists`
              : "check console for more details";
          new Notice(baseMessage + errorMessage);
        }

      // reset old linked folder note/folder mark when no rename is performed
      afOp(
        af,
        (f) =>
          this.plugin.trigger("folder-note:delete", f, oldLinked as TFolder),
        (f) => this.plugin.trigger("folder-note:delete", oldLinked as TFile, f),
      );
    }
  };
  onDelete = (af: TAbstractFile) => {
    const { getFolderNote, getFolderFromNote } = this.finder;
    if (af instanceof TFolder) {
      const oldNote = getFolderNote(af);
      if (!(this.settings.folderNotePref === NoteLoc.Outside && oldNote))
        return;

      if (this.settings.deleteOutsideNoteWithFolder) {
        this.delete(oldNote);
      } else this.plugin.trigger("folder-note:delete", oldNote, af);
    } else if (af instanceof TFile && isMd(af)) {
      const oldFolder = getFolderFromNote(af);
      if (oldFolder) this.plugin.trigger("folder-note:delete", af, oldFolder);
    }
  };
}
