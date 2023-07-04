import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/router';
import { useState } from 'react';
import useSwr from 'swr';

import type CustomError from '@/errors/customError';
import type {
  Group,
  PaidDebt,
  PaidDebtResponse,
  Transaction,
  TransactionResponse,
} from '@/interfaces/response';
import { RootLayout } from '@/layouts/RootLayout';
import { displayBackdrop } from '@/utils/component/helpers';
import { currencyCodeSymbolMap } from '@/utils/currencyUtil';
import { fetcher } from '@/utils/fetcherWrapper';
import { getLocaleDateString } from '@/utils/timeUtils';

export default function Transactions() {
  const router = useRouter();
  const currentPath = usePathname();

  const { group: groupId } = router.query;

  const [dataOwner, setDataOwner] = useState('all');
  const [dataType, setDataType] = useState('transactions');

  const currentMember =
    typeof window !== 'undefined'
      ? localStorage.getItem('currentMember') ?? ''
      : '';

  const { error: groupError, isLoading: isLoadingGroup } = useSwr<
    Group,
    CustomError
  >(() => (groupId ? `/api/groups/${groupId}` : null), fetcher);

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

  if (
    isLoadingTransactions ||
    isLoadingPaidDebts ||
    isLoadingGroup ||
    !currentPath
  ) {
    return displayBackdrop();
  }

  if (transactionsError || paidDebtsError || groupError) {
    if (groupError?.status === 404) {
      return router.push('/404');
    }
    return router.push('/500');
  }

  function getYourShare(split: string) {
    const splitObj = JSON.parse(split);
    return splitObj[currentMember]?.toFixed(2);
  }

  function getInvolvedMembers(split: string) {
    const splitObj = JSON.parse(split);
    const groupSize = parseInt(localStorage.getItem('groupSize') ?? '0', 10);
    const memberNames = [...Object.keys(splitObj)];
    return groupSize === memberNames.length
      ? 'everyone'
      : memberNames.join(', ');
  }

  function isMemberInvolved(split: string, memberName: string) {
    const splitObj: Object = JSON.parse(split);
    return memberName in splitObj;
  }

  function getTransactions() {
    if (transactionsData?.transactions.length === 0) {
      return <div>No transactions to show</div>;
    }

    return (
      <ul className="space-y-2">
        {transactionsData?.transactions
          .filter((transaction: Transaction) => {
            switch (dataOwner) {
              case 'yours':
                return isMemberInvolved(transaction.split, currentMember);
              case 'others':
                return !isMemberInvolved(transaction.split, currentMember);
              default:
                return true;
            }
          })
          .map((transaction: Transaction) => {
            return (
              <li
                className="flexbox-col w-full rounded bg-alice-base p-2 shadow-md"
                key={transaction.transactionId}
              >
                <Link
                  href={`${currentPath}/${transaction.transactionId}`}
                  passHref
                >
                  <div className="text-base">
                    <div>{`${
                      transaction.payer
                    } paid ${currencyCodeSymbolMap.get(transaction.currency)}${
                      transaction.amount
                    } for ${transaction.description}`}</div>
                  </div>
                  <div className="flexbox-row gap-2 pt-1">
                    <div className="text-xs">
                      People involved: {getInvolvedMembers(transaction.split)}.
                    </div>
                    <div className="text-xs">
                      {isMemberInvolved(transaction.split, currentMember)
                        ? `Your share: ${currencyCodeSymbolMap.get(
                            transaction.currency
                          )}${getYourShare(transaction.split)}`
                        : null}
                    </div>
                    <div className="min-w-fit text-xs">
                      {getLocaleDateString(transaction.date)}
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
      </ul>
    );
  }

  function getPaidDebts() {
    if (paidDebtsData?.paidDebts.length === 0) {
      return <div>No paid debts to show</div>;
    }

    return (
      <ul className="space-y-2">
        {paidDebtsData?.paidDebts
          .filter((paidDebt: PaidDebt) => {
            switch (dataOwner) {
              case 'yours':
                return (
                  paidDebt.creditor === currentMember ||
                  paidDebt.debtor === currentMember
                );
              case 'others':
                return (
                  paidDebt.creditor !== currentMember &&
                  paidDebt.debtor !== currentMember
                );
              default:
                return true;
            }
          })
          .map((paidDebt: PaidDebt) => {
            return (
              <li
                className="flexbox-col w-full rounded bg-alice-base p-2 shadow-md"
                key={paidDebt.debtId}
              >
                <Link
                  href={
                    currentPath
                      ? `${currentPath.slice(
                          0,
                          currentPath.lastIndexOf('/')
                        )}/debts/${paidDebt.debtId}`
                      : ''
                  }
                  passHref
                >
                  <div className="text-base">
                    {`${paidDebt.debtor} paid ${
                      paidDebt.creditor
                    } ${currencyCodeSymbolMap.get(paidDebt.currency)}${
                      paidDebt.amount
                    } on ${getLocaleDateString(paidDebt.date)}`}
                  </div>
                </Link>
              </li>
            );
          })}
      </ul>
    );
  }

  function renderByDataType() {
    switch (dataType) {
      case 'transactions':
        return getTransactions();
      case 'debts':
        return getPaidDebts();
      default:
        return <div>Nothing to see here</div>;
    }
  }
  return (
    <RootLayout>
      <div className="w-full p-2">
        <Link
          href={
            currentPath
              ? currentPath.substring(0, currentPath.lastIndexOf('/'))
              : ''
          }
          passHref
        >
          <button
            className="rounded bg-alice-accent p-2 px-3 text-alice-base shadow-md"
            type="button"
          >
            Back
          </button>
        </Link>
      </div>
      <div className="w-full p-2">
        <ToggleButtonGroup
          value={dataType}
          exclusive
          onChange={(_e, value) => {
            setDataType(value);
          }}
        >
          <ToggleButton value="transactions">Transactions</ToggleButton>
          <ToggleButton value="debts">Paid Debts</ToggleButton>
        </ToggleButtonGroup>
      </div>
      <div className="w-full p-2">
        <ToggleButtonGroup
          value={dataOwner}
          exclusive
          onChange={(_e, value) => {
            setDataOwner(value);
          }}
        >
          <ToggleButton value="all">All</ToggleButton>
          <ToggleButton value="yours">Yours</ToggleButton>
          <ToggleButton value="others">Others</ToggleButton>
        </ToggleButtonGroup>
      </div>
      <div className="flexbox-col h-full w-full space-y-2 rounded bg-alice-main p-2 py-4">
        {renderByDataType()}
      </div>
    </RootLayout>
  );
}
