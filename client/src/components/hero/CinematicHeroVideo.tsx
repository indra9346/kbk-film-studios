import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play, Pause, Volume2, VolumeX, RotateCcw, ArrowRight, ShieldCheck, Award, Sparkles, Film } from 'lucide-react';
import { useStudio } from '../../context/StudioContext';

export const CinematicHeroVideo: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [videoProgress, setVideoProgress] = useState(0);
  const { cms } = useStudio();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const keepPlaying = () => {
      video.currentTime = 0;
      video.play().catch(() => setIsPlaying(false));
    };

    const handleTimeUpdate = () => {
      if (video.duration) {
        setVideoProgress((video.currentTime / video.duration) * 100);
      }
    };

    video.addEventListener('ended', keepPlaying);
    video.addEventListener('timeupdate', handleTimeUpdate);

    // Attempt autoplay muted
    video.play().catch(() => {
      // Autoplay with sound restricted, keep muted
      setIsPlaying(false);
    });

    return () => {
      video.removeEventListener('ended', keepPlaying);
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

  // Drive preview links and other HTML preview URLs are not dependable autoplay sources.
  // Always prefer a direct asset or fall back to the bundled MP4 for consistent playback.
  const heroVideoSrc = (() => {
    const rawUrl = cms?.heroVideoUrl?.trim();
    if (!rawUrl) return '/assets/hero-reel.mp4';
    if (rawUrl.startsWith('/assets/')) return rawUrl;
    if (rawUrl.endsWith('.mp4') || rawUrl.endsWith('.webm') || rawUrl.endsWith('.mov')) return rawUrl;
    return '/assets/hero-reel.mp4';
  })();

  return (
    <div className="relative w-full min-h-[88vh] sm:min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-10 sm:pt-24 sm:pb-14">
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
          preload="auto"
          onCanPlay={() => {
            if (videoRef.current) {
              videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {
                // If browser restricts sound or power, ensure muted retry
                if (videoRef.current) {
                  videoRef.current.muted = true;
                  videoRef.current.play().catch(() => setIsPlaying(false));
                }
              });
            }
          }}
          className="w-full h-full object-cover object-center scale-100 sm:scale-105 opacity-85 sm:opacity-90 filter brightness-100 contrast-105 transition-all duration-700"
          onError={(e) => {
            console.log('Video asset fallback to poster');
          }}
        />

        {/* Ambient Calibrated Luxury Overlays (completely transparent in center so 3D KBK logo & clapboard pop brilliantly) */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-background/95 sm:from-background/70 sm:via-background/20 sm:to-background/90"></div>
        <div className="absolute inset-0 bg-radial-vignette opacity-20 sm:opacity-40"></div>

        {/* Gold Atmospheric Center Glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-full max-w-4xl h-80 bg-gold/10 blur-[130px] rounded-full pointer-events-none"></div>
      </div>

      {/* Foreground Hero Content */}
      <div className="relative z-20 max-w-6xl mx-auto px-3.5 sm:px-6 lg:px-8 text-center py-4 sm:py-12 lg:py-20 flex flex-col items-center justify-center">
        {/* Crest & Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-black/40 border border-gold/40 shadow-gold-sm mb-3 sm:mb-5 backdrop-blur-md animate-fadeIn">
          <Sparkles className="w-3.5 h-3.5 text-gold animate-spin-slow" />
          <span className="text-[10px] sm:text-xs uppercase tracking-widest font-semibold gold-gradient-text">
            Studio Post-Production Excellence • Hindupur, AP
          </span>
        </div>

        {/* Master Heading */}
        <h1 className="font-serif text-2xl sm:text-5xl lg:text-7xl font-bold tracking-tight text-ivory-100 max-w-5xl leading-tight sm:leading-[1.15] mb-2.5 sm:mb-5 drop-shadow-[0_2px_14px_rgba(0,0,0,0.95)]">
          Immortalizing Moments into <br className="hidden sm:inline" />
          <span className="gold-gradient-text drop-shadow-[0_2px_15px_rgba(212,175,55,0.4)]">Cinematic Masterpieces</span>
        </h1>

        {/* Subtitle & Value Proposition */}
        <p className="text-[11px] sm:text-base lg:text-lg text-ivory-200/95 max-w-2xl sm:max-w-3xl mb-5 sm:mb-10 leading-relaxed font-light drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)] px-2">
          Bespoke wedding highlights, pre-wedding visual poetry, spot editing, and high-energy haldi & sangeeth films crafted with precision color science and client data isolation.
        </p>

        {/* Primary Call to Action Buttons (Sleek Glass Cluster on Mobile) */}
        <div className="flex flex-row flex-wrap items-center justify-center gap-2 sm:gap-4 mb-5 sm:mb-14 w-full max-w-md sm:max-w-none">
          <Link
            to="/book"
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2.5 px-4 sm:px-8 py-2.5 sm:py-4 rounded-xl bg-gold hover:bg-gold-light text-black font-bold text-xs sm:text-sm tracking-wide shadow-gold-md hover:shadow-gold-lg transition-all duration-300 hover:-translate-y-0.5"
          >
            <span>Book Service</span>
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </Link>

          <Link
            to="/works"
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2.5 px-4 sm:px-7 py-2.5 sm:py-4 rounded-xl bg-black/40 hover:bg-black/60 text-ivory-100 border border-gold/40 hover:border-gold font-semibold text-xs sm:text-sm tracking-wide backdrop-blur-md transition-all duration-300 shadow-sm"
          >
            <Film className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gold" />
            <span>Explore Works</span>
          </Link>

          <Link
            to="/track"
            className="hidden sm:flex items-center justify-center gap-2 px-6 py-3 sm:py-4 rounded-xl bg-surface-200/80 hover:bg-surface-100 text-ivory-200 border border-surface-50 font-medium text-[11px] sm:text-xs tracking-wider uppercase transition-all"
          >
            <ShieldCheck className="w-4 h-4 text-gold" />
            <span>Track Active Service</span>
          </Link>
        </div>

        {/* Floating Interactive Live Stats Counter (Optimized Glass Ribbon on Mobile) */}
        <div className="w-full max-w-4xl grid grid-cols-4 gap-1 sm:gap-4 p-2 sm:p-6 rounded-2xl glass-panel gold-border-glow bg-black/35 backdrop-blur-md border border-gold/25">
          <div className="text-center p-1.5 sm:p-3 border-r border-gold/15">
            <div className="font-serif text-base sm:text-4xl font-extrabold text-gold tracking-tight">
              1,000+
            </div>
            <p className="text-[9px] sm:text-xs text-ivory-300 uppercase tracking-wider mt-0.5 sm:mt-1 font-medium">
              Clients
            </p>
          </div>

          <div className="text-center p-1.5 sm:p-3 border-r border-gold/15">
            <div className="font-serif text-base sm:text-4xl font-extrabold text-white tracking-tight">
              1,200+
            </div>
            <p className="text-[9px] sm:text-xs text-ivory-300 uppercase tracking-wider mt-0.5 sm:mt-1 font-medium">
              Films
            </p>
          </div>

          <div className="text-center p-1.5 sm:p-3 border-r border-gold/15">
            <div className="font-serif text-base sm:text-4xl font-extrabold text-gold tracking-tight">
              6+ Yrs
            </div>
            <p className="text-[9px] sm:text-xs text-ivory-300 uppercase tracking-wider mt-0.5 sm:mt-1 font-medium">
              Mastery
            </p>
          </div>

          <div className="text-center p-1.5 sm:p-3">
            <div className="font-serif text-base sm:text-4xl font-extrabold text-accent-emerald tracking-tight">
              100%
            </div>
            <p className="text-[9px] sm:text-xs text-ivory-300 uppercase tracking-wider mt-0.5 sm:mt-1 font-medium">
              Isolated
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
