# Folder Note Core

Provide core features and API for folder notes.

- [create folder note](https://github.com/aidenlx/alx-folder-note/wiki/create-folder-note) easily, with [mulitple preferences](https://github.com/aidenlx/alx-folder-note/wiki/folder-note-pref) and [template support](https://github.com/aidenlx/alx-folder-note/wiki/core-settings#template)
- folder and folder note working as one
  - [folder and linked note synced as one](https://github.com/aidenlx/alx-folder-note/wiki/core-settings#auto-rename): change folder name from folder note; folder note moves with your folder
  - [delete folder within folder note](https://github.com/aidenlx/alx-folder-note/wiki/delete-folder-from-folder-note)

## How to use

### For users

This plugin aimed to provide the following basic features for folder note:

- commands and options in context menu for delete/create folder note
- sync folder and folder note names and location

For advanced feature such as file explorer patches and folder overviews, install this plugin with [alx-folder-note v0.11.0+](https://github.com/aidenlx/alx-folder-note)

### For developers

1. run `npm i -D @aidenlx/folder-note-core` in your plugin dir
2. create a new file named `types.d.ts` under the same dir as `main.ts`
3. copy the following code into new file, then you can
   1. check if enabled: `plugin.app.enabledPlugins.has("folder-note-core")`
   2. access api: `plugin.app.plugins.["folder-note-core"]?.api`
   3. bind to dataview events: `plugin.registerEvent(plugin.app.vault.on("folder-note:...",(...)=>{...}))`

```ts
import "obsidian";

import FolderNoteAPI from "@aidenlx/folder-note-core";

declare module "obsidian" {
  interface Vault {
    on(
      name: "folder-note:create",
      callback: (note: TFile, folder: TFolder) => any,
    ): EventRef;
    on(
      name: "folder-note:rename",
      callback: (
        note: [file: TFile, oldPath: string],
        folder: [folder: TFolder, oldPath: string],
      ) => any,
    ): EventRef;
    on(
      name: "folder-note:delete",
      callback: (note: TFile, folder: TFolder) => any,
    ): EventRef;
    on(name: "folder-note:cfg-changed", callback: () => any): EventRef;
  }
  interface App {
    plugins: {
      enabledPlugins: Set<string>;
      plugins: {
        [id: string]: any;
        ["folder-note-core"]?: {
          api: FolderNoteAPI;
        };
      };
    };
  }
}
```

## Compatibility

The required API feature is only available for Obsidian v0.12.5+.

## Installation

### From GitHub

1. Download the Latest Release from the Releases section of the GitHub Repository
2. Put files to your vault's plugins folder: `<vault>/.obsidian/plugins/folder-note-core`
3. Reload Obsidian
4. If prompted about Safe Mode, you can disable safe mode and enable the plugin.
   Otherwise, head to Settings, third-party plugins, make sure safe mode is off and
   enable the plugin from there.

> Note: The `.obsidian` folder may be hidden. On macOS, you should be able to press `Command+Shift+Dot` to show the folder in Finder.

### From Obsidian

> Not yet available

1. Open `Settings` > `Third-party plugin`
2. Make sure Safe mode is **off**
3. Click `Browse community plugins`
4. Search for this plugin
5. Click `Install`
6. Once installed, close the community plugins window and the patch is ready to use.
