import KysoTopBar from '@/layouts/KysoTopBar';
import { useRouter } from 'next/router';
import type { CommonData } from '@/hooks/use-common-data';
import { useCommonData } from '@/hooks/use-common-data';

const Index = () => {
  const router = useRouter();
  const commonData: CommonData = useCommonData();

  return (
    <>
      <div className="mt-8">
        <a href={`${router.basePath}/${commonData.organization?.sluglified_name}/${commonData.team?.sluglified_name}`} className="text-indigo-500">
          Go to channel
        </a>

        <h1>Channel settings: {commonData.team?.display_name}</h1>
        <p>- [USER IS LOGGED IN AND ADMIN]: show channel settings</p>
        <p>- [NONE OF THE ABOVE]: 404</p>
      </div>
    </>
  );
};

Index.layout = KysoTopBar;

export default Index;
