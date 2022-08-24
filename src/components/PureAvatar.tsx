import { TailwindFontSizeEnum } from '@/tailwind/enum/tailwind-font-size.enum';
import { TailwindHeightSizeEnum } from '@/tailwind/enum/tailwind-height.enum';
import clsx from 'clsx';
import React, { useMemo, useState } from 'react';

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
  const [isError, setIsError] = useState(false);

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

  return (
    <>
      {props.src && !isError && (
        <img
          key={props.title}
          onError={() => {
            setIsError(true);
          }}
          onLoad={() => {
            setIsLoaded(true);
          }}
          className={clsx(`object-cover inline-block h-${size} w-${size} rounded-full ring-0 border transition duration-100`, isLoaded ? '' : 'invisible')}
          src={props.src}
          alt={props.title}
        />
      )}
      {props.src && isError && <div className={`bg-white text-gray-600 flex items-center justify-center text-xs h-${size} w-${size} rounded-full border`}>{props.title.slice(0, 2).toUpperCase()}</div>}
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
