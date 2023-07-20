import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import { useEffect } from 'react';

import NextApiClient from '@/utils/api/NextApiClient';

const nextApiClient = new NextApiClient().jsonBody();

export default function PaypalCheckout({ groupId }: { groupId: string }) {
  const showSpinner = true;
  const [{ options, isPending }, dispatch] = usePayPalScriptReducer();

  useEffect(() => {
    dispatch({
      type: 'resetOptions',
      value: {
        ...options,
      },
    });
  }, [showSpinner]);

  return (
    <>
      {showSpinner && isPending}
      <PayPalButtons
        style={{
          layout: 'vertical',
          height: 50,
        }}
        disabled={false}
        createOrder={async () => {
          const response = await nextApiClient.orders.create(groupId);
          if (response.ok) {
            const order = await response.json();
            return order.id;
          }
          return undefined;
        }}
        onApprove={async (data) => {
          const response = await nextApiClient.orders.capture(
            groupId,
            data.orderID
          );
          if (response.ok) {
            const order = await response.json();
            return order;
          }
          return undefined;
        }}
      />
    </>
  );
}
