import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import { useEffect } from 'react';

import NextApiClient from '@/utils/api/NextApiClient';

const amount = '2';
const currency = 'USD';
const style = { layout: 'horizontal' };
const groupId = 'ded9b85a-4b61-4e1f-b04e-fad2c66372be';

const nextApiClient = new NextApiClient().jsonBody();

export default function PaypalCheckout() {
  const showSpinner = true;
  const [{ options, isPending }, dispatch] = usePayPalScriptReducer();

  useEffect(() => {
    dispatch({
      type: 'resetOptions',
      value: {
        ...options,
        currency,
      },
    });
  }, [currency, showSpinner]);

  return (
    <>
      {showSpinner && isPending}
      <PayPalButtons
        style={{
          layout: 'horizontal',
        }}
        disabled={false}
        forceReRender={[amount, currency, style]}
        fundingSource={undefined}
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
