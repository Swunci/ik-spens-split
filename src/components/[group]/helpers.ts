import type { Dispatch } from 'react';
import { mutate } from 'swr';

import type { CommentUpdate } from '@/interfaces/request';
import NextApiClient from '@/utils/api/NextApiClient';

import type { ActionType } from '../hooks/snackbarReducer';
import { ACTION_TYPES } from '../hooks/snackbarReducer';

export type UpdateCommentForm = {
  groupId: string;
  commentId: string;
  commenter: string;
  commentText: string;
};

export async function handleCommentDelete(
  e: React.MouseEvent,
  groupId: string,
  commentId: string,
  dispatch: Dispatch<ActionType>
) {
  e.preventDefault();

  const nextApiClient = new NextApiClient().jsonBody();
  const response = await nextApiClient.comments.delete(groupId, commentId);

  if (!response.ok) {
    dispatch({
      type: ACTION_TYPES.OPEN_ERROR,
      message: 'Services currently unavailable',
    });
    return false;
  }
  mutate(`/api/groups/${groupId}/comments`);
  return true;
}

export async function handleCommentUpdate(
  e: React.MouseEvent,
  formDetails: UpdateCommentForm,
  dispatch: Dispatch<ActionType>
) {
  e.preventDefault();
  const requestBody: CommentUpdate = {} as CommentUpdate;
  requestBody.groupId = formDetails.groupId;
  requestBody.commentId = formDetails.commentId;
  requestBody.commenter = formDetails.commenter;
  requestBody.comment = formDetails.commentText;

  const nextApiClient = new NextApiClient().jsonBody();
  const response = await nextApiClient.comments.update(requestBody);

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
    message: 'Updated comment',
  });
  mutate(`/api/groups/${formDetails.groupId}/comments`);
}
