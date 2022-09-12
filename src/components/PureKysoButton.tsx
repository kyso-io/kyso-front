import type { KysoButton } from '@/types/kyso-button.enum';
import type { ReactNode } from 'react';
import React from 'react';

type IPureKysoButton = {
  children: ReactNode;
  disabled?: boolean;
  type: KysoButton;
  onClick: () => void;
  className?: string;
};

const PureKysoButton = (props: IPureKysoButton) => {
  const { children, onClick = () => {} } = props;

  return (
    <button
      disabled={props.disabled}
      type="button"
      className={`
        px-2 py-1
        text-sm font-small
        rounded-md
        inline-flex
        focus:outline-none
        focus:ring-0 
        border
        border-transparent
        ${props.type}
        ${props.className}
      `}
      onClick={() => {
        onClick();
      }}
    >
      {children}
    </button>
  );
};

export default PureKysoButton;
