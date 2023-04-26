import { ChevronRightIcon } from '@heroicons/react/outline';
import type { TableOfContentEntryDto } from '@kyso-io/kyso-model';
import clsx from 'clsx';
import { useEffect, useState } from 'react';

interface PropsLineTableOfContents {
  toc: TableOfContentEntryDto[];
  deep: number;
  collapsible: boolean;
  openInNewTab: boolean;
}

const LineTableOfContents = ({ toc, collapsible, deep, openInNewTab }: PropsLineTableOfContents) => {
  const [collapsed, setCollapsed] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    const newCollapsed: { [key: number]: boolean } = {};
    toc.forEach((_: TableOfContentEntryDto, index) => {
      newCollapsed[index] = true;
    });
    setCollapsed(newCollapsed);
  }, []);

  return (
    <ul className={'my-1'} style={{ marginLeft: `${deep * 10}px` }}>
      {toc.map((entry: TableOfContentEntryDto, index: number) => (
        <li key={index}>
          <div className="flex items-center hover:animate-pulse">
            {((collapsible && (!entry.children || entry.children.length === 0)) || !collapsible) && (
              <span
                className="mr-3"
                style={{
                  marginLeft: 4.5,
                  height: 5,
                  width: 5,
                  backgroundColor: '#bbb',
                  borderRadius: '50%',
                  display: 'inline-block',
                }}
              ></span>
            )}
            {collapsible && entry.children && entry.children.length > 0 && (
              <button
                onClick={() => {
                  setCollapsed({ ...collapsed, [index]: !collapsed[index] });
                }}
                className="text-gray-400"
              >
                {collapsed[index] ? <ChevronRightIcon className="h-4 w-4 mr-1" /> : <ChevronRightIcon className="h-4 w-4 mr-1 rotate-90" />}
              </button>
            )}
            <a
              href={entry.href}
              target={openInNewTab ? '_blank' : '_self'}
              rel="noreferrer"
              className="text-sm w-6 text-gray-500 cursor-pointer grow underline hover:no-underline hover:font-extrabold"
            >
              {entry.title}
            </a>
          </div>
          {collapsible && !collapsed[index] && entry.children && entry.children.length > 0 && (
            <LineTableOfContents toc={entry.children} collapsible={collapsible} openInNewTab={openInNewTab} deep={deep + 1} />
          )}
          {!collapsible && entry.children && entry.children.length > 0 && <LineTableOfContents toc={entry.children} collapsible={collapsible} openInNewTab={openInNewTab} deep={deep + 1} />}
        </li>
      ))}
    </ul>
  );
};

interface PropsTableOfContents {
  title: string;
  toc: TableOfContentEntryDto[];
  collapsible: boolean;
  openInNewTab: boolean;
  stickToRight?: boolean;
}

const TableOfContents = ({ title, toc, collapsible, openInNewTab, stickToRight }: PropsTableOfContents) => {
  return (
    <div className={stickToRight ? 'k-right-toc' : ''}>
      {title && <h3 className="text-xs font-semibold text-gray-500 uppercase">{title}</h3>}
      <div className={clsx(title ? 'my-2' : '')}>
        <LineTableOfContents toc={toc} collapsible={collapsible} openInNewTab={openInNewTab} deep={0} />
      </div>
    </div>
  );
};

export default TableOfContents;
