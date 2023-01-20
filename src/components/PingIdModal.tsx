/* eslint-disable @typescript-eslint/no-explicit-any */
import { Dialog, Transition } from '@headlessui/react';
import { AuthProviderSpec, LoginProviderEnum } from '@kyso-io/kyso-model';
import { Fragment, useState } from 'react';

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
  onClose: (authProviderSpec: AuthProviderSpec) => void;
}

const PingIdModal = ({ open, setOpen, onClose }: Props) => {
  const [url, setUrl] = useState<string>('');
  const [environtmentCode, setEnvirontmentCode] = useState<string>('');
  const [entityId, setEntityId] = useState<string>('');
  const [errorUrl, setErrorUrl] = useState<string>('');
  const [errorEnvirontmentCode, setErrorEnvirontmentCode] = useState<string>('');
  const [errorEntityId, setErrorEntityId] = useState<string>('');

  const clearData = () => {
    setEntityId('');
    setEnvirontmentCode('');
    setUrl('');
    setErrorEntityId('');
    setErrorEnvirontmentCode('');
    setErrorUrl('');
  };

  const save = () => {
    if (!url) {
      setErrorUrl('URL is required');
      return;
    }
    if (!environtmentCode) {
      setErrorEnvirontmentCode('Environment code is required');
      return;
    }
    if (!entityId) {
      setErrorEntityId('Entity ID is required');
      return;
    }
    const authProviderSpec: AuthProviderSpec = new AuthProviderSpec(LoginProviderEnum.PING_ID_SAML, {
      sso_url: url,
      environment_code: environtmentCode,
      sp_entity_id: entityId,
    });
    onClose(authProviderSpec);
    setOpen(false);
    clearData();
  };

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={setOpen}>
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
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                      PingID SAML integration
                    </Dialog.Title>
                    <div className="mt-2">
                      <div className="text-sm text-gray-500">
                        Please, insert the data related to PingID SAML integration. You can find the documentation{' '}
                        <a
                          href="https://kyso.io/in/lightside/settings/add/auth/pingid-saml"
                          className="relative cursor-pointer rounded-md bg-white font-medium text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:text-indigo-500"
                        >
                          here
                        </a>
                        .
                      </div>
                    </div>
                    <div className="grid grid-cols-6 gap-6">
                      <div className="col-span-12 sm:col-span-12 mt-4">
                        <label className="block text-sm font-medium text-gray-700">SSO URL</label>
                        <input
                          type="text"
                          value={url}
                          onChange={(e: any) => {
                            setUrl(e.target.value);
                            setErrorUrl('');
                          }}
                          placeholder="https://auth.pingone.eu"
                          className="mt-1.5 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                        {errorUrl ? <p className="text-sm my-1.5 text-danger-500">{errorUrl}</p> : <p className="text-sm my-1.5 text-gray-500">Enterprise PingId SSO URL.</p>}
                      </div>
                      <div className="col-span-12 sm:col-span-12">
                        <label className="block text-sm font-medium text-gray-700">Environment code</label>
                        <input
                          type="text"
                          value={environtmentCode}
                          onChange={(e: any) => {
                            setEnvirontmentCode(e.target.value);
                            setErrorEnvirontmentCode('');
                          }}
                          placeholder="0fda3448-9115-4ca7-b9d3-269d6029276a"
                          className="mt-1.5 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                        {errorEnvirontmentCode ? (
                          <p className="text-sm my-1.5 text-danger-500">{errorEnvirontmentCode}</p>
                        ) : (
                          <p className="text-sm my-1.5 text-gray-500">Environment identifier (not the Client ID).</p>
                        )}
                      </div>
                      <div className="col-span-12 sm:col-span-12">
                        <label className="block text-sm font-medium text-gray-700">Entity ID</label>
                        <input
                          type="text"
                          value={entityId}
                          onChange={(e: any) => {
                            setEntityId(e.target.value);
                            setErrorEntityId('');
                          }}
                          placeholder="kyso-api-entity-id"
                          className="mt-1.5 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                        {errorEntityId ? <p className="text-sm my-1.5 text-danger-500">{errorEntityId}</p> : <p className="text-sm my-1.5 text-gray-500">Unique Entity ID identifier.</p>}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={save}
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
                    onClick={() => {
                      setOpen(false);
                      clearData();
                    }}
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

export default PingIdModal;
