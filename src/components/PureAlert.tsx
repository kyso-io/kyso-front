// import { ExclamationTriangleIcon } from '@heroicons/react/20/solid'

import { CheckCircleIcon, ExclamationCircleIcon, InformationCircleIcon, XCircleIcon } from '@heroicons/react/solid';

export enum PureAlertTypeEnum {
  WARNING = 0,
  ERROR = 1,
  SUCCESS = 2,
  INFO = 3,
}

interface Props {
  title: string;
  description: string;
  type: PureAlertTypeEnum;
}

export const PureAlert = (props: Props) => {
  let bg = 'bg-pink-50';
  let text = 'text-pink-800';
  let icon = 'text-pink-400';
  let description = 'text-pink-700';

  switch (props.type) {
    case PureAlertTypeEnum.ERROR:
      bg = 'bg-red-50';
      text = 'text-red-800';
      icon = 'text-red-400';
      description = 'text-red-700';
      break;
    case PureAlertTypeEnum.WARNING:
      bg = 'bg-yellow-50';
      text = 'text-yellow-800';
      icon = 'text-yellow-400';
      description = 'text-yellow-700';
      break;
    case PureAlertTypeEnum.SUCCESS:
      bg = 'bg-green-50';
      text = 'text-green-800';
      icon = 'text-green-400';
      description = 'text-green-700';
      break;
    case PureAlertTypeEnum.INFO:
      bg = 'bg-blue-50';
      text = 'text-blue-800';
      icon = 'text-blue-400';
      description = 'text-blue-700';
      break;
    default:
      bg = 'bg-pink-400';
      text = 'text-pink-400';
      icon = 'text-pink-400';
      description = 'text-pink-700';
      break;
  }

  return (
    <div className="space-y-8 m-1">
      <div className={`rounded-md p-4 ${bg}`}>
        <div className="flex">
          <div className="shrink-0">
            {props.type === PureAlertTypeEnum.WARNING && <ExclamationCircleIcon className={`h-5 w-5 ${icon}`} aria-hidden="true" />}
            {props.type === PureAlertTypeEnum.ERROR && <XCircleIcon className={`h-5 w-5 ${icon}`} aria-hidden="true" />}
            {props.type === PureAlertTypeEnum.SUCCESS && <CheckCircleIcon className={`h-5 w-5 ${icon}`} aria-hidden="true" />}
            {props.type === PureAlertTypeEnum.INFO && <InformationCircleIcon className={`h-5 w-5 ${icon}`} aria-hidden="true" />}
          </div>
          <div className="ml-3">
            <h3 className={`text-sm font-medium ${text}`}>{props.title}</h3>
            <div className={`mt-2 text-sm ${description}`}>
              <p>{props.description}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
