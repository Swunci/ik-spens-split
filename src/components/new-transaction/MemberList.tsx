import { useEffect, useState } from 'react';

import type { IMember } from './helpers';
import { setSelectAllMembers, updateMembersSplitCost } from './helpers';
import Member from './Member';

export default function MembersList({ totalCost }: { totalCost: number }) {
  const currentMembers: IMember[] = ['Person A', 'Person B', 'Person C']
    .sort((a, b) => a.localeCompare(b))
    .map((member: string) => {
      return {
        name: member,
        amount: 0,
        isSelected: true,
      };
    });
  const [membersList, setMembersList] = useState(currentMembers);

  const [numSelected, setNumSelected] = useState(membersList.length);

  const handleSelectAll = (isAllSelected: boolean) => {
    setSelectAllMembers(membersList, setMembersList, isAllSelected);
    setNumSelected(isAllSelected ? membersList.length : 0);
  };

  useEffect(() => {
    updateMembersSplitCost(membersList, totalCost, numSelected, setMembersList);
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
