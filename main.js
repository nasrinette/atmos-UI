// --- App Data ---
const apps = [
  { name: "Mail", icon: "mail", style: "bg-blue-glass" },
  { name: "Calendar", icon: "calendar_month", style: "bg-white-glass text-red-500" },
  { name: "Photos", icon: "photo_library", style: "bg-white-glass" },
  { name: "Camera", icon: "photo_camera", style: "bg-dark-glass" },
  { name: "Maps", icon: "map", style: "bg-green-glass" },
  { name: "Weather", icon: "cloud", style: "bg-blue-glass" },
  { name: "Clock", icon: "schedule", style: "bg-black text-white" },
  { name: "Notes", icon: "edit_note", style: "bg-yellow-400 text-white" },
  { name: "Settings", icon: "settings", style: "bg-dark-glass" },
  { name: "Files", icon: "folder", style: "bg-blue-glass" },
  { name: "Health", icon: "favorite", style: "bg-white-glass text-red-500" },
  { name: "Wallet", icon: "account_balance_wallet", style: "bg-black text-white" },
];

// --- State ---
let state = {
  weather: "sunny",
  appOpen: false,
  width: 390,
  height: 800,
  snowIntensity: 1,
  rainIntensity: 1,
  sunIntensity: 1,
  fogIntensity: 1,
  lightningIntensity: 0,
  lightningTrigger: 0,
  deviceMode: 'mobile'
};

// --- Shader Sources (loaded dynamically) ---
let shaderSources = {
  vertex: '',
  fog: '',
  lightning: '',
  rain: '',
  ice: '',
  sun: ''
};

// --- Elements ---
let deviceFrame, phoneScreen, canvas, ctx, appGrid, dockContainer, statusBar;
let sunRays, sunFilter, lightningFlash, controlsPanel, menuToggleBtn;

// --- Menu Toggle Logic ---
window.toggleMenu = function() {
  controlsPanel.classList.toggle('open');
  menuToggleBtn.classList.toggle('active');
};

window.openApp = function (name) {
  // App open logic removed as per request to remove popup content
  console.log("Clicked app:", name);
};

window.closeApp = function () {
  state.appOpen = false;
  phoneScreen.classList.remove("app-open");
  setTimeout(updateColliders, 600);
};

