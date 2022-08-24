import { getLocalStorageItem } from '@/helpers/isomorphic-local-storage';
import { useRedirectIfNoJWT } from '@/hooks/use-redirect-if-no-jwt';
import type { CommonData } from '@/types/common-data';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import ChannelList from '../components/ChannelList';
import KysoApplicationLayout from '../layouts/KysoApplicationLayout';

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
        router.push(`${lastOrganizationDict[commonData.user!.id]}`);
      } else if (commonData.permissions) {
        const orgs = commonData.permissions?.organizations;
        if (orgs && orgs.length > 0) {
          router.push(`${orgs[0]?.name}`);
        }
      }
    };
    redirectUserToOrganization();
  }, []);

  return (
    <div className="flex flex-row space-x-8">
      <div className="w-1/6">{commonData.user && <ChannelList basePath={router.basePath} commonData={commonData} />}</div>
    </div>
  );
};

Index.layout = KysoApplicationLayout;

export default Index;
