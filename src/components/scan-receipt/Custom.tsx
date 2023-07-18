import { TextField } from '@mui/material';
import Decimal from 'decimal.js';
import type { Dispatch, MutableRefObject, SetStateAction } from 'react';
import { useContext } from 'react';

import { currencyCodeSymbolMap } from '@/utils/currencyUtil';

import { ReceiptScanningContext } from '../hooks/ReceiptScanningContext';
import type { TransactionMember } from '../new-transaction/helpers';

export default function Custom({
  splitValueRef,
  member,
  setIsOver,
  membersList,
  setMembersList,
  totalCost,
}: {
  splitValueRef: MutableRefObject<HTMLInputElement | undefined>;
  member: TransactionMember;
  setIsOver: Dispatch<SetStateAction<boolean>>;
  membersList: Array<TransactionMember>;
  setMembersList: Dispatch<SetStateAction<Array<TransactionMember>>>;
  totalCost: Decimal;
}) {
  const receiptScanningContext = useContext(ReceiptScanningContext);

  const { currency } = receiptScanningContext!;

  return (
    <TextField
      inputRef={splitValueRef}
      disabled={!member.isSelected}
      className="p-1"
      size="small"
      id="outlined-basic"
      variant="outlined"
      type="text"
      value={`${currencyCodeSymbolMap.get(currency)}${member.amount.toFixed(
        2
      )}`}
      inputProps={{
        min: 0,
        step: 0.01,
        style: {
          textAlign: 'right',
        },
      }}
      onFocus={(e) =>
        e.target.setSelectionRange(e.target.value.length, e.target.value.length)
      }
      onClick={(e) => {
        e.preventDefault();
        splitValueRef.current?.setSelectionRange(
          splitValueRef.current?.value.length,
          splitValueRef.current?.value.length
        );
      }}
      onChange={(e) => {
        let nums = e.target.value.replace(/\D/g, '');
        if (nums.length <= 1) {
          nums = `0${nums}`;
        }
        const precision = 2;
        const num = `${nums.slice(0, -1 * precision)}.${nums.slice(
          -1 * precision
        )}`;

        const newCost = new Decimal(num).toDecimalPlaces(precision);

        const splitValue = splitValueRef.current!;
        splitValue.value = newCost.toFixed(precision);

        const total = membersList.reduce(
          (cost: Decimal, mem: TransactionMember) => {
            if (mem.memberId !== member.memberId) {
              return cost.plus(mem.amount);
            }
            return cost;
          },
          new Decimal(num)
        );

        setIsOver(total.greaterThan(totalCost));

        setMembersList(
          membersList.map((mem: TransactionMember) => {
            const newMem = mem;
            if (mem.memberId === member.memberId) {
              newMem.amount = newCost;
            }
            return newMem;
          }) || new Array<TransactionMember>()
        );
      }}
    />
  );
}
