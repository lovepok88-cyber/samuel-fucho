/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { JobSite, MeasurementSheet, User, DrawingFile, Employee } from '../types';
import { INITIAL_SITES, INITIAL_MEASUREMENTS, INITIAL_EMPLOYEES } from '../data/initialData';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';
import { db } from './firebase';

const STORAGE_KEY_SITES = 'cabinet_meas_sites_v1';
const STORAGE_KEY_MEASUREMENTS = 'cabinet_meas_sheets_v1';
const STORAGE_KEY_STAFF = 'cabinet_meas_staff_v1';
const STORAGE_KEY_USER = 'cabinet_meas_current_user_v1';
const STORAGE_KEY_TIMESTAMP = 'cabinet_meas_last_sync_v1';

// Real-time Cloud Firestore listener for cross-device live sync (Mobile <-> Desktop)
export function subscribeToCloudSync(
  onSitesUpdate: (sites: JobSite[]) => void,
  onMeasurementsUpdate: (measurements: MeasurementSheet[]) => void,
  onStaffUpdate: (staff: Employee[]) => void
) {
  try {
    const unsubSites = onSnapshot(
      collection(db, 'sites'),
      (snapshot) => {
        if (!snapshot.empty) {
          const cloudSites: JobSite[] = [];
          snapshot.forEach((d) => {
            cloudSites.push(d.data() as JobSite);
          });
          cloudSites.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
          saveLocalSites(cloudSites);
          onSitesUpdate(cloudSites);
        }
      },
      (err) => console.warn('Cloud sites sync listener error:', err)
    );

    const unsubMeas = onSnapshot(
      collection(db, 'measurements'),
      (snapshot) => {
        if (!snapshot.empty) {
          const cloudMeas: MeasurementSheet[] = [];
          snapshot.forEach((d) => {
            cloudMeas.push(d.data() as MeasurementSheet);
          });
          saveLocalMeasurements(cloudMeas);
          onMeasurementsUpdate(cloudMeas);
        }
      },
      (err) => console.warn('Cloud measurements sync listener error:', err)
    );

    const unsubStaff = onSnapshot(
      collection(db, 'staff'),
      (snapshot) => {
        if (!snapshot.empty) {
          const cloudStaff: Employee[] = [];
          snapshot.forEach((d) => {
            cloudStaff.push(d.data() as Employee);
          });
          saveLocalStaff(cloudStaff);
          onStaffUpdate(cloudStaff);
        }
      },
      (err) => console.warn('Cloud staff sync listener error:', err)
    );

    return () => {
      unsubSites();
      unsubMeas();
      unsubStaff();
    };
  } catch (err) {
    console.warn('subscribeToCloudSync setup error:', err);
    return () => {};
  }
}

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
  let list: Employee[] = [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_STAFF);
    if (raw) {
      list = JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to load staff from localStorage', e);
  }

  // Ensure all initial employees are present with passwords
  let modified = false;
  if (!Array.isArray(list) || list.length === 0) {
    list = [...INITIAL_EMPLOYEES];
    modified = true;
  } else {
    for (const initEmp of INITIAL_EMPLOYEES) {
      const idx = list.findIndex(
        (e) => e.id === initEmp.id || e.username.toLowerCase() === initEmp.username.toLowerCase()
      );
      if (idx === -1) {
        list.push({ ...initEmp });
        modified = true;
      } else {
        if (!list[idx].password) {
          list[idx].password = initEmp.password || '1234';
          modified = true;
        }
        if (list[idx].active === undefined) {
          list[idx].active = true;
          modified = true;
        }
      }
    }
  }

  if (modified || !localStorage.getItem(STORAGE_KEY_STAFF)) {
    saveLocalStaff(list);
  }
  return list;
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
    if (raw) {
      const parsed = JSON.parse(raw);
      // Clean up legacy auto-assigned default supervisor so initial load starts unauthenticated
      if (parsed?.id === 'user-supervisor') {
        localStorage.removeItem(STORAGE_KEY_USER);
        return null;
      }
      return parsed;
    }
  } catch {
    // fallback
  }
  return null;
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

  if (!trimmedUser) {
    return { success: false, error: '請輸入帳號或員工姓名' };
  }

  // Supervisor credentials check
  if (trimmedUser === '阿耀' || trimmedUser.toLowerCase() === 'ayao') {
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
      return { success: false, error: '主管帳號或密碼錯誤，請重新確認' };
    }
  }

  // Check registered staff roster
  const staffList = loadLocalStaff();
  const matched = staffList.find(
    (e) =>
      e.active !== false &&
      (e.username?.toLowerCase() === trimmedUser.toLowerCase() ||
        e.name === trimmedUser ||
        e.code?.toLowerCase() === trimmedUser.toLowerCase())
  );

  if (matched) {
    // If user is supervisor '阿耀', must enter 0311
    if (matched.role === 'supervisor' || matched.username === '阿耀') {
      if (trimmedPass !== '0311') {
        return { success: false, error: '主管帳號或密碼錯誤，請重新確認' };
      }
    } else {
      const expectedPass = matched.password || '1234';
      if (!trimmedPass) {
        return { success: false, error: '請輸入員工登入密碼 (預設為 1234)' };
      }
      if (trimmedPass !== expectedPass && trimmedPass !== '1234') {
        return { success: false, error: '員工密碼錯誤，請重新確認輸入 (預設員工密碼為 1234)' };
      }
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

  return { success: false, error: `查無員工「${trimmedUser}」，可使用帳號 (如 chen、chang、lin、wang) 或姓名 (陳偉、小張、林美惠) 登入` };
}

// Job Sites APIs
export async function fetchSites(): Promise<JobSite[]> {
  try {
    const snap = await getDocs(collection(db, 'sites'));
    if (!snap.empty) {
      const cloudSites: JobSite[] = [];
      snap.forEach((d) => cloudSites.push(d.data() as JobSite));
      cloudSites.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      saveLocalSites(cloudSites);
      return cloudSites;
    } else {
      // Seed initial sites to Firestore so other devices immediately sync
      for (const s of INITIAL_SITES) {
        setDoc(doc(db, 'sites', s.id), s).catch(() => {});
      }
    }
  } catch (e) {
    console.warn('Firestore fetchSites fallback', e);
  }

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
    await setDoc(doc(db, 'sites', newSite.id), newSite);
  } catch (err) {
    console.warn('Firestore addJobSite fallback', err);
  }

  try {
    fetch('/api/sites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSite),
    }).catch(() => {});
  } catch {}

  const current = loadLocalSites();
  const updated = [newSite, ...current.filter((s) => s.id !== newSite.id)];
  saveLocalSites(updated);
  broadcastChange('site_created', newSite);
  return newSite;
}

