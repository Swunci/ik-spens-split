import type { Comment } from '@prisma/client';
import Joi from 'joi';
import type { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';

import type { CommentUpdate } from '@/interfaces/request';
import { prisma } from '@/prisma/db';

import validate from '../../../../../middleware/validation';

const schema = Joi.object({
  groupId: Joi.string().min(36).max(36).required(),
  commenterId: Joi.string().min(36).max(36).required(),
  commentId: Joi.string().min(36).max(36).required(),
  comment: Joi.string().max(1000).required(),
});

const router = createRouter<NextApiRequest, NextApiResponse>();

router
  .get(async (req: NextApiRequest, res: NextApiResponse) => {
    const params = req.query;
    const commentId = params.commentId ? (params.commentId as string) : '';
    const comment: Comment | null = await prisma.comment.findFirst({
      where: {
        commentId,
      },
    });
    if (!comment) {
      res.status(404).json({ message: 'Not found' });
      return;
    }
    res.status(200).json(comment);
  })
  .put(
    validate({ body: schema }),
    async (req: NextApiRequest, res: NextApiResponse) => {
      const body = req.body as CommentUpdate;
      const comment: Comment = await prisma.comment
        .update({
          where: {
            groupId_commentId: {
              groupId: body.groupId,
              commentId: body.commentId,
            },
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
          table: 'comment',
          action: 'put',
          createdDate: new Date(),
          details: JSON.stringify(comment),
        },
      });
      res.status(200).json(comment);
    }
  )
  .delete(async (req: NextApiRequest, res: NextApiResponse) => {
    const params = req.query;
    const groupId = params.groupId ? (params.groupId as string) : '';
    const commentId = params.commentId ? (params.commentId as string) : '';
    const deleted: Comment = await prisma.comment.delete({
      where: {
        commentId,
      },
    });
    await prisma.history.create({
      data: {
        groupId,
        table: 'comment',
        action: 'delete',
        createdDate: new Date(),
        details: JSON.stringify(deleted),
      },
    });
    res.status(200).json(deleted);
  });

export default router.handler({
  onError: (err: any, _req, res) => {
    res.status(err.statusCode || 500).send({ message: err.message });
  },
});
