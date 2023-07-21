import { Alert, Snackbar } from '@mui/material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/router';
import React, { useEffect, useMemo, useReducer, useState } from 'react';
import Balancer from 'react-wrap-balancer';
import useSwr from 'swr';

import { MemberIdNameContext } from '@/components/hooks/MemberIdNameContext';
import {
  ACTION_TYPES,
  initialState,
  snackbarReducer,
} from '@/components/hooks/snackbarReducer';
import MemberSelection from '@/components/shared/MemberSelection';
import type CustomError from '@/errors/customError';
import type { Group, Member } from '@/interfaces/response';
import { RootLayout } from '@/layouts/RootLayout';
import { displayBackdrop } from '@/utils/component/helpers';
import { TwoWayReadonlyMap } from '@/utils/currencyUtil';
import { fetcher } from '@/utils/fetcherWrapper';
import { saveGroupToLocalStorage } from '@/utils/localStorageUtils';

import TabSelection from '../../../components/transactions/TabSelection';

export default function Transactions() {
  const router = useRouter();
  const currentPath = usePathname();

  const { group: groupId } = router.query;

  const [currentMemberId, setCurrentMemberId] = useState('');
  const [memberIdToNameMap, setMemberIdToNameMap] = useState(
    new TwoWayReadonlyMap(new Map<string, string>())
  );

  const contextValue = useMemo(
    () => ({
      memberIdToNameMap,
    }),
    [memberIdToNameMap]
  );

  const [snackbarState, dispatch] = useReducer(snackbarReducer, initialState);

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
      const idNameMap = groupData.members.reduce(
        (map: Map<string, string>, member: Member) => {
          map.set(member.memberId, member.memberName);
          return map;
        },
        new Map<string, string>()
      );
      const readOnlyMap = new TwoWayReadonlyMap(idNameMap);
      setMemberIdToNameMap(readOnlyMap);

      setCurrentMemberId(groupData.members.at(0)!.memberId);

      saveGroupToLocalStorage(groupData.groupId);
    }
  }, [groupData]);

  if (isLoadingGroup || !currentPath) {
    return displayBackdrop();
  }

  if (groupError) {
    if (groupError.status === 404) {
      return router.push('/404');
    }
    return router.push('/500');
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
      </div>
      <div className="w-full py-2 md:p-2">
        <div className="flex w-full flex-col rounded bg-alice-main p-2 shadow-md">
          <p className="px-2 py-1">View as</p>
          <MemberSelection
            currentMemberId={currentMemberId}
            members={groupData!.members}
            idNameMap={memberIdToNameMap}
            setCurrentMemberId={setCurrentMemberId}
          />
        </div>
      </div>

      <div className="w-full py-2 md:p-2">
        <MemberIdNameContext.Provider value={contextValue}>
          <TabSelection
            currentMemberId={currentMemberId}
            groupData={groupData!}
            dispatch={dispatch}
          />
        </MemberIdNameContext.Provider>
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
