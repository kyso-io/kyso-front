import { TailwindFontSizeEnum } from '@/tailwind/enum/tailwind-font-size.enum';
import { TailwindHeightSizeEnum } from '@/tailwind/enum/tailwind-height.enum';
import clsx from 'clsx';
import React, { useMemo, useState } from 'react';
import { v4 } from 'uuid';

interface Props {
  src: string;
  title: string;
  /* Tailwind width https://tailwindcss.com/docs/width */
  size?: TailwindHeightSizeEnum;
  textSize?: TailwindFontSizeEnum;
}

const PureAvatar = (props: Props) => {
  // Default size

  const [isLoaded, setIsLoaded] = useState(false);

  let size = TailwindHeightSizeEnum.H6;
  let textSize: TailwindFontSizeEnum = TailwindFontSizeEnum.XS;

  useMemo(() => {
    if (props.size) {
      size = props.size;
    }

    if (props.textSize) {
      textSize = props.textSize;
    }
  }, [props]);

  // Disabled eslint rule and not set to React.SyntheticEvent<HTMLImageElement, Event>
  // because the e.target.src is not present in the type, and we need to use it

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const processLoadingImageError = (displayName: string, e: any): any => {
    const imgDefault = `https://ui-avatars.com/api/?name=${displayName.toUpperCase().split(' ').join('').slice(0, 2)}`;
    e.target.src = imgDefault;
    setIsLoaded(true);
  };

  return (
    <>
      {props.src && (
        <img
          key={v4()}
          onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
            setIsLoaded(false);
            processLoadingImageError(props.title, e);
          }}
          onLoad={() => {
            setIsLoaded(true);
          }}
          className={clsx(`object-cover inline-block h-${size} w-${size} rounded-full ring-2 ring-white hover:border transition duration-100`, isLoaded ? '' : 'invisible')}
          src={props.src}
          alt={props.title}
        />
      )}
      {!props.src && (
        // W-SIZE is a super-set of H-SIZE, so no problem there...
        <span className={`inline-flex items-center justify-center h-${size} w-${size} rounded-full bg-gray-200 hover:scale-150 transition duration-100`}>
          <span className={`text-${textSize} font-medium leading-none text-gray-500`}>{props.title?.toUpperCase().split(' ').join('').slice(0, 2)}</span>
        </span>
      )}
    </>
  );
};

export default PureAvatar;
