import { Helper } from '@/helpers/Helper';
import { getLocalStorageItem } from '@/helpers/isomorphic-local-storage';
import { CheckCircleIcon, ChevronDoubleRightIcon, XCircleIcon } from '@heroicons/react/solid';
import type { KysoSetting, NormalizedResponseDTO, UserDTO } from '@kyso-io/kyso-model';
import { KysoSettingsEnum, OnboardingProgress, UpdateUserRequestDTO } from '@kyso-io/kyso-model';
import { Api } from '@kyso-io/kyso-store';
import { ProgressBar } from 'primereact/progressbar';
import { useEffect, useState } from 'react';

interface Props {
  user: UserDTO;
  setValue: (value: string) => void;
}

enum Cta {
  One,
  Two,
  Three,
  Four,
  Five,
  All,
}

const markCtaDone = async (cta: Cta, loggedUser: UserDTO) => {
  const userProgress: OnboardingProgress = loggedUser.onboarding_progress;

  switch (cta) {
    case Cta.One:
      userProgress.step_1 = true;
      break;
    case Cta.Two:
      userProgress.step_2 = true;
      break;
    case Cta.Three:
      userProgress.step_3 = true;
      break;
    case Cta.Four:
      userProgress.step_4 = true;
      break;
    case Cta.Five:
      userProgress.step_5 = true;
      break;
    case Cta.All:
      userProgress.step_1 = true;
      userProgress.step_2 = true;
      userProgress.step_3 = true;
      userProgress.step_4 = true;
      userProgress.step_5 = true;
      userProgress.finish_and_remove = true;
      break;
    default:
      break;
  }

  const token: string | null = getLocalStorageItem('jwt');
  const api: Api = new Api(token);

  const updateUserRequestDto: UpdateUserRequestDTO = new UpdateUserRequestDTO(
    loggedUser!.name,
    loggedUser!.display_name,
    loggedUser!.location,
    loggedUser!.link,
    loggedUser!.bio,
    false,
    loggedUser!.onboarding_progress,
  );

  await api.updateUser(loggedUser!.id, updateUserRequestDto);
};

