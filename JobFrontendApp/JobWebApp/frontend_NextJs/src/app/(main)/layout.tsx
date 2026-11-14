import Footer from '@/components/footer/Footer';
import Header from '@/components/header/Header';

/** Every page except login/signup gets the header and footer. */
export default function MainLayout({ children }: LayoutProps<'/'>) {
  return (
    <div className="relative overflow-hidden">
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
