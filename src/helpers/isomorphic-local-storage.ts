export const getLocalStorageItem = (key: string): string | null => {
  return typeof window !== 'undefined' ? localStorage.getItem(key) : null;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const setLocalStorageItem = (key: string, value: any): void | null => {
  return typeof window !== 'undefined' ? localStorage.setItem(key, value) : null;
};

export const removeLocalStorageItem = (key: string): void | null => {
  return typeof window !== 'undefined' ? localStorage.removeItem(key) : null;
};
