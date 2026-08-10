import React from 'react';
import { CheckCircle2, Clock, Film, Palette, Eye, Download, Star, Sparkles, AlertCircle } from 'lucide-react';
import { ServiceProjectStage, StatusHistoryEntry } from '../../types';

interface ServiceTimelineProps {
  currentStage: ServiceProjectStage;
  progressPercent: number;
  statusHistory: StatusHistoryEntry[];
}

interface StageStep {
  key: ServiceProjectStage;
  label: string;
  desc: string;
  icon: any;
}

const STAGES: StageStep[] = [
  { key: 'booking_requested', label: '1. Booking Requested', desc: 'Request submitted for studio review', icon: Clock },
  { key: 'accepted_scheduled', label: '2. Accepted & Scheduled', desc: 'Booking confirmed & slot reserved', icon: CheckCircle2 },
  { key: 'raw_footage_received', label: '3. Footage Ingested', desc: 'Raw camera cards verified on workstation', icon: Film },
  { key: 'in_progress', label: '4. Narrative Edit (Rough Cut)', desc: 'Multi-cam sync & pacing assembly', icon: Film },
  { key: 'color_grading_audio', label: '5. Color Grade & Audio', desc: 'DaVinci 4K color science & sound mastering', icon: Palette },
  { key: 'in_review', label: '6. In Review', desc: 'Private preview ready for client review', icon: Eye },
  { key: 'service_completed', label: '7. Master Exported', desc: 'Full 4K master rendered & QC passed', icon: Sparkles },
  { key: 'files_delivered', label: '8. Delivered to Locker', desc: 'Master files available in private locker', icon: Download },
  { key: 'testimonial_received', label: '9. Completed & Archived', desc: 'Handover complete & review submitted', icon: Star },
];

export const ServiceTimeline: React.FC<ServiceTimelineProps> = ({ currentStage, progressPercent, statusHistory }) => {
  const currentStageIndex = STAGES.findIndex((s) => s.key === currentStage);

  return (
    <div className="space-y-6">
      {/* Progress Bar Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-surface-50">
        <div>
          <span className="text-xs uppercase tracking-widest text-gold font-bold">
            Project Live Lifecycle
          </span>
          <h3 className="font-serif text-lg font-bold text-ivory-100 mt-0.5">
            Stage {currentStageIndex + 1} of 9: {STAGES[currentStageIndex]?.label || currentStage}
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-xs text-ivory-400">Total Completion</span>
            <div className="text-base font-extrabold text-gold">{progressPercent}%</div>
          </div>
          <div className="w-24 h-2.5 bg-surface-100 rounded-full overflow-hidden border border-gold/30">
            <div
              className="h-full bg-gradient-to-r from-gold-dark via-gold to-gold-light transition-all duration-700"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Visual Step Progress Graph */}
      <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-surface-50">
        {STAGES.map((stage, idx) => {
          const isPassed = idx < currentStageIndex;
          const isCurrent = idx === currentStageIndex;
          const isFuture = idx > currentStageIndex;
          const matchingHistory = statusHistory?.find((h) => h.stage === stage.key);
          const Icon = stage.icon;

          return (
            <div key={stage.key} className="relative group">
              {/* Bullet Node */}
              <div
                className={`absolute -left-6 sm:-left-8 top-1 w-6 h-6 rounded-full flex items-center justify-center border transition-all ${
                  isCurrent
                    ? 'bg-gold text-black border-gold shadow-gold-md scale-110 z-10 animate-bounce-subtle'
                    : isPassed
                    ? 'bg-accent-emerald/20 text-accent-emerald border-accent-emerald z-10'
                    : 'bg-surface-100 text-ivory-400 border-surface-50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
              </div>

              {/* Step Card */}
              <div
                className={`p-4 rounded-xl border transition-all ${
                  isCurrent
                    ? 'bg-surface-100/90 border-gold/50 shadow-gold-sm'
                    : isPassed
                    ? 'bg-surface-200/60 border-accent-emerald/25 text-ivory-300'
                    : 'bg-surface-300/40 border-surface-50 opacity-60 text-ivory-400'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <h4 className={`text-sm font-bold ${isCurrent ? 'text-gold' : isPassed ? 'text-ivory-100' : 'text-ivory-400'}`}>
                    {stage.label}
                  </h4>
                  {matchingHistory?.timestamp && (
                    <span className="text-[11px] text-ivory-400">
                      {new Date(matchingHistory.timestamp).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  )}
                </div>

                <p className="text-xs text-ivory-300 mt-1">
                  {matchingHistory?.message || stage.desc}
                </p>

                {matchingHistory?.updatedBy && (
                  <p className="text-[10px] text-ivory-400 mt-2 italic">
                    Updated by: {matchingHistory.updatedBy}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
