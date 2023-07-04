import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import React, { useEffect, useRef, useState } from 'react';

import { TransactionContext } from '@/components/hooks/TransactionContext';

import Custom from './Custom';
import { getMembersListBySplitType, type IMember } from './helpers';
import Weight from './Weight';

export default function Member({
  member,
  splitType,
}: {
  member: IMember;
  splitType: string;
}) {
  const transactionContext = React.useContext(TransactionContext);
  const splitValueRef = useRef<HTMLInputElement>();
  const weightRef = useRef<HTMLInputElement>();
  const [isOver, setIsOver] = useState(false);

  useEffect(() => {
    const total = transactionContext!.membersList.reduce(
      (cost: number, mem: IMember) => {
        return cost + mem.amount;
      },
      0
    );
    setIsOver(total > transactionContext!.totalCost);
  }, [transactionContext!.membersList]);

  const handleSelect = (e: React.MouseEvent) => {
    e.preventDefault();
    let list = transactionContext!.membersList.map((mem: IMember) => {
      const newMem = mem;
      if (mem.name === member.name) {
        newMem.isSelected = !mem.isSelected;
      }
      if (!newMem.isSelected) {
        newMem.amount = 0;
        setIsOver(false);
      }
      return newMem;
    });
    list = getMembersListBySplitType(
      splitType,
      list,
      transactionContext!.totalCost,
      transactionContext!.transactionType,
      transactionContext!.payer
    );
    transactionContext!.setMembersList(list);
  };

  const renderMember = () => {
    switch (splitType.toLowerCase()) {
      case 'equal':
        return (
          <>
            <span>$</span>
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
              value={member.amount.toFixed(2)}
            />
          </>
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
  };

  return (
    <li
      key={member.name}
      className={`flex flex-row place-content-between items-center rounded border-2 bg-alice-base align-middle text-lg ${
        member.isSelected ? 'border-alice-accent' : ''
      } ${isOver && member.isSelected ? ' border-red-400' : ''}`}
    >
      <button
        className="flexbox-row w-full max-w-6/12 break-words p-2 py-3 mobile-disable-highlight"
        type="button"
        onClick={handleSelect}
      >
        <Typography noWrap>{member.name}</Typography>
      </button>
      {renderMember()}
    </li>
  );
}
