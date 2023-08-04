import Decimal from 'decimal.js';
import type { Dispatch, SetStateAction } from 'react';
import type { Scheduler } from 'tesseract.js';
import { v4 as uuid } from 'uuid';

import type { ActionType } from '@/components/hooks/snackbarReducer';
import { ACTION_TYPES } from '@/components/hooks/snackbarReducer';
import type { PendingTransaction } from '@/components/scan-receipt/PendingTransactionsList';
import type { ShareCost, TransactionCreation } from '@/interfaces/request';
import NextApiClient from '@/utils/api/NextApiClient';

import type { TransactionMember } from './new-transaction-helpers';
import { mathChecksOut } from './new-transaction-helpers';

export function handleFileInput(
  e: React.ChangeEvent<HTMLInputElement>,
  filePath: string,
  setFilePath: Dispatch<SetStateAction<string>>,
  setIsSupported: Dispatch<SetStateAction<boolean>>,
  setSelectedImage: Dispatch<SetStateAction<File | null>>
) {
  const file = e.target.files ? e.target.files[0]! : null;
  if (file) {
    setSelectedImage(file);
  }
  if (file && file.name.toLowerCase().match(/\.(bmp|jpg|jpeg|png|pbm|webp)$/)) {
    URL.revokeObjectURL(filePath);
    setFilePath(URL.createObjectURL(file));
    setIsSupported(true);
    return;
  }
  setIsSupported(false);
}

export function setPendingTransactions(
  text: string,
  setTransactions: Dispatch<SetStateAction<Array<PendingTransaction>>>
) {
  const lines = text.split(/\n/);

  const pendingTransactions = new Array<PendingTransaction>();

  lines.forEach((line: string) => {
    let amount = new Decimal(0);
    const description = line
      .split(' ')
      .map((word: string) => {
        if (word.includes('.')) {
          try {
            amount = new Decimal(word).toDecimalPlaces(2);
            return '';
          } catch (err) {
            return '';
          }
        }
        return word.trim();
      })
      .join(' ');
    if (
      !amount.equals(0) &&
      description !== '' &&
      !description.toLowerCase().includes('total')
    ) {
      pendingTransactions.push({
        amount,
        description: description
          .replace(/[&/\\#,+()$~%.'":*?<>{}]/g, '')
          .trim(),
        id: uuid(),
        splitType: 'Equal',
        membersList: new Array<TransactionMember>(),
      } as PendingTransaction);
    }
  });

  setTransactions(pendingTransactions);
}

export async function handleImageProcessing(
  e: React.MouseEvent,
  selectedImage: File | null,
  filePath: string,
  isSupported: boolean,
  scheduler: Scheduler,
  setIsProcessing: Dispatch<SetStateAction<boolean>>,
  setData: Dispatch<SetStateAction<string>>,
  setTransactions: Dispatch<SetStateAction<Array<PendingTransaction>>>,
  dispatch: Dispatch<ActionType>
) {
  e.preventDefault();
  if (selectedImage && isSupported) {
    setIsProcessing(true);
    await scheduler.addJob('recognize', filePath).then((x) => {
      setIsProcessing(false);
      setData(x.data.text);
      setPendingTransactions(x.data.text, setTransactions);
    });
  } else {
    dispatch({
      type: ACTION_TYPES.OPEN_WARNING,
      message: 'Only bmp, jpg, png, pbm, webp images are supported',
    });
  }
}

export interface MultiTransactionCreationForm {
  groupId: string;
  payerId: string;
  transactions: Array<PendingTransaction>;
  type: string;
  date: string;
  currency: string;
}

export async function handleCreateTransactions(
  e: React.MouseEvent,
  formDetails: MultiTransactionCreationForm,
  setTransactions: Dispatch<SetStateAction<Array<PendingTransaction>>>,
  dispatch: Dispatch<ActionType>
) {
  e.preventDefault();
  const { groupId } = formDetails;
  const { payerId } = formDetails;
  const { transactions } = formDetails;
  const { type } = formDetails;
  const { date } = formDetails;
  const { currency } = formDetails;

  const nextApiClient = new NextApiClient().jsonBody();

  const results: Array<string> = await Promise.all(
    transactions.map(async (transaction: PendingTransaction) => {
      if (
        transaction.amount.greaterThan(10 ** 9) ||
        transaction.amount.lessThanOrEqualTo(0) ||
        !mathChecksOut(transaction.membersList, transaction.amount)
      ) {
        return '';
      }

      const requestBody: TransactionCreation = {} as TransactionCreation;
      requestBody.groupId = groupId;
      requestBody.payerId = payerId;
      requestBody.type = type.toLowerCase();
      requestBody.date = date;
      requestBody.currency = currency;
      requestBody.splitType = transaction.splitType.toLowerCase();
      requestBody.amount = transaction.amount.toFixed(2);
      requestBody.description = transaction.description;
      requestBody.splits = transaction.membersList.map(
        (member: TransactionMember) => {
          return {
            memberId: member.memberId,
            shareCost: member.amount.toString(),
            weight: member.weight,
          } as ShareCost;
        }
      );
      requestBody.currency = currency;
      const response = await nextApiClient.transactions.create(requestBody);

      if (!response.ok) {
        return '';
      }
      return transaction.id;
    })
  );

  const successfullIds = new Set(results);
  const failedTransactions = transactions.filter(
    (transaction: PendingTransaction) => {
      return !successfullIds.has(transaction.id);
    }
  );
  setTransactions(failedTransactions);
  if (failedTransactions.length > 0) {
    dispatch({
      type: ACTION_TYPES.OPEN_ERROR,
      message: 'Failed to create some transactions',
    });
  } else {
    dispatch({
      type: ACTION_TYPES.OPEN_SUCCESS,
      message: 'Successfully created all transactions',
    });
  }
}

export function handleDeletePendingTransaction(
  e: React.MouseEvent,
  transaction: PendingTransaction,
  transactions: Array<PendingTransaction>,
  setTransactions: Dispatch<SetStateAction<Array<PendingTransaction>>>,
  setOpen: Dispatch<SetStateAction<boolean>>
) {
  e.preventDefault();
  const pendingTransactions = transactions.filter(
    (pendingTransaction: PendingTransaction) => {
      return pendingTransaction.id !== transaction.id;
    }
  );
  setTransactions(pendingTransactions);
  setOpen(false);
}

export interface PendingTransactionForm {
  description: string;
  amount: Decimal;
  id: string;
  splitType: string;
  membersList: Array<TransactionMember>;
}

export function handleCreatePendingTransaction(
  e: React.MouseEvent,
  formDetails: PendingTransactionForm,
  transactions: Array<PendingTransaction>,
  setTransactions: Dispatch<SetStateAction<Array<PendingTransaction>>>,
  setOpen: Dispatch<SetStateAction<boolean>>,
  dispatch: Dispatch<ActionType>
) {
  e.preventDefault();

  if (formDetails.amount.greaterThan(10 ** 9)) {
    dispatch({
      type: ACTION_TYPES.OPEN_WARNING,
      message: 'Maximum value is 1,000,000,000',
    });
    return;
  }
  const newPendingTransaction = {} as PendingTransaction;
  newPendingTransaction.amount = formDetails.amount;
  newPendingTransaction.description = formDetails.description;
  newPendingTransaction.id = formDetails.id;
  newPendingTransaction.membersList = formDetails.membersList;
  newPendingTransaction.splitType = formDetails.splitType;
  transactions.push(newPendingTransaction);
  setTransactions(transactions);
  setOpen(false);
}
