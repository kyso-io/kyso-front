import { useAppDispatch, useAppSelector } from '@/hooks/redux-hooks';
import { useMemo, useState } from 'react';
import checkPermissions from '@/helpers/check-permissions';
import { useUser } from '@/hooks/use-user';
import slugify from 'slugify';
import { Helper } from '@/helpers/Helper';
import { Sanitizer } from '@/helpers/Sanitizer';
import { useRouter } from 'next/router';
import PureReportBadge from '@/components/PureReportBadge';
import type { UserDTO } from '@kyso-io/kyso-model';
import { getOrgAndTeamGivenSluglifiedOrgAndTeam, selectCurrentUserPermissions, toggleGlobalPinReportAction, toggleUserPinReportAction, toggleUserStarReportAction } from '@kyso-io/kyso-store';
import { useSelector } from 'react-redux';

type IUnpureReportBadge = {
  id: string;
};

const UnpureReportBadge = (props: IUnpureReportBadge) => {
  const report = useAppSelector((state) => state.reports.entities[props.id]);
  const user = useUser();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { organizationName, teamName } = router.query;

  const state = useAppSelector((s) => s);
  const owners = useMemo(() => {
    if (!report || !user) {
      return [];
    }
    const tempOwners = report.author_ids.map((id: string) => state.user.entities[id]);
    if (report.author_ids.indexOf(report.user_id) === -1) {
      tempOwners.push(state.user.entities[report.user_id] as UserDTO);
    }
    return tempOwners;
  }, [report, state.user?.entities]);

  // let _globallyEnabledCaptcha = useSelector(
  //   (s: RootState) => s.kysoSettings.publicSettings
  // ).filter((x: { key: string }) => x.key === KysoSettingsEnum.RECAPTCHA2_ENABLED)[0];
  // _globallyEnabledCaptcha =
  //   _globallyEnabledCaptcha &&
  //   _globallyEnabledCaptcha[0] &&
  //   _globallyEnabledCaptcha[0].value
  //     ? _globallyEnabledCaptcha[0].value === "true"
  //     : true;

  const [isUpvoteBusy, setUpvoteBusy] = useState(false);
  const [isPinnedBusy, setIsPinnedBusy] = useState(false);

  const { organization: activeOrganization, team: activeTeam } = useSelector((s) => getOrgAndTeamGivenSluglifiedOrgAndTeam(s, organizationName as string, teamName as string));
  const currentUserPermissions = useSelector(selectCurrentUserPermissions);

  const hasPermissionGlobalPinReport = useMemo(() => {
    return checkPermissions(activeOrganization!, activeTeam!, currentUserPermissions, 'KYSO_IO_REPORT_GLOBAL_PIN');
  }, [activeOrganization, activeTeam, currentUserPermissions]);

  const togglePinReportGlobally = async () => {
    if (!user.email_verified) {
      // setShowEmailNotVerifiedModal(true);
      return;
    }
    // const showCaptchaDialog = showCaptchaDialogHelper(user.show_captcha, globallyEnabledCaptcha);
    // if (showCaptchaDialog) {
    //   setShowCaptchaNotSolvedModal(true);
    //   return;
    // }
    setIsPinnedBusy(true);
    await dispatch(toggleGlobalPinReportAction(props.id));
    setIsPinnedBusy(false);
  };

  const togglePinReportToUser = async () => {
    if (!user.email_verified) {
      // setShowEmailNotVerifiedModal(true);
      return;
    }
    // const showCaptchaDialog = showCaptchaDialogHelper(
    //   user.show_captcha,
    //   globallyEnabledCaptcha
    // );
    // if (showCaptchaDialog) {
    //   setShowCaptchaNotSolvedModal(true);
    //   return;
    // }
    setIsPinnedBusy(true);
    await dispatch(toggleUserPinReportAction(props.id));
    setIsPinnedBusy(false);
  };

  const upvoteReport = async () => {
    // if (!user.email_verified) {
    //   setShowEmailNotVerifiedModal(true);
    //   return;
    // }
    // const showCaptchaDialog = showCaptchaDialogHelper(
    //   user.show_captcha,
    //   globallyEnabledCaptcha
    // );

    // if (showCaptchaDialog) {
    //   setShowCaptchaNotSolvedModal(true);
    //   return;
    // }

    setUpvoteBusy(true);
    await dispatch(toggleUserStarReportAction(report.id));
    setUpvoteBusy(false);
  };

  const href = `${router.basePath}/${Helper.slugify(Sanitizer.ifNullReturnDefault(organizationName, ''))}/${slugify(Sanitizer.ifNullReturnDefault(teamName, ''))}/${slugify(
    Sanitizer.ifNullReturnDefault(report.name, ''),
  )}`;

  return (
    <>
      <PureReportBadge
        report={report}
        owners={owners}
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
        onClickUpvote={() => {
          upvoteReport();
        }}
        isUpvoteBusy={isUpvoteBusy}
      />
    </>
  );
};

export default UnpureReportBadge;
