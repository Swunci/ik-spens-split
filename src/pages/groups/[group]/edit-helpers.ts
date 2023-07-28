import type { Dispatch, FormEvent, RefObject } from 'react';
import { mutate } from 'swr';

import type { ActionType } from '@/components/hooks/snackbarReducer';
import { ACTION_TYPES } from '@/components/hooks/snackbarReducer';
import type { GroupUpdate, MemberCreation } from '@/interfaces/request';
import NextApiClient from '@/utils/api/NextApiClient';
import { saveGroupToLocalStorage } from '@/utils/localStorageUtils';

export type GroupUpdateForm = {
  groupId: string;
  groupName: string;
  currency: string;
};

export async function handleGroupUpdate(
  e: React.MouseEvent,
  formDetails: GroupUpdateForm,
  dispatch: Dispatch<ActionType>
) {
  e.preventDefault();
  const requestBody: GroupUpdate = {} as GroupUpdate;
  requestBody.groupId = formDetails.groupId;
  requestBody.groupName = formDetails.groupName;
  requestBody.currency = formDetails.currency;

  const nextApiClient = new NextApiClient().jsonBody();
  const response = await nextApiClient.groups.update(requestBody);

  if (!response.ok) {
    dispatch({
      type: ACTION_TYPES.OPEN_ERROR,
      message:
        response.status === 400
          ? 'Field validation failed'
          : 'Services currently unavailable',
    });
    return;
  }
  dispatch({
    type: ACTION_TYPES.OPEN_SUCCESS,
    message: 'Updated group',
  });
  const group = await response.json();
  saveGroupToLocalStorage(group.groupId);
}

export async function handleGroupDelete(
  e: React.MouseEvent,
  groupId: string,
  dispatch: Dispatch<ActionType>
) {
  e.preventDefault();

  const nextApiClient = new NextApiClient().jsonBody();
  const response = await nextApiClient.groups.delete(groupId);

  if (!response.ok) {
    dispatch({
      type: ACTION_TYPES.OPEN_ERROR,
      message:
        response.status === 400
          ? 'Field validation failed'
          : 'Services currently unavailable',
    });
    return false;
  }
  return true;
}

export async function handleMemberCreation(
  e: FormEvent<HTMLFormElement>,
  groupId: string,
  currentMembers: Set<string>,
  memberInputRef: RefObject<HTMLInputElement>,
  dispatch: Dispatch<ActionType>
) {
  e.preventDefault();
  const inputRef = memberInputRef;
  const input: string =
    inputRef.current?.value !== undefined ? inputRef.current?.value : '';
  const newMembers = input
    .split(',')
    .reduce((result: Array<string>, value: string) => {
      const name = value.trim();
      if (name.length > 35 || currentMembers.has(name)) {
        return result;
      }
      if (name !== '') {
        result.push(name);
      }
      return result;
    }, new Array<string>());
  const nextApiClient = new NextApiClient().jsonBody();

  const failedCreations = await Promise.all(
    newMembers.map(async (member: string) => {
      const requestBody = {} as MemberCreation;
      requestBody.groupId = groupId;
      requestBody.memberName = member;

      const response = await nextApiClient.members.create(requestBody);

      if (!response.ok) {
        return member;
      }
      return '';
    })
  );
  const names = failedCreations
    .filter((name: string) => {
      return name !== '';
    })
    .join(', ');
  if (names.length !== 0) {
    dispatch({
      type: ACTION_TYPES.OPEN_ERROR,
      message: `Failed to create some users: ${names}`,
    });
    return;
  }
  dispatch({
    type: ACTION_TYPES.OPEN_SUCCESS,
    message: 'Successfully added member(s) to group',
  });
  // eslint-disable-next-line no-param-reassign
  memberInputRef.current!.value = '';
  mutate(`/api/groups/${groupId}`);
}
