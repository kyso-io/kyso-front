import KysoTopBar from "@/layouts/KysoTopBar";
import { selectActiveOrganization } from "@kyso-io/kyso-store";
import type { Organization } from "@kyso-io/kyso-model";
import { useAppSelector } from "@/hooks/redux-hooks";
import SelfLoadedTeamLeftMenu from "@/wrappers/SelfLoadedTeamLeftMenu";
import { useRouter } from "next/router";

/**
 * Organisation dashboard
 *
 * [USER IS LOGGED IN AND MEMBER]: show list of all reports for that org, pinned on top, and show member list component
 * [USER IS LOGGED IN AND NOT A MEMBER]: show list of public reports for that org, pinned on top, no sidebar
 * [USER IS NOT LOGGED]: show list of public reports for that org, pinned on top, no sidebar
 * [NONE OF THE ABOVE]: 404
 *
 */

const Index = () => {
  const router = useRouter();
  // This works because we are using SelfLoadedTeamLeftMenu, which is using CommonDataWrapper
  const organizationData: Organization = useAppSelector(selectActiveOrganization);

  return (
    <>
      <SelfLoadedTeamLeftMenu>
        <div className="mt-8">
          <h1>Organization Dashboard: {organizationData?.display_name}</h1>
          <a href={`${router.basePath}/${organizationData?.sluglified_name}`} className="text-indigo-500">
            Go to organization dashboard
          </a>
          <p>- [USER IS LOGGED IN AND ADMIN]: show org settings</p>
          <p>- [NONE OF THE ABOVE]: 404</p>
        </div>
      </SelfLoadedTeamLeftMenu>
    </>
  );
};

Index.layout = KysoTopBar;

export default Index;
