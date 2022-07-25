import KysoTopBar from '@/layouts/KysoTopBar';
import UnpureMain from '@/wrappers/UnpureMain';
import { useRedirectIfNoJWT } from '@/hooks/use-redirect-if-no-jwt';
import { getLocalStorageItem } from '@/helpers/get-local-storage-item';
import { useEffect } from 'react';
import { useRouter } from 'next/router';

const lastOrganization: string | null = getLocalStorageItem('last_organization');

const Index = () => {
  useRedirectIfNoJWT();
  const router = useRouter();

  useEffect(() => {
    if (lastOrganization) {
      router.push(`${lastOrganization}`);
    }
  }, []);

  return (
    <>
      <UnpureMain>
        <div className="mt-8">
          <h1>Redirecting you to your last used organization</h1>
        </div>
      </UnpureMain>
    </>
  );
};

Index.layout = KysoTopBar;

export default Index;
