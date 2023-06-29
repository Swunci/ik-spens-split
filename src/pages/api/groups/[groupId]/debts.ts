import type { PaidDebt } from '@prisma/client';
import Joi from 'joi';
import type { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';

import type { PaidDebtCreation } from '@/interfaces/request';
import { prisma } from '@/prisma/db';

import validate from '../../../../middleware/validation';

const schema = Joi.object({
  groupId: Joi.string().required(),
  creditor: Joi.string().required(),
  debtor: Joi.string().required(),
  amount: Joi.number().precision(2).required(),
  currency: Joi.string().min(3).max(3).required(),
});

const router = createRouter<NextApiRequest, NextApiResponse>();

router
  .get(async (req: NextApiRequest, res: NextApiResponse) => {
    const params = req.query;
    const groupId = params.groupId ? (params.groupId as string) : '';
    const paidDebts: PaidDebt[] = await prisma.paidDebt.findMany({
      where: {
        groupId,
      },
      orderBy: [{ date: 'desc' }, { amount: 'desc' }],
    });
    res.status(200).json({ paidDebts });
  })
  .post(
    validate({ body: schema }),
    async (req: NextApiRequest, res: NextApiResponse) => {
      const body = req.body as PaidDebtCreation;
      const paidDebt: PaidDebt = await prisma.paidDebt
        .create({
          data: {
            ...body,
          },
        })
        .catch((_err) => {
          throw Error('Database problem');
        });
      res.status(200).json(paidDebt);
    }
  );

export default router.handler({
  onError: (err: any, _req, res) => {
    res.status(err.statusCode || 500).send({ message: err.message });
  },
});
