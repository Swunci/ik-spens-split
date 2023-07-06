import { Alert, Snackbar } from '@mui/material';
import type { Group } from '@prisma/client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/router';
import { useReducer, useRef } from 'react';
import useSwr from 'swr';

import {
  ACTION_TYPES,
  initialState,
  snackbarReducer,
} from '@/components/hooks/snackbarReducer';
import type CustomError from '@/errors/customError';
import type { GroupUpdate } from '@/interfaces/request';
import { RootLayout } from '@/layouts/RootLayout';
import { displayBackdrop, displaySnackbar } from '@/utils/component/helpers';
import { currencyNameCodeMap } from '@/utils/currencyUtil';
import { fetcher } from '@/utils/fetcherWrapper';

import { handleGroupDelete, handleGroupUpdate } from './edit-helpers';

export default function EditGroupPage() {
  const router = useRouter();
  const currentPath = usePathname();

  const { group: groupId } = router.query;

  const [snackbarState, dispatch] = useReducer(snackbarReducer, initialState);

  const groupNameRef = useRef<HTMLInputElement>(null);
  const currencyRef = useRef<HTMLSelectElement>(null);

  const {
    data: groupData,
    error: groupError,
    isLoading: isLoadingGroup,
  } = useSwr<Group, CustomError>(
    () => (groupId ? `/api/groups/${groupId}` : null),
    fetcher
  );

  function populateCurrencies() {
    return [...currencyNameCodeMap.map.keys()].map((currencyName) => {
      return <option key={currencyName}>{currencyName}</option>;
    });
  }

  if (isLoadingGroup || !groupId) {
    return displayBackdrop();
  }

  if (groupError) {
    return displaySnackbar('Error retreiving group');
  }

  return (
    <RootLayout>
      <div className="w-full p-2">
        <Link
          href={
            currentPath
              ? currentPath.substring(0, currentPath.lastIndexOf('/'))
              : ''
          }
          passHref
        >
          <button
            className="rounded bg-alice-accent p-2 px-3 text-alice-base shadow-md"
            type="button"
          >
            Back
          </button>
        </Link>
      </div>
      <form
        className="flex w-full flex-col items-start space-y-4"
        onSubmit={(e) =>
          handleGroupUpdate(
            e,
            {
              groupId,
              groupName: groupNameRef.current!.value,
              currency: currencyRef.current!.value,
            } as GroupUpdate,
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
            defaultValue={groupData!.groupName}
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
            defaultValue={currencyNameCodeMap.revGet(groupData!.currency)}
          >
            {populateCurrencies()}
          </select>
        </label>
        <div className="flexbox-row w-full p-2">
          <button
            className="rounded bg-alice-accent p-2 px-3 text-alice-base shadow-md"
            type="submit"
          >
            Update
          </button>
          <button
            className="rounded bg-alice-accent p-2 px-3 text-alice-base shadow-md"
            type="button"
            onClick={async (e) => {
              const isDeleted = await handleGroupDelete(
                e,
                groupData!.groupId,
                dispatch
              );
              if (isDeleted) {
                router.push('/');
              }
            }}
          >
            Delete
          </button>
        </div>
      </form>
      <Snackbar
        autoHideDuration={5000}
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
