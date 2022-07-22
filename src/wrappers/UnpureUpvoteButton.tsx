import { useAppDispatch, useAppSelector } from '@/hooks/redux-hooks';
// import { useState } from 'react';

import { toggleUserStarReportAction } from '@kyso-io/kyso-store';
import classNames from '@/helpers/ClassNames';
import { ThumbUpIcon } from '@heroicons/react/solid';

type IUnpureUpvoteButton = {
  id: string;
};

const UnpureUpvoteButton = (props: IUnpureUpvoteButton) => {
  const report = useAppSelector((state) => state.reports.entities[props.id]);
  const dispatch = useAppDispatch();
  // const [isUpvoteBusy, setUpvoteBusy] = useState(false);

  const upvoteReport = async () => {
    // setUpvoteBusy(true);
    await dispatch(toggleUserStarReportAction(report.id));
    // setUpvoteBusy(false);
  };

  return (
    <button
      type="button"
      className="inline-flex space-x-2 text-gray-400 hover:text-gray-500"
      onClick={() => {
        upvoteReport();
      }}
    >
      <ThumbUpIcon className={classNames('h-5 w-5', report.mark_as_star_by_user ? 'text-indigo-500' : '')} aria-hidden="true" />
      <span className="text-gray-900">{report.stars}</span>
      <span className="sr-only">upvotes</span>
    </button>
  );
};

export default UnpureUpvoteButton;
