import { Dialog, Transition } from '@headlessui/react';
import { FormControl, MenuItem, Select, Typography } from '@mui/material';
import Decimal from 'decimal.js';
import type { Dispatch, SetStateAction } from 'react';
import { Fragment, useEffect, useMemo, useRef, useState } from 'react';

import type {
  TransactionMember,
  UpdateTransactionForm,
} from '@/components/new-transaction/helpers';
import {
  getActionByTransactionType,
  getInitialMemberList,
  handleTotalCostInput,
  handleTransactionDelete,
  handleTransactionUpdate,
} from '@/components/new-transaction/helpers';
import type {
  Group,
  Member,
  ShareCost,
  Transaction,
} from '@/interfaces/response';
import { displayWithCommas } from '@/utils/currencyUtil';
import { getLocaleDateString } from '@/utils/timeUtils';

import type { ActionType } from '../hooks/snackbarReducer';
import { TransactionContext } from '../hooks/TransactionContext';
import MembersList from '../new-transaction/MemberList';

export default function EditDebtModal({
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
                    className="rounded bg-alice-accent p-2 px-3 text-alice-base shadow-md"
                    type="button"
                    onClick={() => setOpen(false)}
                  >
                    Back
                  </button>
                  <button
                    className="rounded bg-alice-accent p-2 px-3 text-alice-base shadow-md"
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
                    <FormControl
                      size="small"
                      fullWidth={false}
                      className="h-fit border-alice-main"
                    >
                      <Select
                        className="bg-alice-base py-0"
                        defaultValue={transaction.payerId}
                        onChange={(e) => setPayerId(e.target.value)}
                      >
                        {group.members.map((member: Member) => {
                          return (
                            <MenuItem
                              key={member.memberId}
                              value={member.memberId}
                            >
                              <Typography
                                className="whitespace-normal break-words"
                                noWrap
                              >
                                {member.memberName}
                              </Typography>
                            </MenuItem>
                          );
                        })}
                      </Select>
                    </FormControl>
                    <Typography className="flexbox-col max-w-fit justify-center">
                      {getActionByTransactionType(transactionType)}
                    </Typography>
                    <FormControl
                      size="small"
                      fullWidth={false}
                      className="h-fit border-alice-main"
                    >
                      <Select
                        className="bg-alice-base py-0"
                        defaultValue={transaction.type}
                        onChange={(e) => setTransactionType(e.target.value)}
                      >
                        <MenuItem value="expense">
                          <Typography
                            className="whitespace-normal break-words"
                            noWrap
                          >
                            expense
                          </Typography>
                        </MenuItem>
                        <MenuItem value="loan">
                          <Typography
                            className="whitespace-normal break-words"
                            noWrap
                          >
                            loan
                          </Typography>
                        </MenuItem>
                        <MenuItem value="income">
                          <Typography
                            className="whitespace-normal break-words"
                            noWrap
                          >
                            income
                          </Typography>
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </div>
                  <div className="flexbox-col w-full space-y-4">
                    <div className="w-full rounded bg-alice-main p-2">
                      <label className="flex w-full flex-col" htmlFor="howMuch">
                        How much?
                        <input
                          className="mt-2 rounded bg-alice-base p-1"
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
                          className="mt-2 rounded bg-alice-base p-1"
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
                          className="mt-2 rounded bg-alice-base p-1"
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
                      className="rounded bg-alice-accent p-2 px-3 text-alice-base shadow-md"
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
