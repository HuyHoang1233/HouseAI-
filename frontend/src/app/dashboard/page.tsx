'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/lib/auth';
import styles from './dashboard.module.css';

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, user, logout, isLoading } = useAuth();

  const [quotes, setQuotes] = useState<any[]>([]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (isAuthenticated && user?.roles?.includes('ROLE_ADMIN')) {
      const fetchQuotes = async () => {
        try {
          const token = authService.getToken();
          const res = await fetch('http://localhost:8080/api/admin/quotes', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            setQuotes(data.data || []);
          }
        } catch (error) {
          console.error("Failed to fetch quotes", error);
        }
      };
      fetchQuotes();
    }
  }, [isAuthenticated, isLoading, router, user]);

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
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Khách hàng</th>
                <th>Liên hệ</th>
                <th>Dịch vụ</th>
                <th>Mô tả</th>
                <th>Ngày gửi</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {quotes.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '30px' }}>Chưa có yêu cầu báo giá nào.</td>
                </tr>
              ) : (
                quotes.map(q => (
                  <tr key={q.id}>
                    <td style={{ fontWeight: 600 }}>{q.customerName}</td>
                    <td>
                      <div>{q.phone}</div>
                      <div style={{ fontSize: '12px', color: '#888' }}>{q.email}</div>
                    </td>
                    <td>{q.service}</td>
                    <td style={{ maxWidth: '250px' }}>{q.message}</td>
                    <td>{new Date(q.createdAt).toLocaleDateString('vi-VN')}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${q.status === 'NEW' ? styles.statusNew : styles.statusRead}`}>
                        {q.status === 'NEW' ? 'Chưa trả lời' : 'Đã đọc'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
