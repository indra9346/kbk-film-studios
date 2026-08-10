import React from 'react';
import { Link } from 'react-router-dom';
import { Film, Shield, Award, GraduationCap, Phone, Mail, MapPin, Instagram, Youtube, Facebook, ArrowUpRight, Lock } from 'lucide-react';
import { useStudio } from '../../context/StudioContext';

export const Footer: React.FC = () => {
  const { cms, setIsTermsModalOpen } = useStudio();

  return (
    <footer className="bg-surface-300 border-t border-gold/20 pt-16 pb-12 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-gold/5 blur-[100px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 pb-12 border-b border-surface-50">
          {/* Column 1: Studio Identity & Credentials */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border border-gold/50 overflow-hidden shadow-gold-sm">
                <img src="/assets/kbk-logo.jpg" alt="KBK Logo" className="w-full h-full object-cover" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-base text-gold tracking-wider uppercase">KBK Films</h4>
                <p className="text-[11px] text-ivory-400">Post-Production & Color Science</p>
              </div>
            </div>

            <p className="text-xs text-ivory-300 leading-relaxed">
              Crafting cinematic wedding stories and emotional keepsakes with state-of-the-art color grading, rhythmic soundscapes, and strict client data isolation.
            </p>

            <div className="pt-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-100 border border-gold/25 text-[11px] text-ivory-200">
                <GraduationCap className="w-3.5 h-3.5 text-gold shrink-0" />
                <span>B.Com (Comp. Apps), SKU • MBA (2nd Yr)</span>
              </div>
            </div>
          </div>

          {/* Column 2: Specialized Editing Services */}
          <div>
            <h4 className="font-serif font-semibold text-sm text-ivory-100 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Film className="w-4 h-4 text-gold" />
              Specialized Services
            </h4>
            <ul className="space-y-2.5 text-xs text-ivory-300">
              <li><Link to="/services" className="hover:text-gold transition-colors">Pre-Wedding Video Editing</Link></li>
              <li><Link to="/services" className="hover:text-gold transition-colors">Wedding Video Highlights</Link></li>
              <li><Link to="/services" className="hover:text-gold transition-colors">Haldi & Sangeeth Ceremonies</Link></li>
              <li><Link to="/services" className="hover:text-gold transition-colors">Spot Editing Available (Same-Day)</Link></li>
              <li><Link to="/services" className="hover:text-gold transition-colors">Maternity & Baby Ceremonies</Link></li>
              <li><Link to="/services" className="hover:text-gold transition-colors">Cinematic Teasers & Reels (9:16)</Link></li>
              <li><Link to="/services" className="hover:text-gold transition-colors text-gold/80 font-medium">Upcoming: AI Video & 3D Animation</Link></li>
            </ul>
          </div>

          {/* Column 3: Client Security & Transparency */}
          <div>
            <h4 className="font-serif font-semibold text-sm text-ivory-100 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-gold" />
              Client Confidence
            </h4>
            <ul className="space-y-2.5 text-xs text-ivory-300">
              <li>
                <Link to="/track" className="hover:text-gold transition-colors flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-emerald"></span>
                  Track My Service (Private Portal)
                </Link>
              </li>
              <li>
                <button
                  onClick={() => setIsTermsModalOpen(true)}
                  className="hover:text-gold transition-colors text-left"
                >
                  10-Clause Terms & Conditions
                </button>
              </li>
              <li>
                <Link to="/about" className="hover:text-gold transition-colors">
                  Founder Credentials & Workstation Rig
                </Link>
              </li>
              <li>
                <span className="text-ivory-400">Strict Data Isolation Guarantee</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Social Master */}
          <div>
            <h4 className="font-serif font-semibold text-sm text-ivory-100 uppercase tracking-wider mb-4">
              Studio Headquarters
            </h4>
            <ul className="space-y-2 text-xs text-ivory-300">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                <span>Hindupur, Andhra Pradesh, India</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-gold shrink-0" />
                <a href={`tel:${cms?.phone || '9346227894'}`} className="hover:text-gold transition-colors font-medium">
                  +91 {cms?.phone || '9346227894'}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-gold shrink-0" />
                <a href={`mailto:${cms?.email || 'kbkfilms.official@gmail.com'}`} className="hover:text-gold transition-colors">
                  {cms?.email || 'kbkfilms.official@gmail.com'}
                </a>
              </li>
            </ul>

            <div className="pt-4 flex items-center gap-3">
              <a
                href={cms?.instagramUrl || 'https://www.instagram.com/invites/contact/?utm_source=ig_contact_invite&utm_medium=copy_link&utm_content=f5nglc3'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-surface-100 border border-gold/30 flex items-center justify-center text-ivory-300 hover:text-gold hover:border-gold transition-all"
                title="Instagram @kurudi_bharathkumar_official"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={cms?.youtubeUrl || 'https://youtube.com/@bharathkumarglp2003?si=ai6BueJG5fmOkrGX'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-surface-100 border border-gold/30 flex items-center justify-center text-ivory-300 hover:text-accent-crimson hover:border-accent-crimson transition-all"
                title="YouTube @bharathkumarglp2003"
              >
                <Youtube className="w-4 h-4" />
              </a>
              <a
                href={cms?.facebookUrl || 'https://facebook.com/KurudiBharathKumar'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-surface-100 border border-gold/30 flex items-center justify-center text-ivory-300 hover:text-accent-cyan hover:border-accent-cyan transition-all"
                title="Facebook KurudiBharathKumar"
              >
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar & Discreet Owner Access */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-ivory-400">
          <p>© {new Date().getFullYear()} KBK Films. All rights reserved. Kurudi Bharath Kumar, Hindupur.</p>

          <div className="flex items-center gap-6">
            <button
              onClick={() => setIsTermsModalOpen(true)}
              className="hover:text-gold transition-colors"
            >
              Terms of Service
            </button>
            <Link to="/about" className="hover:text-gold transition-colors">
              Privacy & Data Isolation
            </Link>
            {/* Discreet Owner Access Link */}
            <Link
              to="/owner-space"
              className="flex items-center gap-1 text-gold/70 hover:text-gold font-medium transition-colors"
              title="Studio Management Space"
            >
              <Lock className="w-3 h-3" />
              <span>Owner Access</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
