/* eslint-disable @typescript-eslint/no-explicit-any */

import { Helper } from '@/helpers/Helper';
import { Menu, Transition } from '@headlessui/react';
import type { KysoSetting, NormalizedResponseDTO, UserDTO } from '@kyso-io/kyso-model';
import { KysoSettingsEnum, OnboardingProgress } from '@kyso-io/kyso-model';
import { Api } from '@kyso-io/kyso-store';
import router from 'next/router';
import { Fragment, useEffect, useState } from 'react';
import type { KeyValue } from '../model/key-value.model';
import PureCheckListPage from './PureChecklistPage';
import PureCheckListTour from './PureCheckListTour';

interface Props {
  user: UserDTO;
}

const PureOnboardingDropdown = ({ user }: Props) => {
  const [value, setValue] = useState('');
  const [open, setOpen] = useState<boolean>(false);
  const [onboardingProgress, setOnboardingProgress] = useState(OnboardingProgress.createEmpty());
  const [finishAndRemove, setFinishAndRemove] = useState(false);
  const { onboarding } = router.query;

  // default values
  /* eslint-disable no-template-curly-in-string */
  const [onboardingMessages, setOnboardingMessages] = useState<any>({
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

        const onboardingMessagesKeyValue: KeyValue | undefined = resultKysoSetting.data.find((x: KeyValue) => x.key === KysoSettingsEnum.ONBOARDING_MESSAGES);
        if (onboardingMessagesKeyValue?.value) {
          try {
            setOnboardingMessages(JSON.parse(onboardingMessagesKeyValue.value));
          } catch (e) {}
        }
      } catch (errorHttp: any) {
        Helper.logError(errorHttp.response.data, errorHttp);
      }
    };
    getData();
  }, []);

  useEffect(() => {
    if (onboarding) {
      setValue(onboarding as string);
      setOpen(true);
    }
  }, [onboarding]);

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
        user.onboarding_progress.finish_and_remove!,
      );

      setOnboardingProgress(copyOnboardingProgress);
    }
  }, [user]);

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
          className="flex max-w-xs items-center text-sml-auto p-1 text-white ver:text-indigo-500/75 focus:outline-none focus:ring-offset-2 focus:ring-offset-kyso-600 hover:text-gray-200"
          onClick={() => {
            setOpen(!open);
            setValue('');
          }}
        >
          <span className="sr-only">View notifications</span>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
            <path d="M11.7 2.805a.75.75 0 01.6 0A60.65 60.65 0 0122.83 8.72a.75.75 0 01-.231 1.337 49.949 49.949 0 00-9.902 3.912l-.003.002-.34.18a.75.75 0 01-.707 0A50.009 50.009 0 007.5 12.174v-.224c0-.131.067-.248.172-.311a54.614 54.614 0 014.653-2.52.75.75 0 00-.65-1.352 56.129 56.129 0 00-4.78 2.589 1.858 1.858 0 00-.859 1.228 49.803 49.803 0 00-4.634-1.527.75.75 0 01-.231-1.337A60.653 60.653 0 0111.7 2.805z" />
            <path d="M13.06 15.473a48.45 48.45 0 017.666-3.282c.134 1.414.22 2.843.255 4.285a.75.75 0 01-.46.71 47.878 47.878 0 00-8.105 4.342.75.75 0 01-.832 0 47.877 47.877 0 00-8.104-4.342.75.75 0 01-.461-.71c.035-1.442.121-2.87.255-4.286A48.4 48.4 0 016 13.18v1.27a1.5 1.5 0 00-.14 2.508c-.09.38-.222.753-.397 1.11.452.213.901.434 1.346.661a6.729 6.729 0 00.551-1.608 1.5 1.5 0 00.14-2.67v-.645a48.549 48.549 0 013.44 1.668 2.25 2.25 0 002.12 0z" />
            <path d="M4.462 19.462c.42-.419.753-.89 1-1.394.453.213.902.434 1.347.661a6.743 6.743 0 01-1.286 1.794.75.75 0 11-1.06-1.06z" />
          </svg>
        </Menu.Button>
      </div>
      <div>
        {value === '' && (
          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="z-50 absolute right-0 mt-2 h-auto w-max origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5 focus:outline-none">
              <PureCheckListTour user={user} setValue={setValue} />
            </Menu.Items>
          </Transition>
        )}
        {value !== '' && <PureCheckListPage setValue={setValue} setOpen={() => setOpen(!open)} open={open} content={valueContent} user={user} />}
      </div>
    </Menu>
  );
};

export default PureOnboardingDropdown;
