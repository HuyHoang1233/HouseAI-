import { apiClient } from './api';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  fullName?: string;
  phone?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  userId: number;
  username: string;
  email: string;
  fullName: string;
  roles: string[];
}

export interface UserResponse {
  id: number;
  username: string;
  email: string;
  fullName: string;
  phone: string;
  avatarUrl: string;
  active: boolean;
  roles: string[];
  createdAt: string;
  updatedAt: string;
}

const TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_KEY = 'user';

export const authService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
    const authData = response.data;
    this.saveAuth(authData);
    return authData;
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    const authData = response.data;
    this.saveAuth(authData);
    return authData;
  },

  async getProfile(): Promise<UserResponse> {
    const token = this.getToken();
    const response = await apiClient.get<UserResponse>('/users/me', token || undefined);
    return response.data;
  },

  async sendOtp(email: string): Promise<string> {
    const response = await apiClient.post<string>('/auth/forgot-password/send-otp', { email });
    return response.data;
  },

  async verifyOtp(email: string, otp: string): Promise<boolean> {
    const response = await apiClient.post<boolean>('/auth/forgot-password/verify-otp', { email, otp });
    return response.data;
  },

  async resetPassword(email: string, otp: string, newPassword: string): Promise<string> {
    const response = await apiClient.post<string>('/auth/forgot-password/reset', { email, otp, newPassword });
    return response.data;
  },

  async completeOAuthLogin(accessToken: string, refreshToken: string): Promise<AuthResponse> {
    if (typeof window === 'undefined') {
      throw new Error('Google login can only be completed in the browser.');
    }

    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);

    try {
      const profile = await this.getProfile();
      const authData: AuthResponse = {
        accessToken,
        refreshToken,
        tokenType: 'Bearer',
        userId: profile.id,
        username: profile.username,
        email: profile.email,
        fullName: profile.fullName,
        roles: profile.roles,
      };
      this.saveAuth(authData);
      return authData;
    } catch (error) {
      this.logout();
      throw error;
    }
  },

  saveAuth(data: AuthResponse): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, data.accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
      localStorage.setItem(USER_KEY, JSON.stringify({
        userId: data.userId,
        username: data.username,
        email: data.email,
        fullName: data.fullName,
        roles: data.roles,
      }));
    }
  },

  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  },

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(TOKEN_KEY);
    }
    return null;
  },

  getUser(): Partial<AuthResponse> | null {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem(USER_KEY);
      if (userStr) {
        return JSON.parse(userStr);
      }
    }
    return null;
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};
