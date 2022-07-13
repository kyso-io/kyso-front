import type { LayoutProps } from "@/types/pageWithLayout";
import { useRouter } from "next/router";
import { Helper } from "@/helpers/Helper";
import { useAuth } from "@/hooks/use-auth";

import PureKysoTopBar from "@/components/PureKysoTopBar";

const KysoTopBar: LayoutProps = ({ children }: any) => {
  const router = useRouter();
  const user = useAuth();

  let slugifiedName = "";
  if (user) {
    slugifiedName = Helper.slugify(user?.display_name);
  }

  const userNavigation = [
    { name: "Your Profile", href: `${router.basePath}/user/${slugifiedName}` },
    {
      name: "Your settings",
      href: `${router.basePath}/user/${slugifiedName}/settings`,
    },
    { name: "Sign out", href: `${router.basePath}/logout` },
  ];

  return (
    <PureKysoTopBar
      user={user}
      basePath={router.basePath}
      userNavigation={userNavigation}
    >
      {children}
    </PureKysoTopBar>
  );
};
export default KysoTopBar;
