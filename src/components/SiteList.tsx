/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { JobSite, MeasurementSheet, User, SiteStatus } from '../types';
import { analyzeCabinetDimensions } from '../utils/tolerance';
import {
  Building2,
  Plus,
  Search,
  FileText,
  Ruler,
  Calendar,
  MapPin,
  Trash2,
  ChevronRight,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Clock,
  RotateCcw,
  Users,
} from 'lucide-react';

interface SiteListProps {
  sites: JobSite[];
  measurements: MeasurementSheet[];
  currentUser: User | null;
  onSelectSite: (site: JobSite) => void;
  onOpenNewSiteModal: () => void;
  onDeleteSiteRequest: (site: JobSite) => void;
  onResetDemoData: () => void;
  onOpenStaffModal?: () => void;
}

export const SiteList: React.FC<SiteListProps> = ({
  sites,
  measurements,
  currentUser,
  onSelectSite,
  onOpenNewSiteModal,
  onDeleteSiteRequest,
  onResetDemoData,
  onOpenStaffModal,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | SiteStatus>('all');

  const isSupervisor = currentUser?.role === 'supervisor';

  const filteredSites = sites.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.siteCode.toLowerCase().includes(search.toLowerCase()) ||
      s.clientName.toLowerCase().includes(search.toLowerCase()) ||
      s.address.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (statusFilter === 'all') return true;
    return s.status === statusFilter;
  });

  const getStatusBadge = (status: SiteStatus) => {
    switch (status) {
      case 'measuring':
        return (
          <span className="text-xs text-sky-700 font-medium flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>丈量中</span>
          </span>
        );
      case 'verified':
        return (
          <span className="text-xs text-emerald-700 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>尺寸已核對</span>
          </span>
        );
      case 'warning':
        return (
          <span className="text-xs text-amber-700 font-medium flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>公差待覆核</span>
          </span>
        );
      case 'ordered':
        return (
          <span className="text-xs text-purple-700 font-medium flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5" />
            <span>已發包開板</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Zone */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            工程案場管理清單
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            管理全室與局部系統櫃丈量案場、施工圖面與即時毫米公差比對
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {onOpenStaffModal && (
            <button
              onClick={onOpenStaffModal}
              className="px-3.5 py-2 text-xs font-semibold text-slate-800 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs whitespace-nowrap"
              title="查看與新增現場員工"
            >
              <Users className="w-3.5 h-3.5 text-amber-600" />
              <span>新增 / 管理員工</span>
            </button>
          )}

          <button
            onClick={onResetDemoData}
            className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1.5"
            title="載入預設示範案場與圖面"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">重置示範資料</span>
          </button>

          <button
            onClick={onOpenNewSiteModal}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>新增案場</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="搜尋案場代號、名稱、業主或施工地址..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-medium">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              statusFilter === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            全部 ({sites.length})
          </button>
          <button
            onClick={() => setStatusFilter('measuring')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              statusFilter === 'measuring'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            丈量中
          </button>
          <button
            onClick={() => setStatusFilter('warning')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              statusFilter === 'warning'
                ? 'bg-white text-amber-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            待覆核
          </button>
          <button
            onClick={() => setStatusFilter('verified')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              statusFilter === 'verified'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            已核對
          </button>
        </div>
      </div>

      {/* Sites Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredSites.map((site) => {
          const siteSheets = measurements.filter((m) => m.siteId === site.id);
          const drawingCount = site.drawings?.length || 0;

          // Check if any sheet has danger/warning
          let hasDanger = false;
          let hasWarning = false;
          siteSheets.forEach((sheet) => {
            const res = analyzeCabinetDimensions(sheet.planned, sheet.measured);
            if (res.overallSeverity === 'danger') hasDanger = true;
            if (res.overallSeverity === 'warning') hasWarning = true;
          });

          return (
            <div
              key={site.id}
              onClick={() => onSelectSite(site)}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-slate-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group relative"
            >
              <div>
                {/* Header row: Code & Status */}
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                    {site.siteCode}
                  </span>
                  {getStatusBadge(site.status)}
                </div>

                {/* Site Title */}
                <h3 className="text-base font-bold text-slate-900 group-hover:text-amber-600 transition-colors line-clamp-1 mb-1">
                  {site.name}
                </h3>

                {/* Client & Address */}
                <div className="space-y-1 text-xs text-slate-600 mb-4">
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <span className="font-semibold">{site.clientName}</span>
                    {site.phone && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono text-slate-500">{site.phone}</span>
                      </>
                    )}
                  </div>
                  {site.address && (
                    <div className="flex items-center gap-1.5 text-slate-500 truncate">
                      <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                      <span className="truncate">{site.address}</span>
                    </div>
                  )}
                </div>

                {/* Metrics pill strip */}
                <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-50 rounded-lg text-xs mb-4">
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <Ruler className="w-3.5 h-3.5 text-slate-500" />
                    <span>
                      丈量表：<strong>{siteSheets.length}</strong> 座
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-700">
                    <FileText className="w-3.5 h-3.5 text-slate-500" />
                    <span>
                      施工圖：<strong>{drawingCount}</strong> 份
                    </span>
                  </div>

                  <div className="col-span-2 pt-1 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">工務: {site.assignedStaff}</span>
                    {hasDanger ? (
                      <span className="text-red-600 font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> 嚴重干涉待改
                      </span>
                    ) : hasWarning ? (
                      <span className="text-amber-600 font-medium">需微調收邊</span>
                    ) : siteSheets.length > 0 ? (
                      <span className="text-emerald-600 font-medium">全數公差合規</span>
                    ) : (
                      <span className="text-slate-400">尚未填報</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div
                className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => onSelectSite(site)}
                  className="font-semibold text-slate-900 group-hover:text-amber-600 flex items-center gap-1 hover:underline"
                >
                  <span>進入案場丈量</span>
                  <ChevronRight className="w-4 h-4" />
                </button>

                {/* Delete button (Supervisor only or warning) */}
                <button
                  type="button"
                  onClick={() => onDeleteSiteRequest(site)}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  title={isSupervisor ? '刪除案場 (主管操作)' : '刪除案場 (需主管身分)'}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredSites.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200 p-8">
          <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-900 mb-1">查無符合條件的案場</h3>
          <p className="text-xs text-slate-500 mb-4">
            請嘗試調整搜尋關鍵字，或點擊下方按鈕建立新案場。
          </p>
          <button
            onClick={onOpenNewSiteModal}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
          >
            建立新案場
          </button>
        </div>
      )}
    </div>
  );
};
