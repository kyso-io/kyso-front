/* eslint-disable @typescript-eslint/no-explicit-any */
import KysoApplicationLayout from '@/layouts/KysoApplicationLayout';
import type { CommonData } from '@/types/common-data';
import { ExclamationCircleIcon } from '@heroicons/react/solid';
import type { KysoSetting, NormalizedResponseDTO, Organization } from '@kyso-io/kyso-model';
import { KysoSettingsEnum } from '@kyso-io/kyso-model';
import { Api } from '@kyso-io/kyso-store';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import ToasterNotification from '@/components/ToasterNotification';
import PureOrgInfoSettings from '@/components/PureOrgInfoSettings';
import { checkJwt } from '../helpers/check-jwt';
import { TailwindColor } from '../tailwind/enum/tailwind-color.enum';

interface Props {
  commonData: CommonData;
}

const Index = ({ commonData }: Props) => {
  const router = useRouter();
  const [isBusy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showToaster, setShowToaster] = useState<boolean>(false);
  const [messageToaster, setMessageToaster] = useState<string>('');
  const [captchaIsEnabled, setCaptchaIsEnabled] = useState<boolean>(false);
  const [userIsLogged, setUserIsLogged] = useState<boolean | null>(null);

  useEffect(() => {
    const result: boolean = checkJwt();
    setUserIsLogged(result);
    const getData = async () => {
      try {
        const api: Api = new Api();
        const resultKysoSetting: NormalizedResponseDTO<KysoSetting[]> = await api.getPublicSettings();
        const index: number = resultKysoSetting.data.findIndex((item: KysoSetting) => item.key === KysoSettingsEnum.HCAPTCHA_ENABLED);
        if (index !== -1) {
          setCaptchaIsEnabled(resultKysoSetting.data[index]!.value === 'true');
        }
      } catch (errorHttp: any) {
        console.error(errorHttp.response.data);
      }
    };
    getData();
  }, []);

  const createOrganization = async (orgName: string, bio: string): Promise<void> => {
    if (commonData.user?.email_verified === false) {
      setShowToaster(true);
      setMessageToaster('Your account is not verified. Please check your email before creating an organization.');
      return;
    }

    if (captchaIsEnabled && commonData.user?.show_captcha === true) {
      setShowToaster(true);
      setMessageToaster('Please verify the captcha');
      setTimeout(() => {
        setShowToaster(false);
        sessionStorage.setItem('redirectUrl', `/create-organization`);
        router.push('/captcha');
      }, 2000);
      return;
    }

    setShowToaster(false);
    setMessageToaster('');

    setError('');
    if (!orgName || orgName.length === 0) {
      setError('Please specify a organization name.');
      return;
    }
    setBusy(true);
    try {
      const api: Api = new Api(commonData.token);
      const result: NormalizedResponseDTO<Organization> = await api.createOrganization({
        display_name: orgName,
        bio,
      });
      const organization: Organization = result.data;
      router.push(`/${organization.sluglified_name}`);
    } catch (er: any) {
      setError(er.response.data.message);
    } finally {
      setBusy(false);
    }
  };

  if (userIsLogged === null) {
    return null;
  }

  return (
    <div className="flex flex-row space-x-8 p-2 pt-5">
      <div className="w-2/12"></div>
      <div className="w-8/12 flex flex-col space-y-8">
        {userIsLogged && (
          <PureOrgInfoSettings isBusy={isBusy} onCreateOrganization={(orgName: string, bio: string) => createOrganization(orgName, bio)} setError={(arg: string) => setError(arg)} error={error} />
        )}
        {!userIsLogged && (
          <div className="rounded-md bg-yellow-50 p-4">
            <div className="flex">
              <div className="shrink-0">
                <ExclamationCircleIcon className="h-5 w-5 text-yellow-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Forbidden resource</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    This page is only available to registered users.{' '}
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
      <ToasterNotification
        show={showToaster}
        setShow={setShowToaster}
        icon={<ExclamationCircleIcon className="h-6 w-6 text-red-400" aria-hidden="true" />}
        message={messageToaster}
        backgroundColor={TailwindColor.SLATE_50}
      />
    </div>
  );
};

Index.layout = KysoApplicationLayout;

export default Index;
