import { Dialog, Transition } from '@headlessui/react';
import Decimal from 'decimal.js';
import type { Dispatch, SetStateAction } from 'react';
import { Fragment, useContext, useRef, useState } from 'react';

import { handleTotalCostInput } from '@/components/new-transaction/helpers';
import { displayWithCommas } from '@/utils/currencyUtil';

import { PendingTransactionContext } from '../hooks/PendingTransactionContext';
import { ReceiptScanningContext } from '../hooks/ReceiptScanningContext';
import { handleDeletePendingTransaction } from './helpers';
import MembersList from './MemberList';

export default function EditPendingTransactionModal({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const pendingTransactionContext = useContext(PendingTransactionContext);
  const { transaction } = pendingTransactionContext!;

  const receiptScanningContext = useContext(ReceiptScanningContext);
  const { transactions, setTransactions } = receiptScanningContext!;

  const [totalCost, setTotalCost] = useState(new Decimal(transaction.amount));
  const descriptionRef = useRef<HTMLInputElement>(null);

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
                    className="rounded bg-alice-accent p-2 px-3 text-alice-base shadow-md betterhover:hover:bg-alice-accent/90"
                    type="button"
                    onClick={() => setOpen(false)}
                  >
                    Back
                  </button>
                  <button
                    className="rounded bg-alice-accent p-2 px-3 text-alice-base shadow-md betterhover:hover:bg-alice-accent/90"
                    type="button"
                    onClick={(e) =>
                      handleDeletePendingTransaction(
                        e,
                        transaction,
                        transactions,
                        setTransactions,
                        setOpen
                      )
                    }
                  >
                    Delete
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
                          ref={descriptionRef}
                          defaultValue={transaction.description}
                        />
                      </label>
                    </div>
                  </div>
                  <div className="w-full py-2">
                    <div className="p-2">How to split?</div>
                    <MembersList />
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
