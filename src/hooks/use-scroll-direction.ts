/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';

export enum ScrollDirection {
  Up = 'up',
  Down = 'down',
}

export const useScrollDirection = () => {
  const threshold = 100;
  const [scrollDir, setScrollDir] = useState<ScrollDirection | null>(null);

  useEffect(() => {
    let previousScrollYPosition = window.scrollY;

    const scrolledMoreThanThreshold = (currentScrollYPosition: number) => Math.abs(currentScrollYPosition - previousScrollYPosition) > threshold;

    const isScrollingUp = (currentScrollYPosition: number) =>
      currentScrollYPosition > previousScrollYPosition && !(previousScrollYPosition > 0 && currentScrollYPosition === 0) && !(currentScrollYPosition > 0 && previousScrollYPosition === 0);

    const updateScrollDirection = () => {
      const currentScrollYPosition = window.scrollY;

      if (scrolledMoreThanThreshold(currentScrollYPosition)) {
        const newScrollDirection = isScrollingUp(currentScrollYPosition) ? ScrollDirection.Down : ScrollDirection.Up;
        setScrollDir(newScrollDirection);
        previousScrollYPosition = currentScrollYPosition > 0 ? currentScrollYPosition : 0;
      }
    };

    const onScroll = () => window.requestAnimationFrame(updateScrollDirection);

    window.addEventListener('scroll', onScroll);

    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return scrollDir;
};
