import PureReportBadge from '@/components/PureReportBadge';
import { useAppDispatch } from '@/hooks/redux-hooks';
import { useAuthors } from '@/hooks/use-authors';
import type { CommonData } from '@/types/common-data';
import type { ReportDTO } from '@kyso-io/kyso-model';
import { toggleGlobalPinReportAction, toggleUserPinReportAction, toggleUserStarReportAction } from '@kyso-io/kyso-store';
import { useRouter } from 'next/router';
import { useState } from 'react';
import PureUpvoteButton from '../components/PureUpvoteButton';

type IUnpureReportBadge = {
  report: ReportDTO;
  commonData: CommonData;
  hasPermissionGlobalPinReport: boolean;
};

const UnpureReportBadge = (props: IUnpureReportBadge) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { hasPermissionGlobalPinReport, report, commonData } = props;

  const authors = useAuthors({ report });
  const [isPinnedBusy, setIsPinnedBusy] = useState(false);

  const togglePinReportGlobally = async () => {
    setIsPinnedBusy(true);
    await dispatch(toggleGlobalPinReportAction(report.id as string));
    setIsPinnedBusy(false);
  };

  const togglePinReportToUser = async () => {
    setIsPinnedBusy(true);
    await dispatch(toggleUserPinReportAction(report.id as string));
    setIsPinnedBusy(false);
  };

  const href = `${router.basePath}/${commonData.organization?.sluglified_name}/${commonData.team?.sluglified_name}/${report.name}`;

  return (
    <>
      <PureReportBadge
        report={report}
        authors={authors}
        reportHref={href}
        isPinned={report.pin || report.user_pin}
        isPinnedBusy={isPinnedBusy}
        onClickPin={() => {
          if (report.pin && hasPermissionGlobalPinReport) {
            togglePinReportGlobally();
          } else if (report.user_pin) {
            togglePinReportToUser();
          }
        }}
        UpvoteButton={
          <PureUpvoteButton
            report={report}
            upvoteReport={() => {
              dispatch(toggleUserStarReportAction(report.id as string));
            }}
          />
        }
      />
    </>
  );
};

export default UnpureReportBadge;
