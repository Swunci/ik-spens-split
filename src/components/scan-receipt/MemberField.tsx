import { TextField } from '@mui/material';
import type { Dispatch, SetStateAction } from 'react';
import { useContext, useRef } from 'react';

import type { TransactionMember } from '@/pages/groups/[group]/new-transaction-helpers';
import { currencyCodeSymbolMap } from '@/utils/currencyUtil';

import { ReceiptScanningContext } from '../hooks/ReceiptScanningContext';
import Custom from './Custom';
import type { PendingTransaction } from './PendingTransactionsList';
import Weight from './Weight';

export default function MemberField({
  splitType,
  member,
  setIsOver,
  transaction,
  membersList,
  setMembersList,
}: {
  splitType: string;
  member: TransactionMember;
  setIsOver: Dispatch<SetStateAction<boolean>>;
  transaction: PendingTransaction;
  membersList: Array<TransactionMember>;
  setMembersList: Dispatch<SetStateAction<Array<TransactionMember>>>;
}) {
  const splitValueRef = useRef<HTMLInputElement>();
  const weightRef = useRef<HTMLInputElement>();

  const receiptScanningContext = useContext(ReceiptScanningContext);

  const { currency } = receiptScanningContext!;

  switch (splitType.toLowerCase()) {
    case 'equal':
      return (
        <TextField
          inputRef={splitValueRef}
          disabled
          className="p-1"
          size="small"
          id="outlined-basic"
          variant="outlined"
          type="text"
          inputProps={{
            style: {
              textAlign: 'right',
            },
          }}
          value={`${currencyCodeSymbolMap.get(currency)}${member.amount.toFixed(
            2
          )}`}
        />
      );
    case 'weight':
      return (
        <Weight
          weightRef={weightRef}
          member={member}
          totalCost={transaction.amount}
          membersList={membersList}
          setMembersList={setMembersList}
        />
      );
    case 'custom':
      return (
        <Custom
          splitValueRef={splitValueRef}
          member={member}
          setIsOver={setIsOver}
          totalCost={transaction.amount}
          membersList={membersList}
          setMembersList={setMembersList}
        />
      );
    default:
      return <div />;
  }
}
