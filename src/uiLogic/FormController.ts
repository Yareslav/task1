import { INote } from "./../types/types";
import query from "../utils/query";
import store from "./../store/index";
import formatDate from "../utils/formatDate";
import { categories } from "./../store/index";
import highlightDate from "../utils/highlightDate";
import generateKey from "../utils/generateKey";
import saveToStorage from "../utils/saveToStorage";

interface IBaseConfig {
  renderStatisticsTable: () => void;
  renderTable: () => void;
}
interface ICreateModeConfig extends IBaseConfig {
  isCreateMode: true;
}
interface IEditModeConfig extends IBaseConfig {
  isCreateMode: false;
  note: INote;
  storeType: keyof typeof store;
}

class FormController {
  form: HTMLFormElement | null = null;

  isCreateMode: boolean = false;
  renderStatisticsTable: IBaseConfig["renderStatisticsTable"] = () => {};
  storeType: IEditModeConfig["storeType"] = "notes";
  note: INote | null = null;
  renderTable: IBaseConfig["renderTable"] = () => {};

  constructor({ renderStatisticsTable, renderTable, ...props }: IEditModeConfig | ICreateModeConfig) {
    this.renderStatisticsTable = renderStatisticsTable;
    this.renderTable = renderTable;
    this.isCreateMode = props.isCreateMode;

    if (!props.isCreateMode) {
      this.storeType = props.storeType;
      this.note = props.note;
      this.show(this.note);
    } else {
      this.show(false);
    }
  }

  show(editData: false | INote) {
    const formContainer = document.createElement("div");
    formContainer.classList.add("form");
    formContainer.classList.add("center");

    const getIsSelected = (value: string): string =>
      value === (editData ? editData.category : categories[0]) ? "selected" : "";

    formContainer.innerHTML = `
		<form class="beet2">
			<h2>${editData ? "Edit Note" : "create Note"}</h2>

			<div class="form__block">
				<label>Name</label>
				<input type="text" id="name-input" value="${editData ? editData.name : ``}" />
			</div>

			<div class="form__block">
				<label>Content</label>
				<textarea id="content-input">${editData ? editData.content : ``}</textarea>
			</div>

			<div class="form__block">
				<label>Category</label>
				<select id="category-input">
					${categories.reduce((curr, next) => curr + `<option value="${next}" ${getIsSelected(next)}>${next}</option>`, "")}
				</select>
			</div>
			<div class="form__controls beet">
				<button id="submit">Submit</button>
				<button id="cancel">Cancel</button>
			</div>
		</form>
		`;

    document.body.appendChild(formContainer);

    this.setFormListenners();
  }

  private setFormListenners(): void {
    query("#submit", false)?.addEventListener("click", this.submit.bind(this));
    query("#cancel", false)?.addEventListener("click", this.cancel.bind(this));
    query("form", false)?.addEventListener("click", (eve) => {
      eve.preventDefault();
      eve.stopPropagation();
    });

    this.form = query("form", false) as HTMLFormElement;
  }

  private cancel(): void {
    this.form!.parentElement!.remove();
  }

  private submit(): void {
    const name = (query("#name-input", false) as HTMLInputElement).value;
    const content = (query("#content-input", false) as HTMLTextAreaElement).value;
    const category = (query("#category-input", false) as HTMLSelectElement).value;

    if (name.length < 4 || content.length < 4) {
      alert("Invalid input");
      return;
    }

    if (this.isCreateMode) {
      const note: INote = {
        name,
        content,
        category,
        created: formatDate(new Date()),
        id: generateKey(),
        dates: highlightDate(content),
      };

      store[this.storeType].push(note);
    } else {
      const note = this.note!;

      note.content = content;
      note.dates = highlightDate(content);
      note.name = name;
      note.category = category;
    }

    saveToStorage();
    this.renderTable();
    this.renderStatisticsTable();
    this.form!.parentElement?.remove();
  }
}

export default FormController;
