import type { Comment } from '@prisma/client';
import Joi from 'joi';
import type { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';

import type { CommentCreation } from '@/interfaces/request';
import { prisma } from '@/prisma/db';

import validate from '../../../../middleware/validation';

const schema = Joi.object({
  groupId: Joi.string().min(36).max(36).required(),
  commenterId: Joi.string().min(36).max(36).required(),
  comment: Joi.string().max(1000).required(),
});

const router = createRouter<NextApiRequest, NextApiResponse>();

router
  .get(async (req: NextApiRequest, res: NextApiResponse) => {
    const params = req.query;
    const groupId = params.groupId ? (params.groupId as string) : '';
    const comments: Comment[] = await prisma.comment.findMany({
      where: {
        groupId,
      },
      orderBy: [{ createdDate: 'desc' }],
    });
    res.status(200).json({ comments });
  })
  .post(
    validate({ body: schema }),
    async (req: NextApiRequest, res: NextApiResponse) => {
      const body = req.body as CommentCreation;
      const comment: Comment = await prisma.comment
        .create({
          data: {
            ...body,
            createdDate: new Date(),
          },
        })
        .catch((_err) => {
          throw Error('Database problem');
        });
      await prisma.history.create({
        data: {
          groupId: body.groupId,
          table: 'comment',
          action: 'post',
          createdDate: new Date(),
          details: JSON.stringify(comment),
        },
      });
      res.status(200).json(comment);
    }
  );

export default router.handler({
  onError: (err: any, _req, res) => {
    res.status(err.statusCode || 500).send({ message: err.message });
  },
});
