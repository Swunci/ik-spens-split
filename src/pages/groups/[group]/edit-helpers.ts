import type { Dispatch, FormEvent } from 'react';

import type { ActionType } from '@/components/hooks/snackbarReducer';
import { ACTION_TYPES } from '@/components/hooks/snackbarReducer';
import type { GroupUpdate } from '@/interfaces/request';
import NextApiClient from '@/utils/api/NextApiClient';
import { saveGroupToLocalStorage } from '@/utils/localStorageUtils';

export type GroupUpdateForm = {
  groupId: string;
  groupName: string;
  currency: string;
};

export async function handleGroupUpdate(
  e: FormEvent<HTMLFormElement>,
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
