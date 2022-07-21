import KysoTopBar from '@/layouts/KysoTopBar';
import UnpureMain from '@/wrappers/UnpureMain';
import type { CommonData } from '@/hooks/use-common-data';
import { useCommonData } from '@/hooks/use-common-data';
import { useRedirectIfNoJWT } from '@/hooks/use-redirect-if-no-jwt';

const Index = () => {
  const commonData: CommonData = useCommonData();
  useRedirectIfNoJWT();
  // const reports = useReports({
  //   perPage: router.query.per_page as string,
  //   page: router.query.page as string,
  //   search: router.query.search as string,
  //   sort: router.query.sort as string,
  //   tags: router.query.tags as string[],
  // });

  return (
    <>
      <UnpureMain>
        <div className="container mx-auto flex">
          <div className="basis-3/4">
            <main className="py-10">
              <div className="max-w-3xl mx-auto px-4 sm:px-6 md:flex md:items-center md:justify-between md:space-x-5 lg:max-w-7xl lg:px-8">
                <div className="flex items-center space-x-5">
                  <div className="shrink-0">
                    <div className="relative">
                      <img className="h-16 w-16 rounded-full" src={commonData.organization?.avatar_url} alt="" />
                      <span className="absolute inset-0 shadow-inner rounded-full" aria-hidden="true" />
                    </div>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{commonData.organization?.display_name}</h1>
                    <p className="text-sm font-medium text-gray-500">{commonData.organization?.bio}</p>
                  </div>
                </div>
              </div>
            </main>

            <div className="max-w-3xl mx-auto p-4 md:flex md:items-center md:justify-between md:space-x-5 lg:max-w-7xl lg:px-8 bg-white rounded shadow">
              <pre className="text-xs font-light">{JSON.stringify(commonData.organization, null, 2)}</pre>
            </div>
          </div>
        </div>
      </UnpureMain>
    </>
  );
};

Index.layout = KysoTopBar;

export default Index;
