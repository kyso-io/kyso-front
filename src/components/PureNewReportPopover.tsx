/* eslint-disable react-hooks/rules-of-hooks */
import checkPermissions from '@/helpers/check-permissions';
import type { CommonData } from '@/types/common-data';
import { Popover } from '@headlessui/react';
import { ChevronDownIcon, ChevronUpIcon, ClipboardCopyIcon, ExclamationCircleIcon, PencilAltIcon, TerminalIcon } from '@heroicons/react/outline';
import { ReportPermissionsEnum } from '@kyso-io/kyso-model';
import { useRouter } from 'next/router';
import React, { useEffect, useMemo, useState } from 'react';
import { TailwindColor } from '../tailwind/enum/tailwind-color.enum';
import ToasterNotification from './ToasterNotification';

const TIMEOUT_MS = 5000;

interface Props {
  commonData: CommonData;
  captchaIsEnabled: boolean;
}

const PureNewReportPopover = (props: Props) => {
  const router = useRouter();
  const [showToaster, setShowToaster] = useState<boolean>(false);
  const [messageToaster, setMessageToaster] = useState<string>('');
  const { commonData, captchaIsEnabled } = props;

  const hasPermissionCreateReport = useMemo(() => checkPermissions(commonData, ReportPermissionsEnum.CREATE), [commonData]);

  const [copiedKysoConfigFile, setCopiedKysoConfigFile] = useState<boolean>(false);
  const [copiedKysoPush, setCopiedKysoPush] = useState<boolean>(false);

  const kysoYamlContent = `organization: ${commonData.organization?.sluglified_name}\nchannel: ${
    commonData.team?.sluglified_name || 'channel-name'
  }\ntype: markdown\ntitle: "Add your title"\nmain: Readme.md`;
  let createLink = `/${commonData.organization?.sluglified_name}/create-report`;

  if (commonData.team) {
    createLink = `/${commonData.organization?.sluglified_name}/${commonData.team?.sluglified_name}/create-report`;
  }

  return (
    <React.Fragment>
      <Popover as="div" className="z-50 relative inline-block">
        {({ open }) => {
          useEffect(() => {
            if (!open) {
              setCopiedKysoConfigFile(false);
              setCopiedKysoPush(false);
            }
          }, [open]);

          if (!hasPermissionCreateReport) {
            return <></>;
          }

          return (
            <React.Fragment>
              <Popover.Button className="w-fit whitespace-nowrap p-3 font-medium text-white rounded bg-kyso-600 hover:bg-kyso-700 text-sm flex flex-row items-center focus:ring-0 focus:outline-none">
                Post a report
                {open ? <ChevronUpIcon className="w-5 h-5 ml-2" /> : <ChevronDownIcon className="w-5 h-5 ml-2" />}
              </Popover.Button>

              <Popover.Panel className="min-w-[400px] origin-top-right absolute right-0 mt-2 rounded-md shadow-lg bg-white border focus:outline-none">
                <div className="flex flex-col ">
                  <div className="p-4 border-b cursor-pointer">
                    <a
                      onClick={() => {
                        if (captchaIsEnabled && commonData.user?.show_captcha === true) {
                          setShowToaster(true);
                          setMessageToaster('Please verify the captcha');
                          setTimeout(() => {
                            setShowToaster(false);
                            sessionStorage.setItem('redirectUrl', createLink);
                            router.push('/captcha');
                          }, 2000);
                          return;
                        }
                        router.push(createLink);
                      }}
                      className="hover:text-indigo-700"
                    >
                      <div className=" flex flex-row items-center space-x-2">
                        <PencilAltIcon className="w-5 h-5" />
                        <div className="text-md font-medium">Create new report in UI</div>
                      </div>
                      <div className="text-sm">Create a report in Kyso{"'s"} web editor.</div>
                    </a>
                  </div>

                  <div className="p-4 flex flex-col space-y-2">
                    <div className="flex flex-row items-center space-x-2">
                      <TerminalIcon className="w-5 h-5" />
                      <div className="text-md font-medium">Push with the Kyso CLI</div>
                    </div>

                    <div className="text-sm">
                      1. Install the{' '}
                      <a className="underline" href="https://cli.kyso.io/" target="_blank" rel="noreferrer">
                        Kyso CLI
                      </a>
                    </div>

                    <div className="text-sm">2. Copy this yaml to a kyso.yaml in your project directory.</div>

                    <div className="my-2 max-w-lg flex rounded-md shadow-sm">
                      <textarea readOnly rows={5} value={kysoYamlContent} className="flex-1 block w-full focus:ring-0 focus:outline-none min-w-0 rounded-md sm:text-sm border-gray-300" />
                    </div>

                    <div className="flex flex-row w-full justify-end">
                      <button
                        type="button"
                        className="inline-flex items-center hover:bg-gray-100 text-gray-500 rounded-md sm:text-sm px-2.5 py-1.5"
                        onClick={async () => {
                          navigator.clipboard.writeText(kysoYamlContent);
                          setCopiedKysoConfigFile(true);
                          setTimeout(() => {
                            setCopiedKysoConfigFile(false);
                          }, TIMEOUT_MS);
                        }}
                      >
                        {!copiedKysoConfigFile && (
                          <div className="flex items-center">
                            <ClipboardCopyIcon className="w-5 h-5 mr-1" />
                            Copy
                          </div>
                        )}
                        {copiedKysoConfigFile && 'Copied!'}
                      </button>
                    </div>

                    <div className="text-sm">3. Run kyso push</div>

                    <div className="my-2 max-w-lg flex rounded-md shadow-sm">
                      <textarea readOnly rows={1} value={`kyso push`} className="flex-1 block w-full focus:ring-0 focus:outline-none min-w-0 rounded-md sm:text-sm border-gray-300" />
                    </div>

                    <div className="flex flex-row w-full justify-end">
                      <button
                        type="button"
                        className="inline-flex items-center hover:bg-gray-100 text-gray-500 sm:text-sm"
                        onClick={async () => {
                          navigator.clipboard.writeText(kysoYamlContent);
                          setCopiedKysoPush(true);
                          setTimeout(() => {
                            setCopiedKysoPush(false);
                          }, TIMEOUT_MS);
                        }}
                      >
                        {!copiedKysoPush && (
                          <div className="flex items-center">
                            <ClipboardCopyIcon className="w-5 h-5 mr-1" />
                            Copy
                          </div>
                        )}
                        {copiedKysoPush && 'Copied!'}
                      </button>
                    </div>
                  </div>
                </div>
              </Popover.Panel>
            </React.Fragment>
          );
        }}
      </Popover>
      <ToasterNotification
        show={showToaster}
        setShow={setShowToaster}
        icon={<ExclamationCircleIcon className="h-6 w-6 text-red-400" aria-hidden="true" />}
        message={messageToaster}
        backgroundColor={TailwindColor.SLATE_50}
      />
    </React.Fragment>
  );
};

export default PureNewReportPopover;
