(() => {
  'use strict';

  const canvas = document.querySelector('#world');
  const ctx = canvas.getContext('2d');
  const $ = (selector) => document.querySelector(selector);
  const els = {
    cash: $('#cash'), population: $('#population'), rebirths: $('#rebirths'), year: $('#year'), researchTokens: $('#researchTokens'), categoryList: $('#categoryList'), buildingList: $('#buildingList'), landList: $('#landList'),
    selectionName: $('#selectionName'), selectionMeta: $('#selectionMeta'), workerInfo: $('#workerInfo'),
    storedTax: $('#storedTax'), missionTitle: $('#missionTitle'), missionText: $('#missionText'), unlockInfo: $('#unlockInfo'), researchInfo: $('#researchInfo'),
    missionProgress: $('#missionProgress'), claimMission: $('#claimMission'), toast: $('#toast'),
  };

  const BUILDINGS = {
    hut: { name: '농민 오두막', icon: '🏡', category: 'residential', price: 100, income: 8, people: 2, body: '#d4bd83', roof: '#7e4745', size: [8, 5, 8] },
    warehouse: { name: '왕실 곡창고', icon: '🏰', category: 'production', price: 180, income: 14, people: 1, body: '#b88455', roof: '#5f4c4a', size: [10, 6, 12] },
    woodhouse: { name: '나무꾼의 집', icon: '🪵', category: 'residential', price: 280, income: 22, people: 3, body: '#a96f45', roof: '#6a4040', size: [12, 6, 8] },
    village: { name: '마을 저택', icon: '🏠', category: 'residential', price: 420, income: 34, people: 5, body: '#dfc27e', roof: '#69445c', size: [12, 7, 12] },
    manor: { name: '귀족 저택', icon: '🏘️', category: 'residential', price: 760, income: 58, people: 9, body: '#d7b279', roof: '#5b496e', size: [16, 8, 12] },
    farm: { name: '풍차 농장', icon: '🌾', category: 'production', price: 260, income: 26, people: 2, body: '#d7c384', roof: '#8b5b3d', size: [12, 6, 10] },
    market: { name: '왕국 시장', icon: '🏪', category: 'production', price: 520, income: 48, people: 4, body: '#cf9160', roof: '#a94752', size: [14, 7, 12] },
    homestead: { name: '영주의 영지', icon: '🏛️', category: 'landmark', price: 650, income: 50, people: 8, body: '#c99459', roof: '#473e61', size: [16, 8, 12] },
    watchtower: { name: '수호자 탑', icon: '🗼', category: 'landmark', price: 820, income: 68, people: 2, body: '#9ea5ab', roof: '#535a70', size: [9, 11, 9] },
    royalGarden: { name: '왕실 정원', icon: '🌳', category: 'landmark', price: 1080, income: 90, people: 5, body: '#83ad78', roof: '#3d7559', size: [16, 7, 14] },
    harbor: { name: '왕국 항구', icon: '⚓', category: 'production', price: 880, income: 82, people: 5, body: '#a87851', roof: '#3d6579', size: [18, 6, 14] },
    mine: { name: '철광산', icon: '⛏️', category: 'production', price: 740, income: 74, people: 3, body: '#73777d', roof: '#4a4549', size: [14, 8, 12] },
    forge: { name: '왕실 대장간', icon: '⚒️', category: 'production', price: 660, income: 64, people: 4, body: '#8f5d43', roof: '#3e424d', size: [14, 7, 12] },
    ranch: { name: '목축 농장', icon: '🐄', category: 'production', price: 430, income: 42, people: 4, body: '#c59b62', roof: '#8a5b3d', size: [14, 6, 14] },
  };
  // Each of the ten series has one building for every kingdom year: 10 × 10 = 100 new buildings.
  const ERA_STAGES = [
    { year: 1, label: '개척', roof: '#774a37', trim: '#9a7045', glow: '#f0c36c' },
    { year: 2, label: '목조', roof: '#874d38', trim: '#b78355', glow: '#f2ce7a' },
    { year: 3, label: '석조', roof: '#72565a', trim: '#a8a39a', glow: '#ffe08a' },
    { year: 4, label: '도시', roof: '#984f42', trim: '#c98b66', glow: '#ffd589' },
    { year: 5, label: '산업', roof: '#454a55', trim: '#88919b', glow: '#ffb75b' },
    { year: 6, label: '전기', roof: '#3e5169', trim: '#6f9fc1', glow: '#ffe47a' },
    { year: 7, label: '현대', roof: '#4d6273', trim: '#b7d2da', glow: '#8ee8ff' },
    { year: 8, label: '친환경', roof: '#315d52', trim: '#70ad75', glow: '#b8f58d' },
    { year: 9, label: '스마트', roof: '#303b66', trim: '#658ed0', glow: '#8fc8ff' },
    { year: 10, label: '미래', roof: '#42345f', trim: '#b188d4', glow: '#85ffff' },
  ];
  const ERA_BUILDING_SERIES = [
    { id: 'home', name: '주택', category: 'residential', icon: '🏠', model: 'home', size: [9, 5, 9], price: 110, income: 9, people: 2, body: '#d6bb82' },
    { id: 'apartment', name: '공동 주택', category: 'residential', icon: '🏢', model: 'apartment', size: [12, 9, 10], price: 230, income: 18, people: 5, body: '#c6b7a1' },
    { id: 'forge', name: '단조 공방', category: 'production', icon: '⚒️', model: 'forge', size: [14, 7, 12], price: 310, income: 29, people: 4, body: '#995f41' },
    { id: 'farm', name: '농장', category: 'production', icon: '🌾', model: 'farm', size: [14, 6, 14], price: 270, income: 27, people: 3, body: '#d5b86d' },
    { id: 'market', name: '상업 시장', category: 'production', icon: '🏪', model: 'market', size: [14, 7, 12], price: 370, income: 37, people: 4, body: '#cf9160' },
    { id: 'harbor', name: '무역 항구', category: 'production', icon: '⚓', model: 'harbor', size: [18, 6, 14], price: 470, income: 45, people: 5, body: '#a87851' },
    { id: 'mine', name: '채굴소', category: 'production', icon: '⛏️', model: 'mine', size: [14, 8, 12], price: 430, income: 42, people: 4, body: '#73777d' },
    { id: 'hall', name: '행정관', category: 'landmark', icon: '🏛️', model: 'hall', size: [16, 9, 14], price: 530, income: 43, people: 6, body: '#d6c8aa' },
    { id: 'tower', name: '감시탑', category: 'landmark', icon: '🗼', model: 'tower', size: [10, 12, 10], price: 510, income: 39, people: 2, body: '#9ea5ab' },
    { id: 'park', name: '시민 공원', category: 'decoration', icon: '🌳', model: 'park', size: [16, 4, 14], price: 190, income: 11, people: 1, body: '#6ea96c' },
  ];
  for (const series of ERA_BUILDING_SERIES) {
    ERA_STAGES.forEach((era, index) => {
      const tier = index + 1;
      BUILDINGS[`era_${series.id}_${tier}`] = {
        name: `${era.label} ${series.name}`, icon: series.icon, category: series.category, model: series.model, catalog: true,
        unlockYear: era.year, tier, researchCost: Math.max(0, Math.round((tier - 1) * (tier - 1) * .65)),
        price: Math.round((series.price + tier * 140 + tier * tier * 80) / 10) * 10,
        income: series.income + tier * 10 + tier * tier * 4, people: series.people + Math.floor(tier / 2),
        body: series.body, roof: era.roof, trim: era.trim, glow: era.glow,
        size: [Math.min(18, series.size[0] + Math.floor(index / 3) * 2), Math.min(13, series.size[1] + Math.floor(index / 2)), Math.min(18, series.size[2] + Math.floor(index / 4) * 2)],
      };
    });
  }
  const CATALOG_BUILDING_COUNT = Object.values(BUILDINGS).filter((item) => item.catalog).length;
  const CATEGORIES = [{ id: 'all', name: '전체' }, { id: 'residential', name: '주거' }, { id: 'production', name: '생산' }, { id: 'landmark', name: '랜드마크' }, { id: 'decoration', name: '장식' }];
  const MISSIONS = [
    { id: 'homes', title: '주거 건물 3채를 건설하세요', goal: 3, reward: 450 },
    { id: 'lands', title: '새 영토 2곳을 확보하세요', goal: 5, reward: 700 },
    { id: 'production', title: '생산 건물 2채를 건설하세요', goal: 2, reward: 900 },
    { id: 'income', title: '10초 수입을 150으로 늘리세요', goal: 150, reward: 1200 },
    { id: 'landmarks', title: '랜드마크 2개를 건설하세요', goal: 2, reward: 1600 },
    { id: 'population', title: '주민 30명을 달성하세요', goal: 30, reward: 2200 },
  ];
  const LANDS = [
    { id: 'core1', name: '왕실 들판', x: -96, z: -24, price: 0, owned: true },
    { id: 'core2', name: '햇살 초원', x: -48, z: -24, price: 0, owned: true },
    { id: 'core3', name: '푸른 뜰', x: 0, z: -24, price: 0, owned: true },
    { id: 'core4', name: '동쪽 고원', x: 48, z: -24, price: 650, owned: false },
    { id: 'core5', name: '성벽 전망대', x: 96, z: -24, price: 650, owned: false },
    { id: 'core6', name: '서쪽 숲', x: -96, z: 24, price: 650, owned: false },
    { id: 'pass1', name: '왕실 정원', x: -48, z: 24, price: 900, owned: false },
    { id: 'pass2', name: '은빛 평원', x: 0, z: 24, price: 900, owned: false },
    { id: 'pass3', name: '수호자의 언덕', x: 48, z: 24, price: 900, owned: false },
    { id: 'pass4', name: '황금 항구', x: 96, z: 24, price: 900, owned: false },
    { id: 'north1', name: '서리 들판', x: -96, z: -72, price: 1100, owned: false },
    { id: 'north2', name: '은빛 초원', x: -48, z: -72, price: 1100, owned: false },
    { id: 'north3', name: '왕도의 북문', x: 0, z: -72, price: 1250, owned: false },
    { id: 'north4', name: '솔바람 능선', x: 48, z: -72, price: 1250, owned: false },
    { id: 'north5', name: '새벽 평원', x: 96, z: -72, price: 1400, owned: false },
    { id: 'south1', name: '호수 들녘', x: -96, z: 72, price: 1100, owned: false },
    { id: 'south2', name: '곡식 벌판', x: -48, z: 72, price: 1100, owned: false },
    { id: 'south3', name: '왕실 과수원', x: 0, z: 72, price: 1250, owned: false },
    { id: 'south4', name: '바람개비 언덕', x: 48, z: 72, price: 1250, owned: false },
    { id: 'south5', name: '황혼의 벌판', x: 96, z: 72, price: 1400, owned: false },
  ];
  const MAP_GRID = { columns: 20, rows: 10, minX: -432, minZ: -216, tile: 48 };
  const occupiedLandCoordinates = new Set(LANDS.map((land) => `${land.x},${land.z}`));
  for (let row = 0; row < MAP_GRID.rows; row++) {
    for (let column = 0; column < MAP_GRID.columns; column++) {
      const x = MAP_GRID.minX + column * MAP_GRID.tile, z = MAP_GRID.minZ + row * MAP_GRID.tile;
      if (occupiedLandCoordinates.has(`${x},${z}`)) continue;
      const distance = Math.abs(x) / MAP_GRID.tile + Math.abs(z) / MAP_GRID.tile;
      LANDS.push({ id: `realm_${column + 1}_${row + 1}`, name: `확장 영토 ${column + 1}-${row + 1}`, x, z, price: 700 + Math.floor(distance * 140), owned: false });
    }
  }
  const START = { cash: 1000, owned: ['core1', 'core2', 'core3'], buildings: [], workers: 0, autoCollect: false, rotation: 0, rotationStep: 45, missionIndex: 0, rebirths: 0, year: 1, researchTokens: 0, researchCount: 0 };
  const storageKey = 'crownvale-browser-v1';
  let state = load();
  let selectedBuilding = null;
  let selectedCategory = 'all';
  let hoveredLand = null;
  let hoveredPlacement = null;
  let deleteMode = false;
  let selectedLand = 'core1';
  let activeTab = 'build';
  let toastTimer = 0;
  let lastTime = performance.now();
  let autoTimer = 0;
  let worldTime = 0;
  let cameraDrag = null;
  const pressedKeys = new Set();
  let viewW = 0, viewH = 0, dpr = 1;
  // High bird's-eye view keeps every buildable tile visible at the start.
  const CAMERA_SCREEN_Y = .45;
  const CAMERA_DRAG_SPEED = .21;
  const CAMERA_KEYBOARD_SPEED = 36;
  const camera = { x: 24, z: 0, yaw: -0.76, pitch: 1.12, zoom: 500 };
  const hitTiles = [];

  function clampCamera() {
    const minX = MAP_GRID.minX - MAP_GRID.tile / 2;
    const maxX = MAP_GRID.minX + (MAP_GRID.columns - 1) * MAP_GRID.tile + MAP_GRID.tile / 2;
    const minZ = MAP_GRID.minZ - MAP_GRID.tile / 2;
    const maxZ = MAP_GRID.minZ + (MAP_GRID.rows - 1) * MAP_GRID.tile + MAP_GRID.tile / 2;
    camera.x = Math.max(minX, Math.min(maxX, camera.x));
    camera.z = Math.max(minZ, Math.min(maxZ, camera.z));
  }

  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey));
      if (saved && Array.isArray(saved.owned) && Array.isArray(saved.buildings)) {
        const profile = { ...START, ...saved };
        if (!Number.isInteger(saved.missionIndex)) profile.missionIndex = saved.missionClaimed ? 1 : 0;
        if (!Number.isFinite(saved.year) || saved.year < 1) profile.year = Math.max(1, (saved.rebirths || 0) + 1);
        return profile;
      }
    } catch (_) { /* start a new kingdom */ }
    return structuredClone(START);
  }
  function save(silent = false) { localStorage.setItem(storageKey, JSON.stringify(state)); if (!silent) toast('왕국 기록을 저장했습니다.'); }
  function format(value) { return Math.floor(value).toLocaleString('ko-KR'); }
  function formatTax(value) { return value.toLocaleString('ko-KR', { maximumFractionDigits: 1 }); }
  function kingdomYear() { return Math.max(1, Math.floor(state.year || 1)); }
  function unlockYear(item) { return item && item.unlockYear ? item.unlockYear : 1; }
  function isBuildingUnlocked(item) { return !!item && kingdomYear() >= unlockYear(item); }
  function toast(message) { clearTimeout(toastTimer); els.toast.textContent = message; els.toast.classList.add('show'); toastTimer = setTimeout(() => els.toast.classList.remove('show'), 2600); }
  function owned(land) { return state.owned.includes(land.id); }
  function buildingCount(landId) { return state.buildings.filter((building) => building.landId === landId).length; }
  function population() { return state.buildings.reduce((total, building) => total + BUILDINGS[building.type].people, 0); }
  function storedTax() { return state.buildings.reduce((total, building) => total + building.tax, 0); }
  function workerIncomeMultiplier() { return (1 + (state.workers || 0) * 0.005) * (1 + (state.rebirths || 0) * 0.1); }
  function workerCost() { return 600 + (state.workers || 0) * 150; }
  function researchPrice() { return 300 + kingdomYear() * 150 + (state.researchCount || 0) * 50; }
  function researchReward() { return 1 + Math.floor((kingdomYear() - 1) / 2); }
  function conductResearch() {
    const price = researchPrice(), reward = researchReward();
    if (state.cash < price) return toast('연구에 필요한 골드가 부족합니다.');
    state.cash -= price; state.researchTokens = (state.researchTokens || 0) + reward; state.researchCount = (state.researchCount || 0) + 1;
    toast(`연구 완료! 연구 토큰 ${reward}개를 획득했습니다.`); save(true); updateUI();
  }
  function countCategory(category) { return state.buildings.filter((building) => BUILDINGS[building.type].category === category).length; }
  function incomePerTick() { return state.buildings.reduce((total, building) => total + BUILDINGS[building.type].income, 0) * workerIncomeMultiplier(); }
  function missionProgress(mission) {
    if (!mission) return 0;
    if (mission.id === 'homes') return countCategory('residential');
    if (mission.id === 'lands') return state.owned.length;
    if (mission.id === 'production') return countCategory('production');
    if (mission.id === 'income') return incomePerTick();
    if (mission.id === 'landmarks') return countCategory('landmark');
    if (mission.id === 'population') return population();
    return 0;
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    viewW = window.innerWidth; viewH = window.innerHeight;
    canvas.width = Math.floor(viewW * dpr); canvas.height = Math.floor(viewH * dpr);
    canvas.style.width = `${viewW}px`; canvas.style.height = `${viewH}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  window.addEventListener('resize', resize); resize();

  function project(point) {
    const dx = point.x - camera.x, dz = point.z - camera.z;
    const cy = Math.cos(camera.yaw), sy = Math.sin(camera.yaw);
    const cp = Math.cos(camera.pitch), sp = Math.sin(camera.pitch);
    const rx = dx * cy - dz * sy;
    const rz = dx * sy + dz * cy;
    // An orthographic bird's-eye camera keeps buildings the same size while
    // panning. Perspective scaling made nearby buildings stretch into long
    // bars and eventually disappear when the camera crossed them.
    const py = point.y * cp + rz * sp;
    const depth = -point.y * sp + rz * cp;
    const scale = camera.zoom / 1000;
    return { x: viewW * .5 + rx * scale, y: viewH * CAMERA_SCREEN_Y - py * scale, depth };
  }
  function screenToGround(screenX, screenY, groundY = .7) {
    const cy = Math.cos(camera.yaw), sy = Math.sin(camera.yaw);
    const cp = Math.cos(camera.pitch), sp = Math.sin(camera.pitch);
    const scale = camera.zoom / 1000;
    if (scale <= 0 || Math.abs(sp) < .0001) return null;
    const py = (viewH * CAMERA_SCREEN_Y - screenY) / scale;
    const rz = (py - groundY * cp) / sp;
    const rx = (screenX - viewW * .5) / scale;
    return { x: camera.x + rx * cy + rz * sy, z: camera.z - rx * sy + rz * cy };
  }
  function landAtWorld(position) {
    return LANDS.find((land) => Math.abs(position.x - land.x) <= 24 && Math.abs(position.z - land.z) <= 24);
  }
  function footprint(item, rotation) {
    const angle = (rotation || 0) * Math.PI / 180, c = Math.abs(Math.cos(angle)), s = Math.abs(Math.sin(angle));
    return [item.size[0] * c + item.size[2] * s, item.size[0] * s + item.size[2] * c];
  }
  function placementFromScreen(screenX, screenY) {
    if (!selectedBuilding) return null;
    const world = screenToGround(screenX, screenY), item = BUILDINGS[selectedBuilding];
    if (!isBuildingUnlocked(item)) return null;
    const land = world && landAtWorld(world);
    if (!land || !owned(land)) return null;
    const [width, depth] = footprint(item, state.rotation);
    const snap = (value) => Math.round(value / 4) * 4;
    const margin = 1;
    const x = Math.max(land.x - 24 + width * .5 + margin, Math.min(land.x + 24 - width * .5 - margin, snap(world.x)));
    const z = Math.max(land.z - 24 + depth * .5 + margin, Math.min(land.z + 24 - depth * .5 - margin, snap(world.z)));
    const occupied = state.buildings.some((building) => {
      if (building.landId !== land.id) return false;
      const [otherWidth, otherDepth] = footprint(BUILDINGS[building.type], building.rotation);
      return Math.abs(x - building.x) < (width + otherWidth) * .5 + .6 && Math.abs(z - building.z) < (depth + otherDepth) * .5 + .6;
    });
    return { landId: land.id, x, z, valid: !occupied };
  }
  function rotatePoint(point, center, angle) {
    const c = Math.cos(angle), s = Math.sin(angle), x = point.x - center.x, z = point.z - center.z;
    return { x: center.x + x * c - z * s, y: point.y, z: center.z + x * s + z * c };
  }
  function shade(hex, amount) {
    const value = parseInt(hex.slice(1), 16); const clamp = (n) => Math.max(0, Math.min(255, n));
    return `rgb(${clamp((value >> 16) + amount)},${clamp(((value >> 8) & 255) + amount)},${clamp((value & 255) + amount)})`;
  }

  const faces = [];
  let faceLayer = 0;
  function addFace(vertices, color, outline = null, alpha = 1) {
    const points = vertices.map(project);
    faces.push({ points, depth: points.reduce((sum, point) => sum + point.depth, 0) / points.length, color, outline, alpha, layer: faceLayer });
  }
  function box(center, size, color, rotation = 0, alpha = 1) {
    const [sx, sy, sz] = size; const x = sx / 2, y = sy / 2, z = sz / 2;
    const vertices = [
      { x: center.x - x, y: center.y - y, z: center.z - z }, { x: center.x + x, y: center.y - y, z: center.z - z },
      { x: center.x + x, y: center.y - y, z: center.z + z }, { x: center.x - x, y: center.y - y, z: center.z + z },
      { x: center.x - x, y: center.y + y, z: center.z - z }, { x: center.x + x, y: center.y + y, z: center.z - z },
      { x: center.x + x, y: center.y + y, z: center.z + z }, { x: center.x - x, y: center.y + y, z: center.z + z },
    ].map((point) => rotation ? rotatePoint(point, center, rotation) : point);
    [[0,1,2,3,-22], [0,4,5,1,-12], [1,5,6,2,2], [2,6,7,3,13], [3,7,4,0,-5], [4,7,6,5,22]].forEach(([a,b,c,d,tint]) => addFace([vertices[a],vertices[b],vertices[c],vertices[d]], shade(color, tint), undefined, alpha));
  }
  function prism(center, width, depth, eaveY, ridgeY, color, rotation = 0, alpha = 1) {
    const base = [
      { x: center.x - width/2, y: eaveY, z: center.z - depth/2 }, { x: center.x, y: ridgeY, z: center.z - depth/2 }, { x: center.x + width/2, y: eaveY, z: center.z - depth/2 },
      { x: center.x - width/2, y: eaveY, z: center.z + depth/2 }, { x: center.x, y: ridgeY, z: center.z + depth/2 }, { x: center.x + width/2, y: eaveY, z: center.z + depth/2 },
    ].map((point) => rotation ? rotatePoint(point, center, rotation) : point);
    addFace([base[0],base[1],base[4],base[3]], shade(color, -8), undefined, alpha); addFace([base[1],base[2],base[5],base[4]], shade(color, 14), undefined, alpha);
    addFace([base[0],base[2],base[1]], shade(color, 4), undefined, alpha); addFace([base[3],base[4],base[5]], shade(color, 25), undefined, alpha);
  }
  function pyramid(center, size, color) {
    const h = size * 1.5, r = size * .62;
    const base = [{x:center.x-r,y:center.y,z:center.z-r},{x:center.x+r,y:center.y,z:center.z-r},{x:center.x+r,y:center.y,z:center.z+r},{x:center.x-r,y:center.y,z:center.z+r}], peak={x:center.x,y:center.y+h,z:center.z};
    addFace([base[0],base[1],peak], shade(color,-16)); addFace([base[1],base[2],peak], shade(color,3)); addFace([base[2],base[3],peak], shade(color,16)); addFace([base[3],base[0],peak], shade(color,-4));
  }

  function drawLand(land) {
    const active = owned(land); const selected = selectedLand === land.id;
    const color = active ? (selected ? '#71b869' : '#5b9856') : '#365c4a';
    const surface = [
      {x:land.x-24,y:.5,z:land.z-24}, {x:land.x+24,y:.5,z:land.z-24},
      {x:land.x+24,y:.5,z:land.z+24}, {x:land.x-24,y:.5,z:land.z+24},
    ];
    addFace(surface, shade(color, 22));
    if (!active) { box({ x: land.x, y: 1.2, z: land.z }, [9, .35, 2], '#596a78'); box({ x: land.x, y: 3.2, z: land.z }, [.55, 4, .55], '#8091a0'); }
    const top = surface.map(project);
    hitTiles.push({ id: land.id, points: top, depth: top.reduce((sum,p)=>sum+p.depth,0)/4 });
  }
  function drawLandBorder(land) {
    if (selectedLand !== land.id) return;
    const color = '#f0cb70';
    const y = .86, width = 46.8, depth = 46.8, thickness = .34;
    box({ x: land.x, y, z: land.z - depth/2 }, [width, .2, thickness], color);
    box({ x: land.x, y, z: land.z + depth/2 }, [width, .2, thickness], color);
    box({ x: land.x - width/2, y, z: land.z }, [thickness, .2, depth], color);
    box({ x: land.x + width/2, y, z: land.z }, [thickness, .2, depth], color);
  }
  function drawCatalogDetail(item, local, r, w, h, d) {
    if (!item.catalog) return;
    const trim = item.trim || '#c9d3dd', glow = item.glow || '#ffe08a';
    if (item.model === 'home') {
      box(local(0, d*.48, h + 2.2), [w*.64, .28, .34], trim, r);
    } else if (item.model === 'apartment') {
      for (const x of [-w*.27, 0, w*.27]) box(local(x, -d*.51, h*.72 + 1.2), [1.15, h*.6, .16], glow, r);
    } else if (item.model === 'forge') {
      box(local(w*.4, d*.18, h + 3.2), [.85, 5, .85], '#454b55', r);
      box(local(-w*.34, -d*.55, 2), [3.6, 1.2, .7], '#34353b', r);
    } else if (item.model === 'farm') {
      for (const x of [-w*.35, 0, w*.35]) box(local(x, d*.58, 1.25), [1.25, .22, 4.5], '#d3b956', r);
    } else if (item.model === 'market') {
      box(local(0, -d*.55, h + 1.6), [w + .7, .42, .9], trim, r);
    } else if (item.model === 'harbor') {
      box(local(0, d*.67, 1.1), [w + 5, .34, 4.2], '#9b714b', r);
      box(local(-w*.45, d*.77, 1.25), [5.5, .28, 3.2], '#4ca1be', r);
    } else if (item.model === 'mine') {
      box(local(0, -d*.53, 2.4), [w*.62, 3.8, .45], '#35363a', r);
    } else if (item.model === 'hall') {
      for (const x of [-w*.3, 0, w*.3]) box(local(x, -d*.54, h*.55 + 1.4), [.65, h*.8, .65], trim, r);
    } else if (item.model === 'tower') {
      box(local(0, 0, h + 4.2), [.6, 6, .6], trim, r);
      box(local(1.2, 0, h + 6.5), [2.6, .8, .1], glow, r);
    } else if (item.model === 'park') {
      for (const [x, z] of [[-w*.28,-d*.26],[w*.28,-d*.26],[-w*.28,d*.26],[w*.28,d*.26]]) pyramid(local(x, z, 1.2), 2.4, '#3e8653');
      box(local(0, 0, 1.05), [3.6, .35, 3.6], trim, r);
      box(local(0, 0, 1.55), [1.3, 1.1, 1.3], '#6abdd3', r);
    }
    if (item.tier >= 6) box(local(0, d*.44, h + 2.7), [w*.58, .18, .9], glow, r);
    if (item.tier >= 8) box(local(w*.34, d*.28, h + 4.1), [.24, 5.2, .24], glow, r);
  }
  function drawBuilding(building, isGhost = false) {
    const item = BUILDINGS[building.type]; const [w,h,d] = item.size; const position = { x: building.x, y: 1, z: building.z };
    // The placement preview uses the same solid model as the finished building
    // so overlapping translucent roof faces never make it look broken.
    const alpha = 1, r = (building.rotation || 0) * Math.PI / 180, isPark = item.model === 'park';
    box({ x: position.x, y: 1.45, z: position.z }, [w, .8, d], '#68717c', r, alpha);
    if (isPark) {
      box({ x: position.x, y: 1.8, z: position.z }, [w-.55,.55,d-.55], item.body, r, alpha);
    } else {
      box({ x: position.x, y: 1.8 + h/2, z: position.z }, [w-.55,h,d-.55], item.body, r, alpha);
      prism(position, w+1, d+1, h+1.55, h+4, item.roof, r, alpha);
    }
    const c = Math.cos(r), s = Math.sin(r);
    const local = (x,z,y) => ({ x:position.x+x*c-z*s, y, z:position.z+x*s+z*c });
    if (!isPark) {
      for (const x of [-w*.37,w*.37]) for (const z of [-d*.37,d*.37]) box(local(x,z,h/2+1.8), [.3,h+1.1,.3], '#5c392a', r, alpha);
      const door = local(0,-d/2-.04,3); box(door, [1.8,3.3,.18], '#513322', r, alpha);
      for (const x of [-w*.25,w*.25]) box(local(x,-d/2-.12,h*.68+1), [1.25,1.3,.13], '#ffd16e', r, alpha);
    }
    drawCatalogDetail(item, local, r, w, h, d);
    if (isGhost) return;
    if (building.type === 'farm') {
      box(local(0, .2, h + 3.2), [.55, 5.4, .55], '#8c6544', r);
      box(local(0, -.1, h + 4.7), [5.2, .28, .28], '#e7dfbf', r);
      box(local(0, -.1, h + 4.7), [.28, .28, 5.2], '#e7dfbf', r + Math.PI / 2);
    } else if (building.type === 'market') {
      box(local(0, -d*.52, h + 2.3), [w + .9, .45, 1.1], '#d35b5b', r);
      box(local(0, -d*.56, h + 1.1), [w*.75, .3, .18], '#ffe5a3', r);
    } else if (building.type === 'harbor') {
      box(local(0, d*.7, 1.2), [w + 7, .45, 5.5], '#9b714b', r);
      for (const x of [-w*.46, 0, w*.46]) box(local(x, d*.7, 2.2), [.42, 2.3, .42], '#5a3c29', r);
      box(local(-w*.62, d*.85, 1.2), [7, .36, 4.1], '#4ca1be', r);
      box(local(-w*.62, d*.85, 1.7), [4.8, .75, 2.6], '#d1a45a', r);
      prism(local(-w*.62, d*.85, 2.05), 4.5, 2.3, 2.1, 3.7, '#f1e3bd', r);
      box(local(-w*.62, d*.85, 5.6), [.22, 7, .22], '#70442f', r);
    } else if (building.type === 'watchtower') {
      box(local(0, 0, h + 4.8), [.2, 6, .2], '#d9b45f', r);
      box(local(1.6, 0, h + 6.8), [3.2, 1.2, .12], '#cf5861', r);
    } else if (building.type === 'mine') {
      box(local(0, -d*.53, 2.6), [w*.66, 4.2, .5], '#36363b', r);
      box(local(-w*.27, -d*.58, 3.4), [.55, 5.7, .55], '#b38a54', r);
      box(local(w*.27, -d*.58, 3.4), [.55, 5.7, .55], '#b38a54', r);
      box(local(0, -d*.58, 5.55), [w*.68, .55, .55], '#b38a54', r);
      box(local(w*.46, d*.16, h + 3.2), [.85, 5.2, .85], '#4d5259', r);
      box(local(w*.46, d*.16, h + 6.05), [1.4, .32, 1.4], '#9ba1a7', r);
      box(local(-w*.52, d*.52, 1.35), [2.4, .5, 1.6], '#c9a64e', r);
    } else if (building.type === 'forge') {
      box(local(w*.42, d*.18, h + 3.5), [1, 5.8, 1], '#454b55', r);
      box(local(w*.42, d*.18, h + 6.55), [1.6, .35, 1.6], '#9a9fa5', r);
      box(local(-w*.38, -d*.55, 1.7), [3.8, 1.3, .7], '#2e3036', r);
      box(local(-w*.38, -d*.6, 2.65), [2.3, .28, .8], '#d99242', r);
      box(local(.8, -d*.64, 4.4), [3.8, .28, .28], '#d4d7dc', r + .45);
    } else if (building.type === 'ranch') {
      for (const x of [-w*.52, 0, w*.52]) box(local(x, d*.62, 1.7), [.28, 2.2, .28], '#765138', r);
      box(local(0, d*.62, 2.45), [w + 1, .22, .22], '#765138', r);
      box(local(-w*.38, d*.35, 1.45), [2.4, .9, 1.3], '#f0d17a', r);
      box(local(w*.34, d*.36, 1.4), [1.5, .8, 1.1], '#ffffff', r);
    } else if (building.type === 'royalGarden') {
      box(local(0, 0, 1.5), [w - 1, .35, d - 1], '#578e5c', r);
      for (const [x, z] of [[-w*.28,-d*.22],[w*.28,-d*.22],[-w*.28,d*.22],[w*.28,d*.22]]) pyramid(local(x, z, 1.8), 2.2, '#3d8a5a');
    }
    const upgrade = Math.min(3, state.rebirths || 0);
    if (upgrade >= 1) box(local(w*.36, d*.28, h + 3.2), [.65, 4.5, .65], '#5d626a', r);
    if (upgrade >= 2) { box(local(-w*.42, 0, h + 3.2), [.18, 4.2, .18], '#d9b45f', r); box(local(-w*.42, 0, h + 4.55), [2.2, 1.1, .12], '#cf5861', r); }
    if (upgrade >= 3) { box(local(0, 0, h + 4.3), [2.2, 3.2, 2.2], '#c9b077', r); prism(local(0, 0, 0), 3.2, 3.2, h + 5.7, h + 7.3, '#79534e', r); }
    const colors = ['#f1b36e', '#86c8d8', '#e8899b'];
    for (let i = 0; i < Math.min(item.people, 3); i++) {
      const phase = worldTime * .75 + i * 2.2 + (building.id ? building.id.charCodeAt(0) % 7 : 0);
      const x = Math.cos(phase) * w * .66, z = Math.sin(phase) * d * .66, bob = Math.sin(phase * 2) * .12;
      box(local(x, z, 1.85 + bob), [.8, 1.9, .8], colors[i], r);
      box(local(x, z, 3.1 + bob), [.95, .72, .95], '#f8d0a7', r);
    }
  }
  function drawWorldArt() {
    const centerX = MAP_GRID.minX + (MAP_GRID.columns - 1) * MAP_GRID.tile / 2;
    const centerZ = MAP_GRID.minZ + (MAP_GRID.rows - 1) * MAP_GRID.tile / 2;
    for (let row = 1; row < MAP_GRID.rows; row++) {
      const z = MAP_GRID.minZ + (row - .5) * MAP_GRID.tile;
      box({x:centerX,y:.65,z}, [MAP_GRID.columns * MAP_GRID.tile,.18,4], '#b7986f');
    }
    for (let column = 1; column < MAP_GRID.columns; column++) {
      const x = MAP_GRID.minX + (column - .5) * MAP_GRID.tile;
      box({x,y:.65,z:centerZ}, [4,.18,MAP_GRID.rows * MAP_GRID.tile], '#ad8e68');
    }
    box({x:153,y:8,z:0}, [62,16,14], '#535e70');
    for (const x of [123,183]) { box({x,y:11,z:-8}, [12,22,12], '#657183'); prism({x,y:0,z:-8}, 16,16,22,29,'#693f56'); }
    box({x:153,y:5.5,z:-7.3}, [10,11,.5], '#513322');
    for (const [x,z,size] of [[-132,-65,6],[-132,63,6],[132,-64,6],[132,63,6],[0,74,5],[-109,63,4],[113,69,4]]) { box({x,y:size*.9,z}, [1.2,size*1.8,1.2], '#63422a'); pyramid({x,y:size*1.7,z}, size, '#3d7d4f'); }
    box({x:126,y:1,z:0}, [13,2,13], '#aeb8c3'); box({x:126,y:2.12,z:0}, [10,.25,10], '#5db7dc'); box({x:126,y:4,z:0}, [1.4,4,1.4], '#c9d3dd');
  }
  function drawDecorations() {
    const ornaments = [[-19, 18], [19, -18], [-18, -19], [18, 19]];
    LANDS.filter(owned).forEach((land, index) => {
      const [ox, oz] = ornaments[index % ornaments.length];
      const x = land.x + ox, z = land.z + oz;
      if (index % 2 === 0) {
        box({x, y:2.5, z}, [.8, 4, .8], '#65422b');
        pyramid({x, y:4.2, z}, 3.5, '#3f8755');
      } else {
        box({x, y:1.1, z}, [3.1, .5, 1.1], '#8b613f');
        box({x, y:1.75, z}, [3.1, .18, .18], '#d1ad70');
      }
      if (index % 3 === 0) {
        box({x:land.x + ox * .55, y:1.1, z:land.z + oz * .55}, [1.4, 1.1, 1.4], '#a6703f');
        box({x:land.x + ox * .55, y:1.9, z:land.z + oz * .55}, [1.7, .25, 1.7], '#d3b065');
      }
    });
  }
  function render() {
    // The sea is intentionally a screen-space background. A giant 3D water
    // plane cannot be depth-sorted correctly against every individual tile.
    const water = ctx.createLinearGradient(0, 0, 0, viewH);
    water.addColorStop(0, '#3b89ae'); water.addColorStop(1, '#236783');
    ctx.fillStyle = water; ctx.fillRect(0, 0, viewW, viewH);
    faces.length = 0; hitTiles.length = 0;
    faceLayer = 0; LANDS.forEach(drawLand);
    faceLayer = 1; drawWorldArt(); drawDecorations();
    faceLayer = 2; LANDS.forEach(drawLandBorder);
    faceLayer = 3; state.buildings.forEach(drawBuilding);
    if (hoveredPlacement && hoveredPlacement.valid && selectedBuilding && isBuildingUnlocked(BUILDINGS[selectedBuilding])) {
      faceLayer = 4;
      drawBuilding({ type: selectedBuilding, x: hoveredPlacement.x, z: hoveredPlacement.z, rotation: state.rotation }, true);
    }
    faces.sort((a,b) => a.layer - b.layer || b.depth - a.depth);
    for (const face of faces) {
      ctx.beginPath(); face.points.forEach((point,index) => index ? ctx.lineTo(point.x,point.y) : ctx.moveTo(point.x,point.y)); ctx.closePath();
      ctx.globalAlpha = face.alpha; ctx.fillStyle = face.color; ctx.fill();
      if (face.outline) { ctx.strokeStyle = face.outline; ctx.lineWidth = 1; ctx.stroke(); }
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(render);
  }

  function slotsFor(land) {
    return [[-13,-13],[1,-13],[13,-13],[-13,3],[1,3],[13,3],[-7,14],[8,14]].map(([x,z]) => ({x:land.x+x,z:land.z+z}));
  }
  function buildOn(placement) {
    if (!selectedBuilding) return;
    const land = placement && LANDS.find((entry) => entry.id === placement.landId), item = BUILDINGS[selectedBuilding];
    if (!isBuildingUnlocked(item)) { selectedBuilding = null; updateUI(); return toast(`이 건물은 왕국력 ${unlockYear(item)}년에 해금됩니다.`); }
    if (!placement || !land || !placement.valid) return toast('소유한 토지의 빈 위치를 선택하세요.');
    if (!owned(land)) return toast('먼저 이 영토를 구매해야 합니다.');
    if (state.cash < item.price) return toast('골드가 부족합니다.');
    if ((state.researchTokens || 0) < (item.researchCost || 0)) return toast(`연구 토큰 ${item.researchCost}개가 필요합니다.`);
    const slot = placement && placement.valid ? placement : null;
    if (!slot) return toast('이 영토는 이미 가득 찼습니다.');
    state.cash -= item.price; state.researchTokens -= item.researchCost || 0; state.buildings.push({ id: crypto.randomUUID(), type: selectedBuilding, landId: land.id, x: slot.x, z: slot.z, rotation: state.rotation, tax: 0 });
    selectedBuilding = null; hoveredLand = null; hoveredPlacement = null;
    toast(`${item.name}이(가) 실루엣 위치에 설치되었습니다.`); save(true); updateUI();
  }
  function deleteOn(landId) {
    const index = state.buildings.map((building, i) => ({ building, i })).filter((entry) => entry.building.landId === landId).at(-1);
    if (!index) return toast('이 토지에는 삭제할 건물이 없습니다.');
    const item = BUILDINGS[index.building.type]; const refund = Math.floor(item.price * .5);
    state.buildings.splice(index.i, 1); state.cash += refund;
    toast(`${item.name}을(를) 철거하고 ${format(refund)} 골드를 돌려받았습니다.`); save(true); updateUI();
  }
  function rebirthRequirements() {
    const level = state.rebirths || 0;
    return { cash: Math.floor(5000 * Math.pow(1.6, level)), population: 30 + level * 15, lands: Math.min(LANDS.length, 6 + level * 2) };
  }
  function rebirth() {
    const { cash: requiredCash, population: requiredPopulation, lands: requiredLands } = rebirthRequirements();
    if (state.cash < requiredCash || population() < requiredPopulation || state.owned.length < requiredLands) return toast(`환생에는 ${format(requiredCash)} 골드 · 주민 ${requiredPopulation}명 · 영토 ${requiredLands}곳이 필요합니다.`);
    if (!window.confirm('환생하면 왕국의 건물과 영토가 초기화됩니다. 대신 모든 골드 수입이 영구적으로 10% 증가하고 건물이 발전합니다. 계속할까요?')) return;
    const rebirths = (state.rebirths || 0) + 1;
    state = { ...structuredClone(START), rebirths, year: (state.year || 1) + 1, researchTokens: state.researchTokens || 0 };
    selectedBuilding = null; selectedLand = 'core1'; deleteMode = false;
    toast(`환생 완료! 왕국력 ${state.year}년 · 수입 +${rebirths * 10}% · 건물 발전 ${Math.min(3, rebirths)}단계`); save(true); updateUI();
  }
  function purchaseLand(id) {
    const land = LANDS.find((entry) => entry.id === id); if (owned(land)) return;
    if (state.cash < land.price) return toast('골드가 부족합니다.');
    state.cash -= land.price; state.owned.push(id); selectedLand = id; toast(`${land.name} 영토를 확보했습니다.`); save(true); updateUI();
  }
  function takeTax(buildings, maximum = Infinity) {
    let remaining = Math.min(Math.floor(buildings.reduce((sum, building) => sum + building.tax, 0)), maximum);
    const collected = remaining;
    for (const building of buildings) {
      const taken = Math.min(building.tax, remaining);
      building.tax -= taken; remaining -= taken;
      if (remaining <= 0) break;
    }
    return collected;
  }
  function collectTax(message = true) {
    const amount = takeTax(state.buildings);
    if (amount < 1) { if (message) toast('아직 수금할 세금이 없습니다.'); return false; }
    state.cash += amount;
    if (message) toast(`${format(amount)} 골드를 수금했습니다.`); save(true); updateUI(); return true;
  }

  function updateUI() {
    if (selectedBuilding && !isBuildingUnlocked(BUILDINGS[selectedBuilding])) selectedBuilding = null;
    els.cash.textContent = format(state.cash); els.population.textContent = format(population()); els.rebirths.textContent = format(state.rebirths || 0); els.year.textContent = `${kingdomYear()}년`; els.researchTokens.textContent = format(state.researchTokens || 0); els.storedTax.textContent = formatTax(storedTax());
    const rebirthNeed = rebirthRequirements(), rebirthButton = $('#rebirthButton');
    rebirthButton.textContent = `♛ ${format(rebirthNeed.cash)}G · ${rebirthNeed.lands}땅`;
    rebirthButton.title = `다음 환생: ${format(rebirthNeed.cash)} 골드 · 주민 ${rebirthNeed.population}명 · 영토 ${rebirthNeed.lands}곳`;
    els.categoryList.innerHTML = ''; CATEGORIES.forEach((category) => {
      const button = document.createElement('button'); button.className = `category-chip ${selectedCategory === category.id ? 'active' : ''}`; button.textContent = category.name;
      button.onclick = () => { selectedCategory = category.id; updateUI(); }; els.categoryList.append(button);
    });
    const buildingEntries = Object.entries(BUILDINGS)
      .filter(([, item]) => selectedCategory === 'all' || item.category === selectedCategory)
      .sort(([, a], [, b]) => Number(isBuildingUnlocked(b)) - Number(isBuildingUnlocked(a)) || unlockYear(a) - unlockYear(b) || a.price - b.price);
    els.buildingList.innerHTML = ''; buildingEntries.forEach(([id,item]) => {
      const unlocked = isBuildingUnlocked(item), requiredYear = unlockYear(item), tokenCost = item.researchCost || 0;
      const button = document.createElement('button'); button.className = `building-card ${selectedBuilding === id ? 'selected':''} ${unlocked ? '' : 'locked'}`; button.disabled = !unlocked;
      const detail = unlocked ? `세금 +${item.income} / 10초 · 주민 ${item.people}` : `🔒 왕국력 ${requiredYear}년 해금`;
      const price = unlocked ? `${format(item.price)} ✦${tokenCost ? `<small>🧪 ${tokenCost}</small>` : ''}` : `${requiredYear}년${tokenCost ? `<small>🧪 ${tokenCost}</small>` : ''}`;
      button.innerHTML = `<span class="card-icon">${item.icon}</span><span><span class="card-title">${item.name}</span><span class="card-detail">${detail}</span></span><b class="card-price">${price}</b>`;
      button.onclick = () => { selectedBuilding = selectedBuilding === id ? null : id; state.rotation = 0; updateUI(); }; els.buildingList.append(button);
    });
    const nextBuilding = Object.values(BUILDINGS).filter((item) => unlockYear(item) > kingdomYear()).sort((a, b) => unlockYear(a) - unlockYear(b))[0];
    els.unlockInfo.textContent = nextBuilding ? `왕국력 ${kingdomYear()}년 · 총 ${CATALOG_BUILDING_COUNT}개 시대 건물 · 다음 해금: ${unlockYear(nextBuilding)}년 ${nextBuilding.name}` : `왕국력 ${kingdomYear()}년 · 시대 건물 ${CATALOG_BUILDING_COUNT}개를 모두 해금했습니다.`;
    els.landList.innerHTML = ''; LANDS.forEach((land) => {
      const button = document.createElement('button'); const active = owned(land); button.className = `land-card ${selectedLand===land.id?'selected':''}`;
      button.innerHTML = `<span class="card-icon">${active?'🌿':'🔒'}</span><span><span class="card-title">${land.name}</span><span class="card-detail">${active ? `${buildingCount(land.id)}채 건물` : '새로운 건설 부지'}</span></span><b class="card-price">${active?'보유':`${format(land.price)} ✦`}</b>`;
      button.onclick = () => active ? (selectedLand=land.id, updateUI()) : purchaseLand(land.id); els.landList.append(button);
    });
    const mission = MISSIONS[state.missionIndex];
    if (mission) {
      const progress = missionProgress(mission);
      els.missionTitle.textContent = mission.title;
      els.missionText.textContent = `${Math.min(progress, mission.goal)} / ${mission.goal} · 보상 ${format(mission.reward)} 골드`;
      els.missionProgress.style.width = `${Math.min(100, progress / mission.goal * 100)}%`;
      els.claimMission.disabled = progress < mission.goal;
      els.claimMission.textContent = `의뢰 ${state.missionIndex + 1}/${MISSIONS.length}`;
    } else {
      els.missionTitle.textContent = '모든 왕실 의뢰를 달성했습니다!';
      els.missionText.textContent = 'Crownvale의 전설이 시작됩니다.';
      els.missionProgress.style.width = '100%'; els.claimMission.disabled = true; els.claimMission.textContent = '완료';
    }
    const bonus = ((workerIncomeMultiplier() - 1) * 100).toFixed(1), rebirthBonus = (state.rebirths || 0) * 10;
    els.workerInfo.textContent = state.autoCollect ? `수집자 ${state.workers}/20명 · 자동 수금 · 세금 수입 +${bonus}%` : `수집자 ${state.workers}/20명 · 세금 수입 +${bonus}% · 환생 +${rebirthBonus}%`;
    const hireButton = $('#hireWorker');
    hireButton.disabled = state.workers >= 20;
    hireButton.innerHTML = state.workers >= 20 ? '수집자 최대 고용 완료' : `수집자 고용 <span>${format(workerCost())} 골드</span>`;
    els.researchInfo.textContent = `보유 연구 토큰 ${format(state.researchTokens || 0)}개 · 왕국력 ${kingdomYear()}년 연구 보상 ${researchReward()}개`;
    $('#conductResearch').innerHTML = `연구 수행 <span>${format(researchPrice())} 골드</span>`;
    $('#rotationStep').value = String(state.rotationStep || 45);
    const item = selectedBuilding && BUILDINGS[selectedBuilding]; els.selectionName.textContent = deleteMode ? '삭제 모드' : (item ? item.name : '건물을 선택하세요'); els.selectionMeta.textContent = deleteMode ? '토지를 클릭하면 마지막 건물을 50% 환불로 철거합니다.' : (item ? `${format(item.price)} 골드 · 연구 ${item.researchCost || 0} · 세금 ${item.income}/10초 · 회전 ${state.rotation}°` : `건설 메뉴에서 건물을 선택 · 환생 발전 ${Math.min(3, state.rebirths || 0)}단계`);
    $('#deleteButton').classList.toggle('active', deleteMode);
  }

  document.querySelectorAll('.tab').forEach((tab) => tab.onclick = () => { activeTab = tab.dataset.tab; document.querySelectorAll('.tab').forEach((button)=>button.classList.toggle('active',button===tab)); document.querySelectorAll('.panel').forEach((panel)=>panel.classList.toggle('active',panel.id===`${activeTab}Panel`)); });
  $('#rotateButton').onclick = () => { if (!selectedBuilding) return toast('먼저 건물을 선택하세요.'); state.rotation = (state.rotation + (state.rotationStep || 45)) % 360; updateUI(); };
  $('#rotationStep').onchange = (event) => { state.rotationStep = Number(event.target.value); save(true); updateUI(); };
  $('#deleteButton').onclick = () => { deleteMode = !deleteMode; if (deleteMode) selectedBuilding = null; updateUI(); };
  $('#rebirthButton').onclick = rebirth;
  $('#cancelButton').onclick = () => { selectedBuilding = null; deleteMode = false; updateUI(); };
  $('#saveButton').onclick = () => save();
  $('#collectTax').onclick = () => collectTax();
  $('#conductResearch').onclick = conductResearch;
  $('#hireWorker').onclick = () => { const cost = workerCost(); if (state.workers >= 20) return toast('수집자는 최대 20명입니다.'); if (state.cash < cost) return toast('골드가 부족합니다.'); state.cash -= cost; state.workers++; toast(`새 세금 수집자가 도착했습니다. 세금 수입 +0.5%`); save(true); updateUI(); };
  $('#unlockAuto').onclick = () => { if (state.autoCollect) return toast('이미 왕실 자동 수금이 활성화되어 있습니다.'); if (state.cash < 1200) return toast('골드가 부족합니다.'); state.cash -= 1200; state.autoCollect = true; toast('왕실 자동 수금이 시작되었습니다.'); save(true); updateUI(); };
  els.claimMission.onclick = () => {
    const mission = MISSIONS[state.missionIndex];
    if (!mission || missionProgress(mission) < mission.goal) return;
    state.cash += mission.reward; state.missionIndex++;
    toast(`왕실이 ${format(mission.reward)} 골드를 하사했습니다!`); save(true); updateUI();
  };

  function tileAtPoint(x, y) {
    return [...hitTiles].sort((a,b)=>a.depth-b.depth).find((entry) => pointInPolygon(x, y, entry.points));
  }
  canvas.addEventListener('click', (event) => {
    const tile = tileAtPoint(event.clientX, event.clientY);
    if (deleteMode) { if (tile) deleteOn(tile.id); return; }
    if (selectedBuilding) { buildOn(placementFromScreen(event.clientX, event.clientY)); return; }
    if (tile) { selectedLand = tile.id; updateUI(); }
  });
  canvas.addEventListener('contextmenu', (event) => event.preventDefault());
  canvas.addEventListener('pointerdown', (event) => {
    if (event.button !== 2) return;
    event.preventDefault();
    cameraDrag = { pointerId: event.pointerId, x: event.clientX, y: event.clientY };
    canvas.setPointerCapture(event.pointerId);
  });
  canvas.addEventListener('pointermove', (event) => {
    if (!cameraDrag || event.pointerId !== cameraDrag.pointerId) {
      hoveredPlacement = placementFromScreen(event.clientX, event.clientY);
      hoveredLand = hoveredPlacement ? hoveredPlacement.landId : null;
      canvas.style.cursor = selectedBuilding ? (hoveredPlacement && hoveredPlacement.valid ? 'crosshair' : 'not-allowed') : 'default';
      return;
    }
    const dx = event.clientX - cameraDrag.x, dy = event.clientY - cameraDrag.y;
    const speed = CAMERA_DRAG_SPEED * (1400 / camera.zoom);
    const c = Math.cos(camera.yaw), s = Math.sin(camera.yaw);
    camera.x += (-dx * c + dy * s) * speed;
    camera.z += (dx * s + dy * c) * speed;
    clampCamera();
    cameraDrag.x = event.clientX; cameraDrag.y = event.clientY;
  });
  canvas.addEventListener('pointerup', (event) => {
    if (!cameraDrag || event.pointerId !== cameraDrag.pointerId) return;
    canvas.releasePointerCapture(event.pointerId); cameraDrag = null;
  });
  canvas.addEventListener('pointerleave', () => { if (!cameraDrag) { hoveredLand = null; hoveredPlacement = null; } });
  canvas.addEventListener('wheel', (event) => { event.preventDefault(); camera.zoom = Math.max(180, Math.min(1900, camera.zoom - event.deltaY * .7)); }, { passive: false });
  window.addEventListener('keydown', (event) => {
    const key = event.key.toLowerCase();
    if (key === 'q') camera.yaw -= .08;
    if (key === 'e') camera.yaw += .08;
    if (key === 'r' && selectedBuilding) { state.rotation = (state.rotation + (state.rotationStep || 45)) % 360; updateUI(); }
    if (['w', 'a', 's', 'd'].includes(key) && !event.repeat) { pressedKeys.add(key); event.preventDefault(); }
    if (event.key === 'Escape') { selectedBuilding = null; deleteMode = false; updateUI(); }
  });
  window.addEventListener('keyup', (event) => pressedKeys.delete(event.key.toLowerCase()));
  window.addEventListener('blur', () => pressedKeys.clear());
  document.addEventListener('visibilitychange', () => { if (document.hidden) pressedKeys.clear(); });
  function pointInPolygon(x,y,points) { let inside=false; for(let i=0,j=points.length-1;i<points.length;j=i++) { const a=points[i],b=points[j]; if (((a.y>y)!==(b.y>y)) && (x < (b.x-a.x)*(y-a.y)/(b.y-a.y)+a.x)) inside=!inside; } return inside; }

  function tick(now) {
    const dt = Math.min(.25,(now-lastTime)/1000); lastTime=now;
    worldTime += dt;
    const multiplier = workerIncomeMultiplier();
    for (const building of state.buildings) { const item=BUILDINGS[building.type]; building.tax = Math.min(item.income * 20 * multiplier, building.tax + item.income * multiplier * dt / 10); }
    els.storedTax.textContent = formatTax(storedTax());
    autoTimer += dt;
    const move = CAMERA_KEYBOARD_SPEED * dt * (1400 / camera.zoom), c = Math.cos(camera.yaw), s = Math.sin(camera.yaw);
    if (pressedKeys.has('w')) { camera.x += s * move; camera.z += c * move; }
    if (pressedKeys.has('s')) { camera.x -= s * move; camera.z -= c * move; }
    if (pressedKeys.has('a')) { camera.x -= c * move; camera.z += s * move; }
    if (pressedKeys.has('d')) { camera.x += c * move; camera.z -= s * move; }
    if (pressedKeys.size) clampCamera();
    if (autoTimer >= 10) { autoTimer = 0; if (state.autoCollect) collectTax(false); else if (state.workers > 0) { const targets=state.buildings.slice(0,state.workers); const amount=takeTax(targets); if (amount) state.cash += amount; } save(true); updateUI(); }
    requestAnimationFrame(tick);
  }
  updateUI(); render(); requestAnimationFrame(tick);
})();
