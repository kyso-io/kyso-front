/* eslint-disable @typescript-eslint/no-explicit-any */
import { Helper } from '@/helpers/Helper';
import type { KeyValue } from '@/model/key-value.model';
import { ArrowUpIcon } from '@heroicons/react/solid';
import { useEffect, useState } from 'react';

const Footer = () => {
  const [contents, setContents] = useState<any>([]);

  useEffect(() => {
    const getFooterContents = async () => {
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      const publicKeys: any[] = await Helper.getKysoPublicSettings();

      if (!publicKeys || publicKeys.length === 0) {
        return;
      }

      const footerContents: KeyValue | undefined = await publicKeys.find((x: KeyValue) => x.key === 'FOOTER_CONTENTS');
      if (footerContents?.value) {
        try {
          setContents(JSON.parse(footerContents.value!));
        } catch (e) {}
      }
    };
    getFooterContents();
  }, []);

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
