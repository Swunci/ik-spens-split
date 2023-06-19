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

router
  .get((_req: NextApiRequest, res: NextApiResponse) => {
    res.status(200).json({});
  })
  .put((_req: NextApiRequest, res: NextApiResponse) => {
    res.status(200).json({});
  })
  .post(
    validate({ body: schema }),
    async (req: NextApiRequest, res: NextApiResponse) => {
      const { body } = req;
      const group: Group | void = await prisma.group
        .create({
          data: {
            groupName: body.groupName,
            currency: body.currency,
            memberNames: body.members,
          },
        })
        .catch(() => {
          throw Error('Database problem');
        });
      if (!group) {
        throw Error();
      }
      res.status(200).json(group);
    }
  );

export default router.handler({
  onError: (err: any, _req, res) => {
    res.status(err.statusCode || 500).end(err.message);
  },
});
