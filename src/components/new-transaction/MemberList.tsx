import type { Dispatch, SetStateAction } from 'react';
import { useEffect, useState } from 'react';

import type { IMember } from './helpers';
import {
  getInitialMemberList,
  getNewSplitMemberList,
  setSelectAllMembers,
} from './helpers';
import Member from './Member';

interface MemberDetails {
  payer: string;
  transactionType: string;
  totalCost: number;
  memberNames: string[];
  setParentMembersList: Dispatch<SetStateAction<IMember[]>>;
}

export default function MembersList({
  totalCost,
  memberNames,
  payer,
  transactionType,
  setParentMembersList,
}: MemberDetails) {
  const [membersList, setMembersList] = useState(new Array<IMember>());

  const handleSelectAll = (isAllSelected: boolean) => {
    setSelectAllMembers(
      membersList,
      setMembersList,
      setParentMembersList,
      isAllSelected
    );
  };

  useEffect(() => {
    const list = getNewSplitMemberList(membersList, totalCost);
    setParentMembersList(list);
  }, [membersList, totalCost]);

  useEffect(() => {
    const list = getInitialMemberList(
      memberNames,
      transactionType,
      payer,
      totalCost
    );
    setMembersList(list);
  }, [transactionType, payer]);

  return (
    <>
      <div className="flexbox-row gap-2 py-2">
        <select className="my-2 bg-white p-1">
          <option>Equally</option>
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
        {[...membersList]
          .filter((member: IMember) => {
            if (transactionType === 'loan') {
              return payer !== member.name;
            }
            return true;
          })
          .map((member: IMember) => {
            return (
              <div key={member.name}>
                <Member
                  member={member}
                  membersList={membersList}
                  setMembersList={setMembersList}
                />
              </div>
            );
          })}
      </ul>
    </>
  );
}
