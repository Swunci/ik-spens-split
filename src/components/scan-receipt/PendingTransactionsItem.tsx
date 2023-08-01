import { useContext, useEffect, useMemo, useState } from 'react';
import { Draggable } from 'react-beautiful-dnd';
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
  index,
}: {
  transaction: PendingTransaction;
  index: number;
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
    <Draggable draggableId={transaction.id} index={index}>
      {(provided) => (
        <li
          className="flexbox-col mt-2 w-full rounded bg-alice-base shadow-md betterhover:hover:bg-alice-base/70"
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <div className="custom-focus rounded p-2 focus:outline-alice-accent">
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
                        )}${getYourShare(membersList, currentMemberId).toFixed(
                          2
                        )}`
                      : null}
                  </div>
                </div>
              </div>
              <button
                className="flexbox-col w-fit justify-center py-2 pl-2"
                type="button"
                onClick={() => setOpen(true)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-6 w-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                  />
                </svg>
              </button>
            </div>
          </div>
          <PendingTransactionContext.Provider value={contextValue}>
            <EditPendingTransactionModal open={open} setOpen={setOpen} />
          </PendingTransactionContext.Provider>
        </li>
      )}
    </Draggable>
  );
}
