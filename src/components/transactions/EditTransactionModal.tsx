import { Dialog, Transition } from '@headlessui/react';
import { FormControl, MenuItem, Select, Typography } from '@mui/material';
import type { Dispatch, SetStateAction } from 'react';
import React, { Fragment, useEffect, useRef, useState } from 'react';

import type {
  IMember,
  UpdateTransactionForm,
} from '@/components/new-transaction/helpers';
import {
  getActionByTransactionType,
  getInitialMemberList,
  handleHowMuch,
  handleTransactionDelete,
  handleTransactionUpdate,
} from '@/components/new-transaction/helpers';
import type { Group, Transaction } from '@/interfaces/response';
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
  const [totalCost, setTotalCost] = useState(transaction.amount);
  const [payer, setPayer] = useState(transaction.payer);
  const [transactionType, setTransactionType] = useState(transaction.type);
  const [membersList, setMembersList] = useState(
    getInitialMemberList(group.memberNames, transaction.type, transaction.payer)
  );
  const [amountError, setAmountError] = useState(false);
  const descriptionRef = useRef<HTMLInputElement>(null);
  const dateRef = useRef<HTMLInputElement>(null);
  const [currency, setCurrency] = useState(transaction.currency);

  const contextValue = React.useMemo(
    () => ({
      payer,
      setPayer,
      membersList,
      setMembersList,
      totalCost,
      setTotalCost,
      transactionType,
      setTransactionType,
      currency,
    }),
    [payer, membersList, totalCost, transactionType]
  );

  useEffect(() => {
    if (open) {
      setPayer(transaction.payer);
      setTotalCost(transaction.amount);
      setTransactionType(transaction.type);
      setCurrency(transaction.currency);
      const splitObj = JSON.parse(transaction.split);
      const updatedMembersList = membersList.map((member: IMember) => {
        const updatedMember = member;
        if (member.name in splitObj) {
          updatedMember.amount = splitObj[member.name];
        } else {
          updatedMember.isSelected = false;
          updatedMember.amount = 0;
        }
        return updatedMember;
      });
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
                <div className="w-full p-2">
                  <button
                    className="rounded bg-alice-accent p-2 px-3 text-alice-base shadow-md"
                    type="button"
                  >
                    Back
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
                        payer,
                        totalCost,
                        membersList,
                        transactionType,
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
                        defaultValue={transaction.payer}
                        onChange={(e) => setPayer(e.target.value)}
                      >
                        {group.memberNames.map((name: string) => {
                          return (
                            <MenuItem key={name} value={name}>
                              <Typography
                                className="whitespace-normal break-words"
                                noWrap
                              >
                                {name}
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
                          className={`mt-2 rounded bg-alice-base p-1 ${
                            amountError ? 'bg-red-300' : ''
                          }`}
                          id="howMuch"
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="Amount"
                          required
                          value={totalCost === 0 ? '' : totalCost}
                          defaultValue={transaction.amount}
                          onKeyDown={(e) => {
                            if (e.key.toLowerCase() === 'e') {
                              e.preventDefault();
                            }
                          }}
                          onChange={(e) =>
                            handleHowMuch(e, setTotalCost, setAmountError)
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
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
