import type { Dispatch } from 'react';
import { useState } from 'react';

import type { ActionType } from '../hooks/snackbarReducer';
import EditMemberModal from './EditMemberModal';

export default function MembersItem({
  currentMembers,
  memberName,
  groupId,
  dispatch,
}: {
  currentMembers: Set<string>;
  memberName: string;
  groupId: string;
  dispatch: Dispatch<ActionType>;
}) {
  const [open, setOpen] = useState(false);
  return (
    <li
      key={memberName}
      className="flex w-full flex-row place-content-between items-center rounded border
              bg-alice-base p-2 px-3 align-middle text-sm shadow-md betterhover:hover:bg-alice-base/70"
    >
      <button
        className="flexbox-row"
        type="button"
        onClick={() => setOpen(true)}
      >
        <span className="w-11/12 break-words pr-2 text-start">
          {memberName}
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="h-6 w-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
          />
        </svg>
      </button>

      <EditMemberModal
        open={open}
        setOpen={setOpen}
        memberName={memberName}
        currentMembers={currentMembers}
        groupId={groupId}
        dispatch={dispatch}
      />
    </li>
  );
}
