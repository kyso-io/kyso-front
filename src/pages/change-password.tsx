import PureKysoButton from '@/components/PureKysoButton';
import PureNotification from '@/components/PureNotification';
import MainLayout from '@/layouts/MainLayout';
import type { CommonData } from '@/types/common-data';
import { KysoButton } from '@/types/kyso-button.enum';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

// const validateEmail = (email: string) => {
//   /* eslint-disable no-useless-escape */
//   const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
//   return re.test(email);
// };

type IChangePassword = {
  commonData: CommonData;
};

const ChangePassword = (props: IChangePassword) => {
  const router = useRouter();
  // const dispatch = useAppDispatch();
  const { commonData } = props;

  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [notification, setNotification] = useState('');
  const [notificationType, setNotificationType] = useState('');
  const [requesting, setRequesting] = useState(Boolean(false));

  useEffect(() => {
    if (commonData && commonData.user) {
      router.replace('/');
    }
  }, [commonData]);

  const onSubmit = async () => {
    if (password !== repeatPassword) {
      setNotificationType('error');
      setNotification("Passwords don't match");
      return;
    }
    setRequesting(true);

    // + is replaced by blank space dont know why...
    // email = email.replace(' ', '+');

    // const result = await dispatch(changePasswordAction({ email, token, password }));
    // if (result?.payload) {
    //   setNotificationType('success');
    //   setNotification('Password changed successfully.');
    //   setTimeout(() => {
    //     router.replace('/');
    //   }, 1000);
    // }
    setPassword('');
    setRepeatPassword('');
    setRequesting(false);
  };

  return (
    <div className="w-full min-h-full flex items-center ">
      <Head>
        <title> Kyso | Change password </title>
      </Head>
      <div className="text-left">{notification && <PureNotification message={notification} type={notificationType} />}</div>
      <div className="border p-10 justify-between mx-auto mt-20 max-w-lg">
        <h1 className="text-2xl font-bold text-gray-900">Change password.</h1>
        <div>
          <p className="font-small text-gray-500 my-4 max-w-prose">Please enter new password.</p>
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
    </div>
  );
};

ChangePassword.layout = MainLayout;

export default ChangePassword;