// --- RENDER FUNCTION ---
function renderHome(mode) {
  // Clear current content
  appGrid.innerHTML = "";
  dockContainer.innerHTML = "";
  statusBar.innerHTML = "";

  // Widgets HTML Templates
  const weatherWidgetHTML = `
    <div class="app-widget" id="weatherWidget">
        <div id="shader-canvas-container" class="weather-shader-layer"></div>
        <div class="relative z-10 flex flex-row w-full h-full justify-between items-center px-6">
            <div class="widget-left">
                <div class="widget-main" id="widgetTime">12:45</div>
                <div class="widget-header" id="widgetCity">San Francisco</div>
            </div>
            <div class="widget-right">
                <div class="widget-sub">
                    <span class="material-symbols-outlined text-[28px]" id="widgetIcon">wb_sunny</span>
                    <span class="text-[28px] font-light" id="widgetTemp">72°</span>
                </div>
                <span class="text-white/60 text-[11px] mt-1" id="widgetCondition">Sunny</span>
            </div>
        </div>
    </div>
  `;

  const batteryWidgetHTML = `
    <div class="app-widget-square" id="batteryWidget">
        <div id="shader-container-widget2" class="weather-shader-layer"></div>
        <div class="relative z-10 flex flex-col w-full h-full justify-between">
            <div class="flex justify-between items-center mb-2">
            <span class="material-symbols-outlined text-white/80">battery_charging_full</span>
            <span class="text-xs font-medium text-white/60">Battery</span>
            </div>
            <div class="mt-auto">
            <div class="text-3xl font-light mb-1">82%</div>
            <div class="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
                <div class="bg-green-400 h-full w-[82%]"></div>
            </div>
            </div>
        </div>
    </div>
  `;

  // Generate App Icons HTML Helper
  const generateAppHTML = (app) => `
    <div class="app-item" onclick="openApp('${app.name}')">
        <div class="app-icon ${app.style}">
            ${app.name === "Photos" ? '<img src="https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=100&h=100&fit=crop&q=80" alt="Photos" class="absolute inset-0 w-full h-full object-cover opacity-80 rounded-[14px]">' : ""}
            <span class="material-symbols-outlined z-10 text-[28px]">${app.icon}</span>
        </div>
        <span class="app-name">${app.name}</span>
    </div>
  `;

  // Build HTML strings first to avoid multiple DOM reflows
  let gridContent = "";

  if (mode === 'desktop') {
      // DESKTOP LAYOUT
      // 1. Widgets Side by Side
      gridContent += weatherWidgetHTML;
      gridContent += batteryWidgetHTML;

      // 2. Apps below
      apps.slice(4).forEach(app => {
          gridContent += generateAppHTML(app);
      });

      appGrid.innerHTML = gridContent;

      // 3. Dock (6 items)
      const dockApps = [
          {name:'Phone', icon:'call', style:'bg-green-glass'},
          {name:'Messages', icon:'chat_bubble', style:'bg-green-glass'},
          {name:'Safari', icon:'public', style:'bg-blue-glass'},
          {name:'Music', icon:'music_note', style:'bg-red-glass'},
          {name:'Mail', icon:'mail', style:'bg-blue-glass'},
          {name:'Settings', icon:'settings', style:'bg-dark-glass'}
      ];
      dockContainer.innerHTML = `<div id="shader-container-dock" class="weather-shader-layer"></div>` +
          dockApps.map(app => `
            <div class="app-item" onclick="openApp('${app.name}')">
                <div class="app-icon ${app.style}">
                    <span class="material-symbols-outlined">${app.icon}</span>
                </div>
            </div>
          `).join('');

      // 4. Status Bar
      statusBar.innerHTML = `
          <div class="left-info">
              <span id="statusBarTime">12:45</span>
              <span class="opacity-60">Nov 28</span>
          </div>
          <div class="right-info opacity-90">
              <span class="material-symbols-outlined text-[18px]">wifi</span>
              <span class="material-symbols-outlined text-[18px]">battery_full</span>
          </div>
      `;

  } else if (mode === 'watch') {
      // WATCH LAYOUT: ONLY WEATHER WIDGET
      appGrid.innerHTML = weatherWidgetHTML;
      dockContainer.innerHTML = ''; // No dock for watch

  } else if (mode === 'car') {
      // CAR LAYOUT: Widgets + Apps + Side Dock

      // 1. Weather Widget
      gridContent += weatherWidgetHTML;

      // 2. Battery Widget + Apps
      gridContent += batteryWidgetHTML;
      apps.slice(4).forEach(app => gridContent += generateAppHTML(app));

      appGrid.innerHTML = gridContent;

      // 3. Dock (Exactly 3 items)
      const dockApps = [
          {name:'Maps', icon:'map', style:'bg-green-glass'},
          {name:'Music', icon:'music_note', style:'bg-red-glass'},
          {name:'Phone', icon:'call', style:'bg-green-glass'}
      ];
      dockContainer.innerHTML = `<div id="shader-container-dock" class="weather-shader-layer"></div>` +
          dockApps.map(app => `
            <div class="app-item" onclick="openApp('${app.name}')">
                <div class="app-icon ${app.style}">
                    <span class="material-symbols-outlined">${app.icon}</span>
                </div>
            </div>
          `).join('');

  } else {
      // MOBILE/DEFAULT LAYOUT
      // 1. Weather Widget
      gridContent += weatherWidgetHTML;

      // 2. Some Apps
      apps.slice(4, 8).forEach(app => gridContent += generateAppHTML(app));

      // 3. Battery Widget + More Apps
      gridContent += batteryWidgetHTML;
      apps.slice(8).forEach(app => gridContent += generateAppHTML(app));

      appGrid.innerHTML = gridContent;

      // 4. Dock (4 items)
      const dockApps = [
          {name:'Phone', icon:'call', style:'bg-green-glass'},
          {name:'Messages', icon:'chat_bubble', style:'bg-green-glass'},
          {name:'Safari', icon:'public', style:'bg-blue-glass'},
          {name:'Music', icon:'music_note', style:'bg-red-glass'}
      ];
      dockContainer.innerHTML = `<div id="shader-container-dock" class="weather-shader-layer"></div>` +
          dockApps.map(app => `
            <div class="app-item" onclick="openApp('${app.name}')">
                <div class="app-icon ${app.style}">
                    <span class="material-symbols-outlined">${app.icon}</span>
                </div>
            </div>
          `).join('');

      // 5. Status Bar
      statusBar.innerHTML = `
        <span>12:45</span>
        <div class="dynamic-island"></div>
        <div class="flex items-center gap-1.5 opacity-90">
            <span class="material-symbols-outlined text-[18px]">signal_cellular_alt</span>
            <span class="material-symbols-outlined text-[18px]">wifi</span>
            <span class="material-symbols-outlined text-[18px]">battery_full</span>
        </div>
      `;
  }

  // Re-init shaders for new elements
  weatherShader.init("shader-canvas-container");
  if (mode !== 'watch') {
     widget2Shader.init("shader-container-widget2");
     dockShader.init("shader-container-dock");
  } else {
     // Clean up unused shaders for watch
     widget2Shader.stop();
     dockShader.stop();
  }

  // Re-apply current weather state to new shaders
  setTimeout(() => setWeather(state.weather), 50);
}

