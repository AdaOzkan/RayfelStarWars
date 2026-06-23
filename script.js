// --- PASSWORDS ---
const PASSWORDS = {
    jedi: "LightSideRayfelmun'26",
    sith: "Rayfelmun'26DarkSide",
    mod: "RayfelMun'26_FJCCadministrator"
};

// --- GALACTIC DATABASE (Search System) ---
const cloneWarsPlanets = [
    { name: "Anaxes", grid: "R-7" },
    { name: "Alderaan", grid: "M-10" },
    { name: "Aargau", grid: "L-10" },
    { name: "Bakura", grid: "G-16" },
    { name: "Batuu", grid: "I-14" },
    { name: "Bespin", grid: "K-18" },
    { name: "Bothawui", grid: "R-14" },
    { name: "Cato Neimoidia", grid: "N-11" },
    { name: "Christophsis", grid: "Q-16" },
    { name: "Corellia", grid: "M-11" },
    { name: "Coruscant", grid: "L-9" },
    { name: "Dagobah", grid: "M-19" },
    { name: "Dantooine", grid: "P-6" },
    { name: "Dathomir", grid: "O-6" },
    { name: "Devaron", grid: "M-13" },
    { name: "Duro", grid: "L-11" },
    { name: "Endor", grid: "H-16" },
    { name: "Eriadu", grid: "M-18" },
    { name: "Felucia", grid: "R-6" },
    { name: "Florrum", grid: "R-5" },
    { name: "Fondor", grid: "L-13" },
    { name: "Geonosis", grid: "R-16" },
    { name: "Hapes", grid: "O-9" },
    { name: "Hoth", grid: "K-18" },
    { name: "Ilum", grid: "G-7" },
    { name: "Kamino", grid: "S-15" },
    { name: "Kashyyyk", grid: "P-9" },
    { name: "Kessel", grid: "T-10" },
    { name: "Kuat", grid: "M-10" },
    { name: "Lola Sayu", grid: "O-11" },
    { name: "Malastare", grid: "N-16" },
    { name: "Mandalore", grid: "O-7" },
    { name: "Maridun", grid: "P-12" },
    { name: "Mon Cala", grid: "U-6" },
    { name: "Moraband", grid: "R-7" },
    { name: "Mustafar", grid: "L-19" },
    { name: "Muunilist", grid: "K-4" },
    { name: "Mygeeto", grid: "K-5" },
    { name: "Naboo", grid: "O-17" },
    { name: "Nal Hutta", grid: "S-12" },
    { name: "Onderon", grid: "O-9" },
    { name: "Polis Massa", grid: "K-20" },
    { name: "Raxus Secundus", grid: "T-7" },
    { name: "Rishi", grid: "S-13" },
    { name: "Rodia", grid: "R-16" },
    { name: "Ryloth", grid: "R-17" },
    { name: "Saleucami", grid: "S-9" },
    { name: "Scipio", grid: "L-8" },
    { name: "Sullust", grid: "M-17" },
    { name: "Umbara", grid: "P-10" },
    { name: "Utapau", grid: "N-19" },
    { name: "Yavin", grid: "P-6" }
];


// --- STATE & INITIALIZATION ---
let currentRole = '';
let currentTool = 'pan';

let zoom = 1.0, panX = 0, panY = 0;
const MAX_ZOOM = 3.0, MIN_ZOOM = 0.4;
let isPanning = false, startX, startY;

let isDeploying = false;
let deployData = null;
let isMoving = false;
let movingEntityId = null;
let selectedEntityId = null;

let isDrawingMode = false;
let currentPath = [];
let isZoning = false;
let zoneStart = null;
let previewZone = null;

function hideContextMenu() {
    const cm = document.getElementById('context-menu');
    if(cm) cm.classList.add('hidden');
}

// LOGIN ATTEMPT VALIDATION
function attemptLogin(role) {
    const passwordInput = document.getElementById('role-password');
    const errorMsg = document.getElementById('login-error');
    const password = passwordInput.value;

    errorMsg.classList.add('hidden');

    if (role === 'viewer') {
        initDashboard('viewer');
        return;
    }

    if (password === PASSWORDS[role]) {
        passwordInput.value = '';
        initDashboard(role);
    } else {
        errorMsg.classList.remove('hidden');
    }
}

function initDashboard(role) {
    if (!localStorage.getItem('mun_map_entities')) {
        initializeStartingForces();
    }

    currentRole = role;
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('dashboard').classList.remove('hidden');
    const badge = document.getElementById('panel-badge');
    
    const rightPanel = document.getElementById('right-panel');
    const chatInputArea = document.getElementById('chat-input-area');
    const toolsBox = document.getElementById('tools-box');
    const modClearBtn = document.getElementById('mod-clear-btn');
    const modClearMapBtn = document.getElementById('mod-clear-map-btn');
    const searchContainer = document.getElementById('search-container');

    if (role === 'sith') {
        badge.innerText = "SITH NETWORK";
        badge.className = "font-orbitron text-xs px-2 py-1 bg-red-950/30 border border-red-800 text-red-500 uppercase";
    } else if (role === 'jedi') {
        badge.innerText = "JEDI REGISTER";
        badge.className = "font-orbitron text-xs px-2 py-1 bg-cyan-950/30 border border-cyan-800 text-cyan-400 uppercase";
    } else if (role === 'mod') {
        badge.innerText = "HQ MODERATOR";
        badge.className = "font-orbitron text-xs px-2 py-1 bg-zinc-800 border border-zinc-600 text-white uppercase";
        document.getElementById('mod-fab-container').classList.remove('hidden');
        document.getElementById('mod-fab-container').classList.add('flex');
        document.getElementById('tool-zone').classList.remove('hidden');
        modClearBtn.classList.remove('hidden'); 
        modClearMapBtn.classList.remove('hidden'); 
    } else if (role === 'viewer') {
        badge.innerText = "VIEWER LINK";
        badge.className = "font-orbitron text-xs px-2 py-1 bg-zinc-900 border border-zinc-700 text-zinc-400 uppercase";
        rightPanel.classList.add('hidden');
        chatInputArea.classList.add('hidden');
        toolsBox.classList.add('hidden');
        searchContainer.classList.add('hidden');
    }
    
    setTimeout(() => setupMapLayer(), 100);
    startClock();
    
    renderMessages();
    renderEntities();
    renderCanvas();
    renderZones();

    window.addEventListener('storage', (e) => {
        if (e.key === 'mun_shared_comms') renderMessages();
        if (e.key === 'mun_map_entities') renderEntities();
        if (e.key === 'mun_map_drawings' || e.key === 'mun_map_marks') renderCanvas();
        if (e.key === 'mun_map_zones') renderZones();
    });
}

