import FormControl from '@mui/material/FormControl';
import { useContext, useEffect } from 'react';

import { PendingTransactionContext } from '../hooks/PendingTransactionContext';
import { ReceiptScanningContext } from '../hooks/ReceiptScanningContext';
import type { TransactionMember } from '../new-transaction/helpers';
import {
  getMembersListBySplitType,
  setSelectAllMembers,
} from '../new-transaction/helpers';
import ListboxSelection from '../shared/ListboxSelection';
import MemberItem from './MemberItem';

export default function MembersList() {
  const receiptScanningContext = useContext(ReceiptScanningContext);

  const { payerId } = receiptScanningContext!;

  const pendingTransactionContext = useContext(PendingTransactionContext);

  const { transaction, splitType, setSplitType, membersList, setMembersList } =
    pendingTransactionContext!;

  const handleSelectAll = (isAllSelected: boolean) => {
    setSelectAllMembers(
      membersList,
      setMembersList,
      isAllSelected,
      splitType,
      transaction.amount,
      'expense',
      payerId
    );
  };

  useEffect(() => {
    if (receiptScanningContext) {
      setMembersList(
        getMembersListBySplitType(
          splitType,
          membersList,
          transaction.amount,
          'expense',
          payerId
        )
      );
    }
  }, [payerId, transaction, splitType]);

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
              selection={splitType}
              setSelection={setSplitType}
              customWidth="w-24"
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
        {membersList.map((member: TransactionMember) => {
          return (
            <div key={member.memberName}>
              <MemberItem member={member} />
            </div>
          );
        })}
      </ul>
    </>
  );
}
