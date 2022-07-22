import type { LayoutProps } from '@/types/pageWithLayout';
import { useRouter } from 'next/router';
import { Helper } from '@/helpers/Helper';
import { useUser } from '@/hooks/use-user';

import PureKysoTopBar from '@/components/PureKysoTopBar';
import type { ReactElement } from 'react';
import type { UserDTO } from '@kyso-io/kyso-model';

type IUnpureKysoTopBarProps = {
  children: ReactElement;
};

const KysoTopBar: LayoutProps = ({ children }: IUnpureKysoTopBarProps) => {
  const router = useRouter();
  const user: UserDTO = useUser();

  let slugifiedName = '';
  if (user && user.display_name) {
    slugifiedName = Helper.slugify(user.display_name);
  }

  const userNavigation = [
    { name: 'Your Profile', href: `${router.basePath}/user/${slugifiedName}` },
    {
      name: 'Your settings',
      href: `${router.basePath}/user/${slugifiedName}/settings`,
    },
    { name: 'Sign out', href: `${router.basePath}/logout` },
  ];

  return (
    <PureKysoTopBar user={user} basePath={router.basePath} userNavigation={userNavigation}>
      {children}
    </PureKysoTopBar>
  );
};
export default KysoTopBar;
