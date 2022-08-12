import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import '@fortawesome/fontawesome-svg-core/styles.css';
import { Tooltip } from 'flowbite-react';
import type { IconProp } from '@fortawesome/fontawesome-svg-core';
import type { ElementType } from 'react';

type IUnPureToolBarButton = {
  action: () => void;
  content: string;
  RenderFontawesomeIcon?: IconProp;
  TailwindIcon?: ElementType;
};

const UnPureToolBarButton = (props: IUnPureToolBarButton) => {
  const { action = () => {}, content, RenderFontawesomeIcon, TailwindIcon } = props;

  return (
    <div className="flex space-x-2 justify-center flex-wrap">
      <Tooltip content={content} style="dark">
        <button
          data-tooltip-target={content}
          type="button"
          aria-describedby={content}
          className="-ml-px relative inline-flex items-center px-3 py-2 rounded mr-1 border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          onClick={action}
        >
          {RenderFontawesomeIcon && <FontAwesomeIcon icon={RenderFontawesomeIcon} color="#9ca3af" />}
          {TailwindIcon && <TailwindIcon className="-m-1 h-5 w-5 text-gray-400" aria-hidden="true" />}
        </button>
      </Tooltip>
    </div>
  );
};

export default UnPureToolBarButton;
