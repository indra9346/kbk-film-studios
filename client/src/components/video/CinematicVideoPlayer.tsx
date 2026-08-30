import React, { useState, useRef, useEffect, useCallback, useId } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Image as ImageIcon,
  Film,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Zap,
  Gauge
} from 'lucide-react';
import { extractDriveFileId, getVideoType, isImageMedia, getCleanVideoUrl } from './VideoCard';
import { useStudio } from '../../context/StudioContext';

export interface CinematicVideoPlayerProps {
  id?: string;
  url?: string;
  poster?: string;
  title?: string;
  category?: string;
  aspectRatio?: '16/9' | '9/16' | 'auto';
  autoPlayOnScroll?: boolean;
  isModal?: boolean;
  showControls?: boolean;
  defaultSpeed?: number;
  className?: string;
  onExpand?: () => void;
}

export const CinematicVideoPlayer: React.FC<CinematicVideoPlayerProps> = ({
  id,
  url = '',
  poster,
  title = 'KBK Cinematic Film',
  category,
  aspectRatio = '16/9',
  autoPlayOnScroll = true,
  isModal = false,
  showControls = true,
  defaultSpeed = 2, // 2x playback speed by default for fast, engaging wedding showcase preview
  className = '',
  onExpand
}) => {
  const generatedId = useId();
  const playerId = id || `${title}-${url}-${generatedId}`;

  const { activeAudiblePlayerId, setActiveAudiblePlayerId } = useStudio();

  const [isPlaying, setIsPlaying] = useState(true);
  // STRICTLY MUTED BY DEFAULT FOR ALL VIDEOS
  const [isMuted, setIsMuted] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(defaultSpeed);
  const [progress, setProgress] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [playRejected, setPlayRejected] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isInViewport, setIsInViewport] = useState(isModal);
  const [isMediaLoaded, setIsMediaLoaded] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const trimmedUrl = (url || '').trim();
  const isPic = isImageMedia(trimmedUrl);
  const mediaInfo = getVideoType(trimmedUrl);
  const driveId = mediaInfo.type === 'google-drive' ? mediaInfo.id : extractDriveFileId(trimmedUrl);
  const isGoogleDrive = Boolean(driveId || trimmedUrl.includes('drive.google.com') || trimmedUrl.includes('docs.google.com'));
  const isYouTube = mediaInfo.type === 'youtube' && Boolean(mediaInfo.id);
  const isDirectVideo = !isPic && !isGoogleDrive && !isYouTube;

  const activePoster = poster || undefined;



  // Helper to send commands to YouTube iFrame via postMessage
  const postToYouTube = useCallback((func: string, args: any = '') => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      try {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func, args }),
          '*'
        );
      } catch (_) {}
    }
  }, []);

  // SINGLE ACTIVE AUDIO CHANNEL ENFORCEMENT:
  // If another video on the page becomes audible, immediately MUTE this video
  useEffect(() => {
    if (activeAudiblePlayerId && activeAudiblePlayerId !== playerId) {
      setIsMuted(true);
      if (videoRef.current) {
        videoRef.current.muted = true;
      }
      postToYouTube('mute');
    }
  }, [activeAudiblePlayerId, playerId, postToYouTube]);

  // Viewport Observer for Lazy Streaming
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
      { rootMargin: '200px', threshold: [0, 0.15, 0.5] }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [isModal]);

  // Apply Playback Speed & Guaranteed Muted Autoplay on HTML5 Video
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // ALWAYS STRICTLY MUTED BY DEFAULT
    video.defaultMuted = true;
    video.muted = isMuted;
    video.loop = true;
    video.playsInline = true;
    video.playbackRate = playbackSpeed;

    const startPlayback = () => {
      video.muted = isMuted;
      video.playbackRate = playbackSpeed;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            setPlayRejected(false);
            if (videoRef.current) {
              videoRef.current.playbackRate = playbackSpeed;
            }
          })
          .catch((err) => {
            console.warn('[KBK Video] Autoplay note:', err.message);
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
  }, [trimmedUrl, isInViewport, playbackSpeed, isMuted]);

  // Manage YouTube iframe when leaving viewport or closing modal
  useEffect(() => {
    if (isYouTube) {
      if (isInViewport) {
        if (isPlaying) {
          postToYouTube('playVideo');
        } else {
          postToYouTube('pauseVideo');
        }
        if (isMuted) {
          postToYouTube('mute');
        } else {
          postToYouTube('unMute');
        }
      } else {
        postToYouTube('pauseVideo');
        postToYouTube('mute');
      }
    }
  }, [isYouTube, isInViewport, isPlaying, isMuted, postToYouTube]);

  // Clean-up: stop any playing media when unmounting
  useEffect(() => {
    return () => {
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.muted = true;
      }
      postToYouTube('pauseVideo');
      postToYouTube('mute');
    };
  }, [postToYouTube]);

  // Track progress on direct HTML5 video
  const handleTimeUpdate = () => {
    if (videoRef.current && videoRef.current.duration) {
      setProgress((videoRef.current.currentTime / videoRef.current.duration) * 100);
    }
  };

  const handleTogglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    setHasInteracted(true);

    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play().then(() => {
          setIsPlaying(true);
          setPlayRejected(false);
          if (videoRef.current) videoRef.current.playbackRate = playbackSpeed;
        });
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }

    if (isYouTube) {
      if (isPlaying) {
        postToYouTube('pauseVideo');
        setIsPlaying(false);
      } else {
        postToYouTube('playVideo');
        setIsPlaying(true);
      }
    }
  };

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    setHasInteracted(true);
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);

    if (!nextMuted) {
      // User explicitly requested Sound for THIS player -> tell context to mute all other players
      setActiveAudiblePlayerId(playerId);
    } else {
      if (activeAudiblePlayerId === playerId) {
        setActiveAudiblePlayerId(null);
      }
    }

    if (videoRef.current) {
      videoRef.current.muted = nextMuted;
    }

    if (isYouTube) {
      postToYouTube(nextMuted ? 'mute' : 'unMute');
    }
  };

  const handleToggleSpeed = (e: React.MouseEvent) => {
    e.stopPropagation();
    setHasInteracted(true);
    const nextSpeed = playbackSpeed === 2 ? 1 : playbackSpeed === 1 ? 1.5 : 2;
    setPlaybackSpeed(nextSpeed);
    if (videoRef.current) {
      videoRef.current.playbackRate = nextSpeed;
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (!videoRef.current || !videoRef.current.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    videoRef.current.currentTime = pos * videoRef.current.duration;
    setProgress(pos * 100);
  };

  // Determine what video source to render for optimal fast performance
  const directSrc = isDirectVideo ? getCleanVideoUrl(trimmedUrl) : '';

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
              (e.target as HTMLImageElement).src = '/assets/founder.jpg';
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
        /* CASE 2: YOUTUBE (100% Guaranteed Muted Loop + Autoplay) */
        <div className="w-full h-full relative overflow-hidden bg-black pointer-events-auto flex items-center justify-center">
          {isInViewport || isModal ? (
            <iframe
              ref={iframeRef}
              src={`https://www.youtube-nocookie.com/embed/${mediaInfo.id}?enablejsapi=1&autoplay=1&mute=1&loop=1&playlist=${mediaInfo.id}&controls=${isModal ? 1 : 0}&modestbranding=1&rel=0&playsinline=1&iv_load_policy=3&disablekb=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`}
              title={title}
              loading="lazy"
              className={`w-full h-full ${aspectRatio === '9/16' ? 'object-contain max-w-[280px]' : 'object-cover scale-105'} border-0`}
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

          {/* YouTube Speed Badge */}
          <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 pointer-events-none">
            <span className="px-2 py-0.5 rounded-full bg-black/80 text-gold text-[10px] font-mono font-bold tracking-wider border border-gold/40 backdrop-blur-md flex items-center gap-1 shadow-md">
              <Zap className="w-2.5 h-2.5 fill-gold" />
              <span>YOUTUBE HD</span>
            </span>
          </div>
        </div>
      ) : directSrc ? (
        /* CASE 3: ULTRA FAST DIRECT 2X AUTOPLAY HTML5 VIDEO (100% Strictly Muted Loop Autoplay) */
        <div className="relative w-full h-full bg-black flex items-center justify-center">
          <video
            ref={videoRef}
            src={directSrc}
            poster={activePoster}
            autoPlay
            muted
            loop
            playsInline
            disablePictureInPicture
            preload="auto"
            onLoadedData={() => {
              setIsMediaLoaded(true);
              if (videoRef.current && (isInViewport || isModal)) {
                videoRef.current.muted = isMuted;
                videoRef.current.playbackRate = playbackSpeed;
                videoRef.current.play().catch(() => {});
              }
            }}
            onTimeUpdate={handleTimeUpdate}
            className="w-full h-full object-cover transform-gpu will-change-transform"
          />

          {/* 2X Speed Indicator Badge on Top Right */}
          <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleToggleSpeed}
              className="px-2 py-0.5 rounded-full bg-black/80 hover:bg-gold hover:text-black text-gold text-[10px] font-mono font-bold tracking-wider border border-gold/40 backdrop-blur-md flex items-center gap-1 shadow-md transition-all active:scale-95"
              title="Click to toggle 2x / 1.5x / 1x playback speed"
            >
              <Zap className="w-2.5 h-2.5 fill-gold group-hover:fill-black" />
              <span>{playbackSpeed}x SPEED</span>
            </button>
          </div>

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
      ) : isGoogleDrive ? (
        /* CASE 4: GOOGLE DRIVE PREVIEW EMBED (Strictly Muted preview) */
        <div className="w-full h-full relative overflow-hidden bg-black flex items-center justify-center pointer-events-auto">
          {isInViewport || isModal ? (
            <iframe
              src={
                trimmedUrl.includes('folders')
                  ? `https://drive.google.com/embeddedfolderview?id=${driveId}#grid`
                  : `https://drive.google.com/file/d/${driveId}/preview`
              }
              title={title}
              loading="lazy"
              className="w-full h-full object-cover border-0"
              allow="autoplay; fullscreen; encrypted-media"
              allowFullScreen
            />
          ) : (
            <div className="w-full h-full bg-surface-200/80 animate-pulse flex items-center justify-center text-ivory-400 text-xs font-mono">
              Loading Film...
            </div>
          )}
        </div>
      ) : (
        <div className="w-full h-full bg-surface-200 flex items-center justify-center text-ivory-400 text-xs font-mono">
          <span>Ready to Preview</span>
        </div>
      )}

      {/* CONTROLS OVERLAY (Sound Toggle, 2x Toggle, Scrubber, Cinema Modal) */}
      {showControls && (directSrc || isYouTube) && (
        <div
          className={`absolute inset-x-0 bottom-0 p-2 sm:p-3 sm:bg-gradient-to-t sm:from-black/85 sm:via-black/30 sm:to-transparent transition-opacity duration-300 z-20 ${
            isHovered || !isPlaying || hasInteracted ? 'opacity-100' : 'opacity-90 sm:opacity-0 sm:group-hover:opacity-100'
          }`}
        >
          {/* Mini Gold Scrubber Progress Line for Direct Videos */}
          {directSrc && (
            <div
              onClick={handleSeek}
              className="w-full h-1 sm:h-1.5 bg-white/20 hover:h-2 rounded-full cursor-pointer overflow-hidden transition-all mb-1.5 sm:mb-2"
            >
              <div
                className="h-full bg-gold transition-all duration-100 shadow-gold-sm"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {/* Simple Touch Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 sm:gap-1.5">
              <button
                type="button"
                onClick={handleTogglePlay}
                className="p-1 sm:p-1.5 rounded-lg bg-black/80 hover:bg-gold hover:text-black text-ivory-100 border border-gold/30 transition-colors shadow-sm"
                title={isPlaying ? 'Pause Video & Mute' : 'Play Video'}
              >
                {isPlaying ? <Pause className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> : <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" />}
              </button>

              <button
                type="button"
                onClick={handleToggleMute}
                className={`p-1 sm:p-1.5 rounded-lg border transition-colors shadow-sm flex items-center gap-1 text-[10px] font-bold ${
                  !isMuted ? 'bg-gold text-black border-gold' : 'bg-black/80 hover:bg-gold hover:text-black text-ivory-100 border-gold/30'
                }`}
                title={isMuted ? 'Unmute Audio (Plays single sound)' : 'Mute Audio'}
              >
                {isMuted ? <VolumeX className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> : <Volume2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
                <span className="text-[9px] uppercase hidden xs:inline">{isMuted ? 'Muted' : 'Sound ON'}</span>
              </button>

              {directSrc && (
                <button
                  type="button"
                  onClick={handleToggleSpeed}
                  className="px-2 py-1 rounded-lg bg-black/80 hover:bg-gold hover:text-black text-gold text-[10px] font-mono font-bold border border-gold/30 transition-colors shadow-sm flex items-center gap-0.5"
                  title="Toggle playback speed"
                >
                  <Gauge className="w-3 h-3" />
                  <span>{playbackSpeed}x</span>
                </button>
              )}
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
                <span className="hidden sm:inline">Cinema View</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
