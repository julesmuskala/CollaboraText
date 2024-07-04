export const formatAccessLevel = (accessLevel: string) => {
  switch (accessLevel) {
    case "ONLY_OWNER":
      return "Only you can access";
    case "READONLY":
      return "Only owner can edit";
    case "ANYONE":
      return "Anyone can access";
    default:
      return accessLevel;
  }
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);

  if (new Date().setHours(0, 0, 0, 0) === new Date(date).setHours(0, 0, 0, 0)) {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  } else {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based
    const year = date.getFullYear();
    return `${year}/${month}/${day}`;
  }
};

export enum SortingOrder {
  ASCENDING = "ASC",
  DESCENDING = "DESC",
}

export enum DocSortingValues {
  NAME = "name",
  CREATED_AT = "created_at",
  UPDATED_AT = "updated_at",
}
