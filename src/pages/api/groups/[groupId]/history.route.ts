import type { History } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';

import { prisma } from '@/prisma/db';

const router = createRouter<NextApiRequest, NextApiResponse>();

router.get(async (req: NextApiRequest, res: NextApiResponse) => {
  const params = req.query;
  const groupId = params.groupId ? (params.groupId as string) : '';
  const history: History[] = await prisma.history.findMany({
    where: {
      groupId,
    },
    orderBy: { createdDate: 'desc' },
  });
  res.status(200).json({ history });
});

export default router.handler({
  onError: (err: any, _req, res) => {
    res.status(err.statusCode || 500).send({ message: err.message });
  },
});
