import KysoTopBar from '@/layouts/KysoTopBar';
import UnpureMain from '@/unpure-components/UnpureMain';
import { useRedirectIfNoJWT } from '@/hooks/use-redirect-if-no-jwt';
import { getLocalStorageItem } from '@/helpers/get-local-storage-item';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import type { CommonData } from '@/hooks/use-common-data';
import { useCommonData } from '@/hooks/use-common-data';

const lastOrganization: string | null = getLocalStorageItem('last_organization');

const Index = () => {
  useRedirectIfNoJWT();
  const router = useRouter();
  const commonData: CommonData = useCommonData({
    organizationName: router.query.organizationName as string,
    teamName: router.query.teamName as string,
  });

  useEffect(() => {
    if (lastOrganization) {
      router.push(`${lastOrganization}`);
    }
  }, []);

  return (
    <>
      <UnpureMain basePath={router.basePath} commonData={commonData}>
        <div className="mt-8">
          <h1>Redirecting you to your last used organization</h1>
        </div>
      </UnpureMain>
    </>
  );
};

Index.layout = KysoTopBar;

export default Index;
