import Header from './Header';
import Footer from './Footer';

interface PageLayoutProps {
  children: React.ReactNode;
}

export default function PageLayout({ children }: PageLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-white text-black">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
