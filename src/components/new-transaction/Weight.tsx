import { TextField } from '@mui/material';
import { useContext } from 'react';

import { TransactionContext } from '@/components/hooks/TransactionContext';

import { getWeightSplitMemberList, type IMember } from './helpers';

export default function Weight({
  weightRef,
  member,
  totalCost,
}: {
  weightRef: React.MutableRefObject<HTMLInputElement | undefined>;
  member: IMember;
  totalCost: number;
}) {
  const transactionContext = useContext(TransactionContext);

  return (
    <>
      <TextField
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
            width: '50px',
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
          // eslint-disable-next-line no-param-reassign
          const weight = weightRef.current!;
          weight.value =
            nums.length === 0 ? '0' : parseInt(nums, 10).toFixed(0);
          const changedMembers = transactionContext!.membersList.map(
            (mem: IMember) => {
              const newMem = mem;
              if (mem.name === member.name) {
                newMem.weight = nums.length === 0 ? 0 : parseInt(nums, 10);
              }
              return newMem;
            }
          );

          const list = getWeightSplitMemberList(changedMembers, totalCost);
          transactionContext!.setMembersList(list);
        }}
      />
      <span>$</span>
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
        value={member.amount.toFixed(2)}
      />
    </>
  );
}
