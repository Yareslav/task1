import generateKey from "../utils/generateKey";
import { INote } from "../types/types";
import formatDate from "../utils/formatDate";

const notes: Omit<INote, "id" | "created">[] = [
  {
    name: "Go shopping",
    category: "Task",
    content: "Buy some bread , cola , milk",
    dates: "12/5/2022",
  },
  {
    name: "Walking a dog on the moon",
    category: "Random Thought",
    dates: "",
    content: "Is it possible to walk the dog on the 12th of March",
  },
  {
    name: "Feature for photo-editor",
    category: "Idea",
    dates: "18/04/2012",
    content: "gotta add image crop",
  },
  {
    name: "Wiiliam the God",
    category: "Quote",
    dates: "",
    content: "Power wonn`t make you happy",
  },
  {
    name: "Books",
    category: "Task",
    dates: "12/12/2022 , 16/12/2022",
    content: "The aim is to buy m more than 43 books",
  },
  {
    name: "Singing",
    category: "Idea",
    dates: "",
    content: "Sing at least 3 songs about war",
  },
  {
    name: "Go to paradise",
    dates: "12/12/2100",
    category: "Random Thought",
    content: "Hoppfully I won`t die soon",
  },
];

export default notes.map((elem) => ({ ...elem, id: generateKey(), created: formatDate(new Date()) }));
