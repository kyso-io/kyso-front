import { useRouter } from "next/router";

import BrandSidebarWithLightHeader from "@/layouts/BrandSidebarWithLightHeader";

const Index = () => {
  const router = useRouter();
  const { organization } = (router as any).query;

  return <div>{organization}</div>;
};

Index.layout = BrandSidebarWithLightHeader;

export default Index;
