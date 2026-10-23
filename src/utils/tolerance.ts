/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  CabinetPlannedDimensions,
  CabinetMeasuredDimensions,
  DeviationSeverity,
} from '../types';

export interface DimensionAnalysisResult {
  overallSeverity: DeviationSeverity;
  warningsCount: number;
  dangersCount: number;
  diffs: {
    width: { diff: number; severity: DeviationSeverity; label: string };
    height: { diff: number; severity: DeviationSeverity; label: string };
    depth: { diff: number; severity: DeviationSeverity; label: string };
    skirting: { diff: number; severity: DeviationSeverity; label: string };
    ceiling: { diff: number; severity: DeviationSeverity; label: string };
    beam: { diff: number; severity: DeviationSeverity; label: string };
    wallPlumb: { diff: number; severity: DeviationSeverity; label: string };
    floorLevel: { diff: number; severity: DeviationSeverity; label: string };
  };
  criticalMessages: string[];
}

export function analyzeCabinetDimensions(
  planned: CabinetPlannedDimensions,
  measured: CabinetMeasuredDimensions
): DimensionAnalysisResult {
  const criticalMessages: string[] = [];
  let warningsCount = 0;
  let dangersCount = 0;

  // 1. 寬度差異 (Width)
  // diff = measured - planned
  const widthDiff = measured.width - planned.width;
  let widthSeverity: DeviationSeverity = 'normal';
  let widthLabel = '尺寸相符';

  if (widthDiff < 0) {
    const shortage = Math.abs(widthDiff);
    if (shortage > (planned.fillerAllowance || 15)) {
      widthSeverity = 'danger';
      widthLabel = `過窄 ${shortage}mm (超過收邊條預留量，櫃體將無法塞入！)`;
      criticalMessages.push(`寬度不足：實測比規劃小 ${shortage}mm，現場將卡死无法安裝。`);
      dangersCount++;
    } else {
      widthSeverity = 'warning';
      widthLabel = `偏小 ${shortage}mm (可由收邊條微調吸收)`;
      warningsCount++;
    }
  } else if (widthDiff > 0) {
    if (widthDiff > 25) {
      widthSeverity = 'warning';
      widthLabel = `偏大 ${widthDiff}mm (縫隙較大，需加大修飾收邊板)`;
      warningsCount++;
    } else {
      widthSeverity = 'normal';
      widthLabel = widthDiff === 0 ? '完全一致' : `偏大 ${widthDiff}mm (正常預留公差)`;
    }
  }

  // 2. 高度與天花淨高 (Height & Ceiling)
  const heightDiff = measured.height - planned.height;
  let heightSeverity: DeviationSeverity = 'normal';
  let heightLabel = '高度相符';

  if (measured.ceilingHeight > 0 && planned.height > measured.ceilingHeight) {
    heightSeverity = 'danger';
    heightLabel = `櫃高超過現場天花淨高 ${(planned.height - measured.ceilingHeight)}mm`;
    criticalMessages.push(`高度干涉：規劃櫃高 (${planned.height}mm) 大於實測天花淨高 (${measured.ceilingHeight}mm)！`);
    dangersCount++;
  } else if (heightDiff < 0) {
    const hShort = Math.abs(heightDiff);
    if (hShort > 20) {
      heightSeverity = 'warning';
      heightLabel = `現場高度偏低 ${hShort}mm`;
      warningsCount++;
    }
  }

  // 3. 深度差異 (Depth)
  const depthDiff = measured.depth - planned.depth;
  let depthSeverity: DeviationSeverity = 'normal';
  let depthLabel = '深度正常';
  if (depthDiff < -5) {
    depthSeverity = 'warning';
    depthLabel = `現場深度不足 ${Math.abs(depthDiff)}mm (可能凸出門框或動線)`;
    warningsCount++;
  } else if (depthDiff > 15) {
    depthSeverity = 'normal';
    depthLabel = `深度充足 (+${depthDiff}mm)`;
  }

  // 4. 踢腳高 (Skirting)
  const skirtingDiff = measured.skirting - planned.skirting;
  let skirtingSeverity: DeviationSeverity = 'normal';
  let skirtingLabel = '踢腳高度符合';
  if (Math.abs(skirtingDiff) > 10) {
    skirtingSeverity = 'warning';
    skirtingLabel = skirtingDiff > 0 ? `踢腳偏高 +${skirtingDiff}mm` : `踢腳偏低 ${skirtingDiff}mm`;
    warningsCount++;
  }

  // 5. 天花板淨高比較 (Ceiling)
  const ceilingDiff = measured.ceilingHeight - planned.ceilingHeight;
  let ceilingSeverity: DeviationSeverity = 'normal';
  let ceilingLabel = '天花高正常';
  if (Math.abs(ceilingDiff) > 15) {
    ceilingSeverity = 'warning';
    ceilingLabel = `天花高落差 ${ceilingDiff > 0 ? '+' : ''}${ceilingDiff}mm`;
    warningsCount++;
  }

  // 6. 大樑干涉分析 (Beam)
  let beamSeverity: DeviationSeverity = 'normal';
  let beamLabel = '無大樑干涉';
  let beamDiff = 0;

  if (measured.beamHeight > 0 && planned.height > 0) {
    beamDiff = measured.beamHeight - planned.height;
    if (measured.beamHeight < planned.height) {
      // 樑底高小於櫃高，檢查是否有樑深
      if (measured.beamDepth > 0) {
        beamSeverity = 'danger';
        beamLabel = `大樑高度 ${measured.beamHeight}mm 壓頂 (低於櫃高 ${planned.height - measured.beamHeight}mm)`;
        criticalMessages.push(`大樑結構碰撞：現場大樑深 ${measured.beamDepth}mm、樑底高 ${measured.beamHeight}mm，需做切角修樑！`);
        dangersCount++;
      }
    }
  }

  // 7. 側牆垂直歪斜 (Wall Plumb)
  let wallPlumbSeverity: DeviationSeverity = 'normal';
  let wallPlumbLabel = '垂直度良好 (±3mm內)';
  const wallPlumb = Math.abs(measured.wallPlumbOffset || 0);
  if (wallPlumb > 8) {
    wallPlumbSeverity = 'warning';
    wallPlumbLabel = `牆面明顯歪斜 (${measured.wallPlumbOffset > 0 ? '內傾' : '外斜'} ${wallPlumb}mm，需斜切收邊條)`;
    warningsCount++;
  } else if (wallPlumb > 3) {
    wallPlumbSeverity = 'normal';
    wallPlumbLabel = `輕微偏差 (${wallPlumb}mm)`;
  }

  // 8. 地面水平差 (Floor Level)
  let floorLevelSeverity: DeviationSeverity = 'normal';
  let floorLevelLabel = '地面平整';
  const floorLevel = Math.abs(measured.floorLevelOffset || 0);
  if (floorLevel > 6) {
    floorLevelSeverity = 'warning';
    floorLevelLabel = `地面高低差 ${floorLevel}mm (調整腳需補正)`;
    warningsCount++;
  }

  let overallSeverity: DeviationSeverity = 'normal';
  if (dangersCount > 0) {
    overallSeverity = 'danger';
  } else if (warningsCount > 0) {
    overallSeverity = 'warning';
  }

  return {
    overallSeverity,
    warningsCount,
    dangersCount,
    diffs: {
      width: { diff: widthDiff, severity: widthSeverity, label: widthLabel },
      height: { diff: heightDiff, severity: heightSeverity, label: heightLabel },
      depth: { diff: depthDiff, severity: depthSeverity, label: depthLabel },
      skirting: { diff: skirtingDiff, severity: skirtingSeverity, label: skirtingLabel },
      ceiling: { diff: ceilingDiff, severity: ceilingSeverity, label: ceilingLabel },
      beam: { diff: beamDiff, severity: beamSeverity, label: beamLabel },
      wallPlumb: { diff: measured.wallPlumbOffset || 0, severity: wallPlumbSeverity, label: wallPlumbLabel },
      floorLevel: { diff: measured.floorLevelOffset || 0, severity: floorLevelSeverity, label: floorLevelLabel },
    },
    criticalMessages,
  };
}
