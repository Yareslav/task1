const highlightDate = (content: string): string => {
  const matches = [...Array.from(content.matchAll(/\b([1-9]|[1-2][0-9]|3[0-1])\/([1-9]|[1][0-2])\/[1-9]\d{3}\b/gi))];
  if (matches.length === 0) return "";
  //! get rid of trash
  return matches.map((array) => array[0]).join(" , ");
};

export default highlightDate;
