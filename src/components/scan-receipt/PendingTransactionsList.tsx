import type Decimal from 'decimal.js';
import { type Dispatch, type SetStateAction, useState } from 'react';
import type { DropResult } from 'react-beautiful-dnd';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';

import type { TransactionMember } from '@/pages/groups/[group]/new-transaction-helpers';

import AddPendingTransactionModal from './AddPendingTransactionModal';
import PendingTransactionsItem from './PendingTransactionsItem';

export interface PendingTransaction {
  description: string;
  amount: Decimal;
  id: string;
  splitType: string;
  membersList: Array<TransactionMember>;
}

export default function PendingTransactionsList({
  transactions,
  setTransactions,
}: {
  transactions: Array<PendingTransaction>;
  setTransactions: Dispatch<SetStateAction<Array<PendingTransaction>>>;
}) {
  const [open, setOpen] = useState(false);

  if (transactions.length === 0) {
    return (
      <div className="rounded-md bg-alice-main p-2">
        <div className="flexbox-col w-full rounded bg-alice-base p-2 shadow-md">
          No pending transactions left
        </div>
      </div>
    );
  }
  const onDragEnd = (result: DropResult) => {
    const { destination, source } = result;
    if (!destination) {
      return;
    }
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }
    const newTransactionsOrder = Array.from(transactions);
    const movedTransaction: PendingTransaction = transactions.at(source.index)!;
    newTransactionsOrder.splice(source.index, 1);
    newTransactionsOrder.splice(destination.index, 0, movedTransaction);
    setTransactions(newTransactionsOrder);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="pendingTransactions">
        {(provided) => (
          <ul
            className="custom-focus rounded-md bg-alice-main p-2 focus:outline-alice-accent"
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {transactions.map(
              (transaction: PendingTransaction, index: number) => {
                return (
                  <PendingTransactionsItem
                    key={transaction.id}
                    transaction={transaction}
                    index={index}
                  />
                );
              }
            )}
            {provided.placeholder}
            <div className="mt-2 flex w-full justify-center rounded bg-alice-base p-2 shadow-md betterhover:hover:bg-alice-base/70">
              <button
                type="button"
                className="flex w-full justify-center"
                onClick={() => setOpen(true)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="h-8 w-8 rounded"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4.5v15m7.5-7.5h-15"
                  />
                </svg>
              </button>
            </div>
            <AddPendingTransactionModal open={open} setOpen={setOpen} />
          </ul>
        )}
      </Droppable>
    </DragDropContext>
  );
}
