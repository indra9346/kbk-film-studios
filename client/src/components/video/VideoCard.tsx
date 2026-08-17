import React, { useEffect, useRef, useState } from 'react';
import { Maximize2, Play } from 'lucide-react';
import { PublicWork } from '../../types';

interface VideoCardProps {
  work: PublicWork;
  onSelect: (work: PublicWork) => void;
}

export const extractDriveFileId = (url: string): string | null => {
  if (!url) return null;
  const match =
    url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ||
    url.match(/\/file\/u\/\d+\/d\/([a-zA-Z0-9_-]+)/) ||
    url.match(/\/d\/([a-zA-Z0-9_-]+)/) ||
    url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
};

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
    const driveId = extractDriveFileId(trimmed);
    return { type: 'google-drive', id: driveId || '' };
  }

  return { type: 'direct', id: trimmed };
};

export const getCleanVideoUrl = (url: string): string => {
  if (!url) return '/assets/hero-reel.mp4';
  const media = getVideoType(url);
  if (media.type === 'google-drive' && media.id) {
    return `https://drive.google.com/file/d/${media.id}/preview`;
  }
  if (media.type === 'direct' && url.startsWith('http')) {
    return url;
  }
  return url || '/assets/hero-reel.mp4';
};

export const getDirectStreamUrl = (url: string): string => {
  if (!url) return '/assets/hero-reel.mp4';
  const media = getVideoType(url);
  if (media.type === 'google-drive' && media.id) {
    return `https://drive.google.com/uc?export=download&id=${media.id}`;
  }
  if (media.type === 'direct' && url.startsWith('http')) {
    return url;
  }
  return url || '/assets/hero-reel.mp4';
};

const AutoplayVideo: React.FC<{ src: string; fallbackIframe?: string; poster?: string; title?: string }> = ({
  src,
  fallbackIframe,
  poster,
  title,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [hasVideoError, setHasVideoError] = useState(false);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    el.muted = true;
    el.playsInline = true;

    const playSafe = () => {
      const p = el.play();
      if (p !== undefined) {
        p.catch(() => {});
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            playSafe();
          } else {
            el.pause();
          }
        });
      },
      { threshold: 0.15 }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [src]);

  if (hasVideoError && fallbackIframe) {
    return (
      <iframe
        src={fallbackIframe}
        title={title}
        className="w-full h-full object-cover border-0 pointer-events-none scale-105"
        allow="autoplay; encrypted-media"
      />
    );
  }

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
      onError={() => setHasVideoError(true)}
      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      title={title}
    />
  );
};

export const VideoCard: React.FC<VideoCardProps> = ({ work, onSelect }) => {
  const media = getVideoType(work.videoUrl);
  const driveId = media.type === 'google-drive' ? media.id : extractDriveFileId(work.videoUrl);
  const isGoogleDrive = Boolean(driveId || work.videoSourceType === 'google_drive' || work.videoUrl?.includes('drive.google.com'));

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
        ) : isGoogleDrive && driveId ? (
          <AutoplayVideo
            src={getDirectStreamUrl(work.videoUrl)}
            fallbackIframe={`https://drive.google.com/file/d/${driveId}/preview`}
            poster={work.thumbnailUrl || '/assets/kbk-logo.jpg'}
            title={work.title}
          />
        ) : (
          <AutoplayVideo
            src={getCleanVideoUrl(work.videoUrl)}
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
            <Play className="w-2.5 h-2.5 fill-black" />
            CINEMA
          </span>
        </div>

        {/* Center Hover Play Icon */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
          <div className="w-14 h-14 rounded-full bg-gold/90 text-black flex items-center justify-center shadow-gold transition-transform duration-300 group-hover:scale-110">
            <Maximize2 className="w-6 h-6 ml-0.5" />
          </div>
        </div>

        {/* Bottom Year and Location */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-ivory-300 z-10 pointer-events-none font-medium">
          <span>{work.eventLocation || 'Hindupur, AP'}</span>
          <span>{work.eventYear || '2026'}</span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-3 bg-surface-200/50">
        <div>
          <h3 className="font-serif text-lg font-bold text-white group-hover:text-gold transition-colors duration-300 line-clamp-1">
            {work.title}
          </h3>
          <p className="text-xs text-ivory-300 font-light mt-1.5 line-clamp-2 leading-relaxed">
            {work.description || 'Master color graded and cinematic pace edited wedding highlight film.'}
          </p>
        </div>

        {/* Tools / Software Badges */}
        <div className="pt-3 border-t border-surface-50 flex flex-wrap items-center gap-1.5">
          {work.softwareUsed && work.softwareUsed.length > 0 ? (
            work.softwareUsed.map((tool, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-md bg-surface-100 text-[10px] text-ivory-400 border border-gold/15 font-mono"
              >
                {tool}
              </span>
            ))
          ) : (
            <span className="px-2 py-0.5 rounded-md bg-surface-100 text-[10px] text-gold/80 border border-gold/15 font-mono">
              DaVinci Resolve Studio
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
