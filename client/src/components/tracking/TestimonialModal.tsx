import React, { useState } from 'react';
import { X, Star, Sparkles, Send, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../../api/client';

interface TestimonialModalProps {
  bookingRef: string;
  clientName: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmitted: () => void;
}

export const TestimonialModal: React.FC<TestimonialModalProps> = ({
  bookingRef,
  clientName,
  isOpen,
  onClose,
  onSubmitted
}) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [location, setLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewText.trim()) {
      setErrorMessage('Please write a brief feedback review');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage('');
      await api.submitClientTestimonial({
        bookingRef,
        clientName,
        rating,
        reviewText,
        videoUrl
      });

      // Trigger celebratory confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });

      setSubmittedSuccess(true);
      setTimeout(() => {
        onSubmitted();
        onClose();
      }, 2500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit testimonial');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-surface-200 border border-gold/40 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-ivory-400 hover:text-white rounded-full bg-surface-100 hover:bg-surface-50 border border-gold/20 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {submittedSuccess ? (
          <div className="text-center py-8 space-y-3">
            <div className="w-16 h-16 mx-auto rounded-full bg-accent-emerald/20 text-accent-emerald border border-accent-emerald flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-ivory-100">
              Thank You, {clientName}!
            </h3>
            <p className="text-xs text-ivory-300">
              Your feedback has been added to our studio archives and verified for the public website.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <span className="text-xs font-bold text-gold uppercase tracking-widest">
                Service Handover Completed
              </span>
              <h3 className="font-serif text-xl font-bold text-ivory-100">
                Share Your Experience with KBK Film Studios
              </h3>
              <p className="text-xs text-ivory-400">
                Your review helps future couples and clients trust Kurudi Bharath Kumar's post-production artistry.
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-lg bg-accent-crimson/15 text-accent-crimson border border-accent-crimson/30 text-xs">
                {errorMessage}
              </div>
            )}

            {/* Star Rating Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-ivory-300">Your Rating</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 transition-transform hover:scale-125"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        (hoverRating || rating) >= star
                          ? 'text-gold fill-gold drop-shadow-sm'
                          : 'text-surface-50'
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 text-xs font-bold text-gold">
                  {rating === 5 ? 'Exceptional (5/5)' : `${rating} Stars`}
                </span>
              </div>
            </div>

            {/* Review Comments */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-ivory-300">
                Feedback & Review <span className="text-gold">*</span>
              </label>
              <textarea
                rows={4}
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="How was the editing quality, color grading, pacing, and turnaround time?"
                className="w-full px-4 py-3 rounded-xl bg-surface-100 border border-gold/20 text-ivory-100 text-xs sm:text-sm placeholder:text-ivory-400 focus:outline-none focus:border-gold transition-colors"
                required
              />
            </div>

            {/* Video Testimonial Link (Optional) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-ivory-300">
                Video Feedback Link (Optional)
              </label>
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="YouTube, Google Drive, or Instagram Reel link"
                className="w-full px-4 py-2.5 rounded-xl bg-surface-100 border border-gold/20 text-ivory-100 text-xs sm:text-sm placeholder:text-ivory-400 focus:outline-none focus:border-gold transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl bg-gold hover:bg-gold-light text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-gold-sm transition-all duration-300 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Submitting Feedback...</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Client Review</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
