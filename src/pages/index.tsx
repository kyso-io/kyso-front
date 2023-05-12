/* eslint-disable @typescript-eslint/no-explicit-any */
import ChannelList from '@/components/ChannelList';
import { getLocalStorageItem, setLocalStorageItem } from '@/helpers/isomorphic-local-storage';
import type { IKysoApplicationLayoutProps } from '@/layouts/KysoApplicationLayout';
import KysoApplicationLayout from '@/layouts/KysoApplicationLayout';
import type { ResourcePermissions } from '@kyso-io/kyso-model';
import { KysoSettingsEnum } from '@kyso-io/kyso-model';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { usePublicSettings } from '../hooks/use-public-settings';

const Index = ({ commonData }: IKysoApplicationLayoutProps) => {
  const router = useRouter();
  const kysoSettingValues: (any | null)[] = usePublicSettings([KysoSettingsEnum.DEFAULT_REDIRECT_ORGANIZATION, KysoSettingsEnum.UNAUTHORIZED_REDIRECT_URL]);

  useEffect(() => {
    if (!commonData.permissions) {
      return;
    }
    if (kysoSettingValues.length === 0) {
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

      if (commonData?.user !== null) {
        // Logged user with last organization
        const indexOrg: number = commonData.permissions!.organizations!.findIndex((x: ResourcePermissions) => x.name === lastOrganizationDict[commonData.user!.id]);

        if (indexOrg !== -1) {
          router.push(`${lastOrganizationDict[commonData.user!.id]}`);
        } else {
          delete lastOrganizationDict[commonData.user!.id];
          setLocalStorageItem('last_organization', JSON.stringify(lastOrganizationDict));
          const orgs: ResourcePermissions[] | undefined = commonData.permissions?.organizations;
          if (orgs && orgs.length > 0) {
            router.push(`${orgs[0]?.name}`);
          }
        }
      } else {
        // Unauthorized user
        const settingsDefaultRedirectOrganization: any | null = kysoSettingValues[0];
        const settingsUnauthRedirect: any | null = kysoSettingValues[1];
        let unauthorizedRedirectUrl = '/login';
        if (settingsDefaultRedirectOrganization && commonData.permissions?.organizations && commonData.permissions!.organizations.length > 0) {
          unauthorizedRedirectUrl = `/${settingsDefaultRedirectOrganization}`;
        } else if (settingsUnauthRedirect) {
          unauthorizedRedirectUrl = settingsUnauthRedirect;
        }
        router.replace(unauthorizedRedirectUrl);
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
