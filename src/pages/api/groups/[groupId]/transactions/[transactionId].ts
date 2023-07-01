import type { Transaction } from '@prisma/client';
import Joi from 'joi';
import type { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';

import type { TransactionUpdate } from '@/interfaces/request';
import { prisma } from '@/prisma/db';

import validate from '../../../../../middleware/validation';

const schema = Joi.object({
  transactionId: Joi.string().required(),
  payer: Joi.string().required(),
  description: Joi.string().required(),
  amount: Joi.number().precision(2).required(),
  split: Joi.string().required(),
  type: Joi.string().required(),
  date: Joi.string().required(),
});

const router = createRouter<NextApiRequest, NextApiResponse>();

router
  .get(async (req: NextApiRequest, res: NextApiResponse) => {
    const params = req.query;
    const transactionId = params.transactionId
      ? (params.transactionId as string)
      : '';
    const transaction: Transaction | null = await prisma.transaction.findUnique(
      {
        where: {
          transactionId,
        },
      }
    );
    if (!transaction) {
      return res.status(404).json({ message: 'Not found' });
    }
    return res.status(200).json(transaction);
  })
  .put(
    validate({ body: schema }),
    async (req: NextApiRequest, res: NextApiResponse) => {
      const body = req.body as TransactionUpdate;
      const transaction: Transaction = await prisma.transaction
        .update({
          where: {
            groupId_transactionId: {
              groupId: body.groupId,
              transactionId: body.transactionId,
            },
          },
          data: {
            ...body,
            date: new Date(body.date),
          },
        })
        .catch((_err) => {
          throw Error('Database problem');
        });
      res.status(200).json(transaction);
    }
  );

export default router.handler({
  onError: (err: any, _req, res) => {
    res.status(err.statusCode || 500).send({ message: err.message });
  },
});
