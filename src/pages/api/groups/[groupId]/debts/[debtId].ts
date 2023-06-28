import type { PaidDebt } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';

import { prisma } from '@/prisma/db';

const router = createRouter<NextApiRequest, NextApiResponse>();

router.delete(async (req: NextApiRequest, res: NextApiResponse) => {
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
