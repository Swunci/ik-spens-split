import { Dialog, Transition } from '@headlessui/react';
import { Typography } from '@mui/material';
import Decimal from 'decimal.js';
import type { Dispatch, SetStateAction } from 'react';
import { Fragment, useContext, useState } from 'react';
import { mutate } from 'swr';

import type { Group, PaidDebt } from '@/interfaces/response';
import { handleTotalCostInput } from '@/pages/groups/[group]/new-transaction-helpers';
import { displayWithCommas } from '@/utils/currencyUtil';

import { MemberIdNameContext } from '../hooks/MemberIdNameContext';
import type { ActionType } from '../hooks/snackbarReducer';
import MemberSelection from '../shared/MemberSelection';
import type { UpdatePaidDebtForm } from './EditDebtModalHelpers';
import {
  handlePaidDebtDelete,
  handlePaidDebtUpdate,
} from './EditDebtModalHelpers';

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
  const [totalCost, setTotalCost] = useState(new Decimal(debtData.amount));

  const memberIdNameContext = useContext(MemberIdNameContext);

  const idNameMap = memberIdNameContext!.memberIdToNameMap;

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
              <Dialog.Panel className="flexbox-col m-2 min-h-96 w-full max-w-screen-md justify-start overflow-hidden rounded border-2 border-alice-accent bg-alice-main p-2 text-left align-middle shadow-xl transition-all">
                <div className="flexbox-row w-full p-2">
                  <button
                    className="custom-focus rounded bg-alice-accent p-2 px-3 text-alice-base shadow-md focus:bg-alice-accent/50 focus:text-black
                             focus:outline-alice-accent betterhover:hover:bg-alice-accent/90"
                    type="button"
                    onClick={() => setOpen(false)}
                  >
                    Close
                  </button>
                  <button
                    className="custom-focus rounded bg-alice-accent p-2 px-3 text-alice-base shadow-md focus:bg-alice-accent/50 focus:text-black
                             focus:outline-alice-accent betterhover:hover:bg-alice-accent/90"
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
                    <MemberSelection
                      currentMemberId={creditor}
                      members={groupData.members}
                      idNameMap={idNameMap}
                      setCurrentMemberId={setCreditor}
                    />
                    <Typography className="flexbox-col max-w-fit justify-center">
                      paid
                    </Typography>
                    <MemberSelection
                      currentMemberId={debtor}
                      members={groupData.members}
                      idNameMap={idNameMap}
                      setCurrentMemberId={setDebtor}
                    />
                  </div>

                  <div className="flexbox-col w-full space-y-4">
                    <div className="w-full rounded bg-alice-main p-2">
                      <label className="flex w-full flex-col" htmlFor="howMuch">
                        How much?
                        <input
                          className="custom-focus mt-2 rounded bg-alice-base p-2 focus:outline-alice-accent"
                          id="howMuch"
                          type="text"
                          placeholder="Amount"
                          required
                          value={displayWithCommas(totalCost.toFixed(2))}
                          onChange={(e) =>
                            handleTotalCostInput(e, setTotalCost)
                          }
                        />
                      </label>
                    </div>
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
