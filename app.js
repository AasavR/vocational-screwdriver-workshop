// Vocational VR Screwdriver Workshop — Interactive WebGL Client Simulator
// Three.js high-performance simulation replicating Unity 6 tool kinematics

(function() {
  'use strict';

  // --- Web Audio Synthesizer for Mechanical Feedback ---
  class SoundFX {
    constructor() {
      this.ctx = null;
      this.enabled = true;
      this.lastClickTime = 0;
    }

    init() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    playRatchetClick() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      if (now - this.lastClickTime < 0.05) return;
      this.lastClickTime = now;

      // High-pitched mechanical ratchet click
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.035);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.035);
    }

    playLockChime() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // Metallic clink
      [880, 1760].forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.02);
        gain.gain.setValueAtTime(0.2, now + idx * 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.02 + 0.12);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.02);
        osc.stop(now + idx * 0.02 + 0.12);
      });
    }

    playSuccessChime() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.08);
        gain.gain.setValueAtTime(0.25, now + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.3);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.3);
      });
    }
  }

  const sfx = new SoundFX();

  // --- Scene, Renderer & Camera ---
  const container = document.getElementById('webgl-container');
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0c1015);
  scene.fog = new THREE.FogExp2(0x0c1015, 0.045);

  const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
  camera.position.set(0, 4.2, 5.2);

  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  container.appendChild(renderer.domElement);

  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.target.set(0, 1.1, 0);
  controls.maxPolarAngle = Math.PI / 2 - 0.05; // Prevent camera going below table
  controls.minDistance = 1.5;
  controls.maxDistance = 10.0;

  // --- Lighting (Clean Industrial, No Yellow Wash) ---
  const ambientLight = new THREE.AmbientLight(0x2a3642, 1.2);
  scene.add(ambientLight);

  const mainLight = new THREE.DirectionalLight(0xffffff, 1.5);
  mainLight.position.set(4, 9, 4);
  mainLight.castShadow = true;
  mainLight.shadow.mapSize.width = 2048;
  mainLight.shadow.mapSize.height = 2048;
  mainLight.shadow.camera.near = 0.5;
  mainLight.shadow.camera.far = 25;
  mainLight.shadow.camera.left = -4;
  mainLight.shadow.camera.right = 4;
  mainLight.shadow.camera.top = 4;
  mainLight.shadow.camera.bottom = -4;
  mainLight.shadow.bias = -0.0005;
  scene.add(mainLight);

  // Cyan rim/accent light
  const rimLight = new THREE.DirectionalLight(0x00e5ff, 0.6);
  rimLight.position.set(-5, 4, -4);
  scene.add(rimLight);

  // Soft warm fill light
  const fillLight = new THREE.PointLight(0xffeedd, 0.4, 10);
  fillLight.position.set(0, 3, 2);
  scene.add(fillLight);

  // --- Workshop Environment Geometry ---
  // 1. Cast-Iron Workbench
  const tableGroup = new THREE.Group();
  const tableTopGeo = new THREE.BoxGeometry(8.5, 0.35, 5.5);
  const tableMat = new THREE.MeshStandardMaterial({
    color: 0x1f2730,
    metalness: 0.65,
    roughness: 0.45,
  });
  const tableTop = new THREE.Mesh(tableTopGeo, tableMat);
  tableTop.position.y = 0.8;
  tableTop.receiveShadow = true;
  tableGroup.add(tableTop);

  // Workbench steel frame legs
  const legGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.8, 16);
  const legMat = new THREE.MeshStandardMaterial({ color: 0x11161d, metalness: 0.8, roughness: 0.3 });
  [
    [-3.9, 0.4, -2.4],
    [3.9, 0.4, -2.4],
    [-3.9, 0.4, 2.4],
    [3.9, 0.4, 2.4]
  ].forEach(pos => {
    const leg = new THREE.Mesh(legGeo, legMat);
    leg.position.set(...pos);
    leg.castShadow = true;
    tableGroup.add(leg);
  });

  // Table grid / alignment texture lines
  const gridHelper = new THREE.GridHelper(7.5, 15, 0x00e5ff, 0x223240);
  gridHelper.position.y = 0.98;
  tableGroup.add(gridHelper);
  scene.add(tableGroup);

  // 2. Workpiece Steel Plate (The plate to be disassembled)
  const plateGroup = new THREE.Group();
  plateGroup.position.set(0, 1.05, 0);

  const plateGeo = new THREE.BoxGeometry(4.4, 0.12, 3.2);
  const plateMat = new THREE.MeshStandardMaterial({
    color: 0x3d4a58,
    metalness: 0.85,
    roughness: 0.25,
  });
  const plateMesh = new THREE.Mesh(plateGeo, plateMat);
  plateMesh.castShadow = true;
  plateMesh.receiveShadow = true;
  plateGroup.add(plateMesh);

  // Chamfered screw sockets in plate
  const socketGeo = new THREE.CylinderGeometry(0.24, 0.2, 0.13, 24);
  const socketMat = new THREE.MeshStandardMaterial({ color: 0x1a2128, metalness: 0.9, roughness: 0.3 });

  // 4 Fastener definitions matching Unity coordinates (scaled for visibility)
  // Coordinates scaled ~4.2x from Unity values: (-0.38, 1.0, -0.18) -> (-1.6, 1.15, -0.9)
  const SCREW_SPACING_X = 1.6;
  const SCREW_SPACING_Z = 1.0;
  const FASTENER_CONFIGS = [
    { id: 0, name: 'FASTENER 1', x: -SCREW_SPACING_X, z: -SCREW_SPACING_Z, label: 'FL (-0.38, -0.18)' },
    { id: 1, name: 'FASTENER 2', x:  SCREW_SPACING_X, z: -SCREW_SPACING_Z, label: 'FR (+0.38, -0.18)' },
    { id: 2, name: 'FASTENER 3', x: -SCREW_SPACING_X, z:  SCREW_SPACING_Z, label: 'RL (-0.38, +0.28)' },
    { id: 3, name: 'FASTENER 4', x:  SCREW_SPACING_X, z:  SCREW_SPACING_Z, label: 'RR (+0.38, +0.28)' }
  ];

  FASTENER_CONFIGS.forEach(cfg => {
    const socket = new THREE.Mesh(socketGeo, socketMat);
    socket.position.set(cfg.x, 0.005, cfg.z);
    plateGroup.add(socket);
  });

  scene.add(plateGroup);

  // 3. Precision Fastener Screws
  const screws = [];
  const screwInitialY = 1.14;
  const screwMaxLift = 0.55;

  function createDetailedScrew(cfg) {
    const group = new THREE.Group();
    group.position.set(cfg.x, screwInitialY, cfg.z);

    // Golden titanium hex head
    const headGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.08, 6);
    const headMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37, // Golden titanium
      metalness: 0.9,
      roughness: 0.25,
    });
    const headMesh = new THREE.Mesh(headGeo, headMat);
    headMesh.castShadow = true;
    group.add(headMesh);

    // Hex socket drive recess (inner hole)
    const recessGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.04, 6);
    const recessMat = new THREE.MeshStandardMaterial({ color: 0x11161d, metalness: 0.9, roughness: 0.5 });
    const recessMesh = new THREE.Mesh(recessGeo, recessMat);
    recessMesh.position.y = 0.025;
    group.add(recessMesh);

    // Threaded shaft
    const shaftGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.35, 16);
    const shaftMat = new THREE.MeshStandardMaterial({ color: 0xc5a028, metalness: 0.85, roughness: 0.35 });
    const shaftMesh = new THREE.Mesh(shaftGeo, shaftMat);
    shaftMesh.position.y = -0.18;
    group.add(shaftMesh);

    // Thread spiral rings
    for (let r = 0; r < 5; r++) {
      const ringGeo = new THREE.TorusGeometry(0.095, 0.012, 8, 20);
      const ringMat = new THREE.MeshStandardMaterial({ color: 0xe0bc42, metalness: 0.9, roughness: 0.2 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2 + 0.12;
      ring.position.y = -0.06 - r * 0.055;
      group.add(ring);
    }

    // Engagement indicator ring (glows when tool is aligned)
    const ringGeo = new THREE.RingGeometry(0.24, 0.27, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x00e5ff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.0
    });
    const indicatorRing = new THREE.Mesh(ringGeo, ringMat);
    indicatorRing.rotation.x = -Math.PI / 2;
    indicatorRing.position.y = 0.05;
    group.add(indicatorRing);

    scene.add(group);

    return {
      id: cfg.id,
      name: cfg.name,
      group: group,
      headMesh: headMesh,
      indicatorRing: indicatorRing,
      x: cfg.x,
      z: cfg.z,
      initialY: screwInitialY,
      currentLift: 0,
      rotationAngle: 0,
      state: 'threaded' // 'threaded', 'engaged', 'removed'
    };
  }

  FASTENER_CONFIGS.forEach(cfg => {
    screws.push(createDetailedScrew(cfg));
  });

  // 4. Precision 3D Screwdriver Tool
  const screwdriverGroup = new THREE.Group();
  const HOVER_HEIGHT = 2.45;
  const ENGAGED_HEIGHT = 1.55;
  screwdriverGroup.position.set(0, HOVER_HEIGHT, 0);

  // Construct high-detail screwdriver model
  function buildProceduralScrewdriver() {
    const tool = new THREE.Group();

    // Ergonomic fluted handle (Dark textured rubber with cyan grips)
    const handleGeo = new THREE.CylinderGeometry(0.18, 0.14, 0.95, 8);
    const handleMat = new THREE.MeshStandardMaterial({
      color: 0x161e27,
      metalness: 0.3,
      roughness: 0.7,
    });
    const handle = new THREE.Mesh(handleGeo, handleMat);
    handle.position.y = 0.85;
    handle.castShadow = true;
    tool.add(handle);

    // Colored accent ring & cap
    const capGeo = new THREE.CylinderGeometry(0.19, 0.18, 0.15, 16);
    const capMat = new THREE.MeshStandardMaterial({
      color: 0x00e5ff,
      metalness: 0.7,
      roughness: 0.3,
      emissive: 0x005b66,
      emissiveIntensity: 0.35
    });
    const cap = new THREE.Mesh(capGeo, capMat);
    cap.position.y = 1.35;
    tool.add(cap);

    // Ergonomic grip inserts
    for (let g = 0; g < 4; g++) {
      const gripGeo = new THREE.BoxGeometry(0.04, 0.75, 0.36);
      const grip = new THREE.Mesh(gripGeo, capMat);
      grip.position.y = 0.85;
      grip.rotation.y = (g * Math.PI) / 4;
      tool.add(grip);
    }

    // Chrome steel shank / shaft
    const shankGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.75, 16);
    const shankMat = new THREE.MeshStandardMaterial({
      color: 0xdde5ed,
      metalness: 0.95,
      roughness: 0.15
    });
    const shank = new THREE.Mesh(shankGeo, shankMat);
    shank.position.y = 0.32;
    shank.castShadow = true;
    tool.add(shank);

    // Magnetic hardened hex bit tip
    const tipGeo = new THREE.CylinderGeometry(0.038, 0.02, 0.2, 6);
    const tipMat = new THREE.MeshStandardMaterial({
      color: 0x455a64,
      metalness: 0.9,
      roughness: 0.3
    });
    const tip = new THREE.Mesh(tipGeo, tipMat);
    tip.position.y = -0.06;
    tip.castShadow = true;
    tool.add(tip);

    // Alignment Laser Reticle projecting down to workpiece
    const laserGeo = new THREE.CylinderGeometry(0.003, 0.003, 1.5, 8);
    const laserMat = new THREE.MeshBasicMaterial({
      color: 0x00e5ff,
      transparent: true,
      opacity: 0.45
    });
    const laser = new THREE.Mesh(laserGeo, laserMat);
    laser.position.y = -0.85;
    tool.add(laser);

    return tool;
  }

  const defaultToolModel = buildProceduralScrewdriver();
  screwdriverGroup.add(defaultToolModel);
  scene.add(screwdriverGroup);

  // Attempt to load official 3D OBJ model if available
  if (typeof THREE.OBJLoader !== 'undefined') {
    const objLoader = new THREE.OBJLoader();
    objLoader.load('models/screwdriver.obj', function(loadedObj) {
      console.log('Official OBJ screwdriver loaded successfully!');
      // Calculate bounding box and normalize
      const bbox = new THREE.Box3().setFromObject(loadedObj);
      const size = bbox.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const targetHeight = 1.6;
      const scale = targetHeight / maxDim;
      loadedObj.scale.set(scale, scale, scale);

      // Re-center and point down
      loadedObj.rotation.x = Math.PI; // point downward
      loadedObj.position.y = 0.8;

      // Apply sleek metallic materials
      loadedObj.traverse(child => {
        if (child.isMesh) {
          child.castShadow = true;
          child.material = new THREE.MeshStandardMaterial({
            color: 0x212b36,
            metalness: 0.85,
            roughness: 0.25
          });
        }
      });

      // Replace procedural tool if desired
      screwdriverGroup.remove(defaultToolModel);
      screwdriverGroup.add(loadedObj);
    }, undefined, function(err) {
      console.log('Using procedural precision screwdriver model (optimal performance).');
    });
  }

  // --- State Machine & Kinematics ---
  const state = {
    mode: 'UNSCREW', // 'UNSCREW' or 'SCREW'
    targetScrewId: null,
    isEngaged: false,
    isDriving: false,
    hoverHeight: HOVER_HEIGHT,
    engagedHeight: ENGAGED_HEIGHT,
    toolVelocity: new THREE.Vector3(),
    speed: 3.2,
    keys: {
      w: false,
      a: false,
      s: false,
      d: false,
      up: false,
      left: false,
      down: false,
      right: false,
      space: false
    },
    unscrewSpeed: 4.8, // radians per sec
    liftPerRad: 0.045, // meters per radian
    plateDisengaged: false
  };

  // --- DOM Elements ---
  const guidanceEl = document.getElementById('guidance-text');
  const hudGuidanceBox = document.getElementById('hud-guidance');
  const modeValEl = document.getElementById('mode-value');
  const fastenerCounterEl = document.getElementById('fastener-counter');
  const telPosEl = document.getElementById('tel-pos');
  const telEngageEl = document.getElementById('tel-engage');
  const telProgressBar = document.getElementById('tel-progress-bar');
  const telProgressText = document.getElementById('tel-progress-text');
  const telTorqueEl = document.getElementById('tel-torque');
  const btnUnscrew = document.getElementById('btn-unscrew');

  // --- Guidance Text Helper ---
  function setGuidance(msg, type = 'normal') {
    guidanceEl.textContent = msg;
    hudGuidanceBox.className = 'hud-guidance';
    if (type === 'aligned') hudGuidanceBox.classList.add('aligned');
    if (type === 'engaged') hudGuidanceBox.classList.add('engaged');
  }

  // --- Proximity & Target Snapping Detection ---
  function updateProximity() {
    if (state.isEngaged) return;

    let nearest = null;
    let minDist = 0.65; // Engagement snap tolerance radius

    screws.forEach(screw => {
      if (screw.state === 'removed') {
        screw.indicatorRing.material.opacity = 0;
        return;
      }
      const dx = screwdriverGroup.position.x - screw.x;
      const dz = screwdriverGroup.position.z - screw.z;
      const dist = Math.sqrt(dx * dx + dz * dz);

      if (dist < minDist) {
        nearest = screw;
        minDist = dist;
      }
    });

    screws.forEach(screw => {
      if (screw.state !== 'removed') {
        const isNear = nearest && nearest.id === screw.id;
        screw.indicatorRing.material.opacity = isNear ? 0.9 : 0.0;
        const card = document.getElementById(`screw-card-${screw.id}`);
        if (card) {
          if (isNear) card.classList.add('active');
          else card.classList.remove('active');
        }
      }
    });

    if (nearest) {
      state.targetScrewId = nearest.id;
      setGuidance(`[TARGET ALIGNED] Above ${nearest.name} — PRESS [E] to Lower & Engage!`, 'aligned');
    } else {
      state.targetScrewId = null;
      const remaining = screws.filter(s => s.state !== 'removed').length;
      if (remaining > 0) {
        setGuidance(`[NAVIGATION] Move with [WASD] or [Arrow Keys] over a screw head (${remaining}/4 remaining)`, 'normal');
      }
    }
  }

  // --- Engage Action (E Key / Lower) ---
  function engageTool() {
    if (state.isEngaged) return;
    if (state.targetScrewId === null) {
      setGuidance('[WARNING] Tool must be aligned above a fastener head before engaging!', 'normal');
      return;
    }

    const screw = screws[state.targetScrewId];
    if (screw.state === 'removed') return;

    state.isEngaged = true;
    screwdriverGroup.position.x = screw.x;
    screwdriverGroup.position.z = screw.z;
    sfx.playLockChime();

    // Smooth descent handled in animate loop
    telEngageEl.textContent = `ENGAGED (${screw.name})`;
    telEngageEl.className = 'tel-val status-engaged';
    setGuidance(`[LOCKED] In ${screw.name} socket — HOLD [Space] / [Click] to Unscrew! ([Q] Disengage)`, 'engaged');

    const card = document.getElementById(`screw-card-${screw.id}`);
    if (card) {
      const stateEl = card.querySelector('.fastener-state');
      if (stateEl) {
        stateEl.textContent = 'ENGAGED';
        stateEl.className = 'fastener-state state-engaged';
      }
    }
  }

  // --- Disengage Action (Q Key / Raise) ---
  function disengageTool() {
    if (!state.isEngaged) return;
    state.isEngaged = false;
    telEngageEl.textContent = 'DISENGAGED (HOVER)';
    telEngageEl.className = 'tel-val status-disengaged';
    telTorqueEl.textContent = '0.0 N·m';

    if (state.targetScrewId !== null) {
      const screw = screws[state.targetScrewId];
      if (screw && screw.state !== 'removed') {
        const card = document.getElementById(`screw-card-${screw.id}`);
        if (card) {
          const stateEl = card.querySelector('.fastener-state');
          if (stateEl) {
            stateEl.textContent = 'THREADED';
            stateEl.className = 'fastener-state state-threaded';
          }
        }
      }
    }
    updateProximity();
  }

  // --- Toggle Mode (R Key) ---
  function toggleMode() {
    if (state.mode === 'UNSCREW') {
      state.mode = 'SCREW';
      modeValEl.textContent = 'FASTEN (CW)';
      modeValEl.style.color = '#ffab00';
    } else {
      state.mode = 'UNSCREW';
      modeValEl.textContent = 'UNSCREW (CCW)';
      modeValEl.style.color = '#00e5ff';
    }
  }

  // --- Complete Fastener Removal ---
  function onScrewUnthreaded(screw) {
    screw.state = 'removed';
    screw.headMesh.material.color.setHex(0x00e676); // Emerald success green
    screw.indicatorRing.material.opacity = 0;
    sfx.playSuccessChime();

    // Update Card
    const card = document.getElementById(`screw-card-${screw.id}`);
    if (card) {
      card.classList.remove('active');
      card.classList.add('completed');
      const stateEl = card.querySelector('.fastener-state');
      if (stateEl) {
        stateEl.textContent = 'REMOVED ✓';
        stateEl.className = 'fastener-state state-removed';
      }
    }

    // Decrement counter
    const remaining = screws.filter(s => s.state !== 'removed').length;
    fastenerCounterEl.textContent = `${remaining} / 4 REMAINING`;

    // Automatically disengage tool back to hover height
    disengageTool();

    if (remaining > 0) {
      setGuidance(`[SUCCESS] ${screw.name} Fully Detached! Move to next fastener.`, 'normal');
    } else {
      // All screws completed! Workpiece release animation
      state.plateDisengaged = true;
      setGuidance(`🎉 [WORKPIECE CLEARED] All 4 fasteners removed! Engine plate is free.`, 'engaged');
      fastenerCounterEl.textContent = `COMPLETED (0/4)`;
      fastenerCounterEl.style.color = '#00e676';
    }
  }

  // --- Reset Workshop ---
  function resetWorkshop() {
    screws.forEach(screw => {
      screw.state = 'threaded';
      screw.currentLift = 0;
      screw.rotationAngle = 0;
      screw.group.position.y = screw.initialY;
      screw.group.rotation.y = 0;
      screw.headMesh.material.color.setHex(0xd4af37);
      screw.indicatorRing.material.opacity = 0;

      const card = document.getElementById(`screw-card-${screw.id}`);
      if (card) {
        card.className = 'fastener-card';
        const stateEl = card.querySelector('.fastener-state');
        if (stateEl) {
          stateEl.textContent = 'THREADED';
          stateEl.className = 'fastener-state state-threaded';
        }
      }
    });

    state.plateDisengaged = false;
    plateGroup.position.y = 1.05;
    plateMesh.material.emissive.setHex(0x000000);
    disengageTool();
    fastenerCounterEl.textContent = '4 / 4 REMAINING';
    fastenerCounterEl.style.color = '#00e5ff';
    telProgressBar.style.width = '0%';
    telProgressText.textContent = '0%';
    setGuidance('[WORKSHOP RESET] Move with [WASD] or [Arrow Keys] over a screw head', 'normal');
  }

  // --- Keyboard Event Listeners ---
  window.addEventListener('keydown', (e) => {
    sfx.init();
    const key = e.key.toLowerCase();

    if (key === 'w' || key === 'arrowup') state.keys.w = true;
    if (key === 'a' || key === 'arrowleft') state.keys.a = true;
    if (key === 's' || key === 'arrowdown') state.keys.s = true;
    if (key === 'd' || key === 'arrowright') state.keys.d = true;

    if (key === ' ' || e.code === 'Space') {
      e.preventDefault();
      state.keys.space = true;
      state.isDriving = true;
      btnUnscrew.classList.add('active');
    }

    if (key === 'e') {
      engageTool();
    }

    if (key === 'q' || key === 'shift' || key === 'escape') {
      disengageTool();
    }

    if (key === 'r') {
      toggleMode();
    }
  });

  window.addEventListener('keyup', (e) => {
    const key = e.key.toLowerCase();
    if (key === 'w' || key === 'arrowup') state.keys.w = false;
    if (key === 'a' || key === 'arrowleft') state.keys.a = false;
    if (key === 's' || key === 'arrowdown') state.keys.s = false;
    if (key === 'd' || key === 'arrowright') state.keys.d = false;

    if (key === ' ' || e.code === 'Space') {
      state.keys.space = false;
      state.isDriving = false;
      btnUnscrew.classList.remove('active');
      telTorqueEl.textContent = '0.0 N·m';
    }
  });

  // --- Virtual On-Screen Controls Binding ---
  function bindHoldButton(el, onHold, onRelease) {
    if (!el) return;
    const start = (e) => {
      e.preventDefault();
      sfx.init();
      onHold();
    };
    const end = (e) => {
      e.preventDefault();
      onRelease();
    };
    el.addEventListener('mousedown', start);
    el.addEventListener('mouseup', end);
    el.addEventListener('mouseleave', end);
    el.addEventListener('touchstart', start, { passive: false });
    el.addEventListener('touchend', end, { passive: false });
  }

  // D-Pad buttons
  bindHoldButton(document.getElementById('btn-up'), () => { state.keys.w = true; }, () => { state.keys.w = false; });
  bindHoldButton(document.getElementById('btn-down'), () => { state.keys.s = true; }, () => { state.keys.s = false; });
  bindHoldButton(document.getElementById('btn-left'), () => { state.keys.a = true; }, () => { state.keys.a = false; });
  bindHoldButton(document.getElementById('btn-right'), () => { state.keys.d = true; }, () => { state.keys.d = false; });

  // Center button: Auto-snap to next unthreaded screw
  const btnCenter = document.getElementById('btn-center');
  if (btnCenter) {
    btnCenter.addEventListener('click', () => {
      const nextScrew = screws.find(s => s.state !== 'removed');
      if (nextScrew) {
        screwdriverGroup.position.x = nextScrew.x;
        screwdriverGroup.position.z = nextScrew.z;
        updateProximity();
      }
    });
  }

  // Action buttons
  const btnEngage = document.getElementById('btn-engage');
  if (btnEngage) btnEngage.addEventListener('click', engageTool);

  const btnRaise = document.getElementById('btn-raise');
  if (btnRaise) btnRaise.addEventListener('click', disengageTool);

  const btnToggleMode = document.getElementById('btn-toggle-mode');
  if (btnToggleMode) btnToggleMode.addEventListener('click', toggleMode);

  bindHoldButton(btnUnscrew, () => {
    state.isDriving = true;
    btnUnscrew.classList.add('active');
  }, () => {
    state.isDriving = false;
    btnUnscrew.classList.remove('active');
    telTorqueEl.textContent = '0.0 N·m';
  });

  const btnReset = document.getElementById('btn-reset-workshop');
  if (btnReset) btnReset.addEventListener('click', resetWorkshop);

  // Camera Presets
  document.getElementById('view-persp').addEventListener('click', () => {
    camera.position.set(0, 4.2, 5.2);
    controls.target.set(0, 1.1, 0);
  });
  document.getElementById('view-top').addEventListener('click', () => {
    camera.position.set(0, 6.8, 0.05);
    controls.target.set(0, 1.1, 0);
  });
  document.getElementById('view-focus').addEventListener('click', () => {
    camera.position.set(screwdriverGroup.position.x, screwdriverGroup.position.y + 1.2, screwdriverGroup.position.z + 2.2);
    controls.target.set(screwdriverGroup.position.x, screwdriverGroup.position.y, screwdriverGroup.position.z);
  });

  // --- Animation & Physics Loop ---
  let lastTime = performance.now();

  function animate() {
    requestAnimationFrame(animate);
    const now = performance.now();
    const dt = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;

    // 1. Tool Horizontal Movement (When not locked/engaged in a screw)
    if (!state.isEngaged) {
      let moveX = 0;
      let moveZ = 0;

      if (state.keys.w) moveZ -= 1;
      if (state.keys.s) moveZ += 1;
      if (state.keys.a) moveX -= 1;
      if (state.keys.d) moveX += 1;

      if (moveX !== 0 || moveZ !== 0) {
        const length = Math.sqrt(moveX * moveX + moveZ * moveZ);
        moveX /= length;
        moveZ /= length;

        screwdriverGroup.position.x += moveX * state.speed * dt;
        screwdriverGroup.position.z += moveZ * state.speed * dt;

        // Clamp to workbench surface
        screwdriverGroup.position.x = Math.max(-3.5, Math.min(3.5, screwdriverGroup.position.x));
        screwdriverGroup.position.z = Math.max(-2.2, Math.min(2.2, screwdriverGroup.position.z));

        updateProximity();
      }

      // Smooth return to hover height
      screwdriverGroup.position.y += (state.hoverHeight - screwdriverGroup.position.y) * 8.0 * dt;
    } else {
      // Engaged: Smooth descent into fastener socket
      const targetY = state.engagedHeight;
      screwdriverGroup.position.y += (targetY - screwdriverGroup.position.y) * 12.0 * dt;
    }

    // 2. Unscrewing / Driving Action
    if (state.isEngaged && state.isDriving && state.targetScrewId !== null) {
      const screw = screws[state.targetScrewId];
      if (screw && screw.state !== 'removed') {
        const dir = (state.mode === 'UNSCREW') ? -1 : 1;
        const dTheta = dir * state.unscrewSpeed * dt;

        // Rotate tool and screw synchronously
        screwdriverGroup.rotation.y += dTheta;
        screw.group.rotation.y += dTheta;
        screw.rotationAngle += Math.abs(dTheta);

        // Sound ratchet click
        sfx.playRatchetClick();

        // Lift screw upward along thread pitch
        const dLift = Math.abs(dTheta) * state.liftPerRad;
        screw.currentLift = Math.min(screwMaxLift, screw.currentLift + dLift);
        screw.group.position.y = screw.initialY + screw.currentLift;

        // Telemetry updates
        const progressPct = Math.min(100, Math.round((screw.currentLift / screwMaxLift) * 100));
        telProgressBar.style.width = `${progressPct}%`;
        telProgressText.textContent = `${progressPct}%`;
        telTorqueEl.textContent = `${(3.2 + Math.sin(now * 0.02) * 0.4).toFixed(1)} N·m`;

        // Check completion
        if (screw.currentLift >= screwMaxLift) {
          onScrewUnthreaded(screw);
        }
      }
    }

    // 3. Workpiece release animation
    if (state.plateDisengaged) {
      plateGroup.position.y = 1.05 + Math.sin(now * 0.003) * 0.08 + 0.12;
      plateMesh.material.emissive.setHex(0x003344);
    }

    // 4. Update Telemetry HUD
    telPosEl.textContent = `${screwdriverGroup.position.x.toFixed(2)}, ${screwdriverGroup.position.y.toFixed(2)}, ${screwdriverGroup.position.z.toFixed(2)}`;

    controls.update();
    renderer.render(scene, camera);
  }

  // --- Window Resize Handling ---
  window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });

  // Initial update & kickoff
  updateProximity();
  animate();

})();
