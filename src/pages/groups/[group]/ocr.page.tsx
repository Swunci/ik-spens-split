import { Alert, CircularProgress, Snackbar } from '@mui/material';
import Decimal from 'decimal.js';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useReducer, useState } from 'react';
import useSwr from 'swr';
import Tesseract from 'tesseract.js';
import { v4 as uuid } from 'uuid';

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
import { displayBackdrop, displaySnackbar } from '@/utils/component/helpers';
import { TwoWayReadonlyMap } from '@/utils/currencyUtil';
import { fetcher } from '@/utils/fetcherWrapper';
import { getTodaysDate } from '@/utils/timeUtils';

export default function OcrTestPage() {
  const router = useRouter();

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [filePath, setFilePath] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [data, setData] = useState('');

  const [group, setGroup] = useState({} as Group);
  const [currency, setCurrency] = useState('');
  const [snackbarState, dispatch] = useReducer(snackbarReducer, initialState);
  const [payerId, setPayerId] = useState('');
  const [date, setDate] = useState(getTodaysDate());
  const [memberIdToNameMap, setMemberIdToNameMap] = useState(
    new TwoWayReadonlyMap(new Map<string, string>())
  );
  const [transactions, setTransactions] = useState(
    new Array<PendingTransaction>()
  );

  const groupId = router.query.group as string;

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
      date,
      currency,
      memberIdToNameMap,
      dispatch,
    }),
    [payerId, date, group, currency]
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
    }
  }, [groupData]);

  const scheduler = Tesseract.createScheduler();

  const workerGen = async () => {
    const worker = await Tesseract.createWorker();
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
    scheduler.addWorker(worker);
  };
  workerGen();

  function setPendingTransactions(text: string) {
    const lines = text.split(/\n/);

    const pendingTransactions = new Array<PendingTransaction>();

    lines.forEach((line: string) => {
      let amount = new Decimal(0);
      const description = line
        .split(' ')
        .map((word: string) => {
          if (word.includes('.')) {
            amount = new Decimal(word);
            return '';
          }
          return word.trim();
        })
        .join(' ');
      if (
        !amount.equals(0) &&
        description !== '' &&
        !description.toLowerCase().includes('total')
      ) {
        pendingTransactions.push({
          amount,
          description: description
            .replace(/[&/\\#,+()$~%.'":*?<>{}]/g, '')
            .trim(),
          id: uuid(),
        } as PendingTransaction);
      }
    });

    setTransactions(pendingTransactions);
  }

  async function handleImageProcessing(e: React.MouseEvent) {
    e.preventDefault();
    if (selectedImage && isSupported) {
      setIsProcessing(true);
      await scheduler.addJob('recognize', filePath).then((x) => {
        setIsProcessing(false);
        setData(x.data.text);
        setPendingTransactions(x.data.text);
      });
    } else {
      dispatch({
        type: ACTION_TYPES.OPEN_WARNING,
        message: 'Only bmp, jpg, png, pbm, webp images are supported',
      });
    }
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files ? e.target.files[0]! : null;
    if (file) {
      setSelectedImage(file);
    }
    if (file && file.name.toLowerCase().match(/\.(bmp|jpg|png|pbm|webp)$/)) {
      URL.revokeObjectURL(filePath);
      setFilePath(URL.createObjectURL(file));
      setIsSupported(true);
      return;
    }
    setIsSupported(false);
  }

  if (isLoadingGroup || !groupId) {
    return displayBackdrop();
  }
  if (groupError) {
    return displaySnackbar('error loading group');
  }

  return (
    <RootLayout>
      <div className="flexbox-col w-full gap-y-2">
        <div className="flexbox-row justify-start gap-x-2">
          <label
            className="custom-focus w-fit cursor-pointer rounded bg-alice-accent p-2 px-3 text-alice-base shadow-md focus:bg-alice-accent/50
                   focus:text-black focus:outline-alice-accent betterhover:hover:bg-alice-accent/90"
            htmlFor="file-input"
            // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
            tabIndex={0}
          >
            Choose file
            <input
              id="file-input"
              type="file"
              disabled={isProcessing}
              onChange={handleFileInput}
              hidden
            />
          </label>
          <div className="p-2">{selectedImage && selectedImage.name}</div>
        </div>

        {selectedImage && (
          <img src={`${URL.createObjectURL(selectedImage)}`} alt="" />
        )}
        <button
          type="button"
          disabled={isProcessing}
          onClick={(e) => handleImageProcessing(e)}
        >
          Process receipt
        </button>
        {isProcessing ? (
          <div className="flex w-full place-content-evenly">
            <CircularProgress className="text-alice-accent" />
          </div>
        ) : null}
        {data !== '' && !isProcessing ? (
          <>
            <MemberSelection
              members={groupData!.members}
              currentMemberId={payerId}
              setCurrentMemberId={setPayerId}
              idNameMap={memberIdToNameMap}
            />
            <div className="w-full rounded bg-alice-main p-2">
              <label className="flex w-full flex-col" htmlFor="when">
                When?
                <input
                  className="custom-focus mt-2 rounded bg-alice-base p-2 focus:outline-alice-accent betterhover:hover:bg-alice-base/70"
                  id="when"
                  type="date"
                  value={date}
                  required
                  onChange={(e) => setDate(e.currentTarget.value)}
                />
              </label>
            </div>
            <ReceiptScanningContext.Provider value={contextValue}>
              <PendingTransactionsList transactions={transactions} />
            </ReceiptScanningContext.Provider>
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
            {snackbarState.message}
          </Alert>
        ) : (
          <div />
        )}
      </Snackbar>
    </RootLayout>
  );
}
