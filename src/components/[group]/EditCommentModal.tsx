import { Dialog, Transition } from '@headlessui/react';
import TextareaAutosize from '@mui/base/TextareaAutosize';
import { Typography } from '@mui/material';
import type { Dispatch, SetStateAction } from 'react';
import { Fragment, useContext, useState } from 'react';

import type { Comment, Member } from '@/interfaces/response';

import { MemberIdNameContext } from '../hooks/MemberIdNameContext';
import type { ActionType } from '../hooks/snackbarReducer';
import MemberSelection from '../shared/MemberSelection';
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
      <Dialog as="div" className="absolute z-10" onClose={() => setOpen(false)}>
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
          <div className="flex min-h-full items-center justify-center p-2 text-center md:p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="flexbox-col m-2 min-h-96 w-full max-w-screen-md justify-start space-y-3 overflow-hidden rounded border-2 border-alice-accent bg-alice-main p-2 text-left align-middle shadow-xl transition-all">
                <div className="flexbox-row pt-2 md:p-2">
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
                <div className="w-full">
                  <Typography className="min-w-fit p-1">Commenter</Typography>
                  <MemberSelection
                    currentMemberId={commenterId}
                    members={members}
                    idNameMap={idNameMap}
                    setCurrentMemberId={setCommenterId}
                  />
                </div>
                <div className="w-full">
                  <Typography className="min-w-fit p-1">Comment</Typography>
                  <TextareaAutosize
                    className="my-2 inline-block w-full overflow-hidden rounded bg-alice-base p-2"
                    id="commentText"
                    onChange={(e) => setCommentText(e.target.value)}
                    defaultValue={commentRecord.comment}
                    onFocus={() => {
                      document.body.scrollTop = 0;
                    }}
                  />
                </div>
                <div className="flexbox-row w-full pb-2 md:p-2">
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
