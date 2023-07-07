import type { Dispatch } from 'react';
import { useState } from 'react';

import type { Comment } from '@/interfaces/response';
import { getHowLongAgo } from '@/utils/timeUtils';

import type { ActionType } from '../hooks/snackbarReducer';
import EditCommentModal from './EditCommentModal';

export default function CommmentItem({
  commentRecord,
  memberNames,
  dispatch,
}: {
  commentRecord: Comment;
  memberNames: Array<string>;
  dispatch: Dispatch<ActionType>;
}) {
  const [open, setOpen] = useState(false);

  return (
    <li
      className="flexbox-col w-full rounded bg-alice-base p-2 shadow-md"
      key={commentRecord.commentId}
    >
      <button type="button" onClick={() => setOpen(true)}>
        <div className="flexbox-row">
          <div>{commentRecord.commenter}</div>
          <div>{getHowLongAgo(commentRecord.createdDate)}</div>
        </div>
        <div className="text-left">{commentRecord.comment}</div>
      </button>
      <EditCommentModal
        open={open}
        setOpen={setOpen}
        memberNames={memberNames}
        commentRecord={commentRecord}
        dispatch={dispatch}
      />
    </li>
  );
}
