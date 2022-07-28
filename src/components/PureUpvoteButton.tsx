import classNames from '@/helpers/class-names';
import { ThumbUpIcon } from '@heroicons/react/solid';
import type { ReportDTO } from '@kyso-io/kyso-model';

type IPureUpvoteButton = {
  report: ReportDTO;
  upvoteReport: () => void;
};

const PureUpvoteButton = (props: IPureUpvoteButton) => {
  const { report, upvoteReport } = props;

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

export default PureUpvoteButton;
