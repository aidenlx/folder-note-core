import "obsidian";

declare module "obsidian" {
  interface Vault {
    exists(normalizedPath: string, sensitive?: boolean): Promise<boolean>;
  }

  interface App {
    plugins: {
      enabledPlugins: Set<string>;
    };
  }
}
