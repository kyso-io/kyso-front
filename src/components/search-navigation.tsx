import type { ElasticSearchIndex } from '@kyso-io/kyso-model';
import clsx from 'clsx';
import type { SearchNavItem } from '../interfaces/search-nav-item';

interface Props {
  navigation: SearchNavItem[];
  elasticSearchIndex: ElasticSearchIndex;
  onSelectedNavItem: (elasticSearchIndex: ElasticSearchIndex) => void;
}

const SearchNavigation = ({ navigation, elasticSearchIndex, onSelectedNavItem }: Props) => {
  return (
    <nav className="bg-white p-4 space-y-1" aria-label="Sidebar" style={{ height: 150 }}>
      {navigation.map((navItem: SearchNavItem) => (
        <a
          onClick={() => onSelectedNavItem(navItem.elasticSearchIndex)}
          key={navItem.name}
          className={clsx(
            navItem.elasticSearchIndex === elasticSearchIndex ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
            'group flex items-center px-3 py-2 text-sm font-medium rounded-md',
          )}
          aria-current={navItem.elasticSearchIndex === elasticSearchIndex ? 'page' : undefined}
          style={{ cursor: 'pointer' }}
        >
          <span className="truncate">{navItem.name}</span>
          {navItem.count > 0 ? (
            <span
              className={clsx(
                navItem.elasticSearchIndex === elasticSearchIndex ? 'bg-white' : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200',
                'ml-auto inline-block py-0.5 px-3 text-xs rounded-full',
              )}
            >
              {navItem.count}
            </span>
          ) : null}
        </a>
      ))}
    </nav>
  );
};

export default SearchNavigation;
