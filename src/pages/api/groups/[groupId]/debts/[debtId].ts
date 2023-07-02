import type { PaidDebt } from '@prisma/client';
import Joi from 'joi';
import type { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';

import type { PaidDebtUpdate } from '@/interfaces/request';
import { prisma } from '@/prisma/db';

import validate from '../../../../../middleware/validation';

const schema = Joi.object({
  groupId: Joi.string().required(),
  debtId: Joi.string().required(),
  creditor: Joi.string().required(),
  debtor: Joi.string().required(),
  amount: Joi.number().precision(2).required(),
});

const router = createRouter<NextApiRequest, NextApiResponse>();

router
  .get(async (req: NextApiRequest, res: NextApiResponse) => {
    const params = req.query;
    const debtId = params.debtId ? (params.debtId as string) : '';
    const paidDebt: PaidDebt | null = await prisma.paidDebt.findFirst({
      where: {
        debtId,
      },
    });
    if (!paidDebt) {
      res.status(404).json({ message: 'Not found' });
      return;
    }
    res.status(200).json(paidDebt);
  })
  .put(
    validate({ body: schema }),
    async (req: NextApiRequest, res: NextApiResponse) => {
      const body = req.body as PaidDebtUpdate;
      const paidDebt: PaidDebt = await prisma.paidDebt
        .update({
          where: {
            groupId_debtId: {
              groupId: body.groupId,
              debtId: body.debtId,
            },
          },
          data: {
            ...body,
          },
        })
        .catch((_err) => {
          throw Error('Database problem');
        });
      res.status(200).json(paidDebt);
    }
  )
  .delete(async (req: NextApiRequest, res: NextApiResponse) => {
    const params = req.query;
    const debtId = params.debtId ? (params.debtId as string) : '';
    const deleted: PaidDebt = await prisma.paidDebt.delete({
      where: {
        debtId,
      },
    });
    res.status(200).json(deleted);
  });

export default router.handler({
  onError: (err: any, _req, res) => {
    res.status(err.statusCode || 500).send({ message: err.message });
  },
});
