(() => {
  'use strict';

  const canvas = document.querySelector('#world');
  const ctx = canvas.getContext('2d');
  const interiorCanvas = document.querySelector('#interiorCanvas');
  const interiorCtx = interiorCanvas.getContext('2d');
  const $ = (selector) => document.querySelector(selector);
  const els = {
    cash: $('#cash'), population: $('#population'), rebirths: $('#rebirths'), year: $('#year'), researchTokens: $('#researchTokens'), dayIcon: $('#dayIcon'), dayClock: $('#dayClock'), productionStatus: $('#productionStatus'), categoryList: $('#categoryList'), buildingList: $('#buildingList'), landList: $('#landList'),
    selectionName: $('#selectionName'), selectionMeta: $('#selectionMeta'), workerInfo: $('#workerInfo'), employmentInfo: $('#employmentInfo'), jobList: $('#jobList'),
    storedTax: $('#storedTax'), missionTitle: $('#missionTitle'), missionText: $('#missionText'), unlockInfo: $('#unlockInfo'), researchInfo: $('#researchInfo'), researchTimer: $('#researchTimer'), researchProgress: $('#researchProgress'),
    missionProgress: $('#missionProgress'), claimMission: $('#claimMission'), toast: $('#toast'), interiorModal: $('#interiorModal'), interiorTitle: $('#interiorTitle'), interiorMeta: $('#interiorMeta'), interiorButton: $('#interiorButton'),
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
    dirtRoad: { name: '흙길', icon: '🟫', category: 'road', price: 15, income: 0, people: 0, body: '#9a7048', trim: '#c19868', size: [20, .2, 4], roadStyle: 'dirt', noInterior: true },
    gravelRoad: { name: '자갈길', icon: '🪨', category: 'road', price: 30, income: 0, people: 0, body: '#8d8a82', trim: '#b9b4a9', size: [20, .2, 4], roadStyle: 'gravel', unlockYear: 2, noInterior: true },
    stoneRoad: { name: '석재 포장길', icon: '▦', category: 'road', price: 55, income: 0, people: 0, body: '#777a7d', trim: '#b8b3a8', size: [20, .2, 5], roadStyle: 'stone', unlockYear: 3, noInterior: true },
    royalRoad: { name: '왕실 대로', icon: '♛', category: 'road', price: 90, income: 0, people: 0, body: '#8c6d66', trim: '#e2bf62', size: [20, .2, 6], roadStyle: 'royal', unlockYear: 5, noInterior: true },
    modernRoad: { name: '현대 도로', icon: '🛣️', category: 'road', price: 140, income: 0, people: 0, body: '#3f464d', trim: '#edf0d2', size: [20, .2, 6], roadStyle: 'modern', unlockYear: 7, noInterior: true },
    futureRoad: { name: '미래 광자도로', icon: '🔷', category: 'road', price: 230, income: 0, people: 0, body: '#263f62', trim: '#67ecff', size: [20, .2, 6], roadStyle: 'future', unlockYear: 10, researchCost: 8, noInterior: true },
    plainsWindmill: { name:'평원 풍차 제분소', icon:'🌬️', category:'production', price:620, people:3, body:'#d7c18c', roof:'#8b5a3e', size:[14,8,12], unlockYear:2, requiredTerrain:'plains', terrainModel:'windmill' },
    cavalryRanch: { name:'왕실 기병 목장', icon:'🐎', category:'residential', price:1100, people:8, body:'#c69a63', roof:'#704936', size:[16,8,14], unlockYear:4, requiredTerrain:'plains', terrainModel:'cavalry' },
    royalGranary: { name:'대평원 왕실 곡물탑', icon:'🌾', category:'production', price:1600, people:6, body:'#c7ae76', roof:'#6b5546', size:[16,10,14], unlockYear:6, requiredTerrain:'plains', terrainModel:'silo' },
    fishingPier: { name:'강변 어업 부두', icon:'🎣', category:'production', price:420, people:3, body:'#a87952', roof:'#3e6878', size:[16,5,12], requiredTerrain:'river', terrainModel:'fishing' },
    watermill: { name:'강물 물레방앗간', icon:'🛞', category:'production', price:900, people:5, body:'#b2875e', roof:'#67483d', size:[14,7,12], unlockYear:3, requiredTerrain:'river', terrainModel:'watermill' },
    riverHouse: { name:'수상 가옥 마을', icon:'🏠', category:'residential', price:1250, people:10, body:'#d0a76f', roof:'#486b76', size:[16,7,14], unlockYear:5, requiredTerrain:'river', terrainModel:'riverhouse' },
    lumberCamp: { name:'깊은 숲 벌목장', icon:'🪵', category:'production', price:500, people:4, body:'#98643e', roof:'#4c633f', size:[14,6,12], requiredTerrain:'forest', terrainModel:'lumber' },
    hunterLodge: { name:'사냥꾼 산장', icon:'🏹', category:'residential', price:780, people:6, body:'#9f7048', roof:'#435a3c', size:[13,7,11], unlockYear:3, requiredTerrain:'forest', terrainModel:'hunter' },
    forestShrine: { name:'고대 숲 제단', icon:'🗿', category:'decoration', price:950, people:0, body:'#71846a', roof:'#3f6548', size:[12,5,12], unlockYear:5, requiredTerrain:'forest', terrainModel:'shrine' },
    quarry: { name:'산악 채석장', icon:'🪨', category:'production', price:650, people:4, body:'#85827c', roof:'#55575a', size:[15,6,13], unlockYear:2, requiredTerrain:'mountain', terrainModel:'quarry' },
    deepMountainMine: { name:'심층 산악 광산', icon:'⛏️', category:'production', price:1100, people:6, body:'#62666b', roof:'#3c3e45', size:[16,9,14], unlockYear:4, requiredTerrain:'mountain', terrainModel:'deepmine' },
    cliffFortress: { name:'절벽 왕국 요새', icon:'🏯', category:'landmark', price:2200, people:8, body:'#8c9193', roof:'#4b5060', size:[18,12,16], unlockYear:6, requiredTerrain:'mountain', terrainModel:'clifffort' },
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
  // Buildings return 10% of their purchase price every ten seconds. This
  // makes every more expensive building an unambiguous income upgrade while
  // keeping the catalogue display and the actual tax calculation identical.
  const BUILDING_INCOME_RATE = .1;
  Object.values(BUILDINGS).forEach((item) => {
    if(item.category==='landmark') item.price=Math.max(5000,Math.round(item.price*6/100)*100);
    const categoryBonus=item.category==='production'?.01:item.category==='decoration'?.005:0;
    item.income = item.category === 'road' ? 0 : Math.max(1, Math.round(item.price * (BUILDING_INCOME_RATE+categoryBonus)));
  });
  const CATALOG_BUILDING_COUNT = Object.values(BUILDINGS).filter((item) => item.catalog).length;
  const CATEGORIES = [{ id: 'all', name: '전체' }, { id: 'terrain', name: '지형 전용' }, { id: 'residential', name: '주거' }, { id: 'production', name: '생산' }, { id: 'landmark', name: '랜드마크' }, { id: 'decoration', name: '장식' }, { id: 'road', name: '길' }];
  const MISSIONS = [
    { id: 'homes', title: '주거 건물 3채를 건설하세요', goal: 3, reward: 450 },
    { id: 'roads', title: '왕국에 길 5조각을 연결하세요', goal: 5, reward: 550 },
    { id: 'lands', title: '새 영토 2곳을 확보하세요', goal: 5, reward: 700 },
    { id: 'production', title: '생산 건물 2채를 건설하세요', goal: 2, reward: 900 },
    { id: 'decorations', title: '장식 시설 3개를 설치하세요', goal: 3, reward: 1000 },
    { id: 'workers', title: '세금 수집자 3명을 고용하세요', goal: 3, reward: 1100 },
    { id: 'research', title: '연구 토큰 3개를 확보하세요', goal: 3, reward: 1300 },
    { id: 'income', title: '10초 수입을 200으로 늘리세요', goal: 200, reward: 1500 },
    { id: 'homes', title: '주거 건물 8채를 건설하세요', goal: 8, reward: 1800 },
    { id: 'lands', title: '영토 12곳을 확보하세요', goal: 12, reward: 2300 },
    { id: 'production', title: '생산 건물 6채를 운영하세요', goal: 6, reward: 2800 },
    { id: 'population', title: '주거 건물로 주민 30명을 달성하세요', goal: 30, reward: 3200 },
    { id: 'landmarks', title: '첫 랜드마크를 건설하세요', goal: 1, reward: 4500 },
    { id: 'roads', title: '길 20조각으로 왕도를 만드세요', goal: 20, reward: 3800 },
    { id: 'income', title: '10초 수입을 1,000으로 늘리세요', goal: 1000, reward: 6000 },
    { id: 'research', title: '연구 토큰 10개를 확보하세요', goal: 10, reward: 6500 },
    { id: 'population', title: '주민 60명을 달성하세요', goal: 60, reward: 7200 },
    { id: 'landmarks', title: '5칸 간격으로 랜드마크 2개를 세우세요', goal: 2, reward: 10000 },
    { id: 'lands', title: '대왕국 영토 30곳을 확보하세요', goal: 30, reward: 12000 },
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
  const TERRAIN_INFO = {
    plains:{name:'평원',icon:'🌿',owned:'#5b9856',locked:'#365c4a'},
    forest:{name:'숲',icon:'🌲',owned:'#3f8150',locked:'#294f3d'},
    mountain:{name:'산지',icon:'⛰️',owned:'#77766e',locked:'#4c514d'},
    river:{name:'강',icon:'🌊',owned:'#3b91b0',locked:'#285d72'},
  };
  const PRESET_TERRAINS={core6:'forest',pass2:'river',pass3:'mountain',north1:'forest',north4:'mountain',south1:'river',south3:'forest',south4:'mountain'};
  LANDS.forEach((land)=>{ land.terrain=PRESET_TERRAINS[land.id]||'plains'; });
  const MAP_GRID = { columns: 28, rows: 16, minX: -672, minZ: -360, tile: 48 };
  function terrainForCell(column,row) {
    const riverColumn=9+Math.floor(row/4);
    if(column===riverColumn) return 'river';
    if((column<7&&row>3&&row<13)||(column>14&&column<20&&row>9)) return 'forest';
    if((column>21&&row<8)||(row>12&&column>9)) return 'mountain';
    return 'plains';
  }
  const occupiedLandCoordinates = new Set(LANDS.map((land) => `${land.x},${land.z}`));
  for (let row = 0; row < MAP_GRID.rows; row++) {
    for (let column = 0; column < MAP_GRID.columns; column++) {
      const x = MAP_GRID.minX + column * MAP_GRID.tile, z = MAP_GRID.minZ + row * MAP_GRID.tile;
      if (occupiedLandCoordinates.has(`${x},${z}`)) continue;
      const distance = Math.abs(x) / MAP_GRID.tile + Math.abs(z) / MAP_GRID.tile;
      const terrain=terrainForCell(column,row), terrainInfo=TERRAIN_INFO[terrain];
      LANDS.push({ id: `realm_${column + 1}_${row + 1}`, name: `${terrainInfo.name} 영토 ${column + 1}-${row + 1}`, x, z, terrain, price: 700 + Math.floor(distance * 140), owned: false });
    }
  }
  const START = { cash: 1000, owned: ['core1', 'core2', 'core3'], buildings: [], workers: 0, autoCollect: false, rotation: 0, rotationStep: 45, missionIndex: 0, rebirths: 0, year: 1, researchTokens: 0, researchCount: 0, researchStartedAt: 0, researchEndsAt: 0, researchDuration: 0, researchPendingReward: 0 };
  const storageKey = 'crownvale-browser-v1';
  let state = load();
  let selectedBuilding = null;
  let selectedPlacedBuilding = null;
  let interiorBuilding = null;
  const interiorView = { yaw:Math.PI/4, tilt:.68, zoom:1, drag:null };
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
  const CAMERA_MIN_ZOOM = 180;
  const CAMERA_MAX_ZOOM = 3600;
  const CAMERA_ZOOM_STEP = 1.2;
  const DAY_CYCLE_SECONDS = 96;
  const MAX_VISIBLE_RESIDENTS = 120;
  const JOB_PROFILES = {
    farm: { name: '농부', icon: '🌾', outdoor: true, color: '#d7b34f' },
    ranch: { name: '목동', icon: '🐑', outdoor: true, color: '#a9c66d' },
    harbor: { name: '항구 노동자', icon: '⚓', outdoor: true, color: '#5aa9c4' },
    market: { name: '상인', icon: '🪙', outdoor: true, color: '#d98755' },
    mine: { name: '광부', icon: '⛏', outdoor: false, color: '#7f8791' },
    forge: { name: '대장장이', icon: '⚒', outdoor: false, color: '#b76b46' },
    warehouse: { name: '창고 노동자', icon: '📦', outdoor: false, color: '#9b7658' },
    plainsWindmill: { name:'제분사', icon:'🌬️', outdoor:false, color:'#c5a45c' },
    royalGranary: { name:'곡물 관리자', icon:'🌾', outdoor:false, color:'#c9a65b' },
    fishingPier: { name:'어부', icon:'🎣', outdoor:true, color:'#54a7bd' },
    watermill: { name:'물레방앗간 제분사', icon:'🛞', outdoor:false, color:'#7aa3ac' },
    lumberCamp: { name:'벌목꾼', icon:'🪵', outdoor:true, color:'#7e9b5c' },
    quarry: { name:'석공', icon:'🪨', outdoor:true, color:'#8d9190' },
    deepMountainMine: { name:'심층 광부', icon:'⛏', outdoor:false, color:'#6f7884' },
    homecraft: { name: '재택 장인', icon: '🧵', outdoor: false, home: true, color: '#b98267' },
    homeoffice: { name: '재택 서기관', icon: '📜', outdoor: false, home: true, color: '#7c93bd' },
    hometech: { name: '재택 기술자', icon: '🛠', outdoor: false, home: true, color: '#69a7a0' },
    homeremote: { name: '원격 연구원', icon: '💻', outdoor: false, home: true, color: '#8a9ee6' },
    default: { name: '생산 노동자', icon: '⚙', outdoor: false, color: '#7797a4' },
  };
  const INTERIOR_ERAS = [
    { label:'초기 목재식', floor:'#8b6846', wall:'#a77f55', accent:'#e1bb6b' },
    { label:'석조 왕국식', floor:'#77746d', wall:'#99978d', accent:'#d4ba7d' },
    { label:'산업 기계식', floor:'#5d6268', wall:'#737a80', accent:'#d38a4d' },
    { label:'현대 도시식', floor:'#506f73', wall:'#71949a', accent:'#77d3cf' },
    { label:'미래 왕국식', floor:'#3b456d', wall:'#596b95', accent:'#8be9ff' },
  ];
  const camera = { x: -24, z: 0, yaw: -0.76, pitch: 1.12, zoom: 500 };
  const hitTiles = [];

  function clockHour() { return (8 + worldTime * 24 / DAY_CYCLE_SECONDS) % 24; }
  function isDaytime() { const hour = clockHour(); return hour >= 6 && hour < 18; }
  function nightStrength() {
    const hour = clockHour();
    if (hour >= 7 && hour < 17) return 0;
    if (hour >= 5 && hour < 7) return 1 - (hour - 5) / 2;
    if (hour >= 17 && hour < 19) return (hour - 17) / 2;
    return 1;
  }
  function updateClockUI() {
    const hour = clockHour(), hours = Math.floor(hour), minutes = Math.floor((hour - hours) * 60);
    const daytime = isDaytime();
    els.dayIcon.textContent = daytime ? '☀' : '☾';
    els.dayClock.textContent = `${daytime ? '낮' : '밤'} ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    els.productionStatus.textContent = daytime ? '생산 가동' : '생산 휴식';
    els.dayClock.closest('.resource').classList.toggle('night', !daytime);
  }

  function cameraMovementScale() {
    // Keep the normal view responsive, then increase screen-space movement
    // progressively while zoomed in so close inspection never feels sluggish.
    const zoomBoost = Math.max(1, Math.sqrt(camera.zoom / 500));
    return (1400 / camera.zoom) * zoomBoost;
  }

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
  function population() { return state.buildings.reduce((total, building) => { const item=BUILDINGS[building.type]; return total+(item.category==='residential'?item.people:0); }, 0); }
  function jobProfile(building) {
    const item = BUILDINGS[building.type], key = item.model || building.type;
    return JOB_PROFILES[key] || JOB_PROFILES.default;
  }
  function homeJobProfile(item) {
    const era = interiorEra(item);
    if (era >= 9) return JOB_PROFILES.homeremote;
    if (era >= 7) return JOB_PROFILES.hometech;
    if (era >= 4) return JOB_PROFILES.homeoffice;
    return JOB_PROFILES.homecraft;
  }
  function homeJobCapacity(item) { return Math.max(1, Math.ceil((item.people || 1) * .35)); }
  function workplaceEntries() {
    const workplaces=[];
    for (const building of state.buildings) {
      const item=BUILDINGS[building.type];
      if (item.category === 'production') workplaces.push({building,profile:jobProfile(building),capacity:Math.max(1,item.people||1)});
      else if (item.category === 'residential') workplaces.push({building,profile:homeJobProfile(item),capacity:homeJobCapacity(item)});
    }
    return workplaces;
  }
  function employmentSummary() {
    const total = population(), workplaces = workplaceEntries();
    const capacity = workplaces.reduce((sum, workplace) => sum + workplace.capacity, 0);
    const employed = Math.min(total, capacity), jobs = new Map();
    let remaining = employed;
    for (const workplace of workplaces) {
      const assigned = Math.min(workplace.capacity, remaining), key = workplace.profile.name;
      workplace.assigned=assigned;
      if (assigned > 0) {
        const current = jobs.get(key) || { ...workplace.profile, count: 0 };
        current.count += assigned; jobs.set(key, current); remaining -= assigned;
      }
    }
    return { total, employed, unemployed: total - employed, capacity, workplaces, jobs: [...jobs.values()] };
  }
  function residentHomeCounts() {
    const homes=state.buildings.filter((building)=>BUILDINGS[building.type].category==='residential'), counts=new Map();
    if(!homes.length) return counts;
    const total=population(), totalWeight=homes.reduce((sum,home)=>sum+Math.max(1,BUILDINGS[home.type].people),0);
    let assigned=0;
    homes.forEach((home,index)=>{
      const count=index===homes.length-1?total-assigned:Math.floor(total*Math.max(1,BUILDINGS[home.type].people)/totalWeight);
      counts.set(home.id,count); assigned+=count;
    });
    return counts;
  }
  function interiorEra(item) { return Math.min(10,Math.max(unlockYear(item),kingdomYear())); }
  function storedTax() { return state.buildings.reduce((total, building) => total + building.tax, 0); }
  function researchIncomeMultiplier() { return 1 + (state.researchTokens || 0) * .5; }
  function landmarkIncomeMultiplier() { return 1 + state.buildings.filter((building)=>BUILDINGS[building.type].category==='landmark').length*.3; }
  function totalIncomeMultiplier() {
    return (1 + (state.workers || 0) * .005) * (1 + (state.rebirths || 0) * .1) * researchIncomeMultiplier() * landmarkIncomeMultiplier();
  }
  function workerCost() { return 600 + (state.workers || 0) * 150; }
  function researchPrice() { return 300 + kingdomYear() * 150 + (state.researchCount || 0) * 50; }
  function researchReward() { return 1 + Math.floor((kingdomYear() - 1) / 2); }
  function researchDurationSeconds() { return Math.min(180, 15 + kingdomYear() * 5 + (state.researchCount || 0) * 3); }
  function researchInProgress() { return Number(state.researchEndsAt) > 0; }
  function formatDuration(milliseconds) {
    const seconds = Math.max(0, Math.ceil(milliseconds / 1000));
    const minutes = Math.floor(seconds / 60), remainder = seconds % 60;
    return minutes ? `${minutes}:${String(remainder).padStart(2, '0')}` : `${remainder}초`;
  }
  function finishResearchIfReady(now = Date.now()) {
    if (!researchInProgress() || now < Number(state.researchEndsAt)) return false;
    const reward = Math.max(1, Number(state.researchPendingReward) || researchReward());
    state.researchTokens = (state.researchTokens || 0) + reward;
    state.researchStartedAt = 0; state.researchEndsAt = 0; state.researchDuration = 0; state.researchPendingReward = 0;
    toast(`연구 완료! 연구 토큰 ${reward}개를 획득했습니다.`);
    save(true); updateUI();
    return true;
  }
  function updateResearchTimerUI(now = Date.now()) {
    const button = $('#conductResearch');
    if (researchInProgress()) {
      const remaining = Math.max(0, Number(state.researchEndsAt) - now);
      const fallbackDuration = Math.max(1, Number(state.researchEndsAt) - Number(state.researchStartedAt || now));
      const duration = Math.max(1, Number(state.researchDuration) || fallbackDuration);
      const progress = Math.max(0, Math.min(100, (1 - remaining / duration) * 100));
      els.researchTimer.textContent = `연구 진행 중 · ${formatDuration(remaining)} 남음`;
      els.researchProgress.style.width = `${progress}%`;
      button.disabled = true;
      button.innerHTML = `연구 진행 중 <span>${formatDuration(remaining)}</span>`;
    } else {
      const duration = researchDurationSeconds() * 1000;
      els.researchTimer.textContent = `예상 연구 시간 ${formatDuration(duration)}`;
      els.researchProgress.style.width = '0%';
      button.disabled = false;
      button.innerHTML = `연구 수행 <span>${format(researchPrice())} 골드</span>`;
    }
  }
  function conductResearch() {
    if (researchInProgress()) return toast('이미 연구가 진행 중입니다.');
    const price = researchPrice(), reward = researchReward(), duration = researchDurationSeconds() * 1000, now = Date.now();
    if (state.cash < price) return toast('연구에 필요한 골드가 부족합니다.');
    state.cash -= price; state.researchCount = (state.researchCount || 0) + 1;
    state.researchStartedAt = now; state.researchEndsAt = now + duration; state.researchDuration = duration; state.researchPendingReward = reward;
    toast(`연구를 시작했습니다. ${formatDuration(duration)} 뒤 연구 토큰 ${reward}개를 획득합니다.`); save(true); updateUI();
  }
  function countCategory(category) { return state.buildings.filter((building) => BUILDINGS[building.type].category === category).length; }
  function incomePerTick() { return state.buildings.reduce((total, building) => total + BUILDINGS[building.type].income, 0) * totalIncomeMultiplier(); }
  function missionProgress(mission) {
    if (!mission) return 0;
    if (mission.id === 'homes') return countCategory('residential');
    if (mission.id === 'lands') return state.owned.length;
    if (mission.id === 'production') return countCategory('production');
    if (mission.id === 'roads') return countCategory('road');
    if (mission.id === 'decorations') return countCategory('decoration');
    if (mission.id === 'workers') return state.workers||0;
    if (mission.id === 'research') return state.researchTokens||0;
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
    const snapStep=item.category==='road'?2:4, snap = (value) => Math.round(value / snapStep) * snapStep;
    const margin = 1;
    const x = Math.max(land.x - 24 + width * .5 + margin, Math.min(land.x + 24 - width * .5 - margin, snap(world.x)));
    const z = Math.max(land.z - 24 + depth * .5 + margin, Math.min(land.z + 24 - depth * .5 - margin, snap(world.z)));
    if(item.requiredTerrain&&land.terrain!==item.requiredTerrain) return {landId:land.id,x,z,valid:false,reason:'terrain',requiredTerrain:item.requiredTerrain};
    if(item.category==='landmark') {
      if(state.buildings.some((building)=>building.type===selectedBuilding)) return {landId:land.id,x,z,valid:false,reason:'landmark-unique'};
      const nearby=state.buildings.some((building)=>BUILDINGS[building.type].category==='landmark'&&Math.hypot(building.x-x,building.z-z)<MAP_GRID.tile*5);
      if(nearby) return {landId:land.id,x,z,valid:false,reason:'landmark-radius'};
    }
    const occupied = state.buildings.some((building) => {
      if (building.landId !== land.id) return false;
      const otherItem=BUILDINGS[building.type], [otherWidth, otherDepth] = footprint(otherItem, building.rotation);
      let padding=.6;
      if(item.category==='road'&&otherItem.category==='road') {
        const directionDifference=Math.abs(((state.rotation-(building.rotation||0))%180+180)%180);
        if(directionDifference>1) return false;
        padding=-2.1;
      }
      return Math.abs(x - building.x) < (width + otherWidth) * .5 + padding && Math.abs(z - building.z) < (depth + otherDepth) * .5 + padding;
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
    const terrainInfo=TERRAIN_INFO[land.terrain||'plains'], color=active?terrainInfo.owned:terrainInfo.locked;
    const surface = [
      {x:land.x-24,y:.5,z:land.z-24}, {x:land.x+24,y:.5,z:land.z-24},
      {x:land.x+24,y:.5,z:land.z+24}, {x:land.x-24,y:.5,z:land.z+24},
    ];
    addFace(surface, shade(color, selected?34:18));
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
  function drawTerrainFeatures(land) {
    const terrain=land.terrain||'plains', seed=designSeed(land.id), occupiedPoints=state.buildings.filter((building)=>building.landId===land.id);
    const clearAt=(x,z)=>!occupiedPoints.some((building)=>Math.hypot(building.x-x,building.z-z)<10);
    if(terrain==='river') {
      box({x:land.x,y:.67,z:land.z},[29,.14,46],'#3185a8');
      for(const x of [land.x-16.2,land.x+16.2]) box({x,y:.73,z:land.z},[3.2,.13,46],'#b8a475');
    } else if(terrain==='forest') {
      const points=[[-15,-14],[14,13],[(seed%11)-5,15]];
      points.forEach(([dx,dz],index)=>{ const x=land.x+dx,z=land.z+dz,size=3.1+((seed>>index)%3); if(!clearAt(x,z))return; box({x,y:2.1,z},[.8,3.1,.8],'#5f422c'); pyramid({x,y:3.4,z},size,index%2?'#337044':'#2d7b47'); });
    } else if(terrain==='mountain') {
      const points=[[-13,12,5.5],[14,-11,4.2]];
      points.forEach(([dx,dz,size],index)=>{ const x=land.x+dx,z=land.z+dz; if(!clearAt(x,z))return; pyramid({x,y:.72,z},size,index?'#777b79':'#686d6c'); pyramid({x,y:.72+size*1.05,z},size*.32,'#d3d9d7'); });
    }
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
  function drawTerrainBuildingDetail(item,local,r,w,h,d) {
    if(!item.requiredTerrain)return;
    const model=item.terrainModel,accent=item.trim||({plains:'#e0c267',river:'#64c6db',forest:'#79ad62',mountain:'#c4c8c6'}[item.requiredTerrain]);
    if(model==='windmill') {
      box(local(0,-d*.58,h+3.5),[.45,6.5,.45],'#765038',r); box(local(0,-d*.61,h+5.3),[6.2,.28,.28],'#efe1bd',r); box(local(0,-d*.62,h+5.3),[.28,6.2,.28],'#efe1bd',r);
    } else if(model==='cavalry') {
      for(const x of [-w*.47,0,w*.47]) box(local(x,d*.62,1.6),[.3,2.2,.3],'#765138',r); box(local(0,d*.62,2.3),[w+1,.25,.25],'#765138',r); box(local(-w*.32,d*.38,1.35),[2.8,.9,1.5],'#d8b759',r);
    } else if(model==='silo') {
      for(const x of [-w*.3,0,w*.3]) { box(local(x,d*.28,h*.48+1.6),[w*.22,h*.92,w*.22],'#a8a59b',r); pyramid(local(x,d*.28,h*.94+1.6),w*.16,'#666a6d'); }
    } else if(model==='fishing') {
      box(local(0,d*.66,1.05),[w+5,.35,4.5],'#9a714b',r); for(const x of [-w*.48,0,w*.48]) box(local(x,d*.66,2),[.35,2.3,.35],'#5f412c',r); for(const x of [-w*.28,w*.28]) { box(local(x,-d*.58,3.2),[.18,4,.18],'#b78b54',r); box(local(x,-d*.63,4.9),[2.2,.12,.12],accent,r); }
    } else if(model==='watermill') {
      box(local(w*.52,0,h*.52+1.7),[.32,5.8,5.8],'#6f5138',r); box(local(w*.54,0,h*.52+1.7),[.4,6.4,.5],accent,r); box(local(w*.55,0,h*.52+1.7),[.42,.5,6.4],accent,r);
    } else if(model==='riverhouse') {
      for(const x of [-w*.36,w*.36]) for(const z of [-d*.36,d*.36]) box(local(x,z,1.9),[.45,3.2,.45],'#65452f',r); box(local(0,d*.62,1.05),[w+3,.32,3.2],'#a77a4c',r);
    } else if(model==='lumber') {
      for(let row=0;row<3;row++) for(let i=0;i<4-row;i++) box(local(-w*.48+i*1.35+row*.62,d*.58,1.05+row*.65),[1.15,1.15,3.4],i%2?'#71482c':'#895a34',r);
    } else if(model==='hunter') {
      box(local(0,-d*.56,h*.68+1.5),[4.5,.25,.25],'#d3c195',r); for(const x of [-1.7,1.7]) { box(local(x,-d*.6,h*.86+1.5),[.18,2.4,.18],'#d3c195',r); box(local(x+(x<0?-.6:.6),-d*.6,h+2.1),[1.2,.18,.18],'#d3c195',r); }
    } else if(model==='shrine') {
      box(local(0,0,1.35),[5.5,.45,5.5],'#898c80',r); box(local(0,0,3.2),[1.8,3.6,1.8],'#a8aaa1',r); for(const [x,z] of [[-4,-3],[4,-3],[-4,3],[4,3]]) pyramid(local(x,z,1.2),2.2,'#3f8050');
    } else if(model==='quarry') {
      for(const [x,z,size] of [[-w*.38,d*.38,2.8],[0,d*.48,2.2],[w*.36,d*.32,3.1]]) { box(local(x,z,1.3),[size,1.5,size*.8],'#777b7c',r); pyramid(local(x,z,2.05),size*.65,'#969a99'); }
    } else if(model==='deepmine') {
      box(local(0,-d*.53,2.8),[w*.66,4.6,.55],'#292d32',r); for(const x of [-w*.28,w*.28]) box(local(x,-d*.58,3.6),[.58,6,.58],'#9b7448',r); box(local(-w*.48,d*.4,1.25),[3.2,.6,2],'#b99248',r); box(local(-w*.48,d*.4,1.75),[2.1,.8,1.3],accent,r);
    } else if(model==='clifffort') {
      for(const x of [-w*.42,w*.42]) { box(local(x,0,h*.55+2),[3.8,h+1,3.8],'#777d82',r); prism(local(x,0,h+2.2),4.6,4.6,h+2,h+5,item.roof,r); } box(local(0,-d*.55,5.2),[5.5,7,.6],'#3e4149',r);
    }
  }
  function designSeed(text) {
    let hash = 2166136261;
    for (let i = 0; i < text.length; i++) { hash ^= text.charCodeAt(i); hash = Math.imul(hash, 16777619); }
    return hash >>> 0;
  }
  function drawUniqueExterior(item, type, local, r, w, h, d) {
    const seed = designSeed(type), accentPalette = ['#e8c46c','#7fc1d4','#d77b68','#9bc77c','#c49ad8','#e59f55'];
    const accent = item.trim || accentPalette[seed % accentPalette.length];
    const bands = 1 + (seed % 3), markerX = (((seed >>> 5) % 101) / 100 - .5) * w * .55;
    for (let i = 0; i < bands; i++) {
      box(local(markerX * (i ? -.55 : 1), -d*.505, 2.1 + (i + 1) * h / (bands + 2)), [Math.max(2.2,w*(.2 + ((seed >>> (i+2)) % 20)/100)), .24, .2], accent, r);
    }
    switch ((seed >>> 9) % 5) {
      case 0:
        box(local(markerX, d*.18, h + 4.6), [.75, 3.2 + (seed % 18)/10, .75], '#555c64', r);
        box(local(markerX, d*.18, h + 6.35), [1.15,.24,1.15], accent, r);
        break;
      case 1:
        box(local(markerX, 0, h + 5), [.35, 3.5, .35], accent, r);
        box(local(markerX + 1.1, 0, h + 6.1), [2.2,.7,.18], item.roof, r);
        break;
      case 2:
        for (const x of [-w*.25,w*.25]) box(local(x, d*.12, h + 4.2), [.55,2.1,.55], accent, r);
        break;
      case 3:
        box(local(markerX, -d*.56, h*.55 + 1.6), [Math.max(3,w*.35),.32,1.2], accent, r);
        break;
      default:
        box(local(markerX, 0, h + 4.25), [2.1 + (seed%14)/10,1.1,2.1 + ((seed>>>3)%14)/10], accent, r);
        break;
    }
    box(local(markerX, d*.47, h + 2.05), [.32, .32, Math.max(1.8,d*.22)], accent, r);
  }
  function drawRoadSegment(building) {
    const item=BUILDINGS[building.type], [w,,d]=item.size, r=(building.rotation||0)*Math.PI/180, c=Math.cos(r), s=Math.sin(r), position={x:building.x,z:building.z};
    const local=(x,z,y=.74)=>({x:position.x+x*c-z*s,y,z:position.z+x*s+z*c});
    box(local(0,0,.68),[w,.24,d],item.body,r);
    if(item.roadStyle==='dirt') {
      for(const [x,z] of [[-6,-.7],[-2,.8],[2,-.5],[6,.55]]) box(local(x,z,.83),[2.2,.05,.42],item.trim,r);
    } else if(item.roadStyle==='gravel') {
      for(let i=-7;i<=7;i+=2) box(local(i,((i*i)%5-2)*.32,.84),[.72,.08,.55],i%4?item.trim:'#6f716f',r);
    } else if(item.roadStyle==='stone') {
      for(let x=-7.5;x<=7.5;x+=3) { box(local(x,0,.83),[.12,.06,d-.35],item.trim,r); box(local(x+1.5,0,.835),[.12,.06,d-.35],item.trim,r); }
      box(local(0,0,.84),[w-.3,.06,.12],item.trim,r);
    } else if(item.roadStyle==='royal') {
      for(const z of [-d*.39,d*.39]) box(local(0,z,.84),[w-.2,.08,.18],item.trim,r);
      for(const x of [-6,-2,2,6]) box(local(x,0,.85),[1.25,.08,.16],item.trim,r);
    } else if(item.roadStyle==='modern') {
      for(const z of [-d*.44,d*.44]) box(local(0,z,.84),[w-.15,.08,.14],item.trim,r);
      for(const x of [-7.5,-4.5,-1.5,1.5,4.5,7.5]) box(local(x,0,.85),[1.35,.09,.18],item.trim,r);
    } else if(item.roadStyle==='future') {
      for(const z of [-d*.36,0,d*.36]) box(local(0,z,.86),[w-.2,.1,.16],item.trim,r);
      for(const x of [-8,-4,0,4,8]) box(local(x,0,.91),[.42,.14,d-.45],'#b6fbff',r);
    }
  }
  function drawBuilding(building, isGhost = false) {
    const item = BUILDINGS[building.type]; const [w,h,d] = item.size; const position = { x: building.x, y: 1, z: building.z };
    if(item.category==='road') { drawRoadSegment(building); return; }
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
    drawTerrainBuildingDetail(item,local,r,w,h,d);
    drawUniqueExterior(item, building.type, local, r, w, h, d);
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
  function drawResidents() {
    const employment = employmentSummary();
    const visibleTotal = Math.min(employment.total, MAX_VISIBLE_RESIDENTS);
    if (!visibleTotal) return;
    const ownedLands = LANDS.filter(owned);
    if (!ownedLands.length) return;
    const daytime = isDaytime();
    // At night every resident is inside a home, so nobody is rendered on the streets.
    if (!daytime) return;
    const visibleEmployed = employment.total ? Math.min(employment.employed, Math.round(visibleTotal * employment.employed / employment.total)) : 0;
    const staffedWorkplaces=employment.workplaces.filter((workplace)=>workplace.assigned>0);
    let workplaceIndex=0,workplaceEnd=staffedWorkplaces[0]?.assigned||0;
    for (let i = 0; i < visibleTotal; i++) {
      const employed = i < visibleEmployed;
      const phase = worldTime * (daytime ? 1.35 : .72) + i * 1.73;
      let x, z, workingOutside = false, bodyColor = employed ? '#6e9dbc' : '#81888d';
      if (daytime && employed && staffedWorkplaces.length) {
        const ordinal=Math.min(employment.employed-1,Math.floor(i*employment.employed/Math.max(1,visibleEmployed)));
        while(workplaceIndex<staffedWorkplaces.length-1&&ordinal>=workplaceEnd) { workplaceIndex++; workplaceEnd+=staffedWorkplaces[workplaceIndex].assigned; }
        const workplace = staffedWorkplaces[workplaceIndex];
        if (!workplace.profile.outdoor) continue;
        const item = BUILDINGS[workplace.building.type], ring = Math.floor(i / employment.workplaces.length) % 4;
        x = workplace.building.x + Math.cos(phase) * (item.size[0] * .62 + 2 + ring * 1.7);
        z = workplace.building.z + Math.sin(phase * .83) * (item.size[2] * .62 + 2 + ring * 1.5);
        bodyColor = workplace.profile.color; workingOutside = true;
      } else {
        const land = ownedLands[i % ownedLands.length];
        x = land.x + Math.sin(phase * .63 + i) * 17;
        z = land.z + Math.sin(phase * .47 + i * 2.1) * 17;
      }
      const bob = Math.sin(phase * 2.4) * .12;
      box({x, y:2.15 + bob, z}, [1.15, 2.35, 1.15], bodyColor);
      box({x, y:3.75 + bob, z}, [1.25, .85, 1.25], '#f5cba6');
      if (workingOutside) box({x:x + .9, y:2.25 + bob, z}, [.65, .75, .65], '#5c6670');
    }
  }
  function interiorIso(x, z, y, width, height) {
    const unit = Math.min(width / 24, height / 12.5) * interiorView.zoom, dx=x-5, dz=z-3.5, c=Math.cos(interiorView.yaw), s=Math.sin(interiorView.yaw);
    const rx=dx*c-dz*s, rz=dx*s+dz*c;
    const baseUnit=Math.min(width / 24, height / 12.5), baseX=width*.5+1.5*baseUnit, baseY=height*.13+8.5*baseUnit*.48;
    return { x:baseX + rx*unit*Math.SQRT2, y:baseY + rz*unit*interiorView.tilt - y*unit };
  }
  function interiorDepth(x,z) { const dx=x-5,dz=z-3.5; return dx*Math.sin(interiorView.yaw)+dz*Math.cos(interiorView.yaw); }
  function clampInteriorView() { interiorView.yaw=Math.max(.12,Math.min(1.45,interiorView.yaw)); interiorView.tilt=Math.max(.45,Math.min(.92,interiorView.tilt)); interiorView.zoom=Math.max(.65,Math.min(1.6,interiorView.zoom)); }
  function resetInteriorView() { interiorView.yaw=Math.PI/4; interiorView.tilt=.68; interiorView.zoom=1; interiorView.drag=null; interiorCanvas.classList.remove('dragging'); }
  const interiorFaces=[];
  let queueInteriorFaces=false;
  function paintInteriorFace(points,color) {
    interiorCtx.beginPath(); points.forEach((point,index) => index ? interiorCtx.lineTo(point.x,point.y) : interiorCtx.moveTo(point.x,point.y)); interiorCtx.closePath();
    interiorCtx.globalAlpha=1; interiorCtx.fillStyle = color; interiorCtx.fill(); interiorCtx.strokeStyle = 'rgba(12,23,29,.42)'; interiorCtx.lineWidth = 1; interiorCtx.stroke();
  }
  function interiorPaint(points, color, depth=0) {
    if(queueInteriorFaces) interiorFaces.push({points,color,depth}); else paintInteriorFace(points,color);
  }
  function interiorBox(x,z,y,sx,sz,sy,color,width,height) {
    const p000=interiorIso(x,z,y,width,height), p100=interiorIso(x+sx,z,y,width,height), p110=interiorIso(x+sx,z+sz,y,width,height), p010=interiorIso(x,z+sz,y,width,height);
    const p001=interiorIso(x,z,y+sy,width,height), p101=interiorIso(x+sx,z,y+sy,width,height), p111=interiorIso(x+sx,z+sz,y+sy,width,height), p011=interiorIso(x,z+sz,y+sy,width,height);
    interiorPaint([p010,p110,p111,p011],shade(color,-16),interiorDepth(x+sx/2,z+sz));
    interiorPaint([p100,p110,p111,p101],shade(color,2),interiorDepth(x+sx,z+sz/2));
    interiorPaint([p001,p101,p111,p011],shade(color,22),interiorDepth(x+sx/2,z+sz/2)+.001);
  }
  const INTERIOR_THEMES = {
    hut:{label:'소박한 농가',signature:'stove',display:'#d7caa4',kinds:['bed','dining','wardrobe','basket','stove','chest']},
    woodhouse:{label:'나무 장인의 집',signature:'logpile',display:'#c7a178',kinds:['bed','workbench','wardrobe','logpile','stove','shelf']},
    village:{label:'마을 가족실',signature:'sofa',display:'#c9d4b0',kinds:['bed','dining','sofa','wardrobe','bookcase','stove']},
    manor:{label:'귀족 응접실',signature:'canopybed',display:'#d9c0dc',kinds:['canopybed','sofa','writingdesk','bookcase','wardrobe','candelabra']},
    homestead:{label:'영주 생활관',signature:'banner',display:'#d2bdd8',kinds:['canopybed','dining','banner','bookcase','candelabra','wardrobe']},
    home:{label:'시대 주택',signature:'wardrobe',display:'#c9dfcf',kinds:['bed','dining','wardrobe','stove','bookcase','sofa']},
    apartment:{label:'공동 주거실',signature:'sofa',display:'#b8d8dc',kinds:['bed','sofa','desk','wardrobe','bookcase','appliance']},
    warehouse:{label:'왕실 저장고',signature:'barrel',display:'#d2bb8d',kinds:['crate','barrel','shelf','scale','cart','sack']},
    farm:{label:'농장 작업실',signature:'grainbin',display:'#c9dc91',kinds:['crop','grainbin','basket','toolrack','workbench','sack']},
    ranch:{label:'목축 관리실',signature:'haystack',display:'#d9c58a',kinds:['haystack','trough','barrel','toolrack','bench','sack']},
    harbor:{label:'항만 작업실',signature:'fishnet',display:'#9bcbd4',kinds:['fishnet','barrel','crate','crane','rope','desk']},
    market:{label:'상인 판매실',signature:'marketstall',display:'#dfb28e',kinds:['marketstall','counter','scale','barrel','shelf','crate']},
    mine:{label:'광산 작업소',signature:'crusher',display:'#aeb7c2',kinds:['ore','cart','crusher','toolrack','lantern','crate']},
    forge:{label:'대장장이 공방',signature:'bellows',display:'#d69a78',kinds:['forge','anvil','bellows','workbench','toolrack','barrel']},
    hall:{label:'왕국 행정실',signature:'throne',display:'#d8c4e1',kinds:['throne','writingdesk','bookcase','banner','statue','candelabra']},
    tower:{label:'감시 지휘실',signature:'telescope',display:'#afc6d5',kinds:['map','telescope','weaponrack','desk','lantern','chest']},
    watchtower:{label:'수호대 초소',signature:'weaponrack',display:'#b8c4ce',kinds:['map','weaponrack','telescope','desk','lantern','bench']},
    park:{label:'시민 휴게 정원',signature:'planter',display:'#a8d5ae',kinds:['planter','bench','fountain','statue','lamppost','trellis']},
    royalGarden:{label:'왕실 온실 정원',signature:'fountain',display:'#a9dfbd',kinds:['fountain','planter','trellis','statue','bench','lamppost']},
    plainsWindmill:{label:'평원 제분 작업실',signature:'grainbin',display:'#ddd09a',kinds:['grainbin','sack','workbench','scale','barrel','toolrack']},
    cavalryRanch:{label:'기병대 생활관',signature:'weaponrack',display:'#d8bd8c',kinds:['bed','weaponrack','wardrobe','dining','haystack','chest']},
    royalGranary:{label:'대평원 곡물 관리실',signature:'grainbin',display:'#d8c887',kinds:['grainbin','barrel','sack','scale','shelf','desk']},
    fishingPier:{label:'강변 어업 작업실',signature:'fishnet',display:'#9bd8df',kinds:['fishnet','rope','barrel','crate','desk','lantern']},
    watermill:{label:'수차 제분실',signature:'machine',display:'#91cbd6',kinds:['machine','grainbin','sack','workbench','barrel','toolrack']},
    riverHouse:{label:'수상 가옥 생활실',signature:'fishnet',display:'#a4d8db',kinds:['bed','fishnet','dining','wardrobe','rope','stove']},
    lumberCamp:{label:'벌목 작업실',signature:'logpile',display:'#a8c392',kinds:['logpile','workbench','toolrack','barrel','shelf','lantern']},
    hunterLodge:{label:'사냥꾼 산장 생활실',signature:'weaponrack',display:'#a8be91',kinds:['bed','weaponrack','stove','table','wardrobe','chest']},
    forestShrine:{label:'고대 숲 성소',signature:'statue',display:'#9bc69e',kinds:['statue','planter','candle','fountain','bench','trellis']},
    quarry:{label:'채석 작업소',signature:'crusher',display:'#c4c5c0',kinds:['crusher','ore','cart','toolrack','workbench','lantern']},
    deepMountainMine:{label:'심층 광산 작업소',signature:'ore',display:'#aeb7c2',kinds:['ore','cart','crusher','toolrack','lantern','crate']},
    cliffFortress:{label:'절벽 요새 지휘실',signature:'map',display:'#b9c2cb',kinds:['map','weaponrack','telescope','banner','writingdesk','candelabra']},
  };
  const ERA_INTERIOR_FURNITURE = ['candle','loom','bookcase','writingdesk','machine','appliance','console','solar','server','robot'];
  function interiorTheme(item,type) {
    return INTERIOR_THEMES[type] || INTERIOR_THEMES[item.model] || (item.category==='residential'?INTERIOR_THEMES.home:item.category==='production'?INTERIOR_THEMES.warehouse:item.category==='decoration'?INTERIOR_THEMES.park:INTERIOR_THEMES.hall);
  }
  function shiftHexColor(hex,amount) {
    const value=parseInt((hex||'#777777').slice(1),16), clampValue=(number)=>Math.max(0,Math.min(255,number));
    return `#${[value>>16,(value>>8)&255,value&255].map(channel=>clampValue(channel+amount).toString(16).padStart(2,'0')).join('')}`;
  }
  function interiorPalette(item,type,eraStyle,seed) {
    const variation=((seed>>>4)%7-3)*4, theme=interiorTheme(item,type);
    return {theme,floor:shiftHexColor(eraStyle.floor,variation),wall:shiftHexColor(eraStyle.wall,-variation),accent:item.trim||eraStyle.accent,display:shiftHexColor(theme.display,(seed%5-2)*5)};
  }
  function interiorKinds(item,type) {
    const theme=interiorTheme(item,type), kinds=[theme.signature];
    if(item.catalog) kinds.push(ERA_INTERIOR_FURNITURE[Math.max(0,Math.min(9,(item.tier||1)-1))]);
    for(const kind of theme.kinds) if(!kinds.includes(kind)) kinds.push(kind);
    return kinds;
  }
  function drawInteriorFurniture(kind,x,z,accent,width,height) {
    const b = (dx,dz,y,sx,sz,sy,color) => interiorBox(x+dx,z+dz,y,sx,sz,sy,color,width,height);
    if (kind === 'bed') { b(-.8,-.4,0,1.9,1,.45,'#80584a'); b(-.72,-.32,.45,1.72,.84,.25,accent); b(-.62,-.24,.7,.55,.68,.18,'#ead9b5'); }
    else if (kind === 'canopybed') { b(-.85,-.5,0,2.05,1.18,.48,'#765246'); b(-.75,-.4,.48,1.85,.98,.3,accent); for(const dx of [-.82,.92]) for(const dz of [-.47,.55]) b(dx,dz,.1,.12,.12,2.1,'#6a4937'); b(-.82,.46,1.75,1.86,.12,.25,accent); }
    else if (kind === 'table' || kind === 'dining' || kind === 'map') { const long=kind==='dining'; b(long?-.9:-.65,long?-.42:-.45,.8,long?1.9:1.4,long?.9:.95,.18,kind==='map'?'#5f8fa5':'#805d42'); for(const [dx,dz] of [[long?-.78:-.55,-.35],[long?.65:.45,-.35],[long?-.78:-.55,.3],[long?.65:.45,.3]]) b(dx,dz,0,.14,.14,.82,'#60422f'); if(kind==='map') b(-.45,-.25,.99,1,.55,.05,'#e4d19b'); }
    else if (kind === 'desk' || kind === 'writingdesk') { b(-.75,-.38,.72,1.55,.78,.2,'#76523b'); b(-.68,-.3,0,.18,.18,.75,'#553b2e'); b(.52,-.3,0,.18,.18,.75,'#553b2e'); b(-.45,-.28,.95,.72,.46,.06,kind==='writingdesk'?'#e9d7a7':accent); b(.32,-.2,.92,.32,.3,.18,'#5d4939'); }
    else if (kind === 'sofa') { b(-.85,-.42,.15,1.8,.86,.48,accent); b(-.85,.25,.45,1.8,.2,.85,'#6f5964'); b(-1.02,-.35,.38,.2,.72,.55,'#6f5964'); b(.75,-.35,.38,.2,.72,.55,'#6f5964'); }
    else if (kind === 'wardrobe') { b(-.7,-.34,0,1.45,.68,2.2,'#77543c'); b(-.64,-.4,.12,.66,.08,1.92,'#966b49'); b(.04,-.4,.12,.66,.08,1.92,'#966b49'); b(-.05,-.48,1,.1,.08,.12,accent); b(.18,-.48,1,.1,.08,.12,accent); }
    else if (kind === 'chest' || kind === 'crate' || kind === 'sack') { b(-.5,-.45,0,1, .9, kind==='sack'?.7:1, kind==='sack'?'#b99a67':'#8a613d'); if(kind!=='sack') b(-.48,-.43,.45,.96,.86,.12,accent); }
    else if (kind === 'hearth' || kind === 'forge' || kind === 'stove') { const compact=kind==='stove'; b(compact?-.48:-.6,compact?-.4:-.5,0,compact?.95:1.2,compact?.8:1,compact?1:1.25,'#4b4a4c'); b(compact?-.28:-.35,compact?-.42:-.52,.35,compact?.55:.7,.12,.45,'#e77835'); b(compact?.18:.2,.1,compact?.85:1.1,.28,.28,compact?1.35:1.8,'#565b61'); }
    else if (kind === 'shelf' || kind === 'bookcase') { b(-.65,-.24,0,1.3,.45,2,kind==='bookcase'?'#594235':'#6c4d36'); for(const y of [.55,1.15,1.75]) { b(-.58,-.29,y,1.16,.55,.12,accent); if(kind==='bookcase') for(let i=0;i<4;i++) b(-.5+i*.28,-.34,y+.12,.18,.12,.32,['#8e4d42','#52728b','#9b7a43','#6f5b88'][i]); } }
    else if (kind === 'anvil') { b(-.45,-.35,0,.9,.7,.65,'#565c65'); b(-.7,-.48,.65,1.4,.95,.35,'#747c86'); }
    else if (kind === 'crop') { for(let i=-1;i<=1;i++) { b(i*.35,-.4,0,.16,.16,.8,'#568948'); b(i*.35-.08,-.48,.8,.32,.32,.25,'#8ebc59'); } }
    else if (kind === 'counter') { b(-.85,-.35,0,1.7,.7,1.05,'#855c3d'); b(-.95,-.43,1.05,1.9,.86,.18,accent); }
    else if (kind === 'ore') { b(-.55,-.45,0,.7,.65,.55,'#6f7783'); b(.05,-.2,0,.55,.48,.75,accent); b(-.15,.18,0,.65,.5,.42,'#555d68'); }
    else if (kind === 'cart') { b(-.75,-.4,.35,1.5,.8,.55,'#765038'); b(-.6,-.5,0,.3,.3,.4,'#3d4248'); b(.35,-.5,0,.3,.3,.4,'#3d4248'); }
    else if (kind === 'bench') { b(-.75,-.28,.65,1.5,.55,.18,'#8b643e'); b(-.62,-.2,0,.18,.18,.68,'#65462f'); b(.42,-.2,0,.18,.18,.68,'#65462f'); }
    else if (kind === 'throne') { b(-.5,-.45,0,1,.9,.65,accent); b(-.5,.2,.55,1,.25,1.55,'#7a546f'); b(-.68,-.32,.55,.18,.7,.6,'#e1b95e'); b(.5,-.32,.55,.18,.7,.6,'#e1b95e'); }
    else if (kind === 'fountain') { b(-.65,-.55,0,1.3,1.1,.22,'#a9b7bd'); b(-.38,-.32,.22,.76,.66,.35,'#58a9c5'); b(-.12,-.08,.57,.24,.22,.75,'#d0d7d9'); }
    else if (kind === 'console') { b(-.7,-.35,0,1.4,.7,.9,'#394b5d'); b(-.55,-.4,.92,1.1,.12,.72,'#67c9d8'); b(-.45,-.43,1.08,.9,.06,.35,accent); }
    else if (kind === 'holo') { b(-.55,-.5,0,1.1,1,.22,'#4b5673'); b(-.32,-.28,.22,.64,.56,.18,accent); b(-.18,-.15,.4,.36,.3,1.25,'#79eaff'); }
    else if (kind === 'lamp') { b(-.1,-.1,0,.2,.2,1.65,'#596573'); b(-.38,-.35,1.55,.76,.7,.35,accent); }
    else if (kind === 'workbench') { b(-.9,-.38,.72,1.9,.8,.22,'#795437'); for(const dx of [-.78,.65]) b(dx,-.28,0,.18,.18,.75,'#563b2b'); b(-.58,-.42,.98,.8,.12,.16,'#68727b'); b(.32,-.36,.95,.36,.3,.2,accent); }
    else if (kind === 'loom') { b(-.78,-.35,0,.16,.16,1.85,'#6f4d32'); b(.62,-.35,0,.16,.16,1.85,'#6f4d32'); for(const y of [.35,1.65]) b(-.78,-.35,y,1.55,.18,.14,'#825d3d'); for(let i=0;i<5;i++) b(-.58+i*.28,-.4,.45,.08,.1,1.1,i%2?accent:'#e5d4b4'); }
    else if (kind === 'logpile') { for(let row=0;row<2;row++) for(let i=0;i<3-row;i++) b(-.7+i*.48+row*.23,-.35,row*.34,.42,.7,.3,i%2?'#70482d':'#895b34'); }
    else if (kind === 'barrel' || kind === 'grainbin') { const color=kind==='grainbin'?'#b58a46':'#7b5033'; b(-.45,-.42,0,.9,.84,1.05,color); for(const y of [.18,.78]) b(-.5,-.47,y,1,.94,.12,kind==='grainbin'?accent:'#4f4f50'); b(-.36,-.33,1.05,.72,.66,.12,accent); }
    else if (kind === 'basket') { b(-.5,-.42,0,1,.84,.52,'#aa7b43'); b(-.4,-.32,.52,.8,.64,.12,accent); for(let i=0;i<3;i++) b(-.3+i*.28,-.2,.62,.16,.16,.28,['#c65d48','#d8b84c','#6ca35b'][i]); }
    else if (kind === 'haystack') { for(let row=0;row<3;row++) b(-.75+row*.18,-.45+row*.1,row*.32,1.5-row*.36,.9-row*.2,.36,row%2?'#c29a45':'#d3ad54'); }
    else if (kind === 'trough') { b(-.9,-.4,.22,1.8,.8,.45,'#765039'); b(-.72,-.25,.55,1.44,.5,.12,'#6aa0ad'); }
    else if (kind === 'toolrack' || kind === 'weaponrack') { b(-.75,-.16,0,1.5,.24,1.65,'#65462f'); for(let i=0;i<3;i++) { b(-.55+i*.5,-.24,.35,.1,.12,1.15,'#737b83'); b(-.68+i*.5,-.3,1.34,.36,.16,.18,kind==='weaponrack'?'#9da7ad':accent); } }
    else if (kind === 'fishnet') { b(-.75,-.18,0,1.5,.2,1.8,'#6a4a31'); for(let i=0;i<5;i++) b(-.62+i*.3,-.25,.28,.04,.08,1.28,'#c8b883'); for(let i=0;i<4;i++) b(-.62,-.26,.35+i*.31,1.25,.06,.04,'#c8b883'); }
    else if (kind === 'crane') { b(-.15,-.15,0,.3,.3,2.2,'#765038'); b(-.1,-.1,1.9,1.45,.2,.22,'#8b633e'); b(1.08,-.12,.45,.08,.08,1.5,'#5f6670'); b(.92,-.2,.28,.38,.38,.25,'#8a613d'); }
    else if (kind === 'rope') { for(let i=0;i<3;i++) { b(-.55+i*.42,-.32,.08,.34,.64,.18,'#b2925c'); b(-.47+i*.42,-.24,.28,.18,.48,.12,'#d0b172'); } }
    else if (kind === 'scale') { b(-.45,-.35,0,.9,.7,.2,'#6b5a44'); b(-.08,-.08,.2,.16,.16,1.25,'#787f86'); b(-.72,-.25,1.05,.65,.5,.12,accent); b(.08,-.25,1.05,.65,.5,.12,accent); }
    else if (kind === 'marketstall') { b(-.9,-.35,0,1.8,.7,1,'#80573b'); b(-1,-.48,1,2,.95,.22,accent); for(const dx of [-.82,.78]) b(dx,-.38,1.18,.12,.12,1.15,'#65442f'); b(-.98,-.46,2.15,1.98,.92,.18,'#e2c275'); }
    else if (kind === 'lantern' || kind === 'candle' || kind === 'candelabra' || kind === 'lamppost') { const tall=kind==='lamppost', arms=kind==='candelabra'?3:1; b(-.08,-.08,0,.16,.16,tall?2:1.25,'#555d65'); for(let i=0;i<arms;i++) b(-.34+i*(arms===1?0:.34),-.22,tall?1.75:1.05,.34,.34,.42,kind==='candle'?'#f0d49a':accent); }
    else if (kind === 'crusher' || kind === 'machine') { b(-.72,-.45,0,1.45,.9,1.25,'#59616a'); b(-.58,-.54,.48,1.15,.14,.42,kind==='machine'?accent:'#9a6944'); b(-.5,-.28,1.25,.42,.42,.65,'#737d85'); b(.18,-.28,1.25,.42,.42,.65,'#737d85'); }
    else if (kind === 'bellows') { b(-.65,-.4,.25,1.3,.8,.35,'#684735'); b(-.52,-.3,.6,1.05,.58,.38,'#a36b4b'); b(.55,-.12,.42,.72,.18,.18,'#656d73'); }
    else if (kind === 'banner') { b(-.08,-.12,0,.16,.16,2.2,'#67472f'); b(-.68,-.18,1.18,1.35,.16,.95,accent); b(-.54,-.2,1.35,1.08,.08,.18,'#e8c96d'); }
    else if (kind === 'statue') { b(-.5,-.45,0,1,.9,.38,'#9ca1a1'); b(-.25,-.22,.38,.5,.45,1.2,'#b8bcbc'); b(-.36,-.32,1.55,.72,.65,.55,'#c7caca'); }
    else if (kind === 'telescope') { b(-.08,-.08,0,.16,.16,1.25,'#676e74'); b(-.65,-.18,1.05,1.5,.36,.36,'#596b78'); b(.72,-.14,1.08,.34,.28,.28,accent); }
    else if (kind === 'planter') { b(-.6,-.52,0,1.2,1,.45,'#8a5c3d'); for(const dx of [-.35,0,.35]) { b(dx,-.08,.45,.1,.1,.75,'#4e7e4e'); b(dx-.14,-.2,1.02,.32,.4,.3,'#74a965'); } }
    else if (kind === 'trellis') { b(-.75,-.12,0,1.5,.2,1.8,'#7e5c3d'); for(let i=0;i<4;i++) b(-.62+i*.4,-.2,.2,.08,.1,1.45,'#9a7049'); for(let i=0;i<3;i++) b(-.7,-.22,.45+i*.45,1.4,.08,.08,'#9a7049'); }
    else if (kind === 'appliance') { b(-.55,-.4,0,1.1,.8,1.45,'#c4ccd0'); b(-.42,-.48,.72,.84,.08,.5,'#608ba0'); b(-.38,-.5,.18,.18,.08,.18,accent); }
    else if (kind === 'solar') { b(-.75,-.5,.45,1.5,1,.18,'#345f7a'); b(-.62,-.42,.63,1.25,.76,.08,'#6ec5d0'); b(-.08,-.08,0,.16,.16,.48,'#626b73'); }
    else if (kind === 'server') { b(-.55,-.38,0,1.1,.76,1.9,'#354554'); for(let i=0;i<4;i++) { b(-.44,-.46,.28+i*.4,.88,.08,.22,'#5a7487'); b(.25,-.52,.34+i*.4,.12,.06,.08,i%2?accent:'#7be8a4'); } }
    else if (kind === 'robot') { b(-.4,-.34,.3,.8,.68,.9,'#7d929e'); b(-.32,-.28,1.2,.64,.56,.55,'#a9bdc5'); b(-.2,-.35,1.38,.14,.08,.12,accent); b(.08,-.35,1.38,.14,.08,.12,accent); for(const dx of [-.32,.22]) b(dx,-.2,0,.18,.18,.38,'#586771'); }
    else { b(-.15,-.12,0,.3,.3,.75,'#6c4b32'); b(-.6,-.55,.75,1.2,1.1,.9,'#4e8b55'); }
  }
  function drawInteriorScene() {
    if (!interiorBuilding || els.interiorModal.hidden) return;
    const rect = interiorCanvas.getBoundingClientRect(), ratio = Math.min(window.devicePixelRatio || 1, 2), width = Math.max(1,rect.width), height = Math.max(1,rect.height);
    if (interiorCanvas.width !== Math.floor(width*ratio) || interiorCanvas.height !== Math.floor(height*ratio)) { interiorCanvas.width=Math.floor(width*ratio); interiorCanvas.height=Math.floor(height*ratio); }
    interiorCtx.setTransform(ratio,0,0,ratio,0,0);
    interiorFaces.length=0; queueInteriorFaces=false;
    const item = BUILDINGS[interiorBuilding.type], seed = designSeed(interiorBuilding.type), era = interiorEra(item), eraStyle = INTERIOR_ERAS[Math.min(INTERIOR_ERAS.length-1,Math.floor((era-1)/2))], palette=interiorPalette(item,interiorBuilding.type,eraStyle,seed), theme=palette.theme;
    const accent = palette.accent, gradient=interiorCtx.createLinearGradient(0,0,0,height);
    gradient.addColorStop(0,shade(item.roof,-18)); gradient.addColorStop(1,'#142735'); interiorCtx.fillStyle=gradient; interiorCtx.fillRect(0,0,width,height);
    // Open-front dollhouse layout: both walls meet at the far (0,0) corner.
    // Keeping the x=10 and z=7 edges open prevents furniture from ever sitting
    // behind a foreground wall while the player rotates the room.
    interiorBox(0,0,0,10,7,.18,palette.floor,width,height);
    interiorBox(0,0,.18,10,.25,4,palette.wall,width,height);
    interiorBox(0,0,.18,.25,7,4,palette.wall,width,height);
    interiorBox(.25,.27,.22,9.5,.12,.2,accent,width,height);
    interiorBox(.27,.25,.22,.12,6.5,.2,accent,width,height);
    // Rear-wall window or era display, plus small framed decorations on the
    // side wall. They stay behind the room contents like the reference image.
    const wallDisplay = era >= 9 ? '#69ddeb' : palette.display;
    interiorBox(5.55,.27,1.45,3.2,.1,1.65,accent,width,height);
    interiorBox(5.72,.38,1.6,2.86,.06,1.34,wallDisplay,width,height);
    for(let i=0;i<3;i++) {
      interiorBox(.28,1.05+i*1.35,1.35+(i%2)*.45,.1,1,.9,accent,width,height);
      interiorBox(.39,1.18+i*1.35,1.5+(i%2)*.45,.05,.74,.6,palette.floor,width,height);
    }
    const stripeCount=1+(seed%3); for(let i=0;i<stripeCount;i++) interiorBox(.4,.28,3.45-i*.32,4.4,.08,.1,accent,width,height);
    queueInteriorFaces=true;
    const kinds=[...interiorKinds(item,interiorBuilding.type)]; if(era>=7) kinds.push('console','lamp'); if(era>=9) kinds.push('holo');
    const slots=[[1.5,1.4],[4.2,1.35],[7.5,1.5],[1.6,4.4],[4.7,4.5],[7.7,4.25]], count=4+(seed%3), offset=seed%slots.length;
    const mandatory=[theme.signature]; if(item.catalog) mandatory.push(ERA_INTERIOR_FURNITURE[Math.max(0,Math.min(9,(item.tier||1)-1))]);
    const furniture=[]; for(let i=0;i<count;i++) { const slot=slots[(i+offset)%slots.length], kind=i<mandatory.length?mandatory[i]:kinds[(i+seed)%kinds.length]; furniture.push({kind,x:slot[0],z:slot[1]}); }
    furniture.sort((a,b)=>interiorDepth(a.x,a.z)-interiorDepth(b.x,b.z)); furniture.forEach((entry)=>drawInteriorFurniture(entry.kind,entry.x,entry.z,accent,width,height));
    const workProfile=item.category==='residential'?homeJobProfile(item):jobProfile(interiorBuilding);
    let insideWorkers=0;
    if(isDaytime()&&item.category==='production'&&!workProfile.outdoor) insideWorkers=Math.min(3,item.people);
    else if(isDaytime()&&item.category==='residential') insideWorkers=Math.min(3,homeJobCapacity(item));
    else if(!isDaytime()&&item.category==='residential') insideWorkers=Math.min(6,residentHomeCounts().get(interiorBuilding.id)||0);
    for(let i=0;i<insideWorkers;i++) { const x=2.2+(i%4)*1.65,z=3+Math.floor(i/4)*1.25+Math.sin(worldTime+i)*.2,bob=Math.sin(worldTime*3+i)*.06; interiorBox(x,z,.18,.42,.42,1.1,workProfile.color||'#6e9dbc',width,height); interiorBox(x-.04,z-.04,1.28+bob,.5,.5,.42,'#f5cba6',width,height); }
    queueInteriorFaces=false; interiorFaces.sort((a,b)=>a.depth-b.depth); interiorFaces.forEach((face)=>paintInteriorFace(face.points,face.color));
    interiorCtx.fillStyle='rgba(255,255,255,.08)'; interiorCtx.fillRect(0,height-34,width,34); interiorCtx.fillStyle='#d7e5e6'; interiorCtx.font='12px system-ui'; interiorCtx.fillText(`${theme.label} · ${era}년식 ${eraStyle.label} · 고유 디자인 ${seed.toString(16).toUpperCase().padStart(8,'0')} · ${isDaytime()?'낮':'밤'}`,18,height-13);
  }
  function drawLandmarkZones() {
    if(!selectedBuilding||BUILDINGS[selectedBuilding].category!=='landmark') return;
    const radius=MAP_GRID.tile*5;
    state.buildings.filter((building)=>BUILDINGS[building.type].category==='landmark').forEach((building)=>{
      const points=[]; for(let i=0;i<=48;i++){ const angle=i/48*Math.PI*2; points.push(project({x:building.x+Math.cos(angle)*radius,y:.95,z:building.z+Math.sin(angle)*radius})); }
      ctx.beginPath(); points.forEach((point,index)=>index?ctx.lineTo(point.x,point.y):ctx.moveTo(point.x,point.y)); ctx.closePath(); ctx.fillStyle='rgba(232,83,91,.08)'; ctx.fill(); ctx.strokeStyle='rgba(255,126,126,.78)'; ctx.lineWidth=2; ctx.setLineDash([7,6]); ctx.stroke(); ctx.setLineDash([]);
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
    faceLayer = 1; LANDS.forEach(drawTerrainFeatures); drawWorldArt(); drawDecorations();
    faceLayer = 2; LANDS.forEach(drawLandBorder);
    faceLayer = 3; state.buildings.forEach(drawBuilding); drawResidents();
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
    drawLandmarkZones();
    const darkness = nightStrength();
    if (darkness > 0) {
      ctx.fillStyle = `rgba(7, 16, 46, ${(.56 * darkness).toFixed(3)})`;
      ctx.fillRect(0, 0, viewW, viewH);
    }
    drawInteriorScene();
    requestAnimationFrame(render);
  }

  function slotsFor(land) {
    return [[-13,-13],[1,-13],[13,-13],[-13,3],[1,3],[13,3],[-7,14],[8,14]].map(([x,z]) => ({x:land.x+x,z:land.z+z}));
  }
  function buildOn(placement) {
    if (!selectedBuilding) return;
    const land = placement && LANDS.find((entry) => entry.id === placement.landId), item = BUILDINGS[selectedBuilding];
    if (!isBuildingUnlocked(item)) { selectedBuilding = null; updateUI(); return toast(`이 건물은 왕국력 ${unlockYear(item)}년에 해금됩니다.`); }
    if(placement?.reason==='landmark-unique') return toast('같은 랜드마크는 왕국에 하나만 설치할 수 있습니다.');
    if(placement?.reason==='landmark-radius') return toast('다른 랜드마크의 원형 영향 범위 5칸 밖에 설치하세요.');
    if(placement?.reason==='terrain') { const terrain=TERRAIN_INFO[placement.requiredTerrain]; return toast(`${item.name}은(는) ${terrain.icon} ${terrain.name} 지형에만 설치할 수 있습니다.`); }
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
      .filter(([, item]) => selectedCategory === 'all' || (selectedCategory==='terrain'?!!item.requiredTerrain:item.category === selectedCategory))
      .sort(([, a], [, b]) => Number(isBuildingUnlocked(b)) - Number(isBuildingUnlocked(a)) || unlockYear(a) - unlockYear(b) || a.price - b.price);
    els.buildingList.innerHTML = ''; buildingEntries.forEach(([id,item]) => {
      const unlocked = isBuildingUnlocked(item), requiredYear = unlockYear(item), tokenCost = item.researchCost || 0;
      const landmarkPlaced=item.category==='landmark'&&state.buildings.some((building)=>building.type===id);
      const button = document.createElement('button'); button.className = `building-card ${selectedBuilding === id ? 'selected':''} ${unlocked&&!landmarkPlaced ? '' : 'locked'}`; button.disabled = !unlocked||landmarkPlaced;
      button.dataset.buildingId=id;
      const productionNote = item.category === 'production' ? ' · 낮에만 생산' : '';
      let detail=`🔒 왕국력 ${requiredYear}년 해금`;
      if(unlocked) {
        if(landmarkPlaced) detail='왕국에 이미 설치됨 · 종류별 1개 제한';
        else if(item.category==='road') detail=`길 조각 ${item.size[0]}m · 회전 배치 가능`;
        else if(item.category==='residential') detail=`세금 +${item.income} / 10초 · 주민 +${item.people}`;
        else if(item.category==='production') detail=`세금 +${item.income} / 10초 · 가격의 1% 추가 · 일자리 ${item.people}${productionNote}`;
        else if(item.category==='decoration') detail=`세금 +${item.income} / 10초 · 가격의 0.5% 추가`;
        else if(item.category==='landmark') detail='왕국 수입 +30% · 종류별 1개 · 다른 랜드마크와 5칸 거리';
        else detail=`세금 +${item.income} / 10초`;
      }
      if(item.requiredTerrain) { const terrain=TERRAIN_INFO[item.requiredTerrain]; detail+=` · ${terrain.icon} ${terrain.name} 전용`; }
      const price = unlocked ? `${format(item.price)} ✦${tokenCost ? `<small>🧪 ${tokenCost}</small>` : ''}` : `${requiredYear}년${tokenCost ? `<small>🧪 ${tokenCost}</small>` : ''}`;
      button.innerHTML = `<span class="card-icon">${item.icon}</span><span><span class="card-title">${item.name}</span><span class="card-detail">${detail}</span></span><b class="card-price">${price}</b>`;
      button.onclick = () => { selectedPlacedBuilding=null; selectedBuilding = selectedBuilding === id ? null : id; state.rotation = 0; updateUI(); }; els.buildingList.append(button);
    });
    const nextBuilding = Object.values(BUILDINGS).filter((item) => unlockYear(item) > kingdomYear()).sort((a, b) => unlockYear(a) - unlockYear(b))[0];
    els.unlockInfo.textContent = nextBuilding ? `왕국력 ${kingdomYear()}년 · 총 ${CATALOG_BUILDING_COUNT}개 시대 건물 · 다음 해금: ${unlockYear(nextBuilding)}년 ${nextBuilding.name}` : `왕국력 ${kingdomYear()}년 · 시대 건물 ${CATALOG_BUILDING_COUNT}개를 모두 해금했습니다.`;
    els.landList.innerHTML = ''; LANDS.forEach((land) => {
      const button = document.createElement('button'); const active = owned(land); button.className = `land-card ${selectedLand===land.id?'selected':''}`;
      const terrain=TERRAIN_INFO[land.terrain||'plains'];
      button.innerHTML = `<span class="card-icon">${active?terrain.icon:'🔒'}</span><span><span class="card-title">${land.name}</span><span class="card-detail">${terrain.icon} ${terrain.name} · ${active ? `${buildingCount(land.id)}개 시설` : '새로운 건설 부지'}</span></span><b class="card-price">${active?'보유':`${format(land.price)} ✦`}</b>`;
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
    const bonus = ((totalIncomeMultiplier() - 1) * 100).toFixed(1), rebirthBonus = (state.rebirths || 0) * 10;
    els.workerInfo.textContent = state.autoCollect ? `수집자 ${state.workers}/20명 · 자동 수금 · 세금 수입 +${bonus}%` : `수집자 ${state.workers}/20명 · 세금 수입 +${bonus}% · 환생 +${rebirthBonus}%`;
    const employment = employmentSummary();
    els.employmentInfo.textContent = `취업자 ${format(employment.employed)}명 · 백수 ${format(employment.unemployed)}명 · 일자리 ${format(employment.capacity)}개`;
    els.jobList.innerHTML = '';
    if (!employment.jobs.length) {
      const empty = document.createElement('span'); empty.className = 'job-empty'; empty.textContent = '생산 건물을 지으면 직업이 생깁니다.'; els.jobList.append(empty);
    } else {
      employment.jobs.forEach((job) => {
        const row = document.createElement('div'); row.className = 'job-row';
        const workplaceText = job.home ? '낮에는 자기 집 안에서만 근무' : (job.outdoor ? '낮에는 건물 밖에서 근무' : '낮에는 생산 건물 안에서 근무');
        row.innerHTML = `<span>${job.icon} ${job.name}</span><b>${format(job.count)}명</b><small>${workplaceText}</small>`;
        els.jobList.append(row);
      });
    }
    const hireButton = $('#hireWorker');
    hireButton.disabled = state.workers >= 20;
    hireButton.innerHTML = state.workers >= 20 ? '수집자 최대 고용 완료' : `수집자 고용 <span>${format(workerCost())} 골드</span>`;
    els.researchInfo.textContent = `보유 연구 토큰 ${format(state.researchTokens || 0)}개 · 왕국력 ${kingdomYear()}년 연구 보상 ${researchReward()}개`;
    els.researchInfo.textContent += ` · 토큰 세금 보너스 +${format((state.researchTokens || 0) * 50)}%`;
    updateResearchTimerUI();
    $('#rotationStep').value = String(state.rotationStep || 45);
    const item = selectedBuilding && BUILDINGS[selectedBuilding]; els.selectionName.textContent = deleteMode ? '삭제 모드' : (item ? item.name : '건물을 선택하세요'); els.selectionMeta.textContent = deleteMode ? '토지를 클릭하면 마지막 건물을 50% 환불로 철거합니다.' : (item ? (item.category==='road'?`${format(item.price)} 골드 · 길 조각 · 회전 ${state.rotation}° · R로 회전`:`${format(item.price)} 골드 · 연구 ${item.researchCost || 0} · 세금 ${item.income}/10초 · 회전 ${state.rotation}°`) : `건설 메뉴에서 건물을 선택 · 환생 발전 ${Math.min(3, state.rebirths || 0)}단계`);
    if(item?.requiredTerrain) { const terrain=TERRAIN_INFO[item.requiredTerrain]; els.selectionMeta.textContent+=` · ${terrain.icon} ${terrain.name} 지형 전용`; }
    let placedSelection=selectedPlacedBuilding&&state.buildings.find((building)=>building.id===selectedPlacedBuilding);
    if(selectedPlacedBuilding&&!placedSelection) selectedPlacedBuilding=null;
    if(placedSelection&&!deleteMode&&!item) {
      const placedItem=BUILDINGS[placedSelection.type];
      els.selectionName.textContent=placedItem.name;
      els.selectionMeta.textContent=placedItem.noInterior?'설치된 길 · 삭제 모드로 철거할 수 있습니다.':`설치된 건물 · ${interiorEra(placedItem)}년식 내부 · 내부를 볼 수 있습니다.`;
    }
    els.interiorButton.hidden=!placedSelection||deleteMode||!!item||BUILDINGS[placedSelection.type].noInterior;
    $('#deleteButton').classList.toggle('active', deleteMode);
  }

  const rightMenu=$('.right-column'), openMenuButton=$('#openMenu');
  function setMenuOpen(open) { rightMenu.classList.toggle('menu-hidden',!open); openMenuButton.hidden=open; }
  $('#closeMenu').onclick=()=>setMenuOpen(false); openMenuButton.onclick=()=>setMenuOpen(true);
  document.querySelectorAll('.tab').forEach((tab) => tab.onclick = () => { activeTab = tab.dataset.tab; document.querySelectorAll('.tab').forEach((button)=>button.classList.toggle('active',button===tab)); document.querySelectorAll('.panel').forEach((panel)=>panel.classList.toggle('active',panel.id===`${activeTab}Panel`)); });
  $('#rotateButton').onclick = () => { if (!selectedBuilding) return toast('먼저 건물을 선택하세요.'); state.rotation = (state.rotation + (state.rotationStep || 45)) % 360; updateUI(); };
  $('#rotationStep').onchange = (event) => { state.rotationStep = Number(event.target.value); save(true); updateUI(); };
  $('#deleteButton').onclick = () => { deleteMode = !deleteMode; if (deleteMode) { selectedBuilding = null; selectedPlacedBuilding=null; } updateUI(); };
  $('#rebirthButton').onclick = rebirth;
  $('#cancelButton').onclick = () => { selectedBuilding = null; selectedPlacedBuilding=null; deleteMode = false; updateUI(); };
  $('#saveButton').onclick = () => save();
  els.interiorButton.onclick = () => openInterior(state.buildings.find((building)=>building.id===selectedPlacedBuilding));
  $('#closeInterior').onclick = closeInterior;
  $('#resetInteriorView').onclick = resetInteriorView;
  els.interiorModal.addEventListener('click',(event)=>{ if(event.target===els.interiorModal) closeInterior(); });
  interiorCanvas.addEventListener('pointerdown',(event)=>{ if(event.button!==0)return; interiorView.drag={pointerId:event.pointerId,x:event.clientX,y:event.clientY}; interiorCanvas.setPointerCapture(event.pointerId); interiorCanvas.classList.add('dragging'); });
  interiorCanvas.addEventListener('pointermove',(event)=>{ if(!interiorView.drag||event.pointerId!==interiorView.drag.pointerId)return; const dx=event.clientX-interiorView.drag.x,dy=event.clientY-interiorView.drag.y; interiorView.yaw-=dx*.006; interiorView.tilt+=dy*.004; clampInteriorView(); interiorView.drag.x=event.clientX; interiorView.drag.y=event.clientY; });
  const finishInteriorDrag=(event)=>{ if(!interiorView.drag||event.pointerId!==interiorView.drag.pointerId)return; interiorCanvas.releasePointerCapture(event.pointerId); interiorView.drag=null; interiorCanvas.classList.remove('dragging'); };
  interiorCanvas.addEventListener('pointerup',finishInteriorDrag); interiorCanvas.addEventListener('pointercancel',finishInteriorDrag);
  interiorCanvas.addEventListener('wheel',(event)=>{ event.preventDefault(); interiorView.zoom*=Math.exp(-event.deltaY*.001); clampInteriorView(); },{passive:false});
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

  function placedBuildingAtPoint(screenX,screenY) {
    const matches=[];
    for (const building of state.buildings) {
      const item=BUILDINGS[building.type], [w,h,d]=item.size, top=item.category==='road'?1.2:h+6;
      const points=[];
      for(const y of [1,top]) for(const dx of [-w/2,w/2]) for(const dz of [-d/2,d/2]) points.push(project({x:building.x+dx,y,z:building.z+dz}));
      const minX=Math.min(...points.map(point=>point.x))-6,maxX=Math.max(...points.map(point=>point.x))+6,minY=Math.min(...points.map(point=>point.y))-6,maxY=Math.max(...points.map(point=>point.y))+6;
      if(screenX>=minX&&screenX<=maxX&&screenY>=minY&&screenY<=maxY) matches.push({building,depth:project({x:building.x,y:top/2,z:building.z}).depth});
    }
    matches.sort((a,b)=>a.depth-b.depth); return matches[0]?.building || null;
  }
  function openInterior(building) {
    if (!building || BUILDINGS[building.type].noInterior) return;
    interiorBuilding=building; pressedKeys.clear(); resetInteriorView(); const item=BUILDINGS[building.type], profile=item.category==='residential'?homeJobProfile(item):jobProfile(building), seed=designSeed(building.type), era=interiorEra(item), eraStyle=INTERIOR_ERAS[Math.min(INTERIOR_ERAS.length-1,Math.floor((era-1)/2))], theme=interiorTheme(item,building.type);
    els.interiorTitle.textContent=`${item.icon} ${item.name}`;
    const homeResidents=item.category==='residential'?(residentHomeCounts().get(building.id)||0):0;
    els.interiorMeta.textContent=`${theme.label} · ${era}년식 ${eraStyle.label} · ${item.category==='production'||item.category==='residential'?profile.name:'생활 공간'} · ${item.category==='residential'?`귀가 주민 ${homeResidents}명`:`근무·관리 인원 ${item.people}명`}`;
    els.interiorModal.hidden=false; drawInteriorScene();
  }
  function closeInterior() { interiorBuilding=null; resetInteriorView(); els.interiorModal.hidden=true; }

  function tileAtPoint(x, y) {
    return [...hitTiles].sort((a,b)=>a.depth-b.depth).find((entry) => pointInPolygon(x, y, entry.points));
  }
  canvas.addEventListener('click', (event) => {
    const tile = tileAtPoint(event.clientX, event.clientY);
    if (deleteMode) { if (tile) deleteOn(tile.id); return; }
    if (selectedBuilding) { buildOn(placementFromScreen(event.clientX, event.clientY)); return; }
    const placed=placedBuildingAtPoint(event.clientX,event.clientY);
    if (placed) { selectedPlacedBuilding=placed.id; selectedLand=placed.landId; updateUI(); return; }
    selectedPlacedBuilding=null;
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
      const hoveredPlaced = selectedBuilding ? null : placedBuildingAtPoint(event.clientX,event.clientY);
      canvas.style.cursor = selectedBuilding ? (hoveredPlacement && hoveredPlacement.valid ? 'crosshair' : 'not-allowed') : (hoveredPlaced ? 'pointer' : 'default');
      return;
    }
    const dx = event.clientX - cameraDrag.x, dy = event.clientY - cameraDrag.y;
    const speed = CAMERA_DRAG_SPEED * cameraMovementScale();
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
  canvas.addEventListener('wheel', (event) => {
    event.preventDefault();
    camera.zoom = Math.max(CAMERA_MIN_ZOOM, Math.min(CAMERA_MAX_ZOOM, camera.zoom - event.deltaY * CAMERA_ZOOM_STEP));
  }, { passive: false });
  window.addEventListener('keydown', (event) => {
    const key = event.key.toLowerCase();
    if (event.key === 'Escape' && interiorBuilding) { closeInterior(); return; }
    if (interiorBuilding) {
      if(key==='q') interiorView.yaw-=.1;
      if(key==='e') interiorView.yaw+=.1;
      if(key==='w') interiorView.zoom+=.08;
      if(key==='s') interiorView.zoom-=.08;
      if(key==='r') resetInteriorView();
      clampInteriorView(); if(['q','e','w','s','r'].includes(key)) event.preventDefault(); return;
    }
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
    updateClockUI();
    const wallClock = Date.now();
    finishResearchIfReady(wallClock);
    updateResearchTimerUI(wallClock);
    const multiplier = totalIncomeMultiplier();
    for (const building of state.buildings) {
      const item = BUILDINGS[building.type];
      if (item.category === 'production' && !isDaytime()) continue;
      building.tax = Math.min(item.income * 20 * multiplier, building.tax + item.income * multiplier * dt / 10);
    }
    els.storedTax.textContent = formatTax(storedTax());
    autoTimer += dt;
    const move = CAMERA_KEYBOARD_SPEED * dt * cameraMovementScale(), c = Math.cos(camera.yaw), s = Math.sin(camera.yaw);
    if (pressedKeys.has('w')) { camera.x += s * move; camera.z += c * move; }
    if (pressedKeys.has('s')) { camera.x -= s * move; camera.z -= c * move; }
    if (pressedKeys.has('a')) { camera.x -= c * move; camera.z += s * move; }
    if (pressedKeys.has('d')) { camera.x += c * move; camera.z -= s * move; }
    if (pressedKeys.size) clampCamera();
    if (autoTimer >= 10) { autoTimer = 0; if (state.autoCollect) collectTax(false); else if (state.workers > 0) { const targets=state.buildings.slice(0,state.workers); const amount=takeTax(targets); if (amount) state.cash += amount; } save(true); updateUI(); }
    requestAnimationFrame(tick);
  }
  updateUI(); updateClockUI(); render(); requestAnimationFrame(tick);
})();
