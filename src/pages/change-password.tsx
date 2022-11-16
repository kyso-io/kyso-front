/* eslint-disable @typescript-eslint/no-explicit-any */
import PureKysoButton from '@/components/PureKysoButton';
import PureNotification from '@/components/PureNotification';
import MainLayout from '@/layouts/MainLayout';
import { KysoButton } from '@/types/kyso-button.enum';
import { ExclamationCircleIcon } from '@heroicons/react/solid';
import type { NormalizedResponseDTO } from '@kyso-io/kyso-model';
import { UserChangePasswordDTO } from '@kyso-io/kyso-model';
import { Api } from '@kyso-io/kyso-store';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState } from 'react';

const ChangePassword = () => {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [notification, setNotification] = useState('');
  const [notificationType, setNotificationType] = useState('');
  const [requesting, setRequesting] = useState(Boolean(false));
  const email: string | undefined = router.query.email as string | undefined;
  const token: string | undefined = router.query.token as string | undefined;

  const onSubmit = async () => {
    if (password !== repeatPassword) {
      setNotificationType('danger');
      setNotification("Passwords don't match");
      return;
    }
    setRequesting(true);
    try {
      const api: Api = new Api();
      const userChangePasswordDto: UserChangePasswordDTO = new UserChangePasswordDTO(email!, token!, password);
      const response: NormalizedResponseDTO<boolean> = await api.changePassword(userChangePasswordDto);
      if (response.data) {
        setTimeout(() => {
          router.replace('/');
        }, 1000);
      } else {
        setNotificationType('danger');
        setNotification('Error changing password');
      }
    } catch (e: any) {
      setNotificationType('danger');
      const message: string = Array.isArray(e.response.data.message) ? e.response.data.message.join('. ') : e.response.data.message;
      setNotification(message);
    }
    setPassword('');
    setRepeatPassword('');
    setRequesting(false);
  };

  return (
    <div className="">
      <Head>
        <title> Kyso | Change password </title>
      </Head>
      <div className="text-left">{notification && <PureNotification message={notification} type={notificationType} />}</div>
      {!email || !token ? (
        <div className="flex flex-row space-x-8 p-2 pt-10">
          <div className="w-2/12"></div>
          <div className="w-8/12 flex flex-col space-y-8">
            <div className="rounded-md bg-yellow-50 p-4">
              <div className="flex">
                <div className="shrink-0">
                  <ExclamationCircleIcon className="h-5 w-5 text-yellow-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">Missing data in url</h3>
                  <p className="mt-2 text-sm text-yellow-700">
                    Please check your email and make sure you have the correct link to change your password or request{' '}
                    <a href="/reset-password" className="font-bold">
                      new link
                    </a>
                    .
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="border p-10 justify-between mx-auto mt-20 max-w-lg">
          <h1 className="text-center text-2xl font-bold text-gray-900">Change password</h1>
          <div>
            <p className="font-small text-gray-500 my-4 max-w-prose">Please enter new password:</p>
            <input
              className="border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:ring-0 focus:outline-none focus:shadow-outline"
              aria-label="password"
              type="password"
              name="email"
              value={password}
              placeholder="Password"
              onChange={(e) => {
                setNotification('');
                setNotificationType('error');
                setPassword(e.target.value);
              }}
            />
            <input
              className="border rounded w-full mt-4 py-2 px-3 text-gray-700 leading-tight focus:ring-0 focus:outline-none focus:shadow-outline"
              aria-label="Repeat password"
              type="password"
              name="Repeat password"
              value={repeatPassword}
              placeholder="Repeat password"
              onChange={(e) => {
                setNotification('');
                setNotificationType('error');
                setRepeatPassword(e.target.value);
              }}
            />
            <div className="flex justify-between mx-auto mt-10">
              <PureKysoButton
                type={KysoButton.SECONDARY}
                className={'justify-center w-full px-4 py-2 mr-4'}
                onClick={() => {
                  router.push(`/login`);
                }}
              >
                Back to login
              </PureKysoButton>
              {/* make it enable */}
              <PureKysoButton
                type={KysoButton.PRIMARY}
                className={'justify-center w-full px-4 py-2'}
                onClick={() => {
                  if (requesting || notification) {
                    return;
                  }
                  onSubmit();
                }}
              >
                Submit
              </PureKysoButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

ChangePassword.layout = MainLayout;

export default ChangePassword;