function startClock() {
    setInterval(() => {
        document.getElementById('live-clock').innerText = new Date().toTimeString().split(' ')[0];
    }, 1000);
}

// --- SEARCH BAR LOGIC ---
const searchInput = document.getElementById('system-search');
const searchResults = document.getElementById('search-results');

if(searchInput) {
    searchInput.addEventListener('input', (e) => {
        const val = e.target.value.toLowerCase().trim();
        searchResults.innerHTML = '';
        
        if(!val) {
            searchResults.classList.add('hidden');
            return;
        }

        const filtered = galacticDatabase.filter(sys => sys.name.toLowerCase().includes(val));
        if(filtered.length > 0) {
            searchResults.classList.remove('hidden');
            filtered.forEach(sys => {
                let div = document.createElement('div');
                div.className = "p-2 hover:bg-zinc-800 cursor-pointer text-xs font-orbitron text-zinc-300 border-b border-zinc-800 flex justify-between";
                div.innerHTML = `<span>${sys.name}</span><span class="text-amber-500">${sys.grid}</span>`;
                div.onclick = () => { focusOnSystem(sys); };
                searchResults.appendChild(div);
            });
        } else {
            searchResults.classList.remove('hidden');
            searchResults.innerHTML = `<div class="p-2 text-xs text-zinc-600 font-orbitron">No system found.</div>`;
        }
    });
}

document.addEventListener('click', (e) => {
    if(searchInput && searchResults && !searchInput.contains(e.target) && !searchResults.contains(e.target)) {
        searchResults.classList.add('hidden');
    }
});

function focusOnSystem(sys) {
    searchInput.value = sys.name;
    searchResults.classList.add('hidden');

    let parts = sys.grid.split('-');
    let letter, number;
    if (parts.length >= 2 && isNaN(parseInt(parts[0]))) {
        letter = parts[0].trim();
        number = parseInt(parts[1]);
    } else {
        let m = sys.grid.match(/([A-Za-z]+)[^0-9]*(\d+)/);
        if(m) { letter = m[1]; number = parseInt(m[2]); }
    }

    if (!letter || !number) return;

    // YENİ HESAPLAMA: "C" kolonu başlangıç (0. indeks) ve "1" satırı başlangıç (0. indeks)
    // C'nin ASCII karşılığı 67'dir. Gelen harften 67 çıkartarak indeksini buluyoruz.
    const colIndex = letter.toUpperCase().charCodeAt(0) - 67; 
    const rowIndex = number - 1; 

    // Her bir kare 145x145 piksel
    const squareSize = 145;
    
    // Karenin tam ortasına gelmek için indekse 0.5 ekleyip boyutla çarpıyoruz
    const x = (colIndex + 0.5) * squareSize;
    const y = (rowIndex + 0.5) * squareSize;

    zoom = 1.5; 
    const vW = viewport.clientWidth;
    const vH = viewport.clientHeight;
    panX = (vW / 2) - (x * zoom);
    panY = (vH / 2) - (y * zoom);
    updateTransform();

    let oldPing = document.getElementById('search-ping');
    if(oldPing) oldPing.remove();

    let ping = document.createElement('div');
    ping.id = 'search-ping';
    ping.className = 'absolute z-[60] flex items-center justify-center';
    ping.style.left = `${x}px`;
    ping.style.top = `${y}px`;
    ping.innerHTML = `
        <div class="absolute w-16 h-16 border-2 border-amber-500 rounded-full animate-ping opacity-80 pointer-events-none"></div>
        <div class="w-3 h-3 bg-amber-400 rounded-full shadow-[0_0_15px_#f59e0b] pointer-events-none"></div>
        <div class="absolute top-5 left-5 bg-black/90 border border-amber-500/50 text-amber-400 px-2 py-1 text-[10px] font-orbitron whitespace-nowrap rounded pointer-events-none">
            🎯 ${sys.name} [${sys.grid}]
        </div>
    `;
    document.getElementById('zone-layer').appendChild(ping);

    setTimeout(() => { if(document.getElementById('search-ping')) document.getElementById('search-ping').remove(); }, 6000);
}

// --- COMMS & LOGGING ---
function sendSystemLog(message, isPublic = true) {
    let logs = JSON.parse(localStorage.getItem('mun_shared_comms') || '[]');
    logs.push({ id: Date.now(), time: new Date().toTimeString().split(' ')[0], sender: 'system', channel: isPublic ? 'public' : 'global_mod', message: message });
    localStorage.setItem('mun_shared_comms', JSON.stringify(logs));
    renderMessages();
}

function sendMessage(targetType) {
    const input = document.getElementById('msg-input');
    const text = input.value.trim();
    if (!text) return;
    
    let logs = JSON.parse(localStorage.getItem('mun_shared_comms') || '[]');
    let dest = currentRole;
    if (targetType === 'mod') dest = 'to_moderator';
    if (currentRole === 'mod') dest = 'global_mod';

    logs.push({ id: Date.now(), time: new Date().toTimeString().split(' ')[0], sender: currentRole, channel: dest, message: text });
    localStorage.setItem('mun_shared_comms', JSON.stringify(logs));
    
    input.value = '';
    renderMessages();
}

