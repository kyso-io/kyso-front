/* eslint-disable @typescript-eslint/no-explicit-any */
import type { TailwindFontSizeEnum } from '@/tailwind/enum/tailwind-font-size.enum';
import type { TailwindHeightSizeEnum } from '@/tailwind/enum/tailwind-height.enum';
import clsx from 'clsx';
import React, { useState } from 'react';
import { Tooltip } from 'primereact/tooltip';

interface Props {
  src: string;
  title: string;
  /* Tailwind width https://tailwindcss.com/docs/width */
  size: TailwindHeightSizeEnum;
  textSize: TailwindFontSizeEnum;
  className?: string;
  tooltip?: boolean;
  username?: string;
  style?: any;
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
  const { tooltip } = props;

  return (
    <>
      {tooltip && <Tooltip target=".avatar-tooltip" />}
      {props.src && !isError && props.username && (
        <a href={`/user/${props.username}`}>
          <img
            key={props.title}
            onError={() => {
              setIsError(true);
            }}
            onLoad={() => {
              setIsLoaded(true);
            }}
            className={clsx(
              `avatar-tooltip object-cover inline-block text-${props.textSize} h-${props.size} w-${props.size} rounded-full ring-0 border transition duration-100 ${props.className}`,
              isLoaded ? '' : 'invisible',
            )}
            style={props.style}
            src={props.src}
            alt={props.title}
            data-pr-tooltip={props.title}
            data-pr-position="bottom"
          />
        </a>
      )}
      {props.src && !isError && !props.username && (
        <img
          key={props.title}
          onError={() => {
            setIsError(true);
          }}
          onLoad={() => {
            setIsLoaded(true);
          }}
          className={clsx(
            `avatar-tooltip object-cover inline-block text-${props.textSize} h-${props.size} w-${props.size} rounded-full ring-0 border transition duration-100 ${props.className}`,
            isLoaded ? '' : 'invisible',
          )}
          style={props.style}
          src={props.src}
          alt={props.title}
          data-pr-tooltip={props.title}
          data-pr-position="bottom"
        />
      )}

      {props.src && isError && props.username && (
        <a href={`/user/${props.username}`}>
          <div
            className={`avatar-tooltip bg-white text-gray-600 flex items-center justify-center text-${props.textSize} h-${props.size} w-${props.size} rounded-full border ${props.className}`}
            style={props.style}
            data-pr-tooltip={props.title}
            data-pr-position="bottom"
          >
            {getInitials(props.title)}
          </div>
        </a>
      )}
      {props.src && isError && !props.username && (
        <div
          className={`avatar-tooltip bg-white text-gray-600 flex items-center justify-center text-${props.textSize} h-${props.size} w-${props.size} rounded-full border ${props.className}`}
          style={props.style}
          data-pr-tooltip={props.title}
          data-pr-position="bottom"
        >
          {getInitials(props.title)}
        </div>
      )}
      {!props.src && (
        // W-SIZE is a super-set of H-SIZE, so no problem there...
        <span
          className={`avatar-tooltip inline-flex items-center justify-center h-${props.size} w-${props.size} rounded-full bg-gray-200 hover:scale-110 transition duration-100 ${props.className}`}
          style={props.style}
          data-pr-tooltip={props.title}
          data-pr-position="bottom"
        >
          <span className={`text-${props.textSize} font-medium leading-none text-gray-500`}>{getInitials(props.title)}</span>
        </span>
      )}
    </>
  );
};

export default PureAvatar;
