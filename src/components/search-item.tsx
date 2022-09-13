import { FileTypesHelper } from '@/helpers/FileTypesHelper';
import { Helper } from '@/helpers/Helper';
import type { FullTextSearchResult } from '@kyso-io/kyso-model';
import { ElasticSearchIndex } from '@kyso-io/kyso-model';
import { useRouter } from 'next/router';

interface Props {
  fullTextSearchResult: FullTextSearchResult;
  otherVersionResultsNumber?: number;
}

const SearchItem = ({ fullTextSearchResult, otherVersionResultsNumber }: Props) => {
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

  return (
    <li className="mb-4 relative bg-white py-5 px-4 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
      <div className="flex justify-between space-x-3">
        <div className="min-w-0 flex-1">
          <a href={`${basePath}${fullTextSearchResult.link}`} className="block focus:outline-none">
            <span className="absolute inset-0" aria-hidden="true"></span>
            {fullTextSearchResult.type !== ElasticSearchIndex.Comment && (
              <>
                <p className="text-sm mb-2 font-medium text-gray-900 truncate">
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

                  {isUnknownFile(fullTextSearchResult.filePath) ? <img className="h-5 w-5 mr-2" style={{ display: 'inline' }} src={`/assets/images/file.svg`} alt="Typescript File" /> : ''}

                  {fullTextSearchResult.title}

                  {otherVersionResultsNumber && otherVersionResultsNumber > 1 && (
                    <span className="text-xs font-semibold inline-block py-1 px-2 ml-2 rounded text-black bg-white last:mr-0 mr-1 border">{`+${otherVersionResultsNumber - 1} more versions`}</span>
                  )}

                  {
                    <div style={{ marginLeft: '27px', fontSize: '0.9em', fontFamily: 'monospace' }}>
                      {fullTextSearchResult.filePath.replace(
                        `/${fullTextSearchResult.organizationSlug}/${fullTextSearchResult.teamSlug}/reports/${Helper.slugify(fullTextSearchResult.title)}/${fullTextSearchResult.version}`,
                        '.',
                      )}
                    </div>
                  }
                </p>
              </>
            )}
            {fullTextSearchResult.organizationSlug && (
              <span className="bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded dark:bg-blue-200 dark:text-blue-800">{fullTextSearchResult.organizationSlug}</span>
            )}
            {fullTextSearchResult.teamSlug && (
              <span className="bg-gray-100 text-gray-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-gray-300">{fullTextSearchResult.teamSlug}</span>
            )}
            {fullTextSearchResult.people.map((person: string, index: number) => (
              <span key={index} className="bg-purple-100 text-purple-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded dark:bg-purple-200 dark:text-purple-900">
                {person}
              </span>
            ))}
            {fullTextSearchResult.tags.map((tag: string, index: number) => (
              <span key={index} className="bg-yellow-100 text-yellow-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded dark:bg-yellow-200 dark:text-yellow-900">
                {tag}
              </span>
            ))}
          </a>
        </div>
      </div>
      <div className="mt-2">
        <p className="line-clamp-2 text-sm text-gray-600">{fullTextSearchResult.content}</p>
      </div>
    </li>
  );
};

export default SearchItem;