function clearComms() {
    if (currentRole !== 'mod') return;
    localStorage.setItem('mun_shared_comms', JSON.stringify([]));
    sendSystemLog("Comms channels cleared by Moderator.", true);
}

function clearMap() {
    if (currentRole !== 'mod') return;
    localStorage.setItem('mun_map_drawings', JSON.stringify([]));
    localStorage.setItem('mun_map_marks', JSON.stringify([]));
    localStorage.setItem('mun_map_zones', JSON.stringify([]));
    
    let entities = JSON.parse(localStorage.getItem('mun_map_entities') || '[]');
    entities.forEach(ent => { ent.pendingMove = null; });
    localStorage.setItem('mun_map_entities', JSON.stringify(entities));
    
    sendSystemLog("Tactical map cleared (drawings, marks, zones and vector targets reset) by Moderator.", true);
    renderCanvas();
    renderZones();
    renderEntities();
}

function renderMessages() {
    const box = document.getElementById('chat-box');
    box.innerHTML = '';
    const logs = JSON.parse(localStorage.getItem('mun_shared_comms') || '[]');
    
    logs.forEach(msg => {
        let isVisible = false;
        if (currentRole === 'mod' || msg.channel === 'public' || currentRole === 'viewer') isVisible = true;
        else if (currentRole === 'sith' && (msg.channel === 'sith' || msg.channel === 'global_mod' || msg.sender === 'sith')) isVisible = true;
        else if (currentRole === 'jedi' && (msg.channel === 'jedi' || msg.channel === 'global_mod' || msg.sender === 'jedi')) isVisible = true;

        if (isVisible) {
            let cClass = "text-zinc-400", tag = msg.sender.toUpperCase();
            if (msg.sender === 'sith') { tag = "SITH"; cClass = "text-red-500 font-bold"; }
            if (msg.sender === 'jedi') { tag = "JEDI"; cClass = "text-cyan-400 font-bold"; }
            if (msg.sender === 'mod') { tag = "MOD"; cClass = "text-amber-500 font-bold"; }
            if (msg.sender === 'system') { tag = "SYS"; cClass = "text-emerald-500 font-bold"; }

            let extra = msg.channel === 'to_moderator' ? "<span class='text-amber-600 text-[9px]'>[TO_MOD]</span>" : "";

            box.innerHTML += `
                <div class="bg-zinc-950/20 p-2 border-b border-zinc-900/40">
                    <span class="text-zinc-500">[${msg.time}]</span> 
                    <span class="${cClass} mr-1">&lt;${tag}&gt;${extra}</span> 
                    <span class="text-zinc-300 break-words">${msg.message}</span>
                </div>
            `;
        }
    });
    box.scrollTop = box.scrollHeight;
}

// --- MAP NAVIGATION & SETUP ---
const viewport = document.getElementById('map-viewport');
const transformer = document.getElementById('map-transformer');
const img = document.getElementById('galaxy-map');
const canvas = document.getElementById('drawing-canvas');
let initialSetupDone = false;

function setupMapLayer() { 
    if(!img.complete) return;
    canvas.width = img.width || 2000;
    canvas.height = img.height || 2000;
    
    if(!initialSetupDone) {
        const vW = viewport.clientWidth;
        const vH = viewport.clientHeight;
        panX = (vW - (canvas.width * zoom)) / 2;
        panY = (vH - (canvas.height * zoom)) / 2;
        initialSetupDone = true;
    }
    
    updateTransform(); 
    renderCanvas();
    renderZones();
}

function updateTransform() {
    if (!img.complete) return;
    const vW = viewport.clientWidth;
    const vH = viewport.clientHeight;
    const mapW = canvas.width * zoom;
    const mapH = canvas.height * zoom;

    if (mapW <= vW) {
        panX = (vW - mapW) / 2;
    } else {
        panX = Math.min(0, Math.max(vW - mapW, panX));
    }

    if (mapH <= vH) {
        panY = (vH - mapH) / 2;
    } else {
        panY = Math.min(0, Math.max(vH - mapH, panY));
    }

    transformer.style.transform = `translate(${panX}px, ${panY}px) scale(${zoom})`;
    document.getElementById('zoom-indicator').innerText = `${Math.round(zoom * 100)}%`;
    hideContextMenu();
}

function adjustZoom(factor) {
    const prev = zoom;
    zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom + factor));
    const rect = viewport.getBoundingClientRect();
    panX = (rect.width/2) - ((rect.width/2) - panX) * (zoom / prev);
    panY = (rect.height/2) - ((rect.height/2) - panY) * (zoom / prev);
    updateTransform();
}

function resetZoom() { 
    zoom = 1.0; 
    const vW = viewport.clientWidth;
    const vH = viewport.clientHeight;
    panX = (vW - (canvas.width * zoom)) / 2;
    panY = (vH - (canvas.height * zoom)) / 2;
    updateTransform(); 
}

function setTool(tool) {
    if(isDeploying || isMoving) cancelActions();
    currentTool = tool;
    ['pan', 'draw', 'mark', 'zone'].forEach(t => {
        let el = document.getElementById(`tool-${t}`);
        if(el) {
            el.className = t === tool 
                ? "px-3 py-1 bg-zinc-900 border border-zinc-600 font-orbitron uppercase text-white transition-all rounded"
                : "px-3 py-1 bg-transparent border border-zinc-800 font-orbitron uppercase text-zinc-500 transition-all rounded";
        }
    });
    hideContextMenu();
}

// --- DRAWING, MARKS & ZONES ---
function renderCanvas() {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const roleColors = { sith: '#ef4444', jedi: '#06b6d4', mod: '#f59e0b', system: '#10b981' };

    let drawings = JSON.parse(localStorage.getItem('mun_map_drawings') || '[]');
    drawings.forEach(d => drawPath(ctx, d.path, roleColors[d.role] || '#fff'));
    if (currentPath.length > 0) drawPath(ctx, currentPath, roleColors[currentRole] || '#fff');

    let marks = JSON.parse(localStorage.getItem('mun_map_marks') || '[]');
    marks.forEach(m => drawMark(ctx, m.x, m.y, roleColors[m.role] || '#fff'));
}

