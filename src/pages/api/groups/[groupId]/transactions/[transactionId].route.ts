import type { Transaction } from '@prisma/client';
import Joi from 'joi';
import type { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';

import type { TransactionUpdate } from '@/interfaces/request';
import { prisma } from '@/prisma/db';

import validate from '../../../../../middleware/validation';

const splitsSchema = Joi.object({
  memberId: Joi.string().min(36).max(36).required(),
  shareCost: Joi.number()
    .precision(18)
    .max(10 ** 9)
    .required(),
  weight: Joi.number().precision(0).required(),
});

const schema = Joi.object({
  groupId: Joi.string().min(36).max(36).required(),
  transactionId: Joi.string().min(36).max(36).required(),
  payerId: Joi.string().min(36).max(36).required(),
  description: Joi.string().max(1000).required(),
  amount: Joi.number()
    .precision(18)
    .max(10 ** 9)
    .greater(0)
    .required(),
  splits: Joi.array().min(1).items(splitsSchema).required(),
  type: Joi.string().max(10).required(),
  splitType: Joi.string().max(10).required(),
  date: Joi.string().required(),
  currency: Joi.string().min(3).max(3).required(),
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
        include: {
          shareCosts: {
            select: {
              memberId: true,
              shareCost: true,
              weight: true,
            },
          },
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
      const [, transaction] = await prisma
        .$transaction([
          prisma.shareCost.deleteMany({
            where: {
              transactionId: body.transactionId,
            },
          }),
          prisma.transaction.update({
            where: {
              groupId_transactionId: {
                groupId: body.groupId,
                transactionId: body.transactionId,
              },
            },
            data: {
              groupId: body.groupId,
              payerId: body.payerId,
              description: body.description,
              amount: body.amount,
              date: new Date(body.date),
              type: body.type,
              splitType: body.splitType,
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
          }),
        ])
        .catch((_err) => {
          throw Error('Database problem');
        });
      await prisma.history.create({
        data: {
          groupId: body.groupId,
          table: 'transaction',
          action: 'put',
          createdDate: new Date(),
          details: JSON.stringify(transaction),
        },
      });
      res.status(200).json(transaction);
    }
  )
  .delete(async (req: NextApiRequest, res: NextApiResponse) => {
    const params = req.query;
    const groupId = params.groupId ? (params.groupId as string) : '';
    const transactionId = params.transactionId
      ? (params.transactionId as string)
      : '';
    const deleted: Transaction = await prisma.transaction
      .delete({
        where: {
          transactionId,
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
        groupId,
        table: 'transaction',
        action: 'delete',
        createdDate: new Date(),
        details: JSON.stringify(deleted),
      },
    });
    res.status(200).json(deleted);
  });

export default router.handler({
  onError: (err: any, _req, res) => {
    res.status(err.statusCode || 500).send({ message: err.message });
  },
});
