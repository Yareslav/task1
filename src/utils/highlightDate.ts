const highlightDate = (content: string): string => {
  const matches = [...content.matchAll(/\d{1,2}\/\d{1,2}\/\d{4}/gi)];
  if (matches.length === 0) return "";
  return matches.join(" , ");
};

export default highlightDate;
