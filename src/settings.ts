import log, { LogLevel, LogLevelNumbers } from "loglevel";
import {
  ButtonComponent,
  debounce,
  DropdownComponent,
  Modal,
  Notice,
  PluginSettingTab,
  Setting,
  TextAreaComponent,
  TFile,
  TFolder,
} from "obsidian";

import FNCore from "./fnc-main";
import { FolderNotePath, NoteLoc } from "./typings/api";

export interface FNCoreSettings {
  folderNotePref: NoteLoc;
  deleteOutsideNoteWithFolder: boolean;
  indexName: string;
  autoRename: boolean;
  folderNoteTemplate: string;
  logLevel: LogLevelNumbers;
}

export const DEFAULT_SETTINGS: FNCoreSettings = {
  folderNotePref: NoteLoc.Inside,
  deleteOutsideNoteWithFolder: false,
  indexName: "_about_",
  autoRename: true,
  folderNoteTemplate: "# {{FOLDER_NAME}}",
  logLevel: 4,
};

const LocDescMap: Record<NoteLoc, string> = {
  [NoteLoc.Index]: "Inside Folder, Index File",
  [NoteLoc.Inside]: "Inside Folder, With Same Name",
  [NoteLoc.Outside]: "Outside Folder, With Same Name",
};

export class FNCoreSettingTab extends PluginSettingTab {
  constructor(public plugin: FNCore) {
    super(plugin.app, plugin);
  }

  display(): void {
    let { containerEl } = this;
    containerEl.empty();
    this.renderCoreSettings(containerEl);
    this.setLogLevel(containerEl);
  }

  renderCoreSettings = (target: HTMLElement) => {
    this.setStrategy(target);
    if (this.plugin.settings.folderNotePref === NoteLoc.Index)
      this.setIndexName(target);
    else if (this.plugin.settings.folderNotePref === NoteLoc.Outside)
      this.setDeleteWithFolder(target);
    this.setTemplate(target);
    if (this.plugin.settings.folderNotePref !== NoteLoc.Index)
      this.setAutoRename(target);
  };

  setLogLevel = (containerEl: HTMLElement) => {
    new Setting(containerEl)
      .setName("Log Level of folder-note-core")
      .setDesc("Change this options if debug is required")
      .addDropdown((dp) =>
        dp
          .then((dp) =>
            Object.entries(log.levels).forEach(([key, val]) =>
              dp.addOption(val.toString(), key),
            ),
          )
          .setValue(log.getLevel().toString())
          .onChange(async (val) => {
            const level = +val as LogLevelNumbers;
            log.setLevel(level);
            this.plugin.settings.logLevel = level;
            await this.plugin.saveSettings();
          }),
      );
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
  setStrategy = (containerEl: HTMLElement) => {
    new Setting(containerEl)
      .setName("Note File Storage Strategy")
      .setDesc(
        createFragment((el) => {
          el.appendText(
            "Select how you would like the folder note to be stored",
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
        dropDown
          .addOptions(LocDescMap)
          .setValue(this.plugin.settings.folderNotePref.toString())
          .onChange(async (value: string) => {
            this.plugin.settings.folderNotePref = +value;
            this.plugin.trigger("folder-note:cfg-changed");
            await this.plugin.saveSettings();
          });
      });
    new Setting(containerEl)
      .setName("Switch Strategy")
      .setDesc(
        createFragment((el) => {
          el.appendText(
            "Batch convert existing folder notes to use new storage strategy",
          );
          el.createDiv({
            text: "Warning: This function is experimental and dangerous, make sure to fully backup the vault before the conversion",
            cls: "mod-warning",
          });
        }),
      )
      .addButton((cb) =>
        cb
          .setTooltip("Open Dialog")
          .setIcon("popup-open")
          .setCta()
          .onClick(() => new SwitchStrategyDialog(this.plugin).open()),
      );
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

class SwitchStrategyDialog extends Modal {
  buttonContainerEl: HTMLDivElement;
  outputEl: TextAreaComponent;
  fromOptsEl: DropdownComponent;
  toOptsEl: DropdownComponent;

  constructor(public plugin: FNCore) {
    super(plugin.app);

    // Dropdowns
    this.fromOptsEl = new DropdownComponent(
      this.titleEl.createDiv({ text: "From:  " }),
    ).addOptions(LocDescMap);
    this.toOptsEl = new DropdownComponent(
      this.titleEl.createDiv({ text: "To:  " }),
    ).addOptions(LocDescMap);

    // Console output
    this.outputEl = new TextAreaComponent(this.contentEl)
      .setValue("Hello world")
      .setDisabled(true)
      .then((cb) => {
        cb.inputEl.style.width = "100%";
        cb.inputEl.rows = 10;
      });

    // Buttons
    this.buttonContainerEl = this.modalEl.createDiv({
      cls: "modal-button-container",
    });
    this.addButton((cb) =>
      cb.setButtonText("Check Conflicts").onClick(() => this.Convert(true)),
    );
    this.addButton((cb) =>
      cb
        .setButtonText("Convert")
        .setWarning()
        .onClick(() => this.Convert()),
    );
    this.addButton((cb) =>
      cb.setButtonText("Cancel").onClick(this.close.bind(this)),
    );
  }

  private addButton(cb: (component: ButtonComponent) => any): ButtonComponent {
    const button = new ButtonComponent(this.buttonContainerEl);
    cb(button);
    return button;
  }
  private log(message: string) {
    this.outputEl.setValue(this.outputEl.getValue() + "\n" + message);
  }
  private clear() {
    this.outputEl.setValue("");
  }

  Convert = async (dryrun = false): Promise<void> => {
    const { From, To } = this;
    this.clear();
    if (From === null || To === null) {
      new Notice("Please select the strategies to convert from/to first");
    } else if (From === To) {
      new Notice("Convert between same strategy, skipping...");
    } else {
      const { getFolderNote, getFolderNotePath } = this.plugin.finder;
      const folderNotes = this.app.vault
        .getAllLoadedFiles()
        .filter((af): af is TFolder => af instanceof TFolder && !af.isRoot())
        .map((folder): [note: TFile, newPath: FolderNotePath] | null => {
          const note = getFolderNote(folder, From),
            newPath = note ? getFolderNotePath(folder, To) : null;
          if (note && newPath) {
            return [note, newPath];
          } else {
            return null;
          }
        });
      let isConflict = false;
      for (const iterator of folderNotes) {
        if (!iterator) continue;
        const [src, newPath] = iterator;
        if (await this.app.vault.exists(newPath.path)) {
          isConflict || (isConflict = true);
          this.log(
            `Unable to move file ${src.path}: file exist in ${newPath.path}`,
          );
        } else if (!dryrun) {
          this.app.fileManager.renameFile(src, newPath.path);
        }
      }
      if (!isConflict) {
        if (dryrun) this.log("Check complete, no conflict found");
        else this.log("Batch convert complete");
      }
    }
  };

  get From() {
    const val = this.fromOptsEl.getValue();
    if (val && NoteLoc[+val]) return +val as NoteLoc;
    else return null;
  }
  get To() {
    const val = this.toOptsEl.getValue();
    if (val && NoteLoc[+val]) return +val as NoteLoc;
    else return null;
  }

  onOpen() {
    this.clear();
    const pref = this.plugin.settings.folderNotePref.toString();
    this.fromOptsEl.setValue(pref);
    this.toOptsEl.setValue(pref);
  }
}
