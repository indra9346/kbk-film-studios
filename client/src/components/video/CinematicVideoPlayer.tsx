import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize2, ExternalLink, Image as ImageIcon, Film, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
import { extractDriveFileId, getVideoType, isImageMedia, getCleanVideoUrl } from './VideoCard';

export interface CinematicVideoPlayerProps {
  url?: string;
  poster?: string;
  title?: string;
  category?: string;
  aspectRatio?: '16/9' | '9/16' | 'auto';
  autoPlayOnScroll?: boolean;
  isModal?: boolean;
  showControls?: boolean;
  className?: string;
  onExpand?: () => void;
}

export const CinematicVideoPlayer: React.FC<CinematicVideoPlayerProps> = ({
  url = '',
  poster,
  title = 'KBK Cinematic Film',
  category,
  aspectRatio = '16/9',
  autoPlayOnScroll = true,
  isModal = false,
  showControls = true,
  className = '',
  onExpand
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [playRejected, setPlayRejected] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isInViewport, setIsInViewport] = useState(isModal);
  const [isMediaLoaded, setIsMediaLoaded] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const trimmedUrl = (url || '').trim();
  const isPic = isImageMedia(trimmedUrl);
  const mediaInfo = getVideoType(trimmedUrl);
  const driveId = mediaInfo.type === 'google-drive' ? mediaInfo.id : extractDriveFileId(trimmedUrl);
  const isGoogleDrive = Boolean(driveId || trimmedUrl.includes('drive.google.com') || trimmedUrl.includes('docs.google.com'));
  const isYouTube = mediaInfo.type === 'youtube' && Boolean(mediaInfo.id);
  const isDirectVideo = !isPic && !isGoogleDrive && !isYouTube;

  const activePoster = poster || undefined;

  // Viewport Observer for High-Speed Lazy Streaming (Prevents lagging 8 concurrent heavy iframes)
  useEffect(() => {
    if (isModal || typeof IntersectionObserver === 'undefined') {
      setIsInViewport(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.15) {
            setIsInViewport(true);
          } else {
            setIsInViewport(false);
          }
        });
      },
      { rootMargin: '150px', threshold: [0, 0.15, 0.5] }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [isModal]);

  // 1. DIRECT HTML5 VIDEO: Guaranteed Muted + Autoplay + Loop
  useEffect(() => {
    if (!isDirectVideo) return;
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.loop = true;
    video.playsInline = true;

    const startPlayback = () => {
      video.muted = true;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            setPlayRejected(false);
          })
          .catch((err) => {
            console.warn('[KBK Video] Muted autoplay prevented:', err.message);
            setIsPlaying(false);
            setPlayRejected(true);
          });
      }
    };

    if (isInViewport) {
      startPlayback();
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, [isDirectVideo, trimmedUrl, isInViewport]);

  // Track progress on direct HTML5 video
  const handleTimeUpdate = () => {
    if (videoRef.current && videoRef.current.duration) {
      setProgress((videoRef.current.currentTime / videoRef.current.duration) * 100);
    }
  };

  const handleTogglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    setHasInteracted(true);
    if (!videoRef.current) return;

    if (videoRef.current.paused) {
      videoRef.current.play().then(() => {
        setIsPlaying(true);
        setPlayRejected(false);
      });
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    setHasInteracted(true);
    if (!videoRef.current) return;
    const nextMuted = !videoRef.current.muted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (!videoRef.current || !videoRef.current.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    videoRef.current.currentTime = pos * videoRef.current.duration;
    setProgress(pos * 100);
  };

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
      className={`relative w-full overflow-hidden bg-black flex items-center justify-center select-none ${
        aspectRatio === '16/9' ? 'aspect-video' : aspectRatio === '9/16' ? 'aspect-[9/16]' : ''
      } ${className}`}
    >
      {/* CASE 1: PHOTO STILL / HIGH-RES PICTURE */}
      {isPic ? (
        <div className="w-full h-full flex items-center justify-center p-1 overflow-auto bg-black">
          <img
            src={trimmedUrl || activePoster}
            alt={title}
            style={isModal ? { transform: `scale(${zoomLevel})` } : undefined}
            className="w-full h-full object-cover transition-transform duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/assets/kbk-logo.jpg';
            }}
          />
          {isModal && (
            <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/80 backdrop-blur-md px-2 py-1 rounded-xl border border-gold/30 z-30">
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.min(z + 0.25, 3))}
                className="p-1 text-ivory-300 hover:text-gold"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.max(z - 0.25, 0.75))}
                className="p-1 text-ivory-300 hover:text-gold"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel(1)}
                className="p-1 text-ivory-300 hover:text-gold"
                title="Reset"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      ) : isYouTube ? (
        /* CASE 2: YOUTUBE (Controlled Loop + Autoplay + Muted) */
        <div className="w-full h-full relative overflow-hidden bg-black pointer-events-auto">
          {isInViewport || isModal ? (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${mediaInfo.id}?autoplay=1&mute=1&loop=1&playlist=${mediaInfo.id}&controls=${isModal ? 1 : 0}&modestbranding=1&rel=0&playsinline=1&iv_load_policy=3&disablekb=1`}
              title={title}
              loading="lazy"
              className="w-full h-full object-cover border-0 scale-105"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <img
              src={`https://img.youtube.com/vi/${mediaInfo.id}/hqdefault.jpg`}
              alt={title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          )}
        </div>
      ) : isGoogleDrive && isModal ? (
        /* CASE 3: GOOGLE DRIVE MODAL (Full 4K Stream in Cinema Modal) */
        <div className="w-full h-full relative overflow-hidden bg-black flex items-center justify-center pointer-events-auto">
          <iframe
            src={
              trimmedUrl.includes('folders')
                ? `https://drive.google.com/embeddedfolderview?id=${driveId}#grid`
                : `https://drive.google.com/file/d/${driveId}/preview?autoplay=1`
            }
            title={title}
            loading="lazy"
            className="w-full h-full object-contain border-0"
            allow="autoplay; fullscreen"
            allowFullScreen
          />
        </div>
      ) : (
        /* CASE 4: DIRECT HTML5 VIDEO & FAST SHOWCASE CARDS (100% Guaranteed Muted + Autoplay + Loop) */
        <div className="relative w-full h-full bg-black flex items-center justify-center">
          <video
            ref={videoRef}
            src={getCleanVideoUrl(trimmedUrl)}
            poster={activePoster}
            autoPlay
            muted
            loop
            playsInline
            disablePictureInPicture
            preload={isInViewport || isModal ? "auto" : "metadata"}
            onTimeUpdate={handleTimeUpdate}
            className="w-full h-full object-cover transform-gpu will-change-transform"
            onError={(e) => {
              const el = e.target as HTMLVideoElement;
              if (el.src !== window.location.origin + '/assets/hero-reel.mp4') {
                el.src = '/assets/hero-reel.mp4';
              }
            }}
          />

          {/* Fallback Play button if browser rejected initial autoplay */}
          {playRejected && !isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-20">
              <button
                type="button"
                onClick={handleTogglePlay}
                className="w-12 h-12 rounded-full bg-gold hover:bg-gold-light text-black flex items-center justify-center shadow-gold transition-transform hover:scale-110"
                title="Click to play video"
              >
                <Play className="w-5 h-5 fill-current ml-0.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* MINIMAL KBK CONTROLS OVERLAY (Below Video on Mobile, Vibrant & Clear) */}
      {showControls && isDirectVideo && (
        <div
          className={`absolute inset-x-0 bottom-0 p-2 sm:p-3 sm:bg-gradient-to-t sm:from-black/85 sm:via-black/30 sm:to-transparent transition-opacity duration-300 z-20 ${
            isHovered || !isPlaying || hasInteracted ? 'opacity-100' : 'opacity-90 sm:opacity-0 sm:group-hover:opacity-100'
          }`}
        >
          {/* Mini Gold Scrubber Progress Line (Clean below video, non-dimming) */}
          <div
            onClick={handleSeek}
            className="w-full h-1 sm:h-1.5 bg-white/20 hover:h-2 rounded-full cursor-pointer overflow-hidden transition-all mb-1.5 sm:mb-2"
          >
            <div
              className="h-full bg-gold transition-all duration-100 shadow-gold-sm"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Simple Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 sm:gap-1.5">
              <button
                type="button"
                onClick={handleTogglePlay}
                className="p-1 sm:p-1.5 rounded-lg bg-black/80 hover:bg-gold hover:text-black text-ivory-100 border border-gold/30 transition-colors shadow-sm"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> : <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" />}
              </button>

              <button
                type="button"
                onClick={handleToggleMute}
                className="p-1 sm:p-1.5 rounded-lg bg-black/80 hover:bg-gold hover:text-black text-ivory-100 border border-gold/30 transition-colors shadow-sm"
                title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
              >
                {isMuted ? <VolumeX className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> : <Volume2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
              </button>
            </div>

            {onExpand && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onExpand();
                }}
                className="p-1 sm:p-1.5 rounded-lg bg-gold/90 hover:bg-gold text-black shadow-gold font-bold transition-transform hover:scale-105 flex items-center gap-1 text-[9px] sm:text-[10px]"
                title="Open Cinema View"
              >
                <Maximize2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span className="hidden sm:inline">Cinema</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
