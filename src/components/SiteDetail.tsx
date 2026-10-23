/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { JobSite, MeasurementSheet, User, SiteStatus } from '../types';
import { MeasurementSheetTable } from './MeasurementSheetTable';
import { PdfBlueprintViewer } from './PdfBlueprintViewer';
import {
  Building2,
  Calendar,
  Phone,
  MapPin,
  FileText,
  Ruler,
  Trash2,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Edit,
  Save,
  Check,
} from 'lucide-react';

interface SiteDetailProps {
  site: JobSite;
  measurements: MeasurementSheet[];
  currentUser: User | null;
  activeTab: 'measurements' | 'drawings' | 'info';
  onTabChange: (tab: 'measurements' | 'drawings' | 'info') => void;
  onBack: () => void;
  onAddMeasurement: () => void;
  onEditMeasurement: (sheet: MeasurementSheet) => void;
  onDeleteMeasurement: (sheetId: string) => void;
  onDeleteSiteRequest: (site: JobSite) => void;
  onSiteUpdated: (updatedSite: JobSite) => void;
  onSaveSiteNotes: (siteId: string, notes: string, status: SiteStatus) => void;
  onQuickApprove?: (sheetId: string) => void;
}

export const SiteDetail: React.FC<SiteDetailProps> = ({
  site,
  measurements,
  currentUser,
  activeTab,
  onTabChange,
  onBack,
  onAddMeasurement,
  onEditMeasurement,
  onDeleteMeasurement,
  onDeleteSiteRequest,
  onSiteUpdated,
  onSaveSiteNotes,
  onQuickApprove,
}) => {
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [siteNotes, setSiteNotes] = useState(site.notes || '');
  const [currentStatus, setCurrentStatus] = useState<SiteStatus>(site.status);

  const isSupervisor = currentUser?.role === 'supervisor';

  const handleSaveNotes = () => {
    onSaveSiteNotes(site.id, siteNotes, currentStatus);
    setIsEditingNotes(false);
  };

  return (
    <div className="space-y-6">
      {/* Back button & Title Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
          <button
            onClick={onBack}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>返回全部案場清單</span>
          </button>

          <div className="flex items-center gap-2">
            {/* Status Selector */}
            <select
              value={currentStatus}
              onChange={(e) => {
                const newStatus = e.target.value as SiteStatus;
                setCurrentStatus(newStatus);
                onSaveSiteNotes(site.id, siteNotes, newStatus);
              }}
              className="text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-slate-900"
            >
              <option value="measuring">丈量中 (Measuring)</option>
              <option value="verified">尺寸已核對 (Verified)</option>
              <option value="warning">公差待覆核 (Warning)</option>
              <option value="ordered">已發包開板 (Ordered)</option>
            </select>

            {/* Delete button (Protected) */}
            <button
              onClick={() => onDeleteSiteRequest(site)}
              className="px-3 py-1.5 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 rounded-lg transition-colors flex items-center gap-1"
              title={isSupervisor ? '刪除此案場 (主管操作)' : '需主管 (阿耀) 身分'}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>刪除案場</span>
            </button>
          </div>
        </div>

        {/* Site Header Main Info */}
        <div className="flex flex-wrap items-baseline gap-3 mb-2">
          <span className="font-mono text-xs font-bold text-slate-900 bg-amber-100/70 border border-amber-300/60 px-2.5 py-0.5 rounded">
            {site.siteCode}
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {site.name}
          </h1>
          <span className="text-xs text-slate-500">· {site.spaceType}</span>
        </div>

        {/* Subtitle details */}
        <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-slate-600 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1.5">
            <strong>業主：</strong>
            <span>{site.clientName}</span>
            {site.phone && <span className="font-mono text-slate-500">({site.phone})</span>}
          </div>

          <div className="flex items-center gap-1.5 truncate max-w-md">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{site.address || '未填寫詳細地址'}</span>
          </div>

          <div className="flex items-center gap-1.5 font-mono">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>丈量日期: {site.measurementDate || '未定'}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span>負責工務: <strong>{site.assignedStaff}</strong></span>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-200 text-xs font-semibold">
          <button
            onClick={() => onTabChange('measurements')}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === 'measurements'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Ruler className="w-4 h-4" />
            <span>丈量比對表 ({measurements.length})</span>
          </button>

          <button
            onClick={() => onTabChange('drawings')}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === 'drawings'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>PDF 施工藍圖瀏覽 ({site.drawings?.length || 0})</span>
          </button>

          <button
            onClick={() => onTabChange('info')}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === 'info'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>案場備註與工務須知</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Measurements Comparison Sheet */}
      {activeTab === 'measurements' && (
        <MeasurementSheetTable
          site={site}
          measurements={measurements}
          currentUser={currentUser}
          onAddSheet={onAddMeasurement}
          onEditSheet={onEditMeasurement}
          onDeleteSheet={onDeleteMeasurement}
          onQuickApprove={onQuickApprove}
        />
      )}

      {/* Tab 2: PDF Blueprint Viewer */}
      {activeTab === 'drawings' && (
        <PdfBlueprintViewer
          site={site}
          measurements={measurements}
          currentUser={currentUser}
          onSiteUpdated={onSiteUpdated}
          onSelectCabinetSheet={(sheetId) => {
            const target = measurements.find((m) => m.id === sheetId);
            if (target) {
              onEditMeasurement(target);
            }
          }}
        />
      )}

      {/* Tab 3: Site Info & Notes */}
      {activeTab === 'info' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">
              案場工務注意事項與特殊限制
            </h3>
            {isEditingNotes ? (
              <button
                onClick={handleSaveNotes}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>儲存備註</span>
              </button>
            ) : (
              <button
                onClick={() => setIsEditingNotes(true)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>編輯內容</span>
              </button>
            )}
          </div>

          {isEditingNotes ? (
            <textarea
              rows={6}
              value={siteNotes}
              onChange={(e) => setSiteNotes(e.target.value)}
              placeholder="請填寫現場注意事項，如管委會施工時間、保護工程、梯廳高低限制等..."
              className="w-full p-3 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900"
            />
          ) : (
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-sm text-slate-800 leading-relaxed whitespace-pre-line">
              {site.notes || '尚未填寫現場注意事項。'}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-xs">
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <span className="font-bold text-slate-900 block mb-2">權限與核准指引</span>
              <ul className="space-y-1.5 text-slate-600 list-disc pl-4">
                <li>現場丈量工程師可隨時上傳施工圖面與填報雷射測距尺寸。</li>
                <li>尺寸單位強制為毫米 (mm)，系統自動比對規劃差值。</li>
                <li>若出現大樑壓頂或側牆垂直度嚴重偏斜，需由主管阿耀親自覆核。</li>
                <li>唯有主管阿耀可執行案場刪除與全域覆核開板。</li>
              </ul>
            </div>

            <div className="p-4 bg-amber-50/60 rounded-lg border border-amber-200">
              <span className="font-bold text-amber-950 block mb-2">即時同步機制說明</span>
              <p className="text-amber-900 leading-relaxed">
                本系統採用伺服器持久化儲存與多端即時同步技術。無論您在案場手機填報或在辦公室電腦開啟，數據皆能即時對齊，避免重複量測或圖面版本錯誤。
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
