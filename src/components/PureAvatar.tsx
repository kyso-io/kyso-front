type IPureAvatarProps = {
  defaultName?: string;
  avatarUrl?: string;
};

const PureAvatar = (props: IPureAvatarProps) => {
  const { avatarUrl, defaultName } = props;

  const name = defaultName?.substring(0, 2);

  return (
    <>
      {avatarUrl ? (
        <img className="inline-block h-9 w-9 rounded-full ring-2 ring-white" src={avatarUrl} alt={defaultName} />
      ) : (
        <span className="inline-flex items-center justify-center h-9 w-9 rounded-full ring-2 ring-white">
          <span className="text-sm font-medium leading-none text-gray-500">{name}</span>
        </span>
      )}
    </>
  );
};

export default PureAvatar;
