import { getLocalStorageItem } from '@/helpers/isomorphic-local-storage';
import { useRedirectIfNoJWT } from '@/hooks/use-redirect-if-no-jwt';
import NoLayout from '@/layouts/NoLayout';
import type { NormalizedResponseDTO, TokenPermissions, UserDTO } from '@kyso-io/kyso-model';
import { Api } from '@kyso-io/kyso-store';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

const Index = () => {
  useRedirectIfNoJWT();
  const router = useRouter();
  const token: string | null = getLocalStorageItem('jwt');

  useEffect(() => {
    const getData = async () => {
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
    getData();
  }, []);

  return <div className="mt-8">{/* <h1>Select an organization from the dropdown above.</h1> */}</div>;
};

Index.layout = NoLayout;

export default Index;
