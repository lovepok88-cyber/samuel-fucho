/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { JobSite, MeasurementSheet, Employee } from '../types';

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'emp-01',
    code: 'EMP-01',
    name: '阿耀',
    username: '阿耀',
    password: '0311',
    title: '工程總監 / 主管',
    phone: '0910-888-031',
    role: 'supervisor',
    notes: '【Level 1 總主管】全案場刪除、圖面審核開板、員工管理最高權限',
    createdAt: '2026-01-01T00:00:00.000Z',
    active: true,
  },
  {
    id: 'emp-02',
    code: 'EMP-02',
    name: '陳偉',
    username: 'chen',
    password: '1234',
    title: '工務主任 / 協同主管',
    phone: '0922-333-444',
    role: 'leader',
    notes: '【Level 2 協同主管】具備尺寸審核、圖面上傳與員工管理權限',
    createdAt: '2026-02-15T00:00:00.000Z',
    active: true,
  },
  {
    id: 'emp-03',
    code: 'EMP-03',
    name: '小張',
    username: 'chang',
    password: '1234',
    title: '資深現場丈量工程師',
    phone: '0933-555-777',
    role: 'measurer',
    notes: '【Level 3 丈量師】雷射實測登打、公差比對表填寫與圖面上傳',
    createdAt: '2026-03-01T00:00:00.000Z',
    active: true,
  },
  {
    id: 'emp-04',
    code: 'EMP-04',
    name: '林美惠',
    username: 'lin',
    password: '1234',
    title: '系統櫃設計規劃師',
    phone: '0955-666-888',
    role: 'measurer',
    notes: '【Level 3 丈量師】CAD施工圖繪製與規劃尺寸登打',
    createdAt: '2026-04-10T00:00:00.000Z',
    active: true,
  },
  {
    id: 'emp-05',
    code: 'EMP-05',
    name: '王小妹',
    username: 'wang',
    password: '1234',
    title: '實習工務助理 (僅查閱)',
    phone: '0966-777-111',
    role: 'readonly',
    notes: '【Level 4 僅查閱】現場核對施工圖與尺寸，無修改權限',
    createdAt: '2026-05-01T00:00:00.000Z',
    active: true,
  },
];

// Sample architectural floorplan & elevation SVG/PDF preview data
const SAMPLE_DRAWING_DATAURL_1 = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 700" width="1000" height="700">
  <rect width="1000" height="700" fill="%230b1329"/>
  <!-- CAD Grid lines -->
  <defs>
    <pattern id="cadGrid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="%231e293b" stroke-width="0.8"/>
    </pattern>
  </defs>
  <rect width="1000" height="700" fill="url(%23cadGrid)"/>
  
  <!-- Architectural Walls -->
  <g stroke="%2338bdf8" stroke-width="4" fill="none">
    <polyline points="100,100 900,100 900,600 100,600 100,100"/>
    <line x1="100" y1="360" x2="600" y2="360" stroke-width="3"/>
    <line x1="600" y1="100" x2="600" y2="600" stroke-width="3"/>
  </g>

  <!-- Door swings -->
  <path d="M 600,480 A 80 80 0 0 0 680,560" fill="none" stroke="%2364748b" stroke-dasharray="4 4" stroke-width="2"/>
  <line x1="600" y1="480" x2="680" y2="480" stroke="%2394a3b8" stroke-width="2"/>

  <!-- Cabinet Units marked -->
  <!-- W-01 Master Bedroom Wardrobe -->
  <rect x="620" y="120" width="260" height="70" fill="%230284c7" fill-opacity="0.25" stroke="%2338bdf8" stroke-width="2"/>
  <text x="750" y="155" fill="%23e0f2fe" font-size="14" font-family="sans-serif" font-weight="bold" text-anchor="middle">W-01 主臥六門頂天衣櫃</text>
  <text x="750" y="175" fill="%2393c5fd" font-size="11" font-family="monospace" text-anchor="middle">W:2400 x D:600 x H:2650 mm</text>

  <!-- S-01 Entryway Shoe Cabinet -->
  <rect x="120" y="120" width="160" height="50" fill="%230284c7" fill-opacity="0.25" stroke="%2338bdf8" stroke-width="2"/>
  <text x="200" y="150" fill="%23e0f2fe" font-size="13" font-family="sans-serif" font-weight="bold" text-anchor="middle">S-01 玄關懸空鞋櫃</text>

  <!-- TV Cabinet -->
  <rect x="120" y="530" width="300" height="50" fill="%230284c7" fill-opacity="0.25" stroke="%2338bdf8" stroke-width="2"/>
  <text x="270" y="560" fill="%23e0f2fe" font-size="13" font-family="sans-serif" font-weight="bold" text-anchor="middle">TV-01 客廳石紋電視矮櫃</text>

  <!-- Dimension Lines -->
  <g stroke="%23f59e0b" stroke-width="1.2" fill="%23f59e0b">
    <line x1="620" y1="80" x2="880" y2="80"/>
    <line x1="620" y1="70" x2="620" y2="90"/>
    <line x1="880" y1="70" x2="880" y2="90"/>
    <text x="750" y="70" font-size="12" font-family="monospace" text-anchor="middle">2400 mm</text>

    <line x1="920" y1="120" x2="920" y2="190"/>
    <line x1="910" y1="120" x2="930" y2="120"/>
    <line x1="910" y1="190" x2="930" y2="190"/>
    <text x="945" y="160" font-size="12" font-family="monospace" text-anchor="middle">600</text>
  </g>

  <!-- Title Block -->
  <rect x="700" y="610" width="280" height="75" fill="%230f172a" stroke="%23475569" stroke-width="1"/>
  <text x="715" y="635" fill="%23f8fafc" font-size="14" font-weight="bold" font-family="sans-serif">【施工圖】敦南御所 8F 平面配置</text>
  <text x="715" y="655" fill="%2394a3b8" font-size="11" font-family="sans-serif">比例: 1:50 · 單位: mm · 繪製: 設計部</text>
  <text x="715" y="675" fill="%23f59e0b" font-size="11" font-family="sans-serif">核准: 主管阿耀 03/11 覆核</text>
