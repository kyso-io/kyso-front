import KysoTopBar from '@/layouts/KysoTopBar';
import type { CommonData } from '@/hooks/use-common-data';
import { useCommonData } from '@/hooks/use-common-data';

const Index = () => {
  const commonData: CommonData = useCommonData();

  return (
    <>
      <div className="mt-8">
        <h1>Display name: {commonData.organization?.display_name}</h1>
        <h1>avatar url: {commonData.organization?.avatar_url}</h1>
        <h1>link: {commonData.organization?.link}</h1>
        <h1>legal name: {commonData.organization?.legal_name}</h1>
        <h1>id {commonData.organization?.id}</h1>
        <h1>location {commonData.organization?.location}</h1>
      </div>
    </>
  );
};

Index.layout = KysoTopBar;

export default Index;