function drawPath(ctx, path, color) {
    if(path.length < 2) return;
    ctx.beginPath();
    ctx.moveTo(path[0].x, path[0].y);
    for(let i=1; i<path.length; i++) ctx.lineTo(path[i].x, path[i].y);
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
}

function drawMark(ctx, x, y, color) {
    ctx.beginPath();
    ctx.moveTo(x - 10, y - 10); ctx.lineTo(x + 10, y + 10);
    ctx.moveTo(x + 10, y - 10); ctx.lineTo(x - 10, y + 10);
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.stroke();
}

function renderZones() {
    const layer = document.getElementById('zone-layer');
    layer.innerHTML = '';
    
    let existingPing = document.getElementById('search-ping');
    if(existingPing) layer.appendChild(existingPing);

    let zones = JSON.parse(localStorage.getItem('mun_map_zones') || '[]');
    zones.forEach(z => {
        let isSith = z.label.toLowerCase().includes('sith');
        let isJedi = z.label.toLowerCase().includes('jedi');
        
        if (currentRole === 'sith' && isJedi) return;
        if (currentRole === 'jedi' && isSith) return;

        const div = document.createElement('div');
        let colorClass = 'border-amber-500 bg-amber-500/10 text-amber-500';
        if(isSith) colorClass = 'border-red-500 bg-red-500/10 text-red-500';
        if(isJedi) colorClass = 'border-cyan-500 bg-cyan-500/10 text-cyan-400';

        div.className = `absolute border-2 border-dashed flex items-center justify-center font-orbitron text-2xl uppercase tracking-widest font-bold opacity-70 ${colorClass}`;
        div.style.left = z.x + 'px';
        div.style.top = z.y + 'px';
        div.style.width = z.w + 'px';
        div.style.height = z.h + 'px';
        div.innerText = z.label;
        layer.appendChild(div);
    });
}

// --- ENTITY MANAGEMENT ---
function toggleModMenu() {
    const menu = document.getElementById('mod-fab-menu');
    const btn = document.getElementById('fab-btn');
    if (menu.classList.contains('open')) {
        menu.classList.remove('open');
        btn.style.transform = "rotate(0deg)";
    } else {
        menu.classList.add('open');
        btn.style.transform = "rotate(45deg)";
    }
}

function setActionAlert(msg, colorClass) {
    const alertBox = document.getElementById('action-alert');
    if(!msg) { alertBox.classList.add('hidden'); return; }
    alertBox.innerText = msg;
    alertBox.className = `px-4 py-1 text-xs font-orbitron font-bold uppercase animate-pulse border rounded ${colorClass}`;
    alertBox.classList.remove('hidden');
}

function startDeployment() {
    const fac = document.getElementById('deploy-faction').value;
    const type = document.getElementById('deploy-type').value;
    const name = document.getElementById('deploy-name').value.trim();
    if(!name) { alert("Please enter a name!"); return; }

    deployData = { faction: fac, type: type, name: name };
    isDeploying = true;
    currentTool = 'deploy';
    
    toggleModMenu();
    setActionAlert("Select Location on Map (Right-click to cancel)", "border-amber-500 text-amber-500 bg-amber-950/30");
}

function cancelActions() {
    isDeploying = false;
    deployData = null;
    isMoving = false;
    movingEntityId = null;
    setActionAlert(null);
    setTool('pan');
}

function showContextMenu(x, y, entity) {
    if(currentRole === 'viewer') return;
    selectedEntityId = entity.id;
    const cm = document.getElementById('context-menu');
    cm.style.left = `${x}px`;
    cm.style.top = `${y}px`;
    cm.classList.remove('hidden');

    const title = document.getElementById('cm-title');
    title.innerText = entity.name;
    title.style.color = entity.faction === 'sith' ? '#ef4444' : '#06b6d4';

    const actions = document.getElementById('cm-actions');
    actions.innerHTML = '';

    let allEntities = JSON.parse(localStorage.getItem('mun_map_entities') || '[]');

    if (entity.type !== 'Person') {
        let closePeople = allEntities.filter(p => p.type === 'Person' && !p.boardedIn && Math.hypot(p.x - entity.x, p.y - entity.y) <= 12);
        if(closePeople.length > 0) {
            actions.innerHTML += `<div class="text-[10px] text-zinc-500 pt-1 border-t border-zinc-800 mt-1">👤 Close Personnel:</div>`;
            closePeople.forEach(cp => {
                actions.innerHTML += `<button onclick="boardPerson('${cp.id}', '${entity.id}')" class="text-left w-full px-2 py-1 text-[11px] bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 rounded mt-0.5 truncate">👉 Board ${cp.name}</button>`;
            });
        }
        
        let passengers = allEntities.filter(p => p.type === 'Person' && p.boardedIn === entity.id);
        if(passengers.length > 0) {
            actions.innerHTML += `<div class="text-[10px] text-amber-500 pt-1 border-t border-zinc-800 mt-1">👥 Inside (${passengers.length}):</div>`;
            passengers.forEach(p => {
                actions.innerHTML += `<button onclick="unboardPerson('${p.id}')" class="text-left w-full px-2 py-1 text-[11px] bg-zinc-900 hover:bg-zinc-800 text-red-400 border border-zinc-700 rounded mt-0.5 truncate">👈 Unboard ${p.name}</button>`;
            });
        }
    }

    if (currentRole === 'mod') {
        if (entity.pendingMove) {
            actions.innerHTML += `<button onclick="approveMove('${entity.id}')" class="text-left w-full px-2 py-1.5 text-xs bg-emerald-950 hover:bg-emerald-900 text-emerald-400 border border-emerald-800 rounded">✅ Approve Move</button>`;
            actions.innerHTML += `<button onclick="denyMove('${entity.id}')" class="text-left w-full px-2 py-1.5 text-xs bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border border-zinc-700 mt-1 rounded">❌ Deny Move</button>`;
        }
        if(entity.type === 'Person') {
            actions.innerHTML += `<button onclick="toggleFaction('${entity.id}')" class="text-left w-full px-2 py-1.5 text-xs bg-amber-950/40 hover:bg-amber-950 text-amber-400 border border-amber-800 rounded mt-1">🔄 Change Faction</button>`;
        }
        actions.innerHTML += `<button onclick="deleteEntity('${entity.id}')" class="text-left w-full px-2 py-1.5 text-xs text-zinc-400 hover:bg-zinc-800 mt-2 border border-zinc-800 rounded">🗑️ Delete Entity</button>`;
        actions.innerHTML += `<button onclick="detonateEntity('${entity.id}')" class="text-left w-full px-2 py-1.5 text-xs bg-red-950/50 hover:bg-red-900 text-red-400 mt-1 border border-red-900 rounded">💥 Detonate</button>`;
    } 
    else if (currentRole === entity.faction) {
        if (entity.pendingMove) {
            actions.innerHTML += `<div class="text-[10px] text-amber-500 py-1">Awaiting Mod Approval...</div>`;
            actions.innerHTML += `<button onclick="cancelMoveRequest('${entity.id}')" class="text-left w-full px-2 py-1.5 text-xs text-red-400 hover:bg-zinc-800 mt-1 border border-zinc-800 rounded">Cancel Request</button>`;
        } else {
            actions.innerHTML += `<button onclick="startMoveRequest('${entity.id}')" class="text-left w-full px-2 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800 border border-zinc-700 rounded">📍 Select Target (Move)</button>`;
        }
    } else {
        actions.innerHTML += `<div class="text-[10px] text-zinc-500 py-1">No Authorization</div>`;
    }
}

