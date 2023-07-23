import FormControl from '@mui/material/FormControl';
import { useContext, useEffect } from 'react';

import { TransactionContext } from '@/components/hooks/TransactionContext';
import type { TransactionMember } from '@/pages/groups/[group]/new-transaction-helpers';

import ListboxSelection from '../shared/ListboxSelection';
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
            <ListboxSelection
              options={['Equal', 'Weight', 'Custom']}
              selection={transactionContext!.splitType}
              setSelection={transactionContext!.setSplitType}
              customWidth="w-28"
            />
          </div>
        </FormControl>
        <div className="flexbox-row max-w-fit gap-1 p-2">
          <button
            className={`custom-focus rounded bg-alice-accent p-2 px-3 text-alice-base shadow-md focus:bg-alice-main
                      focus:text-black focus:outline-alice-accent
                      betterhover:hover:bg-alice-accent/90`}
            type="button"
            onClick={() => handleSelectAll(true)}
          >
            Select All
          </button>
          <button
            className={`custom-focus rounded bg-alice-accent p-2 px-3 text-alice-base shadow-md focus:bg-alice-main
                      focus:text-black focus:outline-alice-accent
                      betterhover:hover:bg-alice-accent/90`}
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
