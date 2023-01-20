import NoLayout from '@/layouts/NoLayout';
import { ExclamationCircleIcon } from '@heroicons/react/solid';
import type { /* KysoSettingsEnum, */ UserDTO } from '@kyso-io/kyso-model';
import { useEffect, useState } from 'react';
import { Helper } from '@/helpers/Helper';
import UnPureVideoModal from '@/unpure-components/UnPureVideoModal';
import { checkJwt } from '@/helpers/check-jwt';
import type { KeyValue } from '@/model/key-value.model';
import { useUser } from '@/hooks/use-user';

const Index = () => {
  const [userIsLogged, setUserIsLogged] = useState<boolean | null>(null);
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [isOpen, setOpen] = useState(false);
  const loggedUser: UserDTO | null = useUser();

  useEffect(() => {
    const result: boolean = checkJwt();
    setUserIsLogged(result);
    const getOrganizationOptions = async () => {
      const publicKeys: KeyValue[] = await Helper.getKysoPublicSettings();

      if (!publicKeys || publicKeys.length === 0) {
        // return toaster.danger("An unknown error has occurred");
        return '';
      }
      // TODO create client_welcome_message in KysoSettings
      // const welcomeMessage = publicKeys.find((x) => x.key === KysoSettingsEnum.CLIENT_WELCOME_MESSAGE)?.value;

      const staticWelcomeMessage = 'publicKeys.find((x) => x.key === KysoSettingsEnum.CLIENT_WELCOME_MESSAGE)?.value;';
      // KysoSettingsEnum.ONBOARDING_MESSAGES;
      setWelcomeMessage(staticWelcomeMessage);

      return '';
    };

    getOrganizationOptions();
  }, []);
  if (userIsLogged === null) {
    return null;
  }

  return (
    <div className="bg-gray-200 min-h-screen">
      <div className="mx-auto max-w-7xl py-6 px-4 text-center sm:px-6 lg:px-8">
        {userIsLogged ? (
          <div>
            <div className="mx-auto py-16 px-4 text-center sm:py-20 sm:px-6 lg:px-8 border bg-gray-50 rounded-lg drop-shadow-2xl">
              <div className="mx-auto max-w-2xl">
                <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                  <span className="block">Welcome to Kyso!</span>
                </h2>
                <p className="mt-6 text-lg leading-6">{welcomeMessage || 'A place to share, organise and discover notebooks, markdown, static HTML sites, data apps, amd more ...'}</p>
                <p className="mt-6 text-lg leading-6">{'A place to share, organise and discover notebooks, markdown, static HTML sites, data apps, amd more ...'}</p>
                <UnPureVideoModal setOpen={setOpen} isOpen={isOpen} />
                <div className="my-11 justify-center text-center mx-auto max-w-sm" onClick={() => setOpen(!isOpen)}>
                  <div className="relative aspect-[2/1] overflow-hidden rounded-lg bg-gray-100 ring-1 ring-gray-900/10 hover:opacity-60 hover:cursor-pointer">
                    <img src="/static/demo.png" alt="" className="absolute inset-0 h-full w-full opacity-90" />
                  </div>
                </div>
              </div>
              <h2 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl py-6">
                <span className="block">What would you like to do?</span>
              </h2>
              <div className="mt-22 flex justify-center">
                <a href={`/${loggedUser?.username}/create-report-form?overview`}>
                  <div className="w-64 p-2 group relative before:absolute before:-inset-2.5 group-hover:rounded-lg  before:bg-gray-100 before:opacity-0 hover:before:opacity-100">
                    <div className="relative aspect-[2/1] overflow-hidden ">
                      <img src="/static/publishing.png" alt="" className="mx-auto relative inset-0 h-full group-hover:opacity-0 opacity-100" />
                      <img src="/static/publishing (1).png" alt="" className="mx-auto absolute inset-0 h-full group-hover:opacity-100 opacity-0" />
                    </div>
                    <h4 className="mt-4 text-sm font-medium text-slate-900 group-hover:text-indigo-600">
                      <span className="relative">Publish existing work</span>
                    </h4>
                    <p className="relative mt-1.5 text-xs font-medium text-slate-500">Publish and share your analysis to anyone in your organization.</p>
                  </div>
                </a>

                <a href="/kyso-examples/life-sciences/graphing-genomic-mutation-ratios?overview">
                  <div className=" w-64 p-2 group relative before:absolute before:-inset-2.5 group-hover:rounded-lg before:bg-gray-100 before:opacity-0 hover:before:opacity-100 mx-20">
                    <div className="relative aspect-[2/1] overflow-hidden">
                      <img src="/static/open-book (1).png" alt="" className="absolute mx-auto inset-0 h-full group-hover:opacity-0 opacity-100" />
                      <img src="/static/open-book.png" alt="" className="absolute mx-auto inset-0 h-full group-hover:opacity-100 opacity-0" />
                    </div>
                    <h4 className="mt-4 text-sm font-medium text-slate-900 group-hover:text-indigo-600">
                      <span className="relative">Read a report</span>
                    </h4>
                    <p className="relative mt-1.5 text-xs font-medium text-slate-500">Find understandable results on this report example.</p>
                  </div>
                </a>

                <a href="/search/?q=examples">
                  <div className=" w-64 p-2 group relative before:absolute before:-inset-2.5 group-hover:rounded-lg before:bg-gray-100 before:opacity-0 hover:before:opacity-100">
                    <div className="relative aspect-[2/1] overflow-hidden">
                      <img src="/static/search.png" alt="" className="mx-auto absolute inset-0 h-full group-hover:opacity-0 opacity-100" />
                      <img src="/static/search (1).png" alt="" className="mx-auto absolute inset-0 h-full group-hover:opacity-100 opacity-0" />
                    </div>
                    <h4 className="mt-4 text-sm font-medium text-slate-900 group-hover:text-indigo-600">
                      <span className="relative">Search and discover</span>
                    </h4>
                    <p className="relative mt-1.5 text-xs font-medium text-slate-500">Find, navigate and stay up to date on the existing set of work on a topic.</p>
                  </div>
                </a>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-md bg-yellow-50 p-4">
            <div className="flex">
              <div className="shrink-0">
                <ExclamationCircleIcon className="h-5 w-5 text-yellow-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Forbidden resource</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    Available only for registered users.{' '}
                    <a href="/login" className="font-bold">
                      Sign in
                    </a>{' '}
                    now.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

Index.layout = NoLayout;

export default Index;