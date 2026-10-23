/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { JobSite, SiteStatus, User, Employee } from '../types';
import { X, Building2, Calendar, Phone, MapPin, UserPlus } from 'lucide-react';

interface NewSiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (siteData: Omit<JobSite, 'id' | 'createdAt' | 'updatedAt' | 'drawings'>) => void;
  currentUser: User | null;
  staffList?: Employee[];
}

export const NewSiteModal: React.FC<NewSiteModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentUser,
  staffList = [],
}) => {
  const [siteCode, setSiteCode] = useState(
    `ST-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`
  );
  const [name, setName] = useState('');
  const [clientName, setClientName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [spaceType, setSpaceType] = useState('全室系統櫃工程');
  const [status, setStatus] = useState<SiteStatus>('measuring');
  const [assignedStaff, setAssignedStaff] = useState(currentUser?.name || '陳偉 (丈量師)');
  const [measurementDate, setMeasurementDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('請輸入案場名稱');
      return;
    }

    onSave({
      siteCode: siteCode.trim(),
      name: name.trim(),
      clientName: clientName.trim() || '業主',
      phone: phone.trim(),
      address: address.trim(),
      spaceType: spaceType.trim(),
      status,
      assignedStaff: assignedStaff.trim(),
      measurementDate,
      estimatedDeliveryDate: estimatedDeliveryDate || '未定',
      notes: notes.trim(),
      createdBy: currentUser?.name || '系統建立',
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center">
              <Building2 className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">新增系統櫃案場</h3>
              <p className="text-xs text-slate-500">
                建立新工地案場資料，建立後可上傳 PDF 施工圖與新增丈量表
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                案場代號 *
              </label>
              <input
                type="text"
                required
                value={siteCode}
                onChange={(e) => setSiteCode(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg font-mono font-bold"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                案場名稱 *
              </label>
              <input
                type="text"
                required
                placeholder="例如：信義之星 A棟 15F 林公館"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                業主姓名 / 接洽人
              </label>
              <input
                type="text"
                placeholder="例如：林董事長 / 陳設計師"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                聯絡電話
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="0912-345-678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg font-mono"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              施工地址
            </label>
            <input
              type="text"
              placeholder="例如：台北市信義區松智路 18 號 15 樓"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                施作空間範疇
              </label>
              <input
                type="text"
                placeholder="全室 / 主臥 / 玄關客廳"
                value={spaceType}
                onChange={(e) => setSpaceType(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                指派丈量工程師
              </label>
              {staffList.length > 0 ? (
                <select
                  value={assignedStaff}
                  onChange={(e) => setAssignedStaff(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900"
                >
                  {staffList.map((emp) => (
                    <option key={emp.id} value={`${emp.name} (${emp.title.slice(0, 4)})`}>
                      {emp.name} · {emp.title}
                    </option>
                  ))}
                  <option value={assignedStaff}>其他或自訂: {assignedStaff}</option>
                </select>
              ) : (
                <input
                  type="text"
                  value={assignedStaff}
                  onChange={(e) => setAssignedStaff(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg"
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                案場狀態
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as SiteStatus)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg"
              >
                <option value="measuring">丈量中 (Measuring)</option>
                <option value="verified">尺寸已核對 (Verified)</option>
                <option value="warning">公差待覆核 (Warning)</option>
                <option value="ordered">已發包工廠 (Ordered)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                丈量日期
              </label>
              <input
                type="date"
                value={measurementDate}
                onChange={(e) => setMeasurementDate(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                預計交期 / 安裝日
              </label>
              <input
                type="date"
                value={estimatedDeliveryDate}
                onChange={(e) => setEstimatedDeliveryDate(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              現場注意事項 (例如大樓進出時間、梯廳尺寸限制)
            </label>
            <textarea
              rows={2}
              placeholder="例如：貨梯高 2100mm、需防護木地板、現場大樑深度需複驗"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-xs"
            >
              建立案場
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