</svg>`;

export const INITIAL_SITES: JobSite[] = [
  {
    id: 'site-01',
    siteCode: 'ST-2026-001',
    name: '敦南御所 A戶 8F 全室系統櫃',
    clientName: '林董事長',
    phone: '0912-345-678',
    address: '台北市大安區敦化南路二段 188 號 8 樓 A 室',
    spaceType: '高坪效豪宅全室丈量',
    status: 'measuring',
    assignedStaff: '丈量師陳偉',
    measurementDate: '2026-10-20',
    estimatedDeliveryDate: '2026-11-15',
    notes: '天花板有隱藏式吊隱冷氣大樑，客廳主牆有石材基底，需精準丈量大樑下墜淨高與踢腳收邊。',
    drawings: [
      {
        id: 'dwg-01',
        name: 'ST2026-A1_平面配置與櫃位圖.pdf',
        size: 1845000,
        fileType: 'application/pdf',
        dataUrl: SAMPLE_DRAWING_DATAURL_1,
        uploadedBy: '阿耀 (主管)',
        uploadedAt: '2026-10-18 14:30',
        pins: [
          { id: 'pin-1', cabinetId: 'ms-01', label: 'W-01 主臥衣櫃', xPercent: 75, yPercent: 22 },
          { id: 'pin-2', cabinetId: 'ms-02', label: 'S-01 玄關鞋櫃', xPercent: 20, yPercent: 22 },
        ],
      },
    ],
    createdAt: '2026-10-18T06:00:00.000Z',
    updatedAt: '2026-10-22T10:15:00.000Z',
    createdBy: '阿耀',
  },
  {
    id: 'site-02',
    siteCode: 'ST-2026-002',
    name: '大直明水路 陳公館 景觀別墅',
    clientName: '陳設計師 / 業主陳太太',
    phone: '0933-888-999',
    address: '台北市中山區明水路 600 巷 12 號 3F',
    spaceType: '精品更衣室與開放廚房電器櫃',
    status: 'warning',
    assignedStaff: '丈量工務小張',
    measurementDate: '2026-10-21',
    estimatedDeliveryDate: '2026-11-20',
    notes: '現場左側牆壁有 12mm 內傾歪斜，主臥大樑與設計櫃高有碰撞可能，待主管阿耀覆核裁定。',
    drawings: [
      {
        id: 'dwg-02',
        name: '明水路陳公館_立面施工圖.pdf',
        size: 2410000,
        fileType: 'application/pdf',
        dataUrl: SAMPLE_DRAWING_DATAURL_1,
        uploadedBy: '小張',
        uploadedAt: '2026-10-21 09:20',
      },
    ],
    createdAt: '2026-10-21T02:00:00.000Z',
    updatedAt: '2026-10-22T11:40:00.000Z',
    createdBy: '小張',
  },
  {
    id: 'site-03',
    siteCode: 'ST-2026-003',
    name: '板橋新板特區 蔡公館 現代輕奢',
    clientName: '蔡先生',
    phone: '0988-123-456',
    address: '新北市板橋區新站路 88 號 16 樓',
    spaceType: '玄關鞋櫃 + 電視矮櫃 + 臥室推拉門衣櫃',
    status: 'verified',
    assignedStaff: '阿耀 (主管覆核)',
    measurementDate: '2026-10-19',
    estimatedDeliveryDate: '2026-11-05',
    notes: '全數尺寸已由主管阿耀現場覆核複丈，公差全在 ±3mm 容許值內，已發包工廠開板裁切。',
    drawings: [],
    createdAt: '2026-10-15T08:00:00.000Z',
    updatedAt: '2026-10-22T08:30:00.000Z',
    createdBy: '阿耀',
  },
];

export const INITIAL_MEASUREMENTS: MeasurementSheet[] = [
  {
    id: 'ms-01',
    siteId: 'site-01',
    itemCode: 'W-01',
    cabinetName: '主臥六門頂天大衣櫃',
    category: 'wardrobe',
    roomLocation: '主臥室右側整面牆',
    planned: {
      width: 2400,
      height: 2650,
      depth: 600,
      skirting: 100,
      ceilingHeight: 2700,
      beamHeight: 0,
      beamDepth: 0,
      fillerAllowance: 15,
    },
    measured: {
      width: 2408, // +8mm 正常
      height: 2655, // 實測淨高充足
      depth: 605,
      skirting: 100,
      ceilingHeight: 2705,
      beamHeight: 0,
      beamDepth: 0,
      wallPlumbOffset: 2, // 垂直度極佳
      floorLevelOffset: 1,
      outletCoords: '距左側垂直牆 650mm, 距地 300mm 雙插座',
      notes: '現場牆體垂直平整，預留 15mm 收邊條可完美吸收。',
    },
    supervisorApproved: true,
    supervisorNotes: '阿耀覆核：尺寸合規，可直接開單生產。',
    approvedBy: '阿耀',
    approvedAt: '2026-10-21 16:00',
    createdBy: '陳偉',
    updatedBy: '阿耀',
    updatedAt: '2026-10-21 16:00',
  },
  {
    id: 'ms-02',
    siteId: 'site-01',
    itemCode: 'S-01',
    cabinetName: '玄關懸空鞋櫃 (含穿鞋椅與中空置物)',
    category: 'shoe_cabinet',
    roomLocation: '玄關入口大門右側',
    planned: {
      width: 1600,
      height: 2300,
      depth: 400,
      skirting: 0, // 懸空無踢腳
      ceilingHeight: 2600,
      beamHeight: 2450,
      beamDepth: 350,
      fillerAllowance: 15,
    },
    measured: {
      width: 1592, // -8mm 實測偏窄，但小於15mm收邊條
      height: 2300,
      depth: 402,
      skirting: 0,
      ceilingHeight: 2595,
      beamHeight: 2445,
      beamDepth: 350,
      wallPlumbOffset: -4, // 牆面微斜
      floorLevelOffset: 3,
      outletCoords: '背牆中空處預留 110V 燈帶迴路開關 (距地 1050mm)',
      notes: '大門門套線需預留 50mm 迴轉半徑，注意門片開啟不要撞到門弓器。',
    },
    supervisorApproved: true,
    supervisorNotes: '阿耀覆核：右側收邊條改切 7mm 即可貼合。',
    approvedBy: '阿耀',
    approvedAt: '2026-10-21 16:20',
    createdBy: '陳偉',
    updatedBy: '阿耀',
    updatedAt: '2026-10-21 16:20',
  },
  {
    id: 'ms-03',
    siteId: 'site-02',
    itemCode: 'K-01',
    cabinetName: '廚房中島旁高身電器收納櫃',
    category: 'kitchen_appliance',
    roomLocation: '餐廳與開放式廚房交界',
    planned: {
      width: 1200,
      height: 2400,
      depth: 650,
      skirting: 80,
      ceilingHeight: 2500,
      beamHeight: 2350, // 樑底 2350mm
      beamDepth: 550, // 樑深 550mm (壓頂干涉！)
      fillerAllowance: 15,
    },
    measured: {
      width: 1182, // -18mm 嚴重不足！(大於收邊條 15mm)
      height: 2400,
      depth: 650,
      skirting: 85,
      ceilingHeight: 2480,
      beamHeight: 2340, // 現場樑底只有 2340mm，比櫃高 2400mm 矮 60mm！
      beamDepth: 580,
      wallPlumbOffset: 12, // 側牆垂直內傾達 12mm！
      floorLevelOffset: 8,
      outletCoords: '220V 專迴蒸烤爐插座 (距地 1200mm), 110V 電鍋排氣開關 (距地 850mm)',
      notes: '【重要警示】現場大樑壓頂且寬度縮水 18mm，若不降高或切樑，櫃體將完全頂死無法立櫃！',
    },
    supervisorApproved: false,
    supervisorNotes: '待主管阿耀與設計師開會確認：需降高至 2320mm 或做大樑包板切角。',
    createdBy: '小張',
    updatedBy: '小張',
    updatedAt: '2026-10-22T03:30:00.000Z',
  },
];
