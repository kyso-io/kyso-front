import React from 'react';
import hljs from 'highlight.js';

export type Props = {
  code: string | Buffer | undefined;
  embedded?: boolean;
};

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

const RenderCode = (props: Props) => {
  const { embedded = true, code } = props;
  if (!code) {
    return <p>Invalid properties</p>;
  }

  const highlightedCode = hljs.highlightAuto(code.toString()).value;

  return (
    <div
      className={classNames('flex flex-col w-full whitespace-pre w-full overflow-x-scroll my-2', embedded ? 'bg-gray-100 px-0 border-y py-2' : '')}
      style={{
        overflowX: 'auto',
      }}
    >
      {highlightedCode?.split('\n').map((line: string, index: number) => (
        <div key={`cd-cell${index}`} className="flex flex-row items-center space-x-4 not-prose">
          <code className="text-gray-500 text-xs whitespace-pre text-right border-r px-2 w-8">{index + 1}</code>
          <code
            className="text-xs not-prose whitespace-pre"
            style={{
              whiteSpace: 'pre',
            }}
            dangerouslySetInnerHTML={{ __html: line }}
          />
        </div>
      ))}
    </div>
  );
};

export default RenderCode;
