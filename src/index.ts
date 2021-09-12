import "obsidian";

import { Plugin } from "obsidian";

import FolderNoteAPI, { FNCEvents, NoteLoc } from "./typings/api";
export { FNCEvents, FolderNoteAPI, NoteLoc };

// EVENTS

type OnArgs<T> = T extends [infer A, ...infer B]
  ? A extends string
    ? [name: A, callback: (...args: B) => any]
    : never
  : never;
type EventsOnArgs = OnArgs<FNCEvents>;

declare module "obsidian" {
  interface Vault {
    on(...args: EventsOnArgs): EventRef;
  }
}

// UTIL FUNCTIONS

export const getApi = (plugin?: Plugin): FolderNoteAPI | undefined => {
  if (plugin) return plugin.app.plugins.plugins["folder-note-core"]?.api;
  else return window["FolderNoteAPIv0"];
};

export const isPluginEnabled = (plugin: Plugin) =>
  plugin.app.plugins.enabledPlugins.has("folder-note-core");

export const registerApi = (
  plugin: Plugin,
  callback: (api: FolderNoteAPI) => void,
): FolderNoteAPI | undefined => {
  plugin.app.vault.on("folder-note:api-ready", callback);
  return getApi(plugin);
};
