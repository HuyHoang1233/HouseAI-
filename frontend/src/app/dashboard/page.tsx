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
  const [usersList, setUsersList] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');

  const toggleUserStatus = async (userId: number) => {
    try {
      const token = authService.getToken();
      const res = await fetch(`http://localhost:8080/api/users/${userId}/status`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const updatedUser = await res.json();
        setUsersList(prev => prev.map(u => u.id === userId ? updatedUser.data : u));
      } else {
        alert('Có lỗi xảy ra khi cập nhật trạng thái.');
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (isAuthenticated && user?.roles?.includes('ROLE_ADMIN')) {
      const fetchData = async () => {
        try {
          const token = authService.getToken();
          const resQuotes = await fetch('http://localhost:8080/api/admin/quotes', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (resQuotes.ok) {
            const data = await resQuotes.json();
            setQuotes(data.data || []);
          }

          const resUsers = await fetch('http://localhost:8080/api/users', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (resUsers.ok) {
            const data = await resUsers.json();
            setUsersList(data.data || []);
          }
        } catch (error) {
          console.error("Failed to fetch data", error);
        }
      };
      fetchData();
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
          <div onClick={() => setActiveTab('dashboard')} className={`${styles.navItem} ${activeTab === 'dashboard' ? styles.navItemActive : ''}`} style={{cursor: 'pointer'}}>📊 Dashboard</div>
          <div onClick={() => setActiveTab('users')} className={`${styles.navItem} ${activeTab === 'users' ? styles.navItemActive : ''}`} style={{cursor: 'pointer'}}>👥 Users</div>
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
          <h1 className={styles.pageTitle}>
            {activeTab === 'dashboard' ? 'Dashboard' : 'Quản lý người dùng'}
          </h1>
          <p className={styles.pageSubtitle}>Chào mừng, {user?.fullName || user?.username}!</p>
        </header>
        {activeTab === 'dashboard' && (
          <>
            <div className={styles.statsGrid}>
              {[{ l: 'Users', v: usersList.length.toString(), i: '👥' }, { l: 'Revenue', v: '$45.2K', i: '💰' }, { l: 'Projects', v: '89', i: '📋' }, { l: 'Active', v: '342', i: '🟢' }].map(s => (
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
          </>
        )}
        
        {activeTab === 'users' && (
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tên đăng nhập</th>
                  <th>Họ và tên</th>
                  <th>Email</th>
                  <th>Vai trò</th>
                  <th>Ngày tạo</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {usersList.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '30px' }}>Không có người dùng nào.</td>
                  </tr>
                ) : (
                  usersList.map(u => (
                    <tr key={u.id}>
                      <td style={{ fontWeight: 600 }}>#{u.id}</td>
                      <td>{u.username}</td>
                      <td>{u.fullName || '-'}</td>
                      <td>{u.email}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '5px' }}>
                          {u.roles?.map((r: string) => (
                            <span key={r} className={styles.statusBadge} style={{ background: r === 'ROLE_ADMIN' ? '#4f46e5' : '#10b981', color: 'white' }}>
                              {r === 'ROLE_ADMIN' ? 'ADMIN' : 'USER'}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString('vi-VN') : '-'}</td>
                      <td>
                        <span className={styles.statusBadge} style={{ background: u.active ? '#10b981' : '#ef4444', color: 'white' }}>
                          {u.active ? 'Hoạt động' : 'Bị khóa'}
                        </span>
                      </td>
                      <td>
                        <button 
                          onClick={() => toggleUserStatus(u.id)}
                          style={{
                            padding: '4px 10px',
                            borderRadius: '4px',
                            border: 'none',
                            background: u.active ? '#ef4444' : '#10b981',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}
                        >
                          {u.active ? 'Khóa TK' : 'Mở khóa'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

      </main>
    </div>
  );
}
