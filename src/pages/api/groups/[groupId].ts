import type { Group } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';

import { prisma } from '@/prisma/db';

const router = createRouter<NextApiRequest, NextApiResponse>();

router
  .get(async (req: NextApiRequest, res: NextApiResponse) => {
    const params = req.query;
    const groupId = params.groupId ? (params.groupId as string) : '';
    const group: Group = await prisma.group.findUniqueOrThrow({
      where: {
        groupId,
      },
    });
    res.status(200).json(group);
  })
  .put((_req: NextApiRequest, res: NextApiResponse) => {
    res.status(200).json({});
  });

export default router.handler({
  onError: (err: any, _req, res) => {
    res.status(err.statusCode || 500).send({ message: err.message });
  },
});
