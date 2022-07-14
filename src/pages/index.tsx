import KysoTopBar from "@/layouts/KysoTopBar";
import UnpureSidebar from "@/wrappers/UnpureSidebar";
import { useRedirect } from "@/hooks/use-redirect";

const Index = () => {
  useRedirect();
  // const user = useUser()

  return (
    <>
      <UnpureSidebar>
        <div className="mt-8">
          <h1>Root</h1>
        </div>
      </UnpureSidebar>
    </>
  );
};

Index.layout = KysoTopBar;

export default Index;
