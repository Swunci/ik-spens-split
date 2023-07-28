import type { Dispatch, RefObject } from 'react';
import { mutate } from 'swr';

import type { MemberUpdate } from '@/interfaces/request';
import NextApiClient from '@/utils/api/NextApiClient';

import type { ActionType } from '../hooks/snackbarReducer';
import { ACTION_TYPES } from '../hooks/snackbarReducer';

export async function handleMemberNameChange(
  e: React.MouseEvent,
  groupId: string,
  memberId: string,
  currentMembers: Set<string>,
  nameInputRef: RefObject<HTMLInputElement>,
  dispatch: Dispatch<ActionType>
) {
  e.preventDefault();
  const inputRef = nameInputRef;
  const name: string =
    inputRef.current?.value !== undefined ? inputRef.current?.value : '';

  if (currentMembers.has(name)) {
    dispatch({
      type: ACTION_TYPES.OPEN_WARNING,
      message: 'Name already exists in group',
    });
    return;
  }

  const nextApiClient = new NextApiClient().jsonBody();
  const requestBody = {} as MemberUpdate;
  requestBody.groupId = groupId;
  requestBody.memberName = name;
  requestBody.memberId = memberId;
  const response = await nextApiClient.members.update(requestBody);
  if (!response.ok) {
    dispatch({
      type: ACTION_TYPES.OPEN_ERROR,
      message: 'Failed to save name',
    });
    return;
  }
  dispatch({
    type: ACTION_TYPES.OPEN_SUCCESS,
    message: 'Name updated',
  });
  mutate(`/api/groups/${groupId}`);
}

export async function handleMemberDeletion(
  e: React.MouseEvent,
  groupId: string,
  memberId: string,
  dispatch: Dispatch<ActionType>
) {
  e.preventDefault();
  const nextApiClient = new NextApiClient().jsonBody();
  const response = await nextApiClient.members.delete(groupId, memberId);
  if (!response.ok) {
    dispatch({
      type: ACTION_TYPES.OPEN_ERROR,
      message:
        'Cannot delete member that is involved in transactions/debts or group cannot have less than 2',
    });
    return;
  }
  dispatch({
    type: ACTION_TYPES.OPEN_SUCCESS,
    message: 'Member deleted',
  });
  mutate(`/api/groups/${groupId}`);
}
