import { Dialog, Transition } from '@headlessui/react';
import TextareaAutosize from '@mui/base/TextareaAutosize';
import { FormControl, MenuItem, Select, Typography } from '@mui/material';
import type { Dispatch, SetStateAction } from 'react';
import { Fragment, useContext, useState } from 'react';

import type { Comment, Member } from '@/interfaces/response';

import { MemberIdNameContext } from '../hooks/MemberIdNameContext';
import type { ActionType } from '../hooks/snackbarReducer';
import type { UpdateCommentForm } from './helpers';
import { handleCommentDelete, handleCommentUpdate } from './helpers';

export default function EditCommentModal({
  open,
  setOpen,
  members,
  commentRecord,
  dispatch,
}: {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  members: Array<Member>;
  commentRecord: Comment;
  dispatch: Dispatch<ActionType>;
}) {
  const [commentText, setCommentText] = useState(commentRecord.comment);
  const [commenterId, setCommenterId] = useState(commentRecord.commenterId);

  const memberIdNameContext = useContext(MemberIdNameContext);

  const idNameMap = memberIdNameContext!.memberIdToNameMap;

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={() => setOpen(false)}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="flexbox-col m-2 w-full max-w-screen-md overflow-hidden rounded border-2 border-alice-accent bg-alice-main p-2 text-left align-middle shadow-xl transition-all">
                <div className="flexbox-row p-2">
                  <button
                    className="rounded bg-alice-accent p-2 px-3 text-alice-base shadow-md"
                    type="button"
                    onClick={() => setOpen(false)}
                  >
                    Close
                  </button>
                  <Typography className="flexbox-col justify-center text-center">
                    Edit
                  </Typography>
                  <button
                    className="rounded bg-alice-accent p-2 px-3 text-alice-base shadow-md"
                    type="button"
                    onClick={async (e) => {
                      const isDeleted = await handleCommentDelete(
                        e,
                        commentRecord.groupId,
                        commentRecord.commentId,
                        dispatch
                      );

                      if (isDeleted) {
                        setOpen(false);
                      }
                    }}
                  >
                    Delete
                  </button>
                </div>
                <Typography className="min-w-fit p-1">Commenter</Typography>
                <FormControl
                  size="small"
                  fullWidth={false}
                  className="border-alice-main"
                >
                  <Select
                    className="static bg-alice-base"
                    defaultValue={idNameMap.get(commentRecord.commenterId)}
                    onChange={(e) =>
                      setCommenterId(idNameMap.revGet(e.target.value)!)
                    }
                  >
                    {members.map((member: Member) => {
                      return (
                        <MenuItem
                          key={member.memberId}
                          value={member.memberName}
                        >
                          <Typography
                            className="whitespace-normal break-words"
                            noWrap
                          >
                            {member.memberName}
                          </Typography>
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
                <TextareaAutosize
                  className="my-2 inline-block w-full overflow-hidden rounded bg-alice-base p-1"
                  id="commentText"
                  onChange={(e) => setCommentText(e.target.value)}
                  defaultValue={commentRecord.comment}
                />
                <div className="flexbox-row w-full p-2">
                  <button
                    className="rounded bg-alice-accent p-2 px-3 text-alice-base shadow-md"
                    type="button"
                    onClick={async (e) => {
                      handleCommentUpdate(
                        e,
                        {
                          groupId: commentRecord.groupId,
                          commentId: commentRecord.commentId,
                          commenterId,
                          commentText,
                        } as UpdateCommentForm,
                        dispatch
                      );
                    }}
                  >
                    Update
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
