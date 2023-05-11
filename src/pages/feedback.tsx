/* eslint-disable @typescript-eslint/no-explicit-any */
import { ToasterIcons } from '@/enums/toaster-icons';
import { Helper } from '@/helpers/Helper';
import type { IKysoApplicationLayoutProps } from '@/layouts/KysoApplicationLayout';
import KysoApplicationLayout from '@/layouts/KysoApplicationLayout';
import { ExclamationCircleIcon } from '@heroicons/react/solid';
import { FeedbackDto } from '@kyso-io/kyso-model';
import { Api } from '@kyso-io/kyso-store';
import clsx from 'clsx';
import { useRouter } from 'next/router';
import { useState } from 'react';

function isBrowser() {
  if (typeof window !== 'undefined') {
    return true;
  }
  return false;
}

const Index = ({ commonData, showToaster, isCurrentUserVerified, isCurrentUserSolvedCaptcha, isUserLogged }: IKysoApplicationLayoutProps) => {
  const router = useRouter();
  const [requesting, setRequesting] = useState<boolean>(false);
  const [subject, setSubject] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  const onSubmit = async () => {
    const isValid: boolean = Helper.validateEmailVerifiedAndCaptchaSolvedAndShowToasterMessages(isCurrentUserVerified(), isCurrentUserSolvedCaptcha(), showToaster, commonData);

    if (!isValid) {
      return;
    }

    setRequesting(true);

    try {
      const api: Api = new Api(commonData.token);
      const feedbackDto: FeedbackDto = new FeedbackDto(subject, message);
      await api.createFeedback(feedbackDto);
      setSubject('');
      setMessage('');

      showToaster('Your feedback was sent successfully', ToasterIcons.INFO);

      const redirectUrl: string | null = sessionStorage.getItem('redirectUrl') || '/';
      if (isBrowser()) {
        sessionStorage.removeItem('redirectUrl');
      }
      setTimeout(() => router.push(redirectUrl), 2000);
    } catch (e: any) {
      showToaster("We're sorry! Something happened sending your feedback. Please try again", ToasterIcons.ERROR);
    }
    setRequesting(false);
  };

  const disabledButton: boolean = !subject || !message || requesting;

  if (!isUserLogged) {
    return null;
  }

  return (
    <div className="flex flex-row space-x-8 p-2">
      <div className="w-1/6"></div>
      <div className="w-4/6">
        {isUserLogged ? (
          <div className="mt-4">
            <div className="space-y-8 divide-y divide-gray-200">
              <div className="space-y-8 divide-y divide-gray-200 sm:space-y-5">
                <div className="space-y-6 sm:space-y-5">
                  <div>
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Feeback</h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">Explain the issue or the suggestions you consider that make us to improve.</p>
                  </div>
                  <div className="space-y-6 sm:space-y-5">
                    <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-gray-200 sm:pt-5">
                      <label className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">Subject</label>
                      <div className="mt-1 sm:col-span-2 sm:mt-0">
                        <input
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          type="text"
                          autoComplete="username"
                          className="block w-full min-w-0 flex-1 rounded-none rounded-r-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                      </div>
                    </div>
                    <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-gray-200 sm:pt-5">
                      <label className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">Message</label>
                      <div className="mt-1 sm:col-span-2 sm:mt-0">
                        <textarea
                          value={message}
                          onChange={(e: any) => setMessage(e.target.value)}
                          rows={3}
                          className="block w-full max-w-lg rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        ></textarea>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="pt-5">
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setSubject('');
                      setMessage('');
                      const redirectUrl: string | null = sessionStorage.getItem('redirectUrl') || '/';
                      router.push(redirectUrl || '/');
                    }}
                    className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={disabledButton}
                    onClick={onSubmit}
                    className={clsx(
                      'ml-3 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2',
                      disabledButton ? 'opacity-50 cursor-not-allowed' : '',
                    )}
                  >
                    Save
                  </button>
                </div>
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

Index.layout = KysoApplicationLayout;

export default Index;
