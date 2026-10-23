/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MeasurementSheet } from '../types';
import { analyzeCabinetDimensions } from '../utils/tolerance';
import { AlertTriangle, CheckCircle2, XCircle, Layers, Info } from 'lucide-react';

interface CabinetVisualizer2DProps {
  sheet: MeasurementSheet;
}

export const CabinetVisualizer2D: React.FC<CabinetVisualizer2DProps> = ({ sheet }) => {
  const [viewMode, setViewMode] = useState<'front' | 'side'>('front');
  const { planned, measured } = sheet;
  const analysis = analyzeCabinetDimensions(planned, measured);

  // Scaling math for SVG viewport
  // SVG canvas is 640 x 420
  const svgWidth = 640;
  const svgHeight = 420;
  const paddingX = 80;
  const paddingY = 60;

  // Max dimension bounds in mm
  const maxW = Math.max(planned.width, measured.width, 1000);
  const maxH = Math.max(
    planned.height,
    measured.height,
    planned.ceilingHeight || 2600,
    measured.ceilingHeight || 2600,
    1800
  );

  const drawAreaW = svgWidth - paddingX * 2;
  const drawAreaH = svgHeight - paddingY * 2;

  const scaleX = drawAreaW / (maxW * 1.15);
  const scaleY = drawAreaH / (maxH * 1.12);
  const scale = Math.min(scaleX, scaleY);

  // Coordinates origin: bottom-left
  const originX = paddingX + 30;
  const originY = svgHeight - paddingY;

  // Planned cabinet rect
  const planW = planned.width * scale;
  const planH = planned.height * scale;
  const planSkirtH = (planned.skirting || 0) * scale;

  // Measured envelope
  const measW = measured.width * scale;
  const measH = measured.height * scale;
  const measCeilH = (measured.ceilingHeight || planned.ceilingHeight || 2700) * scale;
  const measSkirtH = (measured.skirting || 0) * scale;
  const plumbOffset = (measured.wallPlumbOffset || 0) * scale;
  const floorOffset = (measured.floorLevelOffset || 0) * scale;

  // Beam coordinates
  const hasBeam = measured.beamHeight > 0 && measured.beamHeight < maxH;
  const beamY = originY - measured.beamHeight * scale;
  const beamH = originY - measCeilH - beamY;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-semibold px-2 py-0.5 bg-slate-900 text-white rounded">
              {sheet.itemCode}
            </span>
            <h4 className="text-sm font-bold text-slate-900">{sheet.cabinetName}</h4>
            <span className="text-xs text-slate-500">· {sheet.roomLocation}</span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            2D 比例圖解 · 藍色虛線【規劃圖面】 vs 黑色實線【現場實測】 (單位: mm)
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-medium">
          <button
            type="button"
            onClick={() => setViewMode('front')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              viewMode === 'front' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            正面立面圖 (W × H)
          </button>
          <button
            type="button"
            onClick={() => setViewMode('side')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              viewMode === 'side' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            側面剖面圖 (D × H)
          </button>
        </div>
      </div>

      {/* SVG Canvas Container */}
      <div className="relative bg-slate-950 rounded-lg overflow-hidden border border-slate-800 flex items-center justify-center p-2">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto max-h-[440px] select-none"
        >
          {/* Subtle Grid */}
          <defs>
            <pattern id="diagHatch" width="10" height="10" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="10" stroke="#ef4444" strokeWidth="1.5" opacity="0.4" />
            </pattern>
            <pattern id="beamHatch" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="8" stroke="#f59e0b" strokeWidth="1.2" opacity="0.5" />
            </pattern>
          </defs>

          {viewMode === 'front' ? (
            // ================= FRONT ELEVATION =================
            <g>
              {/* Floor baseline with floorLevelOffset slant */}
              <line
                x1={originX - 40}
                y1={originY}
                x2={originX + Math.max(planW, measW) + 50}
                y2={originY - floorOffset}
                stroke="#64748b"
                strokeWidth="2"
              />
              <text x={originX - 35} y={originY + 18} fill="#94a3b8" fontSize="10" fontFamily="monospace">
                ▼ 現場地面線
              </text>

              {/* Ceiling Line */}
              <line
                x1={originX - 40}
                y1={originY - measCeilH}
                x2={originX + Math.max(planW, measW) + 50}
                y2={originY - measCeilH}
                stroke="#64748b"
                strokeDasharray="4 4"
                strokeWidth="1.5"
              />
              <text x={originX - 35} y={originY - measCeilH - 8} fill="#94a3b8" fontSize="10" fontFamily="monospace">
                ▲ 現場天花板淨高: {measured.ceilingHeight || planned.ceilingHeight}mm
              </text>

              {/* Left Wall with Plumb Offset tilt */}
              <line
                x1={originX}
                y1={originY}
                x2={originX + plumbOffset}
                y2={originY - measCeilH}
                stroke="#94a3b8"
                strokeWidth="2.5"
              />
              {Math.abs(measured.wallPlumbOffset || 0) > 3 && (
                <text
                  x={originX + plumbOffset / 2 - 10}
                  y={originY - measCeilH / 2}
                  fill="#f59e0b"
                  fontSize="10"
                  fontFamily="monospace"
                  textAnchor="end"
                >
                  牆傾斜 {measured.wallPlumbOffset > 0 ? '+' : ''}{measured.wallPlumbOffset}mm
                </text>
              )}

              {/* Right Wall */}
              <line
                x1={originX + measW}
                y1={originY - floorOffset}
                x2={originX + measW}
                y2={originY - measCeilH}
                stroke="#64748b"
                strokeWidth="2"
              />

              {/* Beam obstacle (if exists) */}
              {hasBeam && (
                <g>
                  <rect
                    x={originX}
                    y={originY - measCeilH}
                    width={measW}
                    height={measCeilH - (measured.beamHeight * scale)}
                    fill="url(#beamHatch)"
                    stroke="#f59e0b"
                    strokeWidth="1.5"
                  />
                  <line
                    x1={originX - 15}
                    y1={beamY}
                    x2={originX + measW + 20}
                    y2={beamY}
                    stroke="#f59e0b"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                  />
                  <text
                    x={originX + measW / 2}
                    y={beamY + 16}
                    fill="#fbbf24"
                    fontSize="11"
                    fontWeight="bold"
                    textAnchor="middle"
                    fontFamily="sans-serif"
                  >
                    ⚠ 現場大樑底高: {measured.beamHeight}mm
                  </text>
                </g>
              )}

              {/* Planned Cabinet (Blue Dashed Outline) */}
              <rect
                x={originX}
                y={originY - planH}
                width={planW}
                height={planH}
                fill="#3b82f6"
                fillOpacity="0.12"
                stroke="#38bdf8"
                strokeWidth="2"
                strokeDasharray="6 4"
              />

              {/* Skirting line (Planned) */}
              {planSkirtH > 0 && (
                <line
                  x1={originX}
                  y1={originY - planSkirtH}
                  x2={originX + planW}
                  y2={originY - planSkirtH}
                  stroke="#38bdf8"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                />
              )}

              {/* Dimension: Planned Width */}
              <g stroke="#38bdf8" strokeWidth="1" fill="#38bdf8">
                <line x1={originX} y1={originY + 28} x2={originX + planW} y2={originY + 28} />
                <line x1={originX} y1={originY + 22} x2={originX} y2={originY + 34} />
                <line x1={originX + planW} y1={originY + 22} x2={originX + planW} y2={originY + 34} />
                <text
                  x={originX + planW / 2}
                  y={originY + 44}
                  fontSize="11"
                  fontFamily="monospace"
                  textAnchor="middle"
                  fill="#7dd3fc"
                >
                  規劃寬: {planned.width}mm
                </text>
              </g>

              {/* Dimension: Measured Width */}
              <g stroke="#e2e8f0" strokeWidth="1.2" fill="#e2e8f0">
                <line x1={originX} y1={originY - planH / 2} x2={originX + measW} y2={originY - planH / 2} strokeDasharray="3 3" opacity="0.6" />
                <line x1={originX} y1={originY + 54} x2={originX + measW} y2={originY + 54} />
                <line x1={originX} y1={originY + 48} x2={originX} y2={originY + 60} />
                <line x1={originX + measW} y1={originY + 48} x2={originX + measW} y2={originY + 60} />
                <text
                  x={originX + measW / 2}
                  y={originY + 70}
                  fontSize="11"
                  fontWeight="bold"
                  fontFamily="monospace"
                  textAnchor="middle"
                  fill="#f8fafc"
                >
                  實測寬: {measured.width}mm (Δ {measured.width - planned.width > 0 ? '+' : ''}{measured.width - planned.width}mm)
                </text>
              </g>

              {/* Dimension: Planned Height (Left side) */}
              <g stroke="#38bdf8" strokeWidth="1" fill="#38bdf8">
                <line x1={originX - 25} y1={originY} x2={originX - 25} y2={originY - planH} />
                <line x1={originX - 30} y1={originY} x2={originX - 20} y2={originY} />
                <line x1={originX - 30} y1={originY - planH} x2={originX - 20} y2={originY - planH} />
                <text
                  x={originX - 35}
                  y={originY - planH / 2}
                  fontSize="11"
                  fontFamily="monospace"
                  textAnchor="end"
                  fill="#7dd3fc"
                >
                  規劃高: {planned.height}
                </text>
              </g>

              {/* Width shortfall danger hatch if measured.width < planned.width */}
              {measured.width < planned.width && (
                <rect
                  x={originX + measW}
                  y={originY - planH}
                  width={planW - measW}
                  height={planH}
                  fill="url(#diagHatch)"
                  stroke="#ef4444"
                  strokeWidth="1.5"
                />
              )}

              {/* Socket / Outlet Pin if specified */}
              {measured.outletCoords && (
                <g>
                  <circle cx={originX + planW * 0.3} cy={originY - planH * 0.4} r="7" fill="#f59e0b" />
                  <text
                    x={originX + planW * 0.3 + 12}
                    y={originY - planH * 0.4 + 4}
                    fill="#fde68a"
                    fontSize="10"
                    fontFamily="monospace"
                  >
                    ⚡ {measured.outletCoords}
                  </text>
                </g>
              )}
            </g>
          ) : (
            // ================= SIDE SECTION =================
            <g>
              {/* Floor Line */}
              <line x1={originX - 30} y1={originY} x2={originX + 380} y2={originY} stroke="#64748b" strokeWidth="2" />
              {/* Back Wall */}
              <line x1={originX} y1={originY} x2={originX} y2={originY - measCeilH} stroke="#94a3b8" strokeWidth="3" />
              <text x={originX - 10} y={originY - measCeilH / 2} fill="#94a3b8" fontSize="10" textAnchor="end" fontFamily="sans-serif">
                背牆
              </text>

              {/* Planned Depth Rect */}
              {(() => {
                const planD = planned.depth * scale;
                const measD = measured.depth * scale;
                return (
                  <>
                    <rect
                      x={originX}
                      y={originY - planH}
                      width={planD}
                      height={planH}
                      fill="#3b82f6"
                      fillOpacity="0.15"
                      stroke="#38bdf8"
                      strokeWidth="2"
                      strokeDasharray="6 4"
                    />

                    {/* Skirting notch */}
                    {planSkirtH > 0 && (
                      <rect
                        x={originX}
                        y={originY - planSkirtH}
                        width={planD}
                        height={planSkirtH}
                        fill="#0284c7"
                        fillOpacity="0.3"
                      />
                    )}

                    {/* Beam Overhead (Side view) */}
                    {measured.beamHeight > 0 && measured.beamDepth > 0 && (
                      <g>
                        <rect
                          x={originX}
                          y={originY - measCeilH}
                          width={measured.beamDepth * scale}
                          height={measCeilH - (measured.beamHeight * scale)}
                          fill="url(#beamHatch)"
                          stroke="#f59e0b"
                          strokeWidth="2"
                        />
                        <text
                          x={originX + (measured.beamDepth * scale) / 2}
                          y={originY - measCeilH + 18}
                          fill="#fbbf24"
                          fontSize="10"
                          textAnchor="middle"
                          fontFamily="sans-serif"
                        >
                          樑深 {measured.beamDepth}mm
                        </text>
                      </g>
                    )}

                    {/* Dimension Depth lines */}
                    <g stroke="#38bdf8" strokeWidth="1" fill="#38bdf8">
                      <line x1={originX} y1={originY + 25} x2={originX + planD} y2={originY + 25} />
                      <line x1={originX} y1={originY + 20} x2={originX} y2={originY + 30} />
                      <line x1={originX + planD} y1={originY + 20} x2={originX + planD} y2={originY + 30} />
                      <text x={originX + planD / 2} y={originY + 40} fill="#7dd3fc" fontSize="11" textAnchor="middle" fontFamily="monospace">
                        規劃深: {planned.depth}mm
                      </text>
                    </g>

                    <g stroke="#e2e8f0" strokeWidth="1" fill="#e2e8f0">
                      <line x1={originX} y1={originY + 50} x2={originX + measD} y2={originY + 50} />
                      <line x1={originX} y1={originY + 45} x2={originX} y2={originY + 55} />
                      <line x1={originX + measD} y1={originY + 45} x2={originX + measD} y2={originY + 55} />
                      <text x={originX + measD / 2} y={originY + 65} fill="#f8fafc" fontSize="11" textAnchor="middle" fontFamily="monospace">
                        實測深: {measured.depth}mm (Δ {measured.depth - planned.depth}mm)
                      </text>
                    </g>
                  </>
                );
              })()}
            </g>
          )}
        </svg>

        {/* Legend Overlay */}
        <div className="absolute top-3 right-3 bg-slate-900/90 backdrop-blur-xs border border-slate-700 rounded-lg p-2.5 text-[11px] text-slate-300 space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-3 h-0.5 bg-sky-400 border border-sky-400" />
            <span>規劃圖面尺寸 (藍色虛線)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-0.5 bg-slate-300" />
            <span>現場雷射實測 (白色/實線)</span>
          </div>
          {hasBeam && (
            <div className="flex items-center gap-2 text-amber-400">
              <span className="w-3 h-2 bg-amber-500/30 border border-amber-400" />
              <span>大樑壓頂干涉區</span>
            </div>
          )}
          {measured.width < planned.width && (
            <div className="flex items-center gap-2 text-red-400">
              <span className="w-3 h-2 bg-red-500/40 border border-red-500" />
              <span>尺寸不足干涉</span>
            </div>
          )}
        </div>
      </div>

      {/* Analysis Warnings / Pass Notes */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div
          className={`p-3 rounded-lg border text-xs flex items-start gap-2.5 ${
            analysis.diffs.width.severity === 'danger'
              ? 'bg-red-50 border-red-200 text-red-900'
              : analysis.diffs.width.severity === 'warning'
              ? 'bg-amber-50 border-amber-200 text-amber-900'
              : 'bg-emerald-50 border-emerald-200 text-emerald-900'
          }`}
        >
          {analysis.diffs.width.severity === 'danger' ? (
            <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          ) : analysis.diffs.width.severity === 'warning' ? (
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          )}
          <div>
            <div className="font-bold">寬度差值分析 (W)</div>
            <div className="font-mono mt-0.5">
              差值: {analysis.diffs.width.diff > 0 ? '+' : ''}{analysis.diffs.width.diff} mm
            </div>
            <div className="text-[11px] opacity-80 mt-0.5">{analysis.diffs.width.label}</div>
          </div>
        </div>

        <div
          className={`p-3 rounded-lg border text-xs flex items-start gap-2.5 ${
            analysis.diffs.height.severity === 'danger'
              ? 'bg-red-50 border-red-200 text-red-900'
              : analysis.diffs.height.severity === 'warning'
              ? 'bg-amber-50 border-amber-200 text-amber-900'
              : 'bg-emerald-50 border-emerald-200 text-emerald-900'
          }`}
        >
          {analysis.diffs.height.severity === 'danger' ? (
            <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          ) : analysis.diffs.height.severity === 'warning' ? (
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          )}
          <div>
            <div className="font-bold">高度與天花淨高 (H)</div>
            <div className="font-mono mt-0.5">
              天花淨高: {measured.ceilingHeight || planned.ceilingHeight} mm
            </div>
            <div className="text-[11px] opacity-80 mt-0.5">{analysis.diffs.height.label}</div>
          </div>
        </div>

        <div
          className={`p-3 rounded-lg border text-xs flex items-start gap-2.5 ${
            analysis.diffs.wallPlumb.severity === 'warning'
              ? 'bg-amber-50 border-amber-200 text-amber-900'
              : 'bg-slate-50 border-slate-200 text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold">結構平整度 (垂直與水平)</div>
            <div className="font-mono mt-0.5">
              側牆歪斜: {measured.wallPlumbOffset || 0} mm · 地面落差: {measured.floorLevelOffset || 0} mm
            </div>
            <div className="text-[11px] text-slate-600 mt-0.5">
              {analysis.diffs.wallPlumb.label}
            </div>
          </div>
        </div>
      </div>

      {analysis.criticalMessages.length > 0 && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 space-y-1">
          <div className="font-bold flex items-center gap-1.5 text-red-900">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span>工班施工警示 (需主管覆核確認)：</span>
          </div>
          {analysis.criticalMessages.map((msg, idx) => (
            <div key={idx} className="pl-5 list-disc">
              · {msg}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