// --- THREE.JS SHADER CONTROLLER ---
class WeatherEffectController {
  constructor() {
    this.container = null;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.mesh = null;
    this.clock = new THREE.Clock();
    this.rafId = null;
    this.isPlaying = false;
    this.materials = { rain: null, ice: null, sun: null, fog: null };
    this.currentMode = null;
  }

  init(containerId) {
    // IMPORTANT: Stop any previous loops first to ensure state reset
    this.stop();

    // Dispose old renderer to prevent context loss
    if (this.renderer) {
        this.renderer.dispose();
        this.renderer.forceContextLoss();
        this.renderer = null;
    }

    this.container = document.getElementById(containerId);
    if (!this.container) return;

    // Clean up old children just in case
    while(this.container.firstChild) this.container.removeChild(this.container.firstChild);

    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    this.renderer.setSize(width, height);
    this.renderer.setClearColor(0x000000, 0);
    this.container.appendChild(this.renderer.domElement);

    const vertexShader = shaderSources.vertex;
    const commonUniforms = {
       u_resolution: { value: new THREE.Vector2(width, height) },
       u_time: { value: 0 },
       u_intensity: { value: 1.0 }
    };

    this.materials.rain = new THREE.ShaderMaterial({
      uniforms: { ...commonUniforms, u_speed: { value: 0.5 }, u_dropScale: { value: 300.0 } },
      vertexShader,
      fragmentShader: shaderSources.rain,
      transparent: true,
    });

    this.materials.ice = new THREE.ShaderMaterial({
      uniforms: { ...commonUniforms },
      vertexShader,
      fragmentShader: shaderSources.ice,
      transparent: true,
    });

     this.materials.sun = new THREE.ShaderMaterial({
      uniforms: { ...commonUniforms },
      vertexShader,
      fragmentShader: shaderSources.sun,
      transparent: true,
    });

    this.materials.fog = new THREE.ShaderMaterial({
      uniforms: { ...commonUniforms },
      vertexShader,
      fragmentShader: shaderSources.fog,
      transparent: true,
    });

    this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.materials.rain);
    this.scene.add(this.mesh);
  }

  resize(w, h) {
      if(this.renderer) this.renderer.setSize(w, h);
      Object.values(this.materials).forEach(m => {
          if(m) m.uniforms.u_resolution.value.set(w, h);
      });
  }

  setMode(mode) {
    if (mode === "rain") {
      this.mesh.material = this.materials.rain;
      this.currentMode = "rain";
      this.play();
    } else if (mode === "ice") {
      this.mesh.material = this.materials.ice;
      this.currentMode = "ice";
      this.play();
    } else if (mode === "sun") {
      this.mesh.material = this.materials.sun;
      this.currentMode = "sun";
      this.play();
    } else if (mode === "fog") {
      this.mesh.material = this.materials.fog;
      this.currentMode = "fog";
      this.play();
    } else {
      this.stop();
    }
  }

  play() {
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.clock.start();
    this.animate();
    if (this.container) this.container.classList.add("active");
  }

  stop() {
    this.isPlaying = false;
    if (this.rafId) cancelAnimationFrame(this.rafId);
    if (this.container) this.container.classList.remove("active");
  }

  updateIntensity(val, type) {
    if (type === "rain" && this.materials.rain) {
      this.materials.rain.uniforms.u_intensity.value = val;
      this.materials.rain.uniforms.u_speed.value = val * 0.4;
    }
    if (type === "ice" && this.materials.ice) this.materials.ice.uniforms.u_intensity.value = val;
    if (type === "sun" && this.materials.sun) this.materials.sun.uniforms.u_intensity.value = val;
    if (type === "fog" && this.materials.fog) this.materials.fog.uniforms.u_intensity.value = val;
  }

  animate() {
    if (!this.isPlaying) return;
    this.rafId = requestAnimationFrame(() => this.animate());
    const elapsed = this.clock.getElapsedTime();
    if (this.currentMode) this.materials[this.currentMode].uniforms.u_time.value = elapsed;
    this.renderer.render(this.scene, this.camera);
  }
}

