import { Alert, Snackbar } from '@mui/material';
import type { Group } from '@prisma/client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/router';
import { useEffect, useReducer, useRef, useState } from 'react';
import useSwr from 'swr';

import {
  ACTION_TYPES,
  initialState,
  snackbarReducer,
} from '@/components/hooks/snackbarReducer';
import CurrencySelection from '@/components/new-group/CurrencySelection';
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
  const [currency, setCurrency] = useState('');

  const {
    data: groupData,
    error: groupError,
    isLoading: isLoadingGroup,
  } = useSwr<Group, CustomError>(
    () => (groupId ? `/api/groups/${groupId}` : null),
    fetcher
  );

  useEffect(() => {
    if (groupData) {
      setCurrency(currencyNameCodeMap.revGet(groupData.currency)!);
    }
  }, [groupData]);

  if (isLoadingGroup || !groupId) {
    return displayBackdrop();
  }

  if (groupError) {
    return displaySnackbar('Error retreiving group');
  }

  return (
    <RootLayout>
      <div className="flexbox-row w-full py-2 md:p-2">
        <Link
          className="custom-focus rounded bg-alice-accent p-2 px-3 text-alice-base shadow-md focus:bg-alice-accent/50 focus:text-black
                   focus:outline-alice-accent betterhover:hover:bg-alice-accent/90"
          href={
            currentPath
              ? currentPath.substring(0, currentPath.lastIndexOf('/'))
              : ''
          }
        >
          Back
        </Link>
        <button
          className="custom-focus rounded bg-alice-accent p-2 px-3 text-alice-base shadow-md focus:bg-alice-accent/50 focus:text-black
                   focus:outline-alice-accent betterhover:hover:bg-alice-accent/90"
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
      <form
        className="flex w-full flex-col items-start space-y-4 py-2 md:p-2"
        onSubmit={(e) =>
          handleGroupUpdate(
            e,
            {
              groupId,
              groupName: groupNameRef.current!.value,
              currency,
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
            className="custom-focus mt-2 rounded bg-alice-base p-2 focus:outline-alice-accent betterhover:hover:bg-alice-base/70"
            id="groupName"
            type="text"
            placeholder="Trip to ?"
            required
            ref={groupNameRef}
            defaultValue={groupData!.groupName}
          />
        </label>
        <CurrencySelection
          selectedCurrency={currency}
          setSelectedCurrency={setCurrency}
        />
        <div className="flexbox-row w-full">
          <button
            className="custom-focus rounded bg-alice-accent p-2 px-3 text-alice-base shadow-md focus:bg-alice-accent/50 focus:text-black
                     focus:outline-alice-accent betterhover:hover:bg-alice-accent/90"
            type="submit"
          >
            Update
          </button>
        </div>
      </form>
      <Snackbar
        autoHideDuration={5000}
        open={snackbarState.isOpen}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        onClick={() => dispatch({ type: ACTION_TYPES.CLOSE })}
        onClose={() => dispatch({ type: ACTION_TYPES.CLOSE })}
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
