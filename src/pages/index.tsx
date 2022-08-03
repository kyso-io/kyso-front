import { getLocalStorageItem } from '@/helpers/get-local-storage-item';
import KysoApplicationLayout from '@/layouts/KysoApplicationLayout';
import { useEffect } from 'react';
import { useRedirectIfNoJWT } from '@/hooks/use-redirect-if-no-jwt';
import { useRouter } from 'next/router';

const Index = () => {
  const router = useRouter();
  useRedirectIfNoJWT();

  useEffect(() => {
    const lastOrganization: string | null = getLocalStorageItem('last_organization');
    if (lastOrganization && lastOrganization !== 'undefined') {
      router.push(`${lastOrganization}`);
    }
  }, []);

  return (
    <div className="mt-8">
      <h1>Select an organization from the dropdown above.</h1>
    </div>
  );
};

Index.layout = KysoApplicationLayout;

export default Index;
