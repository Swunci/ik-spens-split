import type { Transaction } from '@prisma/client';
import Joi from 'joi';
import type { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';

import type { TransactionCreation } from '@/interfaces/request';
import { prisma } from '@/prisma/db';

import validate from '../../../../middleware/validation';

const schema = Joi.object({
  groupId: Joi.string().required(),
  payer: Joi.string().required(),
  description: Joi.string().required(),
  amount: Joi.number().precision(2).required(),
  split: Joi.string().required(),
  type: Joi.string().required(),
  date: Joi.string().required(),
  currency: Joi.string().min(3).max(3).required(),
});

const router = createRouter<NextApiRequest, NextApiResponse>();

router
  .get(async (req: NextApiRequest, res: NextApiResponse) => {
    const params = req.query;
    const groupId = params.groupId ? (params.groupId as string) : '';
    const transactions: Transaction[] = await prisma.transaction.findMany({
      where: {
        groupId,
      },
      orderBy: [{ date: 'desc' }, { amount: 'desc' }],
    });
    res.status(200).json({ transactions });
  })
  .post(
    validate({ body: schema }),
    async (req: NextApiRequest, res: NextApiResponse) => {
      const body = req.body as TransactionCreation;
      const transaction: Transaction = await prisma.transaction
        .create({
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
