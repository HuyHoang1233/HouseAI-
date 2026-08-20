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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(formData);
      router.push('/dashboard');
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.bgGlow} />

      <div className={styles.authContainer}>
        <Link href="/" className={styles.backLink}>← Về trang chủ</Link>
        
        <div className={`${styles.authCard} card-glass animate-fade-in-up`}>
          <div className={styles.authHeader}>
            <div className={styles.authIcon}>🔐</div>
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
              <input
                id="password"
                type="password"
                className="form-input"
                placeholder="Nhập mật khẩu"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block btn-lg"
              disabled={isLoading}
            >
              {isLoading ? 'Đang xử lý...' : 'Đăng nhập'}
            </button>
          </form>

          <div className={styles.authFooter}>
            <p>
              Chưa có tài khoản?{' '}
              <Link href="/register" className={styles.authLink}>
                Đăng ký ngay
              </Link>
            </p>
          </div>

          <div className={styles.demoCredentials}>
            <p className={styles.demoTitle}>🧪 Tài khoản demo:</p>
            <p>Admin: <code>admin</code> / <code>admin123</code></p>
            <p>User: <code>user</code> / <code>user123</code></p>
          </div>
        </div>
      </div>
    </div>
  );
}
