import React from 'react';

interface Props {
  src: string;
  title: string;
  /* Tailwind width https://tailwindcss.com/docs/width */
  size: number;
}

const PureAvatar = (props: Props) => {
  return (
    <>
      {props.src && (
        <>
          <img className={`object-cover h-${props.size} w-${props.size} rounded-full`} src={props.src} alt={props.title} />
          <span className="absolute inset-0 shadow-inner rounded-full" aria-hidden="true" />
        </>
      )}
      {!props.src && (
        <span className={`inline-flex items-center justify-center h-${props.size} w-${props.size} rounded-full bg-gray-500`}>
          <span className="text-xl font-medium leading-none text-white">{props.title?.toUpperCase().split(' ').join('').slice(0, 2)}</span>
        </span>
      )}
    </>
  );
};

export default PureAvatar;
