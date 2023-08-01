import { Alert, CircularProgress, Snackbar } from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import Balancer from 'react-wrap-balancer';
import useSwr from 'swr';
import Tesseract from 'tesseract.js';

import { ReceiptScanningContext } from '@/components/hooks/ReceiptScanningContext';
import {
  ACTION_TYPES,
  initialState,
  snackbarReducer,
} from '@/components/hooks/snackbarReducer';
import type { PendingTransaction } from '@/components/scan-receipt/PendingTransactionsList';
import PendingTransactionsList from '@/components/scan-receipt/PendingTransactionsList';
import MemberSelection from '@/components/shared/MemberSelection';
import type CustomError from '@/errors/customError';
import type { Group, Member } from '@/interfaces/response';
import { RootLayout } from '@/layouts/RootLayout';
import { displayBackdrop } from '@/utils/component/helpers';
import { TwoWayReadonlyMap } from '@/utils/currencyUtil';
import { fetcher } from '@/utils/fetcherWrapper';
import { getTodaysDate } from '@/utils/timeUtils';

import type { MultiTransactionCreationForm } from './scan-receipt-helpers';
import {
  handleCreateTransactions,
  handleFileInput,
  handleImageProcessing,
} from './scan-receipt-helpers';

export default function ScanReceiptPage() {
  const router = useRouter();
  const groupId = router.query.group as string;

  const [scheduler] = useState(Tesseract.createScheduler());

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [filePath, setFilePath] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [data, setData] = useState('');

  const [group, setGroup] = useState({} as Group);
  const [currency, setCurrency] = useState('');
  const [snackbarState, dispatch] = useReducer(snackbarReducer, initialState);
  const [payerId, setPayerId] = useState('');
  const dateRef = useRef<HTMLInputElement>(null);
  const [memberIdToNameMap, setMemberIdToNameMap] = useState(
    new TwoWayReadonlyMap(new Map<string, string>())
  );
  const [transactions, setTransactions] = useState(
    new Array<PendingTransaction>()
  );

  const [currentMemberId, setCurrentMemberId] = useState('');

  const {
    data: groupData,
    error: groupError,
    isLoading: isLoadingGroup,
  } = useSwr<Group, CustomError>(
    () => (groupId ? `/api/groups/${groupId}` : null),
    fetcher
  );

  const contextValue = useMemo(
    () => ({
      payerId,
      group,
      currency,
      memberIdToNameMap,
      currentMemberId,
      transactions,
      setTransactions,
      dispatch,
    }),
    [payerId, group, currency, currentMemberId, transactions]
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
      setPayerId(groupData.members.at(0)!.memberId);
      setCurrency(groupData.currency);
      setGroup(groupData);
      setCurrentMemberId(groupData.members.at(0)!.memberId);
    }
  }, [groupData]);

  useEffect(() => {
    const workerGen = async () => {
      const worker = await Tesseract.createWorker();
      await worker.loadLanguage('eng');
      await worker.initialize('eng');
      scheduler.addWorker(worker);
    };
    workerGen();
  }, []);

  if (isLoadingGroup || !groupId) {
    return displayBackdrop();
  }
  if (groupError) {
    return router.push('/404');
  }

  return (
    <RootLayout>
      <div className="w-full py-2 md:px-2">
        <Link
          className="custom-focus rounded bg-alice-accent p-2 px-3 text-alice-base shadow-md focus:bg-alice-accent/50 focus:text-black
                   focus:outline-alice-accent betterhover:hover:bg-alice-accent/90"
          type="button"
          href={`/groups/${group.groupId}`}
        >
          Back
        </Link>
      </div>
      <div className="flexbox-col w-full gap-y-2 py-2 md:px-2">
        <div className="flexbox-row justify-start gap-x-2">
          <label
            className="w-fit cursor-pointer rounded bg-alice-accent p-2 px-3 text-alice-base shadow-md betterhover:hover:bg-alice-accent/90"
            htmlFor="file-input"
            // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
            tabIndex={0}
          >
            Choose file
            <input
              id="file-input"
              type="file"
              disabled={isProcessing}
              onChange={(e) =>
                handleFileInput(
                  e,
                  filePath,
                  setFilePath,
                  setIsSupported,
                  setSelectedImage
                )
              }
              hidden
            />
          </label>
          <div className="p-2">{selectedImage && selectedImage.name}</div>
        </div>

        {selectedImage && (
          <>
            <img src={filePath} alt="" />
            <button
              className="rounded bg-alice-accent p-2 px-3 text-alice-base shadow-md betterhover:hover:bg-alice-accent/90"
              type="button"
              disabled={isProcessing}
              onClick={(e) =>
                handleImageProcessing(
                  e,
                  selectedImage,
                  filePath,
                  isSupported,
                  scheduler,
                  setIsProcessing,
                  setData,
                  setTransactions,
                  dispatch
                )
              }
            >
              Process receipt
            </button>
          </>
        )}
        {isProcessing ? (
          <div className="flex w-full place-content-evenly">
            <CircularProgress className="text-alice-accent" />
          </div>
        ) : null}
        {data !== '' && !isProcessing ? (
          <>
            <div className="w-full py-2">
              <MemberSelection
                members={groupData!.members}
                currentMemberId={payerId}
                setCurrentMemberId={setPayerId}
                idNameMap={memberIdToNameMap}
                labelName="Who paid?"
              />
            </div>
            <div className="w-full py-2">
              <div className="w-full rounded bg-alice-main p-2">
                <label className="flex w-full flex-col" htmlFor="when">
                  When?
                  <input
                    className="custom-focus mt-2 rounded bg-alice-base p-2 focus:outline-alice-accent betterhover:hover:bg-alice-base/70"
                    id="when"
                    type="date"
                    defaultValue={getTodaysDate()}
                    required
                    ref={dateRef}
                  />
                </label>
              </div>
            </div>
            <div className="w-full py-2">
              <MemberSelection
                currentMemberId={currentMemberId}
                members={groupData!.members}
                idNameMap={memberIdToNameMap}
                setCurrentMemberId={setCurrentMemberId}
                labelName="View as"
              />
            </div>
            <div className="w-full py-2">
              <ReceiptScanningContext.Provider value={contextValue}>
                <PendingTransactionsList
                  transactions={transactions}
                  setTransactions={setTransactions}
                />
              </ReceiptScanningContext.Provider>
            </div>
            <button
              className="rounded bg-alice-accent p-2 px-3 text-alice-base shadow-md betterhover:hover:bg-alice-accent/90"
              type="button"
              disabled={isProcessing}
              onClick={(e) =>
                handleCreateTransactions(
                  e,
                  {
                    groupId: group.groupId,
                    payerId,
                    transactions,
                    type: 'expense',
                    date: dateRef.current!.value,
                    currency,
                  } as MultiTransactionCreationForm,
                  setTransactions,
                  dispatch
                )
              }
            >
              Create Transactions
            </button>
          </>
        ) : null}
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
