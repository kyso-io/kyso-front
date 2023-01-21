import { CheckCircleIcon, ChevronDoubleRightIcon, XCircleIcon } from '@heroicons/react/solid';
import React, { useEffect, useState } from 'react';
import type { UserDTO } from '@kyso-io/kyso-model';
import { OnboardingProgress, UpdateUserRequestDTO } from '@kyso-io/kyso-model';
import { ProgressBar } from 'primereact/progressbar';
import { useUser } from '@/hooks/use-user';
import { getLocalStorageItem } from '@/helpers/isomorphic-local-storage';
import { Api } from '@kyso-io/kyso-store';

interface Props {
  setValue: (value: string) => void;
}

const content = {
  firstTitle: 'Publish your work.',
  firstText: 'Upload existing research - no matter the format - to be indexed & shared with colleagues.',
  secondTitle: 'Read a report.',
  secondText: 'Read through a report, interact with & comment on results. ',
  thirdTitle: 'Search & discover.',
  thirdText: 'Find research you’re interested in from colleagues across the organisation.',
  fourthTitle: 'View my profile.',
  fourthText: 'See how your work is displayed for others to discover and learn from.',
  fifthTitle: 'Install & integrate Kyso into your workflows.',
  fifthText: 'Download & install the Kyso CLI tool so you can publish (many) results automatically from within your technical workflows: git, s3, Domino & more!',
};

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
  const loggedUser: UserDTO | null = useUser();
  const [progress, setProgress] = useState(0);
  const [onboardingProgress, setOnboardingProgress] = useState(OnboardingProgress.createEmpty());

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
      );

      setOnboardingProgress(copyOnboardingProgress);
      setProgress(copyOnboardingProgress.getProgressPercentage());
    }
  }, [loggedUser]);

  const { setValue } = props;

  return (
    <div className="space-y-5 pt-8">
      {/* <legend className="sr-only">Notifications</legend> */}
      <h2 className="text-xl font-medium text-gray-900 sm:pr-12 px-6 flex">
        {progress !== 100 && 'Welcome on board!'}
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
      <span className="text-gray-500 pt-2 px-6">Here is your Onboard checklist</span>
      <div className="px-8 pb-10">
        <ProgressBar value={progress} style={{ height: '15px', fontSize: '10px' }} color="#0c9f6e" />
      </div>

      <div
        className="relative flex items-start py-3 px-6 hover:bg-slate-50 my-3"
        onClick={() => {
          setValue('publish');
          markCtaDone(Cta.One, loggedUser!);
        }}
      >
        <div className="flex h-5 items-center w-8">
          {onboardingProgress.step_1 ? <CheckCircleIcon className="h-6 w-6 text-green-500" aria-hidden="true" /> : <span className="ml-2 w-4 h-4 rounded-full bg-white ring-2 ring-gray-300 " />}
        </div>
        <div className="ml-3 text-sm w-96">
          <label className="font-medium text-gray-700">{content.firstTitle}</label>
          <p className="text-gray-500">{content.firstText}</p>
        </div>
        <div className="flex h-5 items-center w-8 pt-6">
          <ChevronDoubleRightIcon className="h-8 w-8 text-gray-500 hover:text-indigo-500" aria-hidden="true" />
        </div>
      </div>

      <div
        className="relative flex items-start py-3 px-6 hover:bg-slate-50 my-3"
        onClick={() => {
          setValue('read');
          markCtaDone(Cta.Two, loggedUser!);
        }}
      >
        <div className="flex h-5 items-center w-8">
          {onboardingProgress.step_2 ? <CheckCircleIcon className="h-6 w-6 text-green-500" aria-hidden="true" /> : <span className="ml-2 w-4 h-4 rounded-full bg-white ring-2 ring-gray-300 " />}
        </div>
        <div className="ml-3 text-sm w-96">
          <label className="font-medium text-gray-700">{content.secondTitle}</label>
          <p className="text-gray-500">{content.secondText}</p>
        </div>
        <div className="flex h-5 items-center w-8 pt-6">
          <ChevronDoubleRightIcon className="h-8 w-8 text-gray-500 hover:text-indigo-500" aria-hidden="true" />
        </div>
      </div>

      <div
        className="relative flex items-start py-3 px-6 hover:bg-slate-50 my-3"
        onClick={() => {
          setValue('search');
          markCtaDone(Cta.Three, loggedUser!);
        }}
      >
        <div className="flex h-5 items-center w-8">
          {onboardingProgress.step_3 ? <CheckCircleIcon className="h-6 w-6 text-green-500" aria-hidden="true" /> : <span className="ml-2 w-4 h-4 rounded-full bg-white ring-2 ring-gray-300 " />}
        </div>
        <div className="ml-3 text-sm w-96">
          <label className="font-medium text-gray-700">{content.thirdTitle}</label>
          <p className="text-gray-500">{content.thirdText}</p>
        </div>
        <div className="flex h-5 items-center w-8 pt-6">
          <ChevronDoubleRightIcon className="h-8 w-8 text-gray-500 hover:text-indigo-500" aria-hidden="true" />
        </div>
      </div>

      <div
        className="relative flex items-start py-3 px-6 hover:bg-slate-50 my-3"
        onClick={() => {
          setValue('profile');
          markCtaDone(Cta.Four, loggedUser!);
        }}
      >
        <div className="flex h-5 items-center w-8">
          {onboardingProgress.step_4 ? <CheckCircleIcon className="h-6 w-6 text-green-500" aria-hidden="true" /> : <span className="ml-2 w-4 h-4 rounded-full bg-white ring-2 ring-gray-300 " />}
        </div>
        <div className="ml-3 text-sm w-96">
          <label className="font-medium text-gray-700">{content.fourthTitle}</label>
          <p className="text-gray-500">{content.fourthText}</p>
        </div>
        <div className="flex h-5 items-center w-8 pt-6">
          <ChevronDoubleRightIcon className="h-8 w-8 text-gray-500 hover:text-indigo-500" aria-hidden="true" />
        </div>
      </div>
      <div
        className="relative flex items-start py-3 px-6 hover:bg-slate-50 my-3"
        onClick={() => {
          setValue('cli');
          markCtaDone(Cta.Five, loggedUser!);
        }}
      >
        <div className="flex h-5 items-center w-8">
          {onboardingProgress.step_5 ? <CheckCircleIcon className="h-6 w-6 text-green-500" aria-hidden="true" /> : <span className="ml-2 w-4 h-4 rounded-full bg-white ring-2 ring-gray-300 " />}
        </div>
        <div className="ml-3 text-sm w-96">
          <label className="font-medium text-gray-700">{content.fifthTitle}</label>
          <p className="text-gray-500">{content.fifthText}</p>
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
            markCtaDone(Cta.All, loggedUser!);
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
