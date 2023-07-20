import Link from 'next/link';
import { useRouter } from 'next/router';
import Balancer from 'react-wrap-balancer';

import PaypalCheckout from '@/components/paypal/PaypalCheckout';
import { RootLayout } from '@/layouts/RootLayout';

const benefits = [
  'Receipt scanning feature to auto generate transactions',
  'Use multiple currencies and auto currency conversion',
  'Read-only access for group',
  'No ad banners',
  'Feature request',
];

export default function PaypalTestPage() {
  const router = useRouter();
  const groupId = router.query.group as string;

  return (
    <RootLayout>
      <div className="w-full py-2 md:px-2">
        <Link
          className="custom-focus rounded bg-alice-accent p-2 px-3 text-alice-base shadow-md focus:bg-alice-accent/50 focus:text-black
          focus:outline-alice-accent betterhover:hover:bg-alice-accent/90"
          type="button"
          href={`/groups/${groupId}`}
        >
          Back
        </Link>
      </div>
      <div className="mt-5 flex w-full max-w-screen-sm flex-col items-start space-y-4 rounded rounded-t-md bg-alice-main">
        <div className="w-full rounded-t-md bg-alice-accent p-2 py-3 text-center text-alice-base shadow-md">
          Group Upgrade
        </div>
        <div className="flexbox-row w-full justify-center">
          <div className="flexbox-col w-10/12 space-y-2 rounded bg-alice-base py-2">
            {benefits.map((benefit: string) => {
              return (
                <div key={benefit} className="w-full py-1 text-center">
                  <Balancer>{benefit}</Balancer>
                </div>
              );
            })}
          </div>
        </div>
        <div className="w-full p-2 px-10">
          <div className="w-full">
            <PaypalCheckout groupId={groupId} />
          </div>
        </div>
      </div>
    </RootLayout>
  );
}
