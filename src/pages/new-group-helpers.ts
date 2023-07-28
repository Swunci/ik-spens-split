import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context';
import type { Dispatch, FormEvent, RefObject } from 'react';

import {
  ACTION_TYPES,
  type ActionType,
} from '@/components/hooks/snackbarReducer';
import type { GroupCreation } from '@/interfaces/request';
import type { Group } from '@/interfaces/response';
import NextApiClient from '@/utils/api/NextApiClient';
import { saveGroupToLocalStorage } from '@/utils/localStorageUtils';

export function onAddMember(
  e: FormEvent<HTMLFormElement>,
  currentMembers: Set<string>,
  memberInputRef: RefObject<HTMLInputElement>,
  setCurrentMembers: Function,
  dispatch: Dispatch<ActionType>
) {
  e.preventDefault();
  let invalidMembers = false;
  const inputRef = memberInputRef;
  const input: string =
    inputRef.current?.value !== undefined ? inputRef.current?.value : '';
  const newMembers = input
    .split(',')
    .reduce((result: Array<string>, value: string) => {
      const name = value.trim();
      if (name.length > 35) {
        invalidMembers = true;
        return result;
      }
      if (name !== '') {
        result.push(name);
      }
      return result;
    }, new Array<string>());
  setCurrentMembers(new Set([...currentMembers, ...newMembers]));
  if (inputRef.current) {
    inputRef.current.value = '';
  }
  if (invalidMembers) {
    dispatch({
      type: ACTION_TYPES.OPEN_WARNING,
      message: 'Maximum characters allowed for names is 35!',
    });
  }
}

export async function handleSubmit(
  e: React.MouseEvent,
  groupNameRef: RefObject<HTMLInputElement>,
  currency: string,
  currentMembers: Set<string>,
  router: AppRouterInstance,
  dispatch: Dispatch<ActionType>
) {
  e.preventDefault();
  const data: GroupCreation = <GroupCreation>{};
  data.groupName = groupNameRef.current!.value;
  data.currency = currency;
  data.members = [...currentMembers].sort((a, b) => a.localeCompare(b));

  const nextApiClient = new NextApiClient().jsonBody();
  const response = await nextApiClient.groups.create(data);

  if (!response.ok) {
    dispatch({
      type: ACTION_TYPES.OPEN_ERROR,
      message:
        response.status === 400
          ? 'Please add at least 2 members to group and valid currency'
          : 'Services currently unavailable',
    });
    return;
  }
  const group: Group = await response.json();

  saveGroupToLocalStorage(group.groupId);

  router.push(`/groups/${group.groupId}`);
}
