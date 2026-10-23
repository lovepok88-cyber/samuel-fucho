/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, Employee } from '../types';
import { authenticateUser } from '../services/api';
import {
  Ruler,
  ShieldCheck,
  User as UserIcon,
  Lock,
  KeyRound,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  HardHat,
  Compass,
  FileCheck2,
} from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
  staffList?: Employee[];
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  staffList = [],
}) => {
  const [loginMode, setLoginMode] = useState<'supervisor' | 'staff'>('supervisor');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await authenticateUser(username, password);
      if (res.success && res.user) {
        onLoginSuccess(res.user);
      } else {
        setError(res.error || '帳號或密碼錯誤，請重新確認');
      }
    } catch {
      setError('系統伺服器連線異常，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  const handleModeChange = (mode: 'supervisor' | 'staff') => {
    setLoginMode(mode);
    setError(null);
    setUsername('');
    setPassword('');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Background Architectural Grid Pattern */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(to_right,#334155_1px,transparent_1px),linear-gradient(to_bottom,#334155_1px,transparent_1px)] bg-[size:32px_32px]"
        aria-hidden="true"
      />

      {/* Top Header Bar */}
      <header className="relative z-10 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Ruler className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-white block">
                富居空間 · 系統櫃工程管理
              </span>
              <span className="text-xs text-slate-400 block">
                現場毫米級丈量 · 3D圖面檢核 · 公差覆核系統
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span className="hidden sm:inline">單位基準：公釐 (mm)</span>
            <span aria-hidden="true" className="hidden sm:inline">·</span>
            <span className="text-amber-400 font-medium">版本 2026.4</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 py-12">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Industrial / Engineering Introduction */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-amber-400 tracking-wider">
                <Compass className="w-4 h-4" />
                <span>工程人員作業入口</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white text-balance leading-tight">
                精準丈量覆核，<br />
                消除櫃體現場公差。
              </h1>
              <p className="text-sm text-slate-400 leading-relaxed">
                整合現場雷射測距數據、梁柱立體避位參數與工廠出圖標準。各案場尺寸歷程由工程師填報與主管逐項審核。
              </p>
            </div>

            {/* Feature highlights */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-md bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 text-amber-400 mt-0.5">
                  <FileCheck2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-200">即時公差警示比對</h4>
                  <p className="text-xs text-slate-400">現場量測值與圖面差值自動對比，超過容許值立即反黃警示</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-md bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 text-amber-400 mt-0.5">
                  <HardHat className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-200">權限分級覆核機制</h4>
                  <p className="text-xs text-slate-400">主管具備總審核與刪除權限；工務人員即時填寫案場數據</p>
                </div>
              </div>
            </div>

            {/* System Engineering Specifications */}
            <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 text-xs space-y-2.5">
              <div className="text-slate-300 font-semibold flex items-center justify-between">
                <span>現場作業與丈量標準</span>
                <span className="text-[11px] text-amber-400 font-mono">CNS / 毫米基準</span>
              </div>
              <ul className="space-y-1.5 text-slate-400 leading-normal">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400/80 shrink-0" />
                  <span>尺寸單位統一以公釐 (mm) 記錄，杜絕現場公分/寸換算誤差。</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400/80 shrink-0" />
                  <span>寬度、深度與高度公差超過容許值 (±3mm) 即時啟動黃色警示。</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400/80 shrink-0" />
                  <span>主管覆核確認後方可鎖定圖面尺寸，交由工廠裁切排產。</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column: Clean Authentication Form Card */}
          <div className="lg:col-span-7">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
                <div>
                  <h2 className="text-lg font-bold text-white tracking-tight">系統登入認證</h2>
                  <p className="text-xs text-slate-400 mt-0.5">請驗證工號身分進入系統櫃工程平台</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <Lock className="w-5 h-5" />
                </div>
              </div>

              {/* Mode Switching Tabs */}
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-950 rounded-xl mb-6 border border-slate-800">
                <button
                  type="button"
                  onClick={() => handleModeChange('supervisor')}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 text-xs font-semibold rounded-lg transition-all ${
                    loginMode === 'supervisor'
                      ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>主管身分登入</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleModeChange('staff')}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 text-xs font-semibold rounded-lg transition-all ${
                    loginMode === 'staff'
                      ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <UserIcon className="w-4 h-4" />
                  <span>工程人員 / 員工</span>
                </button>
              </div>

              {/* Error Message Box */}
              {error && (
                <div className="mb-5 p-3.5 bg-red-950/60 border border-red-800/80 rounded-xl text-xs text-red-300 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {loginMode === 'supervisor' ? '主管帳號' : '員工帳號 / 姓名 / 工號'}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder={loginMode === 'supervisor' ? '例如：阿耀' : '輸入帳號 (如 chen, chang) 或姓名'}
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all font-medium"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-300">
                      登入密碼
                    </label>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="請輸入密碼"
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all font-mono tracking-wider pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors p-1"
                      title={showPassword ? '隱藏密碼' : '顯示密碼'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit Action Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-5 text-sm font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 rounded-xl transition-all shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <KeyRound className="w-4 h-4" />
                        <span>{loginMode === 'supervisor' ? '驗證主管權限並進入系統' : '以員工身分進入工程系統'}</span>
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Security Compliance Note */}
              <div className="mt-5 pt-4 border-t border-slate-800 text-[11px] text-slate-500 text-center">
                系統受施工規範與帳號分級安全保護，請輸入受派之工程工號與密碼登入。
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>富居空間系統櫃丈量工程系統 · 工務與現場尺寸覆核管理專用</span>
          <div className="flex items-center gap-4 text-slate-500">
            <span>安全加密存儲</span>
            <span aria-hidden="true">·</span>
            <span>即時多工跨裝置同步</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
