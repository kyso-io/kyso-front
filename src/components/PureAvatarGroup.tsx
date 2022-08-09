import type { Avatar } from '@/model/avatar.model';
import { TailwindHeightSizeEnum } from '@/tailwind/enum/tailwind-height.enum';
import type { Member } from '@/types/member';
import type { UserDTO } from '@kyso-io/kyso-model';
import PureAvatar from './PureAvatar';

interface Props {
  data: Avatar[] | UserDTO[] | Member[];
  size?: TailwindHeightSizeEnum;
}

const PureAvatarGroup = (props: Props) => {
  // Default size
  let size: TailwindHeightSizeEnum = TailwindHeightSizeEnum.H6;

  if (props.size) {
    size = props.size;
  }

  return (
    <div className="flex -space-x-1 overflow-hidden">
      {props.data.map((author: Avatar, index: number) => (
        <PureAvatar key={index} src={author.avatar_url!} title={author.display_name} size={size} />
      ))}
    </div>
  );
};

export default PureAvatarGroup;
