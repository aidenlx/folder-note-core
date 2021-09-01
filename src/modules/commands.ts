import { MarkdownView, Menu, TFile, TFolder } from "obsidian";

import FNCore from "../fnc-main";

/** Add Make doc folder note and delete linked folder command */
export const AddOptionsForNote = (plugin: FNCore) => {
  const {
    createFolderForNote,
    LinkToParentFolder,
    DeleteLinkedFolder,
    DeleteNoteAndLinkedFolder,
    getFolderFromNote,
  } = plugin.finder;

  plugin.addCommand({
    id: "make-doc-folder-note",
    name: "Make current document folder note",
    checkCallback: (checking) => {
      const view = plugin.app.workspace.activeLeaf?.view as MarkdownView;
      if (checking) {
        return view instanceof MarkdownView;
      } else {
        createFolderForNote(view.file);
      }
    },
    hotkeys: [],
  });
  plugin.addCommand({
    id: "link-to-parent-folder",
    name: "Link to Parent Folder",
    checkCallback: (checking) => {
      const view = plugin.app.workspace.activeLeaf?.view as MarkdownView;
      return LinkToParentFolder(view.file, checking);
    },
    hotkeys: [],
  });
  plugin.addCommand({
    id: "delete-linked-folder",
    name: "Delete linked folder",
    checkCallback: (checking) => {
      const view = plugin.app.workspace.activeLeaf?.view as MarkdownView;
      if (view instanceof MarkdownView) {
        return DeleteLinkedFolder(view.file, checking);
      } else return false;
    },
    hotkeys: [],
  });
  plugin.addCommand({
    id: "delete-with-linked-folder",
    name: "Delete note and linked folder",
    checkCallback: (checking) => {
      const view = plugin.app.workspace.activeLeaf?.view as MarkdownView;
      if (view instanceof MarkdownView) {
        return DeleteNoteAndLinkedFolder(view.file, checking);
      } else return false;
    },
    hotkeys: [],
  });
  plugin.registerEvent(
    plugin.app.workspace.on("file-menu", (menu, af, source) => {
      if (
        (source === "file-explorer-context-menu" ||
          source === "pane-more-options" ||
          source === "link-context-menu") &&
        af instanceof TFile &&
        af.extension === "md"
      ) {
        if (LinkToParentFolder(af, true)) {
          menu.addItem((item) =>
            item
              .setIcon("link")
              .setTitle("Link to Parent Folder")
              .onClick(() => LinkToParentFolder(af)),
          );
        }
        if (createFolderForNote(af, true)) {
          menu.addItem((item) =>
            item
              .setIcon("create-new")
              .setTitle("Make Doc Folder Note")
              .onClick(() => {
                createFolderForNote(af);
                if (source === "link-context-menu")
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
  const { DeleteFolderNote, CreateFolderNote } = plugin.finder;
  plugin.registerEvent(
    plugin.app.workspace.on("file-menu", (menu, af, source) => {
      if (source === "file-explorer-context-menu" && af instanceof TFolder) {
        if (DeleteFolderNote(af, true))
          menu.addItem((item) =>
            item
              .setIcon("trash")
              .setTitle("Delete Folder Note")
              .onClick(() => DeleteFolderNote(af)),
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
