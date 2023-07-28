import Joi from 'joi';
import type { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';

import type { MemberCreation } from '@/interfaces/request';
import { prisma } from '@/prisma/db';

import validate from '../../../../middleware/validation';

const schema = Joi.object({
  groupId: Joi.string().min(36).max(36).required(),
  memberName: Joi.string().max(35).min(1),
});

const router = createRouter<NextApiRequest, NextApiResponse>();

router.post(
  validate({ body: schema }),
  async (req: NextApiRequest, res: NextApiResponse) => {
    const body = req.body as MemberCreation;
    let member = await prisma.member.findFirst({
      where: {
        ...body,
      },
    });
    if (member) {
      res.status(409).send(member);
      return;
    }
    member = await prisma.member
      .create({
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
        table: 'member',
        action: 'post',
        createdDate: new Date(),
        details: JSON.stringify(member),
      },
    });
    res.status(200).json(member);
  }
);

export default router.handler({
  onError: (err: any, _req, res) => {
    res.status(err.statusCode || 500).send({ message: err.message });
  },
});
