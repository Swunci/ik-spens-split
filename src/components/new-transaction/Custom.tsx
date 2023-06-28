import { TextField } from '@mui/material';
import { type Dispatch, type SetStateAction, useContext } from 'react';

import { TransactionContext } from '@/components/hooks/TransactionContext';

import type { IMember } from './helpers';

export default function Custom({
  splitValueRef,
  member,
  setIsOver,
}: {
  splitValueRef: React.MutableRefObject<HTMLInputElement | undefined>;
  member: IMember;
  setIsOver: Dispatch<SetStateAction<boolean>>;
}) {
  const transactionContext = useContext(TransactionContext);

  return (
    <>
      <span>$</span>
      <TextField
        inputRef={splitValueRef}
        disabled={!member.isSelected}
        className="p-1"
        size="small"
        id="outlined-basic"
        variant="outlined"
        type="text"
        value={member.amount.toFixed(2)}
        inputProps={{
          min: 0,
          step: 0.01,
          style: {
            textAlign: 'right',
          },
        }}
        onFocus={(e) =>
          e.target.setSelectionRange(
            e.target.value.length,
            e.target.value.length
          )
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
          const num = `${nums.slice(0, -2)}.${nums.slice(-2)}`;
          const splitValue = splitValueRef.current!;
          splitValue.value = parseFloat(num).toFixed(2);
          const total = transactionContext!.membersList.reduce(
            (cost: number, mem: IMember) => {
              if (member.name !== mem.name) {
                return cost + mem.amount;
              }
              return cost;
            },
            parseFloat(num)
          );
          setIsOver(total > transactionContext!.totalCost);
          transactionContext!.setMembersList(
            transactionContext!.membersList.map((mem: IMember) => {
              const newMem = mem;
              if (mem.name === member.name) {
                newMem.amount = parseFloat(num);
              }
              return newMem;
            }) || new Array<IMember>()
          );
        }}
      />
    </>
  );
}
