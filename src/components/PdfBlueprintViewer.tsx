/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { JobSite, DrawingFile, MeasurementSheet, User, getRoleConfig } from '../types';
import { uploadDrawingToSite, deleteDrawingFromSite } from '../services/api';
import {
  Upload,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  Minimize2,
  Trash2,
  FileText,
  MapPin,
  Download,
  Plus,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';

interface PdfBlueprintViewerProps {
  site: JobSite;
  measurements: MeasurementSheet[];
  currentUser: User | null;
  onSiteUpdated: (updatedSite: JobSite) => void;
  onSelectCabinetSheet?: (sheetId: string) => void;
}

export const PdfBlueprintViewer: React.FC<PdfBlueprintViewerProps> = ({
  site,
  measurements,
  currentUser,
  onSiteUpdated,
  onSelectCabinetSheet,
}) => {
  const roleConfig = getRoleConfig(currentUser?.role);
  const [selectedDrawingId, setSelectedDrawingId] = useState<string>(
    site.drawings?.[0]?.id || ''
  );
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [pinMode, setPinMode] = useState(false);
  const [selectedCabinetToPin, setSelectedCabinetToPin] = useState<string>(
    measurements[0]?.id || ''
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeDrawing = site.drawings?.find((d) => d.id === selectedDrawingId) || site.drawings?.[0];

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));
  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setPan({ x: 0, y: 0 });
  };
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (pinMode) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || pinMode) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  // File Upload Handler (PDF or CAD blueprint)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const uploaderName = currentUser?.name || '工程人員';
      const newDwg = await uploadDrawingToSite(site.id, file, uploaderName);
      const updatedSite = {
        ...site,
        drawings: [...(site.drawings || []), newDwg],
      };
      onSiteUpdated(updatedSite);
      setSelectedDrawingId(newDwg.id);
    } catch (err) {
      alert('上傳失敗，請確認檔案大小在限制內');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteDrawing = async (drawingId: string) => {
    if (!confirm('確定要刪除這張施工圖面檔案嗎？')) return;
    await deleteDrawingFromSite(site.id, drawingId);
    const updatedDrawings = (site.drawings || []).filter((d) => d.id !== drawingId);
    const updatedSite = { ...site, drawings: updatedDrawings };
    onSiteUpdated(updatedSite);
    if (selectedDrawingId === drawingId) {
      setSelectedDrawingId(updatedDrawings[0]?.id || '');
    }
  };

  // Blueprint Pinning
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!pinMode || !activeDrawing || !selectedCabinetToPin) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const xPercent = Math.round((x / rect.width) * 100);
    const yPercent = Math.round((y / rect.height) * 100);

    const cabinet = measurements.find((m) => m.id === selectedCabinetToPin);
    const pinLabel = cabinet ? `${cabinet.itemCode} ${cabinet.cabinetName}` : '丈量點位';

    const newPin = {
      id: `pin-${Date.now()}`,
      cabinetId: selectedCabinetToPin,
      label: pinLabel,
      xPercent,
      yPercent,
    };

    const updatedPins = [...(activeDrawing.pins || []), newPin];
    const updatedDrawings = (site.drawings || []).map((d) =>
      d.id === activeDrawing.id ? { ...d, pins: updatedPins } : d
    );

    const updatedSite = { ...site, drawings: updatedDrawings };
    onSiteUpdated(updatedSite);
    setPinMode(false);
  };

  const isPdf = activeDrawing?.fileType?.includes('pdf') || activeDrawing?.name.toLowerCase().endsWith('.pdf');

  return (
    <div className={`flex flex-col bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden ${
      isFullscreen ? 'fixed inset-4 z-50' : 'h-[720px]'
    }`}>
      {/* Top Toolbar */}
      <div className="px-5 py-3 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
        {/* Drawing Selector / Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto max-w-full">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 pr-2 border-r border-slate-300">
            <FileText className="w-4 h-4 text-slate-600" />
            <span>圖面檔案 ({site.drawings?.length || 0})</span>
          </div>

          {(site.drawings || []).map((dwg) => (
            <button
              key={dwg.id}
              onClick={() => {
                setSelectedDrawingId(dwg.id);
                handleReset();
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                selectedDrawingId === dwg.id || (!selectedDrawingId && dwg === site.drawings[0])
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <span className="max-w-[140px] truncate">{dwg.name}</span>
            </button>
          ))}

          {/* Upload Button (Guarded by permission) */}
          {roleConfig.canUploadDrawings && (
            <>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="px-3 py-1.5 text-xs font-semibold bg-white text-slate-800 border border-dashed border-slate-300 hover:border-slate-500 rounded-md transition-colors flex items-center gap-1 shrink-0"
              >
                <Upload className="w-3.5 h-3.5 text-slate-500" />
                <span>{isUploading ? '處理中...' : '上傳PDF施工圖'}</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf,image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </>
          )}
        </div>

        {/* View Controls & Pinning */}
        <div className="flex items-center gap-1.5">
          {measurements.length > 0 && roleConfig.canUploadDrawings && (
            <div className="flex items-center gap-1 mr-2 pl-2 border-l border-slate-300">
              <select
                value={selectedCabinetToPin}
                onChange={(e) => setSelectedCabinetToPin(e.target.value)}
                className="text-xs bg-white border border-slate-300 rounded px-2 py-1 max-w-[140px] truncate"
              >
                {measurements.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.itemCode} {m.cabinetName}
                  </option>
                ))}
              </select>

              <button
                onClick={() => setPinMode(!pinMode)}
                className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors flex items-center gap-1 ${
                  pinMode
                    ? 'bg-amber-600 text-white animate-pulse'
                    : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
                title="點擊後，在圖面上點擊任意位置標註櫃體"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>{pinMode ? '請在圖面點擊定位' : '圖面定點'}</span>
              </button>
            </div>
          )}

          <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 shadow-xs">
            <button
              onClick={handleZoomIn}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded"
              title="放大"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded"
              title="縮小"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleRotate}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded"
              title="旋轉 90 度"
            >
              <RotateCw className="w-4 h-4" />
            </button>
            <button
              onClick={handleReset}
              className="px-2 py-1 text-[11px] font-mono text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded"
              title="重設大小"
            >
              {Math.round(zoom * 100)}%
            </button>
          </div>

          {activeDrawing && (
            <>
              <a
                href={activeDrawing.dataUrl}
                download={activeDrawing.name}
                className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 bg-white"
                title="下載原始圖檔"
              >
                <Download className="w-4 h-4" />
              </a>

              {(roleConfig.canUploadDrawings || roleConfig.canDeleteSite) && (
                <button
                  onClick={() => handleDeleteDrawing(activeDrawing.id)}
                  className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg border border-red-200 bg-white"
                  title="刪除此圖面"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </>
          )}

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 bg-white"
            title={isFullscreen ? '退出全螢幕' : '全螢幕檢視'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Drawing Canvas / Viewer */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className={`relative flex-1 bg-slate-900 overflow-hidden flex items-center justify-center cursor-${
          pinMode ? 'crosshair' : isDragging ? 'grabbing' : 'grab'
        }`}
      >
        {activeDrawing ? (
          <div
            onClick={handleCanvasClick}
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom}) rotate(${rotation}deg)`,
              transformOrigin: 'center center',
              transition: isDragging ? 'none' : 'transform 0.15s ease-out',
            }}
            className="relative select-none max-w-full max-h-full flex items-center justify-center"
          >
            {/* If PDF and modern browser object or SVG drawing preview */}
            {activeDrawing.dataUrl.startsWith('data:application/pdf') ? (
              <div className="w-[850px] h-[600px] bg-white rounded shadow-2xl overflow-hidden flex flex-col">
                <div className="bg-slate-800 text-slate-200 text-xs px-4 py-2 flex items-center justify-between">
                  <span>📄 {activeDrawing.name}</span>
                  <span className="text-[10px] text-slate-400">PDF 施工藍圖預覽</span>
                </div>
                <iframe
                  src={`${activeDrawing.dataUrl}#toolbar=1`}
                  title={activeDrawing.name}
                  className="w-full flex-1 border-none"
                />
              </div>
            ) : (
              <img
                src={activeDrawing.dataUrl}
                alt={activeDrawing.name}
                className="max-h-[640px] w-auto object-contain rounded shadow-2xl pointer-events-none"
              />
            )}

            {/* Dropped Measurement Pins Overlay */}
            {(activeDrawing.pins || []).map((pin) => (
              <div
                key={pin.id}
                onClick={(e) => {
                  e.stopPropagation();
                  if (onSelectCabinetSheet) onSelectCabinetSheet(pin.cabinetId);
                }}
                style={{
                  left: `${pin.xPercent}%`,
                  top: `${pin.yPercent}%`,
                }}
                className="absolute -translate-x-1/2 -translate-y-full cursor-pointer group z-20 pointer-events-auto"
              >
                <div className="flex flex-col items-center">
                  <div className="px-2 py-0.5 bg-amber-500 text-slate-950 font-bold text-[10px] rounded shadow-md whitespace-nowrap group-hover:scale-110 transition-transform flex items-center gap-1 border border-amber-300">
                    <MapPin className="w-3 h-3 text-slate-950" />
                    <span>{pin.label}</span>
                  </div>
                  <div className="w-2 h-2 bg-amber-500 rotate-45 -mt-1 shadow-sm" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-8 text-slate-400 max-w-sm">
            <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-300">
              <Upload className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-white mb-1">尚未上傳此案場施工圖</h4>
            <p className="text-xs text-slate-400 mb-4">
              支援上傳建築師平面配置圖、CAD 系統櫃立面圖 (PDF 或 圖檔格式)。
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 text-xs font-semibold bg-white text-slate-900 rounded-lg hover:bg-slate-100 transition-colors shadow-xs"
            >
              立即上傳 PDF 施工圖
            </button>
          </div>
        )}

        {/* Floating Help Banner */}
        {pinMode && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 px-4 py-2 rounded-full font-bold text-xs shadow-lg flex items-center gap-2 animate-bounce">
            <MapPin className="w-4 h-4" />
            <span>請在施工圖上點擊位置，完成「{measurements.find(m => m.id === selectedCabinetToPin)?.cabinetName}」定位標註</span>
          </div>
        )}
      </div>

      {/* Footer Info Strip */}
      {activeDrawing && (
        <div className="px-5 py-2.5 bg-slate-100 border-t border-slate-200 text-xs text-slate-600 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span>圖檔：<strong>{activeDrawing.name}</strong></span>
            <span>·</span>
            <span>上傳者：{activeDrawing.uploadedBy}</span>
            <span>·</span>
            <span>時間：{activeDrawing.uploadedAt}</span>
          </div>
          <div className="text-[11px] text-slate-500">
            按住滑鼠拖曳可移動圖面 · 滾輪或按鈕縮放
          </div>
        </div>
      )}
    </div>
  );
};
