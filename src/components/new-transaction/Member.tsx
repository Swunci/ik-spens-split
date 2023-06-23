import Typography from '@mui/material/Typography';
import type { Dispatch, SetStateAction } from 'react';

import type { IMember } from './helpers';

export default function Member({
  member,
  membersList,
  setMembersList,
}: {
  member: IMember;
  membersList: IMember[];
  setMembersList: Dispatch<SetStateAction<IMember[]>>;
}) {
  const handleSelect = (e: React.MouseEvent) => {
    e.preventDefault();
    setMembersList(
      membersList.map((mem: IMember) => {
        const newMem = mem;
        if (mem.name === member.name) {
          newMem.isSelected = !mem.isSelected;
        }
        return newMem;
      })
    );
  };

  return (
    <li
      key={member.name}
      className={`flex flex-row place-content-between items-center rounded border align-middle text-lg ${
        member.isSelected ? 'border-black bg-green-400' : 'border-gray-200'
      }`}
    >
      <button
        className="flexbox-row w-full break-words p-2 px-3 mobile-disable-highlight"
        type="button"
        onClick={handleSelect}
      >
        <Typography className="max-w-11/12 text-ellipsis">
          {member.name}
        </Typography>
        <span>${member.amount.toFixed(2)}</span>
      </button>
    </li>
  );
}
