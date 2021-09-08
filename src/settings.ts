import { debounce, PluginSettingTab, Setting } from "obsidian";

import FNCore from "./fnc-main";
import { NoteLoc } from "./misc";

export interface FNCoreSettings {
  folderNotePref: NoteLoc;
  deleteOutsideNoteWithFolder: boolean;
  indexName: string;
  autoRename: boolean;
  folderNoteTemplate: string;
}

export const DEFAULT_SETTINGS: FNCoreSettings = {
  folderNotePref: NoteLoc.Inside,
  deleteOutsideNoteWithFolder: false,
  indexName: "_about_",
  autoRename: true,
  folderNoteTemplate: "# {{FOLDER_NAME}}",
};

export class FNCoreSettingTab extends PluginSettingTab {
  constructor(public plugin: FNCore) {
    super(plugin.app, plugin);
  }

  display(): void {
    let { containerEl } = this;
    containerEl.empty();
    this.renderCoreSettings(containerEl);
  }

  renderCoreSettings = (target: HTMLElement) => {
    this.setNoteLoc(target);
    if (this.plugin.settings.folderNotePref === NoteLoc.Index)
      this.setIndexName(target);
    else if (this.plugin.settings.folderNotePref === NoteLoc.Outside)
      this.setDeleteWithFolder(target);
    this.setTemplate(target);
    if (this.plugin.settings.folderNotePref !== NoteLoc.Index)
      this.setAutoRename(target);
  };

  setDeleteWithFolder = (containerEl: HTMLElement) => {
    new Setting(containerEl)
      .setName("Delete Outside Note with Folder")
      .setDesc(
        createFragment((el) => {
          el.appendText("Delete folder note outside when folder is deleted");
          el.createDiv({
            text: "Warning: The note will be deleted when the folder is moved outside of vault",
            cls: "mod-warning",
          });
        }),
      )
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.deleteOutsideNoteWithFolder)
          .onChange(async (value) => {
            this.plugin.settings.deleteOutsideNoteWithFolder = value;
            await this.plugin.saveSettings();
          }),
      );
  };
  setNoteLoc = (containerEl: HTMLElement) => {
    new Setting(containerEl)
      .setName("Preference for Note File Location")
      .setDesc(
        createFragment((el) => {
          el.appendText(
            "Select how you would like the folder note to be placed",
          );
          el.createEl("br");
          el.createEl("a", {
            href: "https://github.com/aidenlx/alx-folder-note/wiki/folder-note-pref",
            text: "Check here",
          });
          el.appendText(
            " for more detail for pros and cons for different strategies",
          );
        }),
      )
      .addDropdown((dropDown) => {
        const options: Record<NoteLoc, string> = {
          [NoteLoc.Index]: "Inside Folder, Index File",
          [NoteLoc.Inside]: "Inside Folder, With Same Name",
          [NoteLoc.Outside]: "Outside Folder, With Same Name",
        };

        dropDown
          .addOptions(options)
          .setValue(this.plugin.settings.folderNotePref.toString())
          .onChange(async (value: string) => {
            this.plugin.settings.folderNotePref = +value;
            this.plugin.trigger("folder-note:cfg-changed");
            await this.plugin.saveSettings();
            this.display();
          });
      });
  };
  setIndexName = (containerEl: HTMLElement) => {
    new Setting(containerEl)
      .setName("Name for Index File")
      .setDesc("Set the note name to be recognized as index file for folders")
      .addText((text) => {
        const onChange = async (value: string) => {
          this.plugin.settings.indexName = value;
          this.plugin.trigger("folder-note:cfg-changed");
          await this.plugin.saveSettings();
        };
        text
          .setValue(this.plugin.settings.indexName)
          .onChange(debounce(onChange, 500, true));
      });
  };
  setTemplate = (containerEl: HTMLElement) => {
    new Setting(containerEl)
      .setName("Folder Note Template")
      .setDesc(
        createFragment((descEl) => {
          descEl.appendText("The template used to generate new folder note.");
          descEl.appendChild(document.createElement("br"));
          descEl.appendText("Supported placeholders:");
          descEl.appendChild(document.createElement("br"));
          descEl.appendText("{{FOLDER_NAME}} {{FOLDER_PATH}}");
        }),
      )
      .addTextArea((text) => {
        const onChange = async (value: string) => {
          this.plugin.settings.folderNoteTemplate = value;
          await this.plugin.saveSettings();
        };
        text
          .setValue(this.plugin.settings.folderNoteTemplate)
          .onChange(debounce(onChange, 500, true));
        text.inputEl.rows = 8;
        text.inputEl.cols = 30;
      });
  };
  setAutoRename = (containerEl: HTMLElement) => {
    new Setting(containerEl)
      .setName("Auto Sync")
      .setDesc("Keep name and location of folder note and folder in sync")
      .addToggle((toggle) => {
        toggle.setValue(this.plugin.settings.autoRename);
        toggle.onChange(async (value) => {
          this.plugin.settings.autoRename = value;
          await this.plugin.saveSettings();
        });
      });
  };
}
