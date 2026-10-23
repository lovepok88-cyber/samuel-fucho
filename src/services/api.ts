/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { JobSite, MeasurementSheet, User, DrawingFile, Employee } from '../types';
import { INITIAL_SITES, INITIAL_MEASUREMENTS, INITIAL_EMPLOYEES } from '../data/initialData';

const STORAGE_KEY_SITES = 'cabinet_meas_sites_v1';
const STORAGE_KEY_MEASUREMENTS = 'cabinet_meas_sheets_v1';
const STORAGE_KEY_STAFF = 'cabinet_meas_staff_v1';
const STORAGE_KEY_USER = 'cabinet_meas_current_user_v1';
const STORAGE_KEY_TIMESTAMP = 'cabinet_meas_last_sync_v1';

// BroadcastChannel for instant multi-tab sync
const syncChannel = typeof window !== 'undefined' && 'BroadcastChannel' in window
  ? new BroadcastChannel('cabinet_sync_channel')
  : null;

function loadLocalSites(): JobSite[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SITES);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load sites from localStorage', e);
  }
  saveLocalSites(INITIAL_SITES);
  return INITIAL_SITES;
}

function saveLocalSites(sites: JobSite[]) {
  try {
    localStorage.setItem(STORAGE_KEY_SITES, JSON.stringify(sites));
    localStorage.setItem(STORAGE_KEY_TIMESTAMP, Date.now().toString());
  } catch (e) {
    console.error('Failed to save sites to localStorage', e);
  }
}

function loadLocalMeasurements(): MeasurementSheet[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MEASUREMENTS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load measurements from localStorage', e);
  }
  saveLocalMeasurements(INITIAL_MEASUREMENTS);
  return INITIAL_MEASUREMENTS;
}

function saveLocalMeasurements(items: MeasurementSheet[]) {
  try {
    localStorage.setItem(STORAGE_KEY_MEASUREMENTS, JSON.stringify(items));
    localStorage.setItem(STORAGE_KEY_TIMESTAMP, Date.now().toString());
  } catch (e) {
    console.error('Failed to save measurements to localStorage', e);
  }
}

function loadLocalStaff(): Employee[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_STAFF);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load staff from localStorage', e);
  }
  saveLocalStaff(INITIAL_EMPLOYEES);
  return INITIAL_EMPLOYEES;
}

function saveLocalStaff(staff: Employee[]) {
  try {
    localStorage.setItem(STORAGE_KEY_STAFF, JSON.stringify(staff));
    localStorage.setItem(STORAGE_KEY_TIMESTAMP, Date.now().toString());
  } catch (e) {
    console.error('Failed to save staff to localStorage', e);
  }
}

export function getCurrentUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USER);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  // Default to supervisor for convenience or prompt to login
  const defaultSupervisor: User = {
    id: 'user-supervisor',
    username: '阿耀',
    name: '阿耀 (工程主管)',
    role: 'supervisor',
    title: '總工程師 / 主管',
  };
  localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(defaultSupervisor));
  return defaultSupervisor;
}

export function setCurrentUser(user: User | null) {
  if (user) {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEY_USER);
  }
  broadcastChange('user_change');
}

export function broadcastChange(type: string, payload?: unknown) {
  if (syncChannel) {
    syncChannel.postMessage({ type, timestamp: Date.now(), payload });
  }
}

export function subscribeToSync(callback: (type: string, payload?: unknown) => void) {
  if (!syncChannel) return () => {};
  const handler = (event: MessageEvent) => {
    callback(event.data.type, event.data.payload);
  };
  syncChannel.addEventListener('message', handler);
  return () => {
    syncChannel.removeEventListener('message', handler);
  };
}

// Authentication API
// Supervisor: 阿耀, 0311 (NO PASSWORD HINT ANYWHERE)
export async function authenticateUser(username: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
  const trimmedUser = username.trim();
  const trimmedPass = password.trim();

  // Supervisor credentials check
  if (trimmedUser === '阿耀') {
    if (trimmedPass === '0311') {
      const user: User = {
        id: 'user-ayao',
        username: '阿耀',
        name: '阿耀',
        role: 'supervisor',
        title: '工程總監 / 主管 (最高權限)',
      };
      setCurrentUser(user);
      return { success: true, user };
    } else {
      return { success: false, error: '帳號或密碼錯誤，請重新確認' };
    }
  }

  // Check registered staff roster
  const staffList = loadLocalStaff();
  const matched = staffList.find(
    (e) =>
      e.active &&
      (e.username.toLowerCase() === trimmedUser.toLowerCase() ||
        e.name === trimmedUser ||
        e.code.toLowerCase() === trimmedUser.toLowerCase())
  );

  if (matched) {
    // If user is supervisor '阿耀', must enter 0311
    if (matched.role === 'supervisor' || matched.username === '阿耀') {
      if (trimmedPass !== '0311') {
        return { success: false, error: '帳號或密碼錯誤，請重新確認' };
      }
    } else if (matched.password) {
      if (trimmedPass !== matched.password) {
        return { success: false, error: '員工密碼錯誤，請重新確認輸入' };
      }
    } else if (!trimmedPass) {
      return { success: false, error: '請輸入員工登入密碼' };
    }

    const user: User = {
      id: matched.id,
      username: matched.username,
      name: matched.name,
      role: matched.role || 'measurer',
      title: matched.title,
      code: matched.code,
    };
    setCurrentUser(user);
    return { success: true, user };
  }

  return { success: false, error: '查無此員工帳號或密碼錯誤，請聯絡主管阿耀建檔' };
}

