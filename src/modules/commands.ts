import { MarkdownView, Menu, TFile, TFolder } from "obsidian";

import FNCore from "../fnc-main";
import { NoteLoc } from "../typings/api";

/** Add Make doc folder note and delete linked folder command */
export const AddOptionsForNote = (plugin: FNCore) => {
  const {
    createFolderForNote,
    createFolderForNoteCheck,
    LinkToParentFolder,
    DeleteLinkedFolder,
    DeleteNoteAndLinkedFolder,
  } = plugin.resolver;

  plugin.addCommand({
    id: "make-doc-folder-note",
    name: "Make current document folder note",
    checkCallback: (checking) => {
      const view = plugin.app.workspace.getActiveViewOfType(MarkdownView);
      if (checking) {
        return !!view && createFolderForNoteCheck(view.file);
      } else if (!!view) {
        createFolderForNote(view.file);
      }
    },
    hotkeys: [],
  });
  plugin.addCommand({
    id: "link-to-parent-folder",
    name: "Link to Parent Folder",
    checkCallback: (checking) => {
      const view = plugin.app.workspace.getActiveViewOfType(MarkdownView);
      return !!view && LinkToParentFolder(view.file, checking);
    },
    hotkeys: [],
  });
  plugin.addCommand({
    id: "delete-linked-folder",
    name: "Delete linked folder",
    checkCallback: (checking) => {
      const view = plugin.app.workspace.getActiveViewOfType(MarkdownView);
      return !!view && DeleteLinkedFolder(view.file, checking);
    },
    hotkeys: [],
  });
  plugin.addCommand({
    id: "delete-with-linked-folder",
    name: "Delete note and linked folder",
    checkCallback: (checking) => {
      const view = plugin.app.workspace.getActiveViewOfType(MarkdownView);
      return !!view && DeleteNoteAndLinkedFolder(view.file, checking);
    },
    hotkeys: [],
  });
  plugin.registerEvent(
    plugin.app.workspace.on("file-menu", async (menu, af, source) => {
      if (af instanceof TFile && af.extension === "md") {
        if (LinkToParentFolder(af, true)) {
          menu.addItem((item) =>
            item
              .setIcon("link")
              .setTitle("Link to Parent Folder")
              .onClick(() => LinkToParentFolder(af)),
          );
        }
        if (await createFolderForNote(af, true)) {
          menu.addItem((item) =>
            item
              .setIcon("create-new")
              .setTitle("Make Doc Folder Note")
              .onClick(() => {
                createFolderForNote(af);
                plugin.app.workspace.openLinkText(af.path, "", false);
              }),
          );
        }
        if (
          source !== "link-context-menu" &&
          DeleteNoteAndLinkedFolder(af, true)
        ) {
          menu.addItem((item) =>
            item
              .setIcon("trash")
              .setTitle("Delete Note and Linked Folder")
              .onClick(() => DeleteNoteAndLinkedFolder(af)),
          );
        }
      }
    }),
  );
};

export const AddOptionsForFolder = (plugin: FNCore) => {
  const {
    OpenFolderNote,
    DeleteFolderNote,
    CreateFolderNote,
    DeleteNoteAndLinkedFolder,
  } = plugin.resolver;
  plugin.registerEvent(
    plugin.app.workspace.on("file-menu", (menu, af, source) => {
      if (af instanceof TFolder) {
        if (OpenFolderNote(af, true)) {
          menu.addItem((item) =>
            item
              .setIcon("enter")
              .setTitle("Open Folder Note")
              .onClick(() => OpenFolderNote(af)),
          );
        }
        if (DeleteFolderNote(af, true)) {
          menu.addItem((item) =>
            item
              .setIcon("trash")
              .setTitle("Delete Folder Note")
              .onClick(() => DeleteFolderNote(af)),
          );
        }
        if (
          plugin.settings.folderNotePref === NoteLoc.Outside &&
          plugin.settings.deleteOutsideNoteWithFolder === false &&
          DeleteNoteAndLinkedFolder(af, true)
        )
          menu.addItem((item) =>
            item
              .setIcon("trash")
              .setTitle("Delete Folder and Folder Note")
              .onClick(() => DeleteNoteAndLinkedFolder(af)),
          );
        if (CreateFolderNote(af, true))
          menu.addItem((item) =>
            item
              .setIcon("create-new")
              .setTitle("Create Folder Note")
              .onClick(() => CreateFolderNote(af)),
          );
      }
    }),
  );
};
