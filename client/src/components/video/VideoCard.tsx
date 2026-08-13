import React, { useRef, useEffect, useState } from 'react';
import { Play, Volume2, VolumeX, Maximize2, Sparkles } from 'lucide-react';
import { PublicWork } from '../../types';

interface VideoCardProps {
  work: PublicWork;
  onSelect: (work: PublicWork) => void;
}

export const getVideoType = (url: string) => {
  if (!url) return { type: 'unknown', id: '' };
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([^&?#]+)/);
    return { type: 'youtube', id: (match && match[1]) || '' };
  }
  if (url.includes('drive.google.com') || url.includes('docs.google.com')) {
    const match =
      url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ||
      url.match(/\/file\/u\/\d+\/d\/([a-zA-Z0-9_-]+)/) ||
      url.match(/\/d\/([a-zA-Z0-9_-]+)/) ||
      url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    return { type: 'google-drive', id: (match && match[1]) || '' };
  }
  return { type: 'direct', id: url };
};

export const getCleanVideoUrl = (url: string): string => {
  if (!url) return '/assets/hero-reel.mp4';
  const media = getVideoType(url);
  if (media.type === 'google-drive' && media.id) {
    return `/api/public/stream-drive/${media.id}`;
  }
  if (media.type === 'direct' && url.startsWith('http')) {
    return url;
  }
  return url || '/assets/hero-reel.mp4';
};

export const VideoCard: React.FC<VideoCardProps> = ({ work, onSelect }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [videoSrc, setVideoSrc] = useState<string>(() => getCleanVideoUrl(work.videoUrl));
  const media = getVideoType(work.videoUrl);

  // Sync videoSrc when work changes
  useEffect(() => {
    setVideoSrc(getCleanVideoUrl(work.videoUrl));
  }, [work.videoUrl]);

  // Auto-play immediately on mount and ensure continuous loop
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = isMuted;
    video.play().catch(() => {
      // Browser autoplay policy might require explicit muted trigger
      if (video) {
        video.muted = true;
        video.play().catch(() => {});
      }
    });
  }, [videoSrc, isMuted]);

  const handleVideoError = () => {
    // If external stream has error, fallback to hero reel
    if (videoSrc !== '/assets/hero-reel.mp4') {
      setVideoSrc('/assets/hero-reel.mp4');
    }
  };

  const toggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (videoRef.current) {
      videoRef.current.muted = nextMuted;
      if (videoRef.current.paused) {
        videoRef.current.play().catch(() => {});
      }
    }
  };

  return (
    <div
      onClick={() => onSelect(work)}
      className="group relative rounded-2xl overflow-hidden glass-panel glass-panel-hover cursor-pointer border border-gold/20 flex flex-col transition-all duration-300 hover:border-gold/50 shadow-lg hover:shadow-gold-sm"
    >
      {/* Video Container (16:9 Aspect Ratio) - Continuous Muted Autoplay Loop */}
      <div className="relative aspect-video w-full overflow-hidden bg-black group/preview">
        {media.type === 'youtube' && media.id ? (
          <iframe
            src={`https://www.youtube.com/embed/${media.id}?autoplay=1&mute=1&loop=1&playlist=${media.id}&controls=0&modestbranding=1&rel=0&iv_load_policy=3&showinfo=0&disablekb=1&fs=0`}
            title={work.title}
            className="w-full h-full object-cover border-0 pointer-events-none scale-105"
            allow="autoplay; encrypted-media"
            frameBorder="0"
          />
        ) : (
          <video
            ref={videoRef}
            src={videoSrc}
            poster={media.type === 'google-drive' && media.id ? `https://lh3.googleusercontent.com/d/${media.id}=w1280` : (work.thumbnailUrl || undefined)}
            autoPlay
            muted={isMuted}
            loop
            playsInline
            onError={handleVideoError}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        )}

        {/* Video Overlay Subtle Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-surface-300/80 via-transparent to-black/30 pointer-events-none"></div>

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
          <span className="px-2.5 py-1 rounded-md bg-black/75 backdrop-blur-md border border-gold/30 text-[11px] font-semibold text-gold uppercase tracking-wider">
            {work.category}
          </span>
          <span className="px-2 py-0.5 rounded bg-gold/90 text-black text-[10px] font-extrabold tracking-wider flex items-center gap-1 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span>
            4K UHD
          </span>
        </div>

        {/* Center Hover Expand Icon */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="w-12 h-12 rounded-full bg-gold/90 text-black flex items-center justify-center shadow-gold-md scale-90 opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300">
            <Maximize2 className="w-5 h-5" />
          </div>
        </div>

        {/* Sound Toggle Button (Bottom Left) */}
        {media.type !== 'youtube' && (
          <button
            type="button"
            onClick={toggleSound}
            className="absolute bottom-3 left-3 z-20 p-2 rounded-full bg-black/80 hover:bg-gold hover:text-black text-ivory-200 border border-gold/30 backdrop-blur-sm transition-all cursor-pointer shadow-md"
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-gold" />}
          </button>
        )}

        {/* Event Location & Year Pill (Bottom Right) */}
        <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded bg-surface-200/85 backdrop-blur-sm border border-surface-50 text-[10px] text-ivory-300 z-10">
          {work.eventLocation} • {work.eventYear}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-3 bg-surface-200/40">
        <div>
          <h3 className="font-serif text-base sm:text-lg font-bold text-ivory-100 group-hover:text-gold transition-colors line-clamp-1">
            {work.title}
          </h3>
          <p className="text-xs text-ivory-300 mt-1.5 line-clamp-2 leading-relaxed font-light">
            {work.description}
          </p>
        </div>

        {/* Software Stack Tags & Watch Action */}
        <div className="pt-3 border-t border-surface-50 flex items-center justify-between">
          <div className="flex flex-wrap gap-1.5">
            {work.softwareUsed?.slice(0, 2).map((soft, i) => (
              <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-surface-100 text-ivory-400 border border-surface-50">
                {soft}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-1 text-xs font-semibold text-gold group-hover:text-gold-light">
            <span>Cinema View</span>
            <Maximize2 className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
};
