import classNames from '@/helpers/class-names';
import { TailwindFontSizeEnum } from '@/tailwind/enum/tailwind-font-size.enum';
import { TailwindHeightSizeEnum } from '@/tailwind/enum/tailwind-height.enum';
import { Combobox } from '@headlessui/react';
import { CheckIcon, SelectorIcon } from '@heroicons/react/solid';
import type { TeamMember } from '@kyso-io/kyso-model';
import { useState } from 'react';
import PureAvatar from './PureAvatar';

type IMemberFilterSelector = {
  initial: TeamMember[];
  setSelected: (selected: TeamMember[]) => void;
  selected: TeamMember[];
  emptyMessage?: string;
};

const MemberFilterSelector = (props: IMemberFilterSelector) => {
  const { initial = [], setSelected, selected = [], emptyMessage = 'No authors' } = props;
  const [query, setQuery] = useState('');

  const filteredPeople =
    query === ''
      ? initial
      : initial.filter((person: TeamMember) => {
          return person.nickname.toLowerCase().includes(query.toLowerCase());
        });

  return (
    <div className="flex flex-row items-center">
      <div className="flex flex-row overflow-hidden">
        {selected?.map((person: TeamMember) => (
          <PureAvatar key={person.id} src={person?.avatar_url} title={person.nickname} size={TailwindHeightSizeEnum.H6} textSize={TailwindFontSizeEnum.XS} className="mr-1" />
        ))}
      </div>
      <Combobox
        value={selected.map((s) => s.id)}
        onChange={(newlySelectedIds: string[]) => {
          setSelected(initial.filter((m: TeamMember) => newlySelectedIds.includes(m.id!)));
        }}
        multiple
      >
        <div className="relative">
          <Combobox.Input
            className="w-44 rounded-md border border-gray-300 bg-white shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
            onChange={(event) => {
              setQuery(event.target.value);
            }}
            placeholder={selected.length > 0 ? selected.map((s) => s.nameSlug).join(', ') : 'Add authors'}
          />
          <Combobox.Button
            className="mx-3 absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none bg-white"
            style={{
              zIndex: '10',
              height: '17px',
              position: 'absolute',
              top: '11px',
              right: '-11px',
            }}
          >
            <SelectorIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </Combobox.Button>

          <Combobox.Options className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-0 border ro-5 focus:outline-none sm:text-sm">
            {filteredPeople.length === 0 && (
              <div className={'relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900'}>
                <div className="flex items-center">{emptyMessage}</div>
              </div>
            )}
            {filteredPeople.length > 0 &&
              filteredPeople.map((person) => (
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
                          <PureAvatar key={person.id} src={person?.avatar_url} title={person.nickname} size={TailwindHeightSizeEnum.H6} textSize={TailwindFontSizeEnum.XS} />
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
    </div>
  );
};

export default MemberFilterSelector;
