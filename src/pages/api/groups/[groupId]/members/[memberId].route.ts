import Joi from 'joi';
import type { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';

import type { MemberUpdate } from '@/interfaces/request';
import { prisma } from '@/prisma/db';

import validate from '../../../../../middleware/validation';

const router = createRouter<NextApiRequest, NextApiResponse>();

const schema = Joi.object({
  groupId: Joi.string().min(36).max(36).required(),
  memberName: Joi.string().max(35).min(1),
  memberId: Joi.string().min(36).max(36).required(),
});

router
  .put(
    validate({ body: schema }),
    async (req: NextApiRequest, res: NextApiResponse) => {
      const body = req.body as MemberUpdate;
      const member = await prisma.member.update({
        where: {
          memberId: body.memberId,
        },
        data: {
          memberName: body.memberName,
        },
      });
      res.status(200).send(member);
    }
  )
  .delete(async (req: NextApiRequest, res: NextApiResponse) => {
    const params = req.query;
    const groupId = params.groupId ? (params.groupId as string) : '';
    const memberId = params.memberId ? (params.memberId as string) : '';
    const transactions = await prisma.transaction.findFirst({
      where: {
        payerId: memberId,
      },
    });
    const shareCosts = await prisma.shareCost.findFirst({
      where: {
        memberId,
      },
    });
    const paidDebts = await prisma.paidDebt.findFirst({
      where: {
        OR: [{ debtor: memberId }, { creditor: memberId }],
      },
    });
    const numOfMembers = await prisma.member.findMany({
      where: {
        groupId,
      },
    });
    if (transactions || shareCosts || paidDebts || numOfMembers.length === 2) {
      res.status(403).send({});
      return;
    }
    const member = await prisma.member
      .delete({
        where: {
          memberId,
        },
      })
      .catch((_err) => {
        throw Error('Database problem');
      });
    await prisma.history.create({
      data: {
        groupId: member.groupId,
        table: 'member',
        action: 'delete',
        createdDate: new Date(),
        details: JSON.stringify(member),
      },
    });
    res.status(200).json(member);
  });

export default router.handler({
  onError: (err: any, _req, res) => {
    res.status(err.statusCode || 500).send({ message: err.message });
  },
});
