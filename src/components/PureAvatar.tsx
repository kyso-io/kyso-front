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
        <img className="inline-block h-9 w-9 rounded-full" src={avatarUrl} alt={defaultName} />
      ) : (
        <span className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-gray-500 border border-gray-600">
          <span className="text-sm font-medium leading-none text-white">{name}</span>
        </span>
      )}
    </>
  );
};

export default PureAvatar;
