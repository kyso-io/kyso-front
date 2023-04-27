import { FileTypesHelper } from '@/helpers/FileTypesHelper';
import { Helper } from '@/helpers/Helper';
import { ChatIcon, ThumbUpIcon } from '@heroicons/react/outline';
import type { FullTextSearchResult } from '@kyso-io/kyso-model';
import { ElasticSearchIndex } from '@kyso-io/kyso-model';
import moment from 'moment';
import { useRouter } from 'next/router';
import React from 'react';

interface Props {
  fullTextSearchResult: FullTextSearchResult;
  otherVersionResultsNumber?: number;
  terms: string;
}

const SearchItem = ({ fullTextSearchResult, otherVersionResultsNumber, terms }: Props) => {
  const router = useRouter();
  const { basePath } = router;

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

  const finalRedirectUrl = `${basePath}${fullTextSearchResult.link}&highlight=${terms}&showInlineComments=true`;

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
            <a href={finalRedirectUrl} className="block focus:outline-none">
              <span className="absolute inset-0" aria-hidden="true"></span>
              {fullTextSearchResult.type !== ElasticSearchIndex.Comment && (
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

                    {isUnknownFile(fullTextSearchResult.filePath) && !Helper.isKysoFile(fullTextSearchResult.filePath) ? (
                      <img className="h-5 w-5 mr-2" style={{ display: 'inline' }} src={`/assets/images/file.svg`} alt="Unknown extension" />
                    ) : (
                      ''
                    )}

                    {Helper.isKysoFile(fullTextSearchResult.filePath) ? (
                      <img className="h-5 w-5 mr-2" style={{ display: 'inline' }} src={`/assets/images/kyso-logo-dark.svg`} alt="Kyso's Report" />
                    ) : (
                      ''
                    )}

                    {fullTextSearchResult.title}

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
            </a>
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
              {fullTextSearchResult.numComments && (
                <>
                  <ChatIcon className="hidden lg:block shrink-0 h-5 w-5 text-orange-500" />
                  <span className="hidden lg:block">{fullTextSearchResult.numComments}</span>
                </>
              )}
              {fullTextSearchResult.stars && (
                <>
                  <ThumbUpIcon className="shrink-0 h-5 w-5 text" color={fullTextSearchResult.stars > 0 ? '#4f46e5' : ''} />
                  <span>{fullTextSearchResult.stars}</span>
                </>
              )}
            </div>
          )}
        </div>
      </li>
    </React.Fragment>
  );
};

export default SearchItem;
