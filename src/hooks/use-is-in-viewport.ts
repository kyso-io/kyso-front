/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint consistent-return: "off" */
import { useEffect, useMemo, useState } from 'react';

export default function useIsInViewport(ref: any) {
  const [isIntersecting, setIsIntersecting] = useState(false);

  const observer: any = useMemo(() => {
    if (typeof window !== 'undefined') {
      return new IntersectionObserver(([entry]) => setIsIntersecting(entry!.isIntersecting));
    }
    return null;
  }, []);

  useEffect(() => {
    if (!ref || !ref.current) {
      return;
    }
    observer.observe(ref.current);
    return () => {
      observer.disconnect();
    };
  }, [ref?.current, observer]);

  return isIntersecting;
}
