/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Employee, User, UserRole, getRoleConfig, ROLE_CONFIGS } from '../types';
import {
  Users,
  UserPlus,
  X,
  Phone,
  Trash2,
  Edit2,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Eye,
  EyeOff,
  AlertTriangle,
  ShieldAlert,
  Info,
  Check,
  XCircle,
} from 'lucide-react';

interface StaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffList: Employee[];
  currentUser: User | null;
  onAddStaff: (newStaff: Omit<Employee, 'id' | 'createdAt'>) => void;
  onUpdateStaff: (id: string, updates: Partial<Employee>) => void;
  onDeleteStaff: (id: string) => void;
}

const TITLE_PRESETS = [
  '資深現場丈量工程師',
  '工務主任 / 現場覆核',
  '現場工務助理',
  '系統櫃設計規劃師',
  '組裝安裝技師',
  '工務專案經理',
  '實習工務助理',
];

export const StaffModal: React.FC<StaffModalProps> = ({
  isOpen,
  onClose,
  staffList,
  currentUser,
  onAddStaff,
  onUpdateStaff,
  onDeleteStaff,
}) => {
  const [activeTab, setActiveTab] = useState<'roster' | 'matrix'>('roster');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [deleteConfirmStaff, setDeleteConfirmStaff] = useState<Employee | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('1234');
  const [showPassword, setShowPassword] = useState(false);
  const [code, setCode] = useState('');
  const [title, setTitle] = useState(TITLE_PRESETS[0]);
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('measurer');
  const [notes, setNotes] = useState('');

  // Filter
  const [filterRole, setFilterRole] = useState<string>('all');

  if (!isOpen) return null;

  const currentRoleConfig = getRoleConfig(currentUser?.role);
  const canManage = currentRoleConfig.canManageStaff;
  const canDelete = currentRoleConfig.canDeleteStaff;

  const handleOpenCreate = () => {
    setEditingStaffId(null);
    setName('');
    setUsername('');
    setPassword('1234');
    setCode(`EMP-0${staffList.length + 1}`);
    setTitle(TITLE_PRESETS[0]);
    setPhone('');
    setRole('measurer');
    setNotes('');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (emp: Employee) => {
    setEditingStaffId(emp.id);
    setName(emp.name);
    setUsername(emp.username);
    setPassword(emp.password || '1234');
    setCode(emp.code);
    setTitle(emp.title);
    setPhone(emp.phone);
    setRole(emp.role);
    setNotes(emp.notes || '');
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('請輸入員工姓名');
      return;
    }
    if (!password.trim()) {
      alert('請為員工設定登入密碼');
      return;
    }

    const payload = {
      name: name.trim(),
      username: username.trim() || name.trim(),
      password: password.trim(),
      code: code.trim() || `EMP-${Date.now().toString().slice(-4)}`,
      title: title.trim(),
      phone: phone.trim(),
      role,
      notes: notes.trim(),
      active: true,
    };

    if (editingStaffId) {
      onUpdateStaff(editingStaffId, payload);
    } else {
      onAddStaff(payload);
    }

    setIsFormOpen(false);
  };

  const handleConfirmDelete = () => {
    if (!deleteConfirmStaff) return;
    if (deleteConfirmStaff.username === '阿耀') {
      alert('總主管帳號（阿耀）屬於核心管理員，系統限制無法刪除。');
      setDeleteConfirmStaff(null);
      return;
    }
    onDeleteStaff(deleteConfirmStaff.id);
    setDeleteConfirmStaff(null);
  };

  const filteredStaff = staffList.filter((s) => {
    if (filterRole === 'all') return true;
    return s.role === filterRole;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center">
              <Users className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                員工帳號、密碼與權限分級管理
              </h3>
              <p className="text-xs text-slate-500">
                新增員工帳號、配置登入密碼與設定 4 級權限管理矩陣
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isFormOpen && canManage && (
              <button
                onClick={handleOpenCreate}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <UserPlus className="w-4 h-4 text-amber-400" />
                <span>新增員工</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Sub-Tabs */}
        <div className="px-6 pt-3 border-b border-slate-200 flex items-center justify-between bg-white text-xs">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('roster')}
              className={`px-3 py-2 font-semibold border-b-2 transition-colors ${
                activeTab === 'roster'
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              員工帳號名冊 ({staffList.length})
            </button>
            <button
              onClick={() => setActiveTab('matrix')}
              className={`px-3 py-2 font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'matrix'
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
              <span>4 級權限分級對照矩陣</span>
            </button>
          </div>

          {activeTab === 'roster' && (
            <div className="flex items-center gap-1 pb-1">
              <span className="text-[11px] text-slate-400 mr-1">身分過濾:</span>
              <button
                onClick={() => setFilterRole('all')}
                className={`px-2 py-0.5 rounded text-[11px] ${
                  filterRole === 'all' ? 'bg-slate-900 text-white font-bold' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                全部
              </button>
              <button
                onClick={() => setFilterRole('supervisor')}
                className={`px-2 py-0.5 rounded text-[11px] ${
                  filterRole === 'supervisor' ? 'bg-amber-600 text-white font-bold' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                總主管
              </button>
              <button
                onClick={() => setFilterRole('leader')}
                className={`px-2 py-0.5 rounded text-[11px] ${
                  filterRole === 'leader' ? 'bg-blue-600 text-white font-bold' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                工務主任
              </button>
              <button
                onClick={() => setFilterRole('measurer')}
                className={`px-2 py-0.5 rounded text-[11px] ${
                  filterRole === 'measurer' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                現場丈量師
              </button>
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="p-6">
          {activeTab === 'matrix' ? (
            /* 權限分級矩陣表 (Permission Matrix View) */
            <div className="space-y-4">
              <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900">
                <strong>系統權限分級說明：</strong>
                為保障工程資料安全，系統依工務權責明確劃分為 4 個等級。刪除案場與全域覆核屬於 Level 1 總主管獨有權限；員工管理由 Level 1 及 Level 2 主任把關。
              </div>

              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                      <th className="py-3 px-4">等級與角色名稱</th>
                      <th className="py-3 px-3 text-center">刪除案場</th>
                      <th className="py-3 px-3 text-center">全域尺寸覆核</th>
                      <th className="py-3 px-3 text-center">填報/修改丈量</th>
                      <th className="py-3 px-3 text-center">上傳施工圖面</th>
                      <th className="py-3 px-3 text-center">新增/刪除員工</th>
                      <th className="py-3 px-4">主要執掌與說明</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {/* Level 1: Supervisor */}
                    <tr className="bg-amber-50/30">
                      <td className="py-3 px-4 font-bold text-amber-950 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        <span>Level 1 總主管 (阿耀)</span>
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-emerald-600">✓ 專屬</td>
                      <td className="py-3 px-3 text-center font-bold text-emerald-600">✓ 最高</td>
                      <td className="py-3 px-3 text-center font-bold text-emerald-600">✓</td>
                      <td className="py-3 px-3 text-center font-bold text-emerald-600">✓</td>
                      <td className="py-3 px-3 text-center font-bold text-emerald-600">✓</td>
                      <td className="py-3 px-4 text-slate-600">
                        最高管理者，全功能解鎖、案場與員工增刪、公差最終開板
                      </td>
                    </tr>

                    {/* Level 2: Leader */}
                    <tr className="bg-blue-50/20">
                      <td className="py-3 px-4 font-bold text-blue-900 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        <span>Level 2 工務主任 / 協同主管</span>
                      </td>
                      <td className="py-3 px-3 text-center text-slate-300">✕</td>
                      <td className="py-3 px-3 text-center font-bold text-blue-600">✓ 可覆核</td>
                      <td className="py-3 px-3 text-center font-bold text-emerald-600">✓</td>
                      <td className="py-3 px-3 text-center font-bold text-emerald-600">✓</td>
                      <td className="py-3 px-3 text-center font-bold text-blue-600">✓ (一般員工)</td>
                      <td className="py-3 px-4 text-slate-600">
                        現場工務領班，負責尺寸核對與圖面管理，無法刪除案場
                      </td>
                    </tr>

                    {/* Level 3: Measurer */}
                    <tr>
                      <td className="py-3 px-4 font-bold text-emerald-900 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span>Level 3 現場丈量工程師</span>
                      </td>
                      <td className="py-3 px-3 text-center text-slate-300">✕</td>
                      <td className="py-3 px-3 text-center text-slate-300">✕ (待審核)</td>
                      <td className="py-3 px-3 text-center font-bold text-emerald-600">✓ 雷射填報</td>
                      <td className="py-3 px-3 text-center font-bold text-emerald-600">✓ 上傳圖面</td>
                      <td className="py-3 px-3 text-center text-slate-300">✕</td>
                      <td className="py-3 px-4 text-slate-600">
                        現場雷射測距實測、登打 mm 尺寸、填寫備註與上傳藍圖
                      </td>
                    </tr>

                    {/* Level 4: Readonly */}
                    <tr className="bg-slate-50/60">
                      <td className="py-3 px-4 font-bold text-slate-700 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-slate-400" />
                        <span>Level 4 實習工務 / 僅查閱</span>
                      </td>
                      <td className="py-3 px-3 text-center text-slate-300">✕</td>
                      <td className="py-3 px-3 text-center text-slate-300">✕</td>
                      <td className="py-3 px-3 text-center text-slate-300">✕ (僅瀏覽)</td>
                      <td className="py-3 px-3 text-center text-slate-300">✕</td>
                      <td className="py-3 px-3 text-center text-slate-300">✕</td>
                      <td className="py-3 px-4 text-slate-500">
                        施工現場對圖使用，可查看比對表與 2D 立面圖，禁止更動數值
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* 員工名冊與新增表單 (Roster View) */
            <>
              {/* Add / Edit Form Panel */}
              {isFormOpen ? (
                <div className="bg-slate-50 rounded-xl p-5 border border-slate-300 mb-6">
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200">
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <UserPlus className="w-4 h-4 text-slate-700" />
                      <span>{editingStaffId ? '編輯員工帳號與權限' : '新增現場員工帳號與密碼'}</span>
                    </h4>
                    <button
                      type="button"
                      onClick={() => setIsFormOpen(false)}
                      className="text-xs text-slate-500 hover:text-slate-800"
                    >
                      取消返回
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          員工工號 (Code) *
                        </label>
                        <input
                          type="text"
                          required
                          value={code}
                          onChange={(e) => setCode(e.target.value)}
                          placeholder="例如：EMP-05"
                          className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg font-mono font-bold focus:ring-2 focus:ring-slate-900"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          員工姓名 *
                        </label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => {
                            setName(e.target.value);
                            if (!username) setUsername(e.target.value);
                          }}
                          placeholder="例如：許文強"
                          className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          登入帳號 (Username) *
                        </label>
                        <input
                          type="text"
                          required
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="登入帳號或代號"
                          className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-slate-900"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          登入密碼 (Password) *
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="設定員工密碼"
                            className="w-full px-3 py-1.5 pr-8 text-xs bg-white border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-slate-900"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-2 top-2 text-slate-400 hover:text-slate-600"
                          >
                            {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          專業職稱
                        </label>
                        <select
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900"
                        >
                          {TITLE_PRESETS.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          聯絡電話
                        </label>
                        <input
                          type="text"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="09xx-xxx-xxx"
                          className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-slate-900"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          系統權限分級 (Role Tier) *
                        </label>
                        <select
                          value={role}
                          onChange={(e) => setRole(e.target.value as UserRole)}
                          className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 font-semibold text-slate-900"
                        >
                          <option value="measurer">Level 3: 現場丈量工程師 (填報/修改尺寸)</option>
                          <option value="leader">Level 2: 工務主任 / 協同主管 (審核/管理)</option>
                          <option value="readonly">Level 4: 僅查閱助理 (唯讀施工圖與尺寸)</option>
                          {currentUser?.role === 'supervisor' && (
                            <option value="supervisor">Level 1: 總主管 (最高管理與刪除案場)</option>
                          )}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        備註 / 負責案場或裝備工具
                      </label>
                      <input
                        type="text"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="例如：配備 50m 藍芽雷射測距儀、主責新北區域"
                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2.5 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsFormOpen(false)}
                        className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-100"
                      >
                        取消
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs"
                      >
                        {editingStaffId ? '儲存員工變更' : '確認新增員工'}
                      </button>
                    </div>
                  </form>
                </div>
              ) : null}

              {/* Staff Roster Table */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100/90 text-slate-700 font-semibold border-b border-slate-200">
                        <th className="py-2.5 px-3">工號</th>
                        <th className="py-2.5 px-3">姓名 / 帳號</th>
                        <th className="py-2.5 px-3">登入密碼</th>
                        <th className="py-2.5 px-3">職稱</th>
                        <th className="py-2.5 px-3">權限分級</th>
                        <th className="py-2.5 px-3">聯絡電話</th>
                        <th className="py-2.5 px-3">備註說明</th>
                        <th className="py-2.5 px-3 text-right">操作 (編輯/刪除)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredStaff.map((emp) => {
                        const cfg = getRoleConfig(emp.role);
                        const isRootSupervisor = emp.username === '阿耀';

                        return (
                          <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-2.5 px-3 font-mono font-bold text-slate-800">
                              {emp.code}
                            </td>
                            <td className="py-2.5 px-3">
                              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                <span>{emp.name}</span>
                                {isRootSupervisor && (
                                  <span className="text-[10px] text-amber-700 bg-amber-100 px-1 py-0.2 rounded font-mono font-bold">
                                    核心主管
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] font-mono text-slate-400">
                                帳號: {emp.username}
                              </div>
                            </td>

                            {/* Password cell */}
                            <td className="py-2.5 px-3 font-mono">
                              {isRootSupervisor ? (
                                <span className="text-slate-400 font-sans text-[11px]">•••• (安全加密)</span>
                              ) : (
                                <span className="text-slate-700 font-bold bg-slate-100 px-1.5 py-0.5 rounded">
                                  {emp.password || '1234'}
                                </span>
                              )}
                            </td>

                            <td className="py-2.5 px-3 text-slate-700 font-medium">
                              {emp.title}
                            </td>

                            {/* Permission Badge */}
                            <td className="py-2.5 px-3">
                              <span
                                className={`inline-flex items-center gap-1 font-semibold text-[11px] px-2 py-0.5 rounded border ${cfg.badgeClass}`}
                              >
                                {emp.role === 'supervisor' ? (
                                  <ShieldCheck className="w-3 h-3 text-amber-600" />
                                ) : (
                                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                )}
                                <span>{cfg.label}</span>
                              </span>
                            </td>

                            <td className="py-2.5 px-3 font-mono text-slate-600">
                              {emp.phone || '-'}
                            </td>

                            <td className="py-2.5 px-3 text-slate-500 max-w-[160px] truncate">
                              {emp.notes || '-'}
                            </td>

                            {/* Actions (Edit / Delete) */}
                            <td className="py-2.5 px-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                {canManage && (
                                  <button
                                    onClick={() => handleOpenEdit(emp)}
                                    className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded"
                                    title="編輯資料與修改密碼"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                )}

                                {/* Delete employee button */}
                                {isRootSupervisor ? (
                                  <span
                                    className="p-1 text-slate-300 cursor-not-allowed"
                                    title="總主管阿耀為系統核心，不可刪除"
                                  >
                                    <ShieldCheck className="w-3.5 h-3.5" />
                                  </span>
                                ) : canDelete ? (
                                  <button
                                    onClick={() => setDeleteConfirmStaff(emp)}
                                    className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                                    title="刪除此員工帳號"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                ) : (
                                  <span
                                    className="p-1 text-slate-300 cursor-not-allowed"
                                    title="需主管身分方可刪除員工"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-600 flex items-center justify-between">
                <span>
                  共 <strong>{staffList.length}</strong> 位工務人員 · 登入時需驗證員工帳號與對應密碼。
                </span>
                <span className="text-slate-500">
                  唯有總主管（阿耀）與工務主任具備員工刪除權限。
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Delete Staff Confirmation Modal */}
      {deleteConfirmStaff && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-xl shadow-2xl border border-red-200 overflow-hidden">
            <div className="p-5 text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
                <Trash2 className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-1">
                確定要刪除員工「{deleteConfirmStaff.name}」？
              </h4>
              <p className="text-xs text-slate-500 mb-2">
                工號：<span className="font-mono font-bold text-slate-700">{deleteConfirmStaff.code}</span> · 
                帳號：<span className="font-mono text-slate-700">{deleteConfirmStaff.username}</span>
              </p>
              <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-100 text-left">
                刪除後此員工將無法再使用其帳號密碼登入系統。如其有被指派為案場丈量師，歷史紀錄將予以保留。
              </p>
            </div>
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmStaff(null)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-100"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-xs"
              >
                確認永久刪除員工
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
