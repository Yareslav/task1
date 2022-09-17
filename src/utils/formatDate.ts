const formatDate = (date: Date): string => {
  return Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(date);
};

export default formatDate;
