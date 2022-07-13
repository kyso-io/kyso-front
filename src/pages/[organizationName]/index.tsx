import KysoTopBar from "@/layouts/KysoTopBar";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/router";
import UnpureSidebar from "@/wrappers/UnpureSidebar";
import type { CommonData } from "@/hooks/use-common-data";
import { useCommonData } from "@/hooks/use-common-data";

const Index = () => {
  useAuth({ loginRedirect: false });
  const router = useRouter();

  const commonData: CommonData = useCommonData();

  return (
    <>
      <UnpureSidebar>
        <div className="mt-8">
          <h1>Organization Dashboard: {commonData.organization?.display_name}</h1>
          <a href={`${router.basePath}/${commonData.organization?.sluglified_name}/settings`} className="text-indigo-500">
            Go to organization settings
          </a>
          <p>- [USER IS LOGGED IN AND MEMBER]: show list of all reports for that org, pinned on top, and show member list component</p>
          <p>- [USER IS LOGGED IN AND NOT A MEMBER]: show list of public reports for that org, pinned on top, no sidebar</p>
          <p>- [USER IS NOT LOGGED]: show list of public reports for that org, pinned on top, no sidebar</p>
          <p>- [NONE OF THE ABOVE]: 404</p>
        </div>
      </UnpureSidebar>
    </>
  );
};

Index.layout = KysoTopBar;

export default Index;
