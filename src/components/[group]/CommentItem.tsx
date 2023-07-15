import { Typography } from '@mui/material';
import type { Dispatch } from 'react';
import { useContext, useState } from 'react';
import { Balancer } from 'react-wrap-balancer';

import type { Comment, Member } from '@/interfaces/response';
import { getHowLongAgo } from '@/utils/timeUtils';

import { MemberIdNameContext } from '../hooks/MemberIdNameContext';
import type { ActionType } from '../hooks/snackbarReducer';
import EditCommentModal from './EditCommentModal';

export default function CommmentItem({
  commentRecord,
  members,
  dispatch,
}: {
  commentRecord: Comment;
  members: Array<Member>;
  dispatch: Dispatch<ActionType>;
}) {
  const [open, setOpen] = useState(false);

  const memberIdNameContext = useContext(MemberIdNameContext);

  const idNameMap = memberIdNameContext!.memberIdToNameMap;

  return (
    <li
      className="flexbox-col w-full rounded bg-alice-base shadow-md betterhover:hover:bg-alice-base/70"
      key={commentRecord.commentId}
    >
      <button
        className="custom-focus rounded p-2  focus:outline-alice-accent"
        type="button"
        onClick={() => setOpen(true)}
      >
        <div className="flex">
          <div className="w-full">
            <div className="flexbox-row">
              <div>{idNameMap.get(commentRecord.commenterId)}</div>
              <div>{getHowLongAgo(commentRecord.createdDate)}</div>
            </div>
            <div className="text-left">
              <Balancer>{commentRecord.comment}</Balancer>
            </div>
          </div>
          <div className="flexbox-col w-fit justify-center py-2 pl-2">
            <Typography>&gt;</Typography>
          </div>
        </div>
      </button>
      <EditCommentModal
        open={open}
        setOpen={setOpen}
        members={members}
        commentRecord={commentRecord}
        dispatch={dispatch}
      />
    </li>
  );
}
