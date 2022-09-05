import PureKysoButton from '@/components/PureKysoButton';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import Head from 'next/head';
import { Helper } from '@/helpers/Helper';
import PureNotification from '@/components/PureNotification';
import MainLayout from '@/layouts/MainLayout';
import type { CommonData } from '@/types/common-data';
import { KysoButton } from '@/types/kyso-button.enum';
import { emailRecoveryPasswordAction } from '@kyso-io/kyso-store';
import { useRouter } from 'next/router';
import { useEffect, useState, useRef } from 'react';
import { useAppDispatch } from '@/hooks/redux-hooks';
import { KysoSettingsEnum } from '@kyso-io/kyso-model';

const validateEmail = (email: string) => {
  /* eslint-disable no-useless-escape */
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
};

type IResetPassword = {
  commonData: CommonData;
};

const ResetPassword = (props: IResetPassword) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { commonData } = props;

  const [email, setEmail] = useState('');
  const [notification, setNotification] = useState('');
  const [notificationType, setNotificationType] = useState('');
  const [requesting, setRequesting] = useState(Boolean(false));
  const [captchaToken, setCaptchaToken] = useState('');
  const [captchaEnabled, setCaptchaEnabled] = useState(false);
  const [captchaSiteKey, setCaptchaSiteKey] = useState('');
  const hCaptchaRef = useRef(null);

  useEffect(() => {
    if (commonData && commonData.user) {
      router.replace('/');
    }
  }, [commonData]);

  useEffect(() => {
    const getOrganizationOptions = async () => {
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      const publicKeys: any[] = await Helper.getKysoPublicSettings();

      if (!publicKeys || publicKeys.length === 0) {
        // api might be down
        setNotificationType('danger');
        setNotification('An unknown error has occurred');
        return;
      }

      const newCaptchaSiteKey = publicKeys.find((x) => x.key === KysoSettingsEnum.HCAPTCHA_SITE_KEY).value;

      const newCaptchaEnabled = publicKeys.find((x) => x.key === KysoSettingsEnum.HCAPTCHA_ENABLED).value === 'true';

      setCaptchaSiteKey(newCaptchaSiteKey);
      setCaptchaEnabled(newCaptchaEnabled);
    };
    getOrganizationOptions();
  }, []);

  const onSubmit = async () => {
    if (!validateEmail(email)) {
      setNotificationType('danger');
      setNotification('Invalid email');
      return;
    }
    if (captchaEnabled) {
      if (!captchaToken || captchaToken.length === 0) {
        setNotificationType('danger');
        setNotification('Please verify that you are not a robot');
        return;
      }
    }
    setRequesting(true);

    const result = await dispatch(emailRecoveryPasswordAction({ email, captchaToken }));

    if (result?.payload) {
      setNotificationType('success');
      setNotification('An email has been sent to you with the instructions.');
      setTimeout(() => {
        router.replace('/');
      }, 1000);
      setEmail('');
      setCaptchaToken('');
      setRequesting(false);
    } else {
      setNotification('Something went wrong. Please contact with support@kyso.io');
      setNotificationType('danger');
      setRequesting(false);
    }
  };

  return (
    <div className="w-full min-h-full flex items-center ">
      <Head>
        <title> Kyso | Reset password </title>
      </Head>
      <div className="text-left">{notification && <PureNotification message={notification} type={notificationType} />}</div>
      <div className="border p-10 justify-between mx-auto mt-20 max-w-lg">
        <h1 className="text-2xl font-bold text-gray-900">Reset password.</h1>
        <p className="text-l font-small text-gray-500 mt-4 mb-8 max-w-prose">
          Do you forgot your password? Please write your email address, and we will send you a password recovery email with all the instructions.
        </p>
        <div>
          <p className="font-small text-gray-500 my-4 max-w-prose">Please enter your email address.</p>
          <input
            className="border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:ring-0 focus:outline-none focus:shadow-outline"
            aria-label="Email"
            type="text"
            name="email"
            value={email}
            placeholder="Email"
            onChange={(e) => {
              setNotification('');
              setNotificationType('error');
              setEmail(e.target.value);
            }}
          />
          <div className="flex justify-between mx-auto mt-10">{captchaEnabled && captchaSiteKey && <HCaptcha ref={hCaptchaRef} sitekey={captchaSiteKey} onVerify={setCaptchaToken} />}</div>
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
              Send email
            </PureKysoButton>
          </div>
        </div>
      </div>
    </div>
  );
};

ResetPassword.layout = MainLayout;

export default ResetPassword;
