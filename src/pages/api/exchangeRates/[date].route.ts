import type { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';

const router = createRouter<NextApiRequest, NextApiResponse>();

router.get(async (req: NextApiRequest, res: NextApiResponse) => {
  const date = req.query.date ? (req.query.date as string) : '';
  const response = await fetch(
    `${process.env.EXCHANGE_RATES_API_URL}/api/exchangeRates/${date}`,
    {
      method: 'GET',
    }
  );
  if (!response || !response.ok) {
    res.status(500).send('Error');
    return;
  }
  const exchangeRates = await response.json();
  res.status(200).json(exchangeRates);
});

export default router.handler({
  onError: (err: any, _req, res) => {
    res.status(err.statusCode || 500).send({ message: err.message });
  },
});
