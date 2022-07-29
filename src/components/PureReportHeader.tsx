import format from 'date-fns/format';
import type { ReportDTO, User } from '@kyso-io/kyso-model';

type IPureReportHeaderProps = {
  report: ReportDTO;
  authors: User[];
};

const PureReportHeader = (props: IPureReportHeaderProps) => {
  const { report, authors } = props;

  return (
    <div className="prose-sm">
      <h1 className="m-0 mb-2">{report?.title}</h1>
      {report?.description && <p>{report?.description}</p>}
      <div className="prose prose-sm flex flex-col lg:flex-row lg:items-center text-gray-500 font-light space-x-2">
        <div className="flex">
          {authors?.map((author) => (
            <div key={author.display_name} className="shrink-0 group block">
              <div className="flex items-center">
                <div>
                  <img className="m-0 inline-block h-9 w-9 rounded-full" src={author.avatar_url} alt="" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{author.display_name}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div>
          created
          <span className="text-gray-800 mx-1 ">{report?.created_at && format(new Date(report.created_at), 'MMM dd, yyyy')}.</span>
          Last update on
          <span className="text-gray-800 mx-2">{report?.updated_at && format(new Date(report.updated_at), 'MMM dd, yyyy')}.</span>
        </div>
        {/* {report?.last_version && (
          <p> Version: {report.last_version} </p>
        )}
        {report?.tags.map(tag => (
          <div>
            {tag}
          </div>
        ))} */}
      </div>
    </div>
  );
};

export default PureReportHeader;