function boardPerson(personId, vehicleId) {
    hideContextMenu();
    let entities = JSON.parse(localStorage.getItem('mun_map_entities') || '[]');
    let pIdx = entities.findIndex(e => e.id === personId);
    let vIdx = entities.findIndex(e => e.id === vehicleId);
    if(pIdx > -1 && vIdx > -1) {
        entities[pIdx].boardedIn = vehicleId;
        entities[pIdx].x = entities[vIdx].x;
        entities[pIdx].y = entities[vIdx].y;
        localStorage.setItem('mun_map_entities', JSON.stringify(entities));
        sendSystemLog(`[BOARDING] ${entities[pIdx].name} entered ${entities[vIdx].name}.`, true);
        renderEntities();
    }
}

function unboardPerson(personId) {
    hideContextMenu();
    let entities = JSON.parse(localStorage.getItem('mun_map_entities') || '[]');
    let pIdx = entities.findIndex(e => e.id === personId);
    if(pIdx > -1) {
        let vId = entities[pIdx].boardedIn;
        let vehicle = entities.find(e => e.id === vId);
        entities[pIdx].boardedIn = null;
        if(vehicle) {
            entities[pIdx].x = vehicle.x + 15;
            entities[pIdx].y = vehicle.y + 15;
        }
        localStorage.setItem('mun_map_entities', JSON.stringify(entities));
        sendSystemLog(`[UNBOARDING] ${entities[pIdx].name} disembarked.`, true);
        renderEntities();
    }
}

function toggleFaction(id) {
    hideContextMenu();
    let entities = JSON.parse(localStorage.getItem('mun_map_entities') || '[]');
    let idx = entities.findIndex(e => e.id === id);
    if(idx > -1) {
        let oldFac = entities[idx].faction;
        let newFac = oldFac === 'sith' ? 'jedi' : 'sith';
        entities[idx].faction = newFac;
        localStorage.setItem('mun_map_entities', JSON.stringify(entities));
        sendSystemLog(`[FACTION CHANGE] Moderator reassigned ${entities[idx].name} to ${newFac.toUpperCase()} Order.`, true);
        renderEntities();
    }
}

function startMoveRequest(id) {
    hideContextMenu();
    isMoving = true;
    movingEntityId = id;
    currentTool = 'move';
    setActionAlert("Select New Target (Right-click to cancel)", "border-cyan-500 text-cyan-500 bg-cyan-950/30");
}

function approveMove(id) {
    hideContextMenu();
    let entities = JSON.parse(localStorage.getItem('mun_map_entities') || '[]');
    let idx = entities.findIndex(e => e.id == id);
    if(idx > -1 && entities[idx].pendingMove) {
        let nX = entities[idx].pendingMove.x;
        let nY = entities[idx].pendingMove.y;
        entities[idx].x = nX;
        entities[idx].y = nY;
        entities[idx].pendingMove = null;
        
        entities.forEach(p => {
            if(p.type === 'Person' && p.boardedIn === id) {
                p.x = nX; p.y = nY;
            }
        });

        localStorage.setItem('mun_map_entities', JSON.stringify(entities));
        renderEntities();
        sendSystemLog(`[MOVEMENT] Mod Approved: '${entities[idx].name}' arrived at new coordinates.`, true);
    }
}

function denyMove(id) {
    hideContextMenu();
    let entities = JSON.parse(localStorage.getItem('mun_map_entities') || '[]');
    let idx = entities.findIndex(e => e.id == id);
    if(idx > -1) {
        entities[idx].pendingMove = null;
        localStorage.setItem('mun_map_entities', JSON.stringify(entities));
        renderEntities();
        sendSystemLog(`[DENIED] Moderator rejected movement for '${entities[idx].name}'.`, false);
    }
}

function cancelMoveRequest(id) { denyMove(id); }

function deleteEntity(id) {
    hideContextMenu();
    let entities = JSON.parse(localStorage.getItem('mun_map_entities') || '[]');
    entities.forEach(p => { if(p.boardedIn === id) p.boardedIn = null; });
    entities = entities.filter(e => e.id != id);
    localStorage.setItem('mun_map_entities', JSON.stringify(entities));
    renderEntities();
}

