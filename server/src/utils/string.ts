export const truncateString = (str: string) => str.substring(0, 10) + (str.length > 10 ? "..." : "");
