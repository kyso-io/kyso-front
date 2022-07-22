export const getLocalStorageItem = (key: string): string | null => {
  return typeof window !== 'undefined' ? localStorage.getItem(key) : null;
};
