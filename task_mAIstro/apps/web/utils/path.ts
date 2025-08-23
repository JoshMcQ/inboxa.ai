export const prefixPath = (emailAccountId: string, path: `/${string}`) => {
  if (emailAccountId) return `/app-layout/${emailAccountId}${path}`;
  return path;
};
