import { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Toaster } from '../components/ui/sonner';
import OmniflowBadge from '../components/custom/OmniflowBadge';
import { API_BASE_URL } from '../config/constants';

type View = 'dashboard' | 'data' | 'indicators' | 'risk' | 'reports' | 'config' | 'profile';
type RiskLevel = 'red' | 'orange' | 'yellow' | 'none';

const RISK_LABELS: Record<RiskLevel, string> = { red: '红色高危', orange: '橙色预警', yellow: '黄色预警', none: '无风险' };
const RISK_COLORS: Record<RiskLevel, string> = {
  red: 'text-red-500 bg-red-500/10 border-red-500/20',
  orange: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
  yellow: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  none: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
};
const RISK_DOT: Record<RiskLevel, string> = {
  red: 'bg-red-500', orange: 'bg-orange-500', yellow: 'bg-yellow-400', none: 'bg-emerald-500',
};

const MOCK_DETECTIONS = [
  { id: 1, company: '北京某科技有限公司', period: '2025年度', indicators: 108, risk: 'red' as RiskLevel, time: '09:14' },
  { id: 2, company: '上海贸易集团股份公司', period: '2025年度', indicators: 108, risk: 'orange' as RiskLevel, time: '08:57' },
  { id: 3, company: '广州制造业有限责任公司', period: '2025年度', indicators: 108, risk: 'yellow' as RiskLevel, time: '08:43' },
  { id: 4, company: '深圳新能源科技集团', period: '2025年度', indicators: 108, risk: 'none' as RiskLevel, time: '08:31' },
  { id: 5, company: '杭州互联网科技有限公司', period: '2025年度', indicators: 108, risk: 'none' as RiskLevel, time: '08:19' },
];

const MOCK_INDICATORS = [
  { id: 1, name: '营收增长率', code: 'REV_GROWTH', category: '收入类', value: '+187.3%', industry: '+12.4%', deviation: '+174.9%', risk: 'red' as RiskLevel },
  { id: 2, name: '应收账款周转率', code: 'AR_TURNOVER', category: '资产类', value: '1.23', industry: '8.67', deviation: '-85.8%', risk: 'red' as RiskLevel },
  { id: 3, name: '固定资产增长率', code: 'FA_GROWTH', category: '资产类', value: '+68.2%', industry: '+15.3%', deviation: '+52.9%', risk: 'orange' as RiskLevel },
  { id: 4, name: '毛利率', code: 'GROSS_MARGIN', category: '盈利类', value: '42.1%', industry: '28.6%', deviation: '+13.5%', risk: 'yellow' as RiskLevel },
  { id: 5, name: '资产负债率', code: 'DEBT_RATIO', category: '负债类', value: '38.4%', industry: '41.2%', deviation: '-2.8%', risk: 'none' as RiskLevel },
  { id: 6, name: '现金流量比率', code: 'CASH_RATIO', category: '现金类', value: '0.31', industry: '1.12', deviation: '-72.3%', risk: 'red' as RiskLevel },
  { id: 7, name: '存货周转率', code: 'INV_TURNOVER', category: '资产类', value: '3.45', industry: '6.78', deviation: '-49.1%', risk: 'orange' as RiskLevel },
  { id: 8, name: '净资产收益率', code: 'ROA', category: '盈利类', value: '8.2%', industry: '7.9%', deviation: '+0.3%', risk: 'none' as RiskLevel },
];

const MOCK_ALERTS = [
  { id: 1, title: '虚构收入风险 — 北京某科技', risk: 'red' as RiskLevel, time: '2026-03-09 09:14', status: '待处理' },
  { id: 2, title: '资产虚增预警 — 上海贸易集团', risk: 'orange' as RiskLevel, time: '2026-03-09 08:57', status: '审阅中' },
  { id: 3, title: '关联交易异常 — 广州制造业', risk: 'yellow' as RiskLevel, time: '2026-03-08 16:30', status: '已处理' },
  { id: 4, title: '现金流量异常 — 深圳新能源', risk: 'yellow' as RiskLevel, time: '2026-03-08 14:15', status: '已处理' },
];

const MOCK_VERSIONS = [
  { version: 'v3', label: '当前版本 — 最终检测报告', time: '2026-03-09 09:00', author: 'fanlong long', isLatest: true, annotation: '管理层批注：请重点核查营收增长率异常，需补充说明业务背景。' },
  { version: 'v2', label: '修订版本 — 数据补充', time: '2026-03-08 15:22', author: 'fanlong long', isLatest: false, annotation: '' },
  { version: 'v1', label: '初始版本 — 首次检测', time: '2026-03-07 10:05', author: 'fanlong long', isLatest: false, annotation: '' },
];

const TREND_DATA = [
  { month: '10月', height: 45 }, { month: '11月', height: 62 }, { month: '12月', height: 55 },
  { month: '1月', height: 78 }, { month: '2月', height: 68 }, { month: '3月', height: 100 },
];

const ROLE_LABELS: Record<string, string> = {
  financial_staff: '财务专员',
  management: '企业管理层',
  auditor: '审计人员',
  admin: '系统管理员',
};

const ROLE_PERMISSIONS: Record<string, string[]> = {
  financial_staff: ['数据上传', '检测启动', '台账维护', '预警查看', '报告下载'],
  management: ['风险审阅', '批注决策', '报告查看', 'AI建议查看'],
  auditor: ['底稿核查', '版本追溯', '历史对比', '数据导出'],
  admin: ['权限配置', '系统维护', '数据备份', '预警规则配置', '指标配置'],
};

