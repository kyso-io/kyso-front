/* eslint-disable import/no-cycle */
import classNames from '@/helpers/ClassNames';
import { useAppDispatch, useAppSelector } from '@/hooks/redux-hooks';
import { useCommonReportData } from '@/hooks/use-common-report-data';
import { fetchReportCommentsAction, selectCommentsByParent } from '@kyso-io/kyso-store';
import { useEffect } from 'react';
import UnpureComment from './UnpureComment';
import UnpureCommentForm from './UnpureCommentForm';

type IUnpureComments = {
  parentId?: string;
  showPostButton?: boolean;
};

const UnpureComments = (props: IUnpureComments) => {
  const { parentId, showPostButton = true } = props;
  const dispatch = useAppDispatch();
  const report = useCommonReportData();
  const comments = useAppSelector((state) => selectCommentsByParent(state, parentId));

  useEffect(() => {
    if (report) {
      dispatch(
        fetchReportCommentsAction({
          reportId: report.id as string,
          sort: '-created_at',
        }),
      );
    }
  }, [report?.id]);

  return (
    <div className={classNames('w-full mt-2', parentId ? 'ml-4' : '')}>
      {!parentId && <UnpureCommentForm />}

      <div className="flex flex-col mt-4 space-y-0">{comments && comments.map((comment) => <UnpureComment key={`comment-${comment.id}`} id={comment.id} showPostButton={showPostButton} />)}</div>
    </div>
  );
};

export default UnpureComments;
