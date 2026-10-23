/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  MeasurementSheet,
  CabinetCategory,
  CabinetPlannedDimensions,
  CabinetMeasuredDimensions,
  User,
  getRoleConfig,
} from '../types';
import { analyzeCabinetDimensions } from '../utils/tolerance';
import { X, Ruler, Sparkles, Check, AlertTriangle, ShieldCheck, Eye } from 'lucide-react';

interface MeasurementFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (sheetData: Omit<MeasurementSheet, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => void;
  siteId: string;
  initialData?: MeasurementSheet | null;
  currentUser: User | null;
}

const CATEGORY_OPTIONS: { value: CabinetCategory; label: string }[] = [
  { value: 'wardrobe', label: '衣櫃 (頂天/更衣室)' },
  { value: 'shoe_cabinet', label: '玄關鞋櫃 (懸空/落地)' },
  { value: 'kitchen_appliance', label: '廚房電器收納櫃' },
  { value: 'tv_cabinet', label: '客廳電視櫃 / 矮櫃' },
  { value: 'bookcase', label: '書櫃 / 展示格櫃' },
  { value: 'sideboard', label: '餐邊櫃 / 儲藏櫃' },
  { value: 'custom', label: '其他客製系統櫃' },
];

export const MeasurementFormModal: React.FC<MeasurementFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  siteId,
  initialData,
  currentUser,
}) => {
  const [itemCode, setItemCode] = useState(initialData?.itemCode || 'W-01');
  const [cabinetName, setCabinetName] = useState(initialData?.cabinetName || '');
  const [category, setCategory] = useState<CabinetCategory>(initialData?.category || 'wardrobe');
  const [roomLocation, setRoomLocation] = useState(initialData?.roomLocation || '');

  // Planned Dimensions
  const [planned, setPlanned] = useState<CabinetPlannedDimensions>(
    initialData?.planned || {
      width: 2400,
      height: 2600,
      depth: 600,
      skirting: 100,
      ceilingHeight: 2700,
      beamHeight: 0,
      beamDepth: 0,
      fillerAllowance: 15,
    }
  );

  // Measured Dimensions
  const [measured, setMeasured] = useState<CabinetMeasuredDimensions>(
    initialData?.measured || {
      width: 2405,
      height: 2600,
      depth: 605,
      skirting: 100,
      ceilingHeight: 2700,
      beamHeight: 0,
      beamDepth: 0,
      wallPlumbOffset: 0,
      floorLevelOffset: 0,
      outletCoords: '',
      notes: '',
    }
  );

  const [supervisorNotes, setSupervisorNotes] = useState(initialData?.supervisorNotes || '');
  const [supervisorApproved, setSupervisorApproved] = useState(initialData?.supervisorApproved || false);

  const roleConfig = getRoleConfig(currentUser?.role);
  const canApprove = roleConfig.canApproveMeasurements;
  const canEdit = roleConfig.canEditMeasurements;

  useEffect(() => {
    if (initialData) {
      setItemCode(initialData.itemCode);
      setCabinetName(initialData.cabinetName);
      setCategory(initialData.category);
      setRoomLocation(initialData.roomLocation);
      setPlanned(initialData.planned);
      setMeasured(initialData.measured);
      setSupervisorNotes(initialData.supervisorNotes || '');
      setSupervisorApproved(initialData.supervisorApproved || false);
    } else {
      setItemCode(`C-${Math.floor(10 + Math.random() * 90)}`);
      setCabinetName('');
      setRoomLocation('');
      setPlanned({
        width: 1800,
        height: 2400,
        depth: 600,
        skirting: 100,
        ceilingHeight: 2650,
        beamHeight: 0,
        beamDepth: 0,
        fillerAllowance: 15,
      });
      setMeasured({
        width: 1800,
        height: 2400,
        depth: 600,
        skirting: 100,
        ceilingHeight: 2650,
        beamHeight: 0,
        beamDepth: 0,
        wallPlumbOffset: 0,
        floorLevelOffset: 0,
        outletCoords: '',
        notes: '',
      });
      setSupervisorNotes('');
      setSupervisorApproved(false);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  // Real-time tolerance analysis preview
  const analysis = analyzeCabinetDimensions(planned, measured);

  const handleCopyPlannedToMeasured = () => {
    setMeasured((prev) => ({
      ...prev,
      width: planned.width,
      height: planned.height,
      depth: planned.depth,
      skirting: planned.skirting,
      ceilingHeight: planned.ceilingHeight,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cabinetName.trim()) {
      alert('請填寫櫃體名稱');
      return;
    }

    onSave({
      ...(initialData?.id ? { id: initialData.id } : {}),
      siteId,
      itemCode: itemCode.trim() || 'W-01',
      cabinetName: cabinetName.trim(),
      category,
      roomLocation: roomLocation.trim() || '現場指定空間',
      planned,
      measured,
      supervisorApproved,
      supervisorNotes,
      createdBy: initialData?.createdBy || currentUser?.name || '現場工務',
      updatedBy: currentUser?.name || '現場工務',
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center">
              <Ruler className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {initialData ? '編輯系統櫃丈量表' : '新增系統櫃丈量表'}
              </h3>
              <p className="text-xs text-slate-500">
                尺寸單位皆為毫米 (mm) · 即時差值運算與公差檢驗
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Section 1: Basic Cabinet Info */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pb-4 border-b border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                櫃體編號 (如 W-01) *
              </label>
              <input
                type="text"
                required
                value={itemCode}
                onChange={(e) => setItemCode(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 font-mono font-bold"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                櫃體名稱 *
              </label>
              <input
                type="text"
                required
                placeholder="例如：主臥頂天八門衣櫃 (含抽屜斗櫃)"
                value={cabinetName}
                onChange={(e) => setCabinetName(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                櫃體類別
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CabinetCategory)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900"
              >
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                所屬空間位置
              </label>
              <input
                type="text"
                placeholder="例如：3F 主臥室 右側牆面"
                value={roomLocation}
                onChange={(e) => setRoomLocation(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

          {/* Section 2: Planned Dimensions vs Measured Dimensions (2 Columns) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Planned Dimensions (規劃圖面尺寸) */}
            <div className="p-4 bg-sky-50/50 rounded-xl border border-sky-200/80">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-sky-900 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block" />
                  規劃圖面尺寸 (Design mm)
                </span>
                <span className="text-[11px] text-sky-600">CAD設計圖原定值</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-600 mb-1">規劃寬度 (W mm) *</label>
                  <input
                    type="number"
                    required
                    value={planned.width || ''}
                    onChange={(e) =>
                      setPlanned({ ...planned, width: Number(e.target.value) })
                    }
                    className="w-full px-2.5 py-1.5 bg-white border border-sky-300 rounded font-mono tabular-nums text-sm font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 mb-1">規劃總高 (H mm) *</label>
                  <input
                    type="number"
                    required
                    value={planned.height || ''}
                    onChange={(e) =>
                      setPlanned({ ...planned, height: Number(e.target.value) })
                    }
                    className="w-full px-2.5 py-1.5 bg-white border border-sky-300 rounded font-mono tabular-nums text-sm font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 mb-1">規劃深度 (D mm) *</label>
                  <input
                    type="number"
                    required
                    value={planned.depth || ''}
                    onChange={(e) =>
                      setPlanned({ ...planned, depth: Number(e.target.value) })
                    }
                    className="w-full px-2.5 py-1.5 bg-white border border-sky-300 rounded font-mono tabular-nums text-sm font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 mb-1">踢腳板高度 (mm)</label>
                  <input
                    type="number"
                    value={planned.skirting || 0}
                    onChange={(e) =>
                      setPlanned({ ...planned, skirting: Number(e.target.value) })
                    }
                    className="w-full px-2.5 py-1.5 bg-white border border-sky-300 rounded font-mono tabular-nums text-sm"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 mb-1">原案天花淨高 (mm)</label>
                  <input
                    type="number"
                    value={planned.ceilingHeight || 0}
                    onChange={(e) =>
                      setPlanned({ ...planned, ceilingHeight: Number(e.target.value) })
                    }
                    className="w-full px-2.5 py-1.5 bg-white border border-sky-300 rounded font-mono tabular-nums text-sm"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 mb-1">預留收邊條 (mm)</label>
                  <input
                    type="number"
                    value={planned.fillerAllowance || 15}
                    onChange={(e) =>
                      setPlanned({ ...planned, fillerAllowance: Number(e.target.value) })
                    }
                    className="w-full px-2.5 py-1.5 bg-white border border-sky-300 rounded font-mono tabular-nums text-sm"
                  />
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-sky-200/50 flex justify-end">
                <button
                  type="button"
                  onClick={handleCopyPlannedToMeasured}
                  className="text-[11px] text-sky-700 hover:text-sky-900 font-semibold flex items-center gap-1 bg-white px-2.5 py-1 rounded border border-sky-300 hover:bg-sky-50 transition-colors"
                >
                  <Sparkles className="w-3 h-3 text-sky-600" />
                  <span>複製到現場丈量欄位 (快速登打)</span>
                </button>
              </div>
            </div>

            {/* Right: Measured Dimensions (現場丈量實測尺寸) */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-300">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-900 inline-block" />
                  現場丈量實測 (Measured mm)
                </span>
                <span className="text-[11px] text-slate-500 font-mono">雷射測距儀實錄</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    實測寬度 (W mm) *
                  </label>
                  <input
                    type="number"
                    required
                    value={measured.width || ''}
                    onChange={(e) =>
                      setMeasured({ ...measured, width: Number(e.target.value) })
                    }
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded font-mono tabular-nums text-sm font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    實測總高 (H mm) *
                  </label>
                  <input
                    type="number"
                    required
                    value={measured.height || ''}
                    onChange={(e) =>
                      setMeasured({ ...measured, height: Number(e.target.value) })
                    }
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded font-mono tabular-nums text-sm font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    實測深度 (D mm) *
                  </label>
                  <input
                    type="number"
                    required
                    value={measured.depth || ''}
                    onChange={(e) =>
                      setMeasured({ ...measured, depth: Number(e.target.value) })
                    }
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded font-mono tabular-nums text-sm font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">實測踢腳 (mm)</label>
                  <input
                    type="number"
                    value={measured.skirting || 0}
                    onChange={(e) =>
                      setMeasured({ ...measured, skirting: Number(e.target.value) })
                    }
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded font-mono tabular-nums text-sm"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">實測天花板淨高 (mm)</label>
                  <input
                    type="number"
                    value={measured.ceilingHeight || 0}
                    onChange={(e) =>
                      setMeasured({ ...measured, ceilingHeight: Number(e.target.value) })
                    }
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded font-mono tabular-nums text-sm"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">大樑底高 (0為無樑)</label>
                  <input
                    type="number"
                    value={measured.beamHeight || 0}
                    onChange={(e) =>
                      setMeasured({ ...measured, beamHeight: Number(e.target.value) })
                    }
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded font-mono tabular-nums text-sm"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">大樑深度 (mm)</label>
                  <input
                    type="number"
                    value={measured.beamDepth || 0}
                    onChange={(e) =>
                      setMeasured({ ...measured, beamDepth: Number(e.target.value) })
                    }
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded font-mono tabular-nums text-sm"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">
                    側牆歪斜 (mm, +內倒 -外斜)
                  </label>
                  <input
                    type="number"
                    value={measured.wallPlumbOffset || 0}
                    onChange={(e) =>
                      setMeasured({
                        ...measured,
                        wallPlumbOffset: Number(e.target.value),
                      })
                    }
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded font-mono tabular-nums text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Outlet / Pipe Coordinates & On-site Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                插座 / 出水管 / 開關座標備註
              </label>
              <input
                type="text"
                placeholder="例如：距左牆 450mm, 距地 1050mm (雙聯110V帶開關)"
                value={measured.outletCoords}
                onChange={(e) =>
                  setMeasured({ ...measured, outletCoords: e.target.value })
                }
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                現場特殊障礙物或丈量備註
              </label>
              <input
                type="text"
                placeholder="例如：冷媒管走樑下、門套線凸出 12mm 需留倒角"
                value={measured.notes}
                onChange={(e) =>
                  setMeasured({ ...measured, notes: e.target.value })
                }
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

          {/* Real-time Tolerance Preview Alert Banner */}
          <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800">即時公差分析：</span>
              <span className="font-mono">
                寬度 Δ: {measured.width - planned.width > 0 ? '+' : ''}
                {measured.width - planned.width} mm
              </span>
              <span>·</span>
              <span className="font-mono">
                深度 Δ: {measured.depth - planned.depth > 0 ? '+' : ''}
                {measured.depth - planned.depth} mm
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`px-2 py-0.5 rounded font-semibold text-[11px] ${
                  analysis.overallSeverity === 'danger'
                    ? 'bg-red-100 text-red-800'
                    : analysis.overallSeverity === 'warning'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {analysis.overallSeverity === 'danger'
                  ? '尺寸嚴重干涉'
                  : analysis.overallSeverity === 'warning'
                  ? '需微調/收邊條吸收'
                  : '合規公差'}
              </span>
            </div>
          </div>

          {/* Supervisor Approval Section */}
          <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200 text-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-amber-950 flex items-center gap-1.5">
                <Check className="w-4 h-4 text-amber-600" />
                <span>尺寸開板覆核狀態 ({canApprove ? '可審核' : '待主管審核'})</span>
              </span>
              {canApprove ? (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={supervisorApproved}
                    onChange={(e) => setSupervisorApproved(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span className="font-bold text-amber-900">核准此丈量項目開工發包</span>
                </label>
              ) : (
                <span className="text-amber-800 font-mono">
                  {supervisorApproved ? '✓ 主管已核准' : '⏳ 待主管覆核'}
                </span>
              )}
            </div>

            <input
              type="text"
              disabled={!canApprove}
              placeholder={
                canApprove
                  ? '批示意見 (例如：尺寸可、收邊條現場削 5mm)'
                  : '需總主管阿耀或工務主任方可填寫覆核批示'
              }
              value={supervisorNotes}
              onChange={(e) => setSupervisorNotes(e.target.value)}
              className="w-full px-3 py-1.5 bg-white border border-amber-200 rounded text-xs focus:ring-2 focus:ring-amber-600 disabled:bg-amber-100/40"
            />
          </div>

          {!canEdit && (
            <div className="p-3 bg-slate-100 border border-slate-300 rounded-lg text-xs text-slate-600 flex items-center gap-2">
              <Eye className="w-4 h-4 text-slate-500" />
              <span>當前身分為 Level 4 僅查閱模式，無法變更或儲存尺寸數值。</span>
            </div>
          )}

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              關閉
            </button>
            {canEdit && (
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-xs"
              >
                儲存丈量比對資料
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
