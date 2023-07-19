import { TextField } from '@mui/material';
import type Decimal from 'decimal.js';
import type { Dispatch, MutableRefObject, SetStateAction } from 'react';
import { useContext } from 'react';

import type { TransactionMember } from '@/pages/groups/[group]/new-transaction-helpers';
import { currencyCodeSymbolMap } from '@/utils/currencyUtil';

import { ReceiptScanningContext } from '../hooks/ReceiptScanningContext';
import { getMembersListBySplitType } from '../new-transaction/helpers';

export default function Weight({
  weightRef,
  member,
  totalCost,
  membersList,
  setMembersList,
}: {
  weightRef: MutableRefObject<HTMLInputElement | undefined>;
  member: TransactionMember;
  totalCost: Decimal;
  membersList: Array<TransactionMember>;
  setMembersList: Dispatch<SetStateAction<Array<TransactionMember>>>;
}) {
  const receiptScanningContext = useContext(ReceiptScanningContext);

  const { payerId, currency } = receiptScanningContext!;

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
          const changedMembers = membersList.map((mem: TransactionMember) => {
            const newMem = mem;
            if (mem.memberId === member.memberId) {
              newMem.weight = nums.length === 0 ? 0 : parseInt(nums, 10);
            }
            return newMem;
          });

          const list = getMembersListBySplitType(
            'weight',
            changedMembers,
            totalCost,
            'expense',
            payerId
          );
          setMembersList(list);
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
        value={`${currencyCodeSymbolMap.get(currency)}${member.amount.toFixed(
          2
        )}`}
      />
    </>
  );
}
