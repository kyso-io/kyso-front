export const getSessionStorageItem = (key: string): string | null => {
  return typeof window !== 'undefined' ? sessionStorage.getItem(key) : null;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const setSessionStorageItem = (key: string, value: any): void | null => {
  return typeof window !== 'undefined' ? sessionStorage.setItem(key, value) : null;
};

export const removeSessionStorageItem = (key: string): void | null => {
  return typeof window !== 'undefined' ? sessionStorage.removeItem(key) : null;
};