// --- FULL SCREEN SHADER CONTROLLER ---
class FullScreenShaderController {
  constructor() {
    this.container = null;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.mesh = null;
    this.clock = new THREE.Clock();
    this.rafId = null;
    this.isPlaying = false;
    this.materials = { lightning: null, fog: null };
    this.currentMode = null;
  }

  init(containerId) {
      this.stop(); // IMPORTANT: Stop previous loop

      // Dispose old renderer to prevent context loss
      if (this.renderer) {
          this.renderer.dispose();
          this.renderer.forceContextLoss();
          this.renderer = null;
      }

      this.container = document.getElementById(containerId);
      if (!this.container) return;
      const width = this.container.clientWidth || 390;
      const height = this.container.clientHeight || 800;

      this.scene = new THREE.Scene();
      this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
      this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      this.renderer.setSize(width, height);
      this.renderer.setClearColor(0x000000, 0);
      this.container.appendChild(this.renderer.domElement);
      const vertexShader = shaderSources.vertex;

      this.materials.lightning = new THREE.ShaderMaterial({
          uniforms: {
              u_resolution: { value: new THREE.Vector2(width, height) },
              u_time: { value: 0 },
              u_trigger: { value: 0 },
              u_seed: { value: 0.5 }
          },
          vertexShader,
          fragmentShader: shaderSources.lightning,
          transparent: true
      });

      this.materials.fog = new THREE.ShaderMaterial({
          uniforms: {
              u_resolution: { value: new THREE.Vector2(width, height) },
              u_time: { value: 0 },
              u_intensity: { value: 1.0 },
          },
          vertexShader,
          fragmentShader: shaderSources.fog,
          transparent: true
      });

      this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.materials.lightning);
      this.scene.add(this.mesh);
  }

  resize(w, h) {
      if(this.renderer) this.renderer.setSize(w, h);
      if(this.materials.lightning) this.materials.lightning.uniforms.u_resolution.value.set(w, h);
      if(this.materials.fog) this.materials.fog.uniforms.u_resolution.value.set(w, h);
  }

  setMode(mode) {
      this.currentMode = mode;
      if(mode === 'lightning') {
          this.mesh.material = this.materials.lightning;
          this.play();
      } else if (mode === 'fog') {
          this.mesh.material = this.materials.fog;
          this.play();
      } else {
          this.stop();
      }
  }

  play() {
      if (this.isPlaying) return;
      this.isPlaying = true;
      this.clock.start();
      this.container.classList.add("active");
      this.animate();
  }

  stop() {
      this.isPlaying = false;
      if (this.container) this.container.classList.remove("active");
      cancelAnimationFrame(this.rafId);
  }

  triggerLightning() {
      if(this.currentMode !== 'lightning') return;
      this.materials.lightning.uniforms.u_seed.value = Math.random();
      state.lightningTrigger = 1.0;
      this.materials.lightning.uniforms.u_trigger.value = 1.0;
  }

  updateIntensity(val) {
      if(this.currentMode === 'fog' && this.materials.fog) {
          this.materials.fog.uniforms.u_intensity.value = val;
      }
  }

  animate() {
      if (!this.isPlaying) return;
      this.rafId = requestAnimationFrame(() => this.animate());
      const elapsed = this.clock.getElapsedTime();

      if(this.currentMode === 'lightning') {
          this.materials.lightning.uniforms.u_time.value = elapsed;
          if (state.lightningTrigger > 0) {
              state.lightningTrigger -= 0.15;
              if(state.lightningTrigger < 0) state.lightningTrigger = 0;
              this.materials.lightning.uniforms.u_trigger.value = state.lightningTrigger;
          }
      } else if (this.currentMode === 'fog') {
           this.materials.fog.uniforms.u_time.value = elapsed;
      }
      this.renderer.render(this.scene, this.camera);
  }
}

const weatherShader = new WeatherEffectController();
const widget2Shader = new WeatherEffectController();
const dockShader = new WeatherEffectController();
const fsShader = new FullScreenShaderController();
const allShaders = [weatherShader, widget2Shader, dockShader];

// --- Load Shaders ---
async function loadShaders() {
  const shaderFiles = ['vertex', 'fog', 'lightning', 'rain', 'ice', 'sun'];
  const promises = shaderFiles.map(async (name) => {
    const response = await fetch(`shaders/${name}.glsl`);
    shaderSources[name] = await response.text();
  });
  await Promise.all(promises);
}

