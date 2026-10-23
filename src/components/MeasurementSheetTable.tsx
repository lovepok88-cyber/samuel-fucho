/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MeasurementSheet, User, JobSite, getRoleConfig } from '../types';
import { analyzeCabinetDimensions } from '../utils/tolerance';
import { CabinetVisualizer2D } from './CabinetVisualizer2D';
import {
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Eye,
  Check,
  Search,
  Filter,
  FileSpreadsheet,
} from 'lucide-react';

interface MeasurementSheetTableProps {
  site: JobSite;
  measurements: MeasurementSheet[];
  currentUser: User | null;
  onAddSheet: () => void;
  onEditSheet: (sheet: MeasurementSheet) => void;
  onDeleteSheet: (sheetId: string) => void;
  onQuickApprove?: (sheetId: string) => void;
}

export const MeasurementSheetTable: React.FC<MeasurementSheetTableProps> = ({
  site,
  measurements,
  currentUser,
  onAddSheet,
  onEditSheet,
  onDeleteSheet,
  onQuickApprove,
}) => {
  const [selectedSheetId, setSelectedSheetId] = useState<string | null>(
    measurements[0]?.id || null
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'normal' | 'warning' | 'danger'>('all');

  const roleConfig = getRoleConfig(currentUser?.role);
  const isSupervisor = currentUser?.role === 'supervisor';

  // Filtered sheets
  const filteredSheets = measurements.filter((m) => {
    const matchesSearch =
      m.cabinetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.itemCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.roomLocation.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (filterSeverity === 'all') return true;

    const analysis = analyzeCabinetDimensions(m.planned, m.measured);
    return analysis.overallSeverity === filterSeverity;
  });

  // Calculate summary stats
  const totalCount = measurements.length;
  let passCount = 0;
  let warnCount = 0;
  let dangerCount = 0;

  measurements.forEach((m) => {
    const analysis = analyzeCabinetDimensions(m.planned, m.measured);
    if (analysis.overallSeverity === 'danger') dangerCount++;
    else if (analysis.overallSeverity === 'warning') warnCount++;
    else passCount++;
  });

  const activeVisualizerSheet = measurements.find((m) => m.id === selectedSheetId);

  return (
    <div className="space-y-6">
      {/* Metric KPI Strip (No Pill, Tabular Numerals) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
          <span className="text-xs text-slate-500 font-medium block">案場櫃體總數</span>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-1">
            {totalCount} <span className="text-xs font-normal text-slate-500 font-sans">座</span>
          </div>
        </div>

        <div className="p-3 bg-emerald-50/60 rounded-lg border border-emerald-100">
          <span className="text-xs text-emerald-800 font-medium block">公差合規 (可發包)</span>
          <div className="text-2xl font-bold font-mono tabular-nums text-emerald-700 mt-1">
            {passCount} <span className="text-xs font-normal text-emerald-600 font-sans">座</span>
          </div>
        </div>

        <div className="p-3 bg-amber-50/60 rounded-lg border border-amber-100">
          <span className="text-xs text-amber-800 font-medium block">需注意微調 (收邊調整)</span>
          <div className="text-2xl font-bold font-mono tabular-nums text-amber-700 mt-1">
            {warnCount} <span className="text-xs font-normal text-amber-600 font-sans">座</span>
          </div>
        </div>

        <div className="p-3 bg-red-50/60 rounded-lg border border-red-100">
          <span className="text-xs text-red-800 font-medium block">嚴重干涉 (需變更圖面)</span>
          <div className="text-2xl font-bold font-mono tabular-nums text-red-700 mt-1">
            {dangerCount} <span className="text-xs font-normal text-red-600 font-sans">座</span>
          </div>
        </div>
      </div>

      {/* Action Bar & Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Search & Severity Filters */}
        <div className="flex flex-wrap items-center gap-2 flex-1 max-w-xl">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="搜尋編號、櫃體名稱、空間..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg text-xs">
            <button
              onClick={() => setFilterSeverity('all')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                filterSeverity === 'all'
                  ? 'bg-white text-slate-900 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              全部 ({totalCount})
            </button>
            <button
              onClick={() => setFilterSeverity('danger')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                filterSeverity === 'danger'
                  ? 'bg-white text-red-700 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              嚴重干涉 ({dangerCount})
            </button>
            <button
              onClick={() => setFilterSeverity('warning')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                filterSeverity === 'warning'
                  ? 'bg-white text-amber-700 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              注意 ({warnCount})
            </button>
          </div>
        </div>

        {/* Add Measurement Button (Guarded by permission) */}
        {roleConfig.canEditMeasurements && (
          <button
            onClick={onAddSheet}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>新增丈量表</span>
          </button>
        )}
      </div>

      {/* Measurement Comparison High-Density Grid */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-semibold">
                <th className="py-3 px-4 whitespace-nowrap">編號 / 櫃體名稱</th>
                <th className="py-3 px-3 whitespace-nowrap">空間位置</th>
                <th className="py-3 px-3 whitespace-nowrap text-right">
                  寬度 W (規劃 vs 實測)
                </th>
                <th className="py-3 px-3 whitespace-nowrap text-right">
                  寬度差 Δ
                </th>
                <th className="py-3 px-3 whitespace-nowrap text-right">
                  高度 H (規劃 vs 實測)
                </th>
                <th className="py-3 px-3 whitespace-nowrap text-right">
                  深度 D
                </th>
                <th className="py-3 px-3 whitespace-nowrap text-center">
                  現場大樑 / 牆斜
                </th>
                <th className="py-3 px-3 whitespace-nowrap text-center">
                  公差狀態
                </th>
                <th className="py-3 px-3 whitespace-nowrap text-center">
                  主管覆核
                </th>
                <th className="py-3 px-4 whitespace-nowrap text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSheets.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    <FileSpreadsheet className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm font-medium text-slate-600">查無丈量表項目</p>
                    <p className="text-xs text-slate-400 mt-1">點擊上方「新增丈量表」開始記錄現場尺寸</p>
                  </td>
                </tr>
              ) : (
                filteredSheets.map((sheet) => {
                  const analysis = analyzeCabinetDimensions(sheet.planned, sheet.measured);
                  const isSelected = selectedSheetId === sheet.id;
                  const wDiff = sheet.measured.width - sheet.planned.width;
                  const hDiff = sheet.measured.height - sheet.planned.height;
                  const dDiff = sheet.measured.depth - sheet.planned.depth;

                  return (
                    <tr
                      key={sheet.id}
                      onClick={() => setSelectedSheetId(sheet.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-slate-100/90 font-medium'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      {/* Item Code & Name */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-900 bg-slate-200 px-1.5 py-0.5 rounded">
                            {sheet.itemCode}
                          </span>
                          <span className="font-bold text-slate-900">
                            {sheet.cabinetName}
                          </span>
                        </div>
                      </td>

                      {/* Room */}
                      <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                        {sheet.roomLocation}
                      </td>

                      {/* Width comparison (mm) */}
                      <td className="py-3 px-3 text-right font-mono tabular-nums whitespace-nowrap">
                        <span className="text-slate-400">{sheet.planned.width}</span>
                        <span className="text-slate-400 mx-1">→</span>
                        <span className="font-bold text-slate-900">
                          {sheet.measured.width}
                        </span>
                      </td>

                      {/* Width Delta */}
                      <td className="py-3 px-3 text-right font-mono tabular-nums whitespace-nowrap">
                        <span
                          className={`font-bold ${
                            analysis.diffs.width.severity === 'danger'
                              ? 'text-red-600'
                              : analysis.diffs.width.severity === 'warning'
                              ? 'text-amber-600'
                              : 'text-emerald-600'
                          }`}
                        >
                          {wDiff > 0 ? `+${wDiff}` : wDiff} mm
                        </span>
                      </td>

                      {/* Height comparison (mm) */}
                      <td className="py-3 px-3 text-right font-mono tabular-nums whitespace-nowrap">
                        <span className="text-slate-400">{sheet.planned.height}</span>
                        <span className="text-slate-400 mx-1">→</span>
                        <span className="font-bold text-slate-900">
                          {sheet.measured.height}
                        </span>
                      </td>

                      {/* Depth comparison (mm) */}
                      <td className="py-3 px-3 text-right font-mono tabular-nums whitespace-nowrap">
                        <span className="text-slate-400">{sheet.planned.depth}</span>
                        <span className="text-slate-400 mx-1">/</span>
                        <span className="font-medium text-slate-800">
                          {sheet.measured.depth}
                        </span>
                      </td>

                      {/* Beam & Plumb */}
                      <td className="py-3 px-3 text-center whitespace-nowrap text-[11px]">
                        {sheet.measured.beamHeight > 0 ? (
                          <span
                            className={
                              analysis.diffs.beam.severity === 'danger'
                                ? 'text-red-600 font-bold'
                                : 'text-amber-700'
                            }
                          >
                            樑高 {sheet.measured.beamHeight}mm
                          </span>
                        ) : Math.abs(sheet.measured.wallPlumbOffset || 0) > 4 ? (
                          <span className="text-amber-700 font-mono">
                            斜 {sheet.measured.wallPlumbOffset}mm
                          </span>
                        ) : (
                          <span className="text-slate-400">平整正常</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        {analysis.overallSeverity === 'danger' ? (
                          <span className="inline-flex items-center gap-1 text-red-600 font-bold">
                            <XCircle className="w-3.5 h-3.5" />
                            <span>嚴重干涉</span>
                          </span>
                        ) : analysis.overallSeverity === 'warning' ? (
                          <span className="inline-flex items-center gap-1 text-amber-600 font-bold">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>需注意</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>合規</span>
                          </span>
                        )}
                      </td>

                      {/* Supervisor Approval */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        {sheet.supervisorApproved ? (
                          <span className="text-emerald-700 font-semibold text-[11px] flex items-center justify-center gap-1">
                            <Check className="w-3.5 h-3.5" />
                            <span>{sheet.approvedBy ? `${sheet.approvedBy}已核准` : '主管已核准'}</span>
                          </span>
                        ) : roleConfig.canApproveMeasurements && onQuickApprove ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onQuickApprove(sheet.id);
                            }}
                            className="px-2 py-0.5 text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100 rounded transition-colors"
                            title="點擊直接覆核此筆丈量尺寸"
                          >
                            點擊覆核
                          </button>
                        ) : (
                          <span className="text-slate-400 text-[11px]">待審核</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setSelectedSheetId(sheet.id)}
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded"
                            title="查看 2D 比例圖解"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {roleConfig.canEditMeasurements && (
                            <button
                              onClick={() => onEditSheet(sheet)}
                              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded"
                              title="編輯尺寸"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}
                          {roleConfig.canDeleteMeasurements && (
                            <button
                              onClick={() => {
                                if (confirm(`確定要刪除「${sheet.cabinetName}」這筆丈量紀錄嗎？`)) {
                                  onDeleteSheet(sheet.id);
                                }
                              }}
                              className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                              title="刪除"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Cabinet 2D Visualizer Detail View */}
      {activeVisualizerSheet && (
        <div className="pt-2">
          <CabinetVisualizer2D sheet={activeVisualizerSheet} />
        </div>
      )}
    </div>
  );
};
