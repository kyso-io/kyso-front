import type { Avatar } from '@/model/avatar.model';
import { TailwindFontSizeEnum } from '@/tailwind/enum/tailwind-font-size.enum';
import { TailwindHeightSizeEnum } from '@/tailwind/enum/tailwind-height.enum';
import type { Member } from '@/types/member';
import type { UserDTO } from '@kyso-io/kyso-model';
import PureAvatar from './PureAvatar';

interface Props {
  data: Avatar[] | UserDTO[] | Member[];
  size?: TailwindHeightSizeEnum;
  tooltip?: boolean;
  avatarAsLink?: boolean;
}

const PureAvatarGroup = (props: Props) => {
  // Default size
  let size: TailwindHeightSizeEnum = TailwindHeightSizeEnum.H6;

  if (props.size) {
    size = props.size;
  }

  return (
    <div className="flex -space-x-1 overflow-hidden">
      {[...props.data].reverse().map((author: Avatar, index: number) => (
        <PureAvatar
          key={index}
          src={author.avatar_url!}
          title={author.display_name}
          size={size}
          textSize={TailwindFontSizeEnum.XS}
          tooltip={props.tooltip}
          username={props.avatarAsLink ? author.username : undefined}
        />
      ))}
    </div>
  );
};

export default PureAvatarGroup;
