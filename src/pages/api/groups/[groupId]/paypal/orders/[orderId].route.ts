import type { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';

import { prisma } from '@/prisma/db';

const router = createRouter<NextApiRequest, NextApiResponse>();

async function getPaypalAccessToken() {
  const auth = `${process.env.NEXT_PUBLIC_CLIENT_ID}:${process.env.CLIENT_SECRET}`;
  const data = 'grant_type=client_credentials';
  const response = await fetch(
    `${process.env.PAYPAL_API_URL}/v1/oauth2/token`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(auth).toString('base64')}`,
      },
      body: data,
    }
  );
  if (response.ok) {
    const body = await response.json();
    return body.access_token;
  }
  return '';
}
router.post(async (req: NextApiRequest, res: NextApiResponse) => {
  const params = req.query;
  const groupId = params.groupId ? (params.groupId as string) : '';
  const orderId = params.orderId ? (params.orderId as string) : '';

  const accessToken = await getPaypalAccessToken();
  const response = await fetch(
    `${process.env.PAYPAL_API_URL}/v2/checkout/orders/${orderId}/capture`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  if (response.ok) {
    const order = await response.json();
    res.status(200).json(order);
    await prisma.group.update({
      where: {
        groupId,
      },
      data: {
        level: 1,
      },
    });
    return;
  }
  res.status(500).send({ message: 'Error with paypal api' });
});

export default router.handler({
  onError: (err: any, _req, res) => {
    res.status(err.statusCode || 500).send({ message: err.message });
  },
});
