import KysoTopBar from '@/layouts/KysoTopBar';
import UnpureMain from '@/wrappers/UnpureMain';
import { useRedirectIfNoJWT } from '@/hooks/use-redirect-if-no-jwt';

const Index = () => {
  useRedirectIfNoJWT();
  // const user = useUser()
  useRedirectIfNoJWT();

  return (
    <>
      <UnpureMain>
        <div className="mt-8">
          <h1>Root</h1>
        </div>
      </UnpureMain>
    </>
  );
};

Index.layout = KysoTopBar;

export default Index;
