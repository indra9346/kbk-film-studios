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
    setHasSettled(false);
  };

  const skipToSettled = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    setHasSettled(true);
  };

  return (
    <div className="relative w-full min-h-[90vh] lg:min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Video & Banner Background Container */}
      <div className="absolute inset-0 w-full h-full bg-background overflow-hidden">
        {/* Video Element */}
        <video
          ref={videoRef}
          src="/assets/hero-reel.mp4"
          playsInline
          muted={isMuted}
          autoPlay
          className={`w-full h-full object-cover transition-all duration-1000 ${
            hasSettled
              ? 'opacity-35 scale-105 filter blur-[2px] brightness-75'
              : 'opacity-70 scale-100 filter brightness-90'
          }`}
          onError={(e) => {
            console.log('Video asset fallback to poster');
          }}
        />

        {/* Ambient Dark Overlays & Luxury Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent"></div>
        <div className="absolute inset-0 bg-radial-vignette pointer-events-none"></div>

        {/* Settled Gold Atmospheric Glow */}
        {hasSettled && (
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full max-w-4xl h-80 bg-gold/10 blur-[120px] rounded-full pointer-events-none animate-pulse-slow"></div>
        )}
      </div>

      {/* Foreground Hero Content */}
      <div className="relative z-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-12 lg:py-20 flex flex-col items-center justify-center">
        {/* Crest & Badge */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-surface-100/90 border border-gold/40 shadow-gold-sm mb-6 backdrop-blur-md animate-fadeIn">
          <Sparkles className="w-4 h-4 text-gold animate-spin-slow" />
          <span className="text-xs uppercase tracking-widest font-semibold gold-gradient-text">
            Studio Post-Production Excellence • Hindupur, AP
          </span>
        </div>

        {/* Master Heading */}
        <h1 className="font-serif text-3xl sm:text-5xl lg:text-7xl font-bold tracking-tight text-ivory-100 max-w-5xl leading-[1.15] mb-6">
          Immortalizing Moments into <br className="hidden sm:inline" />
          <span className="gold-gradient-text">Cinematic Masterpieces</span>
        </h1>

        {/* Subtitle & Value Proposition */}
        <p className="text-sm sm:text-base lg:text-lg text-ivory-300 max-w-3xl mb-10 leading-relaxed font-light">
          Bespoke wedding highlights, pre-wedding visual poetry, spot editing, and high-energy haldi & sangeeth films crafted with precision color science and client data isolation.
        </p>

        {/* Primary Call to Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-14">
          <Link
            to="/book"
            className="flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gold hover:bg-gold-light text-black font-bold text-sm tracking-wide shadow-gold-md hover:shadow-gold-lg transition-all duration-300 hover:-translate-y-0.5"
          >
            <span>Book Your Service</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            to="/works"
            className="flex items-center gap-2.5 px-7 py-4 rounded-xl bg-surface-100/80 hover:bg-surface-50 text-ivory-100 border border-gold/30 hover:border-gold font-semibold text-sm tracking-wide backdrop-blur-md transition-all duration-300"
          >
            <Film className="w-4 h-4 text-gold" />
            <span>Explore Works Showcase</span>
          </Link>

          <Link
            to="/track"
            className="flex items-center gap-2 px-6 py-4 rounded-xl bg-surface-200/60 hover:bg-surface-100 text-ivory-200 border border-surface-50 font-medium text-xs tracking-wider uppercase transition-all"
          >
            <ShieldCheck className="w-4 h-4 text-gold" />
            <span>Track Active Service</span>
          </Link>
        </div>

        {/* Floating Interactive Live Stats Counter (800+ Clients) */}
        <div className="w-full max-w-4xl grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 p-4 sm:p-6 rounded-2xl glass-panel gold-border-glow">
          <div className="text-center p-3 border-r border-gold/15 last:border-r-0">
            <div className="font-serif text-2xl sm:text-4xl font-extrabold text-gold tracking-tight">
              800+
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
      <div className="absolute bottom-6 right-6 z-30 flex items-center gap-2 bg-surface-200/90 backdrop-blur-md border border-gold/30 rounded-full px-3.5 py-2 shadow-2xl">
        <button
          onClick={togglePlay}
          className="p-1.5 text-ivory-300 hover:text-gold transition-colors"
          title={isPlaying ? 'Pause Reel' : 'Play Reel'}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>

        <button
          onClick={toggleMute}
          className="p-1.5 text-ivory-300 hover:text-gold transition-colors"
          title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-gold" />}
        </button>

        {hasSettled ? (
          <button
            onClick={replayVideo}
            className="flex items-center gap-1 text-[11px] font-semibold text-gold hover:text-gold-light pl-2 border-l border-gold/20"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Replay Reel</span>
          </button>
        ) : (
          <button
            onClick={skipToSettled}
            className="text-[11px] font-medium text-ivory-400 hover:text-white pl-2 border-l border-surface-50"
          >
            Settle Banner
          </button>
        )}
      </div>
    </div>
  );
};
