import KysoTopBar from '@/layouts/KysoTopBar';
import { useCommonReportData } from '@/hooks/use-common-report-data';
import UnpureReportRender from '@/wrappers/UnpureReportRender';
import UnpureMain from '@/wrappers/UnpureMain';
import { useAuthors } from '@/hooks/use-authors';
import PureUpvoteButton from '@/wrappers/PureUpvoteButton';
import UnpureShareButton from '@/wrappers/UnpureShareButton';
import UnpureReportActionDropdown from '@/wrappers/UnpureReportActionDropdown';
import UnpureComments from '@/wrappers/UnpureComments';
import type { User } from '@kyso-io/kyso-model';
import PureReportHeader from '@/components/PureReportHeader';
import { useRedirectIfNoJWT } from '@/hooks/use-redirect-if-no-jwt';
import { toggleUserStarReportAction } from '@kyso-io/kyso-store';
import { useAppDispatch } from '@/hooks/redux-hooks';
import UnpureFileHeader from '@/wrappers/UnpureFileHeader';
import UnpureTree from '@/wrappers/UnpureTree';

const Index = () => {
  useRedirectIfNoJWT();
  const dispatch = useAppDispatch();
  const report = useCommonReportData();
  const authors: User[] = useAuthors();

  return (
    <>
      <UnpureMain>
        <div className="flex flex-row space-x-10 ">
          <div className="flex flex-col h-screen w-[450px] space-y-6 truncate">
            <UnpureTree />
          </div>
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
                <UnpureFileHeader />

                <div className="bg-white border-b rounded-b border-x">
                  <UnpureReportRender />
                </div>
              </div>
            </div>

            <div className="block pb-44">
              <div className="prose my-4">
                <h1>Comments</h1>
              </div>
              <UnpureComments />
            </div>
          </div>
        </div>
      </UnpureMain>
    </>
  );
};

Index.layout = KysoTopBar;

export default Index;
