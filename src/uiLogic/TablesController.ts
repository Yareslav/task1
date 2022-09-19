import { INote } from "../types/types";
import store, { categories } from "../store";
import query from "../utils/query";
import { disconnect } from "process";
import saveToStorage from "../utils/saveToStorage";
import FormController from "./FormController";

interface INodeData {
  key: string | null;
  noteDomElement: HTMLDivElement;
  noteIndex: number;
}
type WithNoteFromStore = INodeData & { note: INote };

class TablesController {
  readonly activeNotesTable = query(".active-notes-table", false)! as HTMLDivElement;
  readonly archivedNotesTable = query(".archived-notes-table", false)! as HTMLDivElement;
  readonly statisticsTable = query(".statistics-table", false)!.querySelector(".table__flow")!;

  readonly navigator = query(".navigator", false)!;
  readonly activeNotesNavigator = this.navigator.querySelector("[key=Main]")!;
  readonly archivedNotesNavigator = this.navigator.querySelector("[key=Archived]")!;

  initialize(): void {
    //! table rendering
    this.renderActiveNotesTable();
    this.renderArchivedNotesTable();
    this.renderStatisticsTable();

    this.activeNotesNavigator.addEventListener("click", this.showAnotherTable.bind(this, "Main"));
    this.archivedNotesNavigator.addEventListener("click", this.showAnotherTable.bind(this, "Archived"));
    this.archivedNotesTable.style.display = "none";

    query(".table__createNote", false)?.addEventListener(
      "click",
      () =>
        new FormController({
          isCreateMode: true,
          renderStatisticsTable: this.renderStatisticsTable.bind(this),
          renderTable: this.renderActiveNotesTable.bind(this),
        })
    );
  }

  showAnotherTable(type: "Main" | "Archived"): void {
    query(".navigator-selected", false)!.classList.remove("navigator-selected");

    if (type === "Main") {
      this.activeNotesNavigator.classList.add("navigator-selected");
      this.archivedNotesTable.style.display = "none";
      this.activeNotesTable.style.display = "flex";
    } else {
      this.archivedNotesNavigator.classList.add("navigator-selected");
      this.activeNotesTable.style.display = "none";
      this.archivedNotesTable.style.display = "flex";
    }
  }

  renderActiveNotesTable(): void {
    this.renderTable(this.activeNotesTable, "notes");
  }

  renderArchivedNotesTable(): void {
    this.renderTable(this.archivedNotesTable, "archivedNotes");
  }

  renderTable(table: HTMLDivElement, storeType: keyof typeof store): void {
    table.querySelector(".table__flow")!.innerHTML = ``;

    store[storeType].forEach((elem) => {
      table
        .querySelector(".table__flow")!
        .appendChild(this.getNoteDomElement(elem, storeType === "notes" ? "active" : "archived"));
    });

    this.setTablesListenners();
  }

  renderStatisticsTable(): void {
    this.statisticsTable.innerHTML = ``;

    categories.forEach((category) => {
      const div = document.createElement("div");
      div.classList.add("table__row");
      div.classList.add("statistics-grids");

      div.innerHTML = `
        <p>${category}</p>
        <p>${this.findNumberOfNotesByCategory(category, "notes")}</p>
        <p>${this.findNumberOfNotesByCategory(category, "archivedNotes")}</p>
      `;

      this.statisticsTable.appendChild(div);
    });
  }

  setTablesListenners(): void {
    const actions: Array<[string, (eve: Event) => void]> = [
      ["delete", this.deleteNote],
      ["edit", this.editNote],
      ["archive", this.archiveNote],
    ];

    actions.forEach(([name, fn]) => {
      query(`#${name}`, true).forEach((elem) => {
        const newElem = elem.cloneNode(true);

        newElem.addEventListener("click", fn.bind(this));
        elem.parentNode?.replaceChild(newElem, elem);
      });
    });
  }

