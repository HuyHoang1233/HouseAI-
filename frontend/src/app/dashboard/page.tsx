'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/lib/auth';
import { apiClient } from '@/lib/api';
import styles from './dashboard.module.css';

/* ============================================================
   SVG ICON COMPONENTS
   ============================================================ */
const Icons = {
  dashboard: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  ),
  quotes: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" x2="8" y1="13" y2="13" />
      <line x1="16" x2="8" y1="17" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  ),
  users: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  usersGroup: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  clipboard: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="M12 11h4" /><path d="M12 16h4" />
      <path d="M8 11h.01" /><path d="M8 16h.01" />
    </svg>
  ),
  checkCircle: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  bell: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  ),
  clock: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  eye: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  check: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  mail: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  ),
  lock: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  unlock: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 9.9-1" />
    </svg>
  ),
  logout: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" x2="9" y1="12" y2="12" />
    </svg>
  ),
  search: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  ),
  arrowRight: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
    </svg>
  ),
  star: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  bookOpen: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  ),
  x: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18" /><path d="m6 6 12 12" />
    </svg>
  ),
};

/* ============================================================
   CONSTANTS
   ============================================================ */
const serviceTranslations: Record<string, string> = {
  interior: 'Sơn Nội Thất',
  exterior: 'Sơn Ngoại Thất',
  consultation: 'Tư Vấn Màu Sắc',
  repair: 'Xử Lý Bề Mặt',
  commercial: 'Sơn Công Trình',
  decorative: 'Sơn Trang Trí',
};

const REFRESH_INTERVAL = 30000;

/* ============================================================
   HELPERS
   ============================================================ */
function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return 'Vừa xong';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} phút trước`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} giờ trước`;
  return `${Math.floor(seconds / 86400)} ngày trước`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

/* ============================================================
   TOAST COMPONENT
   ============================================================ */
function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error' | 'info'; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  const cls = type === 'success' ? styles.toastSuccess : type === 'error' ? styles.toastError : styles.toastInfo;
  return (
    <div className={`${styles.toast} ${cls}`}>
      <span style={{ width: 18, height: 18, display: 'flex' }}>
        {type === 'success' ? Icons.checkCircle : type === 'error' ? Icons.x : Icons.bell}
      </span>
      <span>{message}</span>
    </div>
  );
}

/* ============================================================
   QUOTE DETAIL MODAL
   ============================================================ */
function QuoteDetailModal({ quote, onClose, onMarkRead, onMarkReplied }: {
  quote: any; onClose: () => void;
  onMarkRead: (id: number) => void;
  onMarkReplied: (id: number) => void;
}) {
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>
            <span style={{ width: 20, height: 20, display: 'flex', color: '#6366f1' }}>{Icons.clipboard}</span>
            Chi tiết yêu cầu #{quote.id}
          </h3>
          <button className={styles.modalClose} onClick={onClose}>
            <span style={{ width: 14, height: 14, display: 'flex' }}>{Icons.x}</span>
          </button>
        </div>
        {[
          ['Khách hàng', quote.customerName],
          ['Số điện thoại', quote.phone],
          ...(quote.email ? [['Email', quote.email]] : []),
          ['Dịch vụ', serviceTranslations[quote.service] || quote.service],
          ['Nội dung yêu cầu', quote.message || 'Không có mô tả'],
          ['Thời gian gửi', formatDateTime(quote.createdAt)],
        ].map(([label, value]) => (
          <div key={label as string} className={styles.modalField}>
            <div className={styles.modalFieldLabel}>{label}</div>
            <div className={styles.modalFieldValue}>{value}</div>
          </div>
        ))}
        <div className={styles.modalField}>
          <div className={styles.modalFieldLabel}>Trạng thái</div>
          <div>
            <span className={`${styles.statusBadge} ${quote.status === 'NEW' ? styles.statusNew : quote.status === 'READ' ? styles.statusRead : styles.statusReplied}`}>
              {quote.status === 'NEW' ? 'Chưa đọc' : quote.status === 'READ' ? 'Đã đọc' : 'Đã trả lời'}
            </span>
          </div>
        </div>
        <div className={styles.modalActions}>
          {quote.status === 'NEW' && (
            <button className={`${styles.actionBtn} ${styles.actionBtnPrimary}`} onClick={() => { onMarkRead(quote.id); onClose(); }}>
              <span style={{ width: 14, height: 14, display: 'flex' }}>{Icons.bookOpen}</span> Đánh dấu đã đọc
            </button>
          )}
          {(quote.status === 'NEW' || quote.status === 'READ') && (
            <button className={`${styles.actionBtn} ${styles.actionBtnSuccess}`} onClick={() => { onMarkReplied(quote.id); onClose(); }}>
              <span style={{ width: 14, height: 14, display: 'flex' }}>{Icons.mail}</span> Đánh dấu đã trả lời
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   CUSTOM CHART TOOLTIP
   ============================================================ */
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e5e7ef',
      borderRadius: '10px',
      padding: '10px 16px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    }}>
      <p style={{ color: '#9098b1', fontSize: '12px', marginBottom: '4px', fontWeight: 500 }}>{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} style={{ color: entry.color, fontSize: '14px', fontWeight: 700 }}>
          Yêu cầu: {entry.value}
        </p>
      ))}
    </div>
  );
}

