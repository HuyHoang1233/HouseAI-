'use client';

import { useState, FormEvent, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/auth';
import styles from '../auth.module.css';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  
  // Step 1: Email
  const [email, setEmail] = useState('');
  
  // Step 2: OTP
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  // Step 3: New Password
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const getPasswordStrength = (p: string) => {
    if (!p) return 0;
    let s = 0;
    if (p.length >= 6) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    return s;
  };
  const strength = getPasswordStrength(newPassword);

  const handleSendOtp = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    try {
      await authService.sendOtp(email);
      setMessage('Mã OTP đã được gửi đến email của bạn.');
      setStep(2);
    } catch (err: unknown) {
      const errorObj = err as { message?: string, status?: number };
      if (errorObj.status === 404) {
        setError('Email không tồn tại trong hệ thống.');
      } else if (errorObj.status === 400) {
        setError(errorObj.message || 'Dữ liệu không hợp lệ.');
      } else {
        setError('Không thể kết nối đến máy chủ. Vui lòng thử lại sau.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    const fullOtp = otp.join('');
    if (fullOtp.length < 6) {
      setError('Vui lòng nhập đủ mã OTP 6 số.');
      return;
    }

    setIsLoading(true);
    try {
      await authService.verifyOtp(email, fullOtp);
      setMessage('Xác thực thành công. Vui lòng nhập mật khẩu mới.');
      setStep(3);
    } catch (err: unknown) {
      const errorObj = err as { message?: string, status?: number };
      if (errorObj.status === 400) {
        setError('Mã OTP không hợp lệ hoặc đã hết hạn.');
      } else {
        setError('Không thể kết nối đến máy chủ. Vui lòng thử lại sau.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }
    if (strength < 3) {
      setError('Vui lòng chọn mật khẩu đủ mạnh theo yêu cầu.');
      return;
    }

    setIsLoading(true);
    try {
      await authService.resetPassword(email, otp.join(''), newPassword);
      setMessage('Đổi mật khẩu thành công. Đang chuyển hướng...');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: unknown) {
      const errorObj = err as { message?: string, status?: number };
      if (errorObj.status === 400) {
        setError(errorObj.message || 'Dữ liệu không hợp lệ.');
      } else {
        setError('Không thể kết nối đến máy chủ. Vui lòng thử lại sau.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP input
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Only numbers
    
    const newOtp = [...otp];
    // Take only the last character if they pasted or typed quickly
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Move to next input
    if (value && index < 5 && otpRefs.current[index + 1]) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0 && otpRefs.current[index - 1]) {
      // Move to previous input on backspace if current is empty
      otpRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.authContainer} style={{ maxWidth: step === 3 ? '650px' : '440px' }}>
        <Link href="/login" className={styles.backLink}>← Quay lại đăng nhập</Link>

        <div className={styles.authCard}>
          <div className={styles.authHeader}>
            <div className={styles.animatedLogo}>
              <div className={styles.glowRingOuter}></div>
              <div className={styles.glowRing}></div>
              <div className={styles.logoCenter}></div>
            </div>
            <h1 className={styles.authTitle}>Quên mật khẩu</h1>
            <p className={styles.authSubtitle}>
              {step === 1 && 'Khôi phục tài khoản của bạn'}
              {step === 2 && 'Nhập mã xác nhận'}
              {step === 3 && 'Tạo mật khẩu mới'}
            </p>
          </div>

          {error && (
            <div className={styles.errorAlert}>
              {error}
            </div>
          )}

          {message && (
            <div className={styles.errorAlert} style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.25)' }}>
              {message}
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleSendOtp} className={styles.authForm}>
              <div className="form-group">
                <label htmlFor="email" className="form-label">Email</label>
                <input
                  id="email"
                  type="email"
                  className="form-input"
                  placeholder="Nhập địa chỉ email của bạn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary btn-block btn-lg"
                disabled={isLoading}
              >
                {isLoading ? 'Đang gửi...' : 'Nhận mã xác nhận'}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className={styles.authForm}>
              <div className="form-group">
                <label className="form-label" style={{ textAlign: 'center', display: 'block', marginBottom: '16px' }}>
                  Nhập mã 6 số được gửi tới<br /><strong>{email}</strong>
                </label>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '24px' }}>
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => { otpRefs.current[index] = el; }}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      style={{
                        width: '45px',
                        height: '55px',
                        fontSize: '1.5rem',
                        textAlign: 'center',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        backgroundColor: '#f8fafc',
                        fontWeight: '600'
                      }}
                      required
                    />
                  ))}
                </div>
              </div>
              <button
                type="submit"
                className="btn btn-primary btn-block btn-lg"
                disabled={isLoading || otp.join('').length < 6}
              >
                {isLoading ? 'Đang kiểm tra...' : 'Xác thực mã'}
              </button>
              <div style={{ textAlign: 'center', marginTop: '16px' }}>
                <button 
                  type="button" 
                  onClick={() => setStep(1)} 
                  style={{ background: 'none', border: 'none', color: '#6366f1', cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  Nhập lại email khác
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleResetPassword} className={styles.authForm}>
              <div className={styles.formRow}>
                <div className="form-group">
                  <label htmlFor="newPassword" className="form-label">Mật khẩu mới *</label>
                  <input
                    id="newPassword"
                    type="password"
                    className="form-input"
                    placeholder="Nhập mật khẩu mới"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                  {newPassword && (
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
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-block btn-lg"
                disabled={isLoading}
              >
                {isLoading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
