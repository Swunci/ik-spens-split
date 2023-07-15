import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import useSwr from 'swr';

import HistoryRecords from '@/components/history/HistoryRecords';
import type CustomError from '@/errors/customError';
import type { Group, HistoryResponse, Member } from '@/interfaces/response';
import { RootLayout } from '@/layouts/RootLayout';
import { displayBackdrop } from '@/utils/component/helpers';
import { TwoWayReadonlyMap } from '@/utils/currencyUtil';
import { fetcher } from '@/utils/fetcherWrapper';
import { saveGroupToLocalStorage } from '@/utils/localStorageUtils';

export default function HistoryPage() {
  const router = useRouter();

  const currentPath = usePathname();

  const [memberIdToNameMap, setMemberIdToNameMap] = useState(
    new TwoWayReadonlyMap(new Map<string, string>())
  );

  const {
    data: groupData,
    error: groupError,
    isLoading: isLoadingGroup,
  } = useSwr<Group, CustomError>(
    () =>
      currentPath
        ? `/api${currentPath.slice(0, currentPath.lastIndexOf('/'))}`
        : null,
    fetcher
  );

  const {
    data: historyData,
    error: historyError,
    isLoading: isLoadingHistory,
  } = useSwr<HistoryResponse, CustomError>(
    () => (currentPath ? `/api${currentPath}` : null),
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

      saveGroupToLocalStorage(groupData.groupId);
    }
  }, [groupData]);

  if (isLoadingGroup || !currentPath) {
    return displayBackdrop();
  }

  if (groupError || historyError) {
    if (groupError?.status === 404) {
      return router.push('/404');
    }
    return router.push('/500');
  }

  return (
    <RootLayout>
      <div className="w-full py-2 md:p-2">
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
      <Typography className="pb-2 text-3xl">History</Typography>
      <div className="w-full md:p-2">
        <div className="w-full rounded bg-alice-main p-2">
          {isLoadingHistory ? (
            <CircularProgress />
          ) : (
            <HistoryRecords
              historyRecords={historyData!.history}
              memberIdToNameMap={memberIdToNameMap}
            />
          )}
        </div>
      </div>
    </RootLayout>
  );
}
