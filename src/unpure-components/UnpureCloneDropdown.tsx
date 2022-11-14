/* eslint-disable  @typescript-eslint/no-explicit-any */
import PureKysoButton from '@/components/PureKysoButton';
import type { CommonData } from '@/types/common-data';
import { KysoButton } from '@/types/kyso-button.enum';
import { Popover } from '@headlessui/react';
import { ChevronDownIcon, ClipboardCopyIcon, ExclamationCircleIcon, FolderDownloadIcon, TerminalIcon } from '@heroicons/react/outline';
import type { NormalizedResponseDTO, ReportDTO, UserDTO } from '@kyso-io/kyso-model';
import { Api } from '@kyso-io/kyso-store';
import saveAs from 'file-saver';
import { useEffect, useState } from 'react';
import slugify from 'slugify';
import CaptchaModal from '../components/CaptchaModal';
import ToasterNotification from '../components/ToasterNotification';

interface Props {
  reportUrl: string;
  report: ReportDTO;
  commonData: CommonData;
  hasPermissionDeleteReport: boolean;
  hasPermissionEditReport: boolean;
  setUser: (user: UserDTO) => void;
}

const UnpureCloneDropdown = ({ reportUrl, commonData, report, setUser }: Props) => {
  const [show, setShow] = useState(false);
  const [copied, setCopied] = useState(false);
  const [alertText, setAlertText] = useState<string>('Creating zip, this may take a moment...');
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [error, setError] = useState<boolean>(false);
  const [showCaptchaModal, setShowCaptchaModal] = useState<boolean>(false);

  useEffect(() => {
    if (!show) {
      setTimeout(() => {
        setError(false);
      }, 1000);
    }
  }, [show]);

  const downloadReport = async () => {
    if (commonData.user && commonData.user.show_captcha) {
      setShowCaptchaModal(true);
      return;
    }
    setError(false);
    setAlertText('Creating zip, this may take a moment...');
    setShow(true);
    try {
      const api: Api = new Api(commonData.token);
      const result: Buffer = await api.downloadReport(report.id!);
      const blob = new Blob([result], { type: 'application/zip' });
      saveAs(blob, `${slugify(report.name)}.zip`);
      setAlertText('Download fininshed.');
    } catch (e: any) {
      setError(true);
      const errorData: any = JSON.parse(Buffer.from(e.response.data).toString());
      setAlertText(errorData.message);
    }
    setTimeout(() => {
      setShow(false);
      setError(false);
    }, 5000);
  };

  const onCloseCaptchaModal = async (refreshUser: boolean) => {
    setShowCaptchaModal(false);
    if (refreshUser) {
      const api: Api = new Api(commonData.token);
      const result: NormalizedResponseDTO<UserDTO> = await api.getUserFromToken();
      setUser(result.data);
    }
  };

  const cloneCommand = `kyso clone ${reportUrl}`;

  return (
    <>
      <Popover as="div" className="relative inline-block">
        <Popover.Button className="p-1.5 px-2 font-medium hover:bg-gray-100 text-sm text-gray-700 flex flex-row items-center focus:ring-0 focus:outline-none">
          Clone
          <ChevronDownIcon className="w-5 h-5" />
        </Popover.Button>

        <Popover.Panel className="min-w-[400px] p-4 origin-top-right absolute right-0 mt-2 rounded-md shadow-lg bg-white border focus:outline-none" style={{ zIndex: 1 }}>
          <div className="flex flex-col space-y-8">
            <div className="flex flex-col space-y-4">
              <div className="flex flex-row items-center space-x-2">
                <TerminalIcon className="w-5 h-5" />
                <div className="text-md font-medium">Clone with Kyso CLI</div>
              </div>

              <div className="mt-1 sm:mt-0 sm:col-span-2">
                <div className="max-w-lg flex rounded-md shadow-sm">
                  <input
                    defaultValue={cloneCommand}
                    type="text"
                    className="flex-1 block w-full focus:ring-indigo-500 focus:border-indigo-500 min-w-0 rounded-none rounded-l-md sm:text-sm border-gray-300"
                  />
                  <button
                    type="button"
                    className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-500 sm:text-sm"
                    onClick={async () => {
                      navigator.clipboard.writeText(cloneCommand);
                      setCopied(true);
                      if (timeoutId != null) {
                        clearTimeout(timeoutId);
                      }
                      const t: NodeJS.Timeout = setTimeout(() => {
                        setCopied(false);
                      }, 3000);
                      setTimeoutId(t);
                    }}
                  >
                    {!copied && <ClipboardCopyIcon className="w-5 h-5" />}
                    {copied && 'Copied!'}
                  </button>
                </div>
              </div>
            </div>
            <PureKysoButton type={KysoButton.TERCIARY} onClick={() => downloadReport()} className={'flex flex-row text-base font-medium text-gray-900'}>
              <div className="flex flex-row items-center space-x-2">
                <FolderDownloadIcon className="w-6 h-6 text-gray-900" />
                <div className="text-base font-medium text-gray-900">Download zip</div>
              </div>
            </PureKysoButton>
          </div>
        </Popover.Panel>
      </Popover>
      <ToasterNotification
        show={show}
        setShow={setShow}
        icon={error ? <ExclamationCircleIcon className="h-6 w-6 text-red-400" aria-hidden="true" /> : <FolderDownloadIcon className="h-6 w-6 text-green-400" aria-hidden="true" />}
        message={alertText}
      />
      {commonData.user && <CaptchaModal user={commonData.user!} open={showCaptchaModal} onClose={onCloseCaptchaModal} />}
    </>
  );
};

export default UnpureCloneDropdown;
