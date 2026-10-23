/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'supervisor' | 'leader' | 'measurer' | 'readonly' | 'staff';

export interface RolePermissionConfig {
  role: UserRole;
  label: string;
  level: number;
  badgeClass: string;
  canDeleteSite: boolean;
  canManageStaff: boolean;
  canDeleteStaff: boolean;
  canApproveMeasurements: boolean;
  canEditMeasurements: boolean;
  canDeleteMeasurements: boolean;
  canUploadDrawings: boolean;
  description: string;
}

export const ROLE_CONFIGS: Record<UserRole, RolePermissionConfig> = {
  supervisor: {
    role: 'supervisor',
    label: '總主管 (阿耀)',
    level: 1,
    badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
    canDeleteSite: true,
    canManageStaff: true,
    canDeleteStaff: true,
    canApproveMeasurements: true,
    canEditMeasurements: true,
    canDeleteMeasurements: true,
    canUploadDrawings: true,
    description: '最高管理權限：可刪除案場、全域覆核丈量開板、刪除與新增員工、調整全部項目',
  },
  leader: {
    role: 'leader',
    label: '工務主任 / 協同主管',
    level: 2,
    badgeClass: 'bg-blue-100 text-blue-900 border-blue-300',
    canDeleteSite: false,
    canManageStaff: true,
    canDeleteStaff: true,
    canApproveMeasurements: true,
    canEditMeasurements: true,
    canDeleteMeasurements: true,
    canUploadDrawings: true,
    description: '現場審核權限：可建立案場、核准丈量尺寸、上傳圖面、管理一般員工；不可刪除案場',
  },
  measurer: {
    role: 'measurer',
    label: '現場丈量工程師',
    level: 3,
    badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    canDeleteSite: false,
    canManageStaff: false,
    canDeleteStaff: false,
    canApproveMeasurements: false,
    canEditMeasurements: true,
    canDeleteMeasurements: false,
    canUploadDrawings: true,
    description: '工程量測權限：可建立案場、填報與修改毫米丈量尺寸、上傳施工圖面；無審核與刪除權限',
  },
  staff: {
    role: 'staff',
    label: '現場丈量工程師',
    level: 3,
    badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    canDeleteSite: false,
    canManageStaff: false,
    canDeleteStaff: false,
    canApproveMeasurements: false,
    canEditMeasurements: true,
    canDeleteMeasurements: false,
    canUploadDrawings: true,
    description: '現場丈量人員',
  },
  readonly: {
    role: 'readonly',
    label: '僅查閱助理 / 實習',
    level: 4,
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-300',
    canDeleteSite: false,
    canManageStaff: false,
    canDeleteStaff: false,
    canApproveMeasurements: false,
    canEditMeasurements: false,
    canDeleteMeasurements: false,
    canUploadDrawings: false,
    description: '僅供現場施工查閱：可瀏覽案場資訊、查看比對表與施工圖，禁止新增或修改任何數值',
  },
};

export function getRoleConfig(role?: UserRole): RolePermissionConfig {
  if (!role) return ROLE_CONFIGS.measurer;
  return ROLE_CONFIGS[role] || ROLE_CONFIGS.measurer;
}

export interface Employee {
  id: string;
  code: string; // e.g. EMP-01
  name: string;
  username: string;
  password?: string;
  title: string;
  phone: string;
  role: UserRole;
  notes?: string;
  createdAt: string;
  active: boolean;
}

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  avatar?: string;
  title: string;
  code?: string;
}

export type SiteStatus = 'measuring' | 'verified' | 'warning' | 'ordered';

export interface DrawingFile {
  id: string;
  name: string;
  size: number;
  fileType: string;
  dataUrl: string;
  uploadedBy: string;
  uploadedAt: string;
  pins?: DrawingPin[];
}

export interface DrawingPin {
  id: string;
  cabinetId: string;
  label: string;
  xPercent: number; // 0 - 100%
  yPercent: number; // 0 - 100%
}

export interface JobSite {
  id: string;
  siteCode: string;
  name: string;
  clientName: string;
  phone: string;
  address: string;
  spaceType: string;
  status: SiteStatus;
  assignedStaff: string;
  measurementDate: string;
  estimatedDeliveryDate: string;
  notes: string;
  drawings: DrawingFile[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export type CabinetCategory =
  | 'wardrobe'
  | 'shoe_cabinet'
  | 'tv_cabinet'
  | 'kitchen_appliance'
  | 'bookcase'
  | 'sideboard'
  | 'custom';

export interface CabinetPlannedDimensions {
  width: number; // mm
  height: number; // mm
  depth: number; // mm
  skirting: number; // 踢腳高 mm
  ceilingHeight: number; // 天花板淨高 mm
  beamHeight: number; // 樑底高 mm (0 if none)
  beamDepth: number; // 樑深 mm (0 if none)
  fillerAllowance: number; // 預留收邊條尺寸 mm (e.g. 15mm ~ 25mm)
}

export interface CabinetMeasuredDimensions {
  width: number; // mm (實測寬度)
  height: number; // mm (實測總高度)
  depth: number; // mm (實測進深)
  skirting: number; // mm (實測踢腳高)
  ceilingHeight: number; // mm (實測天花淨高)
  beamHeight: number; // mm (實測大樑底高)
  beamDepth: number; // mm (實測大樑進深)
  wallPlumbOffset: number; // mm 側牆垂直傾斜 (正值為內倒，負值為外傾)
  floorLevelOffset: number; // mm 地面高低落差
  outletCoords: string; // 插座/冷熱水管位置備註
  notes: string; // 現場特殊障礙物或備註
}

export type DeviationSeverity = 'normal' | 'warning' | 'danger';

export interface DimensionDeviation {
  diff: number; // measured - planned (mm)
  severity: DeviationSeverity;
  reason: string;
}

export interface MeasurementSheet {
  id: string;
  siteId: string;
  itemCode: string; // e.g. W-01, S-02
  cabinetName: string; // e.g. 主臥六門頂天衣櫃
  category: CabinetCategory;
  roomLocation: string; // e.g. 主臥室 / 玄關
  planned: CabinetPlannedDimensions;
  measured: CabinetMeasuredDimensions;
  supervisorApproved: boolean;
  supervisorNotes?: string;
  approvedBy?: string;
  approvedAt?: string;
  createdBy: string;
  updatedBy: string;
  updatedAt: string;
}

export interface SystemSyncPayload {
  sites: JobSite[];
  measurements: MeasurementSheet[];
  lastModified: number;
}
