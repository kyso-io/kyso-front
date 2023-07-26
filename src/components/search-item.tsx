/* eslint-disable @typescript-eslint/no-explicit-any */
import { FileTypesHelper } from '@/helpers/FileTypesHelper';
import { Helper } from '@/helpers/Helper';
import KTasksIcon from '@/icons/KTasksIcon';
import { ChatIcon, ThumbUpIcon } from '@heroicons/react/outline';
import type { FullTextSearchResult } from '@kyso-io/kyso-model';
import { ElasticSearchIndex } from '@kyso-io/kyso-model';
import clsx from 'clsx';
import moment from 'moment';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useMemo } from 'react';

interface Props {
  fullTextSearchResult: FullTextSearchResult;
  otherVersionResultsNumber?: number;
  terms: string;
}

const SearchItem = ({ fullTextSearchResult, otherVersionResultsNumber, terms }: Props) => {
  const router = useRouter();
  const { basePath } = router;

  const highlightedTitle: any = useMemo(() => {
    if (!fullTextSearchResult || !fullTextSearchResult.title) {
      return '';
    }
    return fullTextSearchResult.title.replace(new RegExp(terms, 'gi'), (match) => `<span class="font-bold">${match}</span>`);
  }, [fullTextSearchResult?.title, terms]);

  const isUnknownFile = (name: string) => {
    return (
      !FileTypesHelper.isPowerpoint(name) &&
      !FileTypesHelper.isWord(name) &&
      !FileTypesHelper.isExcel(name) &&
      !FileTypesHelper.isPDF(name) &&
      !FileTypesHelper.isJupyterNotebook(name) &&
      !FileTypesHelper.isMarkdown(name) &&
      !FileTypesHelper.isPython(name) &&
      !FileTypesHelper.isR(name) &&
      !FileTypesHelper.isJavascript(name) &&
      !FileTypesHelper.isTypescript(name) &&
      !FileTypesHelper.isHTML(name)
    );
  };

  let finalRedirectUrl = '';
  if (fullTextSearchResult.link.indexOf('?') === -1) {
    // No parameters, add them from scratch
    finalRedirectUrl = `${basePath}${fullTextSearchResult.link}?highlight=${terms}&showInlineComments=true`;
  } else {
    // Existing parameters, append to the end
    finalRedirectUrl = `${basePath}${fullTextSearchResult.link}&highlight=${terms}&showInlineComments=true`;
  }

  return (
    <React.Fragment>
      <style>{`
        em {
          font-weight: bolder
        }
      `}</style>
      <li className="relative bg-white py-5 px-4 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
        <div className="flex justify-between space-x-3">
          <div className="min-w-0 flex-1">
            <Link href={finalRedirectUrl} className="block focus:outline-none">
              <span className="absolute inset-0" aria-hidden="true"></span>
              {fullTextSearchResult.type === ElasticSearchIndex.Report && (
                <>
                  <div className="text-sm mb-2 font-medium text-gray-900 truncate">
                    {FileTypesHelper.isPowerpoint(fullTextSearchResult.filePath) ? (
                      <img className="h-5 w-5 mr-2" style={{ display: 'inline' }} src={`/assets/images/powerpoint.svg`} alt="Powerpoint File" />
                    ) : (
                      ''
                    )}

                    {FileTypesHelper.isWord(fullTextSearchResult.filePath) ? <img className="h-5 w-5 mr-2" style={{ display: 'inline' }} src={`/assets/images/word.svg`} alt="Word File" /> : ''}

                    {FileTypesHelper.isExcel(fullTextSearchResult.filePath) ? <img className="h-5 w-5 mr-2" style={{ display: 'inline' }} src={`/assets/images/excel.svg`} alt="Excel File" /> : ''}

                    {FileTypesHelper.isPDF(fullTextSearchResult.filePath) ? <img className="h-5 w-5 mr-2" style={{ display: 'inline' }} src={`/assets/images/pdf.svg`} alt="PDF File" /> : ''}

                    {FileTypesHelper.isJupyterNotebook(fullTextSearchResult.filePath) ? (
                      <img className="h-5 w-5 mr-2" style={{ display: 'inline' }} src={`/assets/images/jupyter.svg`} alt="Jupyter File" />
                    ) : (
                      ''
                    )}

                    {FileTypesHelper.isMarkdown(fullTextSearchResult.filePath) ? (
                      <img className="h-5 w-5 mr-2" style={{ display: 'inline' }} src={`/assets/images/markdown.svg`} alt="Markdown File" />
                    ) : (
                      ''
                    )}

                    {FileTypesHelper.isPython(fullTextSearchResult.filePath) ? <img className="h-5 w-5 mr-2" style={{ display: 'inline' }} src={`/assets/images/python.svg`} alt="Python File" /> : ''}

                    {FileTypesHelper.isR(fullTextSearchResult.filePath) ? <img className="h-5 w-5 mr-2" style={{ display: 'inline' }} src={`/assets/images/r.svg`} alt="R File" /> : ''}

                    {FileTypesHelper.isJavascript(fullTextSearchResult.filePath) ? (
                      <img className="h-5 w-5 mr-2" style={{ display: 'inline' }} src={`/assets/images/javascript.svg`} alt="Javascript File" />
                    ) : (
                      ''
                    )}

                    {FileTypesHelper.isTypescript(fullTextSearchResult.filePath) ? (
                      <img className="h-5 w-5 mr-2" style={{ display: 'inline' }} src={`/assets/images/typescript.svg`} alt="Typescript File" />
                    ) : (
                      ''
                    )}

                    {FileTypesHelper.isHTML(fullTextSearchResult.filePath) ? (
                      <img className="h-5 w-5 mr-2" style={{ display: 'inline' }} src={`/assets/images/${FileTypesHelper.getBrowser()}`} alt="HTML File" />
                    ) : (
                      ''
                    )}

                    {fullTextSearchResult.type === ElasticSearchIndex.Report && isUnknownFile(fullTextSearchResult.filePath) && !Helper.isKysoFile(fullTextSearchResult.filePath) ? (
                      <img className="h-5 w-5 mr-2" style={{ display: 'inline' }} src={`/assets/images/file.svg`} alt="Unknown extension" />
                    ) : (
                      ''
                    )}

                    {Helper.isKysoFile(fullTextSearchResult.filePath) ? (
                      <img className="h-5 w-5 mr-2" style={{ display: 'inline' }} src={`/assets/images/kyso-logo-dark.svg`} alt="Kyso's Report" />
                    ) : (
                      ''
                    )}

                    <div className="font-normal" dangerouslySetInnerHTML={{ __html: highlightedTitle }}></div>

                    {otherVersionResultsNumber && otherVersionResultsNumber > 1 && (
                      <span className="text-xs font-semibold inline-block py-1 px-2 ml-2 rounded text-black bg-white last:mr-0 mr-1 border">{`+${otherVersionResultsNumber - 1} more versions`}</span>
                    )}

                    {!Helper.isKysoFile(fullTextSearchResult.filePath) && (
                      <div style={{ marginLeft: '27px', fontSize: '0.9em', fontFamily: 'monospace' }}>
                        {fullTextSearchResult.filePath.replace(
                          `/${fullTextSearchResult.organizationSlug}/${fullTextSearchResult.teamSlug}/reports/${Helper.slugify(fullTextSearchResult.title)}/${fullTextSearchResult.version}`,
                          '.',
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}

              {fullTextSearchResult.type === ElasticSearchIndex.Comment && (
                <>
                  <p className="text-sm mb-2 font-medium text-gray-900 truncate">
                    {isUnknownFile(fullTextSearchResult.filePath) ? <img className="h-5 w-5 mr-2" style={{ display: 'inline' }} src={`/assets/images/file.svg`} alt="Typescript File" /> : ''}

                    {fullTextSearchResult.link.split('/').pop()?.replaceAll('-', ' ')}
                  </p>
                </>
              )}

              {fullTextSearchResult.type === ElasticSearchIndex.InlineComment && (
                <>
                  <p className="text-sm mb-2 font-medium text-gray-900 truncate">
                    {isUnknownFile(fullTextSearchResult.filePath) ? <KTasksIcon className="h-5 w-5 mr-2" style={{ display: 'inline' }} /> : ''}

                    {fullTextSearchResult.link.split('/').pop()?.replaceAll('-', ' ')}
                  </p>
                </>
              )}

              {fullTextSearchResult.organizationSlug && (
                <span className="bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded dark:bg-blue-200 dark:text-blue-800">{fullTextSearchResult.organizationSlug}</span>
              )}
              {fullTextSearchResult.teamSlug && (
                <span className="bg-gray-100 text-gray-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-gray-300">{fullTextSearchResult.teamSlug}</span>
              )}
              {fullTextSearchResult.people &&
                Array.isArray(fullTextSearchResult.people) &&
                fullTextSearchResult.people.map((person: string, index: number) => (
                  <span key={index} className="bg-purple-100 text-purple-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded dark:bg-purple-200 dark:text-purple-900">
                    {person}
                  </span>
                ))}
              {fullTextSearchResult.tags &&
                Array.isArray(fullTextSearchResult.tags) &&
                fullTextSearchResult.tags.map((tag: string, index: number) => (
                  <span key={index} className="bg-yellow-100 text-yellow-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded dark:bg-yellow-200 dark:text-yellow-900">
                    {tag}
                  </span>
                ))}
            </Link>
          </div>
        </div>
        <div className="mt-2 mb-4">
          <div className="line-clamp-2 text-sm text-gray-600" style={{ whiteSpace: 'pre-line' }} dangerouslySetInnerHTML={{ __html: fullTextSearchResult.content }} />
        </div>
        <div className="flex items-center text-gray-500 text-xs">
          {moment(fullTextSearchResult.updatedAt / 1000, 'X').format('MMMM DD, YYYY HH:mm') !== 'Invalid date' && (
            <span className="hidden lg:block pr-3">{moment(fullTextSearchResult.updatedAt / 1000, 'X').format('MMMM DD, YYYY HH:mm')}</span>
          )}
          {fullTextSearchResult.type === ElasticSearchIndex.Report && (
            <div className="grow flex flex-row items-center text-gray-500 text-xs space-x-2">
              <ChatIcon className={clsx('hidden lg:block shrink-0 h-5 w-5', fullTextSearchResult.numComments > 0 ? 'text-orange-500' : '')} />
              <span className="hidden lg:block">{fullTextSearchResult.numComments}</span>
              <ThumbUpIcon className="shrink-0 h-5 w-5 text" color={fullTextSearchResult.stars > 0 ? '#4f46e5' : ''} />
              <span>{fullTextSearchResult.stars}</span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={fullTextSearchResult.numTasks > 0 ? '#a855f7' : '#6b7280'} className="w-5 h-5">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0118 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3l1.5 1.5 3-3.75"
                />
              </svg>
              <span>{fullTextSearchResult.numTasks}</span>
            </div>
          )}
        </div>
      </li>
    </React.Fragment>
  );
};

export default SearchItem;