// --- Initialization ---
async function init() {
  // Get DOM elements
  deviceFrame = document.getElementById("deviceFrame");
  phoneScreen = document.getElementById("phoneScreen");
  canvas = document.getElementById("weatherCanvas");
  ctx = canvas.getContext("2d");
  appGrid = document.getElementById("appGrid");
  dockContainer = document.getElementById("dockContainer");
  statusBar = document.getElementById("statusBar");
  sunRays = document.getElementById("sunRays");
  sunFilter = document.getElementById("sunFilter");
  lightningFlash = document.getElementById("lightningFlash");
  controlsPanel = document.getElementById("controlsPanel");
  menuToggleBtn = document.getElementById("menuToggle");

  // Load shaders first
  await loadShaders();

  fsShader.init("fsCanvasContainer");
  renderHome('mobile');
  resize();
  setWeather("sunny");
  updateWidget();
  setInterval(updateWidget, 1000);
  requestAnimationFrame(animate);
}

// --- Resize & Layout ---
let colliders = [];
let widgetColliders = [];

function resize() {
  const rect = phoneScreen.getBoundingClientRect();
  state.width = rect.width;
  state.height = rect.height;
  canvas.width = rect.width;
  canvas.height = rect.height;

  fsShader.resize(rect.width, rect.height);
  updateColliders();
}

function updateColliders() {
  colliders = [];
  widgetColliders = [];
  const canvasRect = canvas.getBoundingClientRect();

  document.querySelectorAll(".app-icon").forEach((el) => {
    const rect = el.getBoundingClientRect();
    colliders.push({
      x: rect.left - canvasRect.left,
      y: rect.top - canvasRect.top,
      w: rect.width,
      h: rect.height,
      el: el,
    });
  });

  document.querySelectorAll(".app-widget, .app-widget-square, .dock-container, .app-view-container").forEach(el => {
       if(window.getComputedStyle(el).opacity === '0') return;
       const rect = el.getBoundingClientRect();
       widgetColliders.push({
          x: rect.left - canvasRect.left,
          y: rect.top - canvasRect.top,
          w: rect.width,
          h: rect.height,
       });
  });
}

// --- Device Switching ---
window.setDevice = function(mode, btn) {
    state.deviceMode = mode;
    deviceFrame.className = '';
    deviceFrame.classList.add(mode);

    document.querySelectorAll('.device-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    renderHome(mode);

    setTimeout(() => {
        resize();
         const widgets = [
            { s: weatherShader, id: "weatherWidget" },
            { s: widget2Shader, id: "batteryWidget" },
            { s: dockShader, id: "dockContainer" }
         ];
         widgets.forEach(item => {
             const el = document.getElementById(item.id);
             if(el && item.s) {
                 item.s.resize(el.clientWidth, el.clientHeight);
             }
         });
    }, 600);
};

// --- Widget Update ---
function updateWidget() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  document.getElementById("widgetTime").innerText = `${hours}:${minutes}`;
  const barTime = document.querySelector(".status-bar span") || document.getElementById("statusBarTime");
  if(barTime) barTime.innerText = `${hours}:${minutes}`;

  const iconEl = document.getElementById("widgetIcon");
  const tempEl = document.getElementById("widgetTemp");
  const condEl = document.getElementById("widgetCondition");
  const widgetEl = document.getElementById("weatherWidget");

  if (state.weather === "sunny") {
    iconEl.innerText = "wb_sunny"; tempEl.innerText = "72°"; condEl.innerText = "Sunny";
    if (state.sunIntensity > 0) {
      const i = state.sunIntensity;
      const shadow = `0 15px 35px -5px rgba(0, 0, 0, 0.3), 0 10px 20px -5px rgba(255, 160, 0, ${Math.min(1, 0.15 * i)}), inset 0 1px 0 rgba(255, 255, 255, ${Math.min(1, 0.6 * i)}), inset 0 -1px 0 rgba(255, 200, 100, ${Math.min(1, 0.3 * i)})`;
      widgetEl.style.boxShadow = shadow;
      widgetEl.style.borderColor = `rgba(255, 255, 255, ${0.2 + 0.1 * i})`;
    }
  } else if (state.weather === "rain") {
    iconEl.innerText = "rainy"; tempEl.innerText = "58°"; condEl.innerText = "Rain";
    widgetEl.style.boxShadow = ""; widgetEl.style.borderColor = "rgba(255, 255, 255, 0.2)";
  } else if (state.weather === "snow") {
    iconEl.innerText = "ac_unit"; tempEl.innerText = "28°"; condEl.innerText = "Snow";
    widgetEl.style.boxShadow = ""; widgetEl.style.borderColor = "rgba(255, 255, 255, 0.3)";
  } else if (state.weather === "fog") {
      iconEl.innerText = "foggy"; tempEl.innerText = "55°"; condEl.innerText = "Foggy";
      widgetEl.style.boxShadow = ""; widgetEl.style.borderColor = "rgba(255, 255, 255, 0.1)";
  }
}

