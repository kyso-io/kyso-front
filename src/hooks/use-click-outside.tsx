/* eslint @typescript-eslint/no-explicit-any: "off" */
import { useEffect } from 'react';

export const useClickOutside = (ref: any, callback?: () => void) => {
  useEffect(() => {
    const handleClickOutside = (event: any): void => {
      if (ref.current && !ref.current.contains(event.target)) {
        if (callback) {
          callback();
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref]);
};
