import type { LayoutProps } from "@/types/pageWithLayout";

import { Meta } from "./Meta";

const NoLayout: LayoutProps = ({ children }: any) => {
  return (
    <>
      <Meta
        title="Next.js Boilerplate Presentation"
        description="Next js Boilerplate is the perfect starter code for your project. Build your React application with the Next.js framework."
      />
      <div className="h-screen w-screen">{children}</div>
    </>
  );
};
export default NoLayout;
