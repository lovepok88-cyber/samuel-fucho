/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// High JSON limit for PDF / CAD drawing base64 payloads
app.use(express.json({ limit: '60mb' }));
app.use(express.urlencoded({ extended: true, limit: '60mb' }));

// Persistent Data Storage setup
const DATA_DIR = path.resolve(__dirname, 'data');
const DATA_FILE = path.resolve(DATA_DIR, 'cabinet_data.json');

interface AppData {
  sites: any[];
  measurements: any[];
  staff: any[];
  lastModified: number;
}

const defaultStaff = [
  {
    id: 'emp-01',
    code: 'EMP-01',
    name: '阿耀',
    username: '阿耀',
    title: '工程總監 / 主管',
    phone: '0910-888-031',
    role: 'supervisor',
    notes: '具備全功能與最高管理審核權限',
    createdAt: '2026-01-01T00:00:00.000Z',
    active: true,
  },
  {
    id: 'emp-02',
    code: 'EMP-02',
    name: '陳偉',
    username: 'chen',
    title: '資深現場丈量工程師',
    phone: '0922-333-444',
    role: 'staff',
    notes: '專責雙北豪宅與複丈工程',
    createdAt: '2026-02-15T00:00:00.000Z',
    active: true,
  },
  {
    id: 'emp-03',
    code: 'EMP-03',
    name: '小張',
    username: 'chang',
    title: '現場工務助理',
    phone: '0933-555-777',
    role: 'staff',
    notes: '負責現場雷射量測與水電孔位複查',
    createdAt: '2026-03-01T00:00:00.000Z',
    active: true,
  },
  {
    id: 'emp-04',
    code: 'EMP-04',
    name: '林美惠',
    username: 'lin',
    title: '系統櫃設計規劃師',
    phone: '0955-666-888',
    role: 'staff',
    notes: 'CAD施工圖繪製與發包核單',
    createdAt: '2026-04-10T00:00:00.000Z',
    active: true,
  },
];

function loadData(): AppData {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (!parsed.staff || !Array.isArray(parsed.staff)) {
        parsed.staff = defaultStaff;
        saveData(parsed);
      }
      return parsed;
    }
  } catch (err) {
    console.error('Error loading data file:', err);
  }

  // Initial Seed Data
  const defaultData: AppData = {
    sites: [
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
        drawings: [],
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
        drawings: [],
        createdAt: '2026-10-21T02:00:00.000Z',
        updatedAt: '2026-10-22T11:40:00.000Z',
        createdBy: '小張',
      },
    ],
    measurements: [
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
          width: 2408,
          height: 2655,
          depth: 605,
          skirting: 100,
          ceilingHeight: 2705,
          beamHeight: 0,
          beamDepth: 0,
          wallPlumbOffset: 2,
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
          skirting: 0,
          ceilingHeight: 2600,
          beamHeight: 2450,
          beamDepth: 350,
          fillerAllowance: 15,
        },
        measured: {
          width: 1592,
          height: 2300,
          depth: 402,
          skirting: 0,
          ceilingHeight: 2595,
          beamHeight: 2445,
          beamDepth: 350,
          wallPlumbOffset: -4,
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
          beamHeight: 2350,
          beamDepth: 550,
          fillerAllowance: 15,
        },
        measured: {
          width: 1182,
          height: 2400,
          depth: 650,
          skirting: 85,
          ceilingHeight: 2480,
          beamHeight: 2340,
          beamDepth: 580,
          wallPlumbOffset: 12,
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
    ],
    staff: defaultStaff,
    lastModified: Date.now(),
  };

  saveData(defaultData);
  return defaultData;
}

function saveData(data: AppData) {
  try {
    data.lastModified = Date.now();
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving data file:', err);
  }
}

// REST API Endpoints
// 1. Sync & Heartbeat
app.get('/api/sync', (req, res) => {
  const data = loadData();
  res.json({
    lastModified: data.lastModified,
    sitesCount: data.sites.length,
    measurementsCount: data.measurements.length,
  });
});

// 2. Job Sites
app.get('/api/sites', (req, res) => {
  const data = loadData();
  res.json(data.sites);
});

app.post('/api/sites', (req, res) => {
  const data = loadData();
  const newSite = req.body;
  if (!newSite.id) {
    newSite.id = `site-${Date.now()}`;
  }
  newSite.createdAt = newSite.createdAt || new Date().toISOString();
  newSite.updatedAt = new Date().toISOString();
  newSite.drawings = newSite.drawings || [];

  data.sites.unshift(newSite);
  saveData(data);
  res.status(201).json(newSite);
});

