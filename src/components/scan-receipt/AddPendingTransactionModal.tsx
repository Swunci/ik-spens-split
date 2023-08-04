import { Dialog, Transition } from '@headlessui/react';
import { Alert, Snackbar } from '@mui/material';
import Decimal from 'decimal.js';
import type { Dispatch, SetStateAction } from 'react';
import { Fragment, useContext, useMemo, useReducer, useState } from 'react';
import Balancer from 'react-wrap-balancer';
import { v4 as uuid } from 'uuid';

import { handleTotalCostInput } from '@/pages/groups/[group]/new-transaction-helpers';
import type { PendingTransactionForm } from '@/pages/groups/[group]/scan-receipt-helpers';
import { handleCreatePendingTransaction } from '@/pages/groups/[group]/scan-receipt-helpers';
import { displayWithCommas } from '@/utils/currencyUtil';

import { PendingTransactionContext } from '../hooks/PendingTransactionContext';
import { ReceiptScanningContext } from '../hooks/ReceiptScanningContext';
import {
  ACTION_TYPES,
  initialState,
  snackbarReducer,
} from '../hooks/snackbarReducer';
import { getInitialMemberList } from './helpers';
import MembersList from './MemberList';
import type { PendingTransaction } from './PendingTransactionsList';

export default function AddPendingTransactionModal({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const receiptScanningContext = useContext(ReceiptScanningContext);

  const { group, transactions, setTransactions } = receiptScanningContext!;

  const [snackbarState, dispatch] = useReducer(snackbarReducer, initialState);

  const [splitType, setSplitType] = useState('Equal');

  const [membersList, setMembersList] = useState(
    getInitialMemberList(group.members, new Decimal(0))
  );

  const [totalCost, setTotalCost] = useState(new Decimal(0));
  const [description, setDescription] = useState('');

  const transaction = {} as PendingTransaction;
  transaction.amount = new Decimal(0);
  transaction.description = '';
  transaction.id = uuid();
  transaction.membersList = membersList;
  transaction.splitType = splitType;

  const contextValue = useMemo(
    () => ({
      splitType,
      setSplitType,
      membersList,
      setMembersList,
      transaction,
      totalCost,
      setTotalCost,
      description,
      setDescription,
    }),
    [splitType, membersList, transaction, totalCost, description]
  );

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
              <Dialog.Panel className="flexbox-col m-2 w-full max-w-screen-md overflow-hidden rounded border-2 border-alice-accent bg-alice-secondary p-2 text-left align-middle shadow-xl transition-all">
                <div className="flexbox-row w-full p-2">
                  <button
                    className="rounded bg-alice-accent p-2 px-3 text-alice-base shadow-md betterhover:hover:bg-alice-accent/90"
                    type="button"
                    onClick={() => setOpen(false)}
                  >
                    Back
                  </button>
                  <button
                    className="rounded bg-alice-accent p-2 px-3 text-alice-base shadow-md betterhover:hover:bg-alice-accent/90"
                    type="button"
                    onClick={(e) => {
                      handleCreatePendingTransaction(
                        e,
                        {
                          amount: totalCost,
                          description,
                          id: transaction.id,
                          splitType,
                          membersList,
                        } as PendingTransactionForm,
                        transactions,
                        setTransactions,
                        setOpen,
                        dispatch
                      );
                    }}
                  >
                    Create
                  </button>
                </div>
                <div className="flex w-full flex-col items-center">
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
                        />
                      </label>
                    </div>
                  </div>
                  <div className="w-full py-2">
                    <div className="p-2">How to split?</div>
                    <PendingTransactionContext.Provider value={contextValue}>
                      <MembersList />
                    </PendingTransactionContext.Provider>
                  </div>
                </div>
                <Snackbar
                  open={snackbarState.isOpen}
                  autoHideDuration={3000}
                  anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                  onClick={() => dispatch({ type: ACTION_TYPES.CLOSE })}
                  onClose={() => dispatch({ type: ACTION_TYPES.CLOSE })}
                >
                  {snackbarState.isOpen ? (
                    <Alert severity={snackbarState.alertType}>
                      <Balancer>{snackbarState.message}</Balancer>
                    </Alert>
                  ) : (
                    <div />
                  )}
                </Snackbar>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
