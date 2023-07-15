import { Tab } from '@headlessui/react';
import CircularProgress from '@mui/material/CircularProgress';
import { usePathname } from 'next/navigation';
import type { Dispatch } from 'react';
import useSwr from 'swr';

import type CustomError from '@/errors/customError';
import type {
  Group,
  PaidDebt,
  PaidDebtResponse,
  Transaction,
  TransactionResponse,
} from '@/interfaces/response';
import {
  separatePaidDebts,
  separateTransactions,
} from '@/pages/groups/[group]/transactions-helper';
import { displaySnackbar } from '@/utils/component/helpers';
import { fetcher } from '@/utils/fetcherWrapper';

import type { ActionType } from '../hooks/snackbarReducer';
import PaidDebtsList from './PaidDebtsList';
import TransactionsList from './TransactionsList';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function TabSelection({
  currentMemberId,
  groupData,
  dispatch,
}: {
  currentMemberId: string;
  groupData: Group;
  dispatch: Dispatch<ActionType>;
}) {
  const currentPath = usePathname();

  const dataTypes = ['Transactions', 'Paid Debts'];
  const dataOwners = ['All', 'Yours', 'Others'];

  const {
    data: transactionsData,
    error: transactionsError,
    isLoading: isLoadingTransactions,
  } = useSwr<TransactionResponse, CustomError>(
    currentPath ? `/api${currentPath}` : null,
    fetcher
  );

  const {
    data: paidDebtsData,
    error: paidDebtsError,
    isLoading: isLoadingPaidDebts,
  } = useSwr<PaidDebtResponse, CustomError>(
    currentPath
      ? `/api${currentPath.slice(0, currentPath.lastIndexOf('/'))}/debts`
      : null,
    fetcher
  );

  function renderByDataType(
    dataType: string,
    transactions: Array<Transaction>,
    paidDebts: Array<PaidDebt>
  ) {
    switch (dataType) {
      case 'Transactions':
        return isLoadingTransactions ? (
          <div className="flex w-full place-content-evenly">
            <CircularProgress className="text-alice-accent" />
          </div>
        ) : (
          <TransactionsList
            transactions={transactions}
            currentMemberId={currentMemberId}
            group={groupData!}
            dispatch={dispatch}
          />
        );
      case 'Paid Debts':
        return isLoadingPaidDebts ? (
          <div className="flex w-full place-content-evenly">
            <CircularProgress className="text-alice-accent" />
          </div>
        ) : (
          <PaidDebtsList
            paidDebts={paidDebts}
            groupData={groupData!}
            dispatch={dispatch}
          />
        );
      default:
        return <div>Nothing to see here</div>;
    }
  }

  if (transactionsError || paidDebtsError) {
    return displaySnackbar(
      'Error fetching transactions, please try again later'
    );
  }

  const transactions = isLoadingTransactions
    ? []
    : [
        transactionsData!.transactions,
        ...separateTransactions(
          currentMemberId,
          transactionsData!.transactions
        ),
      ];

  const paidDebts = isLoadingPaidDebts
    ? []
    : [
        paidDebtsData!.paidDebts,
        ...separatePaidDebts(currentMemberId, paidDebtsData!.paidDebts),
      ];

  return (
    <div className="w-full space-y-2">
      <Tab.Group>
        <Tab.List className="flex space-x-1 rounded-md bg-alice-main p-1">
          {dataTypes.map((tabValue: string) => (
            <Tab
              key={tabValue}
              className={({ selected }) =>
                classNames(
                  'w-full rounded-md py-2.5 text-alice-accent border',
                  'ring-black ring-opacity-60 ring-offset-1 ring-offset-alice-accent focus:outline-none focus:ring-0',
                  selected
                    ? 'bg-alice-base text-alice-accent border-alice-accent'
                    : 'bg-alice-main text-black betterhover:hover:bg-alice-accent/70 betterhover:hover:text-alice-base border-alice-main'
                )
              }
            >
              {tabValue}
            </Tab>
          ))}
        </Tab.List>
        <Tab.Panels className="mt-2">
          {dataTypes.map((dataType: string) => (
            <Tab.Panel key={dataType}>
              <Tab.Group>
                <Tab.List className="flex space-x-1 rounded-md bg-alice-main p-1">
                  {dataOwners.map((dataOwner: string) => (
                    <Tab
                      key={dataOwner}
                      className={({ selected }) =>
                        classNames(
                          'w-full rounded-md py-2.5 text-alice-accent border',
                          'ring-black ring-opacity-60 ring-offset-1 ring-offset-alice-accent focus:outline-none focus:ring-0',
                          selected
                            ? 'bg-alice-base text-alice-accent border-alice-accent'
                            : 'bg-alice-main text-black betterhover:hover:bg-alice-accent/70 betterhover:hover:text-alice-base border-alice-main'
                        )
                      }
                    >
                      {dataOwner}
                    </Tab>
                  ))}
                </Tab.List>
                <Tab.Panels className="mt-2">
                  {dataOwners.map((dataOwner: string) => (
                    <Tab.Panel
                      key={dataOwner}
                      className={classNames(
                        'rounded-md bg-alice-main p-3',
                        'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2'
                      )}
                    >
                      {renderByDataType(
                        dataType,
                        transactions.at(dataOwners.indexOf(dataOwner))!,
                        paidDebts.at(dataOwners.indexOf(dataOwner))!
                      )}
                    </Tab.Panel>
                  ))}
                </Tab.Panels>
              </Tab.Group>
            </Tab.Panel>
          ))}
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
}
