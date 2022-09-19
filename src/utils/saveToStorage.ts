import store from "../store";

const saveToStorage = () => {
  localStorage.setItem("store", JSON.stringify(store));
};

export default saveToStorage;
