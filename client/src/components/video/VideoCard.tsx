import React, { useEffect, useRef, useState } from 'react';
import { Maximize2, Play, Volume2, VolumeX } from 'lucide-react';
import { PublicWork } from '../../types';

interface VideoCardProps {
  work: PublicWork;
  onSelect: (work: PublicWork) => void;
}

export const getVideoType = (url: string) => {
  if (!url) return { type: 'unknown', id: '' };
  const trimmed = url.trim();

  // YouTube / YouTube Shorts / youtu.be
  if (trimmed.includes('youtube.com') || trimmed.includes('youtu.be')) {
    const shortsMatch = trimmed.match(/shorts\/([a-zA-Z0-9_-]+)/);
    if (shortsMatch && shortsMatch[1]) {
      return { type: 'youtube', id: shortsMatch[1] };
    }
    const standardMatch = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?#]+)/);
    if (standardMatch && standardMatch[1]) {
      return { type: 'youtube', id: standardMatch[1] };
    }
  }

  // Google Drive
  if (trimmed.includes('drive.google.com') || trimmed.includes('docs.google.com')) {
    const match =
      trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ||
      trimmed.match(/\/file\/u\/\d+\/d\/([a-zA-Z0-9_-]+)/) ||
      trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/) ||
      trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    return { type: 'google-drive', id: (match && match[1]) || '' };
  }

  return { type: 'direct', id: trimmed };
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

const AutoplayVideo: React.FC<{ src: string; poster?: string; title?: string }> = ({ src, poster, title }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    el.muted = true;
    el.playsInline = true;
    el.setAttribute('playsinline', 'true');
    el.setAttribute('webkit-playsinline', 'true');
    el.loop = true;
    el.autoplay = true;

    // Viewport IntersectionObserver to trigger play when scrolled into view
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            el.play()
              .then(() => setIsPlaying(true))
              .catch(() => {
                // Autoplay may be restricted before user gesture; remains muted poster
              });
          } else {
            el.pause();
            setIsPlaying(false);
          }
        });
      },
      { threshold: 0.25 }
    );

    observer.observe(el);

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    el.addEventListener('play', onPlay);
    el.addEventListener('pause', onPause);

    return () => {
      observer.disconnect();
      el.removeEventListener('play', onPlay);
      el.removeEventListener('pause', onPause);
    };
  }, [src]);

  return (
    <video
      ref={videoRef}
      src={src}
      poster={poster}
      controls={false}
      muted
      autoPlay
      loop
      playsInline
      preload="auto"
      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      title={title}
    />
  );
};

export const VideoCard: React.FC<VideoCardProps> = ({ work, onSelect }) => {
  const media = getVideoType(work.videoUrl);
  const videoSrc = getCleanVideoUrl(work.videoUrl);

  return (
    <div
      onClick={() => onSelect(work)}
      className="group relative rounded-3xl overflow-hidden glass-panel glass-panel-hover cursor-pointer border border-gold/20 flex flex-col transition-all duration-300 hover:border-gold/60 shadow-lg hover:shadow-gold-sm"
    >
      {/* Video Container (16:9 Aspect Ratio) */}
      <div className="relative aspect-video w-full overflow-hidden bg-black group/preview">
        {media.type === 'youtube' && media.id ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${media.id}?autoplay=1&mute=1&loop=1&playlist=${media.id}&controls=0&modestbranding=1&rel=0&playsinline=1&enablejsapi=1`}
            title={work.title}
            className="w-full h-full object-cover border-0 pointer-events-none scale-105"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            frameBorder="0"
          />
        ) : media.type === 'google-drive' && media.id ? (
          <div className="relative w-full h-full">
            <iframe
              src={`https://drive.google.com/file/d/${media.id}/preview`}
              title={work.title}
              className="w-full h-full object-cover border-0 pointer-events-none scale-105"
              allow="autoplay"
            />
          </div>
        ) : (
          <AutoplayVideo
            src={videoSrc}
            poster={work.thumbnailUrl || '/assets/kbk-logo.jpg'}
            title={work.title}
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

        {/* Center Hover Cinema View Icon */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="w-12 h-12 rounded-full bg-gold/90 text-black flex items-center justify-center shadow-gold-md scale-90 opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300">
            <Maximize2 className="w-5 h-5" />
          </div>
        </div>

        {/* Event Location & Year Pill (Bottom Right) */}
        <div className="absolute bottom-3 right-3 px-2.5 py-0.5 rounded-full bg-surface-200/85 backdrop-blur-sm border border-surface-50 text-[10px] text-ivory-300 z-10">
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
