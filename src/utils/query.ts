function query(selector: string, isPluralPossible: true): Element[];
function query(selector: string, isPluralPossible: false): Element | null;

function query(selector: string, isPluralPossible: boolean): Element | Element[] | null {
  const domElements = Array.from(document.querySelectorAll(selector));
  if (isPluralPossible) return [...domElements];
  if (domElements.length === 0) return null;
  return domElements[0];
}

export default query;
