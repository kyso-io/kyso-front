import { InlineCommentStatusEnum } from '@kyso-io/kyso-model';

interface Props {
  status: InlineCommentStatusEnum | null;
}

const TagInlineComment = ({ status }: Props) => {
  switch (status) {
    case InlineCommentStatusEnum.OPEN:
      return <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded-full dark:bg-blue-900 dark:text-blue-300">open</span>;
    case InlineCommentStatusEnum.TO_DO:
      return <span className="bg-gray-100 text-gray-800 text-xs font-medium mr-2 px-2.5 py-1 rounded-full dark:bg-gray-700 dark:text-gray-300">to do</span>;
    case InlineCommentStatusEnum.DOING:
      return <span className="bg-yellow-100 text-yellow-800 text-xs font-medium mr-2 px-2.5 py-1 rounded-full dark:bg-yellow-900 dark:text-yellow-300">doing</span>;
    case InlineCommentStatusEnum.CLOSED:
      return <span className="bg-red-100 text-red-800 text-xs font-medium mr-2 px-2.5 py-1 rounded-full dark:bg-red-900 dark:text-red-300">closed</span>;
    default:
      return null;
  }
};

export default TagInlineComment;
