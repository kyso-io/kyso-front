import type { TailwindFontSizeEnum } from '@/tailwind/enum/tailwind-font-size.enum';
import type { TailwindHeightSizeEnum } from '@/tailwind/enum/tailwind-height.enum';
import clsx from 'clsx';
import React, { useState } from 'react';

interface Props {
  src: string;
  title: string;
  /* Tailwind width https://tailwindcss.com/docs/width */
  size: TailwindHeightSizeEnum;
  textSize: TailwindFontSizeEnum;
}

const getInitials = (str: string) => {
  if (!str) {
    return '';
  }
  return str
    .split(' ')
    .map((name: string) => name[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
};

const PureAvatar = (props: Props) => {
  // Default size
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);

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
          className={clsx(`object-cover inline-block text-${props.textSize} h-${props.size} w-${props.size} rounded-full ring-0 border transition duration-100`, isLoaded ? '' : 'invisible')}
          src={props.src}
          alt={props.title}
        />
      )}
      {props.src && isError && (
        <div className={`bg-white text-gray-600 flex items-center justify-center text-${props.textSize} h-${props.size} w-${props.size} rounded-full border`}>{getInitials(props.title)}</div>
      )}
      {!props.src && (
        // W-SIZE is a super-set of H-SIZE, so no problem there...
        <span className={`inline-flex items-center justify-center h-${props.size} w-${props.size} rounded-full bg-gray-200 hover:scale-110 transition duration-100`}>
          <span className={`text-${props.textSize} font-medium leading-none text-gray-500`}>{getInitials(props.title)}</span>
        </span>
      )}
    </>
  );
};

export default PureAvatar;
