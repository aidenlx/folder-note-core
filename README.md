# Folder Note Core

Provide core features and API for [folder notes](https://github.com/aidenlx/alx-folder-note).

- [create folder note](https://github.com/aidenlx/alx-folder-note/wiki/create-folder-note) easily, with [multiple preferences](https://github.com/aidenlx/alx-folder-note/wiki/folder-note-pref) and [template support](https://github.com/aidenlx/alx-folder-note/wiki/core-settings#template)
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
2. import the api (add `import { getApi, isPluginEnabled, registerApi } from "@aidenlx/folder-note-core"`)
3. use api
   1. check if enabled: `isPluginEnabled(YourPluginInstance)`
   2. access api: `getApi()` / `getApi(YourPluginInstance)`
   3. use api when it's ready: `registerApi(YourPluginInstance, (api)=>{// do something })`
   4. bind to events: `YourPluginInstance.registerEvent(YourPluginInstance.app.vault.on("folder-note:...",(...)=>{...}))`

## Compatibility

The required API feature is only available for Obsidian v0.12.5+.

## Installation

### From Obsidian

1. Open `Settings` > `Third-party plugin`
2. Make sure Safe mode is **off**
3. Click `Browse community plugins`
4. Search for this plugin
5. Click `Install`
6. Once installed, close the community plugins window and the patch is ready to use.

### From GitHub

1. Download the Latest Release from the Releases section of the GitHub Repository
2. Put files to your vault's plugins folder: `<vault>/.obsidian/plugins/folder-note-core`
3. Reload Obsidian
4. If prompted about Safe Mode, you can disable safe mode and enable the plugin.
   Otherwise, head to Settings, third-party plugins, make sure safe mode is off and
   enable the plugin from there.

> Note: The `.obsidian` folder may be hidden. On macOS, you should be able to press `Command+Shift+Dot` to show the folder in Finder.
