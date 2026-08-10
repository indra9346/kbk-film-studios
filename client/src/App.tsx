import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StudioProvider } from './context/StudioContext';
import { AuthProvider } from './context/AuthContext';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { PricingClarificationModal } from './components/pricing/PricingClarificationModal';
import { TermsModal } from './components/pricing/TermsModal';

// Pages
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Services } from './pages/Services';
import { ExploreWorks } from './pages/ExploreWorks';
import { Testimonials } from './pages/Testimonials';
import { BookService } from './pages/BookService';
import { TrackService } from './pages/TrackService';
import { OwnerSpace } from './pages/OwnerSpace';

export function App() {
  return (
    <AuthProvider>
      <StudioProvider>
        <BrowserRouter>
          <div className="min-h-screen flex flex-col bg-background text-ivory-100 selection:bg-gold selection:text-black">
            <Header />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/services" element={<Services />} />
                <Route path="/works" element={<ExploreWorks />} />
                <Route path="/testimonials" element={<Testimonials />} />
                <Route path="/book" element={<BookService />} />
                <Route path="/track" element={<TrackService />} />
                <Route path="/owner-space" element={<OwnerSpace />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />

            {/* Global Interactive Modals */}
            <PricingClarificationModal />
            <TermsModal />
          </div>
        </BrowserRouter>
      </StudioProvider>
    </AuthProvider>
  );
}

export default App;
