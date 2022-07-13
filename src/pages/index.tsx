import KysoTopBar from "@/layouts/KysoTopBar";
import { useAuth } from "@/hooks/use-auth";
import UnpureSidebar from "@/wrappers/UnpureSidebar";

const Index = () => {
  useAuth({ loginRedirect: false });

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
