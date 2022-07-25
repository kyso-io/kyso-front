export const setLocalStorageItem = (key: string, value: string): void | null => {
  return typeof window !== 'undefined' ? localStorage.setItem(key, value) : null;
};
