import assertNever from "assert-never";
import { Modal, Notice, TFile, TFolder } from "obsidian";
import { basename, join, parse } from "path";

import FNCore from "../fnc-main";
import { getParentPath, isMd, NoteLoc } from "../misc";
import API from "../typings/api";

const getFileInfo = (
  note: TFile | string,
): { base: string; parent: string } => {
  let parent: string, base: string;
  if (note instanceof TFile) {
    base = note.basename;
    parent = getParentPath(note.path);
  } else {
    base = parse(note).name;
    parent = getParentPath(note);
  }
  return { base, parent };
};

type folderNotePath = {
  info: [findIn: string, noteBaseName: string];
  path: string;
};

type FolderOp = (
  folder: TFolder,
  dryrun: boolean,
) => boolean | Promise<boolean>;
type NoteOp = (note: TFile, dryrun: boolean) => boolean | Promise<boolean>;

export default class NoteFinder {
  plugin: FNCore;
  constructor(plugin: FNCore) {
    this.plugin = plugin;
  }

  private get settings() {
    return this.plugin.settings;
  }
  private get vault() {
    return this.plugin.app.vault;
  }

  /**
   * Get path of given note/notePath's folder based on setting
   * @param note notePath or note TFile
   * @param newFolder if the path is used to create new folder
   * @returns folder path
   */
  getFolderPath = (note: TFile | string, newFolder = false): string => {
    const { parent, base } = getFileInfo(note);
    const getSiblingFolder = () => {
      if (parent === "/") return base;
      else return join(parent, base);
    };
    switch (this.settings.folderNotePref) {
      case NoteLoc.Index:
      case NoteLoc.Inside:
        if (newFolder) return getSiblingFolder();
        else return parent;
      case NoteLoc.Outside:
        return getSiblingFolder();
      default:
        assertNever(this.settings.folderNotePref);
    }
  };

  getFolderFromNote: API["getFolderFromNote"] = (note) => {
    if (!isMd(note)) return null;
    const { parent, base } = getFileInfo(note);
    // check if folder note name vaild
    switch (this.settings.folderNotePref) {
      case NoteLoc.Index:
        if (base !== this.settings.indexName) return null;
        break;
      case NoteLoc.Inside:
        if (base !== basename(parent)) return null;
        break;
      case NoteLoc.Outside:
        break;
      default:
        assertNever(this.settings.folderNotePref);
    }
    const path = this.getFolderPath(note);
    if (path)
      return (this.vault.getAbstractFileByPath(path) as TFolder) ?? null;
    else return null;
  };

  // Get Folder Note from Folder
  getFolderNote: API["getFolderNote"] = (
    ...args: [oldPath: string, folder: TFolder] | [folder: TFolder]
  ) => {
    const result = this.getFolderNotePath(...args).info;
    return this.findFolderNote(...result);
  };

  findFolderNote = (findIn: string, noteBaseName: string): TFile | null => {
    const findInFolder = this.vault.getAbstractFileByPath(findIn);
    if (findInFolder && findInFolder instanceof TFolder) {
      const found = findInFolder.children.find(
        (af) =>
          af instanceof TFile &&
          af.basename === noteBaseName &&
          af.extension === "md",
      );
      return (found as TFile) ?? null;
    } else return null;
  };

  getFolderNotePath = (
    ...args: [oldPath: string, folder: TFolder] | [folder: TFolder]
  ): folderNotePath => {
    const [src, baseFolder] = args;
    const getParent = (): string => {
      if (typeof src === "string") {
        return getParentPath(src);
      } else {
        if (src.parent === undefined) {
          // root folder
          return src.path;
        } else if (src.parent === null) {
          // when the folder is a deleted one
          return getParentPath(src.path);
        } else return src.parent.path;
      }
    };
    const { indexName, folderNotePref: folderNoteLoc } = this.settings;
    let findIn: string, noteBaseName: string;

    switch (folderNoteLoc) {
      case NoteLoc.Index:
        noteBaseName = indexName;
        break;
      case NoteLoc.Inside:
      case NoteLoc.Outside:
        if (typeof src === "string") noteBaseName = parse(src).name;
        else noteBaseName = src.name === "/" ? this.vault.getName() : src.name;
        break;
      default:
        assertNever(folderNoteLoc);
    }
    switch (folderNoteLoc) {
      case NoteLoc.Index:
      case NoteLoc.Inside:
        if (typeof src === "string") {
          if (!baseFolder) throw new TypeError("baseFolder not provided");
          findIn = baseFolder.path;
        } else findIn = src.path;
        break;
      case NoteLoc.Outside:
        findIn = getParent();
        break;
      default:
        assertNever(folderNoteLoc);
    }
    return {
      info: [findIn, noteBaseName],
      path: join(findIn, noteBaseName + ".md"),
    };
  };

