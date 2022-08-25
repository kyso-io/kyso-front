import classNames from '@/helpers/class-names';
import { Combobox } from '@headlessui/react';
import { SelectorIcon, CheckIcon } from '@heroicons/react/solid';
import { useState } from 'react';

type ITagsFilterSelector = {
  filter: (query: string) => void;
  onAddTags: (newTags: string[]) => void;
  initial: string[];
  setSelected: (selected: string[]) => void;
  selected: string[];
};

const TagsFilterSelector = (props: ITagsFilterSelector) => {
  const { initial = [], setSelected, selected = [], onAddTags } = props;
  const [query, setQuery] = useState('');

  const filtered =
    query === ''
      ? initial
      : initial.filter((tag) => {
          return tag.toLowerCase().includes(query.toLowerCase());
        });

  return (
    <>
      <Combobox
        value={selected}
        onChange={(newlySelected: string[]) => {
          setSelected(newlySelected);
          onAddTags(newlySelected);
          setQuery('');
        }}
        multiple
      >
        <div className="relative">
          <Combobox.Input
            className="w-44 rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
            onChange={(event) => {
              setQuery(event.target.value);
            }}
            placeholder={selected.length > 0 ? selected.join(', ') : 'Add tags'}
          />
          <Combobox.Button className="mx-3 absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
            <SelectorIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </Combobox.Button>

          <Combobox.Options className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-0 border ro-5 focus:outline-none sm:text-sm">
            {query.length > 0 && (
              <Combobox.Option value={query} className={({ active }) => classNames('relative cursor-default select-none py-2 pl-3 pr-9', active ? 'bg-indigo-600 text-white' : 'text-gray-900')}>
                {'Create "{query}"'}
              </Combobox.Option>
            )}
            {filtered.sort().map((tag) => (
              <Combobox.Option
                key={tag}
                value={tag}
                className={({ active }) => classNames('relative cursor-default select-none py-2 pl-3 pr-9', active ? 'bg-indigo-600 text-white' : 'text-gray-900')}
              >
                {({ active }) => {
                  const isSelected = selected.includes(tag);
                  return (
                    <>
                      <div className="flex items-center">
                        <span className={classNames('ml-3 truncate', isSelected ? 'font-semibold' : 'font-medium')}>{tag}</span>
                      </div>

                      {isSelected && (
                        <span className={classNames('absolute inset-y-0 right-0 flex items-center pr-4', active ? 'text-white' : 'text-indigo-600')}>
                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
                        </span>
                      )}
                    </>
                  );
                }}
              </Combobox.Option>
            ))}
          </Combobox.Options>
        </div>
      </Combobox>
    </>
  );
};

export default TagsFilterSelector;
