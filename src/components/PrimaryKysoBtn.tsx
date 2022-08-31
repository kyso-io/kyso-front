import type { ReactNode } from 'react';
import React from 'react';

type IPurePrimaryKysoBtn = {
  children: ReactNode;
  padding?: string;
  dangerous?: boolean;
  secundary?: boolean;
  terciary?: boolean;
  onClick: () => void;
  extraCss?: string;
  textSize?: string;
};

const PurePrimaryKysoBtn = (props: IPurePrimaryKysoBtn) => {
  const { children, dangerous, secundary, terciary, onClick = () => {}, padding, extraCss, textSize } = props;

  let css = 'shadow-sm text-white bg-kyso-600 hover:bg-kyso-700 focus:ring-indigo-900r focus:ring-offset-2';
  if (secundary) {
    css = 'text-gray-500 border border-gray-500 bg-white hover:bg-gray-100';
  }
  if (terciary) {
    css = 'text-gray-500 bg-white hover:bg-gray-100';
  }
  if (dangerous) {
    css = 'text-rose-700 bg-white hover:bg-gray-100';
  }

  let defaultPadding = 'px-2 py-1';
  if (padding) {
    defaultPadding = padding;
  }
  let defaultTextSize = 'text-sm font-small';
  if (textSize) {
    defaultTextSize = textSize;
  }

  return (
    <button
      type="button"
      className={`
      rounded-md
      inline-flex
      focus:outline-none
      focus:ring-0 
      border
      border-transparent
      ${defaultPadding}
      ${defaultTextSize}
      ${css}
      ${extraCss}
      `}
      onClick={() => {
        onClick();
      }}
    >
      {children}
    </button>
  );
};

export default PurePrimaryKysoBtn;
