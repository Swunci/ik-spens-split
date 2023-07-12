import type { Group } from '@prisma/client';
import Joi from 'joi';
import type { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';

import type { GroupUpdate } from '@/interfaces/request';
import { prisma } from '@/prisma/db';

import validate from '../../../middleware/validation';

const schema = Joi.object({
  groupId: Joi.string().required(),
  groupName: Joi.string().required(),
  currency: Joi.string().min(3).max(3).required(),
});

const router = createRouter<NextApiRequest, NextApiResponse>();

router
  .get(async (req: NextApiRequest, res: NextApiResponse) => {
    const params = req.query;
    const groupId = params.groupId ? (params.groupId as string) : '';
    const group: Group | null = await prisma.group.findUnique({
      where: {
        groupId,
      },
      include: {
        members: {
          select: {
            memberId: true,
            memberName: true,
          },
        },
      },
    });
    if (!group) {
      return res.status(404).json({ message: 'Not found' });
    }
    return res.status(200).json(group);
  })
  .put(
    validate({ body: schema }),
    async (req: NextApiRequest, res: NextApiResponse) => {
      const body = req.body as GroupUpdate;
      const group: Group = await prisma.group
        .update({
          where: {
            groupId: body.groupId,
          },
          data: {
            ...body,
          },
        })
        .catch((_err) => {
          throw Error('Database problem');
        });
      await prisma.history.create({
        data: {
          groupId: body.groupId,
          table: 'group',
          action: 'put',
          createdDate: new Date(),
          details: JSON.stringify(group),
        },
      });
      res.status(200).json(group);
    }
  )
  .delete(async (req: NextApiRequest, res: NextApiResponse) => {
    const params = req.query;
    const groupId = params.groupId ? (params.groupId as string) : '';
    const deleted: Group = await prisma.group.delete({
      where: {
        groupId,
      },
    });
    res.status(200).json(deleted);
  });

export default router.handler({
  onError: (err: any, _req, res) => {
    res.status(err.statusCode || 500).send({ message: err.message });
  },
});
