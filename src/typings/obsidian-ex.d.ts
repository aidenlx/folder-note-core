import "obsidian";

import FolderNoteAPI from "./api";

declare module "obsidian" {
  interface Vault {
    exists(normalizedPath: string, sensitive?: boolean): Promise<boolean>;
    getConfig(key: string): any;
  }

  interface App {
    plugins: {
      enabledPlugins: Set<string>;
      plugins: {
        ["folder-note-core"]?: {
          api: FolderNoteAPI;
        };
      };
    };
  }
}
