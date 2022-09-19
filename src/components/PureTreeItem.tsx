import { faChrome, faJediOrder, faJs, faLinux, faMarkdown, faPython } from '@fortawesome/free-brands-svg-icons';
import { faFile, faFileCsv, faFileImage, faFilePdf, faText } from '@fortawesome/pro-light-svg-icons';
import { StarIcon } from '@heroicons/react/solid';
import { faFolder } from '@fortawesome/pro-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';

type IPureTreeItemProps = {
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  treeItem: any;
  href?: string;
  current?: boolean;
  isMainFile: boolean;
  onNavigation?: (e: React.MouseEvent<HTMLElement>) => void;
};

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

const PureTreeItem = (props: IPureTreeItemProps) => {
  const { treeItem, href, current = false, isMainFile, onNavigation } = props;
  let icon = treeItem.type === 'file' ? faFile : faFolder;

  const extension = treeItem.path.split('.').pop();
  if (treeItem.type === 'file') {
    switch (extension.toLowerCase()) {
      case 'ipynb':
        icon = faJediOrder;
        break;
      case 'html':
        icon = faChrome;
        break;
      case 'csv':
        icon = faFileCsv;
        break;
      case 'py':
        icon = faPython;
        break;
      case 'md':
        icon = faMarkdown;
        break;
      case 'pdf':
        icon = faFilePdf;
        break;
      case 'txt':
        icon = faText;
        break;
      case 'png':
      case 'jpg':
      case 'jpeg':
        icon = faFileImage;
        break;
      case 'js':
        icon = faJs;
        break;
      case 'sh':
        icon = faLinux;
        break;
      default:
        icon = faFile;
    }
  }

  return (
    <Link href={href || `/${treeItem.path}`}>
      <a className={classNames('p-2 text-sm w-full group flex items-center justify-between  overflow-x-auto', current ? 'bg-gray-200' : 'hover:bg-gray-100')} onClick={onNavigation}>
        <div className={classNames('group flex items-center font-medium text-slate-500', 'hover:text-gray-900', 'font-normal')}>
          <span className="w-6 text-blue-400">
            {extension === 'ipynb' && (
              <span>
                <svg width="12" height="12" viewBox="0 0 39 51" xmlns="http://www.w3.org/2000/svg">
                  <g transform="translate(-1638 -2281)">
                    <g className="jp-icon-warn0" fill="#F37726">
                      <path
                        transform="translate(1639.74 2311.98)"
                        d="M 18.2646 7.13411C 10.4145 7.13411 3.55872 4.2576 0 0C 1.32539 3.8204 3.79556 7.13081 7.0686 9.47303C 10.3417 11.8152 14.2557 13.0734 18.269 13.0734C 22.2823 13.0734 26.1963 11.8152 29.4694 9.47303C 32.7424 7.13081 35.2126 3.8204 36.538 0C 32.9705 4.2576 26.1148 7.13411 18.2646 7.13411Z"
                      />
                      <path
                        transform="translate(1639.73 2285.48)"
                        d="M 18.2733 5.93931C 26.1235 5.93931 32.9793 8.81583 36.538 13.0734C 35.2126 9.25303 32.7424 5.94262 29.4694 3.6004C 26.1963 1.25818 22.2823 0 18.269 0C 14.2557 0 10.3417 1.25818 7.0686 3.6004C 3.79556 5.94262 1.32539 9.25303 0 13.0734C 3.56745 8.82463 10.4232 5.93931 18.2733 5.93931Z"
                      />
                    </g>
                    <g className="jp-icon3" fill="#616161">
                      <path
                        transform="translate(1669.3 2281.31)"
                        d="M 5.89353 2.844C 5.91889 3.43165 5.77085 4.01367 5.46815 4.51645C 5.16545 5.01922 4.72168 5.42015 4.19299 5.66851C 3.6643 5.91688 3.07444 6.00151 2.49805 5.91171C 1.92166 5.8219 1.38463 5.5617 0.954898 5.16401C 0.52517 4.76633 0.222056 4.24903 0.0839037 3.67757C -0.0542483 3.10611 -0.02123 2.50617 0.178781 1.95364C 0.378793 1.4011 0.736809 0.920817 1.20754 0.573538C 1.67826 0.226259 2.24055 0.0275919 2.82326 0.00267229C 3.60389 -0.0307115 4.36573 0.249789 4.94142 0.782551C 5.51711 1.31531 5.85956 2.05676 5.89353 2.844Z"
                      />
                      <path
                        transform="translate(1639.8 2323.81)"
                        d="M 7.42789 3.58338C 7.46008 4.3243 7.27355 5.05819 6.89193 5.69213C 6.51031 6.32607 5.95075 6.83156 5.28411 7.1446C 4.61747 7.45763 3.87371 7.56414 3.14702 7.45063C 2.42032 7.33712 1.74336 7.0087 1.20184 6.50695C 0.660328 6.0052 0.27861 5.35268 0.105017 4.63202C -0.0685757 3.91135 -0.0262361 3.15494 0.226675 2.45856C 0.479587 1.76217 0.931697 1.15713 1.52576 0.720033C 2.11983 0.282935 2.82914 0.0334395 3.56389 0.00313344C 4.54667 -0.0374033 5.50529 0.316706 6.22961 0.987835C 6.95393 1.65896 7.38484 2.59235 7.42789 3.58338L 7.42789 3.58338Z"
                      />
                      <path
                        transform="translate(1638.36 2286.06)"
                        d="M 2.27471 4.39629C 1.84363 4.41508 1.41671 4.30445 1.04799 4.07843C 0.679268 3.8524 0.385328 3.52114 0.203371 3.12656C 0.0214136 2.73198 -0.0403798 2.29183 0.0258116 1.86181C 0.0920031 1.4318 0.283204 1.03126 0.575213 0.710883C 0.867222 0.39051 1.24691 0.164708 1.66622 0.0620592C 2.08553 -0.0405897 2.52561 -0.0154714 2.93076 0.134235C 3.33591 0.283941 3.68792 0.551505 3.94222 0.90306C 4.19652 1.25462 4.34169 1.67436 4.35935 2.10916C 4.38299 2.69107 4.17678 3.25869 3.78597 3.68746C 3.39516 4.11624 2.85166 4.37116 2.27471 4.39629L 2.27471 4.39629Z"
                      />
                    </g>
                  </g>
                </svg>
              </span>
            )}
            {extension !== 'ipynb' && <FontAwesomeIcon style={{ marginRight: 8 }} icon={icon} />}
          </span>
          <span className="text-gray-500">{treeItem.path.split('/').reverse()[0]}</span>
        </div>
        {isMainFile && (
          <div className="text-sm text-gray-500 ml-3">
            {' '}
            <StarIcon style={{ width: '18px', display: 'initial' }} aria-hidden="true" />
            Main
          </div>
        )}
      </a>
    </Link>
  );
};

export default PureTreeItem;