const PureCheckListTour = (props: Props) => {
  const [progress, setProgress] = useState(0);
  const [onboardingProgress, setOnboardingProgress] = useState(OnboardingProgress.createEmpty());
  const { setValue, user } = props;

  // default values
  /* eslint-disable no-template-curly-in-string */
  const [onboardingMessages, setOnboardingMessages] = useState({
    welcome_message: 'A place to publish, organise & discover presentation-ready research: Jupyter notebooks, HTML, Office files, SVS images, Markdown, Data Apps & much, much more!',
    demo_url: 'https://www.loom.com/embed/fa23c122402243539909f038ddef590b',
    first_cta: {
      title: 'Publish your work.',
      text: 'Upload existing research - no matter the format - to be indexed & shared with colleagues.',
      url: '/${user}/create-report-form',
    },
    second_cta: {
      title: 'Read a report.',
      text: 'Read through a report, interact with & comment on the results.',
      url: '/kyso-examples/general/kyso-report-examples/',
    },
    third_cta: {
      title: 'Search & discover.',
      text: 'Find the research you’re interested in from colleagues across the organisation.',
      url: '/search/?q=examples',
    },
    dropdown: {
      title: 'Welcome on board!',
      text: 'Here is your Onboard checklist',
      step_1: {
        title: 'Publish your work.',
        description: 'Upload existing research - no matter the format - to be indexed & shared with colleagues.',
        text: 'This is where you can upload existing files you might have ready to share. Post PowerPoints, notebooks, Word Docs, images & more. Make sure to upload to the correct channel and add tags to make it easier to find later.',
        demoUrl: 'https://www.loom.com/embed/55bcdb4f02f74b6590e39eae2ebb1af8',
        demoPreview: '/static/demo.png',
        cta: ' Publish my research now!',
        ctaUrl: 'https://kyso.io/kyso-examples/create-report-form/',
        docCta: 'What else can I publish?',
        docUrl: 'https://docs.kyso.io/kysos-renderer',
      },
      step_2: {
        title: 'Read a report.',
        description: 'Read through a report, interact with & comment on results. ',
        text: 'This is an example Jupyter notebook rendered for presentation on Kyso. You can browse through files & previous versions, reveal code, interact with your colleague’s insights and make comments like you would on Google Docs.',
        demoUrl: 'https://www.loom.com/embed/db8ef30de06b4b6392bd8898cdb03f71',
        demoPreview: '/static/read.png',
        cta: ' Discover other reports to read!',
        ctaUrl: 'https://kyso.io/search/?q=',
        docUrl: '',
        docCta: '',
      },
      step_3: {
        title: 'Search & discover.',
        description: 'Find research you’re interested in from colleagues across the organisation.',
        text: 'Content published to Kyso is categorised across different Organisations, Channels and Tags, and is indexed full-text so you can be very specific when searching for research you are interested in.',
        demoUrl: 'https://www.loom.com/embed/d408c2bf05f14e1db051f85f2efcb6f5',
        demoPreview: '/static/demo.png',
        cta: 'Discover other reports to read!',
        ctaUrl: 'https://kyso.io/search/?q=',
        docUrl: '',
        docCta: '',
      },
      step_4: {
        title: 'View my profile.',
        description: 'See how your work is displayed for others to discover and learn from.',
        text: 'This is the page your colleagues will see when they click on your Kyso avatar to discover & learn from your work. Be sure to keep your reports up to date. ',
        demoUrl: 'https://www.loom.com/embed/56350d3e51bb4d21a312caf94282110f',
        demoPreview: '/static/profile.png',
        cta: ' Publish my research now!',
        ctaUrl: 'https://kyso.io/kyso-examples/create-report-form/',
        docCta: ' How do access controls work on Kyso?',
        docUrl: 'https://docs.kyso.io/settings-and-administration/managing-access',
      },
      step_5: {
        title: 'Install & integrate Kyso into your workflows.',
        description: 'Download & install the Kyso CLI tool so you can publish (many) results automatically from within your technical workflows: git, s3, Domino & more!',
        text: 'Install the Kyso CLI tool so you can integrate the publishing process into your data science workflows, whether that means pushing models from MLOps platforms like Domino or leveraging Git actions to maintain version control across the team.',
        demoUrl: 'https://www.loom.com/embed/5e67af40d0c948f4b3bdeb5b29b4c3a0',
        demoPreview: '/static/cli.png',
        cta: 'Install the Kyso CLI now! ',
        ctaUrl: 'https://docs.kyso.io/posting-to-kyso/kyso-command-line-tool',
        docCta: 'How to create an access token?',
        docUrl: 'https://dev.kyso.io/kyleos/docs/getting-started-with-kyso/kyso-cli.md',
      },
    },
  });

  useEffect(() => {
    const getData = async () => {
      try {
        const api: Api = new Api();
        const resultKysoSetting: NormalizedResponseDTO<KysoSetting[]> = await api.getPublicSettings();

        const onboardingMessagesValues = resultKysoSetting.data.find((x) => x.key === KysoSettingsEnum.ONBOARDING_MESSAGES)?.value!;

        const onboardingMessagesParsed = JSON.parse(onboardingMessagesValues);
        /* eslint-disable @typescript-eslint/no-explicit-any */
        setOnboardingMessages(onboardingMessagesParsed);
        /* eslint-disable @typescript-eslint/no-explicit-any */
      } catch (errorHttp: any) {
        Helper.logError(errorHttp.response.data, errorHttp);
      }
    };
    getData();
  }, []);

  useEffect(() => {
    if (user) {
      // Necessary to access the getProgressPercentage. As the loggedUser comes from an unmarshalling process, only the data
      // is available, but not the functions of the object. For that we create a new object that is a copy of the loggedUser.onboarding_progress
      // property
      const copyOnboardingProgress: OnboardingProgress = new OnboardingProgress(
        user.onboarding_progress.step_1!,
        user.onboarding_progress.step_2!,
        user.onboarding_progress.step_3!,
        user.onboarding_progress.step_4!,
        user.onboarding_progress.step_5!,
        user.onboarding_progress.finish_and_remove,
      );

      setOnboardingProgress(copyOnboardingProgress);
      setProgress(copyOnboardingProgress.getProgressPercentage());
    }
  }, [user]);

  return (
    <div className="space-y-5 pt-8">
      {/* <legend className="sr-only">Notifications</legend> */}
      <h2 className="text-xl font-medium text-gray-900 sm:pr-12 px-6 flex">
        {progress !== 100 && onboardingMessages.dropdown.title}
        {progress === 100 && (
          <>
            You completed the onboarding process!
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-8 h-8 text-indigo-500 ml-3">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"
              />
            </svg>
          </>
        )}
      </h2>
      <span className="text-gray-500 pt-2 px-6">${onboardingMessages.dropdown.text}</span>
      <div className="px-8 pb-10">
        <ProgressBar value={progress} style={{ height: '15px', fontSize: '10px' }} color="#0c9f6e" />
      </div>

      <div
        className="relative flex items-start py-3 px-6 hover:bg-slate-50 my-3"
        onClick={() => {
          setValue('publish');
          markCtaDone(Cta.One, user);
        }}
      >
        <div className="flex h-5 items-center w-8">
          {onboardingProgress.step_1 ? <CheckCircleIcon className="h-6 w-6 text-green-500" aria-hidden="true" /> : <span className="ml-2 w-4 h-4 rounded-full bg-white ring-2 ring-gray-300 " />}
        </div>
        <div className="ml-3 text-sm w-96">
          <label className="font-medium text-gray-700">{onboardingMessages.dropdown.step_1.title}</label>
          <p className="text-gray-500">{onboardingMessages.dropdown.step_1.description}</p>
        </div>
        <div className="flex h-5 items-center w-8 pt-6">
          <ChevronDoubleRightIcon className="h-8 w-8 text-gray-500 hover:text-indigo-500" aria-hidden="true" />
        </div>
      </div>

      <div
        className="relative flex items-start py-3 px-6 hover:bg-slate-50 my-3"
        onClick={() => {
          setValue('read');
          markCtaDone(Cta.Two, user);
        }}
      >
        <div className="flex h-5 items-center w-8">
          {onboardingProgress.step_2 ? <CheckCircleIcon className="h-6 w-6 text-green-500" aria-hidden="true" /> : <span className="ml-2 w-4 h-4 rounded-full bg-white ring-2 ring-gray-300 " />}
        </div>
        <div className="ml-3 text-sm w-96">
          <label className="font-medium text-gray-700">{onboardingMessages.dropdown.step_2.title}</label>
          <p className="text-gray-500">{onboardingMessages.dropdown.step_2.description}</p>
        </div>
        <div className="flex h-5 items-center w-8 pt-6">
          <ChevronDoubleRightIcon className="h-8 w-8 text-gray-500 hover:text-indigo-500" aria-hidden="true" />
        </div>
      </div>

      <div
        className="relative flex items-start py-3 px-6 hover:bg-slate-50 my-3"
        onClick={() => {
          setValue('search');
          markCtaDone(Cta.Three, user);
        }}
      >
        <div className="flex h-5 items-center w-8">
          {onboardingProgress.step_3 ? <CheckCircleIcon className="h-6 w-6 text-green-500" aria-hidden="true" /> : <span className="ml-2 w-4 h-4 rounded-full bg-white ring-2 ring-gray-300 " />}
        </div>
        <div className="ml-3 text-sm w-96">
          <label className="font-medium text-gray-700">{onboardingMessages.dropdown.step_3.title}</label>
          <p className="text-gray-500">{onboardingMessages.dropdown.step_3.description}</p>
        </div>
        <div className="flex h-5 items-center w-8 pt-6">
          <ChevronDoubleRightIcon className="h-8 w-8 text-gray-500 hover:text-indigo-500" aria-hidden="true" />
        </div>
      </div>

      <div
        className="relative flex items-start py-3 px-6 hover:bg-slate-50 my-3"
        onClick={() => {
          setValue('profile');
          markCtaDone(Cta.Four, user);
        }}
      >
        <div className="flex h-5 items-center w-8">
          {onboardingProgress.step_4 ? <CheckCircleIcon className="h-6 w-6 text-green-500" aria-hidden="true" /> : <span className="ml-2 w-4 h-4 rounded-full bg-white ring-2 ring-gray-300 " />}
        </div>
        <div className="ml-3 text-sm w-96">
          <label className="font-medium text-gray-700">{onboardingMessages.dropdown.step_4.title}</label>
          <p className="text-gray-500">{onboardingMessages.dropdown.step_4.description}</p>
        </div>
        <div className="flex h-5 items-center w-8 pt-6">
          <ChevronDoubleRightIcon className="h-8 w-8 text-gray-500 hover:text-indigo-500" aria-hidden="true" />
        </div>
      </div>
      <div
        className="relative flex items-start py-3 px-6 hover:bg-slate-50 my-3"
        onClick={() => {
          setValue('cli');
          markCtaDone(Cta.Five, user);
        }}
      >
        <div className="flex h-5 items-center w-8">
          {onboardingProgress.step_5 ? <CheckCircleIcon className="h-6 w-6 text-green-500" aria-hidden="true" /> : <span className="ml-2 w-4 h-4 rounded-full bg-white ring-2 ring-gray-300 " />}
        </div>
        <div className="ml-3 text-sm w-96">
          <label className="font-medium text-gray-700">{onboardingMessages.dropdown.step_5.title}</label>
          <p className="text-gray-500">{onboardingMessages.dropdown.step_5.description}</p>
        </div>
        <div className="flex h-5 items-center w-8 pt-6">
          <ChevronDoubleRightIcon className="h-8 w-8 text-gray-500 hover:text-indigo-500" aria-hidden="true" />
        </div>
      </div>
      <div className="border-t">
        <div
          className="relative flex items-start py-3 px-6 hover:bg-slate-50 my-3"
          onClick={() => {
            setValue('finish-and-remove');
            markCtaDone(Cta.All, user);
          }}
        >
          <div className="flex h-5 items-center w-8">
            <XCircleIcon className="h-6 w-6 text-red-500" aria-hidden="true" />
          </div>
          <div className="ml-3 text-sm w-96">
            <label className="font-medium text-gray-700">Finish and remove.</label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PureCheckListTour;
