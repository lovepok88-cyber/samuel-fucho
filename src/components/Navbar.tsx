/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { User, JobSite, getRoleConfig } from '../types';
import {
  Ruler,
  ShieldCheck,
  User as UserIcon,
  RefreshCw,
  LogOut,
  FolderKanban,
  FileText,
  Users,
} from 'lucide-react';

interface NavbarProps {
  currentUser: User | null;
  activeSite: JobSite | null;
  activeTab: 'sites' | 'measurements' | 'drawings';
  onTabChange: (tab: 'sites' | 'measurements' | 'drawings') => void;
  onOpenLogin: () => void;
  onLogout: () => void;
  onOpenStaffModal: () => void;
  isSyncing: boolean;
  onManualSync: () => void;
  onBackToSites: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeSite,
  activeTab,
  onTabChange,
  onOpenLogin,
  onLogout,
  onOpenStaffModal,
  isSyncing,
  onManualSync,
  onBackToSites,
}) => {
  const isSupervisor = currentUser?.role === 'supervisor';

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark & Context Breadcrumb */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onBackToSites}
            className="flex items-center gap-2.5 text-left group focus:outline-none"
            title="返回案場列表"
          >
            <div className="w-9 h-9 rounded-lg bg-slate-900 flex items-center justify-center text-white shadow-xs group-hover:bg-slate-800 transition-colors">
              <Ruler className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-slate-900 whitespace-nowrap block">
                系統櫃尺寸丈量系統
              </span>
              <span className="text-xs text-slate-500 whitespace-nowrap block">
                單位 mm · 即時圖面比對
              </span>
            </div>
          </button>

          {activeSite && (
            <div className="hidden md:flex items-center text-xs text-slate-500 gap-2 pl-3 border-l border-slate-200">
              <button
                onClick={onBackToSites}
                className="hover:text-slate-900 transition-colors"
              >
                案場列表
              </button>
              <span aria-hidden="true">/</span>
              <span className="font-medium text-slate-900 max-w-[200px] truncate">
                {activeSite.name}
              </span>
            </div>
          )}
        </div>

        {/* Zone 2: Navigation Links (Single-line whitespace-nowrap) */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button
            onClick={onBackToSites}
            className={`transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activeTab === 'sites' && !activeSite
                ? 'text-slate-900 font-semibold'
                : 'hover:text-slate-900'
            }`}
          >
            <FolderKanban className="w-4 h-4" />
            <span>案場列表</span>
          </button>

          {activeSite && (
            <>
              <button
                onClick={() => onTabChange('measurements')}
                className={`transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                  activeTab === 'measurements'
                    ? 'text-slate-900 font-semibold'
                    : 'hover:text-slate-900'
                }`}
              >
                <Ruler className="w-4 h-4" />
                <span>丈量比對表</span>
              </button>

              <button
                onClick={() => onTabChange('drawings')}
                className={`transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                  activeTab === 'drawings'
                    ? 'text-slate-900 font-semibold'
                    : 'hover:text-slate-900'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>PDF施工圖瀏覽</span>
              </button>
            </>
          )}

          <button
            onClick={onOpenStaffModal}
            className="transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 hover:text-slate-900"
            title="查看或新增現場員工"
          >
            <Users className="w-4 h-4" />
            <span>員工名冊</span>
          </button>
        </nav>

        {/* Zone 3: Sync & User Identity Action */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Sync status indicator */}
          <button
            onClick={onManualSync}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors whitespace-nowrap"
            title="點擊立即手動同步數據"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${
                isSyncing ? 'animate-spin text-amber-600' : 'text-slate-400'
              }`}
            />
            <span className="hidden sm:inline">
              {isSyncing ? '同步中...' : '已同步'}
            </span>
          </button>

          {/* User profile & Switch modal trigger */}
          {currentUser ? (
            (() => {
              const cfg = getRoleConfig(currentUser.role);
              return (
                <div className="flex items-center gap-2">
                  <div
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs ${cfg.badgeClass}`}
                  >
                    {cfg.level === 1 ? (
                      <ShieldCheck className="w-4 h-4 text-amber-600" />
                    ) : (
                      <UserIcon className="w-4 h-4 text-slate-600" />
                    )}
                    <div className="flex flex-col text-left">
                      <span className="font-semibold leading-tight text-slate-900">
                        {currentUser.name}
                      </span>
                      <span className="text-[10px] opacity-80 font-mono font-medium">
                        Level {cfg.level} · {cfg.label}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={onLogout}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                    title="切換帳號或登出"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              );
            })()
          ) : (
            <button
              onClick={onOpenLogin}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap"
            >
              員工系統登入
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