function detonateEntity(id) {
    hideContextMenu();
    const el = document.getElementById(`entity-${id}`);
    if(el) {
        el.classList.add('explode-anim');
        let entities = JSON.parse(localStorage.getItem('mun_map_entities') || '[]');
        let ent = entities.find(e => e.id == id);
        if(ent) sendSystemLog(`[DETONATION] Critical Alert: '${ent.name}' has been destroyed!`, true);
        
        setTimeout(() => { deleteEntity(id); }, 800);
    } else {
        deleteEntity(id);
    }
}

// --- NEW INTERACTIVE FEATURE: Click Entity to Focus ---
function focusOnEntity(ent) {
    zoom = 1.8; 
    const vW = viewport.clientWidth;
    const vH = viewport.clientHeight;
    panX = (vW / 2) - (ent.x * zoom);
    panY = (vH / 2) - (ent.y * zoom);
    updateTransform();
    
    const el = document.getElementById(`entity-${ent.id}`);
    if(el) {
        el.style.transition = "transform 0.3s, box-shadow 0.3s";
        el.style.transform = "scale(1.8)";
        el.style.boxShadow = ent.faction === 'sith' ? "0 0 25px #ef4444" : "0 0 25px #06b6d4";
        setTimeout(() => {
            el.style.transform = "scale(1)";
            el.style.boxShadow = "";
        }, 1200);
    }
}

// --- MAP CLICK ROUTING ---
viewport.addEventListener('mousedown', (e) => {
    if(e.button === 2) { cancelActions(); return; } 
    if(e.target.closest('#context-menu')) return;
    hideContextMenu();

    const vRect = viewport.getBoundingClientRect();
    const rawX = (e.clientX - vRect.left - panX) / zoom;
    const rawY = (e.clientY - vRect.top - panY) / zoom;

    if (isDeploying && currentRole === 'mod') {
        let entities = JSON.parse(localStorage.getItem('mun_map_entities') || '[]');
        let newEnt = {
            id: Date.now().toString(),
            faction: deployData.faction,
            type: deployData.type,
            name: deployData.name,
            x: rawX, y: rawY,
            pendingMove: null,
            boardedIn: null
        };
        entities.push(newEnt);
        localStorage.setItem('mun_map_entities', JSON.stringify(entities));
        sendSystemLog(`[NEW DEPLOYMENT] Moderator deployed ${newEnt.name} (${newEnt.type}) for ${newEnt.faction.toUpperCase()}.`, true);
        cancelActions();
        renderEntities();
        return;
    }

    if (isMoving && movingEntityId) {
        let entities = JSON.parse(localStorage.getItem('mun_map_entities') || '[]');
        let idx = entities.findIndex(e => e.id == movingEntityId);
        if(idx > -1) {
            entities[idx].pendingMove = { x: rawX, y: rawY };
            localStorage.setItem('mun_map_entities', JSON.stringify(entities));
            
            let logs = JSON.parse(localStorage.getItem('mun_shared_comms') || '[]');
            logs.push({ id: Date.now(), time: new Date().toTimeString().split(' ')[0], sender: currentRole, channel: 'to_moderator', message: `Movement Request: Awaiting approval for ${entities[idx].name}.` });
            localStorage.setItem('mun_shared_comms', JSON.stringify(logs));
            
            cancelActions();
            renderEntities();
        }
        return;
    }

    if (currentTool === 'pan') { 
        isPanning = true; startX = e.clientX - panX; startY = e.clientY - panY; 
    } else if (currentTool === 'draw') {
        isDrawingMode = true;
        currentPath = [{x: rawX, y: rawY}];
    } else if (currentTool === 'mark') {
        let marks = JSON.parse(localStorage.getItem('mun_map_marks') || '[]');
        marks.push({x: rawX, y: rawY, role: currentRole, id: Date.now()});
        localStorage.setItem('mun_map_marks', JSON.stringify(marks));
        renderCanvas();
    } else if (currentTool === 'zone' && currentRole === 'mod') {
        isZoning = true;
        zoneStart = {x: rawX, y: rawY};
        previewZone = document.createElement('div');
        previewZone.className = "absolute border-2 border-dashed border-amber-500 bg-amber-500/20 z-15";
        document.getElementById('zone-layer').appendChild(previewZone);
    }
});

viewport.addEventListener('mousemove', (e) => {
    const vRect = viewport.getBoundingClientRect();
    const rawX = (e.clientX - vRect.left - panX) / zoom;
    const rawY = (e.clientY - vRect.top - panY) / zoom;

    if (isPanning && currentTool === 'pan') {
        panX = e.clientX - startX; panY = e.clientY - startY; updateTransform();
    } else if (isDrawingMode && currentTool === 'draw') {
        currentPath.push({x: rawX, y: rawY});
        renderCanvas();
    } else if (isZoning && currentTool === 'zone' && previewZone) {
        let minX = Math.min(zoneStart.x, rawX);
        let minY = Math.min(zoneStart.y, rawY);
        let w = Math.abs(rawX - zoneStart.x);
        let h = Math.abs(rawY - zoneStart.y);
        previewZone.style.left = minX + 'px';
        previewZone.style.top = minY + 'px';
        previewZone.style.width = w + 'px';
        previewZone.style.height = h + 'px';
    }
});

