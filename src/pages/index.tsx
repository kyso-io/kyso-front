import { getLocalStorageItem } from '@/helpers/isomorphic-local-storage';
import type { CommonData } from '@/hooks/use-common-data';
import { useCommonData } from '@/hooks/use-common-data';
import { useRedirectIfNoJWT } from '@/hooks/use-redirect-if-no-jwt';
import NoLayout from '@/layouts/NoLayout';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

const Index = () => {
  useRedirectIfNoJWT();
  const router = useRouter();
  const commonData: CommonData = useCommonData();

  useEffect(() => {
    if (!commonData.user || !commonData.permissions) {
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
      router.push(`${lastOrganizationDict[commonData.user.id]}`);
    } else {
      const orgs = commonData.permissions?.organizations;
      if (orgs && orgs.length > 0) {
        router.push(`${orgs[0]?.name}`);
      }
    }
  }, [commonData?.user && commonData?.permissions]);

  return <div className="mt-8">{/* <h1>Select an organization from the dropdown above.</h1> */}</div>;
};

Index.layout = NoLayout;

export default Index;
