import { TextField } from '@mui/material';
import type Decimal from 'decimal.js';
import type { MutableRefObject } from 'react';
import { useContext } from 'react';

import { TransactionContext } from '@/components/hooks/TransactionContext';
import { currencyCodeSymbolMap } from '@/utils/currencyUtil';

import type { TransactionMember } from './helpers';
import { getMembersListBySplitType } from './helpers';

export default function Weight({
  weightRef,
  member,
  totalCost,
}: {
  weightRef: MutableRefObject<HTMLInputElement | undefined>;
  member: TransactionMember;
  totalCost: Decimal;
}) {
  const transactionContext = useContext(TransactionContext);

  return (
    <>
      <TextField
        disabled={!member.isSelected}
        autoComplete="false"
        inputRef={weightRef}
        className="p-1"
        size="small"
        id="outlined-basic"
        variant="outlined"
        type="text"
        inputProps={{
          style: {
            textAlign: 'right',
            width: '100px',
          },
        }}
        value={member.weight}
        onFocus={(e) =>
          e.target.setSelectionRange(
            e.target.value.length,
            e.target.value.length
          )
        }
        onClick={(e) => {
          e.preventDefault();
          weightRef.current?.setSelectionRange(
            weightRef.current?.value.length,
            weightRef.current?.value.length
          );
        }}
        onChange={(e) => {
          e.preventDefault();
          const nums = e.target.value.replace(/\D/g, '');
          const weight = weightRef.current!;
          weight.value =
            nums.length === 0 ? '0' : parseInt(nums, 10).toFixed(0);
          const changedMembers = transactionContext!.membersList.map(
            (mem: TransactionMember) => {
              const newMem = mem;
              if (mem.memberId === member.memberId) {
                newMem.weight = nums.length === 0 ? 0 : parseInt(nums, 10);
              }
              return newMem;
            }
          );

          const list = getMembersListBySplitType(
            'weight',
            changedMembers,
            totalCost,
            transactionContext!.transactionType,
            transactionContext!.payerId
          );
          transactionContext!.setMembersList(list);
        }}
      />
      <TextField
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
    </>
  );
}
