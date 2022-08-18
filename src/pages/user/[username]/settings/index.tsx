import KysoApplicationLayout from '@/layouts/KysoApplicationLayout';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

const Index = () => {
  const router = useRouter();

  useEffect(() => {
    router.push(`${router.basePath}/in/settings`);
  });

  // const commonData: CommonData = useCommonData();

  // let sluglifiedName = '';

  // if (commonData.user) {
  //   sluglifiedName = Helper.slugify(commonData.user?.display_name);
  // }

  return (
    <>
      {/* <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto mt-24">
          <h1>User settings: {commonData.user?.display_name}</h1>
          <p>
            <a href={`${router.basePath}/user/${sluglifiedName}`} className="text-indigo-500">
              Go to user dashboard
            </a>
          </p>
          <p>
            <a href={`${router.basePath}/user/${sluglifiedName}/settings/tokens`} className="text-indigo-500">
              Go to user token settings
            </a>
          </p>
          <p>- [USER IS LOGGED IN IS SAME USER]: show user profile with recent reports</p>
          <p>- [USER IS LOGGED IN AND NOT SAME USER]: show list of public reports for that user</p>
          <p>- [USER IS NOT LOGGED]: show list of public reports for that user, pinned on top, no sidebar</p>
          <p>- [NONE OF THE ABOVE]: 404</p>
        </div>
      </div> */}
    </>
  );
};

Index.layout = KysoApplicationLayout;

export default Index;
