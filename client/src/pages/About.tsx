import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Award, Film, Cpu, Heart, CheckCircle2, ArrowRight, Sparkles, ShieldCheck, BookOpen, Layers } from 'lucide-react';
import { useStudio } from '../context/StudioContext';

export const About: React.FC = () => {
  const { cms } = useStudio();

  const education = cms?.educationDetails || {
    degree: 'Bachelor of Commerce (Computer Applications)',
    college: 'Sri Krishnadevaraya University (SKU), Ananthapuramu',
    coreHighlights: [
      'Advertising and Media Planning',
      'Big Data Analytics & Data Science',
      'Sales Promotion & Management Accounting',
      'Internship Distinction (8.08 CGPA)'
    ],
    currentPursuit: 'Master of Business Administration (MBA) - 2nd Year'
  };

  const editingSuites = cms?.editingSuites || [
    'DaVinci Resolve Studio (Advanced Color Grading & Fairlight Audio)',
    'Adobe Premiere Pro (Multi-Cam Narrative Sync)',
    'Adobe After Effects (Cinematic VFX & Motion Graphics)',
    'FilmConvert Nitrate & Dehancer Pro (Film Emulation LUTs)',
    'Custom Calibrated OLED & DaVinci Speed Editor Rig'
  ];

  return (
    <div className="min-h-screen bg-background text-ivory-100 pt-28 pb-20 space-y-20">
      {/* 1. Header & Founder Intro */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Founder Visual & Crest Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden glass-panel border border-gold/40 shadow-2xl p-3">
              <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-surface-300 relative">
                <img
                  src="/assets/kbk-logo.jpg"
                  alt="Kurudi Bharath Kumar"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>

                <div className="absolute bottom-6 left-6 right-6 space-y-1">
                  <span className="px-2.5 py-0.5 rounded bg-gold text-black text-[10px] uppercase font-extrabold tracking-widest">
                    Lead Video Editor & Colorist
                  </span>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-white">
                    Kurudi Bharath Kumar
                  </h3>
                  <p className="text-xs text-ivory-300 font-light">
                    Founder, KBK Film Studios • Hindupur, AP
                  </p>
                </div>
              </div>
            </div>

            {/* Floating Experience Badge */}
            <div className="absolute -bottom-6 -right-4 bg-surface-100/95 border border-gold/50 rounded-2xl p-4 shadow-xl backdrop-blur-md flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gold/15 text-gold border border-gold/30">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <div className="font-serif text-lg font-extrabold text-gold">800+ Events</div>
                <p className="text-[11px] text-ivory-400">Mastered & Delivered</p>
              </div>
            </div>
          </div>

          {/* Biography Text & Vision */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-2">
              <span className="text-xs uppercase tracking-widest text-gold font-bold flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5" /> The Filmmaker Behind the Lens & Timeline
              </span>
              <h1 className="font-serif text-3xl sm:text-5xl font-bold text-ivory-100 leading-tight">
                Transforming Fleeting Memories into Timeless Emotion
              </h1>
            </div>

            <p className="text-xs sm:text-sm text-ivory-200 leading-relaxed font-light">
              {cms?.founderBio ||
                'Kurudi Bharath Kumar is an accomplished filmmaker, post-production specialist, and senior colorist based in Hindupur, Andhra Pradesh. Blending commercial media planning with soulful rhythmic editing and film-look color science, he crafts wedding and event films that immortalize raw emotional moments.'}
            </p>

            <p className="text-xs sm:text-sm text-ivory-300 leading-relaxed font-light">
              Every celebration holds a heartbeat—the anxious smile before the Muhurtham, the joyous tears during the Kanyadanam, the electric energy of the Sangeeth floor, and the quiet blessings of elders. At KBK Film Studios, we believe post-production is not simply joining clips; it is composing a cinematic symphony where sound, color, and pacing tell your story forever.
            </p>

            {/* Quick CTAs */}
            <div className="pt-4 flex flex-wrap gap-4">
              <Link
                to="/book"
                className="px-6 py-3 rounded-xl bg-gold hover:bg-gold-light text-black font-bold text-xs uppercase tracking-wider shadow-gold-sm transition-all"
              >
                Book a Project with Bharath
              </Link>
              <Link
                to="/works"
                className="px-6 py-3 rounded-xl bg-surface-100 hover:bg-surface-50 text-ivory-200 border border-gold/30 text-xs font-semibold tracking-wider transition-all"
              >
                Watch Editing Portfolio
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Educational Foundation & Academic Distinction */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl glass-panel gold-border-glow space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gold/20 pb-6">
            <div className="flex items-center gap-3.5">
              <div className="p-3 rounded-2xl bg-gold/15 text-gold border border-gold/30">
                <GraduationCap className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-widest text-gold font-bold">
                  Academic Credentials
                </span>
                <h2 className="font-serif text-xl sm:text-3xl font-bold text-ivory-100">
                  Education & Media Disciplines
                </h2>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-100 border border-gold/30 text-xs text-gold font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Sri Krishnadevaraya University Alumnus</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Degree Card */}
            <div className="p-6 rounded-2xl bg-surface-100/70 border border-surface-50 space-y-4">
              <div className="space-y-1">
                <span className="text-[11px] uppercase tracking-wider text-ivory-400 font-medium">
                  Undergraduate Degree
                </span>
                <h3 className="font-serif text-lg font-bold text-gold">
                  {education.degree}
                </h3>
                <p className="text-xs text-ivory-300">
                  {education.college}
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-surface-50">
                <span className="text-xs font-semibold text-ivory-200">
                  Core Specializations & High Marks:
                </span>
                <ul className="space-y-1.5 text-xs text-ivory-300">
                  {education.coreHighlights?.map((item: string, idx: number) => (
                    <li key={idx} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-accent-emerald shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Current MBA Pursuit Card */}
            <div className="p-6 rounded-2xl bg-surface-100/70 border border-surface-50 space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <span className="text-[11px] uppercase tracking-wider text-ivory-400 font-medium">
                  Postgraduate Study
                </span>
                <h3 className="font-serif text-lg font-bold text-gold">
                  {education.currentPursuit}
                </h3>
                <p className="text-xs text-ivory-300 leading-relaxed font-light">
                  Applying advanced business management, client relations, project governance, and media delivery frameworks to streamline high-end studio workflows.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-surface-200 border border-gold/20 text-xs text-ivory-300 space-y-1">
                <span className="font-semibold text-gold block">Professional Ethics:</span>
                <p>
                  Committed to absolute data privacy, transparent service agreements, zero watermarks, and guaranteed client isolation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Studio Workstation & Post-Production Suite */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs uppercase tracking-widest text-gold font-bold">
            Studio Engineering
          </span>
          <h2 className="font-serif text-2xl sm:text-4xl font-bold text-ivory-100">
            Post-Production Workstations & Software
          </h2>
          <p className="text-xs sm:text-sm text-ivory-300 font-light">
            We operate industry-calibrated hardware and software to ensure pixel-perfect 4K deliverables with cinematic color reproduction.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {editingSuites.map((suite: string, i: number) => (
            <div key={i} className="p-5 rounded-2xl glass-panel border border-gold/20 flex items-start gap-3.5 hover:border-gold/50 transition-all">
              <div className="p-2.5 rounded-xl bg-gold/15 text-gold shrink-0">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-serif text-sm font-bold text-ivory-100">
                  {suite.split('(')[0]}
                </h4>
                {suite.includes('(') && (
                  <p className="text-xs text-ivory-400 mt-1 font-light">
                    ({suite.split('(')[1]}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
