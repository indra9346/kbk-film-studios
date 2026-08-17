import React, { useRef, useEffect, useState } from 'react';
import { X, Calendar, MapPin, Layers, Volume2, VolumeX, Play, Pause, RotateCcw, RotateCw, Maximize, ExternalLink } from 'lucide-react';
import { PublicWork } from '../../types';
import { getVideoType, getCleanVideoUrl, getDirectStreamUrl, extractDriveFileId } from './VideoCard';

interface VideoModalProps {
  work: PublicWork | null;
  onClose: () => void;
}

export const VideoModal: React.FC<VideoModalProps> = ({ work, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [useIframeFallback, setUseIframeFallback] = useState(false);

  useEffect(() => {
    setUseIframeFallback(false);
    setIsPlaying(true);
    setCurrentTime(0);
    setDuration(0);
  }, [work]);

  if (!work) return null;

  const media = getVideoType(work.videoUrl);
  const driveId = media.type === 'google-drive' ? media.id : extractDriveFileId(work.videoUrl);
  const isGoogleDrive = Boolean(driveId || work.videoSourceType === 'google_drive' || work.videoUrl?.includes('drive.google.com'));

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const skipTime = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + seconds));
    }
  };

  const toggleFullscreen = () => {
    if (playerContainerRef.current) {
      if (!document.fullscreenElement) {
        playerContainerRef.current.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/95 backdrop-blur-2xl animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[94vh] flex flex-col bg-surface-200 border border-gold/40 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden">
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-surface-50 bg-surface-100/95 z-20">
          <div className="flex items-center gap-2 sm:gap-3 overflow-hidden">
            <span className="px-2.5 py-0.5 rounded-md bg-gold/15 text-gold text-[10px] sm:text-xs font-bold uppercase tracking-wider border border-gold/30 shrink-0">
              {work.category}
            </span>
            <h3 className="font-serif font-bold text-sm sm:text-base text-white truncate">
              {work.title}
            </h3>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {isGoogleDrive && driveId && (
              <a
                href={`https://drive.google.com/file/d/${driveId}/view`}
                target="_blank"
                rel="noreferrer"
                className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-surface-200 hover:bg-gold hover:text-black text-ivory-300 text-[11px] font-semibold transition-colors"
                title="Open original Drive video"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Drive</span>
              </a>
            )}
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-xl bg-surface-200 hover:bg-gold hover:text-black text-ivory-300 transition-colors"
              title="Close Cinema View"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Player Section with YouTube-style Bottom Controls */}
        <div
          ref={playerContainerRef}
          className="relative aspect-video w-full bg-black flex items-center justify-center group overflow-hidden"
        >
          {media.type === 'youtube' && media.id ? (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${media.id}?autoplay=1&mute=0&controls=1&rel=0&playsinline=1`}
              title={work.title}
              className="w-full h-full object-contain border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : isGoogleDrive && driveId && useIframeFallback ? (
            <iframe
              src={`https://drive.google.com/file/d/${driveId}/preview`}
              title={work.title}
              className="w-full h-full object-contain border-0"
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          ) : (
            <>
              <video
                ref={videoRef}
                src={isGoogleDrive ? getDirectStreamUrl(work.videoUrl) : getCleanVideoUrl(work.videoUrl)}
                poster={work.thumbnailUrl || '/assets/kbk-logo.jpg'}
                autoPlay
                playsInline
                onClick={togglePlay}
                onError={() => setUseIframeFallback(true)}
                onTimeUpdate={() => {
                  if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
                }}
                onLoadedMetadata={() => {
                  if (videoRef.current) {
                    setDuration(videoRef.current.duration);
                    videoRef.current.play().catch(() => {});
                  }
                }}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                className="w-full h-full object-contain cursor-pointer"
              />

              {/* YouTube-Style Bottom Control Overlay */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 sm:p-4 space-y-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {/* Gold Progress Trackbar */}
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={0}
                    max={duration || 100}
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full h-1.5 bg-surface-100 rounded-lg appearance-none cursor-pointer accent-gold focus:outline-none"
                  />
                </div>

                {/* Controls Bar */}
                <div className="flex items-center justify-between text-white text-xs">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <button
                      onClick={togglePlay}
                      className="p-1 hover:text-gold transition-colors"
                      title={isPlaying ? 'Pause' : 'Play'}
                    >
                      {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
                    </button>

                    <button
                      onClick={() => skipTime(-10)}
                      className="p-1 hover:text-gold transition-colors hidden sm:block"
                      title="Rewind 10s"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => skipTime(10)}
                      className="p-1 hover:text-gold transition-colors hidden sm:block"
                      title="Forward 10s"
                    >
                      <RotateCw className="w-4 h-4" />
                    </button>

                    <button
                      onClick={toggleMute}
                      className="p-1 hover:text-gold transition-colors"
                      title={isMuted ? 'Unmute' : 'Mute'}
                    >
                      {isMuted ? <VolumeX className="w-5 h-5 text-accent-crimson" /> : <Volume2 className="w-5 h-5" />}
                    </button>

                    <span className="text-[11px] text-ivory-300 font-mono">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={toggleFullscreen}
                      className="p-1 hover:text-gold transition-colors"
                      title="Fullscreen"
                    >
                      <Maximize className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Details & Creative Breakdown */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 bg-surface-200/95 text-xs sm:text-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-ivory-300">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-gold" />
                {work.eventLocation || 'Hindupur, AP'}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-gold" />
                {work.eventYear || '2026'}
              </span>
            </div>
          </div>

          <div>
            <h4 className="font-serif font-bold text-xs sm:text-sm text-gold uppercase tracking-wider mb-1">
              Film Narrative & Post-Production Treatment
            </h4>
            <p className="text-ivory-200 leading-relaxed font-light text-xs sm:text-sm">
              {work.description || 'Master color graded and cinematic pace edited luxury wedding film.'}
            </p>
          </div>

          {/* Software & Grading Suites */}
          <div className="pt-2 border-t border-surface-50 flex flex-wrap items-center gap-2">
            <span className="text-[11px] sm:text-xs text-ivory-400 font-medium flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-gold" /> Post-Production Stack:
            </span>
            {work.softwareUsed && work.softwareUsed.length > 0 ? (
              work.softwareUsed.map((item, idx) => (
                <span key={idx} className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg bg-surface-100 text-ivory-300 border border-gold/20 text-[10px] sm:text-xs font-mono">
                  {item}
                </span>
              ))
            ) : (
              <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg bg-surface-100 text-gold/80 border border-gold/20 text-[10px] sm:text-xs font-mono">
                DaVinci Resolve Studio • Premiere Pro
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
