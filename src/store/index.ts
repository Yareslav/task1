import { INote } from "../types/types";
import notes from "./notes";

interface IStore {
  readonly notes: INote[];
  readonly archivedNotes: INote[];
}

const dataFromStorage: IStore | false = JSON.parse(localStorage.getItem("store") || "false");

let store: IStore = {} as IStore;

if (
  !dataFromStorage ||
  (dataFromStorage && dataFromStorage.notes.length === 0 && dataFromStorage.archivedNotes.length === 0)
) {
  store = {
    notes,
    archivedNotes: [],
  };
} else {
  store = dataFromStorage;
}

export const categories: Array<string> = ["Task", "Random Thought", "Idea", "Quote"];
export default store;
