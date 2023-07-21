import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import { useRouter } from 'next/navigation';
import { useReducer, useRef, useState } from 'react';
import Balancer from 'react-wrap-balancer';

import {
  ACTION_TYPES,
  initialState,
  snackbarReducer,
} from '@/components/hooks/snackbarReducer';
import CurrencySelection from '@/components/new-group/CurrencySelection';
import MembersList from '@/components/new-group/MembersList';
import { RootLayout } from '@/layouts/RootLayout';

import { handleSubmit, onAddMember } from './new-group-helpers';

export default function NewGroupPage() {
  const router = useRouter();

  const [snackbarState, dispatch] = useReducer(snackbarReducer, initialState);
  const groupNameRef = useRef<HTMLInputElement>(null);
  const memberInputRef = useRef<HTMLInputElement>(null);
  const [currentMembers, setCurrentMembers] = useState(new Set<string>());
  const [currency, setCurrency] = useState('');

  const onDeleteMember = (member: string) => {
    currentMembers.delete(member);
    setCurrentMembers(new Set([...currentMembers]));
  };

  return (
    <RootLayout>
      <div className="w-full overscroll-none p-2 text-2xl md:px-4">
        Create a new group
      </div>
      <form
        className="flex w-full flex-col items-start space-y-4 md:p-2"
        onSubmit={(e) =>
          handleSubmit(
            e,
            groupNameRef,
            currency,
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
            className="custom-focus mt-2 rounded bg-alice-base p-2 focus:outline-alice-accent betterhover:hover:bg-alice-base/70"
            id="groupName"
            type="text"
            placeholder=""
            required
            ref={groupNameRef}
          />
        </label>
        <CurrencySelection
          selectedCurrency={currency}
          setSelectedCurrency={setCurrency}
          labelName="Main currency"
        />
        <label
          className="flex w-full flex-col rounded bg-alice-main p-2 shadow-md"
          htmlFor="addMembers"
        >
          Add member(s)
          <div className="flex flex-row place-content-between">
            <input
              className="custom-focus mt-2 w-full rounded bg-alice-base p-2 focus:outline-alice-accent betterhover:hover:bg-alice-base/70"
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
                  setCurrentMembers,
                  dispatch
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
          className="custom-focus rounded bg-alice-accent p-2 px-3 text-alice-base shadow-md focus:bg-alice-accent/50 focus:text-black
                   focus:outline-alice-accent betterhover:hover:bg-alice-accent/90"
          type="submit"
        >
          Create
        </button>
      </form>
      <Snackbar
        open={snackbarState.isOpen}
        autoHideDuration={5000}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        onClick={() => dispatch({ type: ACTION_TYPES.CLOSE })}
        onClose={() => dispatch({ type: ACTION_TYPES.CLOSE })}
      >
        {snackbarState.isOpen ? (
          <Alert severity={snackbarState.alertType}>
            <Balancer>{snackbarState.message}</Balancer>
          </Alert>
        ) : (
          <div />
        )}
      </Snackbar>
    </RootLayout>
  );
}
