type IPureTopTabsProps = {
  tabs: { name: string }[];
  currentTab: string;
  onChangeTab: (_tag: string) => void;
};

const PureTopTabs = (props: IPureTopTabsProps) => {
  const { tabs, currentTab, onChangeTab } = props;

  function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ');
  }

  return (
    <div>
      <div className="sm:hidden">
        <label htmlFor="tabs" className="sr-only">
          Select a tab
        </label>
        {/* Use an "onChange" listener to redirect the user to the selected tab URL. */}
        <select
          id="tabs"
          name="tabs"
          className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          defaultValue={currentTab}
        >
          {tabs.map((tab) => (
            <option key={tab.name}>{tab.name}</option>
          ))}
        </select>
      </div>

      <div className="hidden sm:block">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.name}
              onClick={() => onChangeTab(tab.name)}
              className={classNames(
                currentTab === tab.name ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm',
              )}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};
export default PureTopTabs;
