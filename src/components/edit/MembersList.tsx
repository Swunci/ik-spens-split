import type { Dispatch } from 'react';

import type { ActionType } from '../hooks/snackbarReducer';
import MembersItem from './MembersItem';

export default function MembersList({
  currentMembers,
  groupId,
  dispatch,
}: {
  currentMembers: Set<string>;
  groupId: string;
  dispatch: Dispatch<ActionType>;
}) {
  return (
    <ul className="max-w-screen-md space-y-2">
      {[...currentMembers]
        .sort((a, b) => a.localeCompare(b))
        .map((memberName: string) => {
          return (
            <div key={memberName}>
              <MembersItem
                currentMembers={currentMembers}
                memberName={memberName}
                groupId={groupId}
                dispatch={dispatch}
              />
            </div>
          );
        })}
    </ul>
  );
}
