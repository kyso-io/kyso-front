/* eslint-disable @typescript-eslint/no-explicit-any */
import NoLayout from '@/layouts/NoLayout';
import { ExclamationCircleIcon } from '@heroicons/react/solid';
// import { KysoSettingsEnum } from '@kyso-io/kyso-model';
// import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Helper } from '@/helpers/Helper';
import UnPureVideoModal from '@/unpure-components/UnPureVideoModal';
import { checkJwt } from '../../helpers/check-jwt';

const Index = () => {
  // const router = useRouter();
  // const organizationName: string | undefined = router.query.organizationName as string | undefined;

  const [userIsLogged, setUserIsLogged] = useState<boolean | null>(null);
  const [welcomeText, setWelcomeText] = useState(
    'A place to publish, organise & discover presentation-ready research: Jupyter notebooks, HTML, Office files, SVS images, Markdown, Data Apps & much, much more!',
  );
  const firstCtaTitle = 'Publish your work.';
  const firstCtaText = 'Upload existing research - no matter the format - to be indexed & shared with colleagues.';
  const firstCtaUrl = 'Upload existing research - no matter the format - to be indexed & shared with colleagues.';

  const secondCtaTitle = 'Read a report.';
  const secondCtaText = 'Read through a report, interact with & comment on the results.';
  const secondCtaUrl = 'Read through a report, interact with & comment on the results.';

  const thirdCtaTitle = 'Search & discover.';
  const thirdCtaText = 'Find the research you’re interested in from colleagues across the organisation.';
  const thirdCtaUrl = 'Find the research you’re interested in from colleagues across the organisation.';

  const demoUrl = '"https://www.loom.com/share/fa23c122402243539909f038ddef590b';

  const [isOpen, setOpen] = useState(false);

  useEffect(() => {
    const result: boolean = checkJwt();
    setUserIsLogged(result);
    const getOrganizationOptions = async () => {
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      const publicKeys: any[] = await Helper.getKysoPublicSettings();

      if (!publicKeys || publicKeys.length === 0) {
        // return toaster.danger("An unknown error has occurred");
        return '';
      }
      // TODO create client_welcome_message in KysoSettings
      // const welcomeMessage = publicKeys.find((x) => x.key === KysoSettingsEnum.CLIENT_WELCOME_MESSAGE)?.value;

      const clientWelcomeText = 'publicKeys.find((x) => x.key === KysoSettingsEnum.CLIENT_WELCOME_MESSAGE)?.value;';
      setWelcomeText(clientWelcomeText);

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
                <p className="mt-6 text-lg leading-6">{welcomeText}</p>

                <UnPureVideoModal setOpen={setOpen} isOpen={isOpen} demoUrl={demoUrl} />
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
                <a href={firstCtaUrl}>
                  <div className="w-64 p-2 group relative before:absolute before:-inset-2.5 group-hover:rounded-lg  before:bg-gray-100 before:opacity-0 hover:before:opacity-100">
                    <div className="relative aspect-[2/1] overflow-hidden ">
                      <img src="/static/publishing.png" alt="" className="mx-auto relative inset-0 h-full group-hover:opacity-0 opacity-100" />
                      <img src="/static/publishing (1).png" alt="" className="mx-auto absolute inset-0 h-full group-hover:opacity-100 opacity-0" />
                    </div>
                    <h4 className="mt-4 text-sm font-medium text-slate-900 group-hover:text-indigo-600">
                      <span className="relative">{firstCtaTitle}</span>
                    </h4>
                    <p className="relative mt-1.5 text-xs font-medium text-slate-500">{firstCtaText}</p>
                  </div>
                </a>

                <a href={secondCtaUrl}>
                  <div className=" w-64 p-2 group relative before:absolute before:-inset-2.5 group-hover:rounded-lg before:bg-gray-100 before:opacity-0 hover:before:opacity-100 mx-20">
                    <div className="relative aspect-[2/1] overflow-hidden">
                      <img src="/static/open-book (1).png" alt="" className="absolute mx-auto inset-0 h-full group-hover:opacity-0 opacity-100" />
                      <img src="/static/open-book.png" alt="" className="absolute mx-auto inset-0 h-full group-hover:opacity-100 opacity-0" />
                    </div>
                    <h4 className="mt-4 text-sm font-medium text-slate-900 group-hover:text-indigo-600">
                      <span className="relative">{secondCtaTitle}</span>
                    </h4>
                    <p className="relative mt-1.5 text-xs font-medium text-slate-500">{secondCtaText}</p>
                  </div>
                </a>

                <a href={thirdCtaUrl}>
                  <div className=" w-64 p-2 group relative before:absolute before:-inset-2.5 group-hover:rounded-lg before:bg-gray-100 before:opacity-0 hover:before:opacity-100">
                    <div className="relative aspect-[2/1] overflow-hidden">
                      <img src="/static/search.png" alt="" className="mx-auto absolute inset-0 h-full group-hover:opacity-0 opacity-100" />
                      <img src="/static/search (1).png" alt="" className="mx-auto absolute inset-0 h-full group-hover:opacity-100 opacity-0" />
                    </div>
                    <h4 className="mt-4 text-sm font-medium text-slate-900 group-hover:text-indigo-600">
                      <span className="relative">{thirdCtaTitle}</span>
                    </h4>
                    <p className="relative mt-1.5 text-xs font-medium text-slate-500">{thirdCtaText}</p>
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
