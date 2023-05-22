import type { InlineCommentStatusEnum } from '@kyso-io/kyso-model';
import { KysoSettingsEnum } from '@kyso-io/kyso-model';
import { usePublicSetting } from '../../../hooks/use-public-setting';

interface Props {
  status: InlineCommentStatusEnum | null;
}

interface KysoCommentStatesValues {
  labels: {
    [key: string]: string;
  };
  classes: {
    [key: string]: string;
  };
}

const TagInlineComment = ({ status }: Props) => {
  const kysoCommentStatesValues: KysoCommentStatesValues | null = usePublicSetting(KysoSettingsEnum.KYSO_COMMENT_STATES_VALUES);

  try {
    if (!kysoCommentStatesValues || !status) {
      return null;
    }

    return <span className={kysoCommentStatesValues.classes[status] ?? ''}>{kysoCommentStatesValues.labels[status] ?? status}</span>;
  } catch (ex) {
    return <span>{status}</span>;
  }
};

export default TagInlineComment;
