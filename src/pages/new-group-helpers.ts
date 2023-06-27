import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context';
import type { Dispatch, RefObject } from 'react';

import {
  ACTION_TYPES,
  type ActionType,
} from '@/components/hooks/snackbarReducer';
import type { GroupCreation } from '@/interfaces/request';
import type { Group } from '@/interfaces/response';
import NextApiClient from '@/utils/api/NextApiClient';

export function onAddMember(
  e: React.MouseEvent,
  currentMembers: Set<string>,
  memberInputRef: RefObject<HTMLInputElement>,
  setCurrentMembers: Function
) {
  e.preventDefault();
  const inputRef = memberInputRef;
  const input: string =
    inputRef.current?.value !== undefined ? inputRef.current?.value : '';
  const newMembers = input
    .split(',')
    .reduce((result: Array<string>, value: string) => {
      const name = value.trim();
      if (name !== '') {
        result.push(name);
      }
      return result;
    }, new Array<string>());
  setCurrentMembers(new Set([...currentMembers, ...newMembers]));
  if (inputRef.current) {
    inputRef.current.value = '';
  }
}

export async function handleSubmit(
  e: React.FormEvent<HTMLFormElement>,
  groupNameRef: RefObject<HTMLInputElement>,
  currencyRef: RefObject<HTMLSelectElement>,
  currentMembers: Set<string>,
  router: AppRouterInstance,
  dispatch: Dispatch<ActionType>
) {
  e.preventDefault();
  const data: GroupCreation = <GroupCreation>{};
  data.groupName = groupNameRef.current!.value;
  data.currency = currencyRef.current!.value;
  data.members = [...currentMembers];

  const nextApiClient = new NextApiClient().jsonBody();
  const response = await nextApiClient.groups.create(data);

  if (!response.ok) {
    dispatch({
      type: ACTION_TYPES.OPEN_ERROR,
      message:
        response.status === 400
          ? 'Please add at least 2 members to group'
          : 'Services currently unavailable',
    });
    return;
  }
  const body: Group = await response.json();
  router.push(`/groups/${body.groupId}`);
}
