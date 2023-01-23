import { BellIcon } from '@heroicons/react/solid';
import { Menu, Transition } from '@headlessui/react';
import React, { useState, Fragment, useEffect } from 'react';
import { useUser } from '@/hooks/use-user';
import type { UserDTO, KysoSetting, NormalizedResponseDTO } from '@kyso-io/kyso-model';
import { OnboardingProgress, KysoSettingsEnum } from '@kyso-io/kyso-model';
import { Helper } from '@/helpers/Helper';
import { Api } from '@kyso-io/kyso-store';
import PureCheckListTour from './PureCheckListTour';
import PureCheckListPage from './PureChecklistPage';

const PureOnboardingDropdown = () => {
  const loggedUser: UserDTO | null = useUser();
  const [value, setValue] = useState('');
  const [open, setOpen] = useState<boolean>(false);
  const [onboardingProgress, setOnboardingProgress] = useState(OnboardingProgress.createEmpty());
  const [finishAndRemove, setFinishAndRemove] = useState(false);

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
        ctaUrl: '/${user}/create-report-form',
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

  const [valueContent, setValueContent] = useState(onboardingMessages.dropdown.step_1);

  useEffect(() => {
    const getData = async () => {
      try {
        const api: Api = new Api();
        const resultKysoSetting: NormalizedResponseDTO<KysoSetting[]> = await api.getPublicSettings();

        const onboardingMessagesValues = resultKysoSetting.data.find((x) => x.key === KysoSettingsEnum.ONBOARDING_MESSAGES)?.value!;

        const onboardingMessagesParsed = JSON.parse(onboardingMessagesValues);
        /* eslint-disable @typescript-eslint/no-explicit-any */
        setOnboardingMessages(onboardingMessagesParsed);
      } catch (errorHttp: any) {
        Helper.logError(errorHttp.response.data, errorHttp);
      }
    };
    getData();
  }, []);

  useEffect(() => {
    if (loggedUser) {
      // Necessary to access the getProgressPercentage. As the loggedUser comes from an unmarshalling process, only the data
      // is available, but not the functions of the object. For that we create a new object that is a copy of the loggedUser.onboarding_progress
      // property
      const copyOnboardingProgress: OnboardingProgress = new OnboardingProgress(
        loggedUser?.onboarding_progress.step_1!,
        loggedUser?.onboarding_progress.step_2!,
        loggedUser?.onboarding_progress.step_3!,
        loggedUser?.onboarding_progress.step_4!,
        loggedUser?.onboarding_progress.step_5!,
        loggedUser?.onboarding_progress.finish_and_remove!,
      );

      setOnboardingProgress(copyOnboardingProgress);
    }
  }, [loggedUser]);

  useEffect(() => {
    if (value === 'publish') {
      setValueContent(onboardingMessages.dropdown.step_1);
    }
    if (value === 'read') {
      setValueContent(onboardingMessages.dropdown.step_2);
    }
    if (value === 'search') {
      setValueContent(onboardingMessages.dropdown.step_3);
    }
    if (value === 'profile') {
      setValueContent(onboardingMessages.dropdown.step_4);
    }
    if (value === 'cli') {
      setValueContent(onboardingMessages.dropdown.step_5);
    }
    if (value === 'finish-and-remove') {
      setOpen(false);
      setFinishAndRemove(true);
    }
  }, [value]);

  if (onboardingProgress.finish_and_remove || finishAndRemove) {
    return <></>;
  }

  return (
    <Menu as="div" className="relative">
      <div>
        <Menu.Button
          className="flex max-w-xs items-center rounded-full text-sml-auto bg-white p-1 text-green-500 ver:text-indigo-500/75 focus:outline-none ring-2 ring-green-500 focus:ring-offset-2 focus:ring-offset-kyso-600"
          onClick={() => {
            setOpen(!open);
            setValue('');
          }}
        >
          <span className="sr-only">View notifications</span>
          <BellIcon className="h-6 w-6" aria-hidden="true" />
        </Menu.Button>
      </div>
      <div>
        {value === '' && (
          <Transition
            show={open}
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="z-50 absolute right-0 mt-2 h-auto w-max origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5 focus:outline-none">
              <PureCheckListTour setValue={setValue} />
            </Menu.Items>
          </Transition>
        )}
        {value !== '' && <PureCheckListPage setValue={setValue} setOpen={() => setOpen(!open)} open={open} content={valueContent} />}
      </div>
    </Menu>
  );
};

export default PureOnboardingDropdown;