  deleteNote(eve: Event): void {
    const { key, noteDomElement, noteIndex } = this.getNodeData(eve, false);

    if (!key || !window.confirm("Do you really want to delete this element ?")) return;

    const selectedNotesArray = store[noteDomElement.classList.contains("active") ? "notes" : "archivedNotes"];

    if (noteIndex >= 0) {
      selectedNotesArray.splice(noteIndex, 1);
      this.renderStatisticsTable();
      noteDomElement.remove();
      saveToStorage();
    }
  }

  editNote(eve: Event) {
    const { note, noteDomElement } = this.getNodeData(eve, true);
    const isNoteActive = noteDomElement.classList.contains("active");

    new FormController({
      isCreateMode: false,
      renderStatisticsTable: this.renderStatisticsTable.bind(this),
      note,
      renderTable: isNoteActive ? this.renderActiveNotesTable.bind(this) : this.renderArchivedNotesTable.bind(this),
      storeType: isNoteActive ? "notes" : "archivedNotes",
    });
  }

  archiveNote(eve: MouseEvent) {
    const { key, noteDomElement, noteIndex } = this.getNodeData(eve, false);

    if (!key) return;

    const isNodeArchived: boolean = noteDomElement.classList.contains("archived");
    const storeToMoveFrom: INote[] = isNodeArchived ? store["archivedNotes"] : store["notes"];
    const storeToMoveTo: INote[] = isNodeArchived ? store["notes"] : store["archivedNotes"];

    //! storage operations
    if (noteIndex < 0) return;
    storeToMoveTo.push(storeToMoveFrom.splice(noteIndex, 1)[0]);
    saveToStorage();

    //! dom operations
    noteDomElement.remove();
    noteDomElement.classList.remove(isNodeArchived ? "archived" : "active");
    noteDomElement.classList.add(isNodeArchived ? "active" : "archived");
    (isNodeArchived ? this.activeNotesTable : this.archivedNotesTable).appendChild(noteDomElement);

    this.renderStatisticsTable();
  }

  getNodeData(eve: Event, mustReturnNoteFromStore: true): WithNoteFromStore;
  getNodeData(eve: Event, mustReturnNoteFromStore: false): INodeData;

  getNodeData(eve: Event, mustReturnNoteFromStore: boolean): INodeData | WithNoteFromStore {
    const target = (eve as MouseEvent).target! as HTMLImageElement;
    const noteDomElement = target.parentNode! as HTMLDivElement;
    const key = noteDomElement.getAttribute("key");
    const noteStore = store[noteDomElement.classList.contains("active") ? "notes" : "archivedNotes"];

    const noteIndex = noteStore.findIndex((elem) => elem.id === key);

    const returnObj = {
      key,
      noteDomElement,
      noteIndex,
    };

    if (mustReturnNoteFromStore) {
      const note = noteStore.find((elem) => elem.id === key)!;
      return { ...returnObj, note };
    }
    return returnObj;
  }

  findNumberOfNotesByCategory(category: string, tableType: keyof typeof store): number {
    let total = 0;

    store[tableType].forEach((note) => {
      if (note.category === category) total++;
    });

    return total;
  }

  getNoteDomElement(note: INote, nameClass: string): Element {
    const div = document.createElement("div");
    div.classList.add(nameClass);
    div.classList.add("table__row");
    div.classList.add("notes-grid");

    div.setAttribute("key", note.id);

    div.innerHTML = `
			<div>
        <p>${note.name}</p>
      </div>
			<div>
        <p>${note.created}</p>
      </div>
			<div>
        <p>${note.category}</p>
      </div>
			<div>
        <p class="table__textOverlap">${note.content}</p>
      </div>
			<div>
        <p>${note.dates || "No"}</p>
			</div>
			<img src="../images/delete.png" id="delete"/>
      <img src="../images/draw.png" id="edit"/>
      <img src="../images/archive.png" id="archive"/>
		`;

    return div;
  }
}

export default new TablesController();
