/* eslint-disable @typescript-eslint/no-explicit-any */
import { getLocalStorageItem, setLocalStorageItem } from '@/helpers/isomorphic-local-storage';
import type { KeyValue } from '@/model/key-value.model';
import type { ResourcePermissions } from '@kyso-io/kyso-model';
import { KysoSettingsEnum } from '@kyso-io/kyso-model';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import ChannelList from '@/components/ChannelList';
import { Helper } from '@/helpers/Helper';
import type { IKysoApplicationLayoutProps } from '@/layouts/KysoApplicationLayout';
import KysoApplicationLayout from '@/layouts/KysoApplicationLayout';

const Index = ({ commonData }: IKysoApplicationLayoutProps) => {
  const router = useRouter();

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
        const publicKeys: KeyValue[] = await Helper.getKysoPublicSettings();
        const settingsDefaultRedirectOrganization: KeyValue | undefined = publicKeys.find((x: KeyValue) => x.key === KysoSettingsEnum.DEFAULT_REDIRECT_ORGANIZATION);
        const settingsUnauthRedirect: KeyValue | undefined = publicKeys.find((x: KeyValue) => x.key === KysoSettingsEnum.UNAUTHORIZED_REDIRECT_URL);

        if (publicKeys !== null && publicKeys.length > 0) {
          let unauthorizedRedirectUrl = '/login';

          if (
            settingsDefaultRedirectOrganization !== undefined &&
            settingsDefaultRedirectOrganization.value &&
            commonData.permissions?.organizations &&
            commonData.permissions!.organizations.length > 0
          ) {
            unauthorizedRedirectUrl = `/${settingsDefaultRedirectOrganization.value}`;
          } else if (settingsUnauthRedirect?.value) {
            unauthorizedRedirectUrl = settingsUnauthRedirect.value;
          }

          router.replace(unauthorizedRedirectUrl);
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