export async function updateJobSite(siteId: string, updates: Partial<JobSite>): Promise<JobSite | null> {
  const current = loadLocalSites();
  const target = current.find((s) => s.id === siteId);
  const updatedSite: JobSite = {
    ...(target || {
      id: siteId,
      name: '',
      siteCode: '',
      clientName: '',
      phone: '',
      address: '',
      spaceType: '',
      status: 'measuring',
      assignedStaff: '',
      measurementDate: '',
      estimatedDeliveryDate: '',
      notes: '',
      drawings: [],
      createdAt: new Date().toISOString(),
      createdBy: '系統',
    }),
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  try {
    await setDoc(doc(db, 'sites', siteId), updatedSite, { merge: true });
  } catch (err) {
    console.warn('Firestore updateJobSite fallback', err);
  }

  try {
    fetch(`/api/sites/${siteId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    }).catch(() => {});
  } catch {}

  saveLocalSites(current.map((s) => (s.id === siteId ? updatedSite : s)));
  broadcastChange('site_updated', updatedSite);
  return updatedSite;
}

export async function deleteJobSite(siteId: string, currentUserRole: string): Promise<boolean> {
  if (currentUserRole !== 'supervisor') {
    throw new Error('權限不足：僅主管 (阿耀) 擁有刪除案場之權限。');
  }

  try {
    await deleteDoc(doc(db, 'sites', siteId));
  } catch (err) {
    console.warn('Firestore deleteJobSite fallback', err);
  }

  try {
    fetch(`/api/sites/${siteId}`, { method: 'DELETE' }).catch(() => {});
  } catch {}

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
    const snap = await getDocs(collection(db, 'measurements'));
    if (!snap.empty) {
      const cloudMeas: MeasurementSheet[] = [];
      snap.forEach((d) => cloudMeas.push(d.data() as MeasurementSheet));
      saveLocalMeasurements(cloudMeas);
      return siteId ? cloudMeas.filter((m) => m.siteId === siteId) : cloudMeas;
    } else {
      for (const m of INITIAL_MEASUREMENTS) {
        setDoc(doc(db, 'measurements', m.id), m).catch(() => {});
      }
    }
  } catch (e) {
    console.warn('Firestore fetchMeasurements fallback', e);
  }

  try {
    const url = siteId ? `/api/measurements?siteId=${siteId}` : '/api/measurements';
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      const current = loadLocalMeasurements();
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
  sheet: Omit<MeasurementSheet, 'id' | 'updatedAt'> & { id?: string }
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
    await setDoc(doc(db, 'measurements', targetId), finalSheet, { merge: true });
  } catch (err) {
    console.warn('Firestore saveMeasurementSheet fallback', err);
  }

  try {
    fetch('/api/measurements', {
      method: isNew ? 'POST' : 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(finalSheet),
    }).catch(() => {});
  } catch {}

  const current = loadLocalMeasurements();
  const updated = isNew
    ? [finalSheet, ...current.filter((m) => m.id !== targetId)]
    : current.map((m) => (m.id === targetId ? finalSheet : m));
  saveLocalMeasurements(updated);
  broadcastChange('measurement_saved', finalSheet);
  return finalSheet;
}

export async function deleteMeasurementSheet(id: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, 'measurements', id));
  } catch (err) {
    console.warn('Firestore deleteMeasurementSheet fallback', err);
  }

  try {
    fetch(`/api/measurements/${id}`, { method: 'DELETE' }).catch(() => {});
  } catch {}

  const current = loadLocalMeasurements();
  saveLocalMeasurements(current.filter((m) => m.id !== id));
  broadcastChange('measurement_deleted', id);
  return true;
}

// Staff / Employee Management APIs
export async function fetchStaff(): Promise<Employee[]> {
  try {
    const snap = await getDocs(collection(db, 'staff'));
    if (!snap.empty) {
      const cloudStaff: Employee[] = [];
      snap.forEach((d) => cloudStaff.push(d.data() as Employee));
      for (const initEmp of INITIAL_EMPLOYEES) {
        if (!cloudStaff.some((e) => e.id === initEmp.id || e.username.toLowerCase() === initEmp.username.toLowerCase())) {
          cloudStaff.push({ ...initEmp });
          setDoc(doc(db, 'staff', initEmp.id), initEmp).catch(() => {});
        }
      }
      saveLocalStaff(cloudStaff);
      return cloudStaff;
    } else {
      for (const s of INITIAL_EMPLOYEES) {
        setDoc(doc(db, 'staff', s.id), s).catch(() => {});
      }
    }
  } catch (e) {
    console.warn('Firestore fetchStaff fallback', e);
  }

  try {
    const res = await fetch('/api/staff');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const merged = [...data];
        for (const initEmp of INITIAL_EMPLOYEES) {
          const idx = merged.findIndex(
            (e) => e.id === initEmp.id || e.username.toLowerCase() === initEmp.username.toLowerCase()
          );
          if (idx === -1) {
            merged.push({ ...initEmp });
          } else {
            if (!merged[idx].password) merged[idx].password = initEmp.password || '1234';
            if (merged[idx].active === undefined) merged[idx].active = true;
          }
        }
        saveLocalStaff(merged);
        return merged;
      }
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
    await setDoc(doc(db, 'staff', newStaff.id), newStaff);
  } catch (err) {
    console.warn('Firestore addStaff fallback', err);
  }

  try {
    fetch('/api/staff', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newStaff),
    }).catch(() => {});
  } catch {}

  const current = loadLocalStaff();
  const updated = [newStaff, ...current.filter((e) => e.id !== newStaff.id)];
  saveLocalStaff(updated);
  broadcastChange('staff_updated', newStaff);
  return newStaff;
}

export async function updateStaff(
  id: string,
  updates: Partial<Employee>
): Promise<Employee | null> {
  const current = loadLocalStaff();
  const target = current.find((e) => e.id === id);
  if (!target) return null;

  const updatedStaff: Employee = { ...target, ...updates };

  try {
    await setDoc(doc(db, 'staff', id), updatedStaff, { merge: true });
  } catch (err) {
    console.warn('Firestore updateStaff fallback', err);
  }

  try {
    fetch(`/api/staff/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    }).catch(() => {});
  } catch {}

  saveLocalStaff(current.map((e) => (e.id === id ? updatedStaff : e)));
  broadcastChange('staff_updated', updatedStaff);
  return updatedStaff;
}

export async function deleteStaff(id: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, 'staff', id));
  } catch (err) {
    console.warn('Firestore deleteStaff fallback', err);
  }

  try {
    fetch(`/api/staff/${id}`, { method: 'DELETE' }).catch(() => {});
  } catch {}

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
