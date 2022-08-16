import { getLocalStorageItem } from '@/helpers/isomorphic-local-storage';
import { useEffect } from 'react';
import { useRedirectIfNoJWT } from '@/hooks/use-redirect-if-no-jwt';
import { useRouter } from 'next/router';
import type { CommonData } from '@/hooks/use-common-data';
import { useCommonData } from '@/hooks/use-common-data';
import NoLayout from '@/layouts/NoLayout';

const Index = () => {
  useRedirectIfNoJWT();

  const router = useRouter();
  const commonData: CommonData = useCommonData({
    organizationName: router.query.organizationName as string,
    teamName: router.query.teamName as string,
  });

  useEffect(() => {
    setTimeout(() => {
      if (!commonData.user) {
        return;
      }
      const lastOrganization: string | null = getLocalStorageItem('last_organization');
      const orgs = commonData.permissions?.organizations;

      if (lastOrganization && lastOrganization !== 'undefined') {
        router.push(`${lastOrganization}`);
      } else if (orgs && orgs.length > 0) {
        router.push(`${orgs[0]?.name}`);
      }
    }, 200);
  }, [commonData]);

  return <div className="mt-8">{/* <h1>Select an organization from the dropdown above.</h1> */}</div>;
};

Index.layout = NoLayout;

export default Index;
