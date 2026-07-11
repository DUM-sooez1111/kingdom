(() => {
  'use strict';

  const canvas = document.querySelector('#world');
  const ctx = canvas.getContext('2d');
  const $ = (selector) => document.querySelector(selector);
  const els = {
    cash: $('#cash'), population: $('#population'), categoryList: $('#categoryList'), buildingList: $('#buildingList'), landList: $('#landList'),
    selectionName: $('#selectionName'), selectionMeta: $('#selectionMeta'), workerInfo: $('#workerInfo'),
    storedTax: $('#storedTax'), missionTitle: $('#missionTitle'), missionText: $('#missionText'),
    missionProgress: $('#missionProgress'), claimMission: $('#claimMission'), toast: $('#toast'),
  };

  const BUILDINGS = {
    hut: { name: '농민 오두막', icon: '🏡', category: 'residential', price: 100, income: 8, people: 2, body: '#d4bd83', roof: '#7e4745', size: [8, 5, 8] },
    warehouse: { name: '왕실 곡창고', icon: '🏰', category: 'production', price: 180, income: 14, people: 1, body: '#b88455', roof: '#5f4c4a', size: [10, 6, 12] },
    woodhouse: { name: '나무꾼의 집', icon: '🪵', category: 'residential', price: 280, income: 22, people: 3, body: '#a96f45', roof: '#6a4040', size: [12, 6, 8] },
    village: { name: '마을 저택', icon: '🏠', category: 'residential', price: 420, income: 34, people: 5, body: '#dfc27e', roof: '#69445c', size: [12, 7, 12] },
    homestead: { name: '영주의 영지', icon: '🏛️', category: 'landmark', price: 650, income: 50, people: 8, body: '#c99459', roof: '#473e61', size: [16, 8, 12] },
  };
  const CATEGORIES = [{ id: 'all', name: '전체' }, { id: 'residential', name: '주거' }, { id: 'production', name: '생산' }, { id: 'landmark', name: '랜드마크' }];
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
  ];
  const START = { cash: 1000, owned: ['core1', 'core2', 'core3'], buildings: [], workers: 0, autoCollect: false, rotation: 0, missionClaimed: false };
  const storageKey = 'crownvale-browser-v1';
  let state = load();
  let selectedBuilding = null;
  let selectedCategory = 'all';
  let hoveredLand = null;
  let selectedLand = 'core1';
  let activeTab = 'build';
  let toastTimer = 0;
  let lastTime = performance.now();
  let autoTimer = 0;
  let cameraDrag = null;
  let viewW = 0, viewH = 0, dpr = 1;
  // High bird's-eye view keeps every buildable tile visible at the start.
  const camera = { x: 0, z: 0, yaw: -0.76, pitch: 1.12, zoom: 1050 };
  const hitTiles = [];

  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey));
      if (saved && Array.isArray(saved.owned) && Array.isArray(saved.buildings)) return { ...START, ...saved };
    } catch (_) { /* start a new kingdom */ }
    return structuredClone(START);
  }
  function save(silent = false) { localStorage.setItem(storageKey, JSON.stringify(state)); if (!silent) toast('왕국 기록을 저장했습니다.'); }
  function format(value) { return Math.floor(value).toLocaleString('ko-KR'); }
  function toast(message) { clearTimeout(toastTimer); els.toast.textContent = message; els.toast.classList.add('show'); toastTimer = setTimeout(() => els.toast.classList.remove('show'), 2600); }
  function owned(land) { return state.owned.includes(land.id); }
  function buildingCount(landId) { return state.buildings.filter((building) => building.landId === landId).length; }
  function population() { return state.buildings.reduce((total, building) => total + BUILDINGS[building.type].people, 0); }
  function storedTax() { return state.buildings.reduce((total, building) => total + building.tax, 0); }

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
    // Rotate the world away from a camera above it: taller objects become
    // closer and appear above their bases, rather than looking up from below.
    const py = point.y * cp + rz * sp;
    const depth = -point.y * sp + rz * cp + 185;
    const scale = camera.zoom / Math.max(50, depth);
    return { x: viewW * .5 + rx * scale, y: viewH * .57 - py * scale, depth };
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
  function addFace(vertices, color, outline = 'rgba(17,31,42,.33)', alpha = 1) {
    const points = vertices.map(project);
    faces.push({ points, depth: points.reduce((sum, point) => sum + point.depth, 0) / points.length, color, outline, alpha });
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
    box({ x: land.x, y: 0, z: land.z }, [48, 1, 48], color);
    if (!active) { box({ x: land.x, y: 1.2, z: land.z }, [9, .35, 2], '#596a78'); box({ x: land.x, y: 3.2, z: land.z }, [.55, 4, .55], '#8091a0'); }
    const top = [{x:land.x-23.7,y:.58,z:land.z-23.7},{x:land.x+23.7,y:.58,z:land.z-23.7},{x:land.x+23.7,y:.58,z:land.z+23.7},{x:land.x-23.7,y:.58,z:land.z+23.7}].map(project);
    hitTiles.push({ id: land.id, points: top, depth: top.reduce((sum,p)=>sum+p.depth,0)/4 });
  }
  function drawBuilding(building, isGhost = false) {
    const item = BUILDINGS[building.type]; const [w,h,d] = item.size; const position = { x: building.x, y: 1, z: building.z };
    const alpha = isGhost ? .42 : 1;
    box({ x: position.x, y: 1.45, z: position.z }, [w, .8, d], isGhost ? '#65d7a7' : '#68717c', building.rotation, alpha);
    box({ x: position.x, y: 1.8 + h/2, z: position.z }, [w-.55,h,d-.55], isGhost ? '#65d7a7' : item.body, building.rotation, alpha);
    prism(position, w+1, d+1, h+1.55, h+4, isGhost ? '#35a977' : item.roof, building.rotation, alpha);
    const r = building.rotation, c = Math.cos(r), s = Math.sin(r);
    const local = (x,z,y) => ({ x:position.x+x*c-z*s, y, z:position.z+x*s+z*c });
    for (const x of [-w*.37,w*.37]) for (const z of [-d*.37,d*.37]) box(local(x,z,h/2+1.8), [.3,h+1.1,.3], isGhost ? '#d4fff0' : '#5c392a', r, alpha);
    const door = local(0,-d/2-.04,3); box(door, [1.8,3.3,.18], isGhost ? '#d4fff0' : '#513322', r, alpha);
    for (const x of [-w*.25,w*.25]) box(local(x,-d/2-.12,h*.68+1), [1.25,1.3,.13], isGhost ? '#e8fff7' : '#ffd16e', r, alpha);
  }
  function drawWorldArt() {
    box({x:0,y:.65,z:0}, [242,.18,5], '#b7986f');
    for (const x of [-72,-24,24,72]) box({x,y:.65,z:0}, [4,.18,98], '#ad8e68');
    box({x:153,y:8,z:0}, [62,16,14], '#535e70');
    for (const x of [123,183]) { box({x,y:11,z:-8}, [12,22,12], '#657183'); prism({x,y:0,z:-8}, 16,16,22,29,'#693f56'); }
    box({x:153,y:5.5,z:-7.3}, [10,11,.5], '#513322');
    for (const [x,z,size] of [[-132,-65,6],[-132,63,6],[132,-64,6],[132,63,6],[0,74,5],[-109,63,4],[113,69,4]]) { box({x,y:size*.9,z}, [1.2,size*1.8,1.2], '#63422a'); pyramid({x,y:size*1.7,z}, size, '#3d7d4f'); }
    box({x:126,y:1,z:0}, [13,2,13], '#aeb8c3'); box({x:126,y:2.12,z:0}, [10,.25,10], '#5db7dc'); box({x:126,y:4,z:0}, [1.4,4,1.4], '#c9d3dd');
  }
  function render() {
    // The sea is intentionally a screen-space background. A giant 3D water
    // plane cannot be depth-sorted correctly against every individual tile.
    const water = ctx.createLinearGradient(0, 0, 0, viewH);
    water.addColorStop(0, '#3b89ae'); water.addColorStop(1, '#236783');
    ctx.fillStyle = water; ctx.fillRect(0, 0, viewW, viewH);
    faces.length = 0; hitTiles.length = 0;
    drawWorldArt(); LANDS.forEach(drawLand); state.buildings.forEach(drawBuilding);
    const previewLand = selectedBuilding && hoveredLand && LANDS.find((land) => land.id === hoveredLand);
    if (previewLand && owned(previewLand)) {
      const slot = slotsFor(previewLand)[buildingCount(previewLand.id)];
      if (slot) drawBuilding({ type: selectedBuilding, x: slot.x, z: slot.z, rotation: state.rotation }, true);
    }
    faces.sort((a,b) => b.depth-a.depth);
    for (const face of faces) {
      ctx.beginPath(); face.points.forEach((point,index) => index ? ctx.lineTo(point.x,point.y) : ctx.moveTo(point.x,point.y)); ctx.closePath();
      ctx.globalAlpha = face.alpha; ctx.fillStyle = face.color; ctx.fill(); ctx.strokeStyle = face.outline; ctx.lineWidth = 1; ctx.stroke();
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(render);
  }

  function slotsFor(land) {
    return [[-13,-13],[1,-13],[13,-13],[-13,3],[1,3],[13,3],[-7,14],[8,14]].map(([x,z]) => ({x:land.x+x,z:land.z+z}));
  }
  function buildOn(landId) {
    if (!selectedBuilding) { selectedLand = landId; updateUI(); return; }
    const land = LANDS.find((entry) => entry.id === landId), item = BUILDINGS[selectedBuilding];
    if (!owned(land)) return toast('먼저 이 영토를 구매해야 합니다.');
    if (state.cash < item.price) return toast('골드가 부족합니다.');
    const slot = slotsFor(land)[buildingCount(landId)];
    if (!slot) return toast('이 영토는 이미 가득 찼습니다.');
    state.cash -= item.price; state.buildings.push({ id: crypto.randomUUID(), type: selectedBuilding, landId, x: slot.x, z: slot.z, rotation: state.rotation, tax: 0 });
    toast(`${item.name}을(를) 건설했습니다.`); save(true); updateUI();
  }
  function purchaseLand(id) {
    const land = LANDS.find((entry) => entry.id === id); if (owned(land)) return;
    if (state.cash < land.price) return toast('골드가 부족합니다.');
    state.cash -= land.price; state.owned.push(id); selectedLand = id; toast(`${land.name} 영토를 확보했습니다.`); save(true); updateUI();
  }
  function collectTax(message = true) {
    const amount = storedTax(); if (amount < 1) return message && toast('아직 수금할 세금이 없습니다.');
    state.cash += amount; state.buildings.forEach((building) => { building.tax = 0; }); if (message) toast(`${format(amount)} 골드를 수금했습니다.`); save(true); updateUI();
  }

  function updateUI() {
    els.cash.textContent = format(state.cash); els.population.textContent = format(population()); els.storedTax.textContent = format(storedTax());
    els.categoryList.innerHTML = ''; CATEGORIES.forEach((category) => {
      const button = document.createElement('button'); button.className = `category-chip ${selectedCategory === category.id ? 'active' : ''}`; button.textContent = category.name;
      button.onclick = () => { selectedCategory = category.id; updateUI(); }; els.categoryList.append(button);
    });
    els.buildingList.innerHTML = ''; Object.entries(BUILDINGS).filter(([, item]) => selectedCategory === 'all' || item.category === selectedCategory).forEach(([id,item]) => {
      const button = document.createElement('button'); button.className = `building-card ${selectedBuilding === id ? 'selected':''}`;
      button.innerHTML = `<span class="card-icon">${item.icon}</span><span><span class="card-title">${item.name}</span><span class="card-detail">+${item.income} / 10초 · 주민 ${item.people}</span></span><b class="card-price">${format(item.price)} ✦</b>`;
      button.onclick = () => { selectedBuilding = selectedBuilding === id ? null : id; state.rotation = 0; updateUI(); }; els.buildingList.append(button);
    });
    els.landList.innerHTML = ''; LANDS.forEach((land) => {
      const button = document.createElement('button'); const active = owned(land); button.className = `land-card ${selectedLand===land.id?'selected':''}`;
      button.innerHTML = `<span class="card-icon">${active?'🌿':'🔒'}</span><span><span class="card-title">${land.name}</span><span class="card-detail">${active ? `${buildingCount(land.id)} / 8 건물` : '새로운 건설 부지'}</span></span><b class="card-price">${active?'보유':`${format(land.price)} ✦`}</b>`;
      button.onclick = () => active ? (selectedLand=land.id, updateUI()) : purchaseLand(land.id); els.landList.append(button);
    });
    const homes = state.buildings.filter((b) => b.type !== 'warehouse').length, goal = 3;
    els.missionTitle.textContent = state.missionClaimed ? 'Crownvale을 계속 성장시키세요' : `오두막 ${goal}채를 건설하세요`;
    els.missionText.textContent = state.missionClaimed ? '보상 완료' : `${homes} / ${goal}`;
    els.missionProgress.style.width = `${Math.min(100, homes/goal*100)}%`; els.claimMission.disabled = state.missionClaimed || homes < goal;
    els.claimMission.textContent = state.missionClaimed ? '완료' : '보상 수령';
    els.workerInfo.textContent = state.autoCollect ? '왕실 자동 수금이 모든 세금을 관리합니다.' : `수집자 ${state.workers}명 · 매 10초 건물 ${Math.min(state.workers, state.buildings.length)}채를 수금합니다.`;
    const item = selectedBuilding && BUILDINGS[selectedBuilding]; els.selectionName.textContent = item ? item.name : '건물을 선택하세요'; els.selectionMeta.textContent = item ? `${format(item.price)} 골드 · 현재 회전 ${state.rotation}°` : '건설 메뉴에서 건물을 선택';
  }

  document.querySelectorAll('.tab').forEach((tab) => tab.onclick = () => { activeTab = tab.dataset.tab; document.querySelectorAll('.tab').forEach((button)=>button.classList.toggle('active',button===tab)); document.querySelectorAll('.panel').forEach((panel)=>panel.classList.toggle('active',panel.id===`${activeTab}Panel`)); });
  $('#rotateButton').onclick = () => { if (!selectedBuilding) return toast('먼저 건물을 선택하세요.'); state.rotation = (state.rotation + 90) % 360; updateUI(); };
  $('#cancelButton').onclick = () => { selectedBuilding = null; updateUI(); };
  $('#saveButton').onclick = () => save();
  $('#collectTax').onclick = () => collectTax();
  $('#hireWorker').onclick = () => { if (state.workers >= 5) return toast('수집자는 최대 5명입니다.'); if (state.cash < 600) return toast('골드가 부족합니다.'); state.cash -= 600; state.workers++; toast('새 세금 수집자가 도착했습니다.'); save(true); updateUI(); };
  $('#unlockAuto').onclick = () => { if (state.autoCollect) return toast('이미 왕실 자동 수금이 활성화되어 있습니다.'); if (state.cash < 1200) return toast('골드가 부족합니다.'); state.cash -= 1200; state.autoCollect = true; toast('왕실 자동 수금이 시작되었습니다.'); save(true); updateUI(); };
  els.claimMission.onclick = () => { if (state.missionClaimed) return; state.cash += 450; state.missionClaimed = true; toast('왕실이 450 골드를 하사했습니다!'); save(true); updateUI(); };

  function tileAtPoint(x, y) {
    return [...hitTiles].sort((a,b)=>a.depth-b.depth).find((entry) => pointInPolygon(x, y, entry.points));
  }
  canvas.addEventListener('click', (event) => {
    const tile = tileAtPoint(event.clientX, event.clientY);
    if (tile) buildOn(tile.id);
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
      const tile = tileAtPoint(event.clientX, event.clientY);
      hoveredLand = selectedBuilding && tile ? tile.id : null;
      canvas.style.cursor = selectedBuilding && tile ? 'crosshair' : 'default';
      return;
    }
    const dx = event.clientX - cameraDrag.x, dy = event.clientY - cameraDrag.y;
    const speed = 0.07 * (1400 / camera.zoom);
    const c = Math.cos(camera.yaw), s = Math.sin(camera.yaw);
    camera.x += (-dx * c + dy * s) * speed;
    camera.z += (dx * s + dy * c) * speed;
    cameraDrag.x = event.clientX; cameraDrag.y = event.clientY;
  });
  canvas.addEventListener('pointerup', (event) => {
    if (!cameraDrag || event.pointerId !== cameraDrag.pointerId) return;
    canvas.releasePointerCapture(event.pointerId); cameraDrag = null;
  });
  canvas.addEventListener('pointerleave', () => { if (!cameraDrag) hoveredLand = null; });
  canvas.addEventListener('wheel', (event) => { event.preventDefault(); camera.zoom = Math.max(700, Math.min(1900, camera.zoom - event.deltaY * .55)); }, { passive: false });
  window.addEventListener('keydown', (event) => { if (event.key.toLowerCase() === 'q') camera.yaw -= .08; if (event.key.toLowerCase() === 'e') camera.yaw += .08; if (event.key === 'Escape') { selectedBuilding = null; updateUI(); } });
  function pointInPolygon(x,y,points) { let inside=false; for(let i=0,j=points.length-1;i<points.length;j=i++) { const a=points[i],b=points[j]; if (((a.y>y)!==(b.y>y)) && (x < (b.x-a.x)*(y-a.y)/(b.y-a.y)+a.x)) inside=!inside; } return inside; }

  function tick(now) {
    const dt = Math.min(.25,(now-lastTime)/1000); lastTime=now;
    for (const building of state.buildings) { const item=BUILDINGS[building.type]; building.tax = Math.min(item.income*20, building.tax + item.income*dt/10); }
    autoTimer += dt;
    if (autoTimer >= 10) { autoTimer = 0; if (state.autoCollect) collectTax(false); else if (state.workers > 0) { const targets=state.buildings.slice(0,state.workers); const amount=targets.reduce((sum,b)=>sum+b.tax,0); targets.forEach((b)=>b.tax=0); state.cash+=amount; } save(true); updateUI(); }
    requestAnimationFrame(tick);
  }
  updateUI(); render(); requestAnimationFrame(tick);
})();
