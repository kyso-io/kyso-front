/* eslint-disable @typescript-eslint/no-explicit-any */
import HCaptcha from '@hcaptcha/react-hcaptcha';
import { Dialog, Transition } from '@headlessui/react';
import type { UserDTO } from '@kyso-io/kyso-model';
import { KysoSettingsEnum } from '@kyso-io/kyso-model';
import { Api } from '@kyso-io/kyso-store';
import clsx from 'clsx';
import { Fragment, useEffect, useRef, useState } from 'react';
import { getLocalStorageItem } from '../helpers/isomorphic-local-storage';
import { usePublicSettings } from '../hooks/use-public-settings';

const DEFAULT_CAPTCHA_SITE_KEY = '22';

interface Props {
  user: UserDTO;
  open: boolean;
  redirectUrl?: string;
  onClose: (refreshUser: boolean) => void;
}

const CaptchaModal = ({ user, open, onClose, redirectUrl }: Props) => {
  const kysoSettingValues: (any | null)[] = usePublicSettings([KysoSettingsEnum.HCAPTCHA_ENABLED, KysoSettingsEnum.HCAPTCHA_SITE_KEY]);
  const hCaptchaRef = useRef(null);
  const [captchaSiteKey, setCaptchaSiteKey] = useState<string>(DEFAULT_CAPTCHA_SITE_KEY);
  const [captchaToken, setCaptchaToken] = useState<string>('');
  const [requesting, setRequesting] = useState<boolean>(false);

  useEffect(() => {
    if (!open) {
      return;
    }
    if (!user!.show_captcha) {
      onClose(false);
      return;
    }
    if (!kysoSettingValues[0]) {
      onClose(false);
      return;
    }
    if (!kysoSettingValues[1]) {
      /* eslint-disable no-alert */
      alert('Captcha is enabled but no site key is set. Please contact support.');
      return;
    }
    setCaptchaSiteKey(kysoSettingValues[1]);
  }, [open, user, kysoSettingValues]);

  const onSubmit = async () => {
    setRequesting(true);
    const token: string | null = getLocalStorageItem('jwt');
    const api: Api = new Api(token);
    await api.verifyCaptcha(captchaToken);
    // window.location.reload();
    if (redirectUrl) {
      window.location.href = redirectUrl;
    }
    onClose(true);
    setRequesting(false);
  };

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative" style={{ zIndex: 500 }} onClose={() => onClose(false)}>
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
              <Dialog.Panel className="relative overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="mt-3 text-center sm:mt-5">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                    Are you a bot?
                  </Dialog.Title>
                  <div className="max-w-xl">
                    <p className="mt-6 text-sm">Before we continue we have to make sure you are not a bot! Please solve the following captcha.</p>
                  </div>
                  <div className="mt-4" style={{ marginLeft: '20%' }}>
                    <HCaptcha ref={hCaptchaRef} sitekey={captchaSiteKey} onVerify={setCaptchaToken} />
                  </div>
                </div>
                <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                  <button
                    type="button"
                    className={clsx(
                      'inline-flex w-full justify-center rounded-md border border-transparent px-4 py-2 text-base font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 sm:col-start-2 sm:text-sm k-bg-primary',
                      !captchaToken || requesting ? 'cursor-not-allowed opacity-50' : '',
                    )}
                    onClick={onSubmit}
                    disabled={!captchaToken || requesting}
                  >
                    Continue
                  </button>
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:col-start-1 sm:mt-0 sm:text-sm"
                    onClick={() => onClose(false)}
                  >
                    Cancel
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

export default CaptchaModal;
