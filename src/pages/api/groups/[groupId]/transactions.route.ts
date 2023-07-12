import type { Transaction } from '@prisma/client';
import Decimal from 'decimal.js';
import Joi from 'joi';
import type { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';

import type { ShareCost, TransactionCreation } from '@/interfaces/request';
import { prisma } from '@/prisma/db';

import validate from '../../../../middleware/validation';

const splitsSchema = Joi.object({
  memberId: Joi.string().min(36).max(36).required(),
  shareCost: Joi.number()
    .precision(18)
    .max(10 ** 9)
    .required(),
});

const schema = Joi.object({
  groupId: Joi.string().min(36).max(36).required(),
  payerId: Joi.string().min(36).max(36).required(),
  description: Joi.string().max(1000).required(),
  amount: Joi.number()
    .precision(18)
    .max(10 ** 9)
    .required(),
  splits: Joi.array().min(1).items(splitsSchema).required(),
  type: Joi.string().max(10).required(),
  date: Joi.string().required(),
  currency: Joi.string().min(3).max(3).required(),
});

const router = createRouter<NextApiRequest, NextApiResponse>();

function totalCostMatchesSplits(totalCost: Decimal, splits: Array<ShareCost>) {
  const sum = splits.reduce((total, split) => {
    return total.plus(split.shareCost);
  }, new Decimal(0));
  return totalCost.equals(sum);
}

router
  .get(async (req: NextApiRequest, res: NextApiResponse) => {
    const params = req.query;
    const groupId = params.groupId ? (params.groupId as string) : '';
    const transactions: Transaction[] = await prisma.transaction.findMany({
      where: {
        groupId,
      },
      orderBy: [{ date: 'desc' }],
      include: {
        shareCosts: {
          select: {
            memberId: true,
            shareCost: true,
          },
        },
      },
    });
    res.status(200).json({ transactions });
  })
  .post(
    validate({ body: schema }),
    async (req: NextApiRequest, res: NextApiResponse) => {
      const body = req.body as TransactionCreation;
      if (!totalCostMatchesSplits(new Decimal(body.amount), body.splits)) {
        res.status(400).json({ message: 'Your math is wrong' });
      }
      const transaction: Transaction = await prisma.transaction
        .create({
          data: {
            groupId: body.groupId,
            payerId: body.payerId,
            description: body.description,
            amount: body.amount,
            date: new Date(body.date),
            type: body.type,
            currency: body.currency,
            shareCosts: {
              createMany: {
                data: [...body.splits],
              },
            },
          },
          include: {
            shareCosts: true,
          },
        })
        .catch((_err) => {
          throw Error('Database problem');
        });
      await prisma.history.create({
        data: {
          groupId: body.groupId,
          table: 'transaction',
          action: 'post',
          createdDate: new Date(),
          details: JSON.stringify(transaction),
        },
      });
      res.status(200).json(transaction);
    }
  );

export default router.handler({
  onError: (err: any, _req, res) => {
    res.status(err.statusCode || 500).send({ message: err.message });
  },
});
