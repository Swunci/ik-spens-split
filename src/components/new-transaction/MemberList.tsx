import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Typography from '@mui/material/Typography';
import { useContext, useEffect } from 'react';

import { TransactionContext } from '@/components/hooks/TransactionContext';

import type { TransactionMember } from './helpers';
import { getMembersListBySplitType, setSelectAllMembers } from './helpers';
import Member from './Member';

export default function MembersList() {
  const transactionContext = useContext(TransactionContext);

  const handleSelectAll = (isAllSelected: boolean) => {
    setSelectAllMembers(
      transactionContext!.membersList,
      transactionContext!.setMembersList,
      isAllSelected,
      transactionContext!.splitType,
      transactionContext!.totalCost,
      transactionContext!.transactionType,
      transactionContext!.payerId
    );
  };

  useEffect(() => {
    if (transactionContext) {
      transactionContext.setMembersList(
        getMembersListBySplitType(
          transactionContext.splitType,
          transactionContext.membersList,
          transactionContext.totalCost,
          transactionContext.transactionType,
          transactionContext.payerId
        )
      );
    }
  }, [
    transactionContext!.payerId,
    transactionContext!.totalCost,
    transactionContext!.splitType,
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
              defaultValue={transactionContext!.splitType}
              onChange={(e) => transactionContext!.setSplitType(e.target.value)}
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
          .filter((member: TransactionMember) => {
            if (transactionContext!.transactionType === 'loan') {
              return transactionContext!.payerId !== member.memberId;
            }
            return true;
          })
          .map((member: TransactionMember) => {
            return (
              <div key={member.memberName}>
                <Member
                  member={member}
                  splitType={transactionContext!.splitType.toLowerCase()}
                />
              </div>
            );
          })}
      </ul>
    </>
  );
}
