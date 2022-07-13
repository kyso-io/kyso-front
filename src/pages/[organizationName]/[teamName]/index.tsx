import KysoTopBar from "@/layouts/KysoTopBar";
import { useRouter } from "next/router";
import { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import { DotsVerticalIcon, StarIcon, CodeIcon, FlagIcon, ThumbUpIcon, ChatAltIcon, EyeIcon, ShareIcon } from "@heroicons/react/solid";
import type { CommonData } from "@/hooks/use-common-data";
import { useCommonData } from "@/hooks/use-common-data";
import { useReports } from "@/hooks/use-reports";
import UnpureSidebar from "@/wrappers/UnpureSidebar";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

const Index = () => {
  // useAuth();
  // AVOID THIS
  // const { organization: activeOrganization, team: activeTeam } = useCommonData();
  // USE THIS. If we refactor the type, and remove or change the name of a property, is better to use the type instead of the
  // destructured one
  const commonData: CommonData = useCommonData();

  const router = useRouter();
  const reports = useReports();

  if (!router.query.teamName && !router.query.organizationName) {
    return <div>404</div>;
  }

  return (
    <>
      <UnpureSidebar>
        <div className="container mx-auto mt-6 flex">
          <div className="basis-2/">
            <div className="bg-white px-4 py-6 shadow sm:p-6 sm:rounded-lg">
              <a href={`${router.basePath}/${commonData.organization?.sluglified_name}/${commonData.team?.sluglified_name}/settings`} className="text-indigo-500">
                Go to channel settings
              </a>

              <h1>Channel Dashboard: {commonData.team?.display_name}</h1>
              <p>- [USER IS LOGGED IN AND MEMBER]: show list of all reports for that channel, pinned on top, and show member list component</p>
              <p>- [USER IS LOGGED IN AND NOT A MEMBER]: show list of public reports for that channel, pinned on top, no sidebar</p>
              <p>- [USER IS NOT LOGGED]: show list of public reports for that channel, pinned on top, no sidebar</p>
              <p>- [NONE OF THE ABOVE]: 404</p>
            </div>

            <div className="mt-8">
              <ul role="list" className="space-y-4">
                {reports?.map((report) => (
                  <li key={report.id} className="bg-white px-4 py-6 shadow sm:p-6 sm:rounded-lg">
                    <article aria-labelledby={`report-title-${report.id}`}>
                      <div>
                        <div className="flex space-x-3">
                          {report.preview_picture && (
                            <div className="shrink-0">
                              <img className="h-10 w-10 rounded-full" src={report.preview_picture} alt="" />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              <a href="#" className="hover:underline">
                                Eoin Murray
                              </a>
                            </p>
                            <p className="text-sm text-gray-500">
                              <a href="#" className="hover:underline">
                                {`${report?.created_at}`}
                              </a>
                            </p>
                          </div>
                          <div className="shrink-0 self-center flex">
                            <Menu as="div" className="relative inline-block text-left">
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
                                <Menu.Items
                                  className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white 
                                  ring-1 ring-black ring-opacity/5 focus:outline-none"
                                >
                                  <div className="py-1">
                                    <Menu.Item>
                                      {({ active }) => (
                                        <a href="#" className={classNames(active ? "bg-gray-100 text-gray-900" : "text-gray-700", "flex px-4 py-2 text-sm")}>
                                          <StarIcon className="mr-3 h-5 w-5 text-gray-400" aria-hidden="true" />
                                          <span>Add to favorites</span>
                                        </a>
                                      )}
                                    </Menu.Item>
                                    <Menu.Item>
                                      {({ active }) => (
                                        <a href="#" className={classNames(active ? "bg-gray-100 text-gray-900" : "text-gray-700", "flex px-4 py-2 text-sm")}>
                                          <CodeIcon className="mr-3 h-5 w-5 text-gray-400" aria-hidden="true" />
                                          <span>Embed</span>
                                        </a>
                                      )}
                                    </Menu.Item>
                                    <Menu.Item>
                                      {({ active }) => (
                                        <a href="#" className={classNames(active ? "bg-gray-100 text-gray-900" : "text-gray-700", "flex px-4 py-2 text-sm")}>
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
                        <h2 id={`report-title-${report.id}`} className="mt-4 text-base font-medium text-gray-900">
                          {report.title}
                        </h2>
                      </div>
                      <div className="mt-2 text-sm text-gray-700 space-y-4" dangerouslySetInnerHTML={{ __html: report.description }} />
                      <div className="mt-6 flex justify-between space-x-8">
                        <div className="flex space-x-6">
                          <span className="inline-flex items-center text-sm">
                            <button type="button" className="inline-flex space-x-2 text-gray-400 hover:text-gray-500">
                              <ThumbUpIcon className="h-5 w-5" aria-hidden="true" />
                              <span className="font-medium text-gray-900">{report.stars}</span>
                              <span className="sr-only">likes</span>
                            </button>
                          </span>
                          <span className="inline-flex items-center text-sm">
                            <button type="button" className="inline-flex space-x-2 text-gray-400 hover:text-gray-500">
                              <ChatAltIcon className="h-5 w-5" aria-hidden="true" />
                              <span className="font-medium text-gray-900">4</span>
                              <span className="sr-only">replies</span>
                            </button>
                          </span>
                          <span className="inline-flex items-center text-sm">
                            <button type="button" className="inline-flex space-x-2 text-gray-400 hover:text-gray-500">
                              <EyeIcon className="h-5 w-5" aria-hidden="true" />
                              <span className="font-medium text-gray-900">{report.views}</span>
                              <span className="sr-only">views</span>
                            </button>
                          </span>
                        </div>
                        <div className="flex text-sm">
                          <span className="inline-flex items-center text-sm">
                            <button type="button" className="inline-flex space-x-2 text-gray-400 hover:text-gray-500">
                              <ShareIcon className="h-5 w-5" aria-hidden="true" />
                              <span className="font-medium text-gray-900">Share</span>
                            </button>
                          </span>
                        </div>
                      </div>
                    </article>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="basis-1/3 ml-4"></div>
        </div>
      </UnpureSidebar>
    </>
  );
};

Index.layout = KysoTopBar;

export default Index;
