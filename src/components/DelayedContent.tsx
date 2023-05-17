import type { ReactElement } from 'react';
import { useEffect, useState } from 'react';

type IDelayedContent = {
  /**
   * Delay in milliseconds
   */
  delay?: number;
  /**
   * Skeleton template to apply, if not provided, text skeleton is shown
   */
  skeletonTemplate?: ReactElement;
  children: ReactElement;
};

const DelayedContent = (props: IDelayedContent) => {
  let { delay } = props;
  const { children, skeletonTemplate } = props;
  const [showContent, setShowContent] = useState<boolean>(false);

  const linesSkeleton = () => {
    return (
      <div role="status" className="max-w-sm animate-pulse">
        <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-48 mb-4"></div>
        <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[360px] mb-2.5"></div>
        <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 mb-2.5"></div>
        <span className="sr-only">Loading...</span>
      </div>
    );
  };

  if (!delay) {
    delay = 1000;
  }

  useEffect(() => {
    setTimeout(() => {
      setShowContent(true);
    }, delay);
  }, [delay]);

  return (
    <>
      {!showContent && (
        <>
          {skeletonTemplate && <>{skeletonTemplate}</>}

          {!skeletonTemplate && <>{linesSkeleton()}</>}
        </>
      )}
      {showContent && <>{children}</>}
    </>
  );
};

export default DelayedContent;
