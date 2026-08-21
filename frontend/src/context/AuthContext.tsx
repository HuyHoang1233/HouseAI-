'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authService, AuthResponse, LoginRequest, RegisterRequest, UserResponse } from '@/lib/auth';

interface AuthContextType {
  user: Partial<AuthResponse> | null;
  profile: UserResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<AuthResponse>;
  register: (data: RegisterRequest) => Promise<void>;
  completeOAuthLogin: (accessToken: string, refreshToken: string) => Promise<AuthResponse>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Partial<AuthResponse> | null>(null);
  const [profile, setProfile] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing auth on mount
    const savedUser = authService.getUser();
    queueMicrotask(() => {
      if (savedUser) {
        setUser(savedUser);
      }
      setIsLoading(false);
    });
  }, []);

  const refreshProfile = useCallback(async () => {
    try {
      const userProfile = await authService.getProfile();
      setProfile(userProfile);
    } catch {
      // Token might be expired
      authService.logout();
      setUser(null);
      setProfile(null);
    }
  }, []);

  const login = async (data: LoginRequest): Promise<AuthResponse> => {
    const authData = await authService.login(data);
    setUser({
      userId: authData.userId,
      username: authData.username,
      email: authData.email,
      fullName: authData.fullName,
      roles: authData.roles,
    });
    return authData;
  };

  const register = async (data: RegisterRequest) => {
    const authData = await authService.register(data);
    setUser({
      userId: authData.userId,
      username: authData.username,
      email: authData.email,
      fullName: authData.fullName,
      roles: authData.roles,
    });
  };

  const completeOAuthLogin = useCallback(async (accessToken: string, refreshToken: string) => {
    const authData = await authService.completeOAuthLogin(accessToken, refreshToken);
    setUser({
      userId: authData.userId,
      username: authData.username,
      email: authData.email,
      fullName: authData.fullName,
      roles: authData.roles,
    });
    setProfile({
      id: authData.userId,
      username: authData.username,
      email: authData.email,
      fullName: authData.fullName,
      phone: '',
      avatarUrl: '',
      active: true,
      roles: authData.roles,
      createdAt: '',
      updatedAt: '',
    });
    return authData;
  }, []);

  const logout = () => {
    authService.logout();
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        completeOAuthLogin,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
