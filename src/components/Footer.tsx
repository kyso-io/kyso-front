/* eslint-disable @typescript-eslint/no-explicit-any */
import { ArrowUpIcon } from '@heroicons/react/solid';
import { KysoSettingsEnum } from '@kyso-io/kyso-model';
import { useEffect, useState } from 'react';
import { usePublicSetting } from '../hooks/use-public-setting';

const Footer = () => {
  const footerContentsStr: any | null = usePublicSetting(KysoSettingsEnum.FOOTER_CONTENTS);
  const [contents, setContents] = useState<any>([]);

  useEffect(() => {
    if (!footerContentsStr) {
      return;
    }
    try {
      setContents(JSON.parse(footerContentsStr));
    } catch (e) {}
  }, [footerContentsStr]);

  return (
    <footer className="w-screen block text-white px-8 k-bg-primary">
      <div className="flex justify-between items-center text-sm" style={{ height: '70px' }}>
        <div className="">
          {contents &&
            contents.map((x: any) => (
              <a key={x.text} href={x.url} target="_blank" className="mx-4" rel="noreferrer">
                {x.text}
              </a>
            ))}
        </div>
        <div
          className="border border-white cursor-pointer p-1 mr-4"
          onClick={() => {
            if (typeof window !== 'undefined') {
              window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
            }
          }}
        >
          <ArrowUpIcon className="w-4 h-4" />
        </div>
      </div>
    </footer>
  );
};

export { Footer };
