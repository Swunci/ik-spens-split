import PaypalCheckout from '@/components/paypal/PaypalCheckout';
import { RootLayout } from '@/layouts/RootLayout';

export default function PaypalTestPage() {
  return (
    <RootLayout>
      <div className="flex w-full flex-col items-start space-y-4 md:p-2">
        <PaypalCheckout />
      </div>
    </RootLayout>
  );
}