// Job Sites APIs
export async function fetchSites(): Promise<JobSite[]> {
  try {
    const res = await fetch('/api/sites');
    if (res.ok) {
      const data = await res.json();
      saveLocalSites(data);
      return data;
    }
  } catch {
    // fallback to local storage
  }
  return loadLocalSites();
}

export async function addJobSite(siteInput: Omit<JobSite, 'id' | 'createdAt' | 'updatedAt' | 'drawings'>): Promise<JobSite> {
  const newSite: JobSite = {
    ...siteInput,
    id: `site-${Date.now()}`,
    drawings: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    const res = await fetch('/api/sites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSite),
    });
    if (res.ok) {
      const saved = await res.json();
      const current = loadLocalSites();
      saveLocalSites([saved, ...current.filter((s) => s.id !== saved.id)]);
      broadcastChange('site_created', saved);
      return saved;
    }
  } catch {
    // fallback
  }

  const current = loadLocalSites();
  const updated = [newSite, ...current];
  saveLocalSites(updated);
  broadcastChange('site_created', newSite);
  return newSite;
}

export async function updateJobSite(siteId: string, updates: Partial<JobSite>): Promise<JobSite | null> {
  try {
    const res = await fetch(`/api/sites/${siteId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (res.ok) {
      const saved = await res.json();
      const current = loadLocalSites();
      saveLocalSites(current.map((s) => (s.id === siteId ? saved : s)));
      broadcastChange('site_updated', saved);
      return saved;
    }
  } catch {
    // fallback
  }

  const current = loadLocalSites();
  const target = current.find((s) => s.id === siteId);
  if (!target) return null;

  const updatedSite: JobSite = {
    ...target,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  saveLocalSites(current.map((s) => (s.id === siteId ? updatedSite : s)));
  broadcastChange('site_updated', updatedSite);
  return updatedSite;
}

export async function deleteJobSite(siteId: string, currentUserRole: string): Promise<boolean> {
  if (currentUserRole !== 'supervisor') {
    throw new Error('權限不足：僅主管 (阿耀) 擁有刪除案場之權限。');
  }

  try {
    const res = await fetch(`/api/sites/${siteId}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      const current = loadLocalSites();
      saveLocalSites(current.filter((s) => s.id !== siteId));
      // Also delete associated measurements
      const currentMeas = loadLocalMeasurements();
      saveLocalMeasurements(currentMeas.filter((m) => m.siteId !== siteId));
      broadcastChange('site_deleted', siteId);
      return true;
    }
  } catch {
    // fallback
  }

  const current = loadLocalSites();
  saveLocalSites(current.filter((s) => s.id !== siteId));
  const currentMeas = loadLocalMeasurements();
  saveLocalMeasurements(currentMeas.filter((m) => m.siteId !== siteId));
  broadcastChange('site_deleted', siteId);
  return true;
}

