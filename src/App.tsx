/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { User, JobSite, MeasurementSheet, SiteStatus, Employee } from './types';
import {
  fetchSites,
  fetchMeasurements,
  fetchStaff,
  addStaff,
  updateStaff,
  deleteStaff,
  getCurrentUser,
  setCurrentUser,
  addJobSite,
  updateJobSite,
  deleteJobSite,
  saveMeasurementSheet,
  deleteMeasurementSheet,
  resetSystemData,
  subscribeToSync,
} from './services/api';
import { Navbar } from './components/Navbar';
import { SiteList } from './components/SiteList';
import { SiteDetail } from './components/SiteDetail';
import { LoginPage } from './components/LoginPage';
import { LoginModal } from './components/LoginModal';
import { NewSiteModal } from './components/NewSiteModal';
import { StaffModal } from './components/StaffModal';
import { MeasurementFormModal } from './components/MeasurementFormModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function App() {
  const [currentUser, setUserState] = useState<User | null>(null);
  const [sites, setSites] = useState<JobSite[]>([]);
  const [measurements, setMeasurements] = useState<MeasurementSheet[]>([]);
  const [staffList, setStaffList] = useState<Employee[]>([]);
  const [activeSiteId, setActiveSiteId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'sites' | 'measurements' | 'drawings' | 'info'>('sites');

  // Modals state
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isNewSiteModalOpen, setIsNewSiteModalOpen] = useState(false);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [isMeasurementModalOpen, setIsMeasurementModalOpen] = useState(false);
  const [editingMeasurement, setEditingMeasurement] = useState<MeasurementSheet | null>(null);
  const [deleteTargetSite, setDeleteTargetSite] = useState<JobSite | null>(null);

  // Sync state
  const [isSyncing, setIsSyncing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3500);
  }, []);

  // Load initial data
  const reloadData = useCallback(async (quiet = false) => {
    if (!quiet) setIsSyncing(true);
    try {
      const [loadedSites, loadedMeasurements, loadedStaff] = await Promise.all([
        fetchSites(),
        fetchMeasurements(),
        fetchStaff(),
      ]);
      setSites(loadedSites);
      setMeasurements(loadedMeasurements);
      setStaffList(loadedStaff);
    } catch (err) {
      console.error('Error syncing data:', err);
    } finally {
      if (!quiet) {
        setTimeout(() => setIsSyncing(false), 400);
      }
    }
  }, []);

  useEffect(() => {
    // Check initial user
    const user = getCurrentUser();
    setUserState(user);

    // Initial load
    reloadData();

    // BroadcastChannel sync across tabs
    const unsubscribe = subscribeToSync((type) => {
      reloadData(true);
      if (type === 'site_created') showToast('收到最新案場資料同步');
      if (type === 'measurement_saved') showToast('收到最新尺寸丈量紀錄');
    });

    // Server-sync heartbeat polling (every 3 seconds)
    const pollInterval = setInterval(() => {
      reloadData(true);
    }, 3000);

    return () => {
      unsubscribe();
      clearInterval(pollInterval);
    };
  }, [reloadData, showToast]);

  const activeSite = sites.find((s) => s.id === activeSiteId) || null;

  // Authentication Handlers
  const handleLoginSuccess = (user: User) => {
    setUserState(user);
    setIsLoginModalOpen(false);
    showToast(`歡迎 ${user.name}，已成功登入系統`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setUserState(null);
    setIsLoginModalOpen(false);
    showToast('已登出系統');
  };

  // Site Handlers
  const handleSelectSite = (site: JobSite) => {
    setActiveSiteId(site.id);
    setActiveTab('measurements');
  };

  const handleBackToSites = () => {
    setActiveSiteId(null);
    setActiveTab('sites');
  };

  const handleCreateSite = async (
    siteData: Omit<JobSite, 'id' | 'createdAt' | 'updatedAt' | 'drawings'>
  ) => {
    try {
      const newSite = await addJobSite(siteData);
      setSites((prev) => [newSite, ...prev]);
      setActiveSiteId(newSite.id);
      setActiveTab('measurements');
      showToast(`案場「${newSite.name}」已成功建立`);
    } catch {
      showToast('建立案場失敗');
    }
  };

  const handleSaveSiteNotes = async (siteId: string, notes: string, status: SiteStatus) => {
    try {
      const updated = await updateJobSite(siteId, { notes, status });
      if (updated) {
        setSites((prev) => prev.map((s) => (s.id === siteId ? updated : s)));
        showToast('案場備註與狀態已更新');
      }
    } catch {
      showToast('更新失敗');
    }
  };

  const handleDeleteSiteRequest = (site: JobSite) => {
    setDeleteTargetSite(site);
  };

  const handleConfirmDeleteSite = async (siteId: string) => {
    if (!currentUser || currentUser.role !== 'supervisor') {
      setIsLoginModalOpen(true);
      return;
    }

    try {
      await deleteJobSite(siteId, currentUser.role);
      setSites((prev) => prev.filter((s) => s.id !== siteId));
      setMeasurements((prev) => prev.filter((m) => m.siteId !== siteId));
      if (activeSiteId === siteId) {
        setActiveSiteId(null);
        setActiveTab('sites');
      }
      showToast('案場與相關丈量圖面已安全移除');
    } catch (err: any) {
      alert(err.message || '刪除失敗');
    }
  };

  // Measurement Handlers
  const handleOpenAddMeasurement = () => {
    setEditingMeasurement(null);
    setIsMeasurementModalOpen(true);
  };

  const handleEditMeasurement = (sheet: MeasurementSheet) => {
    setEditingMeasurement(sheet);
    setIsMeasurementModalOpen(true);
  };

  const handleSaveMeasurement = async (
    sheetData: Omit<MeasurementSheet, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }
  ) => {
    try {
      const saved = await saveMeasurementSheet(sheetData);
      setMeasurements((prev) => {
        const idx = prev.findIndex((m) => m.id === saved.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = saved;
          return next;
        }
        return [saved, ...prev];
      });
      showToast(`丈量表「${saved.itemCode} ${saved.cabinetName}」已儲存`);
    } catch {
      showToast('儲存丈量表失敗');
    }
  };

  const handleDeleteMeasurement = async (sheetId: string) => {
    try {
      await deleteMeasurementSheet(sheetId);
      setMeasurements((prev) => prev.filter((m) => m.id !== sheetId));
      showToast('丈量項目已移除');
    } catch {
      showToast('刪除失敗');
    }
  };

  const handleQuickApprove = async (sheetId: string) => {
    const target = measurements.find((m) => m.id === sheetId);
    if (!target) return;
    const approverName = currentUser?.name || '阿耀';
    const updated = {
      ...target,
      supervisorApproved: true,
      approvedBy: approverName,
      approvalDate: new Date().toISOString().split('T')[0],
    };
    await handleSaveMeasurement(updated);
    showToast(`已核准「${target.cabinetName}」尺寸`);
  };

  const handleResetDemoData = () => {
    if (confirm('確定要重置為系統預設的示範案場與圖面資料嗎？')) {
      resetSystemData();
      reloadData();
      showToast('已重置為示範案場資料');
    }
  };

  // Staff Handlers
  const handleAddStaff = async (newStaffInput: Omit<Employee, 'id' | 'createdAt'>) => {
    try {
      const saved = await addStaff(newStaffInput);
      setStaffList((prev) => [saved, ...prev.filter((e) => e.id !== saved.id)]);
      showToast(`已成功新增員工「${saved.name}」(${saved.title})`);
    } catch {
      showToast('新增員工失敗');
    }
  };

  const handleUpdateStaff = async (id: string, updates: Partial<Employee>) => {
    try {
      const updated = await updateStaff(id, updates);
      if (updated) {
        setStaffList((prev) => prev.map((e) => (e.id === id ? updated : e)));
        showToast(`已更新員工「${updated.name}」資料`);
      }
    } catch {
      showToast('更新失敗');
    }
  };

  const handleDeleteStaff = async (id: string) => {
    try {
      await deleteStaff(id);
      setStaffList((prev) => prev.filter((e) => e.id !== id));
      showToast('員工資料已從名冊移除');
    } catch {
      showToast('刪除失敗');
    }
  };

  if (!currentUser) {
    return (
      <>
        <LoginPage
          onLoginSuccess={handleLoginSuccess}
          staffList={staffList}
        />
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-medium border border-slate-700 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-slate-900 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        activeSite={activeSite}
        activeTab={activeTab === 'sites' ? 'sites' : (activeTab as any)}
        onTabChange={(tab) => setActiveTab(tab)}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
        onOpenStaffModal={() => setIsStaffModalOpen(true)}
        isSyncing={isSyncing}
        onManualSync={() => {
          reloadData();
          showToast('手動數據同步完成');
        }}
        onBackToSites={handleBackToSites}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeSite ? (
          <SiteDetail
            site={activeSite}
            measurements={measurements.filter((m) => m.siteId === activeSite.id)}
            currentUser={currentUser}
            activeTab={activeTab === 'sites' ? 'measurements' : (activeTab as any)}
            onTabChange={(tab) => setActiveTab(tab)}
            onBack={handleBackToSites}
            onAddMeasurement={handleOpenAddMeasurement}
            onEditMeasurement={handleEditMeasurement}
            onDeleteMeasurement={handleDeleteMeasurement}
            onDeleteSiteRequest={handleDeleteSiteRequest}
            onSiteUpdated={(updated) => {
              setSites((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
            }}
            onSaveSiteNotes={handleSaveSiteNotes}
            onQuickApprove={handleQuickApprove}
          />
        ) : (
          <SiteList
            sites={sites}
            measurements={measurements}
            currentUser={currentUser}
            onSelectSite={handleSelectSite}
            onOpenNewSiteModal={() => setIsNewSiteModalOpen(true)}
            onDeleteSiteRequest={handleDeleteSiteRequest}
            onResetDemoData={handleResetDemoData}
            onOpenStaffModal={() => setIsStaffModalOpen(true)}
          />
        )}
      </main>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-medium border border-slate-700 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Modals */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        currentUser={currentUser}
        staffList={staffList}
        onOpenStaffModal={() => setIsStaffModalOpen(true)}
      />

      <NewSiteModal
        isOpen={isNewSiteModalOpen}
        onClose={() => setIsNewSiteModalOpen(false)}
        onSave={handleCreateSite}
        currentUser={currentUser}
        staffList={staffList}
      />

      <StaffModal
        isOpen={isStaffModalOpen}
        onClose={() => setIsStaffModalOpen(false)}
        staffList={staffList}
        currentUser={currentUser}
        onAddStaff={handleAddStaff}
        onUpdateStaff={handleUpdateStaff}
        onDeleteStaff={handleDeleteStaff}
      />

      {activeSite && (
        <MeasurementFormModal
          isOpen={isMeasurementModalOpen}
          onClose={() => {
            setIsMeasurementModalOpen(false);
            setEditingMeasurement(null);
          }}
          onSave={handleSaveMeasurement}
          siteId={activeSite.id}
          initialData={editingMeasurement}
          currentUser={currentUser}
        />
      )}

      <DeleteConfirmModal
        isOpen={!!deleteTargetSite}
        onClose={() => setDeleteTargetSite(null)}
        site={deleteTargetSite}
        currentUser={currentUser}
        onConfirmDelete={handleConfirmDeleteSite}
        onRequireSupervisorLogin={() => {
          setIsLoginModalOpen(true);
        }}
      />
    </div>
  );
}
