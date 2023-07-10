import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import type { Group } from '@prisma/client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/router';
import useSwr from 'swr';

import HistoryRecords from '@/components/history/HistoryRecords';
import type CustomError from '@/errors/customError';
import type { HistoryResponse } from '@/interfaces/response';
import { RootLayout } from '@/layouts/RootLayout';
import { displayBackdrop } from '@/utils/component/helpers';
import { fetcher } from '@/utils/fetcherWrapper';

export default function HistoryPage() {
  const router = useRouter();

  const currentPath = usePathname();

  const { error: groupError, isLoading: isLoadingGroup } = useSwr<
    Group,
    CustomError
  >(
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
      <Typography className="pb-2 text-3xl">History</Typography>
      <div className="w-full rounded bg-alice-main p-2">
        {isLoadingHistory ? (
          <HistoryRecords historyRecords={historyData!.history} />
        ) : (
          <CircularProgress />
        )}
      </div>
    </RootLayout>
  );
}