  // Note Operations

  /**
   * @returns return false if no linked folder found
   */
  DeleteLinkedFolder: API["DeleteLinkedFolder"] = (
    file: TFile,
    dryrun = false,
  ): boolean => {
    if (!isMd(file)) return false;
    const folderResult = this.getFolderFromNote(file);
    if (folderResult && !dryrun) this.vault.delete(folderResult, true);
    return !!folderResult;
  };
  /**
   * @returns return false if already linked
   */
  LinkToParentFolder: API["LinkToParentFolder"] = (
    file: TFile,
    dryrun = false,
  ): boolean => {
    if (!isMd(file)) return false;

    const shouldRun = file.parent && !this.getFolderNote(file.parent);
    if (shouldRun && !dryrun) {
      const { path } = this.getFolderNotePath(file.parent);
      this.vault.rename(file, path);
    }
    return shouldRun;
  };
  /**
   * @returns return false if file not folder note
   */
  DeleteNoteAndLinkedFolder: API["DeleteNoteAndLinkedFolder"] = (
    file: TFile,
    dryrun = false,
  ): boolean => {
    if (!isMd(file)) return false;

    const folderResult = this.getFolderFromNote(file);
    if (folderResult && !dryrun) {
      new DeleteWarning(this.plugin, file, folderResult).open();
    }
    return !!folderResult;
  };

  /**
   * @returns return false if folder already exists
   */
  createFolderForNote: API["createFolderForNote"] = async (
    file: TFile,
    dryrun = false,
  ): Promise<boolean> => {
    if (!isMd(file)) return false;

    const newFolderPath = this.getFolderPath(file, true),
      folderExist = await this.vault.exists(newFolderPath);
    if (folderExist) {
      new Notice("Folder already exists");
    } else if (!dryrun) {
      await this.vault.createFolder(newFolderPath);
      let newNotePath: string | null;
      switch (this.settings.folderNotePref) {
        case NoteLoc.Index:
          newNotePath = join(newFolderPath, this.settings.indexName + ".md");
          break;
        case NoteLoc.Inside:
          newNotePath = join(newFolderPath, file.name);
          break;
        case NoteLoc.Outside:
          newNotePath = null;
          break;
        default:
          assertNever(this.settings.folderNotePref);
      }
      if (newNotePath) this.vault.rename(file, newNotePath);
    }
    return folderExist;
  };

  // Folder Operations

  /**
   * @returns return false if folder note not exists
   */
  DeleteFolderNote: API["DeleteFolderNote"] = (
    folder: TFolder,
    dryrun = false,
  ): boolean => {
    const { info } = this.getFolderNotePath(folder);
    const noteResult = this.findFolderNote(...info);
    if (noteResult && !dryrun) this.vault.delete(noteResult);

    return !!noteResult;
  };
  /**
   * @returns return false if folder note already exists
   */
  CreateFolderNote: API["CreateFolderNote"] = (
    folder: TFolder,
    dryrun = false,
  ): boolean => {
    const { info, path } = this.getFolderNotePath(folder);
    const noteResult = this.findFolderNote(...info);
    if (!noteResult && !dryrun) {
      this.vault.create(path, this.plugin.getNewFolderNote(folder));
    }
    return !noteResult;
  };
}

class DeleteWarning extends Modal {
  target: TFile;
  targetFolder: TFolder;
  plugin: FNCore;
  constructor(plugin: FNCore, file: TFile, folder: TFolder) {
    super(plugin.app);
    this.plugin = plugin;
    this.target = file;
    this.targetFolder = folder;
  }

  get settings() {
    return this.plugin.settings;
  }

  deleteFolder() {
    let { contentEl } = this;
    contentEl.createEl("p", {
      text: "Warning: the entire folder and its content will be removed",
      cls: "mod-warning",
    });
    const children = this.targetFolder.children.map((v) => v.name);
    contentEl.createEl("p", {
      text:
        children.length > 5
          ? children.slice(0, 5).join(", ") + "..."
          : children.join(", "),
    });
    contentEl.createEl("p", {
      text: "Continue?",
      cls: "mod-warning",
    });
    const buttonContainer = contentEl.createDiv({
      cls: "modal-button-container",
    });
    buttonContainer.createEl(
      "button",
      { text: "Yes", cls: "mod-warning" },
      (el) =>
        el.onClickEvent(() => {
          this.app.vault.delete(this.targetFolder, true);
          this.app.vault.delete(this.target);
          this.close();
        }),
    );
    buttonContainer.createEl("button", { text: "No" }, (el) =>
      el.onClickEvent(() => {
        this.close();
      }),
    );
  }

  onOpen() {
    this.containerEl.addClass("warn");
    this.deleteFolder();
  }

  onClose() {
    let { contentEl } = this;
    contentEl.empty();
  }
}
