import Typography from '@mui/material/Typography';
import Decimal from 'decimal.js';
import { useContext, useEffect, useState } from 'react';

import { TransactionContext } from '@/components/hooks/TransactionContext';
import type { TransactionMember } from '@/pages/groups/[group]/new-transaction-helpers';

import { getMembersListBySplitType } from './helpers';
import MemberField from './MemberField';

export default function Member({
  member,
  splitType,
}: {
  member: TransactionMember;
  splitType: string;
}) {
  const transactionContext = useContext(TransactionContext);
  const [isOver, setIsOver] = useState(false);

  useEffect(() => {
    const total = transactionContext!.membersList.reduce(
      (cost: Decimal, mem: TransactionMember) => {
        return cost.plus(mem.amount);
      },
      new Decimal(0)
    );
    setIsOver(total.greaterThan(transactionContext!.totalCost));
  }, [transactionContext!.membersList]);

  const handleSelect = (e: React.MouseEvent) => {
    e.preventDefault();
    let list = transactionContext!.membersList.map((mem: TransactionMember) => {
      const newMem = mem;
      if (mem.memberId === member.memberId) {
        newMem.isSelected = !mem.isSelected;
      }
      if (!newMem.isSelected) {
        newMem.amount = new Decimal(0);
        newMem.weight = 0;
        setIsOver(false);
      }
      return newMem;
    });
    list = getMembersListBySplitType(
      splitType,
      list,
      transactionContext!.totalCost,
      transactionContext!.transactionType,
      transactionContext!.payerId
    );
    transactionContext!.setMembersList(list);
  };

  return (
    <li
      key={member.memberId}
      className={`flex flex-row place-content-between items-center rounded-md border-2 bg-alice-base align-middle text-lg betterhover:hover:bg-alice-base/70 ${
        member.isSelected ? 'border-alice-accent' : 'border-alice-base'
      } ${isOver && member.isSelected ? ' border-red-400' : ''}`}
    >
      <button
        className="flexbox-row w-full break-words p-2 py-3 mobile-disable-highlight"
        type="button"
        onClick={handleSelect}
      >
        <Typography noWrap>{member.memberName}</Typography>
      </button>
      <MemberField
        splitType={splitType}
        member={member}
        setIsOver={setIsOver}
      />
    </li>
  );
}
