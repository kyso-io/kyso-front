import KysoTopBar from '@/layouts/KysoTopBar';
import { useCommonReportData } from '@/hooks/use-common-report-data';
import UnpureMain from '@/wrappers/UnpureMain';
import { useAuthors } from '@/hooks/use-authors';
import PureUpvoteButton from '@/wrappers/PureUpvoteButton';
import UnpureShareButton from '@/wrappers/UnpureShareButton';
import UnpureReportActionDropdown from '@/wrappers/UnpureReportActionDropdown';
import type { User } from '@kyso-io/kyso-model';
import PureReportHeader from '@/components/PureReportHeader';
import { useRedirectIfNoJWT } from '@/hooks/use-redirect-if-no-jwt';
import { fetchReportVersionsAction, toggleUserStarReportAction } from '@kyso-io/kyso-store';
import { useAppDispatch } from '@/hooks/redux-hooks';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { PureSpinner } from '@/components/PureSpinner';
import { useCommonData } from '@/hooks/use-common-data';
import buildReportUrl from '@/helpers/build-report-url';
import { useRouter } from 'next/router';

const Index = () => {
  useRedirectIfNoJWT();
  const dispatch = useAppDispatch();
  const commonData = useCommonData();
  const report = useCommonReportData();

  const router = useRouter();

  const reportUrl = buildReportUrl(router.basePath, commonData?.organization, commonData?.team, report);

  const authors: User[] = useAuthors();

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
      <UnpureMain>
        <div className="flex flex-row space-x-10 ">
          <div className="flex flex-col h-screen w-[450px] space-y-6 truncate">{/* <UnpureTree /> */}</div>
          <div className="flex flex-col h-screen w-full space-y-6 pt-6 ">
            <div className="flex justify-between min-h-[104px]">
              <PureReportHeader report={report} authors={authors} />
              <div className="flex items-center space-x-4">
                {report?.id && (
                  <PureUpvoteButton
                    report={report}
                    upvoteReport={() => {
                      dispatch(toggleUserStarReportAction(report.id as string));
                    }}
                  />
                )}
                {report?.id && <UnpureShareButton id={report!.id} />}
                <UnpureReportActionDropdown />
              </div>
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
      </UnpureMain>
    </>
  );
};

Index.layout = KysoTopBar;

export default Index;
