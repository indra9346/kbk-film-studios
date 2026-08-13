import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Film, Compass, Sparkles, BookOpen, Clock, ShieldCheck, Menu, X, MessageCircle, Phone, ArrowRight, UserCheck } from 'lucide-react';
import { useStudio } from '../../context/StudioContext';
import { useAuth } from '../../context/AuthContext';

export const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { cms } = useStudio();
  const { isOwnerAuthenticated } = useAuth();

  // Close mobile drawer on route change automatically
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Services & Pricing', path: '/services' },
    { name: 'Explore Works', path: '/works' },
    { name: 'Testimonials', path: '/testimonials' },
    { name: 'Book Service', path: '/book' },
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const handleNavigate = (path: string) => {
    setMobileMenuOpen(false);
    navigate(path);
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-xl border-b border-gold/20 transition-all shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo & Brand Identity */}
            <Link
              to="/"
              onClick={() => handleNavigate('/')}
              className="flex items-center gap-3.5 group"
            >
              <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-gold p-0.5 shadow-gold transition-transform duration-300 group-hover:scale-105 bg-black flex items-center justify-center">
                <img
                  src="/assets/kbk-logo.jpg"
                  alt="KBK Films Logo"
                  className="w-full h-full object-contain rounded-full"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/assets/kbk-logo.jpg';
                  }}
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-serif text-xl sm:text-2xl font-bold tracking-wider gold-gradient-text uppercase">
                    KBK Films
                  </span>
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-gold animate-ping"></span>
                </div>
                <p className="text-[10px] text-ivory-400 uppercase tracking-widest font-medium">
                  Kurudi Bharath Kumar • Hindupur
                </p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
              {navLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => handleNavigate(link.path)}
                  className={`px-3.5 py-2 text-xs xl:text-sm font-medium tracking-wide transition-all rounded-xl ${
                    isActive(link.path)
                      ? 'text-gold bg-gold/15 border border-gold/40 shadow-gold-sm font-bold'
                      : 'text-ivory-300 hover:text-white hover:bg-surface-50/70 border border-transparent'
                  }`}
                >
                  {link.name}
                </button>
              ))}
            </nav>

            {/* Action CTAs */}
            <div className="hidden md:flex items-center gap-3">
              {/* Track My Service (Client Portal) */}
              <button
                onClick={() => handleNavigate('/track')}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs uppercase tracking-wider font-semibold rounded-xl border transition-all ${
                  location.pathname === '/track'
                    ? 'bg-gold text-black border-gold shadow-gold-md'
                    : 'bg-surface-100 text-ivory-200 border-gold/30 hover:border-gold hover:text-gold'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-gold" />
                <span>Track My Service</span>
              </button>

              {/* Direct WhatsApp Call */}
              <a
                href={`https://wa.me/91${cms?.whatsappNumber || '9346227894'}?text=Hi%20Bharath%20Kumar,%20I%20am%20interested%20in%20your%20video%20editing%20services%20for%20my%20event.`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-accent-emerald/15 border border-accent-emerald/40 text-accent-emerald hover:bg-accent-emerald/25 transition-all shadow-sm"
                title="Direct WhatsApp with Founder"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp</span>
              </a>

              {/* If Owner is already logged in, show quick Owner Space badge */}
              {isOwnerAuthenticated && (
                <button
                  onClick={() => handleNavigate('/owner-space')}
                  className="px-2.5 py-1.5 text-[11px] font-bold rounded-xl bg-gold/20 text-gold border border-gold/40 hover:bg-gold hover:text-black transition-all flex items-center gap-1"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Owner Space</span>
                </button>
              )}
            </div>

            {/* Mobile Header Quick Actions & Menu Toggle Button */}
            <div className="flex lg:hidden items-center gap-2">
              <button
                onClick={() => handleNavigate('/track')}
                className="px-3 py-1.5 text-[11px] font-semibold rounded-lg border border-gold/40 text-gold bg-gold/10 flex items-center gap-1"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Track</span>
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2.5 rounded-xl text-gold hover:text-white bg-surface-100 border border-gold/30 shadow-sm transition-all focus:outline-none"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Drawer Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-surface-200/98 backdrop-blur-2xl border-b border-gold/30 px-5 pt-4 pb-8 space-y-4 shadow-2xl animate-fadeIn">
            <div className="space-y-1.5">
              {navLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => handleNavigate(link.path)}
                  className={`w-full text-left flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    isActive(link.path)
                      ? 'text-gold bg-gold/15 border border-gold/40 font-bold shadow-gold-sm'
                      : 'text-ivory-200 hover:bg-surface-100 hover:text-white border border-transparent'
                  }`}
                >
                  <span>{link.name}</span>
                  {isActive(link.path) && <ArrowRight className="w-4 h-4 text-gold" />}
                </button>
              ))}
            </div>

            <div className="pt-4 border-t border-surface-50 flex flex-col gap-2.5">
              <button
                onClick={() => handleNavigate('/track')}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gold text-black font-bold text-sm shadow-gold-sm hover:bg-gold-light transition-all"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Track My Service (Private Access)</span>
              </button>

              <a
                href={`https://wa.me/91${cms?.whatsappNumber || '9346227894'}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-accent-emerald/15 text-accent-emerald border border-accent-emerald/30 text-sm font-semibold hover:bg-accent-emerald/25 transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp: +91 {cms?.phone || '9346227894'}</span>
              </a>

              {isOwnerAuthenticated && (
                <button
                  onClick={() => handleNavigate('/owner-space')}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-surface-100 text-gold border border-gold/30 text-xs font-bold uppercase tracking-wider"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Enter Owner Space Console</span>
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Backdrop overlay for mobile menu */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="lg:hidden fixed inset-0 top-20 bg-black/60 backdrop-blur-sm z-40 animate-fadeIn"
          aria-hidden="true"
        />
      )}
    </>
  );
};

