import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import { Button, ToggleButton, ToggleButtonGroup } from '@mui/material';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import useSwr from 'swr';

import type CustomError from '@/errors/customError';
import type {
  PaidDebt,
  PaidDebtResponse,
  Transaction,
  TransactionResponse,
} from '@/interfaces/response';
import { RootLayout } from '@/layouts/RootLayout';
import { displayBackdrop } from '@/utils/component/helpers';
import { currencyCodeSymbolMap } from '@/utils/currencyUtil';
import { fetcher } from '@/utils/fetcherWrapper';

export default function Transactions() {
  const router = useRouter();
  const currentPath = usePathname();

  const [dataOwner, setDataOwner] = useState('all');
  const [dataType, setDataType] = useState('transactions');

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

  if (isLoadingTransactions || isLoadingPaidDebts) {
    return displayBackdrop();
  }

  if (transactionsError || paidDebtsError) {
    return router.push('/500');
  }

  function getTransactions() {
    if (transactionsData?.transactions.length === 0) {
      return <div>No transactions to show</div>;
    }

    return (
      <ul>
        {transactionsData?.transactions.map((transaction: Transaction) => {
          return (
            <li key={transaction.transactionId}>
              <div>{`${transaction.payer} paid ${currencyCodeSymbolMap.get(
                transaction.currency
              )}${transaction.amount} for ${transaction.description}`}</div>
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
      <ul>
        {paidDebtsData?.paidDebts.map((paidDebt: PaidDebt) => {
          return (
            <li key={paidDebt.debtId}>
              <div>
                {`${paidDebt.debtor} settled up with ${
                  paidDebt.creditor
                } for ${currencyCodeSymbolMap.get(paidDebt.currency)} ${
                  paidDebt.amount
                }`}
              </div>
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
      <div className="w-11/12 p-2">
        <Link
          href={
            currentPath
              ? currentPath.substring(0, currentPath.lastIndexOf('/'))
              : ''
          }
          passHref
        >
          <Button variant="outlined" startIcon={<ArrowBackIosIcon />}>
            Back
          </Button>
        </Link>
      </div>
      <div className="w-11/12 p-2">
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

      <div className="w-11/12 p-2">
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
      <div className="w-11/12 p-2">{renderByDataType()}</div>
    </RootLayout>
  );
}
