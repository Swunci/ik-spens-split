import type Decimal from 'decimal.js';
import type { Dispatch, SetStateAction } from 'react';
import type { DropResult } from 'react-beautiful-dnd';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';

import type { TransactionMember } from '@/pages/groups/[group]/new-transaction-helpers';

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
          </ul>
        )}
      </Droppable>
    </DragDropContext>
  );
}
