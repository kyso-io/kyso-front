/* eslint-disable @typescript-eslint/no-explicit-any */
import { getLocalStorageItem } from '@/helpers/isomorphic-local-storage';
import type { KeyValue } from '@/model/key-value.model';
import type { CommonData } from '@/types/common-data';
import type { ResourcePermissions } from '@kyso-io/kyso-model';
import { KysoSettingsEnum } from '@kyso-io/kyso-model';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import ChannelList from '../components/ChannelList';
import { checkJwt } from '../helpers/check-jwt';
import { Helper } from '../helpers/Helper';
import KysoApplicationLayout from '../layouts/KysoApplicationLayout';

interface Props {
  commonData: CommonData;
}

const Index = ({ commonData }: Props) => {
  const router = useRouter();

  useEffect(() => {
    const checkUserLogged = async () => {
      try {
        const publicKeys: KeyValue[] = await Helper.getKysoPublicSettings();
        if (publicKeys !== null && publicKeys.length > 0) {
          let unauthorizedRedirectUrl = '/login';
          const settingsUnauthRedirect: KeyValue | undefined = publicKeys.find((x: KeyValue) => x.key === KysoSettingsEnum.UNAUTHORIZED_REDIRECT_URL);
          if (settingsUnauthRedirect) {
            unauthorizedRedirectUrl = settingsUnauthRedirect.value;
          }
          router.replace(unauthorizedRedirectUrl);
        }
      } catch (e: any) {
        console.log(e.response.data);
      }
    };
    const result: boolean = checkJwt();
    if (!result) {
      checkUserLogged();
    }
  }, []);

  useEffect(() => {
    if (!commonData.permissions) {
      return;
    }
    const redirectUserToOrganization = async () => {
      let lastOrganizationDict: { [userId: string]: string } = {};
      const lastOrganizationStr: string | null = getLocalStorageItem('last_organization');
      if (lastOrganizationStr) {
        try {
          lastOrganizationDict = JSON.parse(lastOrganizationStr);
        } catch (e) {}
      }
      if (commonData?.user !== null && lastOrganizationDict[commonData.user!.id]) {
        const indexOrg: number = commonData.permissions!.organizations!.findIndex((x: ResourcePermissions) => x.name === lastOrganizationDict[commonData.user!.id]);
        if (indexOrg !== -1) {
          router.push(`${lastOrganizationDict[commonData.user!.id]}`);
        } else {
          const orgs: ResourcePermissions[] | undefined = commonData.permissions?.organizations;
          if (orgs && orgs.length > 0) {
            router.push(`${orgs[0]?.name}`);
          }
        }
      } else {
        const orgs: ResourcePermissions[] | undefined = commonData.permissions?.organizations;
        if (orgs && orgs.length > 0) {
          router.push(`${orgs[0]?.name}`);
        }
      }
    };
    redirectUserToOrganization();
  }, [commonData?.permissions, commonData?.user]);

  return (
    <div className="flex flex-row space-x-8">
      <div className="w-1/6">{commonData.user && <ChannelList basePath={router.basePath} commonData={commonData} />}</div>
    </div>
  );
};

Index.layout = KysoApplicationLayout;

export default Index;
