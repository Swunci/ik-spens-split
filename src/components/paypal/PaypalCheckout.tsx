import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import NextApiClient from '@/utils/api/NextApiClient';

const nextApiClient = new NextApiClient().jsonBody();

export default function PaypalCheckout({ groupId }: { groupId: string }) {
  const router = useRouter();
  const showSpinner = true;
  const [{ options, isPending }, dispatch] = usePayPalScriptReducer();
  const [isApproved, setIsApproved] = useState(false);

  useEffect(() => {
    dispatch({
      type: 'resetOptions',
      value: {
        ...options,
      },
    });
  }, [showSpinner]);

  if (isApproved) {
    router.push(`/groups/${groupId}`);
  }
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
            setIsApproved(true);
            return order;
          }
          return undefined;
        }}
      />
    </>
  );
}
