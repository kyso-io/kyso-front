import { useUser } from '@/hooks/use-user';
import classNames from '@/helpers/class-names';
import KysoApplicationLayout from '@/layouts/KysoApplicationLayout';
import { BellIcon, CogIcon, KeyIcon, UserCircleIcon } from '@heroicons/react/outline';
import UnpurePersonalSettings from '@/unpure-components/UnpurePersonalSettings';

const Index = () => {
  const user = useUser();
  if (!user) {
    return null;
  }

  const personalNavigation = [
    { name: 'Personal Profile', href: '#', icon: UserCircleIcon, current: false },
    { name: 'Personal Token', href: '#', icon: CogIcon, current: true },
  ];

  const orgNavigation = [
    { name: 'Organization Profile', href: '#', icon: UserCircleIcon, current: false },
    { name: 'Members', href: '#', icon: CogIcon, current: false },
    { name: 'Access', href: '#', icon: KeyIcon, current: false },
    { name: 'Channels', href: '#', icon: BellIcon, current: false },
  ];

  return (
    <div>
      <main className="relative pt-8 bg-gray-50 -pb-10">
        <div className="mx-auto max-w-screen-xl px-4 pb-6 sm:px-6 lg:px-8 lg:pb-16">
          <div className="overflow-hidden rounded-lg bg-white shadow">
            <div className="divide-y divide-gray-200 lg:grid lg:grid-cols-12 lg:divide-y-0 lg:divide-x">
              <aside className="py-6 lg:col-span-3">
                <nav className="space-y-1">
                  {personalNavigation.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      className={classNames(
                        item.current
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-700'
                          : 'border-transparent text-gray-900 hover:bg-gray-50 hover:text-gray-900',
                        'group border-l-4 px-3 py-2 flex items-center text-sm font-medium',
                      )}
                      aria-current={item.current ? 'page' : undefined}
                    >
                      <item.icon
                        className={classNames(item.current ? 'text-indigo-500 group-hover:text-indigo-500' : 'text-gray-400 group-hover:text-gray-500', 'flex-shrink-0 -ml-1 mr-3 h-6 w-6')}
                        aria-hidden="true"
                      />
                      <span className="truncate">{item.name}</span>
                    </a>
                  ))}
                  <div className="w-full pt-6">
                    {orgNavigation.map((item) => (
                      <a
                        key={item.name}
                        href={item.href}
                        className={classNames(
                          item.current
                            ? 'bg-indigo-50 border-indigo-500 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-700'
                            : 'border-transparent text-gray-900 hover:bg-gray-50 hover:text-gray-900',
                          'group border-l-4 px-3 py-2 flex items-center text-sm font-medium first:border-2 first:border-t-gray-100 first:pt-6',
                        )}
                        aria-current={item.current ? 'page' : undefined}
                      >
                        <item.icon
                          className={classNames(item.current ? 'text-indigo-500 group-hover:text-indigo-500' : 'text-gray-400 group-hover:text-gray-500', 'flex-shrink-0 -ml-1 mr-3 h-6 w-6')}
                          aria-hidden="true"
                        />
                        <span className="truncate">{item.name}</span>
                      </a>
                    ))}
                  </div>
                </nav>
              </aside>

              <form className="divide-y divide-gray-200 lg:col-span-9" action="#" method="POST">
                {/* Profile section */}
                <UnpurePersonalSettings user={user} />
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

Index.layout = KysoApplicationLayout;

export default Index;
