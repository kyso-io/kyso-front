/* eslint-disable import/no-cycle */
import classNames from '@/helpers/class-names';
import { useAppDispatch, useAppSelector } from '@/hooks/redux-hooks';
import type { CommonData } from '@/hooks/use-common-data';
import type { ReportDTO } from '@kyso-io/kyso-model';
import { fetchReportCommentsAction, selectCommentsByParent } from '@kyso-io/kyso-store';
import { useEffect } from 'react';
import UnpureComment from './UnpureComment';
import UnpureCommentForm from './UnpureCommentForm';

type IUnpureComments = {
  parentId?: string;
  hasPermissionCreateComment: boolean;
  hasPermissionDeleteComment: boolean;
  report: ReportDTO;
  commonData: CommonData;
};

const UnpureComments = (props: IUnpureComments) => {
  const { parentId, report, commonData, hasPermissionDeleteComment, hasPermissionCreateComment } = props;
  const dispatch = useAppDispatch();
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
    <div className={classNames('w-full', parentId ? 'pl-10' : '')}>
      {!parentId && <UnpureCommentForm commonData={commonData} />}

      <div className="flex flex-col">
        {comments &&
          comments.map((comment) => (
            <UnpureComment
              hasPermissionDeleteComment={hasPermissionDeleteComment}
              key={`comment-${comment.id}`}
              id={comment.id}
              hasPermissionCreateComment={hasPermissionCreateComment}
              commonData={commonData}
              report={report}
            />
          ))}
      </div>
    </div>
  );
};

export default UnpureComments;
