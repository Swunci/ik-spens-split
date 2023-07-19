import { TextField } from '@mui/material';
import type { Dispatch, SetStateAction } from 'react';
import { useContext, useRef } from 'react';

import type { TransactionMember } from '@/pages/groups/[group]/new-transaction-helpers';
import { currencyCodeSymbolMap } from '@/utils/currencyUtil';

import { TransactionContext } from '../hooks/TransactionContext';
import Custom from './Custom';
import Weight from './Weight';

export default function MemberField({
  splitType,
  member,
  setIsOver,
}: {
  splitType: string;
  member: TransactionMember;
  setIsOver: Dispatch<SetStateAction<boolean>>;
}) {
  const transactionContext = useContext(TransactionContext);
  const splitValueRef = useRef<HTMLInputElement>();
  const weightRef = useRef<HTMLInputElement>();

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
          value={`${currencyCodeSymbolMap.get(
            transactionContext!.currency
          )}${member.amount.toFixed(2)}`}
        />
      );
    case 'weight':
      return (
        <Weight
          weightRef={weightRef}
          member={member}
          totalCost={transactionContext!.totalCost}
        />
      );
    case 'custom':
      return (
        <Custom
          splitValueRef={splitValueRef}
          member={member}
          setIsOver={setIsOver}
        />
      );
    default:
      return <div />;
  }
}
