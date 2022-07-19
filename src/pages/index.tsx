import KysoTopBar from '@/layouts/KysoTopBar';
import UnpureSidebar from '@/wrappers/UnpureSidebar';
import { useRedirectIfNoJWT } from '@/hooks/use-redirect-if-no-jwt';

const Index = () => {
  useRedirectIfNoJWT();
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
