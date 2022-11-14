import { Menu, Switch, Transition } from '@headlessui/react';
import { CodeIcon } from '@heroicons/react/solid';
import type { ReactNode } from 'react';
import { Fragment, useState } from 'react';

type ICodeVisibilityDropdownProps = {
  inputShown: boolean;
  outputShown: boolean;
  setInputShow: (bool: boolean) => void;
  setOutputShow: (bool: boolean) => void;
};

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

const CodeVisibilityDropdown = (props: ICodeVisibilityDropdownProps) => {
  const { inputShown, outputShown, setInputShow, setOutputShow } = props;

  const [menuOpened, setMenuOpened] = useState(false);

  const CustomMenuButton = (buttonProps: { children: ReactNode }) => {
    return <button onClick={() => setMenuOpened(!menuOpened)}>{buttonProps.children}</button>;
  };

  return (
    <Menu as="div">
      <Menu.Button className="h-10 p-2 inline-flex justify-left items-center float-right rounded-md border border-gray-300 shadow-sm bg-white  text-xs font-medium text-gray-700 hover:bg-gray-50 focus:outline-none">
        <CodeIcon className="h-5 w-5" aria-hidden="true" />
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items static className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white border ring-opacity/5 focus:outline-none">
          <div className="py-1">
            <Menu.Item as={CustomMenuButton}>
              <div className="p-2 flex align-center space-x-2">
                <Switch
                  checked={inputShown}
                  onChange={() => setInputShow(!inputShown)}
                  className={classNames(
                    inputShown ? 'bg-indigo-600' : 'bg-gray-200',
                    'relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500',
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={classNames(
                      inputShown ? 'translate-x-5' : 'translate-x-0',
                      'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200',
                    )}
                  />
                </Switch>
                <div className="text-sm text-gray-900">Input code cells</div>
              </div>
            </Menu.Item>
            <Menu.Item as={CustomMenuButton}>
              <div className="p-2 flex align-center space-x-2">
                <Switch
                  checked={outputShown}
                  onChange={() => setOutputShow(!outputShown)}
                  className={classNames(
                    outputShown ? 'bg-indigo-600' : 'bg-gray-200',
                    'relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500',
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={classNames(
                      outputShown ? 'translate-x-5' : 'translate-x-0',
                      'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200',
                    )}
                  />
                </Switch>
                <div className="text-sm text-gray-900">Output code cells</div>
              </div>
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export { CodeVisibilityDropdown };
