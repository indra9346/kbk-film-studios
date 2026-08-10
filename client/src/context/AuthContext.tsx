import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';

interface AuthContextType {
  // Owner State
  isOwnerAuthenticated: boolean;
  ownerData: any | null;
  ownerToken: string | null;
  requestOwnerOTP: (identifier: string) => Promise<any>;
  verifyOwnerOTP: (identifier: string, code: string) => Promise<any>;
  ownerLogout: () => void;

  // Client State
  isClientAuthenticated: boolean;
  clientTrackingRef: string | null;
  clientToken: string | null;
  clientName: string | null;
  requestClientOTP: (bookingRef: string, identifier: string) => Promise<any>;
  verifyClientOTP: (bookingRef: string, identifier: string, code: string) => Promise<any>;
  clientLogout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Owner Auth
  const [ownerToken, setOwnerToken] = useState<string | null>(localStorage.getItem('kbk_owner_token'));
  const [ownerData, setOwnerData] = useState<any | null>(() => {
    const saved = localStorage.getItem('kbk_owner_data');
    return saved ? JSON.parse(saved) : null;
  });

  // Client Auth
  const [clientToken, setClientToken] = useState<string | null>(localStorage.getItem('kbk_client_token'));
  const [clientTrackingRef, setClientTrackingRef] = useState<string | null>(localStorage.getItem('kbk_client_ref'));
  const [clientName, setClientName] = useState<string | null>(localStorage.getItem('kbk_client_name'));

  const requestOwnerOTP = async (identifier: string) => {
    return await api.requestOwnerOTP(identifier);
  };

  const verifyOwnerOTP = async (identifier: string, code: string) => {
    const res = await api.verifyOwnerOTP(identifier, code);
    if (res.success && res.token) {
      setOwnerToken(res.token);
      setOwnerData(res.owner);
      localStorage.setItem('kbk_owner_token', res.token);
      localStorage.setItem('kbk_owner_data', JSON.stringify(res.owner));
    }
    return res;
  };

  const ownerLogout = () => {
    setOwnerToken(null);
    setOwnerData(null);
    localStorage.removeItem('kbk_owner_token');
    localStorage.removeItem('kbk_owner_data');
  };

  const requestClientOTP = async (bookingRef: string, identifier: string) => {
    return await api.requestClientOTP(bookingRef, identifier);
  };

  const verifyClientOTP = async (bookingRef: string, identifier: string, code: string) => {
    const res = await api.verifyClientOTP(bookingRef, identifier, code);
    if (res.success && res.clientToken) {
      setClientToken(res.clientToken);
      setClientTrackingRef(res.bookingRef);
      setClientName(res.clientName);
      localStorage.setItem('kbk_client_token', res.clientToken);
      localStorage.setItem('kbk_client_ref', res.bookingRef);
      localStorage.setItem('kbk_client_name', res.clientName);
    }
    return res;
  };

  const clientLogout = () => {
    setClientToken(null);
    setClientTrackingRef(null);
    setClientName(null);
    localStorage.removeItem('kbk_client_token');
    localStorage.removeItem('kbk_client_ref');
    localStorage.removeItem('kbk_client_name');
  };

  return (
    <AuthContext.Provider
      value={{
        isOwnerAuthenticated: Boolean(ownerToken),
        ownerData,
        ownerToken,
        requestOwnerOTP,
        verifyOwnerOTP,
        ownerLogout,

        isClientAuthenticated: Boolean(clientToken && clientTrackingRef),
        clientTrackingRef,
        clientToken,
        clientName,
        requestClientOTP,
        verifyClientOTP,
        clientLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
