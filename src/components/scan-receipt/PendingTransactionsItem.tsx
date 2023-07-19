import { Typography } from '@mui/material';
import { useContext, useEffect, useMemo, useState } from 'react';
import Balancer from 'react-wrap-balancer';

import type { TransactionMember } from '@/pages/groups/[group]/new-transaction-helpers';
import { currencyCodeSymbolMap } from '@/utils/currencyUtil';

import { PendingTransactionContext } from '../hooks/PendingTransactionContext';
import { ReceiptScanningContext } from '../hooks/ReceiptScanningContext';
import EditPendingTransactionModal from './EditPendingTransactionModal';
import {
  getInitialMemberList,
  getInvolvedMembers,
  getYourShare,
  isMemberInvolved,
} from './helpers';
import type { PendingTransaction } from './PendingTransactionsList';

export default function PendingTransactionsItem({
  transaction,
}: {
  transaction: PendingTransaction;
}) {
  const [open, setOpen] = useState(false);

  const receiptScanningContext = useContext(ReceiptScanningContext);

  const { group, currency, currentMemberId, transactions, setTransactions } =
    receiptScanningContext!;

  const [splitType, setSplitType] = useState('Equal');

  const [membersList, setMembersList] = useState(
    new Array<TransactionMember>()
  );

  const contextValue = useMemo(
    () => ({
      splitType,
      setSplitType,
      membersList,
      setMembersList,
      transaction,
    }),
    [splitType, membersList, transaction]
  );

  useEffect(() => {
    setMembersList(getInitialMemberList(group.members, transaction.amount));
  }, []);

  useEffect(() => {
    const newTransactions = transactions.map(
      (pendingTransaction: PendingTransaction) => {
        const newTransaction = pendingTransaction;
        if (newTransaction.id === transaction.id) {
          newTransaction.membersList = membersList;
        }
        return newTransaction;
      }
    );
    setTransactions(newTransactions);
  }, [membersList]);

  return (
    <li className="flexbox-col w-full rounded bg-alice-base shadow-md betterhover:hover:bg-alice-base/70">
      <button
        className="custom-focus rounded p-2 focus:outline-alice-accent"
        type="button"
        onClick={() => setOpen(true)}
      >
        <div className="flexbox-row">
          <div className="w-full">
            <div className="flexbox-row text-base">
              <div>{`${currencyCodeSymbolMap.get(currency)}${
                transaction.amount
              } for ${transaction.description}`}</div>
            </div>
            <div className="flexbox-row gap-2 pt-1">
              <div className="w-full text-left text-xs">
                <Balancer>{`People involved: ${getInvolvedMembers(
                  membersList
                )}.`}</Balancer>
              </div>
              <div className="text-xs">
                {isMemberInvolved(membersList, currentMemberId)
                  ? `Your share: ${currencyCodeSymbolMap.get(
                      currency
                    )}${getYourShare(membersList, currentMemberId).toFixed(2)}`
                  : null}
              </div>
            </div>
          </div>
          <div className="flexbox-col w-fit justify-center py-2 pl-2">
            <Typography>&gt;</Typography>
          </div>
        </div>
      </button>
      <PendingTransactionContext.Provider value={contextValue}>
        <EditPendingTransactionModal open={open} setOpen={setOpen} />
      </PendingTransactionContext.Provider>
    </li>
  );
}
