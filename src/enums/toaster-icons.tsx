import { CheckCircleIcon, ExclamationCircleIcon, InformationCircleIcon } from '@heroicons/react/solid';

export class ToasterIcons {
  public static ERROR: JSX.Element = (<ExclamationCircleIcon className="h-6 w-6 text-red-400" aria-hidden="true" />);

  public static SUCCESS: JSX.Element = (<CheckCircleIcon className="h-6 w-6 text-green-400" aria-hidden="true" />);

  public static INFO: JSX.Element = (<InformationCircleIcon className="h-6 w-6 text-blue-400" aria-hidden="true" />);
}
