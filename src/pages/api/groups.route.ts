import type { Group } from '@prisma/client';
import Joi from 'joi';
import type { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';

import { prisma } from '@/prisma/db';

import type { GroupCreation } from '../../interfaces/request';
import validate from '../../middleware/validation';

const schema = Joi.object({
  groupName: Joi.string().min(1).max(100).required(),
  currency: Joi.string().min(3).max(3).required(),
  members: Joi.array()
    .min(2)
    .items(Joi.string().max(35).min(1))
    .unique()
    .required(),
});

const router = createRouter<NextApiRequest, NextApiResponse>();

router
  .get(async (req: NextApiRequest, res: NextApiResponse) => {
    const groupIds = req.query.groupIds
      ? JSON.parse(req.query.groupIds as string)
      : new Array<string>();

    const groups: Group[] = await prisma.group
      .findMany({
        where: {
          groupId: {
            in: groupIds,
          },
        },
        include: {
          members: {
            select: {
              memberId: true,
              memberName: true,
            },
          },
        },
      })
      .catch(() => {
        throw Error('Database problem');
      });
    res.status(200).json({ groups });
  })
  .post(
    validate({ body: schema }),
    async (req: NextApiRequest, res: NextApiResponse) => {
      const { body }: { body: GroupCreation } = req;
      const members = body.members.map((memberName: string) => {
        return { memberName };
      });
      const group: Group = await prisma.group
        .create({
          data: {
            groupName: body.groupName,
            currency: body.currency,
            createdDate: new Date(),
            members: {
              createMany: {
                data: [...members],
              },
            },
          },
          include: {
            members: {
              select: {
                memberId: true,
                memberName: true,
              },
            },
          },
        })
        .catch((err) => {
          console.log(err);
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
