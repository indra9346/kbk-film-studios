import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Film, Compass, Sparkles, BookOpen, Clock, ShieldCheck, Menu, X, MessageCircle, Phone } from 'lucide-react';
import { useStudio } from '../../context/StudioContext';
import { useAuth } from '../../context/AuthContext';

export const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { cms } = useStudio();
  const { isOwnerAuthenticated } = useAuth();

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

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/85 backdrop-blur-xl border-b border-gold/15 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand Identity */}
          <Link to="/" className="flex items-center gap-3.5 group">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-gold p-0.5 shadow-gold transition-transform duration-300 group-hover:scale-105 bg-black flex items-center justify-center">
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
              <Link
                key={link.name}
                to={link.path}
                className={`px-3.5 py-2 text-xs xl:text-sm font-medium tracking-wide transition-all rounded-md ${
                  isActive(link.path)
                    ? 'text-gold bg-gold/10 border border-gold/30 shadow-gold-sm'
                    : 'text-ivory-300 hover:text-white hover:bg-surface-50/60'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Action CTAs */}
          <div className="hidden md:flex items-center gap-3">
            {/* Track My Service (Client Portal) */}
            <Link
              to="/track"
              className={`flex items-center gap-2 px-3.5 py-2 text-xs uppercase tracking-wider font-semibold rounded-lg border transition-all ${
                location.pathname === '/track'
                  ? 'bg-gold text-black border-gold shadow-gold-md'
                  : 'bg-surface-100 text-ivory-200 border-gold/30 hover:border-gold hover:text-gold'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-gold" />
              <span>Track My Service</span>
            </Link>

            {/* Direct WhatsApp Call */}
            <a
              href={`https://wa.me/91${cms?.whatsappNumber || '9346227894'}?text=Hi%20Bharath%20Kumar,%20I%20am%20interested%20in%20your%20video%20editing%20services%20for%20my%20event.`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-accent-emerald/15 border border-accent-emerald/40 text-accent-emerald hover:bg-accent-emerald/25 transition-all shadow-sm"
              title="Direct WhatsApp with Founder"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp</span>
            </a>

            {/* If Owner is already logged in, show quick Owner Space badge */}
            {isOwnerAuthenticated && (
              <Link
                to="/owner-space"
                className="px-2.5 py-1 text-[11px] font-bold rounded bg-gold/20 text-gold border border-gold/40 hover:bg-gold hover:text-black transition-all"
              >
                Owner Space
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              to="/track"
              className="px-2.5 py-1.5 text-[11px] font-semibold rounded border border-gold/40 text-gold bg-gold/5"
            >
              Track
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-ivory-300 hover:text-white bg-surface-100 border border-gold/20"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-surface-200 border-b border-gold/20 px-4 pt-3 pb-6 space-y-3 animate-fadeIn">
          <div className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-2.5 rounded-lg text-sm font-medium ${
                  isActive(link.path)
                    ? 'text-gold bg-gold/10 font-bold border border-gold/30'
                    : 'text-ivory-200 hover:bg-surface-100'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="pt-3 border-t border-surface-50 flex flex-col gap-2">
            <Link
              to="/track"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-gold text-black font-semibold text-sm shadow-gold-sm"
            >
              <ShieldCheck className="w-4 h-4" />
              Track My Service (Private Access)
            </Link>
            <a
              href={`https://wa.me/91${cms?.whatsappNumber || '9346227894'}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-accent-emerald/20 text-accent-emerald border border-accent-emerald/30 text-sm font-medium"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp: +91 {cms?.phone || '9346227894'}
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
