import KysoTopBar from "@/layouts/KysoTopBar";
import { useRouter } from "next/router";
import UnpureSidebar from "@/wrappers/UnpureSidebar";
import type { CommonData } from "@/hooks/use-common-data";
import { useCommonData } from "@/hooks/use-common-data";

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
  const commonData: CommonData = useCommonData();

  return (
    <>
      <UnpureSidebar>
        <div className="mt-8">
          <h1>Organization Dashboard: {commonData.organization?.display_name}</h1>
          <a href={`${router.basePath}/${commonData.organization?.sluglified_name}`} className="text-indigo-500">
            Go to organization dashboard
          </a>
          <p>- [USER IS LOGGED IN AND ADMIN]: show org settings</p>
          <p>- [NONE OF THE ABOVE]: 404</p>
        </div>
      </UnpureSidebar>
    </>
  );
};

Index.layout = KysoTopBar;

export default Index;
