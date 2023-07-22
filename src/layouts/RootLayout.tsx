import BodyContainer from '@/components/shared/BodyContainer';
import Footer from '@/components/shared/Footer';
import Navbar from '@/components/shared/Navbar/Navbar';

export default function RootLayout({ children }: { children: any }) {
  return (
    <div className="relative flex w-screen flex-col place-content-start items-center bg-alice-base">
      <Navbar />
      <BodyContainer>{children}</BodyContainer>
      <Footer />
    </div>
  );
}

export { RootLayout };
