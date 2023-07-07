import type { Dispatch } from 'react';

import type { Comment } from '../../interfaces/response';
import type { ActionType } from '../hooks/snackbarReducer';
import CommentItem from './CommentItem';

export default function CommentList({
  comments,
  memberNames,
  dispatch,
}: {
  comments: Array<Comment>;
  memberNames: Array<string>;
  dispatch: Dispatch<ActionType>;
}) {
  return (
    <ul className="space-y-2">
      {comments.map((commentRecord: Comment) => {
        return (
          <CommentItem
            key={commentRecord.commentId}
            commentRecord={commentRecord}
            memberNames={memberNames}
            dispatch={dispatch}
          />
        );
      })}
    </ul>
  );
}
