import KysoTopBar from "@/layouts/KysoTopBar";
import { selectActiveOrganization, selectActiveTeam } from "@kyso-io/kyso-store";
import type { Organization, Team } from "@kyso-io/kyso-model";
import { useAppSelector } from "@/hooks/redux-hooks";
import SelfLoadedTeamLeftMenu from "@/wrappers/SelfLoadedTeamLeftMenu";

const Index = () => {
  // This works because we are using SelfLoadedTeamLeftMenu, which is using CommonDataWrapper
  const organizationData: Organization = useAppSelector(selectActiveOrganization);
  const teamData: Team = useAppSelector(selectActiveTeam);

  return (
    <>
      <SelfLoadedTeamLeftMenu>
        <div className="mt-8">
          <h1>Display name: {organizationData?.display_name}</h1>
          <h1>avatar url: {organizationData?.avatar_url}</h1>
          <h1>link: {organizationData?.link}</h1>
          <h1>legal name: {organizationData?.legal_name}</h1>
          <h1>id {organizationData?.id}</h1>
          <h1>location {organizationData?.location}</h1>
        </div>

        <div className="mt-8">
          <h1>Display name: {teamData?.display_name}</h1>
          <h1>avatar url: {teamData?.avatar_url}</h1>
          <h1>link: {teamData?.link}</h1>
          <h1>legal name: {teamData?.bio}</h1>
          <h1>id {teamData?.id}</h1>
          <h1>location {teamData?.visibility}</h1>
        </div>
      </SelfLoadedTeamLeftMenu>
    </>
  );
};

Index.layout = KysoTopBar;

export default Index;
