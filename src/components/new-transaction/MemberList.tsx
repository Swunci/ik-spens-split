import type { Dispatch, SetStateAction } from 'react';
import { useEffect, useState } from 'react';

import type { IMember } from './helpers';
import { setSelectAllMembers, updateMembersSplitCost } from './helpers';
import Member from './Member';

interface MemberDetails {
  totalCost: number;
  memberNames: string[];
  setParentMembersList: Dispatch<SetStateAction<IMember[]>>;
}

export default function MembersList({
  totalCost,
  memberNames,
  setParentMembersList,
}: MemberDetails) {
  const [numSelected, setNumSelected] = useState(memberNames.length);
  const [membersList, setMembersList] = useState(
    memberNames.map((name: string) => {
      const member = {} as IMember;
      member.name = name;
      member.isSelected = true;
      member.amount = totalCost / numSelected;
      return member;
    })
  );

  const handleSelectAll = (isAllSelected: boolean) => {
    setSelectAllMembers(
      membersList,
      setMembersList,
      setParentMembersList,
      isAllSelected
    );
    setNumSelected(isAllSelected ? membersList.length : 0);
  };

  useEffect(() => {
    updateMembersSplitCost(
      membersList,
      totalCost,
      numSelected,
      setMembersList,
      setParentMembersList
    );
  }, [totalCost, numSelected]);

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
        {[...membersList].map((member: IMember) => {
          return (
            <div key={member.name}>
              <Member
                member={member}
                membersList={membersList}
                numSelected={numSelected}
                setNumSelected={setNumSelected}
              />
            </div>
          );
        })}
      </ul>
    </>
  );
}
