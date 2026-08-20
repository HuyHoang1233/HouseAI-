'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import styles from './dashboard.module.css';

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, user, logout, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated) {
    return <div className={styles.loadingPage}><div className={styles.spinner} /><p>Đang tải...</p></div>;
  }

  return (
    <div className={styles.dashboard}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <Link href="/" className={styles.logo}><span className={styles.logoIcon}>◆</span><span>DemoApp</span></Link>
        </div>
        <nav className={styles.sidebarNav}>
          <span className={styles.navLabel}>MENU</span>
          <Link href="/dashboard" className={`${styles.navItem} ${styles.navItemActive}`}>📊 Dashboard</Link>
          <Link href="/dashboard" className={styles.navItem}>👥 Users</Link>
          <Link href="/dashboard" className={styles.navItem}>📋 Projects</Link>
          <span className={styles.navLabel}>SYSTEM</span>
          <Link href="/dashboard" className={styles.navItem}>⚙️ Settings</Link>
        </nav>
        <div className={styles.sidebarFooter}>
          <div className={styles.userCard}>
            <div className={styles.userAvatar}>{(user?.fullName || 'U').charAt(0)}</div>
            <div><p className={styles.userName}>{user?.fullName || user?.username}</p>
            <p className={styles.userRole}>{user?.roles?.includes('ROLE_ADMIN') ? 'Admin' : 'User'}</p></div>
          </div>
          <button onClick={() => { logout(); router.push('/'); }} className={styles.logoutBtn}>Đăng xuất</button>
        </div>
      </aside>
      <main className={styles.main}>
        <header className={styles.header}>
          <h1 className={styles.pageTitle}>Dashboard</h1>
          <p className={styles.pageSubtitle}>Chào mừng, {user?.fullName || user?.username}!</p>
        </header>
        <div className={styles.statsGrid}>
          {[{ l: 'Users', v: '1,234', i: '👥' }, { l: 'Revenue', v: '$45.2K', i: '💰' }, { l: 'Projects', v: '89', i: '📋' }, { l: 'Active', v: '342', i: '🟢' }].map(s => (
            <div key={s.l} className={`${styles.statCard} card`}>
              <span className={styles.statIcon}>{s.i}</span>
              <div><p className={styles.statLabel}>{s.l}</p><h3 className={styles.statValue}>{s.v}</h3></div>
            </div>
          ))}
        </div>
        <div className={`${styles.welcomeCard} card`}>
          <h3>🎉 Setup hoàn tất!</h3>
          <p>Backend: <code>http://localhost:8080/api</code> | Frontend: <code>http://localhost:3000</code></p>
          <p>Swagger: <code>http://localhost:8080/api/swagger-ui.html</code></p>
        </div>
      </main>
    </div>
  );
}
