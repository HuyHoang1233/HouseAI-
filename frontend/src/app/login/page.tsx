'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import styles from '../auth.module.css';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const authData = await login(formData);
      if (authData.roles && authData.roles.includes('ROLE_ADMIN')) {
        router.push('/dashboard');
      } else {
        router.push('/');
      }
    } catch (err: unknown) {
      const error = err as { message?: string };
      let displayMsg = error.message || 'Đăng nhập thất bại. Vui lòng thử lại.';
      
      if (displayMsg.toLowerCase().includes('user is disabled') || displayMsg.toLowerCase().includes('account is locked')) {
        displayMsg = 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.';
      } else if (displayMsg === 'Failed to fetch' || displayMsg.toLowerCase().includes('network error')) {
        displayMsg = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại backend.';
      } else {
        displayMsg = 'Tài khoản hoặc mật khẩu không hợp lệ...';
      }
      
      setError(displayMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setIsGoogleLoading(true);

    try {
      const response = await fetch('/api/auth/oauth2/google/status', { cache: 'no-store' });
      const text = await response.text();
      let payload;
      try {
        payload = JSON.parse(text);
      } catch (e) {
        throw new Error('Invalid JSON from server: ' + text.substring(0, 50));
      }

      if (!response.ok || !payload.data) {
        throw new Error('Google login is not configured');
      }

      window.location.assign('/api/oauth2/authorization/google');
    } catch (err: unknown) {
      const e = err as Error;
      console.error('Google login error:', e);
      setError('Lỗi kết nối tới hệ thống đăng nhập. Vui lòng thử lại sau.');
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.authContainer}>
        <Link href="/" className={styles.backLink}>← Về trang chủ</Link>

        <div className={styles.authCard}>
          <div className={styles.authHeader}>
            <div className={styles.animatedLogo}>
              <div className={styles.glowRingOuter}></div>
              <div className={styles.glowRing}></div>
              <div className={styles.logoCenter}></div>
            </div>
            <h1 className={styles.authTitle}>Đăng nhập</h1>
            <p className={styles.authSubtitle}>Chào mừng bạn quay lại</p>
          </div>

          {error && (
            <div className={styles.errorAlert}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.authForm}>
            <div className="form-group">
              <label htmlFor="username" className="form-label">Tên đăng nhập</label>
              <input
                id="username"
                type="text"
                className="form-input"
                placeholder="Nhập tên đăng nhập"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">Mật khẩu</label>
              <div className={styles.passwordWrapper}>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="form-input"
                  placeholder="Nhập mật khẩu"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
                {formData.password.length > 0 && (
                  <button 
                    type="button" 
                    className={styles.passwordToggle}
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    )}
                  </button>
                )}
              </div>
              <Link href="/forgot-password" className={styles.authLink} style={{ fontSize: '0.85rem', fontWeight: 500, display: 'block', marginTop: '8px', textAlign: 'right' }}>
                Quên mật khẩu?
              </Link>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block btn-lg"
              disabled={isLoading}
            >
              {isLoading ? 'Đang xử lý...' : 'Đăng nhập'}
            </button>
          </form>

          <div className={styles.authDivider}>hoặc</div>

          <button
            type="button"
            className={styles.googleButton}
            onClick={handleGoogleLogin}
            disabled={isLoading || isGoogleLoading}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M21.35 12.27c0-.79-.07-1.55-.2-2.27H12v4.3h5.23a4.47 4.47 0 0 1-1.94 2.93v2.79h3.59c2.1-1.94 3.31-4.8 3.31-8.17Z" />
              <path fill="#34A853" d="M12 21.76c2.62 0 4.82-.87 6.43-2.36l-3.59-2.79c-.99.67-2.26 1.07-3.84 1.07-2.95 0-5.45-1.99-6.34-4.67H.95v2.88A9.71 9.71 0 0 0 12 21.76Z" />
              <path fill="#FBBC05" d="M5.66 13.01A5.84 5.84 0 0 1 5.3 11c0-.7.12-1.38.36-2.01V6.11H1.95A9.76 9.76 0 0 0 1 11c0 1.75.47 3.39.95 4.89l3.71-2.88Z" />
              <path fill="#EA4335" d="M12 4.32c1.73 0 3.28.6 4.5 1.77l3.38-3.38C16.81.84 14.62.24 12 .24A9.71 9.71 0 0 0 1.95 6.11l3.71 2.88C6.55 6.31 9.05 4.32 12 4.32Z" />
            </svg>
            {isGoogleLoading ? 'Đang chuyển đến Google...' : 'Tiếp tục với Google'}
          </button>

          <div className={styles.authFooter}>
            <p>
              Chưa có tài khoản?{' '}
              <Link href="/register" className={styles.authLink}>
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
