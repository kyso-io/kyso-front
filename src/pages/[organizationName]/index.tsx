import KysoTopBar from "@/layouts/KysoTopBar";
import { selectActiveOrganization } from "@kyso-io/kyso-store";
import type { Organization } from "@kyso-io/kyso-model";
import { useAppSelector } from "@/hooks/redux-hooks";
import SelfLoadedTeamLeftMenu from "@/wrappers/SelfLoadedTeamLeftMenu";

const Index = () => {
  // This works because we are using SelfLoadedTeamLeftMenu, which is using CommonDataWrapper
  const organizationData: Organization = useAppSelector(selectActiveOrganization);

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
      </SelfLoadedTeamLeftMenu>
    </>
  );
};

Index.layout = KysoTopBar;

export default Index;
