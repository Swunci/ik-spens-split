import BodyContainer from '@/componenets/shared/BodyContainer';
import Footer from '@/componenets/shared/Footer';
import Navbar from '@/componenets/shared/Navbar';

export default function RootLayout({ children }: { children: any }) {
  return (
    <div className="flex w-screen flex-col place-content-start items-center overflow-x-hidden">
      <Navbar />
      <BodyContainer>{children}</BodyContainer>
      <Footer />
    </div>
  );
}

export { RootLayout };