window.addEventListener('mouseup', (e) => { 
    isPanning = false; 

    if (isDrawingMode) {
        isDrawingMode = false;
        if (currentPath.length > 1) {
            let drawings = JSON.parse(localStorage.getItem('mun_map_drawings') || '[]');
            drawings.push({role: currentRole, path: currentPath, id: Date.now()});
            localStorage.setItem('mun_map_drawings', JSON.stringify(drawings));
        }
        currentPath = [];
        renderCanvas();
    }

    if (isZoning) {
        isZoning = false;
        if(previewZone) {
            const vRect = viewport.getBoundingClientRect();
            const endX = (e.clientX - vRect.left - panX) / zoom;
            const endY = (e.clientY - vRect.top - panY) / zoom;
            
            let minX = Math.min(zoneStart.x, endX);
            let minY = Math.min(zoneStart.y, endY);
            let w = Math.abs(endX - zoneStart.x);
            let h = Math.abs(endY - zoneStart.y);
            
            previewZone.remove();
            previewZone = null;

            if(w > 10 && h > 10) {
                setTimeout(() => {
                    let label = prompt("Alan İsmi (Sith/Jedi/Diğer):");
                    if(label) {
                        let zones = JSON.parse(localStorage.getItem('mun_map_zones')||'[]');
                        zones.push({id: Date.now(), x: minX, y: minY, w: w, h: h, label: label.toUpperCase()});
                        localStorage.setItem('mun_map_zones', JSON.stringify(zones));
                        renderZones();
                    }
                }, 50);
            }
        }
    }
});

viewport.addEventListener('contextmenu', e => e.preventDefault());
viewport.addEventListener('wheel', (e) => { e.preventDefault(); adjustZoom(e.deltaY < 0 ? 0.15 : -0.15); }, { passive: false });

// --- PANEL SÜRÜKLENEREK GENİŞLETME MEKANİZMASI ---
const resizer = document.getElementById('right-panel-resizer');
const rightPanel = document.getElementById('right-panel');
if (resizer && rightPanel) {
    resizer.addEventListener('mousedown', (e) => {
        e.preventDefault();
        document.body.style.cursor = 'col-resize';
        function startResize(mEvent) {
            const width = window.innerWidth - mEvent.clientX;
            if(width > 240 && width < 700) {
                rightPanel.style.width = `${width}px`;
            }
        }
        function stopResize() {
            document.body.style.cursor = 'default';
            window.removeEventListener('mousemove', startResize);
            window.removeEventListener('mouseup', stopResize);
        }
        window.addEventListener('mousemove', startResize);
        window.addEventListener('mouseup', stopResize);
    });
}

// --- RENDER ENGINE ---
function renderEntities() {
    const layer = document.getElementById('entity-layer');
    const tbody = document.getElementById('intel-table-body');
    const pbody = document.getElementById('personnel-table-body');
    const statsContainer = document.getElementById('stats-container');
    
    layer.innerHTML = ''; 
    if(tbody) tbody.innerHTML = '';
    if(pbody) pbody.innerHTML = '';
    
    const entities = JSON.parse(localStorage.getItem('mun_map_entities') || '[]');
    
    let stats = {
        sith: { base: 0, ship: 0, person: 0 },
        jedi: { base: 0, ship: 0, person: 0 }
    };

    entities.forEach(ent => {
        let f = ent.faction;
        if(stats[f]) {
            if(ent.type === 'Person') stats[f].person++;
            else if(ent.type === 'Ship' || ent.type === 'Cruiser') stats[f].ship++;
            else stats[f].base++;
        }

        if (currentRole === 'sith' && ent.faction === 'jedi') return;
        if (currentRole === 'jedi' && ent.faction === 'sith') return;

        if (ent.type === 'Person' && ent.boardedIn) {
            if(pbody) {
                let vehicle = entities.find(v => v.id === ent.boardedIn);
                let statusText = vehicle ? `Inside: ${vehicle.name}` : 'Boarded';
                
                let tr = document.createElement('tr');
                tr.className = "hover:bg-zinc-950/40 cursor-pointer transition-colors";
                tr.onclick = () => { if(vehicle) focusOnEntity(vehicle); };
                tr.innerHTML = `
                    <td class="p-3 font-semibold ${ent.faction==='sith' ? 'text-red-400':'text-cyan-400'}">${ent.name} 👤</td>
                    <td class="p-3 text-right text-zinc-500 italic">${statusText}</td>
                `;
                pbody.appendChild(tr);
            }
            return; 
        }

        let colorClass = ent.faction === 'sith' ? 'border-red-600 bg-red-950 text-red-500 shadow-[0_0_10px_rgba(220,38,38,0.5)]' : 'border-cyan-500 bg-cyan-950 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.5)]';
        
        let typeIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4"><path d="M3 12h18l-4-4H7l-4 4zm0 0l4 4h10l4-4"/></svg>'; 
        if(ent.type === 'Military Base') typeIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5"><path d="M4 22V10l8-8 8 8v12H4z"/><path d="M9 22v-6h6v6"/></svg>';
        if(ent.type === 'Weapon') typeIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5"><line x1="4" y1="20" x2="20" y2="4"/><line x1="4" y1="4" x2="20" y2="20"/></svg>';
        if(ent.type === 'Space Station') {
            if(ent.faction === 'sith') {
                typeIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-6 h-6"><circle cx="12" cy="12" r="10"/><circle cx="16" cy="8" r="3"/><path d="M2 12h20"/></svg>';
            } else {
                typeIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-6 h-6"><polygon points="12 2 22 12 12 22 2 12"/><circle cx="12" cy="12" r="4"/></svg>';
            }
        }
        if(ent.type === 'Ship' || ent.type === 'Cruiser') {
            if(ent.faction === 'sith') {
                typeIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5"><path d="M5 3v18M19 3v18M5 12h14M9 9h6v6H9z"/></svg>';
            } else {
                typeIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5"><path d="M12 2l-6 10v10h12V12L12 2zM9 2l-1 5M15 2l1 5M12 12v10M8 17h8"/></svg>';
            }
        }
        if(ent.type === 'Person') {
            typeIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
        }

        const div = document.createElement('div');
        div.id = `entity-${ent.id}`;
        div.className = `absolute pointer-events-auto flex items-center justify-center rounded-full border-2 entity-marker ${colorClass} ${ent.pendingMove ? 'entity-pending shadow-[var(--tw-shadow-color)]' : ''}`;
        div.style.width = '30px'; div.style.height = '30px';
        div.style.left = `${ent.x - 15}px`; div.style.top = `${ent.y - 15}px`;
        
        div.innerHTML = `<span class="pointer-events-none flex justify-center items-center">${typeIcon}</span>`;
        
        const label = document.createElement('div');
        label.className = `absolute -bottom-5 w-max text-[10px] font-orbitron font-bold px-1 bg-black/80 pointer-events-none rounded ${ent.faction === 'sith' ? 'text-red-400' : 'text-cyan-400'}`;
        label.innerText = ent.name;
        div.appendChild(label);

        div.addEventListener('click', (e) => {
            e.stopPropagation(); 
            if(currentTool !== 'pan') return;
            showContextMenu(e.clientX, e.clientY, ent);
        });

        layer.appendChild(div);

        if (ent.pendingMove) {
            drawDashedLine(ent.x, ent.y, ent.pendingMove.x, ent.pendingMove.y, ent.faction);
        }

        if(ent.type === 'Person') {
            if(pbody) {
                let tr = document.createElement('tr');
                tr.className = "hover:bg-zinc-950/40 cursor-pointer transition-colors";
                tr.onclick = () => focusOnEntity(ent);
                tr.innerHTML = `
                    <td class="p-3 font-semibold ${ent.faction==='sith' ? 'text-red-400':'text-cyan-400'}">${ent.name} 👤</td>
                    <td class="p-3 text-right text-zinc-400">On Map</td>
                `;
                pbody.appendChild(tr);
            }
        } else {
            if(tbody) {
                let tr = document.createElement('tr');
                tr.className = "hover:bg-zinc-950/40 cursor-pointer transition-colors";
                tr.onclick = () => focusOnEntity(ent);
                tr.innerHTML = `
                    <td class="p-3 font-semibold ${ent.faction==='sith' ? 'text-red-400':'text-cyan-400'}">${ent.name}</td>
                    <td class="p-3 text-right text-zinc-400">${ent.type}</td>
                `;
                tbody.appendChild(tr);
            }
        }
    });

    if (statsContainer) {
        statsContainer.innerHTML = `
            <div class="border border-red-900/60 bg-red-950/10 p-2 rounded flex flex-col justify-between relative overflow-hidden group">
                <img src="sources/galactic-empire.jpeg" alt="Sith" class="absolute right-1 bottom-1 w-10 h-10 opacity-20 object-contain pointer-events-none">
                <div class="z-10">
                    <div class="text-red-500 font-bold mb-1 tracking-wider">SITH ORDER</div>
                    <div>Bases: ${stats.sith.base}</div>
                    <div>Ships: ${stats.sith.ship}</div>
                    <div>People: ${stats.sith.person}</div>
                </div>
            </div>
            <div class="border border-cyan-900/60 bg-cyan-950/10 p-2 rounded flex flex-col justify-between relative overflow-hidden group">
                <img src="sources/jedi-order.jpeg" alt="Jedi" class="absolute right-1 bottom-1 w-10 h-10 opacity-20 object-contain pointer-events-none">
                <div class="z-10">
                    <div class="text-cyan-400 font-bold mb-1 tracking-wider">JEDI REP.</div>
                    <div>Bases: ${stats.jedi.base}</div>
                    <div>Ships: ${stats.jedi.ship}</div>
                    <div>People: ${stats.jedi.person}</div>
                </div>
            </div>
        `;
    }
}

