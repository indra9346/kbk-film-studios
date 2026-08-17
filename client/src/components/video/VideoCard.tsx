import React, { useState, useRef } from 'react';
import { Maximize2, Play, Pause, Volume2, VolumeX, Image as ImageIcon, Film } from 'lucide-react';
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

export const isImageMedia = (url?: string): boolean => {
  if (!url) return false;
  const lower = url.toLowerCase().trim();
  if (lower.startsWith('data:image/')) return true;
  return (
    lower.includes('.jpg') ||
    lower.includes('.jpeg') ||
    lower.includes('.png') ||
    lower.includes('.webp') ||
    lower.includes('.avif') ||
    lower.includes('.gif') ||
    lower.includes('images.unsplash.com') ||
    lower.includes('/assets/kbk-logo')
  );
};

export const getVideoType = (url: string) => {
  if (!url) return { type: 'unknown', id: '' };
  const trimmed = url.trim();

  if (isImageMedia(trimmed)) {
    return { type: 'image', id: trimmed };
  }

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
    return `https://drive.google.com/file/d/${media.id}/preview?autoplay=1`;
  }
  if (media.type === 'direct' && url.startsWith('http')) {
    return url;
  }
  return url || '/assets/hero-reel.mp4';
};

export const VideoCard: React.FC<VideoCardProps> = ({ work, onSelect }) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const isPic = isImageMedia(work.videoUrl) || (!work.videoUrl && Boolean(work.thumbnailUrl));
  const media = getVideoType(work.videoUrl || work.thumbnailUrl);
  const driveId = media.type === 'google-drive' ? media.id : extractDriveFileId(work.videoUrl);
  const isGoogleDrive = Boolean(driveId || work.videoSourceType === 'google_drive' || work.videoUrl?.includes('drive.google.com'));

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  return (
    <div
      onClick={() => onSelect(work)}
      className="group relative rounded-3xl overflow-hidden glass-panel glass-panel-hover cursor-pointer border border-gold/20 flex flex-col transition-all duration-300 hover:border-gold/60 shadow-lg hover:shadow-gold-sm"
    >
      {/* Media Container (16:9 Aspect Ratio) */}
      <div className="relative aspect-video w-full overflow-hidden bg-black group/preview">
        {isPic ? (
          <img
            src={work.videoUrl || work.thumbnailUrl || '/assets/kbk-logo.jpg'}
            alt={work.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/assets/kbk-logo.jpg';
            }}
          />
        ) : media.type === 'youtube' && media.id ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${media.id}?autoplay=1&mute=1&loop=1&playlist=${media.id}&controls=0&modestbranding=1&rel=0&playsinline=1`}
            title={work.title}
            className="w-full h-full object-cover border-0 pointer-events-none scale-105"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            frameBorder="0"
          />
        ) : isGoogleDrive && driveId ? (
          <iframe
            src={`https://drive.google.com/file/d/${driveId}/preview`}
            title={work.title}
            className="w-full h-full object-cover border-0 pointer-events-none scale-105"
            allow="autoplay; encrypted-media"
            frameBorder="0"
          />
        ) : (
          <video
            ref={videoRef}
            src={getCleanVideoUrl(work.videoUrl)}
            poster={work.thumbnailUrl || '/assets/kbk-logo.jpg'}
            muted={isMuted}
            autoPlay
            loop
            playsInline
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
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
            {isPic ? (
              <>
                <ImageIcon className="w-2.5 h-2.5 fill-black" />
                PHOTO STILL
              </>
            ) : (
              <>
                <Film className="w-2.5 h-2.5 fill-black" />
                CINEMA
              </>
            )}
          </span>
        </div>

        {/* Simple Interactive Controls (Play/Pause, Sound, Maximize) */}
        <div className="absolute inset-x-3 bottom-3 flex items-center justify-between z-20">
          <div className="flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
            {!isPic && !isGoogleDrive && media.type !== 'youtube' && (
              <>
                <button
                  type="button"
                  onClick={togglePlay}
                  className="p-1.5 rounded-lg bg-black/80 hover:bg-gold hover:text-black text-ivory-100 border border-gold/30 transition-colors backdrop-blur-md"
                  title={isPlaying ? 'Pause preview' : 'Play preview'}
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={toggleMute}
                  className="p-1.5 rounded-lg bg-black/80 hover:bg-gold hover:text-black text-ivory-100 border border-gold/30 transition-colors backdrop-blur-md"
                  title={isMuted ? 'Unmute preview' : 'Mute preview'}
                >
                  {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                </button>
              </>
            )}
            <span className="text-[11px] text-ivory-200 font-medium px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm border border-white/10">
              {work.eventLocation || 'Hindupur, AP'} • {work.eventYear || '2026'}
            </span>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(work);
            }}
            className="p-2 rounded-xl bg-gold/90 hover:bg-gold text-black shadow-gold transition-all duration-300 hover:scale-110"
            title={isPic ? 'View Full Image' : 'Open Full Cinema View'}
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-3 bg-surface-200/50">
        <div>
          <h3 className="font-serif text-lg font-bold text-white group-hover:text-gold transition-colors duration-300 line-clamp-1">
            {work.title}
          </h3>
          <p className="text-xs text-ivory-300 font-light mt-1.5 line-clamp-2 leading-relaxed">
            {work.description || 'Master color graded and cinematic pace edited wedding showcase.'}
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