export default function Index() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [indicatorSearch, setIndicatorSearch] = useState('');
  const [indicatorRiskFilter, setIndicatorRiskFilter] = useState('');
  const [indicatorPage, setIndicatorPage] = useState(1);
  const [annotationText, setAnnotationText] = useState('');
  const [annotationType, setAnnotationType] = useState('修改意见');
  const [annotations, setAnnotations] = useState(MOCK_VERSIONS);
  const [alertFilter, setAlertFilter] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; status: string; records?: number }[]>([
    { name: '华东科技集团_2025年报.xlsx', status: '已就绪', records: 2847 },
    { name: '南方制造_Q4财务数据.csv', status: '处理中' },
  ]);
  const [detecting, setDetecting] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: '', department: '', phone: '' });
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmNew: '' });
  const [pwLoading, setPwLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [userInfo, setUserInfo] = useState<{ name: string; email: string; role: string; department?: string; phone?: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadProfile = async () => {
    if (profileLoaded) return;
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) {
        setUserInfo(data.data);
        setProfileForm({ name: data.data.name || '', department: data.data.department || '', phone: data.data.phone || '' });
        setProfileLoaded(true);
      }
    } catch (_err) {
      // ignore profile load errors
    }
  };

  const handleNavClick = (view: View) => {
    setCurrentView(view);
    setMobileMenuOpen(false);
    if (view === 'profile') loadProfile();
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      setUploadedFiles((prev) => [...prev, { name: file.name, status: '处理中' }]);
      setTimeout(() => {
        setUploadedFiles((prev) =>
          prev.map((f) => f.name === file.name ? { ...f, status: '已就绪', records: Math.floor(Math.random() * 3000) + 500 } : f)
        );
        toast.success('数据上传成功', { description: `${file.name} 清洗完成` });
      }, 2000);
    });
    e.target.value = '';
  };

  const handleDetect = () => {
    setDetecting(true);
    toast.info('检测启动中', { description: '正在运行108条指标自动计算...' });
    setTimeout(() => {
      setDetecting(false);
      toast.success('检测完成', { description: '发现 3 项红色高危指标，请立即关注' });
    }, 3000);
  };

  const handleSubmitAnnotation = () => {
    if (!annotationText.trim()) {
      toast.error('请输入批注内容');
      return;
    }
    const newVersion = {
      version: `v${annotations.length + 1}`,
      label: `新版本 — ${annotationType}`,
      time: new Date().toLocaleString('zh-CN'),
      author: userInfo?.name || 'fanlong long',
      isLatest: true,
      annotation: `${annotationType}：${annotationText}`,
    };
    setAnnotations((prev) => [newVersion, ...prev.map((v) => ({ ...v, isLatest: false }))]);
    setAnnotationText('');
    toast.success('批注提交成功');
  };

  const handleProfileSave = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    setProfileLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(profileForm),
      });
      const data = await res.json();
      if (data.success) {
        setUserInfo((prev) => prev ? { ...prev, ...data.data } : data.data);
        toast.success('个人信息已更新');
      } else {
        toast.error(data.message || '更新失败');
      }
    } catch {
      toast.error('网络错误');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!pwForm.currentPassword || !pwForm.newPassword || !pwForm.confirmNew) {
      toast.error('请填写所有密码字段');
      return;
    }
    if (pwForm.newPassword !== pwForm.confirmNew) {
      toast.error('两次新密码不一致');
      return;
    }
    if (pwForm.newPassword.length < 6) {
      toast.error('新密码至少6位');
      return;
    }
    const token = localStorage.getItem('token');
    if (!token) return;
    setPwLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        setPwForm({ currentPassword: '', newPassword: '', confirmNew: '' });
        toast.success('密码修改成功');
      } else {
        toast.error(data.message || '密码修改失败');
      }
    } catch {
      toast.error('网络错误');
    } finally {
      setPwLoading(false);
    }
  };

  const filteredIndicators = MOCK_INDICATORS.filter((ind) => {
    const matchSearch = !indicatorSearch || ind.name.includes(indicatorSearch) || ind.code.includes(indicatorSearch);
    const matchRisk = !indicatorRiskFilter || ind.risk === indicatorRiskFilter;
    return matchSearch && matchRisk;
  });

  const filteredAlerts = MOCK_ALERTS.filter((a) => !alertFilter || a.risk === alertFilter);

  const navItems: { view: View; label: string }[] = [
    { view: 'dashboard', label: '控制台' },
    { view: 'data', label: '数据接入' },
    { view: 'indicators', label: '指标计算' },
    { view: 'risk', label: '风险检测' },
    { view: 'reports', label: '报告中心' },
    { view: 'config', label: '系统配置' },
  ];

  return (
    <div className="min-h-screen bg-[#eef1ee] text-[#000000]" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#344056] bg-[#eef1ee]/90 backdrop-blur-[12px]">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#1c0620] flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <span className="font-semibold text-[#000000] tracking-tight text-lg">FinGuard AI</span>
              <span className="hidden sm:inline-block text-xs text-[#150049] border border-[#344056] rounded-full px-2 py-0.5" style={{ fontFamily: 'JetBrains Mono, monospace' }}>v2.4.1</span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <button
                  key={item.view}
                  onClick={() => handleNavClick(item.view)}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors duration-200 ${
                    currentView === item.view
                      ? 'text-[#1c0620] bg-[#1c0620]/10 font-medium'
                      : 'text-[#150049] hover:text-[#000000]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
              <button className="relative p-2 text-[#150049] hover:text-[#000000] transition-colors duration-200">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="flex items-center gap-2 pl-3 border-l border-[#344056]">
                <button
                  onClick={() => handleNavClick('profile')}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1c0620] to-[#c9d7e9] flex items-center justify-center text-xs font-semibold text-white hover:opacity-80 transition-opacity"
                >
                  {(userInfo?.name || 'FL').slice(0, 2).toUpperCase()}
                </button>
                <span className="hidden sm:block text-sm text-[#150049]">{userInfo?.name || 'fanlong'}</span>
                <button onClick={handleLogout} className="hidden sm:block text-xs text-[#150049] hover:text-red-500 transition-colors ml-1">退出</button>
              </div>
              {/* Mobile menu button */}
              <button
                className="md:hidden p-2 text-[#150049] hover:text-[#000000]"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileMenuOpen
                    ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#344056] bg-[#eef1ee] px-4 py-3 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.view}
                onClick={() => handleNavClick(item.view)}
                className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                  currentView === item.view ? 'text-[#1c0620] bg-[#1c0620]/10 font-medium' : 'text-[#150049]'
                }`}
              >
                {item.label}
              </button>
            ))}
            <button onClick={() => handleNavClick('profile')} className="w-full text-left px-3 py-2 text-sm text-[#150049] rounded-lg">个人中心</button>
            <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-sm text-red-500 rounded-lg">退出登录</button>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="pt-16">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* ===== DASHBOARD VIEW ===== */}
          {currentView === 'dashboard' && (
            <div>
              {/* Page Header */}
              <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="text-xs text-[#150049] uppercase tracking-[0.1em] font-medium mb-1">财务风控中心</p>
                  <h1 className="text-3xl font-bold text-[#000000] tracking-tight">智能舞弊检测控制台</h1>
                  <p className="text-[#150049] text-sm mt-1">最后更新：2026-03-09 08:42:17 &nbsp;·&nbsp; 检测周期：2025年度</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleNavClick('data')}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-[#150049] border border-[#344056] rounded-lg hover:border-[#1c0620]/50 hover:text-[#000000] transition-all duration-200"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    上传数据
                  </button>
                  <button
                    onClick={handleDetect}
                    disabled={detecting}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#1c0620] rounded-lg hover:bg-[#1c0620]/90 transition-all duration-200 shadow-lg shadow-[#1c0620]/20 disabled:opacity-60"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    {detecting ? '检测中...' : '一键检测'}
                  </button>
                </div>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[
                  { icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4', value: '487', label: '已检测企业数', badge: '+12%', badgeColor: 'text-emerald-600 bg-emerald-500/10', iconBg: 'bg-[#1c0620]/15', iconColor: 'text-[#1c0620]' },
                  { icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z', value: '23', label: '高风险预警', badge: '需关注', badgeColor: 'text-red-500 bg-red-500/10', iconBg: 'bg-amber-500/15', iconColor: 'text-amber-500' },
                  { icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', value: '108', label: '检测指标覆盖', badge: '99.2%', badgeColor: 'text-emerald-600 bg-emerald-500/10', iconBg: 'bg-emerald-500/15', iconColor: 'text-emerald-600' },
                  { icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', value: '28min', label: '平均底稿处理时间', badge: '-87%', badgeColor: 'text-emerald-600 bg-emerald-500/10', iconBg: 'bg-[#1c0620]/15', iconColor: 'text-[#1c0620]' },
                ].map((kpi, i) => (
                  <div key={i} className="bg-white border border-[#344056] rounded-xl p-5 hover:border-[#1c0620]/40 transition-all duration-300 group">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-9 h-9 rounded-lg ${kpi.iconBg} flex items-center justify-center group-hover:opacity-80 transition-opacity`}>
                        <svg className={`w-5 h-5 ${kpi.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={kpi.icon} />
                        </svg>
                      </div>
                      <span className={`text-xs ${kpi.badgeColor} px-2 py-0.5 rounded-full font-medium`}>{kpi.badge}</span>
                    </div>
                    <p className="text-2xl font-bold text-[#000000] tracking-tight">{kpi.value}</p>
                    <p className="text-xs text-[#150049] mt-0.5">{kpi.label}</p>
                  </div>
                ))}
              </div>

              {/* Main Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Risk Distribution */}
                <div className="lg:col-span-2 bg-white border border-[#344056] rounded-xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="font-semibold text-[#000000] text-lg">风险等级分布</h2>
                      <p className="text-xs text-[#150049] mt-0.5">本月检测结果汇总 · 共 487 家企业</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {['月度', '季度', '年度'].map((t, i) => (
                        <button key={t} className={`text-xs px-3 py-1.5 rounded-lg transition-colors duration-200 ${
                          i === 0 ? 'bg-[#1c0620]/15 text-[#1c0620] font-medium' : 'text-[#150049] hover:text-[#000000]'
                        }`}>{t}</button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    {[
                      { label: '无风险', count: 312, pct: 64.1, color: 'bg-emerald-500', dot: 'bg-emerald-500' },
                      { label: '黄色预警', count: 98, pct: 20.1, color: 'bg-yellow-400', dot: 'bg-yellow-400' },
                      { label: '橙色预警', count: 54, pct: 11.1, color: 'bg-orange-500', dot: 'bg-orange-500' },
                      { label: '红色高危', count: 23, pct: 4.7, color: 'bg-red-500', dot: 'bg-red-500' },
                    ].map((item) => (
                      <div key={item.label}>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className={`w-2.5 h-2.5 rounded-full ${item.dot}`}></span>
                            <span className="text-sm text-[#000000]">{item.label}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-semibold text-[#000000]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{item.count}</span>
                            <span className="text-xs text-[#150049]">{item.pct}%</span>
                          </div>
                        </div>
                        <div className="h-2.5 bg-[#344056]/20 rounded-full overflow-hidden">
                          <div className={`h-full ${item.color} rounded-full transition-all duration-700`} style={{ width: `${item.pct}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Trend Chart */}
                  <div className="mt-6 pt-5 border-t border-[#344056]/30">
                    <p className="text-xs text-[#150049] uppercase tracking-wide font-medium mb-3">近6月风险趋势</p>
                    <div className="flex items-end gap-2 h-20">
                      {TREND_DATA.map((d, i) => (
                        <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
                          <div
                            className={`w-full rounded-sm hover:opacity-80 transition-colors duration-200 cursor-pointer ${
                              i === TREND_DATA.length - 1 ? 'bg-[#1c0620]' : 'bg-[#1c0620]/30 hover:bg-[#1c0620]/50'
                            }`}
                            style={{ height: `${d.height}%` }}
                          ></div>
                          <span className={`text-xs ${i === TREND_DATA.length - 1 ? 'text-[#1c0620] font-medium' : 'text-[#150049]'}`}
                            style={{ fontFamily: 'JetBrains Mono, monospace' }}>{d.month}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* AI Insights */}
                <div className="bg-gradient-to-br from-[#c9d7e9]/40 to-white border border-[#1c0620]/20 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-7 h-7 rounded-lg bg-[#1c0620]/20 flex items-center justify-center">
                      <svg className="w-4 h-4 text-[#1c0620]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-[#000000] text-sm">AI 智能分析建议</h3>
                    <span className="ml-auto text-xs text-[#1c0620] bg-[#1c0620]/10 px-2 py-0.5 rounded-full">实时</span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex gap-3 p-3 bg-red-500/8 border border-red-500/20 rounded-lg">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 flex-shrink-0"></span>
                      <div>
                        <p className="text-xs font-medium text-[#000000] mb-0.5">虚构收入风险识别</p>
                        <p className="text-xs text-[#150049] leading-relaxed">检测到3家企业营收增长率与现金流严重背离，建议优先核查应收账款周转率指标。</p>
                      </div>
                    </div>
                    <div className="flex gap-3 p-3 bg-amber-500/8 border border-amber-500/20 rounded-lg">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0"></span>
                      <div>
                        <p className="text-xs font-medium text-[#000000] mb-0.5">资产虚增预警</p>
                        <p className="text-xs text-[#150049] leading-relaxed">7家企业固定资产增长率异常偏高，与行业均值偏离度超2.3个标准差。</p>
                      </div>
                    </div>
                    <div className="flex gap-3 p-3 bg-[#1c0620]/8 border border-[#1c0620]/20 rounded-lg">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1c0620] mt-1.5 flex-shrink-0"></span>
                      <div>
                        <p className="text-xs font-medium text-[#000000] mb-0.5">关联交易异常</p>
                        <p className="text-xs text-[#150049] leading-relaxed">AI模型识别到12家企业存在关联方交易集中度过高特征，建议深度核查。</p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleNavClick('risk')}
                    className="w-full mt-4 text-xs text-[#1c0620] hover:text-[#000000] transition-colors duration-200 flex items-center justify-center gap-1"
                  >
                    查看完整AI分析报告
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Recent Detections */}
              <div className="bg-white border border-[#344056] rounded-xl p-6 mb-6">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="font-semibold text-[#000000] text-lg">最近检测记录</h2>
                    <p className="text-xs text-[#150049] mt-0.5">今日已完成 18 次检测</p>
                  </div>
                  <button onClick={() => handleNavClick('risk')} className="text-xs text-[#1c0620] hover:underline">查看全部</button>
                </div>
                <div className="space-y-2">
                  {MOCK_DETECTIONS.map((d) => (
                    <div key={d.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#eef1ee] transition-colors duration-200 cursor-pointer">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${RISK_DOT[d.risk]}`}></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#000000] truncate">{d.company}</p>
                        <p className="text-xs text-[#150049]">{d.period} · {d.indicators}项指标</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className={`inline-block text-xs font-semibold border px-2 py-0.5 rounded-full ${RISK_COLORS[d.risk]}`}>{RISK_LABELS[d.risk]}</span>
                        <p className="text-xs text-[#150049] mt-0.5">{d.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ===== DATA INGESTION VIEW ===== */}
          {currentView === 'data' && (
            <div>
              <div className="mb-8">
                <p className="text-xs text-[#150049] uppercase tracking-[0.1em] font-medium mb-1">财务风控中心</p>
                <h1 className="text-3xl font-bold text-[#000000] tracking-tight">数据接入与清洗</h1>
                <p className="text-[#150049] text-sm mt-1">支持 Excel / CSV 格式，自动完成清洗与校验</p>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Upload Zone */}
                <div className="bg-white border border-[#344056] rounded-xl p-6">
                  <h2 className="font-semibold text-[#000000] text-lg mb-1">文件上传</h2>
                  <p className="text-xs text-[#150049] mb-5">支持 Excel / CSV 格式，自动完成清洗与校验</p>
                  <label
                    className="block border-2 border-dashed border-[#344056] hover:border-[#1c0620]/50 rounded-xl p-8 text-center cursor-pointer transition-all duration-300 group"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      multiple
                      className="sr-only"
                      onChange={handleFileUpload}
                    />
                    <div className="w-12 h-12 rounded-xl bg-[#1c0620]/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-[#1c0620]/20 transition-colors duration-300">
                      <svg className="w-6 h-6 text-[#1c0620]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-[#000000] mb-1">拖拽文件至此或点击上传</p>
                    <p className="text-xs text-[#150049]">支持 .xlsx .xls .csv · 最大 50MB</p>
                  </label>

                  <div className="mt-4 space-y-2">
                    {uploadedFiles.map((file, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-[#eef1ee] rounded-lg border border-[#344056]/30">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          file.status === '已就绪' ? 'bg-emerald-500/15' : 'bg-amber-500/15'
                        }`}>
                          <svg className={`w-4 h-4 ${file.status === '已就绪' ? 'text-emerald-600' : 'text-amber-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-[#000000] truncate">{file.name}</p>
                          <p className="text-xs text-[#150049]">
                            {file.status === '已就绪' ? `清洗完成 · ${file.records?.toLocaleString()} 条记录` : '格式校验中...'}
                          </p>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                          file.status === '已就绪' ? 'text-emerald-600 bg-emerald-500/10' : 'text-amber-500 bg-amber-500/10'
                        }`}>{file.status}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Data Cleaning Report */}
                <div className="bg-white border border-[#344056] rounded-xl p-6">
                  <h2 className="font-semibold text-[#000000] text-lg mb-1">数据清洗报告</h2>
                  <p className="text-xs text-[#150049] mb-5">标准化数据处理过程追溯</p>
                  <div className="space-y-3">
                    {[
                      { label: '原始记录数', value: '3,124', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', color: 'text-[#1c0620] bg-[#1c0620]/10' },
                      { label: '重复记录删除', value: '47', icon: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16', color: 'text-red-500 bg-red-500/10' },
                      { label: '空字段补零', value: '230', icon: 'M12 4v16m8-8H4', color: 'text-amber-500 bg-amber-500/10' },
                      { label: '负数置零处理', value: '12', icon: 'M20 12H4', color: 'text-orange-500 bg-orange-500/10' },
                      { label: '最终标准记录', value: '2,847', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', color: 'text-emerald-600 bg-emerald-500/10' },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between p-3 bg-[#eef1ee] rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.color}`}>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                            </svg>
                          </div>
                          <span className="text-sm text-[#000000]">{item.label}</span>
                        </div>
                        <span className="text-sm font-semibold text-[#000000]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-3 bg-emerald-500/8 border border-emerald-500/20 rounded-lg">
                    <p className="text-xs text-emerald-700 font-medium">✓ 数据清洗完成，数据质量良好，可进行指标计算</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===== INDICATORS VIEW ===== */}
          {currentView === 'indicators' && (
            <div>
              <div className="mb-8">
                <p className="text-xs text-[#150049] uppercase tracking-[0.1em] font-medium mb-1">财务风控中心</p>
                <h1 className="text-3xl font-bold text-[#000000] tracking-tight">108条指标自动计算</h1>
                <p className="text-[#150049] text-sm mt-1">华东科技集团 · 2025年度 · 最新检测版本 v3</p>
              </div>

              {/* Controls */}
              <div className="flex flex-col sm:flex-row gap-3 mb-5">
                <div className="relative flex-1">
                  <input
                    type="search"
                    placeholder="搜索指标名称..."
                    value={indicatorSearch}
                    onChange={(e) => setIndicatorSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-sm bg-white border border-[#344056] rounded-lg text-[#000000] placeholder-[#150049]/50 focus:outline-none focus:border-[#1c0620]/50"
                  />
                  <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#150049]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <select
                  value={indicatorRiskFilter}
                  onChange={(e) => setIndicatorRiskFilter(e.target.value)}
                  className="px-3 py-2 text-sm bg-white border border-[#344056] rounded-lg text-[#000000] focus:outline-none focus:border-[#1c0620]/50"
                >
                  <option value="">全部等级</option>
                  <option value="red">红色高危</option>
                  <option value="orange">橙色预警</option>
                  <option value="yellow">黄色预警</option>
                  <option value="none">无风险</option>
                </select>
                <button
                  onClick={handleDetect}
                  disabled={detecting}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#1c0620] rounded-lg hover:bg-[#1c0620]/90 transition-colors disabled:opacity-60"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  {detecting ? '计算中...' : '一键计算'}
                </button>
                <button
                  onClick={() => toast.success('底稿下载成功', { description: 'indicators_report.xlsx 已保存' })}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-[#150049] border border-[#344056] rounded-lg hover:border-[#1c0620]/50 hover:text-[#000000] transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  下载底稿
                </button>
              </div>

              {/* Table */}
              <div className="bg-white border border-[#344056] rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#344056]/30 bg-[#eef1ee]">
                        {['指标名称', '类别', '计算值', '行业均值', '偏离度', '风险等级'].map((h) => (
                          <th key={h} className="text-left text-xs font-medium text-[#150049] uppercase tracking-wide py-3 px-4">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#344056]/20">
                      {filteredIndicators.map((ind) => (
                        <tr key={ind.id} className="hover:bg-[#eef1ee] transition-colors duration-150">
                          <td className="py-3 px-4">
                            <p className="text-sm font-medium text-[#000000]">{ind.name}</p>
                            <p className="text-xs text-[#150049]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{ind.code}</p>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-xs text-[#150049] bg-[#344056]/20 px-2 py-0.5 rounded">{ind.category}</span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span className={`text-sm font-semibold ${ind.risk === 'red' ? 'text-red-500' : ind.risk === 'orange' ? 'text-orange-400' : ind.risk === 'yellow' ? 'text-yellow-500' : 'text-emerald-600'}`}
                              style={{ fontFamily: 'JetBrains Mono, monospace' }}>{ind.value}</span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span className="text-sm text-[#150049]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{ind.industry}</span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span className={`text-sm ${ind.risk === 'red' ? 'text-red-500' : ind.risk === 'orange' ? 'text-orange-400' : ind.risk === 'yellow' ? 'text-yellow-500' : 'text-emerald-600'}`}
                              style={{ fontFamily: 'JetBrains Mono, monospace' }}>{ind.deviation}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center gap-1 text-xs font-semibold border px-2 py-0.5 rounded-full ${RISK_COLORS[ind.risk]}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${RISK_DOT[ind.risk]}`}></span>
                              {RISK_LABELS[ind.risk]}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="px-4 py-3 border-t border-[#344056]/30 flex items-center justify-between bg-[#eef1ee]">
                  <p className="text-xs text-[#150049]">
                    显示 {filteredIndicators.length} / 108 条指标 · 发现{' '}
                    <span className="text-red-500 font-medium">{filteredIndicators.filter((i) => i.risk === 'red').length}</span> 项红色高危
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIndicatorPage((p) => Math.max(1, p - 1))}
                      className="text-xs px-3 py-1.5 border border-[#344056] rounded-lg text-[#150049] hover:text-[#000000] hover:border-[#1c0620]/40 transition-all"
                    >上一页</button>
                    <span className="text-xs text-[#150049] px-2">{indicatorPage} / 14</span>
                    <button
                      onClick={() => setIndicatorPage((p) => Math.min(14, p + 1))}
                      className="text-xs px-3 py-1.5 border border-[#344056] rounded-lg text-[#150049] hover:text-[#000000] hover:border-[#1c0620]/40 transition-all"
                    >下一页</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===== RISK DETECTION VIEW ===== */}
          {currentView === 'risk' && (
            <div>
              <div className="mb-8">
                <p className="text-xs text-[#150049] uppercase tracking-[0.1em] font-medium mb-1">财务风控中心</p>
                <h1 className="text-3xl font-bold text-[#000000] tracking-tight">财务异常智能核查</h1>
                <p className="text-[#150049] text-sm mt-1">四维度全面核查：单指标合规性 · 多指标关联性 · 历史趋势 · 行业对标</p>
              </div>

              {/* Risk Level Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[
                  { level: '无风险', count: 312, color: 'border-emerald-500/30 bg-emerald-500/5', textColor: 'text-emerald-600', dot: 'bg-emerald-500' },
                  { level: '黄色预警', count: 98, color: 'border-yellow-400/30 bg-yellow-400/5', textColor: 'text-yellow-500', dot: 'bg-yellow-400' },
                  { level: '橙色预警', count: 54, color: 'border-orange-500/30 bg-orange-500/5', textColor: 'text-orange-500', dot: 'bg-orange-500' },
                  { level: '红色高危', count: 23, color: 'border-red-500/30 bg-red-500/5', textColor: 'text-red-500', dot: 'bg-red-500' },
                ].map((item) => (
                  <div key={item.level} className={`border rounded-xl p-5 ${item.color}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`w-3 h-3 rounded-full ${item.dot}`}></span>
                      <span className={`text-sm font-medium ${item.textColor}`}>{item.level}</span>
                    </div>
                    <p className={`text-3xl font-bold ${item.textColor}`}>{item.count}</p>
                    <p className="text-xs text-[#150049] mt-1">家企业</p>
                  </div>
                ))}
              </div>

              {/* Detection Records + AI Analysis */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border border-[#344056] rounded-xl p-6">
                  <h2 className="font-semibold text-[#000000] text-lg mb-4">检测记录明细</h2>
                  <div className="space-y-3">
                    {MOCK_DETECTIONS.map((d) => (
                      <div key={d.id} className="flex items-center gap-3 p-3 rounded-lg border border-[#344056]/20 hover:bg-[#eef1ee] transition-colors cursor-pointer">
                        <div className={`w-3 h-3 rounded-full flex-shrink-0 ${RISK_DOT[d.risk]}`}></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#000000] truncate">{d.company}</p>
                          <p className="text-xs text-[#150049]">{d.period} · {d.indicators}项指标全检</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span className={`text-xs font-semibold border px-2 py-0.5 rounded-full ${RISK_COLORS[d.risk]}`}>{RISK_LABELS[d.risk]}</span>
                          <p className="text-xs text-[#150049] mt-0.5">{d.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Analysis Detail */}
                <div className="bg-gradient-to-br from-[#c9d7e9]/40 to-white border border-[#1c0620]/20 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-7 h-7 rounded-lg bg-[#1c0620]/20 flex items-center justify-center">
                      <svg className="w-4 h-4 text-[#1c0620]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-[#000000] text-sm">AI 辅助舞弊检测</h3>
                    <span className="ml-auto text-xs text-[#1c0620] bg-[#1c0620]/10 px-2 py-0.5 rounded-full">实时分析</span>
                  </div>
                  <div className="space-y-3 mb-4">
                    {[
                      { title: '风险等级评定', content: '当前检测企业综合风险评定为红色高危等级，建议立即启动专项审计程序。', color: 'bg-red-500/8 border-red-500/20', dot: 'bg-red-500' },
                      { title: '重点核查指标推荐', content: '优先核查：营收增长率、应收账款周转率、现金流量比率、关联方交易集中度。', color: 'bg-amber-500/8 border-amber-500/20', dot: 'bg-amber-500' },
                      { title: '风险分析建议', content: '建议对该企业进行现场审计，重点核查营收确认函、应收账款备忘录及关联方交易合同。', color: 'bg-[#1c0620]/8 border-[#1c0620]/20', dot: 'bg-[#1c0620]' },
                    ].map((item) => (
                      <div key={item.title} className={`flex gap-3 p-3 border rounded-lg ${item.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${item.dot} mt-1.5 flex-shrink-0`}></span>
                        <div>
                          <p className="text-xs font-medium text-[#000000] mb-0.5">{item.title}</p>
                          <p className="text-xs text-[#150049] leading-relaxed">{item.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={handleDetect}
                    disabled={detecting}
                    className="w-full py-2.5 text-sm font-medium text-white bg-[#1c0620] rounded-lg hover:bg-[#1c0620]/90 transition-all disabled:opacity-60"
                  >
                    {detecting ? 'AI 分析中...' : '启动 AI 检测'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ===== REPORTS VIEW ===== */}
          {currentView === 'reports' && (
            <div>
              <div className="mb-8">
                <p className="text-xs text-[#150049] uppercase tracking-[0.1em] font-medium mb-1">财务风控中心</p>
                <h1 className="text-3xl font-bold text-[#000000] tracking-tight">报告中心</h1>
                <p className="text-[#150049] text-sm mt-1">检测报告下载 · 版本管理 · 审阅批注</p>
              </div>

              {/* Report Download */}
              <div className="bg-gradient-to-r from-[#c9d7e9]/30 to-white border border-[#344056] rounded-xl p-6 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="font-semibold text-[#000000] text-lg mb-1">检测报告下载</h2>
                    <p className="text-xs text-[#150049]">华东科技集团 · 2025年度 · v3 最终版 · 包含108项指标计算底稿与可视化图表</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toast.success('Excel 底稿下载成功', { description: 'indicators_2025.xlsx 已保存' })}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-[#000000] bg-white border border-[#344056] rounded-lg hover:border-[#1c0620]/50 hover:text-[#1c0620] transition-all duration-200"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Excel 底稿
                    </button>
                    <button
                      onClick={() => toast.success('PDF 报告下载成功', { description: 'fraud_report_2025.pdf 已保存' })}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-[#1c0620] rounded-lg hover:bg-[#1c0620]/90 transition-all duration-200 shadow-lg shadow-[#1c0620]/20"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      PDF 报告
                    </button>
                  </div>
                </div>
              </div>

              {/* Alert Ledger + Version Management */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Alert Ledger */}
                <div className="bg-white border border-[#344056] rounded-xl p-6">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h2 className="font-semibold text-[#000000] text-lg">预警台账</h2>
                      <p className="text-xs text-[#150049] mt-0.5">站内通知 + 邮件双渠道推送</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={alertFilter}
                        onChange={(e) => setAlertFilter(e.target.value)}
                        className="text-xs px-2 py-1.5 bg-[#eef1ee] border border-[#344056] rounded-lg text-[#150049] focus:outline-none"
                      >
                        <option value="">全部</option>
                        <option value="red">红色</option>
                        <option value="orange">橙色</option>
                        <option value="yellow">黄色</option>
                      </select>
                      <button
                        onClick={() => toast.info('台账维护功能开发中')}
                        className="text-xs px-3 py-1.5 border border-[#344056] rounded-lg text-[#150049] hover:text-[#000000] hover:border-[#1c0620]/40 transition-all"
                      >维护台账</button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {filteredAlerts.map((alert) => (
                      <div key={alert.id} className={`flex items-start gap-3 p-3 border rounded-lg ${
                        alert.risk === 'red' ? 'bg-red-500/5 border-red-500/15' :
                        alert.risk === 'orange' ? 'bg-orange-500/5 border-orange-500/15' :
                        'bg-[#344056]/10 border-[#344056]'
                      }`}>
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          alert.risk === 'red' ? 'bg-red-500/15' : alert.risk === 'orange' ? 'bg-orange-500/15' : 'bg-[#344056]'
                        }`}>
                          <svg className={`w-4 h-4 ${alert.risk === 'red' ? 'text-red-500' : alert.risk === 'orange' ? 'text-orange-400' : 'text-[#150049]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <p className="text-xs font-semibold text-[#000000] truncate">{alert.title}</p>
                            <span className={`text-xs px-1.5 py-0.5 rounded font-medium flex-shrink-0 ml-2 ${
                              alert.risk === 'red' ? 'text-red-500 bg-red-500/10' :
                              alert.risk === 'orange' ? 'text-orange-400 bg-orange-500/10' :
                              'text-yellow-500 bg-yellow-400/10'
                            }`}>{RISK_LABELS[alert.risk].slice(0, 2)}</span>
                          </div>
                          <p className="text-xs text-[#150049]">{alert.time} · {alert.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Version Management */}
                <div className="bg-white border border-[#344056] rounded-xl p-6">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h2 className="font-semibold text-[#000000] text-lg">版本管理与批注</h2>
                      <p className="text-xs text-[#150049] mt-0.5">华东科技集团 · 审阅沟通闭环</p>
                    </div>
                    <button
                      onClick={() => toast.info('版本对比功能开发中')}
                      className="text-xs px-3 py-1.5 bg-[#1c0620]/15 text-[#1c0620] rounded-lg font-medium hover:bg-[#1c0620]/25 transition-colors"
                    >版本对比</button>
                  </div>
                  <div className="space-y-3">
                    {annotations.map((v, i) => (
                      <div key={v.version} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                            v.isLatest ? 'bg-[#1c0620] text-white' : 'bg-[#344056]/30 text-[#150049]'
                          }`}>{v.version}</div>
                          {i < annotations.length - 1 && <div className="w-px flex-1 bg-[#344056]/30 mt-1"></div>}
                        </div>
                        <div className={`flex-1 ${i < annotations.length - 1 ? 'pb-3' : ''}`}>
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-xs font-semibold text-[#000000]">{v.label}</p>
                            {v.isLatest && <span className="text-xs text-[#1c0620] bg-[#1c0620]/10 px-1.5 py-0.5 rounded">最新</span>}
                          </div>
                          <p className="text-xs text-[#150049] mb-1">{v.time} · {v.author}</p>
                          {v.annotation && (
                            <div className="p-2.5 bg-[#1c0620]/8 border border-[#1c0620]/15 rounded-lg">
                              <p className="text-xs text-[#150049]">
                                <span className="text-[#1c0620] font-medium">批注：</span>{v.annotation}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Add Annotation */}
                  <div className="mt-4 pt-4 border-t border-[#344056]/30">
                    <label className="block text-xs font-medium text-[#150049] mb-2">添加批注回复</label>
                    <textarea
                      rows={2}
                      value={annotationText}
                      onChange={(e) => setAnnotationText(e.target.value)}
                      placeholder="输入批注内容..."
                      className="w-full px-3 py-2 text-xs bg-[#eef1ee] border border-[#344056] rounded-lg text-[#000000] placeholder-[#150049]/50 focus:outline-none focus:border-[#1c0620]/50 resize-none"
                    />
                    <div className="flex items-center justify-between mt-2">
                      <select
                        value={annotationType}
                        onChange={(e) => setAnnotationType(e.target.value)}
                        className="text-xs px-2 py-1.5 bg-[#eef1ee] border border-[#344056] rounded-lg text-[#150049] focus:outline-none"
                      >
                        <option>修改意见</option>
                        <option>确认通过</option>
                        <option>需要说明</option>
                      </select>
                      <button
                        onClick={handleSubmitAnnotation}
                        className="text-xs px-3 py-1.5 bg-[#1c0620] text-white rounded-lg font-medium hover:bg-[#1c0620]/90 transition-colors"
                      >提交批注</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===== SYSTEM CONFIG VIEW ===== */}
          {currentView === 'config' && (
            <div>
              <div className="mb-8">
                <p className="text-xs text-[#150049] uppercase tracking-[0.1em] font-medium mb-1">系统管理</p>
                <h1 className="text-3xl font-bold text-[#000000] tracking-tight">权限管理与系统配置</h1>
                <p className="text-[#150049] text-sm mt-1">基于角色的权限管理 · 预警规则配置 · 数据备份</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Role Permissions */}
                <div className="bg-white border border-[#344056] rounded-xl p-6">
                  <h2 className="font-semibold text-[#000000] text-lg mb-4">角色权限配置</h2>
                  <div className="space-y-4">
                    {Object.entries(ROLE_LABELS).map(([role, label]) => (
                      <div key={role} className="p-4 bg-[#eef1ee] rounded-lg border border-[#344056]/20">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-[#000000]">{label}</span>
                          <button
                            onClick={() => toast.info(`正在编辑 ${label} 权限`)}
                            className="text-xs text-[#1c0620] hover:underline"
                          >编辑</button>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {ROLE_PERMISSIONS[role].map((perm) => (
                            <span key={perm} className="text-xs text-[#1c0620] bg-[#1c0620]/10 px-2 py-0.5 rounded-full">{perm}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Alert Rules + Backup */}
                <div className="space-y-6">
                  {/* Alert Rules */}
                  <div className="bg-white border border-[#344056] rounded-xl p-6">
                    <h2 className="font-semibold text-[#000000] text-lg mb-4">预警规则配置</h2>
                    <div className="space-y-3">
                      {[
                        { label: '红色高危阈值', value: '偏离度 > 150%', channel: '站内+邮件' },
                        { label: '橙色预警阈值', value: '偏离度 50-150%', channel: '站内通知' },
                        { label: '黄色预警阈值', value: '偏离度 20-50%', channel: '站内通知' },
                      ].map((rule) => (
                        <div key={rule.label} className="flex items-center justify-between p-3 bg-[#eef1ee] rounded-lg">
                          <div>
                            <p className="text-xs font-medium text-[#000000]">{rule.label}</p>
                            <p className="text-xs text-[#150049]">{rule.value} · {rule.channel}</p>
                          </div>
                          <button
                            onClick={() => toast.info('预警规则配置功能开发中')}
                            className="text-xs text-[#1c0620] hover:underline"
                          >配置</button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Backup */}
                  <div className="bg-white border border-[#344056] rounded-xl p-6">
                    <h2 className="font-semibold text-[#000000] text-lg mb-4">数据备份与恢复</h2>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
                        <div>
                          <p className="text-xs font-medium text-[#000000]">最近备份</p>
                          <p className="text-xs text-[#150049]">2026-03-09 02:00 · 自动备份</p>
                        </div>
                        <span className="text-xs text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">成功</span>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => toast.success('备份已启动', { description: '数据库备份任务已加入队列' })}
                          className="flex-1 py-2 text-xs font-medium text-white bg-[#1c0620] rounded-lg hover:bg-[#1c0620]/90 transition-colors"
                        >立即备份</button>
                        <button
                          onClick={() => toast.info('恢复功能开发中')}
                          className="flex-1 py-2 text-xs font-medium text-[#150049] border border-[#344056] rounded-lg hover:border-[#1c0620]/50 hover:text-[#000000] transition-all"
                        >恢复数据</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===== PROFILE VIEW ===== */}
          {currentView === 'profile' && (
            <div>
              <div className="mb-8">
                <p className="text-xs text-[#150049] uppercase tracking-[0.1em] font-medium mb-1">用户中心</p>
                <h1 className="text-3xl font-bold text-[#000000] tracking-tight">个人中心</h1>
                <p className="text-[#150049] text-sm mt-1">管理个人信息、密码与账号安全</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Card */}
                <div className="lg:col-span-1">
                  <div className="bg-white border border-[#344056] rounded-xl p-6 text-center">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#1c0620] to-[#c9d7e9] flex items-center justify-center text-2xl font-bold text-white mx-auto mb-4">
                      {(userInfo?.name || 'FL').slice(0, 2).toUpperCase()}
                    </div>
                    <h3 className="font-semibold text-[#000000] text-lg">{userInfo?.name || '加载中...'}</h3>
                    <p className="text-sm text-[#150049] mt-0.5">{userInfo?.email || ''}</p>
                    <div className="mt-3">
                      <span className="text-xs text-[#1c0620] bg-[#1c0620]/10 px-3 py-1 rounded-full font-medium">
                        {ROLE_LABELS[userInfo?.role || ''] || userInfo?.role || ''}
                      </span>
                    </div>
                    {userInfo?.department && (
                      <p className="text-xs text-[#150049] mt-2">{userInfo.department}</p>
                    )}
                    <div className="mt-4 pt-4 border-t border-[#344056]/30">
                      <p className="text-xs text-[#150049]">权限范围</p>
                      <div className="flex flex-wrap gap-1.5 justify-center mt-2">
                        {(ROLE_PERMISSIONS[userInfo?.role || ''] || []).map((perm) => (
                          <span key={perm} className="text-xs text-[#150049] bg-[#eef1ee] border border-[#344056]/30 px-2 py-0.5 rounded-full">{perm}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Edit Profile + Change Password */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Edit Profile */}
                  <div className="bg-white border border-[#344056] rounded-xl p-6">
                    <h2 className="font-semibold text-[#000000] text-lg mb-4">编辑个人信息</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-[#150049] mb-1.5">姓名</label>
                        <input
                          type="text"
                          value={profileForm.name}
                          onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))}
                          className="w-full px-3 py-2.5 text-sm bg-[#eef1ee] border border-[#344056] rounded-lg text-[#000000] focus:outline-none focus:border-[#1c0620]/60 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#150049] mb-1.5">邮箱</label>
                        <input
                          type="email"
                          value={userInfo?.email || ''}
                          disabled
                          className="w-full px-3 py-2.5 text-sm bg-[#eef1ee]/50 border border-[#344056]/50 rounded-lg text-[#150049] cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#150049] mb-1.5">部门</label>
                        <input
                          type="text"
                          value={profileForm.department}
                          onChange={(e) => setProfileForm((p) => ({ ...p, department: e.target.value }))}
                          placeholder="请输入部门"
                          className="w-full px-3 py-2.5 text-sm bg-[#eef1ee] border border-[#344056] rounded-lg text-[#000000] placeholder-[#150049]/50 focus:outline-none focus:border-[#1c0620]/60 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#150049] mb-1.5">手机号</label>
                        <input
                          type="tel"
                          value={profileForm.phone}
                          onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))}
                          placeholder="请输入手机号"
                          className="w-full px-3 py-2.5 text-sm bg-[#eef1ee] border border-[#344056] rounded-lg text-[#000000] placeholder-[#150049]/50 focus:outline-none focus:border-[#1c0620]/60 transition-colors"
                        />
                      </div>
                    </div>
                    <button
                      onClick={handleProfileSave}
                      disabled={profileLoading}
                      className="mt-4 px-6 py-2.5 text-sm font-medium text-white bg-[#1c0620] rounded-lg hover:bg-[#1c0620]/90 transition-all disabled:opacity-60"
                    >
                      {profileLoading ? '保存中...' : '保存修改'}
                    </button>
                  </div>

                  {/* Change Password */}
                  <div className="bg-white border border-[#344056] rounded-xl p-6">
                    <h2 className="font-semibold text-[#000000] text-lg mb-4">修改密码</h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-[#150049] mb-1.5">当前密码</label>
                        <input
                          type="password"
                          value={pwForm.currentPassword}
                          onChange={(e) => setPwForm((p) => ({ ...p, currentPassword: e.target.value }))}
                          placeholder="请输入当前密码"
                          className="w-full px-3 py-2.5 text-sm bg-[#eef1ee] border border-[#344056] rounded-lg text-[#000000] placeholder-[#150049]/50 focus:outline-none focus:border-[#1c0620]/60 transition-colors"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-[#150049] mb-1.5">新密码</label>
                          <input
                            type="password"
                            value={pwForm.newPassword}
                            onChange={(e) => setPwForm((p) => ({ ...p, newPassword: e.target.value }))}
                            placeholder="至少6位"
                            className="w-full px-3 py-2.5 text-sm bg-[#eef1ee] border border-[#344056] rounded-lg text-[#000000] placeholder-[#150049]/50 focus:outline-none focus:border-[#1c0620]/60 transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-[#150049] mb-1.5">确认新密码</label>
                          <input
                            type="password"
                            value={pwForm.confirmNew}
                            onChange={(e) => setPwForm((p) => ({ ...p, confirmNew: e.target.value }))}
                            placeholder="再次输入新密码"
                            className="w-full px-3 py-2.5 text-sm bg-[#eef1ee] border border-[#344056] rounded-lg text-[#000000] placeholder-[#150049]/50 focus:outline-none focus:border-[#1c0620]/60 transition-colors"
                          />
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={handleChangePassword}
                      disabled={pwLoading}
                      className="mt-4 px-6 py-2.5 text-sm font-medium text-white bg-[#1c0620] rounded-lg hover:bg-[#1c0620]/90 transition-all disabled:opacity-60"
                    >
                      {pwLoading ? '修改中...' : '修改密码'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#344056] bg-white mt-8">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-[#1c0620] flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <span className="text-xs text-[#150049]">FinGuard AI · 智能财务舞弊检测系统 v2.4.1</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs text-[#150049]">本地私有化部署 · 数据安全合规</span>
              <span className="text-xs text-[#150049]">© 2026 fanlong long</span>
            </div>
          </div>
        </div>
      </footer>

      <OmniflowBadge />
      <Toaster />
    </div>
  );
}
