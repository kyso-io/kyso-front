import KysoApplicationLayout from '@/layouts/KysoApplicationLayout';
import type { CommonData } from '@/types/common-data';

interface Props {
  commonData: CommonData;
}

const Index = ({ commonData }: Props) => {
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

Index.layout = KysoApplicationLayout;

export default Index;
