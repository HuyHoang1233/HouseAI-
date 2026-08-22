'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/lib/auth';
import styles from './dashboard.module.css';

const serviceTranslations: Record<string, string> = {
  interior: 'Sơn Nội Thất',
  exterior: 'Sơn Ngoại Thất',
  consultation: 'Tư Vấn Màu Sắc',
  repair: 'Xử Lý Bề Mặt',
  commercial: 'Sơn Công Trình',
  decorative: 'Sơn Trang Trí'
const baseRevenueData = [
  { name: 'Tháng 1', revenue: 14000, projects: 24, monthNum: 1 },
  { name: 'Tháng 2', revenue: 23000, projects: 43, monthNum: 2 },
  { name: 'Tháng 3', revenue: 19000, projects: 31, monthNum: 3 },
  { name: 'Tháng 4', revenue: 27800, projects: 49, monthNum: 4 },
  { name: 'Tháng 5', revenue: 18900, projects: 28, monthNum: 5 },
  { name: 'Tháng 6', revenue: 33900, projects: 68, monthNum: 6 },
  { name: 'Tháng 7', revenue: 34900, projects: 63, monthNum: 7 },
  { name: 'Tháng 8', revenue: 45200, projects: 89, monthNum: 8 },
];

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, user, logout, isLoading } = useAuth();

  const [quotes, setQuotes] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [chartData, setChartData] = useState(baseRevenueData);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalProjects, setTotalProjects] = useState(0);

  useEffect(() => {
    // Mix historical base data with real database records for the chart and stats
    const newChartData = baseRevenueData.map(d => ({ ...d }));
    let realRev = 0;
    
    quotes.forEach(q => {
      const date = new Date(q.createdAt);
      const m = date.getMonth() + 1;
      const year = date.getFullYear();
      
      if (year === 2026) {
        const targetMonth = newChartData.find(x => x.monthNum === m);
        if (targetMonth) {
          targetMonth.projects += 1;
          targetMonth.revenue += 1500; // Estimate $1.5k per project request
        }
      }
      realRev += 1500;
    });
    
    setChartData(newChartData);
    
    const baseRev = baseRevenueData.reduce((acc, curr) => acc + curr.revenue, 0);
    const baseProj = baseRevenueData.reduce((acc, curr) => acc + curr.projects, 0);
    
    setTotalRevenue(baseRev + realRev);
    setTotalProjects(baseProj + quotes.length);
  }, [quotes]);

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

  const markQuoteAsRead = async (quoteId: number) => {
    try {
      const token = authService.getToken();
      const res = await fetch(`http://localhost:8080/api/admin/quotes/${quoteId}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const updatedQuote = await res.json();
        setQuotes(prev => prev.map(q => q.id === quoteId ? updatedQuote.data : q));
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
          <div onClick={() => setActiveTab('quotes')} className={`${styles.navItem} ${activeTab === 'quotes' ? styles.navItemActive : ''}`} style={{cursor: 'pointer'}}>📝 Yêu cầu báo giá</div>
          <div onClick={() => setActiveTab('users')} className={`${styles.navItem} ${activeTab === 'users' ? styles.navItemActive : ''}`} style={{cursor: 'pointer'}}>👥 Người dùng</div>
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
            {activeTab === 'dashboard' && 'Dashboard'}
            {activeTab === 'users' && 'Quản lý người dùng'}
            {activeTab === 'quotes' && 'Yêu cầu từ khách hàng'}
          </h1>
          <p className={styles.pageSubtitle}>Chào mừng, {user?.fullName || user?.username}!</p>
        </header>
        {activeTab === 'dashboard' && (
          <>
            <div className={styles.statsGrid}>
              {[
                { l: 'Người dùng', v: usersList.length.toString(), i: '👥' }, 
                { l: 'Doanh thu', v: `$${(totalRevenue / 1000).toFixed(1)}K`, i: '💰' }, 
                { l: 'Dự án (Yêu cầu)', v: totalProjects.toString(), i: '📋' }, 
                { l: 'Yêu cầu mới', v: quotes.filter(q => q.status === 'NEW').length.toString(), i: '🟢' }
              ].map(s => (
                <div key={s.l} className={`${styles.statCard} card`}>
                  <span className={styles.statIcon}>{s.i}</span>
                  <div><p className={styles.statLabel}>{s.l}</p><h3 className={styles.statValue}>{s.v}</h3></div>
                </div>
              ))}
            </div>
            
            <div style={{ marginTop: '30px', background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#111827' }}>Thống Kê Doanh Thu & Dự Án (Năm 2026)</h2>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '4px' }}>Biểu đồ thống kê tăng trưởng trong 8 tháng qua</p>
              </div>
              <div style={{ height: '350px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartData}
                    margin={{
                      top: 10,
                      right: 30,
                      left: 0,
                      bottom: 0,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 13 }} dy={10} />
                    <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 13 }} dx={-10} tickFormatter={(value) => `$${value/1000}k`} />
                    <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 13 }} dx={10} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      formatter={(value, name) => [name === 'revenue' ? `$${value}` : value, name === 'revenue' ? 'Doanh thu' : 'Dự án']}
                    />
                    <Area yAxisId="left" type="monotone" dataKey="revenue" name="revenue" stroke="#e8702a" fill="#e8702a" fillOpacity={0.15} strokeWidth={3} activeDot={{ r: 6, fill: '#e8702a' }} />
                    <Area yAxisId="right" type="monotone" dataKey="projects" name="projects" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} strokeWidth={2} activeDot={{ r: 5, fill: '#3b82f6' }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}

        {activeTab === 'quotes' && (
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
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {quotes.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '30px' }}>Chưa có yêu cầu báo giá nào.</td>
                  </tr>
                ) : (
                  quotes.map(q => (
                    <tr key={q.id}>
                      <td style={{ fontWeight: 600 }}>{q.customerName}</td>
                      <td>
                        <div>{q.phone}</div>
                        <div style={{ fontSize: '12px', color: '#888' }}>{q.email}</div>
                      </td>
                      <td>{serviceTranslations[q.service] || q.service}</td>
                      <td style={{ maxWidth: '250px' }}>{q.message}</td>
                      <td>{new Date(q.createdAt).toLocaleDateString('vi-VN')}</td>
                      <td>
                        <span className={`${styles.statusBadge} ${q.status === 'NEW' ? styles.statusNew : styles.statusRead}`}>
                          {q.status === 'NEW' ? 'Chưa đọc' : (q.status === 'READ' ? 'Đã đọc' : 'Đã trả lời')}
                        </span>
                      </td>
                      <td>
                        {q.status === 'NEW' && (
                          <button 
                            onClick={() => markQuoteAsRead(q.id)}
                            style={{
                              padding: '4px 10px', borderRadius: '4px', border: 'none',
                              background: '#3b82f6', color: 'white', cursor: 'pointer',
                              fontSize: '12px', fontWeight: 'bold'
                            }}
                          >
                            Đánh dấu đã đọc
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
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
