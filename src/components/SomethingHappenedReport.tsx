/* eslint-disable @typescript-eslint/no-explicit-any */
import { TeamVisibilityEnum } from '@kyso-io/kyso-model';
import { Api } from '@kyso-io/kyso-store';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import type { HttpExceptionDto } from '../interfaces/http-exception.dto';
import type { CommonData } from '../types/common-data';
import DelayedContent from './DelayedContent';
import { SomethingHappened } from './SomethingHappened';

interface Props {
  whatHappened: string;
  addRequestAccessButton?: boolean;
  commonData: CommonData;
  teamVisibility: TeamVisibilityEnum | null;
}

const SomethingHappenedReport = ({ whatHappened, addRequestAccessButton, commonData, teamVisibility }: Props) => {
  const [requestCreatedSuccessfully, setRequestCreatedSuccessfully] = useState<boolean>(false);
  const [requestCreatedError, setRequestCreatedError] = useState<HttpExceptionDto | null>(null);
  const router = useRouter();
  const { organizationName, teamName } = router.query;

  return (
    <DelayedContent delay={3000} skeletonTemplate={<></>}>
      <React.Fragment>
        <SomethingHappened description={whatHappened} />
        {addRequestAccessButton && commonData && !requestCreatedSuccessfully && !requestCreatedError && (
          <div className="bg-white shadow sm:rounded-lg mx-32">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-0.5 text-sm font-medium text-green-800">New!</span>
                &nbsp;&nbsp;Request access
              </h3>
              <div className="mt-2 sm:flex sm:items-start sm:justify-between">
                <div className="max-w-xl text-sm text-gray-500">
                  <p>Send a request access to organization and team administrators. If they approve your request we will send you a confirmation message</p>
                </div>
                <div className="mt-5 sm:mt-0 sm:ml-6 sm:flex sm:shrink-0 sm:items-center">
                  {
                    /* Team not private. Request access to organization */
                    teamVisibility !== TeamVisibilityEnum.PRIVATE && (
                      <button
                        onClick={() => {
                          const api: Api = new Api(commonData.token);
                          api
                            .requestAccessToOrganization(organizationName as string)
                            .then(() => {
                              setRequestCreatedSuccessfully(true);
                            })
                            .catch((e: any) => {
                              const httpExceptionDto: HttpExceptionDto = e.response.data;
                              setRequestCreatedError(httpExceptionDto);
                            });
                        }}
                        type="button"
                        className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:text-sm"
                      >
                        Request access
                      </button>
                    )
                  }
                  {
                    /* Team private. Request access to organization */
                    teamVisibility === TeamVisibilityEnum.PRIVATE && (
                      <button
                        onClick={() => {
                          const api: Api = new Api(commonData.token);
                          api
                            .requestAccessToTeam(organizationName as string, teamName as string)
                            .then(() => {
                              setRequestCreatedSuccessfully(true);
                            })
                            .catch((e: any) => {
                              const httpExceptionDto: HttpExceptionDto = e.response.data;
                              setRequestCreatedError(httpExceptionDto);
                            });
                        }}
                        type="button"
                        className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:text-sm"
                      >
                        Request access to this channel
                      </button>
                    )
                  }
                </div>
              </div>
            </div>
          </div>
        )}
        {requestCreatedSuccessfully && (
          <div className="bg-white shadow sm:rounded-lg mx-32">
            <div className="px-4 py-5 sm:p-6">
              <div className="rounded-md bg-green-50 p-4">
                <div className="flex">
                  <div className="shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">Request completed</h3>
                    <div className="mt-2 text-sm text-green-700">
                      <p>Your request have been sent to the administrators. You will receive an email notification as soon as the administrators process and approve or reject your request.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {requestCreatedError && (
          <div className="bg-white shadow sm:rounded-lg mx-32">
            <div className="px-4 py-5 sm:p-6">
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error on request</h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>
                        We are sorry, but an error occurred when sending your access request: <strong>{requestCreatedError.message}</strong>
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-4" style={{ paddingLeft: '95%' }}>
                  <div className="-mx-2 -my-1.5 flex">
                    <button
                      type="button"
                      onClick={() => setRequestCreatedError(null)}
                      className="rounded-md bg-green-50 px-2 py-1.5 text-sm font-medium text-green-800 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 focus:ring-offset-green-50"
                    >
                      Try again
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </React.Fragment>
    </DelayedContent>
  );
};

export default SomethingHappenedReport;
