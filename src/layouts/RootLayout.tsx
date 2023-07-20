import BodyContainer from '@/components/shared/BodyContainer';
import Footer from '@/components/shared/Footer';
import Navbar from '@/components/shared/Navbar/Navbar';

import { Meta } from './Meta';

export default function RootLayout({ children }: { children: any }) {
  return (
    <div className="relative flex w-screen flex-col place-content-start items-center overflow-x-hidden bg-alice-base">
      <Meta
        title="GroupShare"
        description="Application for sharing group expenses"
      />
      <Navbar />
      <BodyContainer>{children}</BodyContainer>
      <Footer />
    </div>
  );
}

export { RootLayout };
