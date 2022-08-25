import format from 'date-fns/format';
import { ChatAltIcon, CodeIcon, DotsVerticalIcon, EyeIcon, FlagIcon, ShareIcon, StarIcon } from '@heroicons/react/solid';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import type { ReactNode } from 'react';
import { toSvg } from 'jdenticon';
import type { ReportDTO, User } from '@kyso-io/kyso-model';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

type IPureReportBadgeProps = {
  report: ReportDTO;
  authors: User[];
  reportHref: string;
  isPinned: Boolean;
  onClickPin: () => void;
  isPinnedBusy?: boolean;
  UpvoteButton?: ReactNode;
};

const PureReportBadge = (props: IPureReportBadgeProps) => {
  const { report, authors, reportHref, isPinned = false, onClickPin = () => {}, UpvoteButton } = props;

  const getBackgroundImage = (preview_image: string | null, title: string, size = 400) => {
    if (preview_image) {
      return preview_image;
    }
    const svgString = toSvg(title, size);
    return `data:image/svg+xml;charset=utf8,${encodeURIComponent(svgString)}`;
  };

  let reportTitle = report.name;
  if (report.title) {
    reportTitle = report.title;
  }

  return (
    <>
      <li key={report.id} className={classNames('bg-white border rounded', isPinned ? 'border' : '')}>
        <article aria-labelledby={`report-title-${report.id}`}>
          <div className="flex">
            <div className="h-48 w-48 p-4 border-r">
              <img className="w-full h-full object-cover" src={getBackgroundImage(report.preview_picture, reportTitle)} alt="" />
            </div>
            <div className="p-5 w-full flex flex-col">
              <div className="grow flex space-x-3">
                <div className="min-w-0 flex-1">
                  <a href={reportHref}>
                    <h2 id={`report-title-${report.id}`} className="text-base text-indigo-700">
                      {reportTitle && reportTitle.length >= 100 && `${reportTitle.slice(0, 100)}...`}
                      {reportTitle && reportTitle.length < 100 && `${reportTitle.slice(0, 100)}`}
                    </h2>
                  </a>
                  <div className="mt-2 text-sm text-gray-700 space-y-4">
                    {report.description?.length >= 200 && `${report.description.slice(0, 200)}...`}
                    {report.description?.length < 200 && `${report.description.slice(0, 200)}`}
                  </div>
                </div>

                <div className="shrink-0">
                  <div className="inline-flex items-center text-sm">{UpvoteButton}</div>
                  <Menu as="div" className="relative inline-block text-left ml-4">
                    <div>
                      <Menu.Button className="-m-2 p-2 rounded-full flex items-center text-gray-400 hover:text-gray-600">
                        <span className="sr-only">Open options</span>
                        <DotsVerticalIcon className="h-5 w-5" aria-hidden="true" />
                      </Menu.Button>
                    </div>

                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-slate-300 ring-opacity/10 focus:outline-none">
                        <div className="py-1">
                          <Menu.Item>
                            {({ active }) => (
                              <a href="#" className={classNames(active ? 'bg-gray-100 text-gray-900' : 'text-gray-700', 'flex px-4 py-2 text-sm')} onClick={onClickPin}>
                                <StarIcon className="mr-3 h-5 w-5 text-gray-400" aria-hidden="true" />
                                <span>Pin report</span>
                              </a>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <a href="#" className={classNames(active ? 'bg-gray-100 text-gray-900' : 'text-gray-700', 'flex px-4 py-2 text-sm')}>
                                <CodeIcon className="mr-3 h-5 w-5 text-gray-400" aria-hidden="true" />
                                <span>Embed</span>
                              </a>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <a href="#" className={classNames(active ? 'bg-gray-100 text-gray-900' : 'text-gray-700', 'flex px-4 py-2 text-sm')}>
                                <FlagIcon className="mr-3 h-5 w-5 text-gray-400" aria-hidden="true" />
                                <span>Report content</span>
                              </a>
                            )}
                          </Menu.Item>
                        </div>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                </div>
              </div>

              <div className="space-x-3 mt-3">
                <div className="shrink-0">
                  <ul role="list" className="-my-4 divide-y divide-gray-200">
                    {authors &&
                      authors.map((author) => (
                        <li key={author.id} className="flex items-center py-4 space-x-3">
                          <div className="shrink-0">
                            <img className="h-8 w-8 rounded-full" src={author.avatar_url} alt="" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm text-gray-900">{author.name}</p>
                          </div>
                        </li>
                      ))}
                  </ul>
                </div>
              </div>

              <div className="mt-3 flex justify-between space-x-8">
                <div className="flex space-x-6">
                  <span className="inline-flex items-center text-sm text-gray-600 font-light">{format(new Date(report.created_at!), 'MMM dd, yyyy')}</span>
                  <span className="inline-flex items-center text-sm">
                    <button type="button" className="inline-flex space-x-2 text-gray-400 hover:text-gray-500">
                      <ChatAltIcon className="h-5 w-5" aria-hidden="true" />
                      <span className="text-gray-600">{report.number_of_comments}</span>
                      <span className="sr-only">replies</span>
                    </button>
                  </span>
                  <span className="inline-flex items-center text-sm">
                    <button type="button" className="inline-flex space-x-2 text-gray-400 hover:text-gray-500">
                      <EyeIcon className="h-5 w-5" aria-hidden="true" />
                      <span className="text-gray-600">{report.views}</span>
                      <span className="sr-only">views</span>
                    </button>
                  </span>
                </div>
                <div className="flex text-sm">
                  <span className="inline-flex items-center text-sm">
                    <button type="button" className="inline-flex space-x-2 text-gray-400 hover:text-gray-500">
                      <ShareIcon className="h-5 w-5" aria-hidden="true" />
                      <span className="text-gray-900">Share</span>
                    </button>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </article>
      </li>
    </>
  );
};

export default PureReportBadge;
