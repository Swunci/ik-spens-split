import type { Dispatch } from 'react';

import type { Comment, Member } from '../../interfaces/response';
import type { ActionType } from '../hooks/snackbarReducer';
import CommentItem from './CommentItem';

export default function CommentList({
  comments,
  members,
  dispatch,
}: {
  comments: Array<Comment>;
  members: Array<Member>;
  dispatch: Dispatch<ActionType>;
}) {
  return (
    <ul className="space-y-2">
      {comments.map((commentRecord: Comment) => {
        return (
          <CommentItem
            key={commentRecord.commentId}
            commentRecord={commentRecord}
            members={members}
            dispatch={dispatch}
          />
        );
      })}
    </ul>
  );
}
