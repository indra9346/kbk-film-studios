import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play, Pause, Volume2, VolumeX, RotateCcw, ArrowRight, ShieldCheck, Award, Sparkles, Film } from 'lucide-react';
import { useStudio } from '../../context/StudioContext';

export const CinematicHeroVideo: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [hasSettled, setHasSettled] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const { cms } = useStudio();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleEnded = () => {
      setHasSettled(true);
    };

    const handleTimeUpdate = () => {
      if (video.duration) {
        setVideoProgress((video.currentTime / video.duration) * 100);
      }
    };

    video.addEventListener('ended', handleEnded);
    video.addEventListener('timeupdate', handleTimeUpdate);

    // Attempt autoplay muted
    video.play().catch(() => {
      // Autoplay with sound restricted, keep muted
      setIsPlaying(false);
    });

    return () => {
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, []);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const replayVideo = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = 0;
    videoRef.current.play();
    setIsPlaying(true);
  };

  const heroVideoSrc = cms?.heroVideoUrl || '/assets/hero-reel.mp4';

  return (
    <div className="relative w-full min-h-[92vh] sm:min-h-screen flex items-center justify-center overflow-hidden pt-24 pb-14">
      {/* Video & Banner Background Container */}
      <div className="absolute inset-0 w-full h-full bg-black overflow-hidden pointer-events-none">
        {/* Full 100% Precision Background Video */}
        <video
          ref={videoRef}
          src={heroVideoSrc}
          playsInline
          muted={isMuted}
          autoPlay
          loop
          className="w-full h-full object-cover object-center scale-100 sm:scale-105 opacity-75 sm:opacity-85 filter brightness-95 contrast-105 transition-all duration-700"
          onError={(e) => {
            console.log('Video asset fallback to poster');
          }}
        />

        {/* Ambient Calibrated Luxury Overlays (maintains 100% typography contrast while keeping video vivid) */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/75 via-background/25 to-background/90"></div>
        <div className="absolute inset-0 bg-radial-vignette opacity-40"></div>

        {/* Gold Atmospheric Center Glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-full max-w-4xl h-80 bg-gold/10 blur-[130px] rounded-full pointer-events-none"></div>
      </div>

      {/* Foreground Hero Content */}
      <div className="relative z-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-6 sm:py-12 lg:py-20 flex flex-col items-center justify-center">
        {/* Crest & Badge */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-surface-100/90 border border-gold/40 shadow-gold-sm mb-5 backdrop-blur-md animate-fadeIn">
          <Sparkles className="w-4 h-4 text-gold animate-spin-slow" />
          <span className="text-[11px] sm:text-xs uppercase tracking-widest font-semibold gold-gradient-text">
            Studio Post-Production Excellence • Hindupur, AP
          </span>
        </div>

        {/* Master Heading */}
        <h1 className="font-serif text-3xl sm:text-5xl lg:text-7xl font-bold tracking-tight text-ivory-100 max-w-5xl leading-[1.15] mb-5 drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
          Immortalizing Moments into <br className="hidden sm:inline" />
          <span className="gold-gradient-text drop-shadow-[0_2px_15px_rgba(212,175,55,0.4)]">Cinematic Masterpieces</span>
        </h1>

        {/* Subtitle & Value Proposition */}
        <p className="text-xs sm:text-base lg:text-lg text-ivory-200 max-w-3xl mb-8 sm:mb-10 leading-relaxed font-light drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
          Bespoke wedding highlights, pre-wedding visual poetry, spot editing, and high-energy haldi & sangeeth films crafted with precision color science and client data isolation.
        </p>

        {/* Primary Call to Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-10 sm:mb-14 w-full max-w-md sm:max-w-none">
          <Link
            to="/book"
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-3.5 sm:py-4 rounded-xl bg-gold hover:bg-gold-light text-black font-bold text-xs sm:text-sm tracking-wide shadow-gold-md hover:shadow-gold-lg transition-all duration-300 hover:-translate-y-0.5"
          >
            <span>Book Your Service</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            to="/works"
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-7 py-3.5 sm:py-4 rounded-xl bg-surface-100/90 hover:bg-surface-50 text-ivory-100 border border-gold/30 hover:border-gold font-semibold text-xs sm:text-sm tracking-wide backdrop-blur-md transition-all duration-300"
          >
            <Film className="w-4 h-4 text-gold" />
            <span>Explore Works Showcase</span>
          </Link>

          <Link
            to="/track"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 sm:py-4 rounded-xl bg-surface-200/80 hover:bg-surface-100 text-ivory-200 border border-surface-50 font-medium text-[11px] sm:text-xs tracking-wider uppercase transition-all"
          >
            <ShieldCheck className="w-4 h-4 text-gold" />
            <span>Track Active Service</span>
          </Link>
        </div>

        {/* Floating Interactive Live Stats Counter (1,000+ Clients) */}
        <div className="w-full max-w-4xl grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 p-4 sm:p-6 rounded-2xl glass-panel gold-border-glow">
          <div className="text-center p-3 border-r border-gold/15 last:border-r-0">
            <div className="font-serif text-2xl sm:text-4xl font-extrabold text-gold tracking-tight">
              1,000+
            </div>
            <p className="text-[11px] sm:text-xs text-ivory-300 uppercase tracking-wider mt-1 font-medium">
              Happy Clients
            </p>
          </div>

          <div className="text-center p-3 border-r border-gold/15 last:border-r-0">
            <div className="font-serif text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              1,200+
            </div>
            <p className="text-[11px] sm:text-xs text-ivory-300 uppercase tracking-wider mt-1 font-medium">
              Films Delivered
            </p>
          </div>

          <div className="text-center p-3 border-r border-gold/15 last:border-r-0">
            <div className="font-serif text-2xl sm:text-4xl font-extrabold text-gold tracking-tight">
              6+ Yrs
            </div>
            <p className="text-[11px] sm:text-xs text-ivory-300 uppercase tracking-wider mt-1 font-medium">
              Editing Mastery
            </p>
          </div>

          <div className="text-center p-3">
            <div className="font-serif text-2xl sm:text-4xl font-extrabold text-accent-emerald tracking-tight">
              100%
            </div>
            <p className="text-[11px] sm:text-xs text-ivory-300 uppercase tracking-wider mt-1 font-medium">
              Isolated Deliveries
            </p>
          </div>
        </div>
      </div>

      {/* Floating Video Controller Bar (Bottom Right) */}
      <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 z-30 flex items-center gap-2 bg-surface-200/90 backdrop-blur-md border border-gold/30 rounded-full px-3.5 py-1.5 sm:py-2 shadow-2xl">
        <div className="flex items-center gap-1.5 pr-2 border-r border-gold/20">
          <span className="w-2 h-2 rounded-full bg-accent-emerald animate-ping"></span>
          <span className="text-[10px] font-bold text-gold uppercase tracking-wider hidden sm:inline">4K Reel</span>
        </div>

        <button
          onClick={togglePlay}
          className="p-1 text-ivory-300 hover:text-gold transition-colors"
          title={isPlaying ? 'Pause Reel' : 'Play Reel'}
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
        </button>

        <button
          onClick={toggleMute}
          className="p-1 text-ivory-300 hover:text-gold transition-colors"
          title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gold" />}
        </button>

        <button
          onClick={replayVideo}
          className="flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold text-gold hover:text-gold-light pl-1.5"
          title="Restart Reel"
        >
          <RotateCcw className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          <span className="hidden sm:inline">Replay</span>
        </button>
      </div>
    </div>
  );
};
