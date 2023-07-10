import { Dialog, Transition } from '@headlessui/react';
import { FormControl, MenuItem, Select, Typography } from '@mui/material';
import type { Dispatch, SetStateAction } from 'react';
import { Fragment, useState } from 'react';
import { mutate } from 'swr';

import type { UpdatePaidDebtForm } from '@/components/new-transaction/helpers';
import {
  handlePaidDebtDelete,
  handlePaidDebtUpdate,
} from '@/components/new-transaction/helpers';
import type { Group, PaidDebt } from '@/interfaces/response';
import { getDecimalPrecisionCurrency } from '@/utils/currencyUtil';

import type { ActionType } from '../hooks/snackbarReducer';

export default function EditDebtModal({
  open,
  setOpen,
  groupData,
  debtData,
  dispatch,
}: {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  groupData: Group;
  debtData: PaidDebt;
  dispatch: Dispatch<ActionType>;
}) {
  const [creditor, setCreditor] = useState(debtData.creditor);
  const [debtor, setDebtor] = useState(debtData.debtor);
  const [totalCost, setTotalCost] = useState(debtData.amount);

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={() => setOpen(false)}>
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
                    onClick={() => setOpen(false)}
                  >
                    Close
                  </button>
                </div>
                <form
                  className="flex w-full flex-col items-center"
                  onSubmit={(e) => {
                    handlePaidDebtUpdate(
                      e,
                      {
                        groupId: groupData!.groupId,
                        debtId: debtData!.debtId,
                        creditor,
                        debtor,
                        amount: totalCost,
                      } as UpdatePaidDebtForm,
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
                        onChange={(e) => setDebtor(e.target.value)}
                        value={debtor}
                      >
                        {groupData!.memberNames
                          .filter((name: string) => {
                            return name !== creditor;
                          })
                          .map((member: string) => {
                            return (
                              <MenuItem key={member} value={member}>
                                <Typography
                                  className="whitespace-normal break-words"
                                  noWrap
                                >
                                  {member}
                                </Typography>
                              </MenuItem>
                            );
                          })}
                      </Select>
                    </FormControl>
                    <Typography className="flexbox-col max-w-fit justify-center">
                      paid
                    </Typography>
                    <FormControl
                      size="small"
                      fullWidth={false}
                      className="h-fit border-alice-main"
                    >
                      <Select
                        className="bg-alice-base py-0"
                        onChange={(e) => {
                          setCreditor(e.target.value);
                        }}
                        value={creditor}
                      >
                        {groupData!.memberNames
                          .filter((name: string) => {
                            return name !== debtor;
                          })
                          .map((member: string) => {
                            return (
                              <MenuItem key={member} value={member}>
                                <Typography
                                  className="whitespace-normal break-words"
                                  noWrap
                                >
                                  {member}
                                </Typography>
                              </MenuItem>
                            );
                          })}
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
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="Amount"
                          required
                          value={totalCost === 0 ? '' : totalCost}
                          onKeyDown={(e) => {
                            if (e.key.toLowerCase() === 'e') {
                              e.preventDefault();
                            }
                          }}
                          onChange={(e) =>
                            setTotalCost(
                              e.target.valueAsNumber
                                ? getDecimalPrecisionCurrency(
                                    e.target.valueAsNumber,
                                    2
                                  )
                                : 0
                            )
                          }
                        />
                      </label>
                    </div>
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
                        const isDeleted = await handlePaidDebtDelete(
                          e,
                          groupData!.groupId,
                          debtData!.debtId,
                          dispatch
                        );
                        if (isDeleted) {
                          mutate(`/api/groups/${groupData.groupId}/debts`);
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
