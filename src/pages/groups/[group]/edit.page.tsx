import { Alert, Snackbar } from '@mui/material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import Balancer from 'react-wrap-balancer';
import useSwr from 'swr';

import MembersList from '@/components/edit/MembersList';
import { MemberIdNameContext } from '@/components/hooks/MemberIdNameContext';
import {
  ACTION_TYPES,
  initialState,
  snackbarReducer,
} from '@/components/hooks/snackbarReducer';
import CurrencySelection from '@/components/new-group/CurrencySelection';
import type CustomError from '@/errors/customError';
import type { GroupUpdate } from '@/interfaces/request';
import type { Group, Member } from '@/interfaces/response';
import { RootLayout } from '@/layouts/RootLayout';
import { displayBackdrop, displaySnackbar } from '@/utils/component/helpers';
import { TwoWayReadonlyMap } from '@/utils/currencyUtil';
import { fetcher } from '@/utils/fetcherWrapper';

import {
  handleGroupDelete,
  handleGroupUpdate,
  handleMemberCreation,
} from './edit-helpers';

export default function EditGroupPage() {
  const router = useRouter();
  const currentPath = usePathname();

  const { group: groupId } = router.query;

  const [snackbarState, dispatch] = useReducer(snackbarReducer, initialState);

  const groupNameRef = useRef<HTMLInputElement>(null);
  const [currency, setCurrency] = useState('');
  const memberInputRef = useRef<HTMLInputElement>(null);
  const [currentMembers, setCurrentMembers] = useState(new Set<string>());

  const [memberIdToNameMap, setMemberIdToNameMap] = useState(
    new TwoWayReadonlyMap(new Map<string, string>())
  );

  const contextValue = useMemo(
    () => ({
      memberIdToNameMap,
    }),
    [memberIdToNameMap]
  );

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
      setCurrency(groupData.currency);
      const members = new Set<string>();
      groupData.members.forEach((member: Member) => {
        members.add(member.memberName);
      });
      setCurrentMembers(members);

      const idNameMap = groupData.members.reduce(
        (map: Map<string, string>, member: Member) => {
          map.set(member.memberId, member.memberName);
          return map;
        },
        new Map<string, string>()
      );
      const readOnlyMap = new TwoWayReadonlyMap(idNameMap);
      setMemberIdToNameMap(readOnlyMap);
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
      <div className="flex w-full flex-col items-start space-y-4 py-2 md:p-2">
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
          labelName="Main currency"
        />
        <form
          className="w-full"
          onSubmit={(e) => {
            handleMemberCreation(
              e,
              groupId as string,
              currentMembers,
              memberInputRef,
              dispatch
            );
          }}
        >
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
                type="submit"
              >
                Add
              </button>
            </div>
          </label>
        </form>
        <div className="flex w-full max-w-full flex-col space-y-2 rounded bg-alice-main p-2 shadow-md">
          <div>Current members ({currentMembers.size})</div>
          <MemberIdNameContext.Provider value={contextValue}>
            <MembersList
              currentMembers={currentMembers}
              groupId={groupData!.groupId}
              dispatch={dispatch}
            />
          </MemberIdNameContext.Provider>
        </div>
        <div className="flexbox-row w-full">
          <button
            className="custom-focus rounded bg-alice-accent p-2 px-3 text-alice-base shadow-md focus:bg-alice-accent/50 focus:text-black
                     focus:outline-alice-accent betterhover:hover:bg-alice-accent/90"
            type="button"
            onClick={(e) =>
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
            Update
          </button>
        </div>
      </div>
      <Snackbar
        autoHideDuration={5000}
        open={snackbarState.isOpen}
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
