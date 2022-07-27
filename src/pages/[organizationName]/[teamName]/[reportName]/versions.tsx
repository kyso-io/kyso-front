import KysoTopBar from '@/layouts/KysoTopBar';
import { useReport } from '@/hooks/use-report';
import UnpureMain from '@/unpure-components/UnpureMain';
import { useAuthors } from '@/hooks/use-authors';
import type { User } from '@kyso-io/kyso-model';
import PureReportHeader from '@/components/PureReportHeader';
import { useRedirectIfNoJWT } from '@/hooks/use-redirect-if-no-jwt';
import { fetchReportVersionsAction } from '@kyso-io/kyso-store';
import { useAppDispatch } from '@/hooks/redux-hooks';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { PureSpinner } from '@/components/PureSpinner';
import type { CommonData } from '@/hooks/use-common-data';
import { useCommonData } from '@/hooks/use-common-data';
import buildReportUrl from '@/helpers/build-report-url';
import { useRouter } from 'next/router';

const Index = () => {
  useRedirectIfNoJWT();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const commonData: CommonData = useCommonData({
    organizationName: router.query.organizationName as string,
    teamName: router.query.teamName as string,
  });
  const [report] = useReport({
    commonData,
    reportName: router.query.reportName as string,
  });

  const reportUrl = buildReportUrl(router.basePath, commonData?.organization, commonData?.team, report);

  const authors: User[] = useAuthors({ report });

  const [versions, setVersions] = useState<{ version: number; created_at: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (report && versions.length === 0) {
      const doAsync = async () => {
        setIsLoading(true);
        const results = await dispatch(
          fetchReportVersionsAction({
            reportId: report!.id as string,
            sort: '-created_at',
          }),
        );

        if (results && results.payload.length > 0) {
          setVersions(results.payload);
        }
        setIsLoading(false);
      };
      doAsync();
    }
  }, [report, versions]);

  return (
    <>
      <UnpureMain basePath={router.basePath} report={report} commonData={commonData}>
        {report && (
          <>
            <div className="flex flex-row space-x-10 ">
              <div className="flex flex-col h-screen w-[450px] space-y-6 truncate">{/* <UnpureTree /> */}</div>
              <div className="flex flex-col h-screen w-full space-y-6 pt-6 ">
                <div className="flex justify-between min-h-[104px]">
                  <PureReportHeader report={report} authors={authors} />
                </div>

                <div className="flex space-x-4">
                  <div className="w-full">
                    <div className="prose my-4">
                      <h1>Versions</h1>
                    </div>

                    <div className="bg-white rounded-b">
                      {isLoading && <PureSpinner />}
                      {versions?.map((version) => (
                        <div key={version.version} className="flex items-center space-x-4">
                          <div>
                            <a aria-label="open" className="text-indigo-500 hover:underline" href={`${reportUrl}?version=${version.version}`}>
                              Open
                            </a>
                          </div>
                          <div>#{version.version}</div>
                          <div className="text-gray-500">
                            <span>Created on: </span>
                            {format(new Date(version.created_at), 'MMM d, yyyy')}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </UnpureMain>
    </>
  );
};

Index.layout = KysoTopBar;

export default Index;