/* ============================================================
   MAIN DASHBOARD
   ============================================================ */
export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, user, logout, isLoading } = useAuth();

  const [quotes, setQuotes] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [selectedQuote, setSelectedQuote] = useState<any | null>(null);
  const [quoteSearch, setQuoteSearch] = useState('');
  const [quoteFilter, setQuoteFilter] = useState('ALL');
  const [userSearch, setUserSearch] = useState('');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchData = useCallback(async () => {
    if (!isAuthenticated || !user?.roles?.includes('ROLE_ADMIN')) return;
    try {
      const token = authService.getToken();
      const [quotesRes, usersRes] = await Promise.all([
        apiClient.get<any[]>('/admin/quotes', token || undefined),
        apiClient.get<any[]>('/users', token || undefined),
      ]);
      setQuotes(quotesRes.data || []);
      setUsersList(usersRes.data || []);
    } catch (error) {
      console.error('Failed to fetch data', error);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) { router.push('/login'); return; }
    if (isAuthenticated && user?.roles?.includes('ROLE_ADMIN')) {
      fetchData();
      const id = setInterval(fetchData, REFRESH_INTERVAL);
      return () => clearInterval(id);
    }
  }, [isAuthenticated, isLoading, router, user, fetchData]);

  const chartData = useMemo(() => {
    const data = Array.from({ length: 12 }, (_, i) => ({ name: `Tháng ${i + 1}`, projects: 0 }));
    const yr = new Date().getFullYear();
    quotes.forEach(q => {
      const d = new Date(q.createdAt);
      if (d.getFullYear() === yr) data[d.getMonth()].projects += 1;
    });
    return data;
  }, [quotes]);

  const serviceStats = useMemo(() => {
    const map: Record<string, number> = {};
    quotes.forEach(q => { const k = q.service || 'other'; map[k] = (map[k] || 0) + 1; });
    return Object.entries(map)
      .map(([key, count]) => ({ label: serviceTranslations[key] || key, value: count, percent: quotes.length ? Math.round((count / quotes.length) * 100) : 0 }))
      .sort((a, b) => b.value - a.value);
  }, [quotes]);

  const donutColors = ['#6366f1', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#8b5cf6'];

  const newQuotesCount = quotes.filter(q => q.status === 'NEW').length;
  const repliedQuotesCount = quotes.filter(q => q.status === 'REPLIED').length;
  const activeUsersCount = usersList.filter(u => u.active).length;

  const filteredQuotes = useMemo(() => {
    let result = [...quotes];
    if (quoteFilter !== 'ALL') result = result.filter(q => q.status === quoteFilter);
    if (quoteSearch.trim()) {
      const s = quoteSearch.toLowerCase();
      result = result.filter(q =>
        q.customerName?.toLowerCase().includes(s) || q.phone?.includes(s) ||
        q.email?.toLowerCase().includes(s) || (serviceTranslations[q.service] || q.service)?.toLowerCase().includes(s)
      );
    }
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [quotes, quoteFilter, quoteSearch]);

  const filteredUsers = useMemo(() => {
    if (!userSearch.trim()) return usersList;
    const s = userSearch.toLowerCase();
    return usersList.filter(u => u.username?.toLowerCase().includes(s) || u.fullName?.toLowerCase().includes(s) || u.email?.toLowerCase().includes(s));
  }, [usersList, userSearch]);

  const recentActivity = useMemo(() =>
    [...quotes].sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime()).slice(0, 5),
    [quotes]
  );

  const showToast = (message: string, type: 'success' | 'error' | 'info') => setToast({ message, type });

  const toggleUserStatus = async (userId: number) => {
    try {
      const token = authService.getToken();
      const data = await apiClient.put<any>(`/users/${userId}/status`, {}, token || undefined);
      setUsersList(prev => prev.map(u => u.id === userId ? data.data : u));
      showToast('Cập nhật trạng thái thành công!', 'success');
    } catch { showToast('Có lỗi xảy ra.', 'error'); }
  };

  const markQuoteAsRead = async (quoteId: number) => {
    try {
      const token = authService.getToken();
      const data = await apiClient.put<any>(`/admin/quotes/${quoteId}/read`, {}, token || undefined);
      setQuotes(prev => prev.map(q => q.id === quoteId ? data.data : q));
      showToast('Đã đánh dấu đọc!', 'success');
    } catch { showToast('Có lỗi xảy ra.', 'error'); }
  };

  const markQuoteAsReplied = async (quoteId: number) => {
    try {
      const token = authService.getToken();
      const data = await apiClient.put<any>(`/admin/quotes/${quoteId}/replied`, {}, token || undefined);
      setQuotes(prev => prev.map(q => q.id === quoteId ? data.data : q));
      showToast('Đã đánh dấu trả lời!', 'success');
    } catch { showToast('Có lỗi xảy ra.', 'error'); }
  };

  if (isLoading || !isAuthenticated) {
    return <div className={styles.loadingPage}><div className={styles.spinner} /><p>Đang tải...</p></div>;
  }

  return (
    <div className={styles.dashboard}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {selectedQuote && (
        <QuoteDetailModal quote={selectedQuote} onClose={() => setSelectedQuote(null)} onMarkRead={markQuoteAsRead} onMarkReplied={markQuoteAsReplied} />
      )}

      {/* ===== SIDEBAR ===== */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <Link href="/" className={styles.logo}>
            <span className={styles.logoIcon}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </span>
            <span>Sơn Nano</span>
          </Link>
        </div>

        <nav className={styles.sidebarNav}>
          <span className={styles.navLabel}>Tổng quan</span>
          <div onClick={() => setActiveTab('dashboard')} className={`${styles.navItem} ${activeTab === 'dashboard' ? styles.navItemActive : ''}`}>
            <span className={styles.navIcon}>{Icons.dashboard}</span> Dashboard
          </div>

          <span className={styles.navLabel}>Quản lý</span>
          <div onClick={() => setActiveTab('quotes')} className={`${styles.navItem} ${activeTab === 'quotes' ? styles.navItemActive : ''}`}>
            <span className={styles.navIcon}>{Icons.quotes}</span> Yêu cầu báo giá
            {newQuotesCount > 0 && <span className={styles.navBadge}>{newQuotesCount}</span>}
          </div>
          <div onClick={() => setActiveTab('users')} className={`${styles.navItem} ${activeTab === 'users' ? styles.navItemActive : ''}`}>
            <span className={styles.navIcon}>{Icons.users}</span> Người dùng
          </div>
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userCard}>
            <div className={styles.userAvatar}>{(user?.fullName || 'A').charAt(0)}</div>
            <div>
              <p className={styles.userName}>{user?.fullName || user?.username}</p>
              <p className={styles.userRole}>Administrator</p>
            </div>
          </div>
          <button onClick={() => { logout(); router.push('/'); }} className={styles.logoutBtn}>
            <span style={{ width: 16, height: 16, display: 'flex' }}>{Icons.logout}</span> Đăng xuất
          </button>
        </div>
      </aside>

      {/* ===== MAIN ===== */}
      <main className={styles.main}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <h1 className={styles.pageTitle}>
              <span className={styles.pageTitleIcon}>
                {activeTab === 'dashboard' && Icons.dashboard}
                {activeTab === 'quotes' && Icons.quotes}
                {activeTab === 'users' && Icons.users}
              </span>
              {activeTab === 'dashboard' && 'Dashboard'}
              {activeTab === 'quotes' && 'Yêu cầu báo giá'}
              {activeTab === 'users' && 'Quản lý người dùng'}
            </h1>
            <p className={styles.pageSubtitle}>Xin chào, {user?.fullName || user?.username}! Chúc bạn một ngày làm việc hiệu quả.</p>
          </div>
          <div className={styles.headerRight}>
            <div className={styles.refreshIndicator}>
              <span className={styles.liveDot} />
              <span>Trực tuyến</span>
            </div>
            <span className={styles.currentTime}>
              {currentTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>
        </header>

        {/* ========== DASHBOARD TAB ========== */}
        {activeTab === 'dashboard' && (
          <>
            <div className={styles.statsGrid}>
              {[
                { icon: Icons.usersGroup, cls: styles.statIcon1, val: usersList.length, label: `Người dùng · ${activeUsersCount} hoạt động` },
                { icon: Icons.clipboard, cls: styles.statIcon2, val: quotes.length, label: 'Tổng yêu cầu báo giá' },
                { icon: Icons.checkCircle, cls: styles.statIcon3, val: repliedQuotesCount, label: 'Đã phản hồi' },
                { icon: Icons.bell, cls: styles.statIcon4, val: newQuotesCount, label: 'Chờ xử lý' },
              ].map((s, i) => (
                <div key={i} className={styles.statCard}>
                  <div className={styles.statCardTop}>
                    <div className={`${styles.statIcon} ${s.cls}`}>{s.icon}</div>
                  </div>
                  <div className={styles.statValue}>{s.val}</div>
                  <div className={styles.statLabel}>{s.label}</div>
                </div>
              ))}
            </div>

            <div className={styles.chartSection}>
              <div className={styles.chartCard}>
                <div className={styles.chartHeader}>
                  <div>
                    <h3 className={styles.chartTitle}>Thống kê yêu cầu — Năm {new Date().getFullYear()}</h3>
                    <p className={styles.chartSubtitle}>Tăng trưởng theo tháng</p>
                  </div>
                </div>
                <div style={{ height: '280px', width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="gradArea" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#6366f1" stopOpacity={0.2} />
                          <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7ef" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9098b1', fontSize: 12 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9098b1', fontSize: 12 }} dx={-5} allowDecimals={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="projects" name="projects" stroke="#6366f1" fill="url(#gradArea)" strokeWidth={2.5}
                        activeDot={{ r: 6, fill: '#6366f1', stroke: '#c7d2fe', strokeWidth: 3 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className={styles.donutCard}>
                <div className={styles.chartHeader}>
                  <div>
                    <h3 className={styles.chartTitle}>Phân bổ dịch vụ</h3>
                    <p className={styles.chartSubtitle}>Theo loại dịch vụ</p>
                  </div>
                </div>
                <div className={styles.donutStats}>
                  {serviceStats.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '20px', color: '#9098b1', fontSize: '13px' }}>Chưa có dữ liệu</div>
                  ) : (
                    serviceStats.map((s, i) => (
                      <div key={s.label} className={styles.donutStatItem}>
                        <div className={styles.donutDot} style={{ background: donutColors[i % donutColors.length] }} />
                        <span className={styles.donutStatLabel}>{s.label}</span>
                        <span className={styles.donutStatValue}>{s.value}</span>
                        <span className={styles.donutStatPercent}>{s.percent}%</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className={styles.recentSection}>
              <div className={styles.recentHeader}>
                <h3 className={styles.recentTitle}>
                  <span style={{ width: 18, height: 18, display: 'flex', color: '#6366f1' }}>{Icons.clock}</span>
                  Hoạt động gần đây
                </h3>
                <button className={styles.viewAllBtn} onClick={() => setActiveTab('quotes')}>Xem tất cả →</button>
              </div>
              <div className={styles.activityList}>
                {recentActivity.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '30px', color: '#9098b1', fontSize: '13px' }}>Chưa có hoạt động nào</div>
                ) : (
                  recentActivity.map(q => (
                    <div key={q.id} className={styles.activityItem} onClick={() => setSelectedQuote(q)} style={{ cursor: 'pointer' }}>
                      <div className={`${styles.activityIcon} ${q.status === 'NEW' ? styles.activityIconNew : q.status === 'READ' ? styles.activityIconRead : styles.activityIconReplied}`}>
                        {q.status === 'NEW' ? Icons.bell : q.status === 'READ' ? Icons.bookOpen : Icons.checkCircle}
                      </div>
                      <div className={styles.activityContent}>
                        <div className={styles.activityText}><strong>{q.customerName}</strong> — {serviceTranslations[q.service] || q.service}</div>
                        <div className={styles.activityTime}>{timeAgo(q.updatedAt || q.createdAt)}</div>
                      </div>
                      <span className={`${styles.statusBadge} ${q.status === 'NEW' ? styles.statusNew : q.status === 'READ' ? styles.statusRead : styles.statusReplied}`}>
                        {q.status === 'NEW' ? 'Mới' : q.status === 'READ' ? 'Đã đọc' : 'Đã trả lời'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}

        {/* ========== QUOTES TAB ========== */}
        {activeTab === 'quotes' && (
          <div className={styles.tableContainer}>
            <div className={styles.tableToolbar}>
              <span className={styles.tableTitle}>
                Danh sách yêu cầu <span className={styles.tableCount}>{filteredQuotes.length}</span>
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <div className={styles.filterGroup}>
                  {(['ALL', 'NEW', 'READ', 'REPLIED'] as const).map(f => (
                    <button key={f} className={`${styles.filterBtn} ${quoteFilter === f ? styles.filterBtnActive : ''}`} onClick={() => setQuoteFilter(f)}>
                      {f === 'ALL' ? 'Tất cả' : f === 'NEW' ? 'Mới' : f === 'READ' ? 'Đã đọc' : 'Đã trả lời'}
                    </button>
                  ))}
                </div>
                <div className={styles.searchBox}>
                  <span style={{ width: 16, height: 16, display: 'flex', color: '#9098b1' }}>{Icons.search}</span>
                  <input className={styles.searchInput} placeholder="Tìm theo tên, SĐT, email..." value={quoteSearch} onChange={e => setQuoteSearch(e.target.value)} />
                </div>
              </div>
            </div>
            <table className={styles.table}>
              <thead><tr><th>#</th><th>Khách hàng</th><th>Liên hệ</th><th>Dịch vụ</th><th>Mô tả</th><th>Ngày gửi</th><th>Trạng thái</th><th>Hành động</th></tr></thead>
              <tbody>
                {filteredQuotes.length === 0 ? (
                  <tr><td colSpan={8}>
                    <div className={styles.emptyState}>
                      <div className={styles.emptyIcon} style={{ display: 'flex', justifyContent: 'center' }}>
                        <span style={{ width: 44, height: 44, display: 'flex', color: '#d0d4e0' }}>{Icons.clipboard}</span>
                      </div>
                      <div className={styles.emptyText}>Không có yêu cầu nào</div>
                      <div className={styles.emptySubtext}>{quoteSearch || quoteFilter !== 'ALL' ? 'Thử thay đổi bộ lọc hoặc từ khóa' : 'Chưa có yêu cầu báo giá nào'}</div>
                    </div>
                  </td></tr>
                ) : (
                  filteredQuotes.map(q => (
                    <tr key={q.id}>
                      <td className={styles.tableTextPrimary}>{q.id}</td>
                      <td className={styles.tableTextPrimary}>{q.customerName}</td>
                      <td><div>{q.phone}</div>{q.email && <div className={styles.tableTextSmall}>{q.email}</div>}</td>
                      <td>{serviceTranslations[q.service] || q.service}</td>
                      <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.message || '—'}</td>
                      <td style={{ whiteSpace: 'nowrap' }}>{formatDate(q.createdAt)}</td>
                      <td>
                        <span className={`${styles.statusBadge} ${q.status === 'NEW' ? styles.statusNew : q.status === 'READ' ? styles.statusRead : styles.statusReplied}`}>
                          {q.status === 'NEW' ? 'Chưa đọc' : q.status === 'READ' ? 'Đã đọc' : 'Đã trả lời'}
                        </span>
                      </td>
                      <td>
                        <div className={styles.actionGroup}>
                          <button className={`${styles.actionBtn} ${styles.actionBtnPrimary}`} onClick={() => setSelectedQuote(q)}>
                            <span style={{ width: 14, height: 14, display: 'flex' }}>{Icons.eye}</span> Xem
                          </button>
                          {q.status === 'NEW' && (
                            <button className={`${styles.actionBtn} ${styles.actionBtnSuccess}`} onClick={() => markQuoteAsRead(q.id)}>
                              <span style={{ width: 14, height: 14, display: 'flex' }}>{Icons.check}</span> Đọc
                            </button>
                          )}
                          {(q.status === 'NEW' || q.status === 'READ') && (
                            <button className={`${styles.actionBtn} ${styles.actionBtnSuccess}`} onClick={() => markQuoteAsReplied(q.id)}>
                              <span style={{ width: 14, height: 14, display: 'flex' }}>{Icons.mail}</span> Phản hồi
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ========== USERS TAB ========== */}
        {activeTab === 'users' && (
          <div className={styles.tableContainer}>
            <div className={styles.tableToolbar}>
              <span className={styles.tableTitle}>
                Danh sách người dùng <span className={styles.tableCount}>{filteredUsers.length}</span>
              </span>
              <div className={styles.searchBox}>
                <span style={{ width: 16, height: 16, display: 'flex', color: '#9098b1' }}>{Icons.search}</span>
                <input className={styles.searchInput} placeholder="Tìm theo tên, email..." value={userSearch} onChange={e => setUserSearch(e.target.value)} />
              </div>
            </div>
            <table className={styles.table}>
              <thead><tr><th>ID</th><th>Người dùng</th><th>Email</th><th>Vai trò</th><th>Ngày tạo</th><th>Trạng thái</th><th>Hành động</th></tr></thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr><td colSpan={7}>
                    <div className={styles.emptyState}>
                      <div className={styles.emptyIcon} style={{ display: 'flex', justifyContent: 'center' }}>
                        <span style={{ width: 44, height: 44, display: 'flex', color: '#d0d4e0' }}>{Icons.users}</span>
                      </div>
                      <div className={styles.emptyText}>Không tìm thấy người dùng</div>
                      <div className={styles.emptySubtext}>Thử thay đổi từ khóa tìm kiếm</div>
                    </div>
                  </td></tr>
                ) : (
                  filteredUsers.map(u => (
                    <tr key={u.id}>
                      <td className={styles.tableTextPrimary}>#{u.id}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '34px', height: '34px', borderRadius: '10px',
                            background: u.roles?.includes('ROLE_ADMIN') ? 'linear-gradient(135deg, #6366f1, #818cf8)' : 'linear-gradient(135deg, #10b981, #34d399)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'white', fontWeight: 700, fontSize: '13px', flexShrink: 0,
                          }}>
                            {(u.fullName || u.username || '?').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className={styles.tableTextPrimary}>{u.fullName || '—'}</div>
                            <div className={styles.tableTextSmall}>@{u.username}</div>
                          </div>
                        </div>
                      </td>
                      <td>{u.email}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                          {u.roles?.map((r: string) => (
                            <span key={r} className={`${styles.roleBadge} ${r === 'ROLE_ADMIN' ? styles.roleAdmin : styles.roleUser}`}>
                              {r === 'ROLE_ADMIN' ? 'ADMIN' : 'USER'}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>{u.createdAt ? formatDate(u.createdAt) : '—'}</td>
                      <td>
                        <span className={`${styles.statusBadge} ${u.active ? styles.statusActive : styles.statusLocked}`}>
                          {u.active ? 'Hoạt động' : 'Bị khóa'}
                        </span>
                      </td>
                      <td>
                        <button className={`${styles.actionBtn} ${u.active ? styles.actionBtnDanger : styles.actionBtnSuccess}`} onClick={() => toggleUserStatus(u.id)}>
                          <span style={{ width: 14, height: 14, display: 'flex' }}>{u.active ? Icons.lock : Icons.unlock}</span>
                          {u.active ? 'Khóa' : 'Mở khóa'}
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
