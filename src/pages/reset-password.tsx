/* eslint-disable @typescript-eslint/no-explicit-any */
import PureKysoButton from '@/components/PureKysoButton';
import PureNotification from '@/components/PureNotification';
import { useAppDispatch } from '@/hooks/redux-hooks';
import MainLayout from '@/layouts/MainLayout';
import type { CommonData } from '@/types/common-data';
import { KysoButton } from '@/types/kyso-button.enum';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import { EmailUserChangePasswordDTO, KysoSettingsEnum } from '@kyso-io/kyso-model';
import { emailRecoveryPasswordAction } from '@kyso-io/kyso-store';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import { usePublicSettings } from '../hooks/use-public-settings';

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
  const kysoSettingValues: (any | null)[] = usePublicSettings([KysoSettingsEnum.HCAPTCHA_SITE_KEY, KysoSettingsEnum.HCAPTCHA_ENABLED]);
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
    if (kysoSettingValues.length === 0) {
      return;
    }
    setCaptchaSiteKey(kysoSettingValues[0]);
    setCaptchaEnabled(kysoSettingValues[1] === 'true');
  }, [kysoSettingValues]);

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

    const emailUserChangePasswordDTO: EmailUserChangePasswordDTO = new EmailUserChangePasswordDTO(email, captchaToken);
    const result = await dispatch(emailRecoveryPasswordAction(emailUserChangePasswordDTO));

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
