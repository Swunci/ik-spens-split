import { useEffect, useState } from 'react';

import { selectAllMembers, updateMembersSplitCost } from './helpers';
import Member from './Member';

interface IMember {
  name: string;
  amount: number;
  isSelected: boolean;
}

export default function MembersList({ totalCost }: { totalCost: number }) {
  const currentMembers: IMember[] = ['Person A', 'Person B', 'Person C']
    .sort()
    .map((member: string) => {
      return {
        name: member,
        amount: 0,
        isSelected: true,
      };
    });
  const [membersList, setMembersList] = useState(currentMembers);

  const [numSelected, setNumSelected] = useState(membersList.length);

  const handleSelectAll = () => {
    selectAllMembers(membersList, setMembersList);
    setNumSelected(membersList.length);
  };

  useEffect(() => {
    updateMembersSplitCost(membersList, totalCost, numSelected, setMembersList);
  }, [totalCost, numSelected]);

  return (
    <>
      <button type="button" onClick={handleSelectAll}>
        Select All
      </button>
      <ul className="max-w-screen-md space-y-2">
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
