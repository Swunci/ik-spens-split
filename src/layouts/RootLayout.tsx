import BodyContainer from '@/components/shared/BodyContainer';
import Footer from '@/components/shared/Footer';
import Navbar from '@/components/shared/Navbar/Navbar';

import { Meta } from './Meta';

export default function RootLayout({ children }: { children: any }) {
  return (
    <div className="relative flex w-screen flex-col place-content-start items-center bg-alice-base">
      <Meta
        title="ShareCost - Simplify the splitting of group expenses"
        description="Split bills with friends and family without having to worry about “who owes who”.
        Your share cost will be automatically calculated based on your expenses. No registration required."
      />
      <Navbar />
      <BodyContainer>{children}</BodyContainer>
      <Footer />
    </div>
  );
}

export { RootLayout };
