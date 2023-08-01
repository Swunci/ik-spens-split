import { Dialog, Transition } from '@headlessui/react';
import type { Dispatch, SetStateAction } from 'react';
import { Fragment, useContext, useRef } from 'react';

import { MemberIdNameContext } from '../hooks/MemberIdNameContext';
import type { ActionType } from '../hooks/snackbarReducer';
import { handleMemberDeletion, handleMemberNameChange } from './helpers';

export default function EditMemberModal({
  open,
  setOpen,
  groupId,
  memberName,
  currentMembers,
  dispatch,
}: {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  groupId: string;
  memberName: string;
  currentMembers: Set<string>;
  dispatch: Dispatch<ActionType>;
}) {
  const memberNameRef = useRef<HTMLInputElement>(null);

  const memberIdNameContext = useContext(MemberIdNameContext);

  const idNameMap = memberIdNameContext!.memberIdToNameMap;

  const memberId = idNameMap.revGet(memberName)!;

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={() => setOpen(false)}>
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
              <Dialog.Panel className="flexbox-col m-2 w-full max-w-screen-md overflow-hidden rounded border-2 border-alice-accent bg-alice-secondary p-2 text-left align-middle shadow-xl transition-all">
                <label
                  className="flex w-full flex-col rounded bg-alice-main p-2 shadow-md"
                  htmlFor="memberName"
                >
                  Member name
                  <input
                    className="custom-focus mt-2 rounded bg-alice-base p-2 focus:outline-alice-accent betterhover:hover:bg-alice-base/70"
                    id="memberName"
                    type="text"
                    placeholder="Trip to ?"
                    required
                    ref={memberNameRef}
                    defaultValue={memberName}
                  />
                </label>
                <div className="flexbox-row p-2 pt-4">
                  <button
                    className="custom-focus rounded bg-alice-accent p-2 px-3 text-alice-base shadow-md focus:bg-alice-accent/50 focus:text-black
                     focus:outline-alice-accent betterhover:hover:bg-alice-accent/90"
                    type="button"
                    onClick={(e) => {
                      handleMemberNameChange(
                        e,
                        groupId,
                        memberId,
                        currentMembers,
                        memberNameRef,
                        dispatch
                      );
                    }}
                  >
                    Save
                  </button>
                  <button
                    className="custom-focus rounded bg-alice-accent p-2 px-3 text-alice-base shadow-md focus:bg-alice-accent/50 focus:text-black
                     focus:outline-alice-accent betterhover:hover:bg-alice-accent/90"
                    type="button"
                    onClick={(e) => {
                      handleMemberDeletion(e, groupId, memberId, dispatch);
                    }}
                  >
                    Delete
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