// Drawings & PDF APIs
export async function uploadDrawingToSite(
  siteId: string,
  file: File,
  uploadedBy: string
): Promise<DrawingFile> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      const newDrawing: DrawingFile = {
        id: `dwg-${Date.now()}`,
        name: file.name,
        size: file.size,
        fileType: file.type || 'application/pdf',
        dataUrl,
        uploadedBy,
        uploadedAt: new Date().toLocaleString('zh-TW', { hour12: false }),
        pins: [],
      };

      try {
        const res = await fetch(`/api/sites/${siteId}/drawings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newDrawing),
        });
        if (res.ok) {
          const saved = await res.json();
          // update local
          const current = loadLocalSites();
          const site = current.find((s) => s.id === siteId);
          if (site) {
            site.drawings = [...(site.drawings || []), saved];
            site.updatedAt = new Date().toISOString();
            saveLocalSites(current);
            broadcastChange('drawing_uploaded', { siteId, drawing: saved });
          }
          resolve(saved);
          return;
        }
      } catch {
        // fallback
      }

      const current = loadLocalSites();
      const site = current.find((s) => s.id === siteId);
      if (site) {
        site.drawings = [...(site.drawings || []), newDrawing];
        site.updatedAt = new Date().toISOString();
        saveLocalSites(current);
        broadcastChange('drawing_uploaded', { siteId, drawing: newDrawing });
      }
      resolve(newDrawing);
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

export async function deleteDrawingFromSite(siteId: string, drawingId: string): Promise<boolean> {
  const current = loadLocalSites();
  const site = current.find((s) => s.id === siteId);
  if (!site) return false;

  site.drawings = (site.drawings || []).filter((d) => d.id !== drawingId);
  site.updatedAt = new Date().toISOString();
  saveLocalSites(current);

  try {
    await fetch(`/api/sites/${siteId}/drawings/${drawingId}`, { method: 'DELETE' });
  } catch {
    // local already updated
  }

  broadcastChange('drawing_deleted', { siteId, drawingId });
  return true;
}

// Measurement Sheets APIs
export async function fetchMeasurements(siteId?: string): Promise<MeasurementSheet[]> {
  try {
    const url = siteId ? `/api/measurements?siteId=${siteId}` : '/api/measurements';
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      const current = loadLocalMeasurements();
      // merge
      const merged = siteId
        ? [...current.filter((m) => m.siteId !== siteId), ...data]
        : data;
      saveLocalMeasurements(merged);
      return siteId ? data : merged;
    }
  } catch {
    // fallback
  }

  const all = loadLocalMeasurements();
  return siteId ? all.filter((m) => m.siteId === siteId) : all;
}

export async function saveMeasurementSheet(
  sheet: Omit<MeasurementSheet, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }
): Promise<MeasurementSheet> {
  const isNew = !sheet.id;
  const targetId = sheet.id || `ms-${Date.now()}`;
  const now = new Date().toISOString();

  const finalSheet: MeasurementSheet = {
    ...sheet,
    id: targetId,
    updatedAt: now,
  };

  try {
    const res = await fetch('/api/measurements', {
      method: isNew ? 'POST' : 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(finalSheet),
    });
    if (res.ok) {
      const saved = await res.json();
      const current = loadLocalMeasurements();
      saveLocalMeasurements(
        isNew
          ? [saved, ...current]
          : current.map((m) => (m.id === targetId ? saved : m))
      );
      broadcastChange('measurement_saved', saved);
      return saved;
    }
  } catch {
    // fallback
  }

  const current = loadLocalMeasurements();
  const updated = isNew
    ? [finalSheet, ...current]
    : current.map((m) => (m.id === targetId ? finalSheet : m));
  saveLocalMeasurements(updated);
  broadcastChange('measurement_saved', finalSheet);
  return finalSheet;
}

export async function deleteMeasurementSheet(id: string): Promise<boolean> {
  try {
    await fetch(`/api/measurements/${id}`, { method: 'DELETE' });
  } catch {
    // continue
  }

  const current = loadLocalMeasurements();
  saveLocalMeasurements(current.filter((m) => m.id !== id));
  broadcastChange('measurement_deleted', id);
  return true;
}

// Staff / Employee Management APIs
export async function fetchStaff(): Promise<Employee[]> {
  try {
    const res = await fetch('/api/staff');
    if (res.ok) {
      const data = await res.json();
      saveLocalStaff(data);
      return data;
    }
  } catch {
    // fallback
  }
  return loadLocalStaff();
}

export async function addStaff(
  staffInput: Omit<Employee, 'id' | 'createdAt'>
): Promise<Employee> {
  const newStaff: Employee = {
    ...staffInput,
    id: `emp-${Date.now()}`,
    createdAt: new Date().toISOString(),
    active: staffInput.active !== false,
  };

  try {
    const res = await fetch('/api/staff', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newStaff),
    });
    if (res.ok) {
      const saved = await res.json();
      const current = loadLocalStaff();
      saveLocalStaff([saved, ...current.filter((e) => e.id !== saved.id)]);
      broadcastChange('staff_updated', saved);
      return saved;
    }
  } catch {
    // fallback
  }

  const current = loadLocalStaff();
  const updated = [newStaff, ...current];
  saveLocalStaff(updated);
  broadcastChange('staff_updated', newStaff);
  return newStaff;
}

export async function updateStaff(
  id: string,
  updates: Partial<Employee>
): Promise<Employee | null> {
  try {
    const res = await fetch(`/api/staff/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (res.ok) {
      const saved = await res.json();
      const current = loadLocalStaff();
      saveLocalStaff(current.map((e) => (e.id === id ? saved : e)));
      broadcastChange('staff_updated', saved);
      return saved;
    }
  } catch {
    // fallback
  }

  const current = loadLocalStaff();
  const target = current.find((e) => e.id === id);
  if (!target) return null;

  const updatedStaff: Employee = { ...target, ...updates };
  saveLocalStaff(current.map((e) => (e.id === id ? updatedStaff : e)));
  broadcastChange('staff_updated', updatedStaff);
  return updatedStaff;
}

export async function deleteStaff(id: string): Promise<boolean> {
  try {
    await fetch(`/api/staff/${id}`, { method: 'DELETE' });
  } catch {
    // fallback
  }

  const current = loadLocalStaff();
  saveLocalStaff(current.filter((e) => e.id !== id));
  broadcastChange('staff_updated', { id, deleted: true });
  return true;
}

// Reset to initial demo data
export function resetSystemData() {
  saveLocalSites(INITIAL_SITES);
  saveLocalMeasurements(INITIAL_MEASUREMENTS);
  saveLocalStaff(INITIAL_EMPLOYEES);
  broadcastChange('system_reset');
}