app.put('/api/sites/:id', (req, res) => {
  const data = loadData();
  const siteIndex = data.sites.findIndex((s) => s.id === req.params.id);
  if (siteIndex === -1) {
    res.status(404).json({ error: 'Site not found' });
    return;
  }
  data.sites[siteIndex] = {
    ...data.sites[siteIndex],
    ...req.body,
    updatedAt: new Date().toISOString(),
  };
  saveData(data);
  res.json(data.sites[siteIndex]);
});

app.delete('/api/sites/:id', (req, res) => {
  const data = loadData();
  const siteId = req.params.id;
  data.sites = data.sites.filter((s) => s.id !== siteId);
  data.measurements = data.measurements.filter((m) => m.siteId !== siteId);
  saveData(data);
  res.json({ success: true, deletedSiteId: siteId });
});

// 3. Site Drawings & PDFs
app.post('/api/sites/:id/drawings', (req, res) => {
  const data = loadData();
  const site = data.sites.find((s) => s.id === req.params.id);
  if (!site) {
    res.status(404).json({ error: 'Site not found' });
    return;
  }
  const drawing = req.body;
  drawing.id = drawing.id || `dwg-${Date.now()}`;
  drawing.uploadedAt = drawing.uploadedAt || new Date().toISOString();
  site.drawings = site.drawings || [];
  site.drawings.push(drawing);
  site.updatedAt = new Date().toISOString();
  saveData(data);
  res.status(201).json(drawing);
});

app.delete('/api/sites/:id/drawings/:drawingId', (req, res) => {
  const data = loadData();
  const site = data.sites.find((s) => s.id === req.params.id);
  if (!site) {
    res.status(404).json({ error: 'Site not found' });
    return;
  }
  site.drawings = (site.drawings || []).filter((d: any) => d.id !== req.params.drawingId);
  site.updatedAt = new Date().toISOString();
  saveData(data);
  res.json({ success: true });
});

// 4. Measurement Sheets
app.get('/api/measurements', (req, res) => {
  const data = loadData();
  const siteId = req.query.siteId as string | undefined;
  if (siteId) {
    res.json(data.measurements.filter((m) => m.siteId === siteId));
  } else {
    res.json(data.measurements);
  }
});

app.post('/api/measurements', (req, res) => {
  const data = loadData();
  const sheet = req.body;
  sheet.id = sheet.id || `ms-${Date.now()}`;
  sheet.updatedAt = new Date().toISOString();

  const existingIndex = data.measurements.findIndex((m) => m.id === sheet.id);
  if (existingIndex >= 0) {
    data.measurements[existingIndex] = sheet;
  } else {
    data.measurements.unshift(sheet);
  }
  saveData(data);
  res.status(201).json(sheet);
});

app.put('/api/measurements', (req, res) => {
  const data = loadData();
  const sheet = req.body;
  sheet.updatedAt = new Date().toISOString();
  const existingIndex = data.measurements.findIndex((m) => m.id === sheet.id);
  if (existingIndex >= 0) {
    data.measurements[existingIndex] = { ...data.measurements[existingIndex], ...sheet };
    saveData(data);
    res.json(data.measurements[existingIndex]);
  } else {
    data.measurements.unshift(sheet);
    saveData(data);
    res.status(201).json(sheet);
  }
});

app.delete('/api/measurements/:id', (req, res) => {
  const data = loadData();
  data.measurements = data.measurements.filter((m) => m.id !== req.params.id);
  saveData(data);
  res.json({ success: true });
});

// 5. Staff / Employee Management
app.get('/api/staff', (req, res) => {
  const data = loadData();
  res.json(data.staff || []);
});

app.post('/api/staff', (req, res) => {
  const data = loadData();
  const newStaff = req.body;
  if (!newStaff.id) {
    newStaff.id = `emp-${Date.now()}`;
  }
  newStaff.createdAt = newStaff.createdAt || new Date().toISOString();
  newStaff.active = newStaff.active !== false;
  data.staff = data.staff || [];
  data.staff.push(newStaff);
  saveData(data);
  res.status(201).json(newStaff);
});

app.put('/api/staff/:id', (req, res) => {
  const data = loadData();
  const staffIndex = (data.staff || []).findIndex((e) => e.id === req.params.id);
  if (staffIndex === -1) {
    res.status(404).json({ error: 'Staff member not found' });
    return;
  }
  data.staff[staffIndex] = {
    ...data.staff[staffIndex],
    ...req.body,
  };
  saveData(data);
  res.json(data.staff[staffIndex]);
});

app.delete('/api/staff/:id', (req, res) => {
  const data = loadData();
  data.staff = (data.staff || []).filter((e) => e.id !== req.params.id);
  saveData(data);
  res.json({ success: true, deletedStaffId: req.params.id });
});


// Mount Vite or static server
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer();
