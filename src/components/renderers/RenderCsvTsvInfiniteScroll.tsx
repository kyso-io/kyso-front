/* eslint-disable @typescript-eslint/no-explicit-any */
import { Dialog, Transition } from '@headlessui/react';
import type { ColumnStats, NormalizedResponseDTO } from '@kyso-io/kyso-model';
import { Api } from '@kyso-io/kyso-store';
import clsx from 'clsx';
import Papaparse from 'papaparse';
import React, { useEffect, useMemo, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import type { CommonData } from '../../types/common-data';
import type { FileToRender } from '../../types/file-to-render';

interface Props {
  commonData: CommonData;
  fileToRender: FileToRender;
}

const OFFSET = 50;

const RenderCsvTsvInfiniteScroll = ({ commonData, fileToRender }: Props) => {
  const [headers, setHeaders] = useState<string[]>([]);
  const [delimiter, setDelimiter] = useState<string>(',');
  const [lineBreak, setLineBreak] = useState<string>('\n');
  const [items, setItems] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [selectedColumn, setSelectedColumn] = useState<string | null>(null);

  const columnsStats: { [key: string]: ColumnStats } = useMemo(() => {
    if (!fileToRender || !Array.isArray(fileToRender.columns_stats)) {
      return {};
    }
    const result: { [key: string]: ColumnStats } = {};
    fileToRender.columns_stats.forEach((columnStat: ColumnStats) => {
      if (columnStat.images && Array.isArray(columnStat.images) && columnStat.images.length > 0) {
        result[columnStat.column] = columnStat;
      }
    });
    return result;
  }, [fileToRender]);

  useEffect(() => {
    getLines();
  }, []);

  const getLines = async () => {
    try {
      const api: Api = new Api(commonData.token);
      const response: NormalizedResponseDTO<string> = await api.getLinesOfReportFile(fileToRender.id, (page - 1) * OFFSET + 1, page * OFFSET);
      if (response.data) {
        let text: string = '';
        if (page > 1) {
          text = `${headers.map((header: string) => `${header}`).join(delimiter)}${lineBreak}`;
        }
        text += response.data.trim();
        const pr: Papaparse.ParseResult<any> = Papaparse.parse(text, {
          header: true,
        });
        if (page === 1) {
          setHeaders(pr.meta.fields || []);
          setDelimiter(pr.meta.delimiter);
          setLineBreak(pr.meta.linebreak);
        }
        setItems(items.concat(pr.data));
        setPage(page + 1);
        setHasMore(pr.data.length === OFFSET);
      } else {
        setHasMore(false);
      }
    } catch (e) {
      setHasMore(false);
    }
  };

  return (
    <React.Fragment>
      <InfiniteScroll height={800} dataLength={items.length} next={getLines} hasMore={hasMore} loader={<div className="flex items-center justify-center">Loading...</div>}>
        <div className="mt-8">
          <div className="-my-2">
            <div className="inline-block min-w-full py-2 align-middle">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50" style={{ position: 'sticky', top: '0' }}>
                  <tr>
                    {headers.map((header: string, index: number) => (
                      <th key={`${header}-${index}`} className={clsx('py-3.5 text-left text-sm font-semibold text-gray-900', index === 0 ? 'pl-6 pr-3' : 'px-3 py-3.5')}>
                        <div className="grid justify-items-center text-center">
                          {columnsStats[header] && (
                            <img
                              alt="Column stats"
                              onClick={() => {
                                setSelectedColumn(header);
                                setIsOpen(true);
                              }}
                              className="cursor-pointer h-48 w-full object-cover md:h-full md:w-48 mt-2"
                              src={`data:image/png;base64,${columnsStats[header]!.images[0]}`}
                            />
                          )}
                          <span>{header}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {items.map((item: any, indexItem: number) => (
                    <tr key={indexItem}>
                      {headers.map((header: string, indexHeader: number) => (
                        <td key={`${indexItem}-${indexHeader}`} className={clsx('text-center whitespace-nowrap text-sm text-gray-900', indexHeader === 0 ? 'py-4 pl-6 pr-3 font-medium' : 'px-3 py-4')}>
                          {item[header]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </InfiniteScroll>
      {selectedColumn && columnsStats[selectedColumn] && (
        <Transition.Root show={isOpen} as={React.Fragment}>
          <Dialog
            as="div"
            className="relative z-10"
            onClose={() => {
              setSelectedColumn(null);
              setIsOpen(false);
            }}
          >
            <Transition.Child as={React.Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity/75 transition-opacity" />
            </Transition.Child>
            <div className="fixed inset-0 z-10 overflow-y-auto">
              <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                <Transition.Child
                  as={React.Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                  enterTo="opacity-100 translate-y-0 sm:scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                  leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                >
                  <Dialog.Panel className="relative overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:p-6">
                    <div>
                      <div className="mt-3 text-center sm:mt-5">
                        <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                          {selectedColumn}
                        </Dialog.Title>
                        <div className="mt-2">
                          <img alt="Column stats" className="cursor-pointer w-full object-cover md:h-full mt-2" src={`data:image/png;base64,${columnsStats[selectedColumn]!.images[0]}`} />
                        </div>
                      </div>
                    </div>
                    <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                      <button
                        type="button"
                        className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
                        onClick={() => {
                          setSelectedColumn(null);
                          setIsOpen(false);
                        }}
                      >
                        Close
                      </button>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition.Root>
      )}
    </React.Fragment>
  );
};

export default RenderCsvTsvInfiniteScroll;
