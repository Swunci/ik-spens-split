import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import { useRouter } from 'next/navigation';
import { useReducer, useRef, useState } from 'react';

import {
  ACTION_TYPES,
  initialState,
  snackbarReducer,
} from '@/components/hooks/snackbarReducer';
import MembersList from '@/components/new-group/MembersList';
import { RootLayout } from '@/layouts/RootLayout';
import { currencyNameCodeMap } from '@/utils/currencyUtil';

import { handleSubmit, onAddMember } from './new-group-helpers';

export default function NewGroupPage() {
  const router = useRouter();

  const [snackbarState, dispatch] = useReducer(snackbarReducer, initialState);

  const groupNameRef = useRef<HTMLInputElement>(null);
  const currencyRef = useRef<HTMLSelectElement>(null);
  const memberInputRef = useRef<HTMLInputElement>(null);
  const [currentMembers, setCurrentMembers] = useState(new Set<string>());

  const onDeleteMember = (member: string) => {
    currentMembers.delete(member);
    setCurrentMembers(new Set([...currentMembers]));
  };

  function populateCurrencies() {
    return [...currencyNameCodeMap.map.keys()].map((currencyName) => {
      return <option key={currencyName}>{currencyName}</option>;
    });
  }

  return (
    <RootLayout>
      <div className="w-full overscroll-none p-2 text-2xl">
        Create a new group
      </div>
      <form
        className="flex w-full flex-col items-start space-y-4"
        onSubmit={(e) =>
          handleSubmit(
            e,
            groupNameRef,
            currencyRef,
            currentMembers,
            router,
            dispatch
          )
        }
      >
        <label
          className="flex w-full flex-col rounded bg-alice-main p-2 shadow-md"
          htmlFor="groupName"
        >
          Group name
          <input
            className="mt-2 rounded p-1"
            id="groupName"
            type="text"
            placeholder="Trip to ?"
            required
            ref={groupNameRef}
          />
        </label>
        <label
          className="flex w-full flex-col rounded bg-alice-main p-2 shadow-md"
          htmlFor="mainCurrency"
        >
          Main currency
          <select
            className="mt-2 rounded bg-white p-1"
            id="mainCurrency"
            required
            ref={currencyRef}
          >
            {populateCurrencies()}
          </select>
        </label>
        <label
          className="flex w-full flex-col rounded bg-alice-main p-2 shadow-md"
          htmlFor="addMembers"
        >
          Add member(s)
          <div className="flex flex-row place-content-between">
            <input
              className="mt-2 w-full rounded p-1"
              id="addMembers"
              type="text"
              placeholder="Alice, Bob, Charlie"
              ref={memberInputRef}
            />
            <button
              className="mt-2 rounded bg-alice-accent p-2 px-4 text-alice-base shadow-md"
              type="button"
              onClick={(e) =>
                onAddMember(
                  e,
                  currentMembers,
                  memberInputRef,
                  setCurrentMembers
                )
              }
            >
              Add
            </button>
          </div>
        </label>
        <div className="flex w-full max-w-full flex-col space-y-2 rounded bg-alice-main p-2 shadow-md">
          <div>Current members ({currentMembers.size})</div>
          <MembersList
            currentMembers={currentMembers}
            onDelete={onDeleteMember}
          />
        </div>
        <button
          className="m-1 rounded bg-alice-accent p-2 px-3 text-alice-base shadow-md"
          type="submit"
        >
          Create
        </button>
      </form>
      <Snackbar
        open={snackbarState.isOpen}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        onClick={() =>
          dispatch({
            type: ACTION_TYPES.CLOSE,
            message: '',
          })
        }
      >
        {snackbarState.isOpen ? (
          <Alert severity={snackbarState.alertType}>
            {snackbarState.message}
          </Alert>
        ) : (
          <div />
        )}
      </Snackbar>
    </RootLayout>
  );
}
