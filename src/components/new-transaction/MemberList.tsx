import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Typography from '@mui/material/Typography';
import React, { useEffect, useState } from 'react';

import { TransactionContext } from '@/components/hooks/TransactionContext';

import type { IMember } from './helpers';
import { getMembersListBySplitType, setSelectAllMembers } from './helpers';
import Member from './Member';

export default function MembersList() {
  const transactionContext = React.useContext(TransactionContext);
  const [splitType, setSplitType] = useState('equal');

  const handleSelectAll = (isAllSelected: boolean) => {
    setSelectAllMembers(
      transactionContext!.membersList,
      transactionContext!.setMembersList,
      isAllSelected,
      splitType,
      transactionContext!.totalCost,
      transactionContext!.transactionType,
      transactionContext!.payer
    );
  };

  useEffect(() => {
    if (transactionContext) {
      transactionContext.setMembersList(
        getMembersListBySplitType(
          splitType,
          transactionContext.membersList,
          transactionContext.totalCost,
          transactionContext.transactionType,
          transactionContext.payer
        )
      );
    }
  }, [
    transactionContext!.payer,
    transactionContext!.totalCost,
    splitType,
    transactionContext!.transactionType,
  ]);

  return (
    <>
      <div className="flexbox-row justify-between gap-2 pb-2">
        <FormControl
          size="small"
          fullWidth={false}
          className="h-fit border-alice-main"
        >
          <div className="p-2">
            <Select
              className="bg-alice-base"
              defaultValue="Equal"
              onChange={(e) => setSplitType(e.target.value.toLowerCase())}
            >
              <MenuItem key="Equal" value="Equal">
                <Typography className="whitespace-normal break-words" noWrap>
                  Equal
                </Typography>
              </MenuItem>
              <MenuItem key="Weight" value="Weight">
                <Typography className="whitespace-normal break-words" noWrap>
                  Weight
                </Typography>
              </MenuItem>
              <MenuItem key="Custom" value="Custom">
                <Typography className="whitespace-normal break-words" noWrap>
                  Custom
                </Typography>
              </MenuItem>
            </Select>
          </div>
        </FormControl>
        <div className="flexbox-row max-w-fit gap-1 p-2">
          <button
            className="rounded bg-alice-accent p-2 px-3 text-alice-base shadow-md"
            type="button"
            onClick={() => handleSelectAll(true)}
          >
            Select All
          </button>
          <button
            className="rounded bg-alice-accent p-2 px-3 text-alice-base shadow-md"
            type="button"
            onClick={() => handleSelectAll(false)}
          >
            Unselect All
          </button>
        </div>
      </div>
      <ul className="max-w-screen-md space-y-4 rounded bg-alice-main p-2">
        {transactionContext!.membersList
          .filter((member: IMember) => {
            if (transactionContext!.transactionType === 'loan') {
              return transactionContext!.payer !== member.name;
            }
            return true;
          })
          .map((member: IMember) => {
            return (
              <div key={member.name}>
                <Member member={member} splitType={splitType.toLowerCase()} />
              </div>
            );
          })}
      </ul>
    </>
  );
}
