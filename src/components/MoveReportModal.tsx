/* eslint-disable @typescript-eslint/no-explicit-any */
import { Dialog, Transition } from '@headlessui/react';
import type { NormalizedResponseDTO, ReportDTO, ResourcePermissions } from '@kyso-io/kyso-model';
import { MoveReportDto, ReportPermissionsEnum } from '@kyso-io/kyso-model';
import { Api } from '@kyso-io/kyso-store';
import clsx from 'clsx';
import { useRouter } from 'next/router';
import React, { Fragment, useEffect, useMemo, useState } from 'react';
import { ToasterIcons } from '../enums/toaster-icons';
import { HelperPermissions } from '../helpers/check-permissions';
import type { HttpExceptionDto } from '../interfaces/http-exception.dto';
import type { CommonData } from '../types/common-data';

interface Props {
  show: boolean;
  setShow: (show: boolean) => void;
  report: ReportDTO;
  commonData: CommonData;
  showToaster: (message: string, icon: JSX.Element) => void;
}

const MoveReportModal: React.FC<Props> = ({ show, setShow, report, commonData, showToaster }: Props) => {
  const router = useRouter();
  const [formData, setFormData] = useState<{
    organizationId: string;
    teamId: string;
    title: string;
    reportExists: boolean;
  }>({
    organizationId: '',
    teamId: '',
    title: '',
    reportExists: false,
  });
  const [requesting, setRequesting] = useState<boolean>(false);
  const [requestingReportName, setRequestingReportName] = useState<boolean>(false);

  useEffect(() => {
    if (!formData.teamId) {
      return;
    }
    checkReportExists();
  }, [formData.teamId]);

  const teamsResourcePermissions: ResourcePermissions[] = useMemo(() => {
    if (!report || !commonData.permissions || !commonData.permissions.teams) {
      return [];
    }
    return commonData.permissions.teams.filter((p: ResourcePermissions) => {
      if (p.id === report.team_id) {
        return false;
      }
      return HelperPermissions.hasPermissions(commonData.permissions!, [ReportPermissionsEnum.CREATE], p.organization_id!, p.id);
    });
  }, [report, commonData]);

  const orgsResourcePermissions: ResourcePermissions[] = useMemo(() => {
    if (!commonData.permissions || !commonData.permissions.organizations || commonData.permissions.organizations.length === 0 || teamsResourcePermissions.length === 0) {
      return [];
    }
    return commonData.permissions.organizations.filter((p: ResourcePermissions) => {
      const index: number = teamsResourcePermissions.findIndex((t: ResourcePermissions) => t.organization_id === p.id);
      return index !== -1;
    });
  }, [commonData, teamsResourcePermissions]);

  const availableTeams: ResourcePermissions[] = useMemo(() => {
    if (!formData.organizationId || teamsResourcePermissions.length === 0) {
      return [];
    }
    return teamsResourcePermissions.filter((p: ResourcePermissions) => p.organization_id === formData.organizationId);
  }, [formData.organizationId, teamsResourcePermissions]);

  const moveButtonEnabled: boolean = useMemo(() => {
    if (!formData.organizationId || !formData.teamId || requesting || requestingReportName) {
      return false;
    }
    if (formData.reportExists && formData.title === '') {
      return false;
    }
    return true;
  }, [formData, requesting, requestingReportName]);

  const checkReportExists = async () => {
    try {
      setRequestingReportName(true);
      const orgResourcePermissions: ResourcePermissions = orgsResourcePermissions.find((p: ResourcePermissions) => p.id === formData.organizationId)!;
      const teamResourcePermissions: ResourcePermissions = availableTeams.find((p: ResourcePermissions) => p.id === formData.teamId)!;
      const api: Api = new Api(commonData.token, orgResourcePermissions.name, teamResourcePermissions.name);
      const result: boolean = await api.reportExists(teamResourcePermissions.id, report.title);
      setFormData((prev: any) => ({ ...prev, reportExists: result }));
    } catch (e: any) {
      const httpExceptionDto: HttpExceptionDto = e.response.data;
      showToaster(httpExceptionDto.message, ToasterIcons.ERROR);
    } finally {
      setRequestingReportName(false);
    }
  };

  const close = () => {
    if (requesting) {
      return;
    }
    setShow(false);
  };

  const moveReport = async () => {
    if (requesting) {
      return;
    }
    setRequesting(true);
    showToaster('Moving report. This process can take a while.', ToasterIcons.INFO);
    try {
      const api: Api = new Api(commonData.token);
      const moveReportDto: MoveReportDto = new MoveReportDto(report.id!, formData.teamId, formData.title);
      const result: NormalizedResponseDTO<ReportDTO> = await api.moveReport(moveReportDto);
      const movedReport: ReportDTO = result.data;
      showToaster('Report moved successfully.', ToasterIcons.SUCCESS);
      setShow(false);
      setTimeout(() => {
        router.replace(`/${movedReport.organization_sluglified_name}/${movedReport.team_sluglified_name}/${movedReport.name}`);
      }, 1000);
    } catch (e: any) {
      const httpExceptionDto: HttpExceptionDto = e.response.data;
      showToaster(httpExceptionDto.message, ToasterIcons.ERROR);
      setRequesting(false);
    }
  };

  return (
    <Transition.Root show={show} as={Fragment}>
      <Dialog as="div" static className="relative z-10" onClose={() => {}}>
        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-gray-500/50 transition-opacity" />
        </Transition.Child>
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-xl sm:p-6">
                <div>
                  <div className="absolute top-0 right-0 hidden pt-4 pr-4 sm:block">
                    <button
                      type="button"
                      onClick={close}
                      className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-indigo-500 focus:ring-offset-2"
                      title="Close dialog"
                    >
                      <span className="sr-only">Close</span>
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                    </button>
                  </div>
                  <div className="mt-3 sm:mt-5">
                    <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                      Move project
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">Move this project to another channel.</p>
                    </div>
                    <div className="mt-2 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-6">
                      <div className="sm:col-span-3">
                        <label className="block text-sm font-medium leading-6 text-gray-900">Organization</label>
                        <div className="mt-2">
                          <select
                            className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            value={formData.organizationId}
                            onChange={(e) => setFormData({ organizationId: e.target.value, teamId: '', title: '', reportExists: false })}
                          >
                            <option value="">Select an option</option>
                            {orgsResourcePermissions.map((p: ResourcePermissions) => (
                              <option key={p.id} value={p.id}>
                                {p.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="sm:col-span-3">
                        <label className="block text-sm font-medium leading-6 text-gray-900">Channel</label>
                        <div className="mt-2">
                          <select
                            className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            value={formData.teamId}
                            onChange={(e) => setFormData({ ...formData, teamId: e.target.value, title: '', reportExists: false })}
                            disabled={!formData.organizationId}
                          >
                            <option value="">{!formData.organizationId ? 'Select an organization' : 'Select an option'}</option>
                            {availableTeams.map((p: ResourcePermissions) => (
                              <option key={p.id} value={p.id}>
                                {p.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      {formData.reportExists && (
                        <React.Fragment>
                          <div className="col-span-full">
                            <p className="text-sm text-gray-500">The destination channel already has a report with the same name.</p>
                          </div>
                          <div className="col-span-full">
                            <label className="block text-sm font-medium leading-6 text-gray-900">New report name</label>
                            <div className="mt-2">
                              <input
                                type="text"
                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                              />
                            </div>
                          </div>
                        </React.Fragment>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    disabled={!moveButtonEnabled}
                    className={clsx(
                      'inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-base font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 sm:col-start-2 sm:text-sm ml-2 k-bg-primary',
                      !moveButtonEnabled && 'opacity-50 cursor-not-allowed',
                    )}
                    onClick={moveReport}
                  >
                    Move
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default MoveReportModal;
