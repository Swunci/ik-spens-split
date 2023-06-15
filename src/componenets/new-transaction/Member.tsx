interface IMember {
  name: string;
  amount: number;
  isSelected: boolean;
}

export default function Member({
  member,
  membersList,
  numSelected,
  setNumSelected,
}: {
  member: IMember;
  membersList: IMember[];
  numSelected: number;
  setNumSelected: Function;
}) {
  const handleSelect = (e: React.MouseEvent) => {
    e.preventDefault();
    let newNumSelected = numSelected;
    membersList.map((mem: IMember) => {
      const newMem = mem;
      if (mem.name === member.name) {
        newMem.isSelected = !mem.isSelected;
        newNumSelected = newMem.isSelected ? numSelected + 1 : numSelected - 1;
        setNumSelected(newNumSelected);
      }
      return newMem;
    });
  };

  return (
    <li
      key={member.name}
      className={`flex flex-row place-content-between items-center rounded border align-middle text-sm ${
        member.isSelected ? 'border-black bg-green-400' : 'border-gray-200'
      }`}
    >
      <button
        className="flexbox-row w-full break-words p-2 px-3 mobile-disable-highlight"
        type="button"
        onClick={handleSelect}
      >
        {member.name}
        <span>${member.amount.toFixed(2)}</span>
      </button>
    </li>
  );
}