function drawDashedLine(x1, y1, x2, y2, faction) {
    const layer = document.getElementById('entity-layer');
    const length = Math.hypot(x2 - x1, y2 - y1);
    const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
    
    const line = document.createElement('div');
    line.style.position = 'absolute';
    line.style.left = `${x1}px`;
    line.style.top = `${y1}px`;
    line.style.width = `${length}px`;
    line.style.height = '2px';
    line.style.transformOrigin = '0 0';
    line.style.transform = `rotate(${angle}deg)`;
    line.style.borderTop = `2px dashed ${faction === 'sith' ? '#ef4444' : '#06b6d4'}`;
    line.style.opacity = '0.5';
    line.style.zIndex = '15';
    layer.appendChild(line);

    const target = document.createElement('div');
    target.className = `absolute w-4 h-4 border-2 rounded-full -ml-2 -mt-2 animate-ping opacity-75 ${faction === 'sith' ? 'border-red-500' : 'border-cyan-500'}`;
    target.style.left = `${x2}px`;
    target.style.top = `${y2}px`;
    layer.appendChild(target);
}

// 11 Jedi & 11 Sith Initialization
function initializeStartingForces() {
    let entities = [];
    
    const jediNames = ["Yoda", "Mace Windu", "Obi-Wan Kenobi", "Anakin Skywalker", "Ahsoka Tano", "Captain Rex", "Plo Koon", "Fives", "Commander Cody", "Kit Fisto", "Echo"];
    const sithNames = ["Darth Sidious", "Count Dooku", "Darth Maul", "Savage Opress", "Asajj Ventress", "Jango Fett", "General Grievous", "Mother Talzin", "Sora Bulq", "Cad Bane", "Aurra Sing"];
    
    // Sith Personeli
    sithNames.forEach((name, i) => {
        entities.push({ id: 'sith-p'+(i+1), faction: 'sith', type: 'Person', name: name, x: 100 + (i*30), y: 100, boardedIn: null });
    });
    
    // Jedi Personeli
    jediNames.forEach((name, i) => {
        entities.push({ id: 'jedi-p'+(i+1), faction: 'jedi', type: 'Person', name: name, x: 1800 - (i*30), y: 1800, boardedIn: null });
    });
    
    // Başlangıç Araçları
    entities.push({ id: 'sith-ship1', faction: 'sith', type: 'Ship', name: 'Sith Infiltrator', x: 200, y: 200, boardedIn: null });
    entities.push({ id: 'jedi-ship1', faction: 'jedi', type: 'Ship', name: 'Republic Cruiser', x: 1700, y: 1700, boardedIn: null });

    localStorage.setItem('mun_map_entities', JSON.stringify(entities));
    renderEntities();
}