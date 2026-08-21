'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import styles from '../../auth.module.css';

export default function GoogleOAuthCallbackPage() {
  const router = useRouter();
  const { completeOAuthLogin } = useAuth();
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = params.get('accessToken');
    const refreshToken = params.get('refreshToken');

    window.history.replaceState({}, '', '/oauth2/callback');

    if (!accessToken || !refreshToken) {
      router.replace('/login');
      return;
    }

    completeOAuthLogin(accessToken, refreshToken)
      .then((authData) => {
        router.replace(authData.roles.includes('ROLE_ADMIN') ? '/dashboard' : '/');
      })
      .catch(() => {
        setError('Không thể hoàn tất đăng nhập Google. Vui lòng thử lại.');
      });
  }, [completeOAuthLogin, router]);

  return (
    <main className={styles.authPage}>
      <section className={styles.authContainer}>
        <div className={styles.authCard}>
          <div className={styles.authHeader}>
            <h1 className={styles.authTitle}>Đang đăng nhập với Google</h1>
            <p className={styles.authSubtitle}>
              {error || 'Đang xác thực tài khoản của bạn...'}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
