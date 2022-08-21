import { getLocalStorageItem } from '@/helpers/isomorphic-local-storage';
import type { NormalizedResponseDTO, TokenPermissions, UserDTO } from '@kyso-io/kyso-model';
import { Api } from '@kyso-io/kyso-store';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import ChannelList from '../components/ChannelList';
import type { CommonData } from '../hooks/use-common-data';
import { useCommonData } from '../hooks/use-common-data';
import KysoApplicationLayout from '../layouts/KysoApplicationLayout';

const Index = () => {
  const router = useRouter();
  const token: string | null = getLocalStorageItem('jwt');
  const commonData: CommonData = useCommonData();

  useEffect(() => {
    const redirectUserToOrganization = async () => {
      if (!token) {
        return;
      }
      const api: Api = new Api(token);
      let user: UserDTO | null = null;
      try {
        const responseUserDto: NormalizedResponseDTO<UserDTO> = await api.getUserFromToken();
        user = responseUserDto.data;
      } catch (e) {}
      if (!user) {
        return;
      }
      let lastOrganizationDict: { [userId: string]: string } = {};
      const lastOrganizationStr: string | null = getLocalStorageItem('last_organization');
      if (lastOrganizationStr) {
        try {
          lastOrganizationDict = JSON.parse(lastOrganizationStr);
        } catch (e) {}
      }
      if (lastOrganizationDict[user.id]) {
        router.push(`${lastOrganizationDict[user!.id]}`);
      } else {
        let permissions: TokenPermissions | null = null;
        if (user) {
          try {
            const response: NormalizedResponseDTO<TokenPermissions> = await api.getUserPermissions(user!.username);
            permissions = response.data;
            const orgs = permissions?.organizations;
            if (orgs && orgs.length > 0) {
              router.push(`${orgs[0]?.name}`);
            }
          } catch (e) {}
        }
      }
    };
    redirectUserToOrganization();
  }, []);

  return (
    <div className="flex flex-row space-x-8">
      <div className="w-1/6">
        <ChannelList basePath={router.basePath} commonData={commonData} />
      </div>
    </div>
  );
};

Index.layout = KysoApplicationLayout;

export default Index;
