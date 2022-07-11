import KysoTopBar from "@/layouts/KysoTopBar";
import {
  selectActiveOrganization,
  selectActiveTeam,
} from "@kyso-io/kyso-store";
import type { Organization, Team } from "@kyso-io/kyso-model";
import { useAppSelector } from "@/hooks/redux-hooks";
import SelfLoadedTeamLeftMenu from "@/wrappers/SelfLoadedTeamLeftMenu";
import { useRouter } from "next/router";

const Index = () => {
  // This works because we are using SelfLoadedTeamLeftMenu, which is using CommonDataWrapper
  const router = useRouter();
  const organizationData: Organization = useAppSelector(
    selectActiveOrganization
  );
  const teamData: Team = useAppSelector(selectActiveTeam);

  return (
    <>
      <SelfLoadedTeamLeftMenu>
        <div className="mt-8">
          <a
            href={`${router.basePath}/${organizationData?.sluglified_name}/${teamData?.sluglified_name}`}
            className="text-indigo-500"
          >
            Go to channel
          </a>

          <h1>Channel settings: {teamData?.display_name}</h1>
          <p>- [USER IS LOGGED IN AND ADMIN]: show channel settings</p>
          <p>- [NONE OF THE ABOVE]: 404</p>
        </div>
      </SelfLoadedTeamLeftMenu>
    </>
  );
};

Index.layout = KysoTopBar;

export default Index;
