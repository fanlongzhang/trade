import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';
import { API_BASE_URL } from '../../config/constants';

const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated === true) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('请填写邮箱和密码');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (data.success && data.data?.token) {
        login(data.data.token);
        toast.success('登录成功', { description: `欢迎回来，${data.data.user?.name}` });
        navigate('/', { replace: true });
      } else {
        setError(data.message || '登录失败，请检查邮箱和密码');
      }
    } catch {
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#eef1ee] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-[#1c0620] flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h1 className="font-bold text-xl text-[#1c0620] tracking-tight">FinGuard AI</h1>
            <p className="text-xs text-[#150049]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>v2.4.1</p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white border border-[#344056] rounded-xl p-8 shadow-lg">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-[#1c0620] tracking-tight">登录系统</h2>
            <p className="text-sm text-[#150049] mt-1">智能财务舞弊检测平台</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#150049] mb-1.5">邮箱地址</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="请输入邮箱"
                autoComplete="email"
                className="w-full px-3 py-2.5 text-sm bg-[#eef1ee] border border-[#344056] rounded-lg text-[#1c0620] placeholder-[#150049]/50 focus:outline-none focus:border-[#1c0620]/60 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#150049] mb-1.5">密码</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码"
                autoComplete="current-password"
                className="w-full px-3 py-2.5 text-sm bg-[#eef1ee] border border-[#344056] rounded-lg text-[#1c0620] placeholder-[#150049]/50 focus:outline-none focus:border-[#1c0620]/60 transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 text-sm font-semibold text-white bg-[#1c0620] rounded-lg hover:bg-[#1c0620]/90 transition-all duration-200 shadow-lg shadow-[#1c0620]/20 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? '登录中...' : '登录'}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-[#344056]/30 text-center">
            <p className="text-sm text-[#150049]">
              还没有账号？{' '}
              <Link to="/signup" className="text-[#1c0620] font-semibold hover:underline">
                立即注册
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-[#150049] mt-6">
          本地私有化部署 · 数据安全合规 · © 2026 fanlong long
        </p>
      </div>
    </div>
  );
};

export default Login;
