import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import React, { useRef, useState } from 'react';

import { TransactionContext } from '@/context/TransactionContext';

import Custom from './Custom';
import { getMembersListBySplitType, type IMember } from './helpers';

export default function Member({
  member,
  splitType,
  totalCost,
}: {
  member: IMember;
  splitType: string;
  totalCost: number;
}) {
  const transactionContext = React.useContext(TransactionContext);
  const splitValueRef = useRef<HTMLInputElement>();
  const [isOver, setIsOver] = useState(false);

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
    list = getMembersListBySplitType(splitType, list, totalCost);
    transactionContext!.setMembersList(list);
  };

  const renderSwitch = () => {
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
        return <div />;
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
      className={`flex flex-row place-content-between items-center rounded border align-middle text-lg ${
        member.isSelected ? 'border-black bg-green-400' : 'border-gray-200'
      } ${isOver ? 'bg-red-300' : ''}`}
    >
      <button
        className="flexbox-row w-full max-w-11/12 break-words p-2 py-3 mobile-disable-highlight"
        type="button"
        onClick={handleSelect}
      >
        <Typography className="max-w-11/12" noWrap>
          {member.name}
        </Typography>
      </button>
      {renderSwitch()}
    </li>
  );
}
