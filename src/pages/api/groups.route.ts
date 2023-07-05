import type { Group } from '@prisma/client';
import Joi from 'joi';
import type { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';

import { prisma } from '@/prisma/db';

import validate from '../../middleware/validation';

const schema = Joi.object({
  groupName: Joi.string().required(),
  currency: Joi.string().min(3).max(3).required(),
  members: Joi.array().min(2).required(),
});

const router = createRouter<NextApiRequest, NextApiResponse>();

router.post(
  validate({ body: schema }),
  async (req: NextApiRequest, res: NextApiResponse) => {
    const { body } = req;
    const group: Group = await prisma.group
      .create({
        data: {
          groupName: body.groupName,
          currency: body.currency,
          memberNames: body.members,
          createdDate: new Date(),
        },
      })
      .catch(() => {
        throw Error('Database problem');
      });
    await prisma.history.create({
      data: {
        groupId: group.groupId,
        table: 'group',
        action: 'post',
        createdDate: new Date(),
        details: JSON.stringify(group),
      },
    });
    res.status(200).json(group);
  }
);

export default router.handler({
  onError: (err: any, _req, res) => {
    res.status(err.statusCode || 500).send({ message: err.message });
  },
});
