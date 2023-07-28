import BodyContainer from '@/components/shared/BodyContainer';
import Footer from '@/components/shared/Footer';
import Navbar from '@/components/shared/Navbar/Navbar';

import { Meta } from './Meta';

export default function RootLayout({ children }: { children: any }) {
  return (
    <div className="relative flex w-screen flex-col place-content-start items-center bg-alice-base">
      <Meta
        title="ShareCost"
        description="Effortless Expense Sharing with ShareCost | Split bills, manage group finances, and simplify multi-currency expenses.
        No registration required. Explore receipt scanning and automated currency conversion"
      />
      <Navbar />
      <BodyContainer>{children}</BodyContainer>
      <Footer />
    </div>
  );
}

export { RootLayout };
