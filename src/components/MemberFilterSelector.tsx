import type { TeamMember } from '@kyso-io/kyso-model';
import classNames from '@/helpers/class-names';
import { Combobox } from '@headlessui/react';
import { SelectorIcon, CheckIcon } from '@heroicons/react/solid';
import { useState } from 'react';
import PureAvatar from './PureAvatar';

type IMemberFilterSelector = {
  label: string;
  initial: TeamMember[];
  setSelected: (selected: TeamMember[]) => void;
  selected: TeamMember[];
};

const MemberFilterSelector = (props: IMemberFilterSelector) => {
  const { label, initial = [], setSelected, selected = [] } = props;
  const [query, setQuery] = useState('');

  const filteredPeople =
    query === ''
      ? initial
      : initial.filter((person) => {
          return person.nickname.toLowerCase().includes(query.toLowerCase());
        });

  return (
    <>
      <div className="flex -space-x-1 overflow-hidden">
        {selected?.map((person: TeamMember) => (
          <PureAvatar key={person.id} src={person?.avatar_url} title={person.nickname} />
        ))}
      </div>
      <Combobox
        value={selected.map((s) => s.id)}
        onChange={(newlySelectedIds: string[]) => {
          setSelected(initial.filter((m) => newlySelectedIds.includes(m.id)));
        }}
        multiple
      >
        <div className="relative">
          <Combobox.Input
            className="w-44 rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
            onChange={(event) => {
              setQuery(event.target.value);
            }}
            placeholder={selected.length > 0 ? selected.map((s) => s.nameSlug).join(', ') : label}
          />
          <Combobox.Button className="mx-3 absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
            <SelectorIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </Combobox.Button>

          <Combobox.Options className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ro-5 focus:outline-none sm:text-sm">
            {filteredPeople.map((person) => (
              <Combobox.Option
                key={person.id}
                value={person.id}
                className={({ active }) => classNames('relative cursor-default select-none py-2 pl-3 pr-9', active ? 'bg-indigo-600 text-white' : 'text-gray-900')}
              >
                {({ active }) => {
                  const isSelected = selected.map((s) => s.id).includes(person.id);
                  return (
                    <>
                      <div className="flex items-center">
                        <PureAvatar key={person.id} src={person?.avatar_url} title={person.nickname} />
                        <span className={classNames('ml-3 truncate', isSelected ? 'font-semibold' : 'font-medium')}>{person.nickname}</span>
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

export default MemberFilterSelector;
