import { around } from "monkey-around";
import { MetadataCache } from "obsidian";
import type FNCore from "../fnc-main";
import { NoteLoc } from "../typings/api";

export const patchLinkResolverForFolder = (plugin: FNCore) => {
  plugin.register(
    around(MetadataCache.prototype, {
      getFirstLinkpathDest: (original) =>
        function (
          this: MetadataCache,
          linkpath: string,
          sourcePath: string,
          ...args
        ) {
          const result = original.call(this, linkpath, sourcePath, ...args);
          if (result) return result;
          try {
            const { folderNotePref, patchLinkResolverForFolder, indexName } =
              plugin.settings;
            if (
              !(
                patchLinkResolverForFolder &&
                (folderNotePref === NoteLoc.Inside ||
                  folderNotePref === NoteLoc.Index)
              )
            )
              return result;
            if (folderNotePref === NoteLoc.Index) {
              linkpath = linkpath + "/" + indexName;
            } else {
              linkpath = linkpath + "/" + linkpath.split("/").pop() || "";
            }
            return original.call(this, linkpath, sourcePath, ...args);
          } catch (error) {
            console.error("failed to resolve link to folder with note", error);
            return null;
          }
        },
    }),
  );
};
