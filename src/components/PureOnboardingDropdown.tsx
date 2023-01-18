import { BellIcon } from '@heroicons/react/solid';
import { Menu, Transition } from '@headlessui/react';
import React, { useState, Fragment } from 'react';
import PureCheckListTour from './PureCheckListTour';
import PureCheckListPage from './PureChecklistPage';

const PureOnboardingDropdown = () => {
  const [value, setValue] = useState('');
  const [open, setOpen] = useState<boolean>(true);

  const contentPublish = {
    title: 'Publish your work.',
    text: 'This is where you can upload existing files you might have ready to share. Post PowerPoints, notebooks, Word Docs, images & more. Make sure to upload to the correct channel and add tags to make it easier to find later.',
    demoUrl: 'https://www.loom.com/embed/55bcdb4f02f74b6590e39eae2ebb1af8',
    demoPreview: '/static/demo.png',
    cta: ' Publish my research now!',
    ctaUrl: 'https://kyso.io/kyso-examples/create-report-form/',
    docCta: 'What else can I publish?',
    docUrl: 'https://docs.kyso.io/kysos-renderer',
  };

  const contentRead = {
    title: 'Read a report.',
    text: 'This is an example Jupyter notebook rendered for presentation on Kyso. You can browse through files & previous versions, reveal code, interact with your colleague’s insights and make comments like you would on Google Docs.',
    demoUrl: 'https://www.loom.com/embed/db8ef30de06b4b6392bd8898cdb03f71',
    demoPreview: '/static/read.png',
    cta: ' Discover other reports to read!',
    ctaUrl: 'https://kyso.io/search/?q=',
    docUrl: '',
    docCta: '',
  };

  const contentSearch = {
    title: 'Search & discover.',
    text: 'Content published to Kyso is categorised across different Organisations, Channels and Tags, and is indexed full-text so you can be very specific when searching for research you are interested in.',
    demoUrl: 'https://www.loom.com/embed/d408c2bf05f14e1db051f85f2efcb6f5',
    demoPreview: '/static/demo.png',
    cta: 'Discover other reports to read!',
    ctaUrl: 'https://kyso.io/search/?q=',
    docUrl: '',
    docCta: '',
  };

  const contentProfile = {
    title: 'View my profile.',
    text: 'This is the page your colleagues will see when they click on your Kyso avatar to discover & learn from your work. Be sure to keep your reports up to date. ',
    demoUrl: 'https://www.loom.com/embed/56350d3e51bb4d21a312caf94282110f',
    demoPreview: '/static/profile.png',
    cta: ' Publish my research now!',
    ctaUrl: 'https://kyso.io/kyso-examples/create-report-form/',
    docCta: ' How do access controls work on Kyso?',
    docUrl: 'https://docs.kyso.io/settings-and-administration/managing-access',
  };

  const contentCLI = {
    title: 'Install & integrate Kyso into your workflows.',
    text: 'Install the Kyso CLI tool so you can integrate the publishing process into your data science workflows, whether that means pushing models from MLOps platforms like Domino or leveraging Git actions to maintain version control across the team.',
    demoUrl: 'https://www.loom.com/embed/5e67af40d0c948f4b3bdeb5b29b4c3a0',
    demoPreview: '/static/cli.png',
    cta: 'Install the Kyso CLI now! ',
    ctaUrl: 'https://docs.kyso.io/posting-to-kyso/kyso-command-line-tool',
    docCta: 'How to create an access token?',
    docUrl: 'https://dev.kyso.io/kyleos/docs/getting-started-with-kyso/kyso-cli.md',
  };

  let valueContent = contentPublish;
  if (value === 'read') {
    valueContent = contentRead;
  }
  if (value === 'search') {
    valueContent = contentSearch;
  }
  if (value === 'profile') {
    valueContent = contentProfile;
  }
  if (value === 'cli') {
    valueContent = contentCLI;
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
