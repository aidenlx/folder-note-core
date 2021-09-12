import log from "loglevel";
import { TAbstractFile, TFile, TFolder } from "obsidian";
import { dirname, extname, join } from "path";

export const isMd = (file: TFile | string) =>
  typeof file === "string" ? extname(file) === ".md" : file.extension === "md";

/**
 * @param newName include extension
 * @returns null if given root dir
 */
export const getRenamedPath = (af: TAbstractFile, newName: string) => {
  const dir = getParentPath(af.path);
  return dir ? join(dir, newName) : dir;
};

export const getParentPath = (src: string): string | null => {
  // if root dir given
  if (src === "/") return null;

  const path = dirname(src);
  if (path === ".") return "/";
  else return path;
};

/** Opreation on TAbstractFile */
export const afOp = (
  target: TAbstractFile,
  fileOp: (file: TFile) => void,
  folderOp: (folder: TFolder) => void,
) => {
  if (target instanceof TFile) {
    fileOp(target);
  } else if (target instanceof TFolder) {
    folderOp(target);
  } else {
    log.error("unexpected TAbstractFile type", target);
    throw new Error("unexpected TAbstractFile type");
  }
};
