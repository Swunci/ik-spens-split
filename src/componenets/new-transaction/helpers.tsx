interface IMember {
  name: string;
  amount: number;
  isSelected: boolean;
}

export function selectAllMembers(
  membersList: IMember[],
  setMembersList: Function
): void {
  setMembersList(
    membersList.map((mem: IMember) => {
      const newMem = mem;
      newMem.isSelected = true;
      return newMem;
    })
  );
}

export function updateMembersSplitCost(
  membersList: IMember[],
  totalCost: number,
  numSelected: number,
  setMembersList: Function
): void {
  setMembersList(
    membersList.map((mem: IMember) => {
      const newMem = mem;
      newMem.amount =
        numSelected !== 0 && newMem.isSelected ? totalCost / numSelected : 0;
      return newMem;
    })
  );
}
