import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { getLocalStorageItem } from '../helpers/isomorphic-local-storage';
import { useRedirectIfNoJWT } from '../hooks/use-redirect-if-no-jwt';
import KysoApplicationLayout from '../layouts/KysoApplicationLayout';
import type { CommonData } from '../types/common-data';

interface Props {
  commonData: CommonData;
}

const Index = ({ commonData }: Props) => {
  const router = useRouter();
  useRedirectIfNoJWT();

  useEffect(() => {
    const redirectUserToOrganization = async () => {
      if (!commonData.user) {
        return;
      }
      let lastOrganizationDict: { [userId: string]: string } = {};
      const lastOrganizationStr: string | null = getLocalStorageItem('last_organization');
      if (lastOrganizationStr) {
        try {
          lastOrganizationDict = JSON.parse(lastOrganizationStr);
        } catch (e) {}
      }
      if (lastOrganizationDict[commonData.user.id]) {
        router.push(`/settings/${lastOrganizationDict[commonData.user!.id]}`);
      } else if (commonData.permissions) {
        const orgs = commonData.permissions?.organizations;
        if (orgs && orgs.length > 0) {
          router.push(`/settings/${orgs[0]?.name}`);
        }
      }
    };
    redirectUserToOrganization();
  }, [commonData]);

  return null;
};

Index.layout = KysoApplicationLayout;

export default Index;
