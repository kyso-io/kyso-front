import type { LayoutProps } from '@/types/pageWithLayout';
import { Footer } from '@/components/Footer';
import { Disclosure } from '@headlessui/react';
import { useUser } from '@/hooks/use-user';

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
const MainLayout: LayoutProps = ({ children }: any) => {
  const user = useUser();

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-col z-10 w-screen border-b">
        <Disclosure as="div" className="bg-kyso-600">
          <div className="mx-auto px-4 sm:px-6 lg:px-8 text-white">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center">
                <div className="shrink-0">
                  {/* This always must redirect to the homepage */}
                  <a href={user ? '/' : 'https://about.kyso.io/'}>
                    <img className="h-8 w-8" src={`/assets/images/kyso-logo-white.svg`} alt="Kyso" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </Disclosure>
      </div>

      <div className="grow w-full rounded">{children}</div>
      <div className="flex-none pt-10">
        <Footer />
      </div>
    </div>
  );
};
export default MainLayout;
