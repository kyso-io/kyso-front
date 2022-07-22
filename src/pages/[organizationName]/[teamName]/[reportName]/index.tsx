import KysoTopBar from '@/layouts/KysoTopBar';
import type { CommonData } from '@/hooks/use-common-data';
import { useCommonData } from '@/hooks/use-common-data';
import { useRouter } from 'next/router';
import { useCommonReportData } from '@/hooks/use-common-report-data';
import UnPureTree from '@/wrappers/UnPureTree';
import UnpureReportRender from '@/wrappers/UnpureReportRender';
import { useFileToRender } from '@/hooks/use-file-to-render';
import UnpureMain from '@/wrappers/UnpureMain';
import { useAuthors } from '@/hooks/use-authors';
import PureUpvoteButton from '@/wrappers/PureUpvoteButton';
import UnpureShareButton from '@/wrappers/UnpureShareButton';
import UnpureReportActionDropdown from '@/wrappers/UnpureReportActionDropdown';
import UnpureComments from '@/wrappers/UnpureComments';
import { useTree } from '@/hooks/use-tree';
import type { User } from '@kyso-io/kyso-model';
import PureReportHeader from '@/components/PureReportHeader';
import { useRedirectIfNoJWT } from '@/hooks/use-redirect-if-no-jwt';
import { toggleUserStarReportAction } from '@kyso-io/kyso-store';
import { useAppDispatch } from '@/hooks/redux-hooks';

const Index = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  useRedirectIfNoJWT();
  const commonData: CommonData = useCommonData();
  const report = useCommonReportData();
  const authors: User[] = useAuthors();
  const fileToRender = useFileToRender();
  const tree = useTree();

  return (
    <>
      <UnpureMain>
        <div className="flex flex-row space-x-10 ">
          <div className="flex flex-col h-screen w-full space-y-6 pt-6">
            <div className="flex justify-between">
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

            <div>
              <UnPureTree tree={tree} prefix={`${router.basePath}/${commonData.organization?.sluglified_name}/${commonData.team?.sluglified_name}/${report?.name}`} />
              {fileToRender && (
                <div className="bg-white border-b rounded-b border-x">
                  <UnpureReportRender />
                </div>
              )}
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
