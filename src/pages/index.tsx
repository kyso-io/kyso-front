import KysoTopBar from "@/layouts/KysoTopBar";
import SelfLoadedTeamLeftMenu from "@/wrappers/SelfLoadedTeamLeftMenu";
import { useAuth } from "@/hooks/use-auth";

const Index = () => {
  useAuth({ loginRedirect: false });

  return (
    <>
      <SelfLoadedTeamLeftMenu>
        <div className="mt-8">
          <h1>Root</h1>
        </div>
      </SelfLoadedTeamLeftMenu>
    </>
  );
};

Index.layout = KysoTopBar;

export default Index;
