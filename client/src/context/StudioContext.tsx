import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ServiceItem, PublicWork, Testimonial, StudioCMSData } from '../types';
import { api } from '../api/client';
import { supabase, isSupabaseConfigured } from '../api/supabaseClient';

interface StudioContextType {
  cms: StudioCMSData | null;
  services: ServiceItem[];
  works: PublicWork[];
  testimonials: Testimonial[];
  isLoading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;

  // Single-active video player state
  activePlayingVideoId: string | null;
  setActivePlayingVideoId: (id: string | null) => void;

  // Selected Service for booking modal
  preSelectedServiceId: string | null;
  setPreSelectedServiceId: (id: string | null) => void;

  // Global Terms Modal
  isTermsModalOpen: boolean;
  setIsTermsModalOpen: (open: boolean) => void;

  // Global Price Clarification Modal
  isPricingClarificationOpen: boolean;
  setIsPricingClarificationOpen: (open: boolean) => void;
  clarificationServiceTitle: string;
  setClarificationServiceTitle: (title: string) => void;
}

const StudioContext = createContext<StudioContextType | undefined>(undefined);

export const StudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cms, setCms] = useState<StudioCMSData | null>(null);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [works, setWorks] = useState<PublicWork[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activePlayingVideoId, setActivePlayingVideoId] = useState<string | null>(null);
  const [preSelectedServiceId, setPreSelectedServiceId] = useState<string | null>(null);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [isPricingClarificationOpen, setIsPricingClarificationOpen] = useState(false);
  const [clarificationServiceTitle, setClarificationServiceTitle] = useState('');

  const refreshData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [cmsData, servicesData, worksData, testimonialsData] = await Promise.all([
        api.getCMS(),
        api.getServices(),
        api.getWorks(),
        api.getTestimonials(),
      ]);
      setCms(cmsData);
      setServices(servicesData);
      setWorks(worksData);
      setTestimonials(testimonialsData);
      setError(null);
    } catch (err: any) {
      console.error('Failed to load studio data:', err);
      setError(err.message || 'Failed to sync studio data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();

    // Supabase Realtime Subscription: Instantly sync changes across all devices
    if (isSupabaseConfigured()) {
      const channel = supabase
        .channel('studio_realtime_sync')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'public_works' }, () => {
          refreshData();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'services' }, () => {
          refreshData();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'testimonials' }, () => {
          refreshData();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'studio_cms' }, () => {
          refreshData();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [refreshData]);

  return (
    <StudioContext.Provider
      value={{
        cms,
        services,
        works,
        testimonials,
        isLoading,
        error,
        refreshData,
        activePlayingVideoId,
        setActivePlayingVideoId,
        preSelectedServiceId,
        setPreSelectedServiceId,
        isTermsModalOpen,
        setIsTermsModalOpen,
        isPricingClarificationOpen,
        setIsPricingClarificationOpen,
        clarificationServiceTitle,
        setClarificationServiceTitle,
      }}
    >
      {children}
    </StudioContext.Provider>
  );
};

export const useStudio = () => {
  const context = useContext(StudioContext);
  if (!context) throw new Error('useStudio must be used within a StudioProvider');
  return context;
};