// --- Interaction ---
window.setSnowIntensity = function (val) {
  state.snowIntensity = parseFloat(val);
  document.getElementById("snowVal").innerText = state.snowIntensity + "x";
  allShaders.forEach(s => s.updateIntensity(state.snowIntensity, "ice"));
};

window.setRainIntensity = function (val) {
  state.rainIntensity = parseFloat(val);
  document.getElementById("rainVal").innerText = state.rainIntensity + "x";
  allShaders.forEach(s => s.updateIntensity(state.rainIntensity, "rain"));
};

window.setLightningIntensity = function (val) {
    state.lightningIntensity = parseFloat(val);
    const percent = Math.round(state.lightningIntensity * 100);
    document.getElementById("lightningVal").innerText = percent + "%";
}

window.setSunIntensity = function (val) {
  state.sunIntensity = parseFloat(val);
  document.getElementById("sunVal").innerText = state.sunIntensity + "x";
  if (sunRays) sunRays.style.opacity = state.sunIntensity;
  if (sunFilter) sunFilter.style.opacity = state.sunIntensity;
  allShaders.forEach(s => s.updateIntensity(state.sunIntensity, "sun"));

  const i = state.sunIntensity;
  const shadow = `0 15px 35px -5px rgba(0, 0, 0, 0.3), 0 10px 20px -5px rgba(255, 160, 0, ${Math.min(1, 0.15 * i)}), inset 0 1px 0 rgba(255, 255, 255, ${Math.min(1, 0.6 * i)}), inset 0 -1px 0 rgba(255, 200, 100, ${Math.min(1, 0.3 * i)})`;
  const border = `rgba(255, 255, 255, ${0.2 + 0.1 * i})`;

  document.querySelectorAll(".app-icon").forEach((icon) => {
    if (state.weather === "sunny") { icon.style.boxShadow = shadow; icon.style.borderColor = border; }
  });
  document.querySelectorAll(".app-widget, .app-widget-square, .dock-container").forEach((widget) => {
      if (state.weather === "sunny") { widget.style.boxShadow = shadow; widget.style.borderColor = border; }
  });
};

window.setFogIntensity = function(val) {
  state.fogIntensity = parseFloat(val);
  document.getElementById("fogVal").innerText = state.fogIntensity + "x";
  allShaders.forEach(s => s.updateIntensity(state.fogIntensity, "fog"));
  fsShader.updateIntensity(state.fogIntensity);
};

window.setWeather = function (type, btn) {
  const prevWeather = state.weather;
  state.weather = type;
  updateWidget();

  document.querySelectorAll(".controls-panel .control-btn").forEach((b) => b.classList.remove("active"));
  if (btn) btn.classList.add("active");
  document.querySelectorAll(".wallpaper").forEach((w) => w.classList.remove("active"));

  particles.drops = []; particles.splashes = []; particles.runDowns = []; particles.snow = []; particles.snowPiles = []; particles.dust = [];

  const snowSlider = document.getElementById("snowSliderContainer");
  const sunSlider = document.getElementById("sunSliderContainer");
  const rainSlider = document.getElementById("rainSliderContainer");
  const fogSlider = document.getElementById("fogSliderContainer");

  [snowSlider, sunSlider, rainSlider, fogSlider].forEach((el) => {
      el.classList.remove("max-h-48", "opacity-100");
      el.classList.remove("max-h-32", "opacity-100");
  });

  sunRays.classList.remove("active");
  sunFilter.classList.remove("active");
  document.querySelectorAll(".app-icon").forEach((icon) => {
    icon.style.boxShadow = ""; icon.style.borderColor = "";
  });
  document.querySelectorAll(".app-widget, .app-widget-square, .dock-container").forEach((widget) => {
      widget.style.boxShadow = ""; widget.style.borderColor = "rgba(255, 255, 255, 0.15)";
  });

  if (sunRays) sunRays.style.opacity = "";
  if (sunFilter) sunFilter.style.opacity = "";

  const applyShaderMode = () => {
        if (type === "rain") {
        rainSlider.classList.add("max-h-48", "opacity-100");
        allShaders.forEach(s => { s.setMode("rain"); s.updateIntensity(state.rainIntensity, "rain"); });
        fsShader.setMode('lightning');
      } else if (type === "snow") {
        snowSlider.classList.add("max-h-32", "opacity-100");
        allShaders.forEach(s => { s.setMode("ice"); s.updateIntensity(state.snowIntensity, "ice"); });
         fsShader.stop();
      } else if (type === "sunny") {
         allShaders.forEach(s => { s.setMode("sun"); s.updateIntensity(state.sunIntensity, "sun");});
         fsShader.stop();
      } else if (type === "fog") {
         fogSlider.classList.add("max-h-32", "opacity-100");
         allShaders.forEach(s => { s.setMode("fog"); s.updateIntensity(state.fogIntensity, "fog");});
         fsShader.setMode("fog");
         fsShader.updateIntensity(state.fogIntensity);
      } else {
        allShaders.forEach(s => s.setMode(null));
        fsShader.stop();
      }
  };

  const shaderLayers = document.querySelectorAll('.weather-shader-layer');
  applyShaderMode();

  if (type === "sunny") {
    document.getElementById("bg-sunny").classList.add("active");
    sunRays.classList.add("active");
    sunFilter.classList.add("active");
    sunSlider.classList.add("max-h-32", "opacity-100");
    setSunIntensity(document.querySelector("#sunSliderContainer input").value);
  } else {
     document.getElementById("bg-sunny").classList.add("active");
  }
};

