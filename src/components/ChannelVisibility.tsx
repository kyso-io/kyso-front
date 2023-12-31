import { TeamVisibilityEnum } from '@kyso-io/kyso-model';
import clsx from 'clsx';
import { useMemo, useState } from 'react';
import { Helper } from '../helpers/Helper';
import type { TailwindWidthSizeEnum } from '../tailwind/enum/tailwind-width.enum';

interface Props {
  containerClasses: string;
  teamVisibility: TeamVisibilityEnum;
  imageWidth: TailwindWidthSizeEnum;
  imageMarginX: TailwindWidthSizeEnum;
  imageMarginY: TailwindWidthSizeEnum;
  alwaysOnHover?: boolean;
}

const ChannelVisibility = ({ containerClasses, teamVisibility, imageWidth, imageMarginX, imageMarginY, alwaysOnHover }: Props) => {
  const [isShown, setIsShown] = useState<boolean>(false);
  const title: string = useMemo(() => Helper.ucFirst(teamVisibility), [teamVisibility]);
  const src: string = useMemo(() => {
    switch (teamVisibility) {
      case TeamVisibilityEnum.PUBLIC:
        return isShown || alwaysOnHover ? '/assets/images/public_hover.png' : '/assets/images/public.png';
      case TeamVisibilityEnum.PRIVATE:
        return isShown || alwaysOnHover ? '/assets/images/private_hover.png' : '/assets/images/private.png';
      case TeamVisibilityEnum.PROTECTED:
        return isShown || alwaysOnHover ? '/assets/images/protected_hover.png' : '/assets/images/protected.png';
      default:
        return '';
    }
  }, [teamVisibility, isShown, alwaysOnHover]);

  return (
    <div
      onMouseEnter={() => setIsShown(true)}
      onMouseLeave={() => setIsShown(false)}
      className={clsx(`rounded-full border ${containerClasses}`)}
      style={{ borderColor: isShown || alwaysOnHover ? '#4C4E5B' : 'rgb(203 213 225)' }}
      title={title}
    >
      <img src={src} className={`shrink-0 h-${imageWidth} w-${imageWidth} mx-${imageMarginX} my-${imageMarginY}`} alt={title} />
    </div>
  );
};

export default ChannelVisibility;
