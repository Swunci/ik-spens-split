import Banner from '@/components/Banner';
import BodyContainer from '@/components/shared/BodyContainer';
import Footer from '@/components/shared/Footer';

export default function HomeLayout({ children }: { children: any }) {
  return (
    <div className="flex w-screen flex-col place-content-start items-center overflow-x-hidden bg-alice-base">
      <Banner />
      <BodyContainer>{children}</BodyContainer>
      <Footer />
    </div>
  );
}

export { HomeLayout };
