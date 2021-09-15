import assertNever from "assert-never";
import log from "loglevel";
import { Modal, Notice, TFile, TFolder } from "obsidian";
import { basename as getBase, join } from "path";

import FNCore from "../fnc-main";
import { getParentPath, isMd } from "../misc";
import API, { FolderNotePath, NoteLoc } from "../typings/api";

export default class NoteResolver {
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

  getFolderFromNote: API["getFolderFromNote"] = (note, strategy) => {
    if (!isMd(note)) return null;
    const folderPath = this.getFolderPath(note, false, strategy);
    if (!folderPath) return null;
    const folder = this.vault.getAbstractFileByPath(folderPath);
    if (folder && folder instanceof TFolder) return folder;
    else return null;
  };
  /**
   * Get path of given note/notePath's folder based on setting
   * @param note notePath or note TFile
   * @param newFolder if the path is used to create new folder
   * @returns folder path, will return null if note basename invaild and newFolder=false
   */
  getFolderPath: API["getFolderPath"] = (
    note,
    newFolder = false,
    strategy?: NoteLoc,
  ) => {
    if (strategy === undefined) strategy = this.settings.folderNotePref;
    if (!isMd(note)) {
      log.info("getFolderPath(%o): given file not markdown", note);
      return null;
    }
    let parent: string, base: string;
    if (note instanceof TFile) {
      base = note.basename;
      parent = getParentPath(note.path) ?? "";
    } else {
      base = getBase(note).slice(0, -3); // remove ending ".md"
      parent = getParentPath(note) ?? "";
    }

    if (!parent) {
      log.info("getFolderPath(%o): no folder note for root dir", note);
      return null;
    }

    const getSiblingFolder = () => {
      if (parent === "/") return base;
      else return join(parent, base);
    };
    switch (strategy) {
      case NoteLoc.Index:
        if (newFolder) return getSiblingFolder();
        else if (base === this.settings.indexName) return parent;
        else {
          log.info("getFolderPath(%o): note name invaild", note);
          return null;
        }
      case NoteLoc.Inside:
        if (newFolder) return getSiblingFolder();
        else if (base === getBase(parent)) return parent;
        else {
          log.info("getFolderPath(%o): note name invaild", note);
          return null;
        }
      case NoteLoc.Outside: {
        const dir = getSiblingFolder();
        if (newFolder || base === getBase(dir)) return dir;
        else {
          log.info("getFolderPath(%o): note name invaild", note);
          return null;
        }
      }
      default:
        assertNever(strategy);
    }
  };

  // Get Folder Note from Folder
  getFolderNote: API["getFolderNote"] = (folder, strategy) =>
    this.findFolderNote(this.getFolderNotePath(folder, strategy));
  findFolderNote = (info: FolderNotePath | null): TFile | null => {
    if (!info) return null;

    const note = this.vault.getAbstractFileByPath(info.path);
    if (note && note instanceof TFile) return note;
    else return null;
  };
  getFolderNotePath: API["getFolderNotePath"] = (folder, strategy) => {
    if (strategy === undefined) strategy = this.settings.folderNotePref;

    const dirPath = typeof folder === "string" ? folder : folder.path,
      parent = getParentPath(dirPath);
    if (!parent) {
      // is root folder
      return null;
    }

    const { indexName } = this.settings;

    let dir: string, basename: string;
    switch (strategy) {
      case NoteLoc.Index:
        basename = indexName;
        dir = dirPath;
        break;
      case NoteLoc.Inside:
        basename = getBase(dirPath);
        dir = dirPath;
        break;
      case NoteLoc.Outside:
        basename = getBase(dirPath);
        dir = parent;
        break;
      default:
        assertNever(strategy);
    }

    return {
      dir,
      name: basename + ".md",
      path: dir === "/" ? basename + ".md" : join(dir, basename + ".md"),
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

    if (file.parent) {
      const fnPath = this.getFolderNotePath(file.parent),
        shouldRun = fnPath && !this.getFolderNote(file.parent);
      if (shouldRun && !dryrun) {
        const { path } = fnPath;
        this.vault.rename(file, path);
      }
      return !!shouldRun;
    } else return false;
  };
  /**
   * @returns return false if file not folder note
   */
  DeleteNoteAndLinkedFolder: API["DeleteNoteAndLinkedFolder"] = (
    target,
    dryrun = false,
  ) => {
    let file: null | TFile, folder: null | TFolder;
    if (target instanceof TFile) {
      if (!isMd(target)) return false;
      file = target;
      folder = this.getFolderFromNote(target);
    } else {
      file = this.getFolderNote(target);
      folder = target;
    }

    if (file && folder && !dryrun) {
      new DeleteWarning(this.plugin, file, folder).open();
    }
    return !!(file && folder);
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
      folderExist = newFolderPath && (await this.vault.exists(newFolderPath));
    if (folderExist) {
      log.info(
        "createFolderForNote(%o): folder already exists",
        file,
        file.path,
      );
      if (!dryrun) new Notice("Folder already exists");
    } else if (!newFolderPath) {
      log.info(
        "createFolderForNote(%o): no vaild linked folder path for %s",
        file,
        file.path,
      );
      if (!dryrun) new Notice("No vaild linked folder path for: " + file.path);
    }

    if (!folderExist && newFolderPath && !dryrun) {
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
    return !!(!folderExist && newFolderPath);
  };

  // Folder Operations

  /**
   * @returns return false if folder note not exists
   */
  DeleteFolderNote: API["DeleteFolderNote"] = (
    folder: TFolder,
    dryrun = false,
  ): boolean => {
    const noteResult = this.getFolderNote(folder);
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
    let shouldRun, fnPath;
    if (
      (shouldRun =
        !this.getFolderNote(folder) &&
        (fnPath = this.getFolderNotePath(folder))) &&
      !dryrun
    ) {
      this.vault.create(fnPath.path, this.plugin.getNewFolderNote(folder));
    }
    return !!shouldRun;
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
