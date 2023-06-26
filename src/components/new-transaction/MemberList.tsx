import React, { useEffect, useState } from 'react';

import { TransactionContext } from '@/components/hooks/TransactionContext';

import type { IMember } from './helpers';
import { getMembersListBySplitType, setSelectAllMembers } from './helpers';
import Member from './Member';

export default function MembersList({
  memberNames,
}: {
  memberNames: string[];
}) {
  const transactionContext = React.useContext(TransactionContext);
  const [splitType, setSplitType] = useState('equal');

  const handleSelectAll = (isAllSelected: boolean) => {
    setSelectAllMembers(
      transactionContext!.membersList,
      transactionContext!.setMembersList,
      isAllSelected,
      splitType,
      transactionContext!.totalCost
    );
  };

  useEffect(() => {
    console.log(transactionContext!.membersList);
  }, [transactionContext!.membersList]);

  useEffect(() => {
    if (transactionContext) {
      transactionContext.setMembersList(
        getMembersListBySplitType(
          splitType,
          transactionContext!.membersList,
          transactionContext!.totalCost
        )
      );
    }
  }, [transactionContext!.payer, transactionContext!.totalCost, splitType]);

  useEffect(() => {
    transactionContext!.setMembersList(
      memberNames.map((name: string) => {
        const member = {} as IMember;
        member.name = name;
        member.isSelected = true;
        member.amount = transactionContext!.totalCost / memberNames.length;
        member.weight = 0;
        return member;
      })
    );
  }, [memberNames]);

  useEffect(() => {
    console.log('MemberList - memberNames changed');
  }, [memberNames]);

  return (
    <>
      <div className="flexbox-row gap-2 py-2">
        <select
          className="my-2 bg-white p-1"
          onChange={(e) => setSplitType(e.target.value.toLowerCase())}
        >
          <option>Equal</option>
          <option>Weight</option>
          <option>Custom</option>
        </select>
        <div className="flexbox-row max-w-fit gap-1 p-2">
          <button
            className="rounded bg-blue-300 p-2"
            type="button"
            onClick={() => handleSelectAll(true)}
          >
            Select All
          </button>
          <button
            className="rounded bg-blue-300 p-2"
            type="button"
            onClick={() => handleSelectAll(false)}
          >
            Unselect All
          </button>
        </div>
      </div>
      <ul className="max-w-screen-md space-y-4 pt-2">
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
                <Member
                  totalCost={transactionContext!.totalCost}
                  member={member}
                  splitType={splitType.toLowerCase()}
                />
              </div>
            );
          })}
      </ul>
    </>
  );
}
