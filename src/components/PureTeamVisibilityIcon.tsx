import { LockClosedIcon, ShieldCheckIcon, LockOpenIcon } from '@heroicons/react/solid';

type IPureTeamVisibilityIconProps = {
  visibility?: string;
  hasLabel?: boolean;
};

const PureTeamVisibilityIcon = (props: IPureTeamVisibilityIconProps) => {
  const { visibility, hasLabel } = props;

  // LockClosedIcon
  let VisibilityIcon = LockClosedIcon;
  if (visibility === 'protected') {
    VisibilityIcon = ShieldCheckIcon;
  }
  if (visibility === 'public') {
    VisibilityIcon = LockOpenIcon;
  }

  let label = 'Private';
  if (visibility === 'protected') {
    label = 'Protected';
  }
  if (visibility === 'public') {
    label = 'Public';
  }

  return (
    <span className="bg-blue-100 text-kyso-700 text-xs font-semibold mr-2 px-2.5 py-1 rounded-xl dark:bg-blue-200 dark:text-blue-800 flex w-fit items-center">
      {' '}
      <VisibilityIcon className="w-3 h-3 mr-2" />
      {hasLabel && label}
    </span>
  );
};
export default PureTeamVisibilityIcon;
