import { Typography } from '@mui/material';
import { useContext, useEffect, useState } from 'react';

import { currencyCodeSymbolMap } from '@/utils/currencyUtil';

import { PendingTransactionContext } from '../hooks/PendingTransactionContext';
import type { TransactionMember } from '../new-transaction/helpers';
import { getInitialMemberList } from '../new-transaction/helpers';
import EditPendingTransactionModal from './EditPendingTransactionModal';
import type { PendingTransaction } from './PendingTransactionsList';

export default function PendingTransactionsItem({
  transaction,
}: {
  transaction: PendingTransaction;
}) {
  const [open, setOpen] = useState(false);

  const pendingTransactionContext = useContext(PendingTransactionContext);

  const { group, currency, payerId } = pendingTransactionContext!;

  const [membersList, setMembersList] = useState(
    new Array<TransactionMember>()
  );

  useEffect(() => {
    setMembersList(getInitialMemberList(group.members, 'expense', payerId));
  }, []);

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
            <div className="flexbox-row gap-2 pt-1" />
          </div>
          <div className="flexbox-col w-fit justify-center py-2 pl-2">
            <Typography>&gt;</Typography>
          </div>
        </div>
      </button>
      <EditPendingTransactionModal
        open={open}
        setOpen={setOpen}
        transaction={transaction}
        membersList={membersList}
      />
    </li>
  );
}