// --- Physics Engine ---
const particles = { drops: [], splashes: [], runDowns: [], snow: [], snowPiles: [], dust: [] };

class RainDrop {
  constructor(x, y) {
    this.x = x; this.y = y;
    this.vy = 15 + Math.random() * 5;
    this.len = 15; this.dead = false;
  }
  update() {
    this.y += this.vy;
    for (let c of colliders) {
        if (this.x > c.x + 5 && this.x < c.x + c.w - 5 && this.y >= c.y && this.y < c.y + 20 && this.y - this.vy < c.y + 10) {
          this.dead = true; this.y = c.y; this.splash(this.x, this.y);
          if (Math.random() < 0.4) particles.runDowns.push(new RunDownDrop(this.x, c.y, c.y + c.h));
          return;
        }
    }
    if (this.y > state.height) this.dead = true;
  }
  splash(x, y) { for (let i = 0; i < 3; i++) particles.splashes.push(new Splash(x, y)); }
  draw(ctx) {
    ctx.beginPath(); ctx.strokeStyle = "rgba(200, 220, 255, 0.5)"; ctx.lineWidth = 1.5;
    ctx.moveTo(this.x, this.y - this.len); ctx.lineTo(this.x, this.y); ctx.stroke();
  }
}

class RunDownDrop {
  constructor(x, y, limitY) {
    this.x = x; this.y = y; this.limitY = limitY; this.vy = 0.5; this.life = 1.0; this.dead = false; this.path = [];
  }
  update() {
    this.vy += 0.05; this.y += this.vy;
    if (Math.random() > 0.5) this.x += Math.random() - 0.5;
    this.path.push({ x: this.x, y: this.y });
    if (this.path.length > 10) this.path.shift();
    if (this.y >= this.limitY) { this.dead = true; let drop = new RainDrop(this.x, this.y); drop.vy = 2; particles.drops.push(drop); }
  }
  draw(ctx) {
    ctx.fillStyle = `rgba(200, 220, 255, 0.6)`; ctx.beginPath(); ctx.arc(this.x, this.y, 2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.strokeStyle = `rgba(200, 220, 255, 0.3)`; ctx.lineWidth = 1.5;
    if (this.path.length > 0) { ctx.moveTo(this.path[0].x, this.path[0].y); for (let p of this.path) ctx.lineTo(p.x, p.y); ctx.stroke(); }
  }
}

class Splash {
  constructor(x, y) { this.x = x; this.y = y; this.vx = (Math.random() - 0.5) * 4; this.vy = -Math.random() * 3; this.life = 1.0; }
  update() { this.x += this.vx; this.y += this.vy; this.vy += 0.5; this.life -= 0.1; if (this.life <= 0) this.dead = true; }
  draw(ctx) { ctx.fillStyle = `rgba(200, 220, 255, ${this.life})`; ctx.beginPath(); ctx.arc(this.x, this.y, 1, 0, Math.PI * 2); ctx.fill(); }
}

class SnowFlake {
  constructor(x, y) {
    this.x = x; this.y = y; this.vy = 1 + Math.random() * 1.5; this.vx = (Math.random() - 0.5) * 0.5; this.size = 1.5 + Math.random(); this.dead = false;
  }
  update() {
    this.x += this.vx; this.y += this.vy;
    for (let c of colliders) {
        if (this.x > c.x + 10 && this.x < c.x + c.w - 10 && this.y >= c.y && this.y < c.y + 10 && this.y - this.vy < c.y) {
          this.dead = true; if (Math.random() > 0.4) particles.snowPiles.push(new SnowPile(this.x, c.y + Math.random() * 2, this.size)); return;
        }
    }
    if (this.y > state.height) this.dead = true;
  }
  draw(ctx) { ctx.fillStyle = "rgba(255,255,255,0.8)"; ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill(); }
}

class SnowPile {
  constructor(x, y, size) { this.x = x; this.y = y; this.size = size * 2; this.life = 1.0; }
  draw(ctx) { ctx.fillStyle = `rgba(255,255,255,${this.life})`; ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill(); }
}

class Dust {
  constructor() {
    this.x = Math.random() * state.width; this.y = Math.random() * state.height;
    this.vx = (Math.random() - 0.5) * 0.5; this.vy = (Math.random() - 0.5) * 0.5;
    this.size = Math.random() * 3 + 0.5; this.alpha = 0; this.lifePhase = Math.random() * 10; this.speed = 0.02 + Math.random() * 0.02;
  }
  update() {
    this.x += this.vx; this.y += this.vy; this.lifePhase += this.speed; this.alpha = ((Math.sin(this.lifePhase) + 1) / 2) * 0.7;
    if (this.x < 0) this.x = state.width; if (this.x > state.width) this.x = 0;
    if (this.y < 0) this.y = state.height; if (this.y > state.height) this.y = 0;
  }
  draw(ctx) {
    ctx.fillStyle = `rgba(255, 250, 200, ${this.alpha})`; ctx.shadowBlur = 6; ctx.shadowColor = "rgba(255, 255, 200, 0.6)";
    ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
  }
}

function triggerFlash() {
    lightningFlash.style.opacity = "0.6";
    setTimeout(() => { lightningFlash.style.opacity = "0"; }, 150);
    fsShader.triggerLightning();
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const isBehindWidget = (x, y) => widgetColliders.some(c => x >= c.x && x <= c.x + c.w && y >= c.y && y <= c.y + c.h);

  if (state.weather === 'rain' && state.lightningIntensity > 0) {
      if (Math.random() < 0.015 * state.lightningIntensity) triggerFlash();
  }

  if (state.weather === "sunny") {
    const targetDust = Math.floor(60 * state.sunIntensity);
    if (particles.dust.length < targetDust) particles.dust.push(new Dust());
    else if (particles.dust.length > targetDust) particles.dust.pop();

    for (let p of particles.dust) {
      p.update();
      const baseAlpha = p.alpha;
      ctx.globalAlpha = isBehindWidget(p.x, p.y) ? baseAlpha * 0.4 : 1.0;
      p.draw(ctx); ctx.globalAlpha = 1.0;
    }
  } else {
    let rate = 0;
    if (state.weather === "rain") rate = 2 * state.rainIntensity;
    if (state.weather === "snow") rate = 2 * state.snowIntensity;

    for (let i = 0; i < Math.ceil(rate); i++) {
      if (Math.random() < rate % 1 && i === Math.floor(rate)) continue;
      const x = Math.random() * state.width;
      if (state.weather.includes("rain")) particles.drops.push(new RainDrop(x, -20));
      else if (state.weather.includes("snow")) particles.snow.push(new SnowFlake(x, -20));
    }

    ["drops", "runDowns", "splashes", "snow"].forEach((key) => {
      for (let i = particles[key].length - 1; i >= 0; i--) {
        let p = particles[key][i]; p.update();
        if (p.dead) particles[key].splice(i, 1);
        else {
          ctx.globalAlpha = isBehindWidget(p.x, p.y) ? 0.3 : 1.0;
          p.draw(ctx); ctx.globalAlpha = 1.0;
        }
      }
    });

    for (let i = particles.snowPiles.length - 1; i >= 0; i--) {
      let p = particles.snowPiles[i]; p.life -= 0.001;
      if (p.life <= 0) particles.snowPiles.splice(i, 1); else p.draw(ctx);
    }
  }
  requestAnimationFrame(animate);
}

window.addEventListener("load", init);
window.addEventListener("resize", resize);
