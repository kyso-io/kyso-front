import { useState } from 'react';
import { Combobox } from '@headlessui/react';
import { SelectorIcon, CheckIcon } from '@heroicons/react/outline';

type IUnPureSuggestUserCombobox = {
  label: string;
  suggestions: { id: string; nickname: string; avatar_url: string }[];
  setSelectedPeople: (_selectedPeople: string[]) => void;
  selectedPeople: string[];
};

const UnPureSuggestUserCombobox = (props: IUnPureSuggestUserCombobox) => {
  function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ');
  }

  const { label, suggestions, setSelectedPeople, selectedPeople } = props;
  const [query, setQuery] = useState('');
  // const [selectedPeople, setSelectedPeople] = useState();

  const filteredPeople =
    query === ''
      ? suggestions
      : suggestions.filter((person) => {
          return person.nickname.toLowerCase().includes(query.toLowerCase());
        });

  return (
    <Combobox
      as="div"
      value={selectedPeople}
      onChange={(newlySelectedPeople: string[]) => {
        setSelectedPeople(newlySelectedPeople);
      }}
      multiple
    >
      <Combobox.Label className="block text-sm font-medium text-gray-700">{label}</Combobox.Label>
      <div className="relative mt-1">
        <Combobox.Input
          className="w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
          onChange={(event) => {
            setQuery(event.target.value);
          }}
          // displayValue={(person: string[]) => person?.nickname}
        />
        <Combobox.Button className="mx-3 absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
          <SelectorIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </Combobox.Button>

        {filteredPeople && filteredPeople.length > 0 && (
          <Combobox.Options className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ro-5 focus:outline-none sm:text-sm">
            {filteredPeople.map((person) => (
              <Combobox.Option
                key={person.id}
                value={person}
                className={({ active }) => classNames('relative cursor-default select-none py-2 pl-3 pr-9', active ? 'bg-indigo-600 text-white' : 'text-gray-900')}
              >
                {({ active, selected }) => (
                  <>
                    <div className="flex items-center">
                      <img src={person.avatar_url} alt="" className="h-6 w-6 shrink-0 rounded-full" />
                      <span className={classNames('ml-3 truncate', selected ? 'font-semibold' : 'font-medium')}>{person.nickname}</span>
                    </div>

                    {selected && (
                      <span className={classNames('absolute inset-y-0 right-0 flex items-center pr-4', active ? 'text-white' : 'text-indigo-600')}>
                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                      </span>
                    )}
                  </>
                )}
              </Combobox.Option>
            ))}
          </Combobox.Options>
        )}
      </div>
    </Combobox>
  );
};

export default UnPureSuggestUserCombobox;
