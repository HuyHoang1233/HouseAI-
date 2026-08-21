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

    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    if (!/[A-Z]/.test(formData.password)) {
      setError('Mật khẩu phải chứa ít nhất một ký tự viết hoa');
      return;
    }

    if (!/[0-9]/.test(formData.password)) {
      setError('Mật khẩu phải chứa ít nhất một chữ số');
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
      router.push('/');
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

  const getPasswordStrength = (p: string) => {
    if (!p) return 0;
    let s = 0;
    if (p.length >= 6) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    return s;
  };
  const strength = getPasswordStrength(formData.password);

  return (
    <div className={styles.authPage}>
      <div className={styles.authContainer} style={{ maxWidth: '650px' }}>
        <Link href="/" className={styles.backLink}>← Về trang chủ</Link>

        <div className={styles.authCard}>
          <div className={styles.authHeader}>
            <div className={styles.animatedLogo}>
              <div className={styles.glowRingOuter}></div>
              <div className={styles.glowRing}></div>
              <div className={styles.logoCenter}></div>
            </div>
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

            <div className={styles.formRow}>
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
            </div>

            <div className={styles.formRow}>
              <div className="form-group">
                <label htmlFor="password" className="form-label">Mật khẩu *</label>
                <input
                  id="password"
                  type="password"
                  className="form-input"
                  placeholder="Nhập mật khẩu"
                  value={formData.password}
                  onChange={(e) => updateField('password', e.target.value)}
                  required
                  minLength={6}
                />
                {formData.password && (
                  <div style={{ display: 'flex', gap: '4px', marginTop: '8px' }}>
                    {[1, 2, 3].map((level) => (
                      <div key={level} style={{
                        flex: 1,
                        height: '4px',
                        borderRadius: '2px',
                        backgroundColor: strength >= level 
                          ? (strength === 1 ? '#ef4444' : strength === 2 ? '#f59e0b' : '#10b981')
                          : '#e2e8f0',
                        transition: 'background-color 0.3s'
                      }} />
                    ))}
                  </div>
                )}
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
