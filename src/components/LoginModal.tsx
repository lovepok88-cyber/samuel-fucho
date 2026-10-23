/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, Employee } from '../types';
import { authenticateUser } from '../services/api';
import { ShieldCheck, User as UserIcon, X, Lock, KeyRound, UserPlus } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
  currentUser: User | null;
  staffList?: Employee[];
  onOpenStaffModal?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  currentUser,
  staffList = [],
  onOpenStaffModal,
}) => {
  const [loginMode, setLoginMode] = useState<'supervisor' | 'staff'>('supervisor');
  const [username, setUsername] = useState(loginMode === 'supervisor' ? '阿耀' : '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await authenticateUser(username, password);
      if (res.success && res.user) {
        onLoginSuccess(res.user);
        onClose();
        setPassword('');
      } else {
        setError(res.error || '驗證失敗，請重新輸入');
      }
    } catch {
      setError('系統連線異常，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  const handleModeChange = (mode: 'supervisor' | 'staff') => {
    setLoginMode(mode);
    setError(null);
    if (mode === 'supervisor') {
      setUsername('阿耀');
      setPassword('');
    } else {
      setUsername('');
      setPassword('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                員工與主管身分登入
              </h3>
              <p className="text-xs text-slate-500">
                系統櫃尺寸管理與公差比對平台
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="p-6 pb-0">
          <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-lg mb-5">
            <button
              type="button"
              onClick={() => handleModeChange('supervisor')}
              className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-md transition-all ${
                loginMode === 'supervisor'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>主管登入</span>
            </button>
            <button
              type="button"
              onClick={() => handleModeChange('staff')}
              className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-md transition-all ${
                loginMode === 'staff'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserIcon className="w-4 h-4 text-slate-600" />
              <span>一般員工登入</span>
            </button>
          </div>

          {currentUser && (
            <div className="mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs flex items-center justify-between text-slate-600">
              <span>當前登入者：<strong>{currentUser.name}</strong></span>
              <span className="font-mono text-slate-500">{currentUser.role === 'supervisor' ? '主管' : '員工'}</span>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {loginMode === 'staff' && staffList.length > 0 && (
              <div className="pb-2">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                  <span>選擇現有員工快速登入：</span>
                  {onOpenStaffModal && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenStaffModal();
                      }}
                      className="text-slate-900 font-semibold hover:underline flex items-center gap-1"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>新增員工</span>
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                  {staffList
                    .filter((s) => s.role !== 'supervisor')
                    .map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => {
                          setUsername(s.name);
                        }}
                        className={`px-2.5 py-1 text-xs rounded-md border transition-colors ${
                          username === s.name
                            ? 'bg-slate-900 text-white border-slate-900 font-semibold'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {s.name} ({s.title.slice(0, 4)})
                      </button>
                    ))}
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-slate-700">
                  {loginMode === 'supervisor' ? '主管帳號' : '員工姓名 / 帳號 / 工號'}
                </label>
                {loginMode === 'staff' && onOpenStaffModal && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenStaffModal();
                    }}
                    className="text-[11px] text-amber-700 hover:text-amber-900 font-semibold flex items-center gap-0.5"
                  >
                    <span>+ 新建員工資料</span>
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={loginMode === 'supervisor' ? '請輸入主管帳號' : '輸入或點擊上方員工'}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                {loginMode === 'supervisor' ? '主管密碼 *' : '員工登入密碼 *'}
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="請輸入密碼"
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent font-mono"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <KeyRound className="w-4 h-4" />
                <span>{loading ? '驗證中...' : loginMode === 'supervisor' ? '確認主管身分登入' : '員工進入系統'}</span>
              </button>
            </div>
          </form>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500 text-center mt-5">
          主管具備全案場刪除、公差覆核與系統全域調整權限；員工可新增案場與填寫丈量表。
        </div>
      </div>
    </div>
  );
};
