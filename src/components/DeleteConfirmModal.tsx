/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { JobSite, User } from '../types';
import { AlertTriangle, Trash2, X, ShieldAlert } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  site: JobSite | null;
  currentUser: User | null;
  onConfirmDelete: (siteId: string) => void;
  onRequireSupervisorLogin: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  site,
  currentUser,
  onConfirmDelete,
  onRequireSupervisorLogin,
}) => {
  const [confirmInput, setConfirmInput] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !site) return null;

  const isSupervisor = currentUser?.role === 'supervisor';

  const handleDelete = async () => {
    if (!isSupervisor) return;
    setIsDeleting(true);
    try {
      await onConfirmDelete(site.id);
      onClose();
      setConfirmInput('');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-red-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-red-100 bg-red-50">
          <div className="flex items-center gap-2.5 text-red-700">
            <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center">
              <Trash2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-red-950">刪除案場與丈量紀錄</h3>
              <p className="text-xs text-red-700">危險操作 · 僅主管 (阿耀) 可執行</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-red-100/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {!isSupervisor ? (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg space-y-3">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                <ShieldAlert className="w-5 h-5 text-amber-600" />
                <span>權限不足：需要主管身分</span>
              </div>
              <p className="text-xs text-amber-800 leading-relaxed">
                依系統安全規範，<strong>刪除案場</strong>屬於永久銷毀操作，僅主管（阿耀）具備執行權限。當前使用者為員工模式。
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onRequireSupervisorLogin();
                }}
                className="w-full py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
              >
                切換主管帳號登入
              </button>
            </div>
          ) : (
            <>
              <p className="text-xs text-slate-600 leading-relaxed">
                您正準備刪除案場「<strong>{site.name}</strong>」（代號：{site.siteCode}）。
                此動作將一併刪除該案場所有的<strong>PDF施工圖檔</strong>與<strong>毫米丈量比對紀錄</strong>，無法還原！
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  請輸入案場代號 <code className="text-red-600 font-mono font-bold">{site.siteCode}</code> 確認刪除：
                </label>
                <input
                  type="text"
                  placeholder={site.siteCode}
                  value={confirmInput}
                  onChange={(e) => setConfirmInput(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-red-600 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  取消
                </button>
                <button
                  type="button"
                  disabled={confirmInput.trim() !== site.siteCode || isDeleting}
                  onClick={handleDelete}
                  className="px-5 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-xs disabled:opacity-40"
                >
                  {isDeleting ? '刪除中...' : '確認永久刪除案場'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
