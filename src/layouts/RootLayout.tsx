import BodyContainer from '@/components/shared/BodyContainer';
import Footer from '@/components/shared/Footer';
import Navbar from '@/components/shared/Navbar/Navbar';

import { Meta } from './Meta';

export default function RootLayout({ children }: { children: any }) {
  return (
    <div className="relative flex w-screen flex-col place-content-start items-center bg-alice-base">
      <Meta
        title="ShareCost - Split expenses easily"
        description="Split bills/expenses with friends and family without having to worry about “who owes who”.
        Your cost will be automatically calculated based on your expenses. No registration required. Splitwise Kittysplit Spliito share cost app split expense"
      />
      <Navbar />
      <BodyContainer>{children}</BodyContainer>
      <Footer />
    </div>
  );
}

export { RootLayout };
