import assertNever from "assert-never";
import { Modifier, TAbstractFile, TFile, TFolder } from "obsidian";
import { dirname, extname, join } from "path";

export const isMd = (file: TFile | string) =>
  typeof file === "string" ? extname(file) === ".md" : file.extension === "md";

export const isMac = () => navigator.userAgent.includes("Macintosh");

export enum NoteLoc {
  Index,
  Inside,
  Outside,
}

export const isModifier = (evt: MouseEvent, pref: Modifier): boolean => {
  const { altKey, metaKey, ctrlKey, shiftKey } = evt;
  switch (pref) {
    case "Mod":
      return isMac() ? metaKey : ctrlKey;
    case "Ctrl":
      return ctrlKey;
    case "Meta":
      return metaKey;
    case "Shift":
      return shiftKey;
    case "Alt":
      return altKey;
    default:
      assertNever(pref);
  }
};

/**
 * @param newName include extension
 */
export const getRenamedPath = (af: TAbstractFile, newName: string) =>
  join(getParentPath(af.path), newName);

export const getParentPath = (src: string) => {
  const path = dirname(src);
  if (path === ".") return "/";
  else return path;
};

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
    console.error("unexpected TAbstractFile type", target);
    throw new Error("unexpected TAbstractFile type");
  }
};
