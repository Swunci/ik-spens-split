import { Dialog, Transition } from '@headlessui/react';
import { Typography } from '@mui/material';
import Decimal from 'decimal.js';
import type { Dispatch, SetStateAction } from 'react';
import {
  Fragment,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { getInitialMemberList } from '@/components/new-transaction/helpers';
import type { Group, ShareCost, Transaction } from '@/interfaces/response';
import type { TransactionMember } from '@/pages/groups/[group]/new-transaction-helpers';
import {
  getActionByTransactionType,
  handleTotalCostInput,
} from '@/pages/groups/[group]/new-transaction-helpers';
import { displayWithCommas } from '@/utils/currencyUtil';
import { getLocaleDateString } from '@/utils/timeUtils';

import { MemberIdNameContext } from '../hooks/MemberIdNameContext';
import type { ActionType } from '../hooks/snackbarReducer';
import { TransactionContext } from '../hooks/TransactionContext';
import MembersList from '../new-transaction/MemberList';
import ListboxSelection from '../shared/ListboxSelection';
import MemberSelection from '../shared/MemberSelection';
import type { UpdateTransactionForm } from './EditDebtModalHelpers';
import {
  handleTransactionDelete,
  handleTransactionUpdate,
} from './EditDebtModalHelpers';

export default function EditTransactionModal({
  open,
  setOpen,
  transaction,
  group,
  dispatch,
}: {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  transaction: Transaction;
  group: Group;
  dispatch: Dispatch<ActionType>;
}) {
  const [totalCost, setTotalCost] = useState(new Decimal(transaction.amount));
  const [payerId, setPayerId] = useState(transaction.payerId);
  const [transactionType, setTransactionType] = useState(transaction.type);
  const [splitType, setSplitType] = useState('Equal');
  const [membersList, setMembersList] = useState(
    getInitialMemberList(group.members, transaction.type, transaction.payerId)
  );
  const descriptionRef = useRef<HTMLInputElement>(null);
  const dateRef = useRef<HTMLInputElement>(null);
  const [currency, setCurrency] = useState(transaction.currency);

  const memberIdNameContext = useContext(MemberIdNameContext);

  const idNameMap = memberIdNameContext!.memberIdToNameMap;

  const contextValue = useMemo(
    () => ({
      payerId,
      setPayerId,
      membersList,
      setMembersList,
      totalCost,
      setTotalCost,
      transactionType,
      setTransactionType,
      currency,
      splitType,
      setSplitType,
    }),
    [payerId, membersList, totalCost, transactionType, splitType]
  );

  useEffect(() => {
    if (open) {
      setPayerId(transaction.payerId);
      setTotalCost(new Decimal(transaction.amount));
      setTransactionType(transaction.type);
      setCurrency(transaction.currency);
      const splits = transaction.shareCosts;
      const memberMap = new Map<string, ShareCost>();
      splits.forEach((split: ShareCost) => {
        memberMap.set(split.memberId, split);
      });
      const updatedMembersList = membersList.map(
        (member: TransactionMember) => {
          const updatedMember = member;
          updatedMember.amount = new Decimal(
            memberMap.get(member.memberId)!.shareCost
          );
          updatedMember.weight = memberMap.get(member.memberId)!.weight;
          if (!updatedMember.amount.greaterThan(0)) {
            updatedMember.isSelected = false;
          } else {
            updatedMember.isSelected = true;
          }
          return updatedMember;
        }
      );
      setSplitType(transaction.splitType);
      setMembersList(updatedMembersList);
    }
  }, [open]);

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={() => setOpen(false)}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="flexbox-col m-2 w-full max-w-screen-md overflow-hidden rounded border-2 border-alice-accent bg-alice-main p-2 text-left align-middle shadow-xl transition-all">
                <div className="flexbox-row w-full p-2">
                  <button
                    className="custom-focus rounded bg-alice-accent p-2 px-3 text-alice-base shadow-md focus:bg-alice-accent/50 focus:text-black
                             focus:outline-alice-accent betterhover:hover:bg-alice-accent/90"
                    type="button"
                    onClick={() => setOpen(false)}
                  >
                    Back
                  </button>
                  <button
                    className="custom-focus rounded bg-alice-accent p-2 px-3 text-alice-base shadow-md focus:bg-alice-accent/50 focus:text-black
                             focus:outline-alice-accent betterhover:hover:bg-alice-accent/90"
                    type="button"
                    onClick={async (e) => {
                      const isDeleted = await handleTransactionDelete(
                        e,
                        group.groupId,
                        transaction.transactionId,
                        dispatch
                      );
                      if (isDeleted) {
                        setOpen(false);
                      }
                    }}
                  >
                    Delete
                  </button>
                </div>
                <form
                  className="flex w-full flex-col items-center"
                  onSubmit={(e) => {
                    handleTransactionUpdate(
                      e,
                      {
                        groupId: group.groupId,
                        transactionId: transaction.transactionId,
                        date: dateRef.current!.value,
                        description: descriptionRef.current!.value,
                        payerId,
                        totalCost,
                        membersList,
                        transactionType,
                        splitType,
                        currency: group.currency,
                      } as UpdateTransactionForm,
                      dispatch
                    );
                  }}
                >
                  <div className="flexbox-row w-full place-content-start gap-2 p-2">
                    <MemberSelection
                      currentMemberId={payerId}
                      members={membersList}
                      idNameMap={idNameMap}
                      setCurrentMemberId={setPayerId}
                    />
                    <Typography className="flexbox-col max-w-fit justify-center">
                      {getActionByTransactionType(transactionType)}
                    </Typography>
                    <ListboxSelection
                      options={['expense', 'loan', 'income']}
                      selection={transactionType}
                      setSelection={setTransactionType}
                      customWidth="w-28"
                    />
                  </div>
                  <div className="flexbox-col w-full space-y-4">
                    <div className="w-full rounded bg-alice-main p-2">
                      <label className="flex w-full flex-col" htmlFor="howMuch">
                        How much?
                        <input
                          className="custom-focus mt-2 rounded bg-alice-base p-2 focus:outline-alice-accent betterhover:hover:bg-alice-base/70 betterhover:hover:outline-alice-accent"
                          id="howMuch"
                          type="text"
                          placeholder="Amount"
                          required
                          value={displayWithCommas(totalCost.toFixed(2))}
                          onFocus={(e) => e.preventDefault()}
                          onChange={(e) =>
                            handleTotalCostInput(e, setTotalCost)
                          }
                        />
                      </label>
                    </div>

                    <div className="w-full rounded bg-alice-main p-2">
                      <label className="flex w-full flex-col" htmlFor="whatFor">
                        What for?
                        <input
                          className="custom-focus mt-2 rounded bg-alice-base p-2 focus:outline-alice-accent betterhover:hover:bg-alice-base/70"
                          id="whatFor"
                          type="text"
                          placeholder="Food"
                          required
                          ref={descriptionRef}
                          defaultValue={transaction.description}
                        />
                      </label>
                    </div>

                    <div className="w-full rounded bg-alice-main p-2">
                      <label className="flex w-full flex-col" htmlFor="when">
                        When?
                        <input
                          className="custom-focus mt-2 rounded bg-alice-base p-2 focus:outline-alice-accent betterhover:hover:bg-alice-base/70"
                          id="when"
                          type="date"
                          ref={dateRef}
                          defaultValue={getLocaleDateString(transaction.date)}
                          required
                        />
                      </label>
                    </div>
                  </div>
                  <div className="w-full py-2">
                    <div className="p-2">How to split?</div>
                    <TransactionContext.Provider value={contextValue}>
                      <MembersList />
                    </TransactionContext.Provider>
                  </div>
                  <div className="flexbox-row w-full p-2">
                    <button
                      className="custom-focus rounded bg-alice-accent p-2 px-3 text-alice-base shadow-md focus:bg-alice-accent/50 focus:text-black
                               focus:outline-alice-accent betterhover:hover:bg-alice-accent/90"
                      type="submit"
                    >
                      Update
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
