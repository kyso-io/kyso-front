import { Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { SelectorIcon, CheckIcon } from '@heroicons/react/solid';

type IUnPureSuggestTagsListbox = {
  tags: string[];
  onSetTags: (_tags: string[]) => void;
  selectedTags: string[];
};

const UnPureSuggestTagsListbox = (props: IUnPureSuggestTagsListbox) => {
  function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ');
  }
  const { tags = [], onSetTags = () => {}, selectedTags = [] } = props;

  // const d: string[] = [];
  // const [selectedTags, setSelectedTags] = useState(d);

  return (
    <div className="relative inline-block justify-end text-right">
      <div className="flow-root">
        <Listbox
          value={selectedTags}
          onChange={(newlySelectedTags: string[]) => {
            // setSelectedTags(newlySelectedTags);
            onSetTags(newlySelectedTags);
          }}
          multiple
        >
          {({ open }) => (
            <>
              <div className={classNames('mt-1 relative', selectedTags.length > 0 || open ? 'w-52' : '')}>
                <Listbox.Button className="bg-white relative w-full rounded-md pl-3 pr-10 py-2 text-left cursor-default focus:ring-0 sm:text-sm">
                  {selectedTags.length === 0 && <span className="block items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-gray-300 text-gray-800 mr-3">Tag</span>}
                  <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <SelectorIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </span>
                </Listbox.Button>

                <Transition show={open} as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                  <Listbox.Options className="text-left absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-0 border overflow-auto focus:outline-none sm:text-sm">
                    {tags &&
                      Array.isArray(tags) &&
                      tags.map((tag) => (
                        <Listbox.Option
                          key={tag}
                          className={({ active }) => classNames(active ? 'text-white bg-indigo-600' : 'text-gray-900', 'cursor-default select-none relative py-2 pl-3 pr-9')}
                          value={tag}
                        >
                          {({ selected, active }) => (
                            <>
                              {selected ? (
                                <span className={classNames(active ? 'text-white' : 'text-indigo-600', 'absolute inset-y-0 right-0 flex items-center pr-4')}>
                                  <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                </span>
                              ) : null}
                              <span className={classNames(selected ? 'font-semibold' : 'font-normal', 'block truncate')}>{tag}</span>
                            </>
                          )}
                        </Listbox.Option>
                      ))}
                  </Listbox.Options>
                </Transition>
              </div>
            </>
          )}
        </Listbox>
      </div>
    </div>
  );
};

export default UnPureSuggestTagsListbox;
