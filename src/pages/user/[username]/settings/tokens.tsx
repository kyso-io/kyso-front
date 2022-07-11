import KysoTopBar from "@/layouts/KysoTopBar";
import { selectUser } from "@kyso-io/kyso-store";
import type { Organization } from "@kyso-io/kyso-model";
import { useAppSelector } from "@/hooks/redux-hooks";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/router";
import CommonDataWrapper from "@/wrappers/CommonDataWrapper";
import { Helper } from "@/helpers/Helper";

const Index = () => {
  useAuth({ loginRedirect: false });
  const router = useRouter();
  // This works because we are using SelfLoadedTeamLeftMenu, which is using CommonDataWrapper
  const userData: Organization = useAppSelector(selectUser);

  let sluglifiedName = "";
  if (userData) sluglifiedName = Helper.slugify(userData?.display_name);

  return (
    <>
      <CommonDataWrapper>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto mt-24">
            <h1>User token settings: {userData?.display_name}</h1>
            <p>
              <a
                href={`${router.basePath}/user/${sluglifiedName}/settings`}
                className="text-indigo-500"
              >
                Go to user settings
              </a>
            </p>
            <p>
              - [USER IS LOGGED IN IS SAME USER]: show user profile with recent
              reports
            </p>
            <p>
              - [USER IS LOGGED IN AND NOT SAME USER]: show list of public
              reports for that user
            </p>
            <p>
              - [USER IS NOT LOGGED]: show list of public reports for that user,
              pinned on top, no sidebar
            </p>
            <p>- [NONE OF THE ABOVE]: 404</p>
          </div>
        </div>
      </CommonDataWrapper>
    </>
  );
};

Index.layout = KysoTopBar;

export default Index;
