'use client';
import Header from '../components/Header';
import Footer from '../components/Footer';
import HallOfFameSection from '../components/HallOfFameSection';

export default function HallOfFamePage() {
  return (
    <>
      <Header />
      <div className="page-wrapper">
        <main className="main-content">
          <HallOfFameSection />
          <Footer />
        </main>
      </div>
    </>
  );
}
