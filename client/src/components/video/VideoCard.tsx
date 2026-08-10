import React, { useRef, useEffect, useState } from 'react';
import { Play, Volume2, VolumeX, Maximize2, ExternalLink, Sparkles } from 'lucide-react';
import { PublicWork } from '../../types';
import { useStudio } from '../../context/StudioContext';

interface VideoCardProps {
  work: PublicWork;
  onSelect: (work: PublicWork) => void;
}

export const getVideoType = (url: string) => {
  if (!url) return { type: 'unknown', id: '' };
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?#]+)/);
    return { type: 'youtube', id: (match && match[1]) || '' };
  }
  if (url.includes('drive.google.com')) {
    const match = url.match(/\/d\/([^/]+)/) || url.match(/id=([^&]+)/);
    return { type: 'google-drive', id: (match && match[1]) || '' };
  }
  return { type: 'direct', id: url };
};

const getCleanVideoUrl = (url: string): string => {
  if (!url) return '';
  const media = getVideoType(url);
  if (media.type === 'google-drive') {
    return `https://drive.google.com/uc?export=download&id=${media.id}`;
  }
  return url;
};

export const VideoCard: React.FC<VideoCardProps> = ({ work, onSelect }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const { activePlayingVideoId, setActivePlayingVideoId } = useStudio();

  const isCurrentActive = activePlayingVideoId === work.id;
  const media = getVideoType(work.videoUrl);

  useEffect(() => {
    if (media.type !== 'direct') return;
    const video = videoRef.current;
    if (!video) return;

    if (isCurrentActive) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [isCurrentActive, media.type]);

  const handleMouseEnter = () => {
    setIsHovered(true);
    setActivePlayingVideoId(work.id);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const toggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (media.type === 'direct' && videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    } else {
      setIsMuted(!isMuted);
    }
    if (!isCurrentActive) {
      setActivePlayingVideoId(work.id);
    }
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => onSelect(work)}
      className="group relative rounded-2xl overflow-hidden glass-panel glass-panel-hover cursor-pointer border border-gold/20 flex flex-col"
    >
      {/* Video Container (16:9 Aspect Ratio) */}
      <div className="relative aspect-video w-full overflow-hidden bg-surface-300">
        {/* Direct Video or YouTube/Drive Embeds */}
        {isHovered && media.type === 'youtube' ? (
          <iframe
            src={`https://www.youtube.com/embed/${media.id}?autoplay=1&mute=1&loop=1&playlist=${media.id}&controls=0&modestbranding=1&rel=0&iv_load_policy=3&showinfo=0`}
            title={work.title}
            className="w-full h-full object-cover border-0"
            allow="autoplay; encrypted-media"
            frameBorder="0"
          />
        ) : isHovered && media.type === 'google-drive' ? (
          <iframe
            src={`https://drive.google.com/file/d/${media.id}/preview`}
            title={work.title}
            className="w-full h-full object-cover border-0 scale-105"
            allow="autoplay"
            frameBorder="0"
          />
        ) : (
          <video
            ref={videoRef}
            src={getCleanVideoUrl(work.videoUrl) || '/assets/hero-reel.mp4'}
            poster={work.thumbnailUrl || '/assets/kbk-logo.jpg'}
            loop
            muted={isMuted}
            playsInline
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        )}

        {/* Video Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-surface-300 via-transparent to-black/30 pointer-events-none"></div>

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <span className="px-2.5 py-1 rounded-md bg-black/75 backdrop-blur-md border border-gold/30 text-[11px] font-semibold text-gold uppercase tracking-wider">
            {work.category}
          </span>
          <span className="px-2 py-0.5 rounded bg-gold/90 text-black text-[10px] font-extrabold tracking-wider">
            4K UHD
          </span>
        </div>

        {/* Center Hover Play Indicator */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className={`w-12 h-12 rounded-full bg-gold/90 text-black flex items-center justify-center shadow-gold-md transition-all duration-300 ${
            isHovered ? 'scale-110 opacity-90' : 'scale-90 opacity-0 group-hover:opacity-100'
          }`}>
            <Play className="w-5 h-5 fill-black translate-x-0.5" />
          </div>
        </div>

        {/* Sound Toggle Button (Bottom Left of Video) */}
        <button
          onClick={toggleSound}
          className="absolute bottom-3 left-3 z-10 p-1.5 rounded-full bg-black/80 hover:bg-gold hover:text-black text-ivory-200 border border-gold/30 backdrop-blur-sm transition-all"
          title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-gold" />}
        </button>

        {/* Event Location & Year Pill */}
        <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded bg-surface-200/80 backdrop-blur-sm border border-surface-50 text-[10px] text-ivory-300">
          {work.eventLocation} • {work.eventYear}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
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
            <span>Watch Film</span>
            <Maximize2 className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
};
