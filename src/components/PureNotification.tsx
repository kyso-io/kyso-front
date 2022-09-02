import { Transition } from '@headlessui/react';
import { XIcon, InformationCircleIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/solid';
import { Fragment, useState } from 'react';

type Props = {
  message: string;
  type?: string;
};

const PureNotification = (props: Props) => {
  const [show, setShow] = useState(true);
  let notificationColor = 'blue';
  if (props.type === 'success') {
    notificationColor = 'green';
  }
  if (props.type === 'warning') {
    notificationColor = 'yellow';
  }
  if (props.type === 'danger') {
    notificationColor = 'red';
  }

  let NotificationIcon = InformationCircleIcon;
  if (props.type === 'success') {
    NotificationIcon = CheckCircleIcon;
  }

  if (props.type === 'warning') {
    NotificationIcon = ExclamationCircleIcon;
  }
  if (props.type === 'danger') {
    NotificationIcon = ExclamationCircleIcon;
  }

  return (
    <div key={props.message} aria-live="assertive" className="z-50 fixed inset-0 flex items-end px-4 py-6 pointer-events-none sm:p-6 sm:items-start">
      <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
        {/* Notification panel, dynamically insert this into the live region when it needs to be displayed */}
        <Transition
          show={show}
          as={Fragment}
          enter="transform ease-out duration-300 transition"
          enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
          enterTo="translate-y-0 opacity-100 sm:translate-x-0"
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className={`max-w-sm w-full bg-${notificationColor}-50 shadow-lg rounded-lg pointer-events-auto ring-1 ring-gray-300 ring-opacity/5 overflow-hidden`}>
            <div className="p-4">
              <div className="flex items-start">
                <div className="shrink-0">
                  <NotificationIcon className={`h-6 w-6 text-${notificationColor}-400`} aria-hidden="true" />
                </div>
                <div className="ml-3 w-0 flex-1 pt-0.5">
                  <p className="text-sm font-medium text-gray-900">{props.message}</p>
                </div>
                <div className="ml-4 shrink-0 flex">
                  {/* done */}
                  <button
                    type="button"
                    className="rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
                    onClick={() => {
                      setShow(false);
                    }}
                  >
                    <span className="sr-only">Close</span>
                    <XIcon className="h-5 w-5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  );
};

export default PureNotification;
