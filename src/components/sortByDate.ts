interface ContentEntry {
  data?: {
    pubDate?: Date | string;
    ongoing?: boolean;
  };
}

export const sortByDate = (a: ContentEntry, b: ContentEntry): number => {
  if (a.data?.ongoing !== b.data?.ongoing) {
    return a.data?.ongoing ? -1 : 1;
  }
  return (
    new Date(b?.data?.pubDate ?? 0).getTime() -
    new Date(a?.data?.pubDate ?? 0).getTime()
  );
};
