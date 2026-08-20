'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import styles from '../auth.module.css';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    setIsLoading(true);

    try {
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        phone: formData.phone,
      });
      router.push('/dashboard');
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.bgGlow} />

      <div className={styles.authContainer}>
        <Link href="/" className={styles.backLink}>← Về trang chủ</Link>

        <div className={`${styles.authCard} card-glass animate-fade-in-up`}>
          <div className={styles.authHeader}>
            <div className={styles.authIcon}>✨</div>
            <h1 className={styles.authTitle}>Đăng ký</h1>
            <p className={styles.authSubtitle}>Tạo tài khoản mới</p>
          </div>

          {error && (
            <div className={styles.errorAlert}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.authForm}>
            <div className={styles.formRow}>
              <div className="form-group">
                <label htmlFor="fullName" className="form-label">Họ và tên</label>
                <input
                  id="fullName"
                  type="text"
                  className="form-input"
                  placeholder="Nguyễn Văn A"
                  value={formData.fullName}
                  onChange={(e) => updateField('fullName', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="phone" className="form-label">Số điện thoại</label>
                <input
                  id="phone"
                  type="tel"
                  className="form-input"
                  placeholder="0912345678"
                  value={formData.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="username" className="form-label">Tên đăng nhập *</label>
              <input
                id="username"
                type="text"
                className="form-input"
                placeholder="Nhập tên đăng nhập"
                value={formData.username}
                onChange={(e) => updateField('username', e.target.value)}
                required
                minLength={3}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">Email *</label>
              <input
                id="email"
                type="email"
                className="form-input"
                placeholder="email@example.com"
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
                required
              />
            </div>

            <div className={styles.formRow}>
              <div className="form-group">
                <label htmlFor="password" className="form-label">Mật khẩu *</label>
                <input
                  id="password"
                  type="password"
                  className="form-input"
                  placeholder="Ít nhất 6 ký tự"
                  value={formData.password}
                  onChange={(e) => updateField('password', e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">Xác nhận mật khẩu *</label>
                <input
                  id="confirmPassword"
                  type="password"
                  className="form-input"
                  placeholder="Nhập lại mật khẩu"
                  value={formData.confirmPassword}
                  onChange={(e) => updateField('confirmPassword', e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block btn-lg"
              disabled={isLoading}
            >
              {isLoading ? 'Đang xử lý...' : 'Đăng ký'}
            </button>
          </form>

          <div className={styles.authFooter}>
            <p>
              Đã có tài khoản?{' '}
              <Link href="/login" className={styles.authLink}>
                Đăng nhập
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
