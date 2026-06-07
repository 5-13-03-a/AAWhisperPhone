// ==========================================
// Settings 设置页
// ==========================================

const SettingsPage = (() => {
  let panel = null;
  const COLORS = ['#ffffff', '#f3f5f7', '#f6f5f2', '#f9f4ec'];

  function buildHTML() {
    return `
      <div class="settings-panel" id="settingsPanel">
        <div class="st-island"></div>
        <div class="st-statusbar">
          <span class="st-time" id="stTime">17:27</span>
          <div class="st-icons">
            <svg viewBox="0 0 20 14" width="18" height="11"><rect x="0" y="10" width="3" height="4" rx="0.8"/><rect x="4.5" y="7" width="3" height="7" rx="0.8"/><rect x="9" y="4" width="3" height="10" rx="0.8"/><rect x="13.5" y="0" width="3" height="14" rx="0.8"/></svg>
            <svg viewBox="0 0 16 12" width="14" height="11"><path d="M8 9.5a1.4 1.4 0 110 2.8 1.4 1.4 0 010-2.8zM4.2 7.1a5.5 5.5 0 017.6 0 .7.7 0 11-1 1 4.1 4.1 0 00-5.6 0 .7.7 0 11-1-1zM1.6 4.3a9.2 9.2 0 0112.8 0 .7.7 0 11-1 1 7.8 7.8 0 00-10.8 0 .7.7 0 11-1-1z"/></svg>
            <svg viewBox="0 0 28 14" width="24" height="11"><rect x="0" y="0" width="24" height="13" rx="3" stroke="rgba(28,28,28,0.45)" stroke-width="1.2" fill="none"/><rect x="25" y="3.5" width="3" height="6" rx="1" fill="rgba(28,28,28,0.45)"/><rect x="2" y="2" width="18" height="9" rx="1.5" fill="#1c1c1c"/></svg>
          </div>
        </div>

        <div class="st-topbar">
          <div class="st-btn-c" id="stBack">
            <svg viewBox="0 0 24 24"><path d="M14.7 5.3a1 1 0 010 1.4L9.4 12l5.3 5.3a1 1 0 11-1.4 1.4l-6-6a1 1 0 010-1.4l6-6a1 1 0 011.4 0z"/></svg>
          </div>
          <div class="st-topbar-title">
            <div class="st-eyebrow">⋆ A QUIET DESK ⋆</div>
            <div class="st-title-main">Settings</div>
          </div>
          <div class="st-btn-c st-btn-color" id="stBtnColor"></div>
        </div>

        <div class="st-scroll">

          <div class="st-me">
            <div class="st-me-row">
              <div class="st-me-avatar"></div>
              <div class="st-me-info">
                <div class="st-me-tag">— ME</div>
                <div class="st-me-name">挟み猫ドーナツ</div>
                <div class="st-me-handle">@kitten · ID 2025</div>
              </div>
              <div class="st-me-edit">
                <svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
              </div>
            </div>
            <div class="st-me-divider"></div>
            <div class="st-me-bio">.* 東京の雪とあなたの涙 私はもう気にしたくない +</div>
          </div>

          <div class="st-tile-grid">
            <div class="st-tile" id="stTileFs">
              <div class="st-t-icon">
                <svg viewBox="0 0 24 24"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>
              </div>
              <div class="st-t-bot">
                <div class="st-t-info">
                  <div class="st-t-title">全屏模式</div>
                  <div class="st-t-sub">FULLSCREEN</div>
                </div>
                <div class="st-t-status" id="stFsStatus">OFF</div>
              </div>
            </div>
            <div class="st-tile">
              <div class="st-t-icon mint">
                <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18"/></svg>
              </div>
              <div class="st-t-bot">
                <div class="st-t-info">
                  <div class="st-t-title">语言地区</div>
                  <div class="st-t-sub">LANGUAGE</div>
                </div>
                <div class="st-t-status">中文</div>
              </div>
            </div>
            <div class="st-tile" id="stTileAppearance">
              <div class="st-t-icon peach">
                <svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>
              </div>
              <div class="st-t-bot">
                <div class="st-t-info">
                  <div class="st-t-title">图标外观</div>
                  <div class="st-t-sub">APP ICONS</div>
                </div>
                <div class="st-t-status">自定义</div>
              </div>
            </div>
            <div class="st-tile">
              <div class="st-t-icon sky">
                <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
              </div>
              <div class="st-t-bot">
                <div class="st-t-info">
                  <div class="st-t-title">通知</div>
                  <div class="st-t-sub">NOTIFY</div>
                </div>
                <div class="st-t-status">3</div>
              </div>
            </div>
          </div>

          <div class="st-sec">
            <span class="st-sec-mark"></span>
            <span class="st-sec-en">Wallpaper</span>
            <span class="st-sec-cn">壁纸 · 01</span>
            <span class="st-sec-meta">customize</span>
          </div>
          <div class="st-list">
            <div class="st-row">
              <div class="st-r-icon rose">
                <svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="9" cy="9" r="2"/><path d="M21 15l-5-5L5 21"/></svg>
              </div>
              <div class="st-r-text">
                <div class="st-r-t1">主屏壁纸</div>
                <div class="st-r-t2">wallpaper · custom</div>
              </div>
              <div class="st-r-right">
                <button class="st-mini-btn outline" id="stWpReset" type="button" title="恢复默认">
                  <svg viewBox="0 0 24 24"><path d="M21 12a9 9 0 11-3-6.7L21 8M21 3v5h-5"/></svg>
                </button>
                <button class="st-mini-btn" id="stWpUpload" type="button" title="上传壁纸">
                  <svg viewBox="0 0 24 24"><path d="M12 5v14M5 12l7-7 7 7"/></svg>
                </button>
              </div>
            </div>
          </div>

          <div class="st-sec">
            <span class="st-sec-mark"></span>
            <span class="st-sec-en">Status</span>
            <span class="st-sec-cn">状态 · 02</span>
            <span class="st-sec-meta">2 items</span>
          </div>
          <div class="st-list">
            <div class="st-row">
              <div class="st-r-icon stone">
                <svg viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="10" rx="2"/><path d="M6 11h12M6 14h7"/></svg>
              </div>
              <div class="st-r-text">
                <div class="st-r-t1">隐藏状态栏</div>
                <div class="st-r-t2">hide status bar</div>
              </div>
              <div class="st-r-right">
                <div class="st-toggle" id="stToggleStatusbar"></div>
              </div>
            </div>
            <div class="st-row">
              <div class="st-r-icon dark">
                <svg viewBox="0 0 24 24"><rect x="6" y="4" width="12" height="6" rx="3"/></svg>
              </div>
              <div class="st-r-text">
                <div class="st-r-t1">隐藏灵动岛</div>
                <div class="st-r-t2">hide dynamic island</div>
              </div>
              <div class="st-r-right">
                <div class="st-toggle" id="stToggleIsland"></div>
              </div>
            </div>
          </div>

          <div class="st-sec">
            <span class="st-sec-mark"></span>
            <span class="st-sec-en">Privacy</span>
            <span class="st-sec-cn">隐私 · 02</span>
            <span class="st-sec-meta">2 items</span>
          </div>
          <div class="st-list">
            <div class="st-row">
              <div class="st-r-icon sky">
                <svg viewBox="0 0 24 24"><path d="M12 2L4 6v6c0 5 3.5 9.5 8 10 4.5-.5 8-5 8-10V6l-8-4z"/><path d="M9 12l2 2 4-4"/></svg>
              </div>
              <div class="st-r-text">
                <div class="st-r-t1">隐私设置</div>
                <div class="st-r-t2">privacy · 3 alerts</div>
              </div>
              <div class="st-r-right">
                <span class="st-r-badge">3</span>
                <span class="st-r-arrow"><svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg></span>
              </div>
            </div>
            <div class="st-row">
              <div class="st-r-icon stone">
                <svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
              </div>
              <div class="st-r-text">
                <div class="st-r-t1">账号与密码</div>
                <div class="st-r-t2">account · keys</div>
              </div>
              <div class="st-r-right">
                <span class="st-r-arrow"><svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg></span>
              </div>
            </div>
          </div>

          <div class="st-sec">
            <span class="st-sec-mark"></span>
            <span class="st-sec-en">Typography</span>
            <span class="st-sec-cn">字体 · 03</span>
            <span class="st-sec-meta">global</span>
          </div>
          <div class="st-list">
            <div class="st-row">
              <div class="st-r-icon mint">
                <svg viewBox="0 0 24 24"><path d="M5 7V5h14v2M9 19h6M12 5v14"/></svg>
              </div>
              <div class="st-r-text">
                <div class="st-r-t1">启用系统字体</div>
                <div class="st-r-t2">use system default font</div>
              </div>
              <div class="st-r-right">
                <div class="st-toggle" id="stToggleSysFont"></div>
              </div>
            </div>
            <div class="st-row" id="stFontExpandHead" style="cursor:pointer">
              <div class="st-r-icon" style="background:#ece5f3">
                <svg viewBox="0 0 24 24" style="stroke:#7d6dab"><path d="M4 19h16M7 19l5-13 5 13M9 14h6"/></svg>
              </div>
              <div class="st-r-text">
                <div class="st-r-t1">自定义字体</div>
                <div class="st-r-t2">manage typefaces</div>
              </div>
              <div class="st-r-right">
                <span class="st-r-val" id="stFontCurrentName">默认</span>
                <span class="st-r-arrow" id="stFontArrow"><svg viewBox="0 0 24 24" width="9" height="9"><path d="M9 6l6 6-6 6" fill="#b0b0b8"/></svg></span>
              </div>
            </div>
            <div class="st-font-expand" id="stFontExpand">
              <div class="st-font-presets-title">⋆ Saved Presets ⋆</div>
              <div id="stFontPresetList"></div>
              <div class="st-font-add-row">
                <input class="st-font-input" id="stFontUrlInput" placeholder="字体 URL（.ttf / .woff / .woff2）">
                <button class="st-font-btn" id="stFontAddUrl" type="button">
                  <svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>添加
                </button>
              </div>
              <div class="st-font-add-row">
                <button class="st-font-btn outline" id="stFontUploadBtn" type="button" style="flex:1;justify-content:center">
                  <svg viewBox="0 0 24 24"><path d="M12 5v14M5 12l7-7 7 7"/></svg>
                  上传 TTF / OTF / WOFF
                </button>
              </div>
            </div>
            <div class="st-slider-row">
              <div class="st-slider-head">
                <div class="st-r-icon peach">
                  <svg viewBox="0 0 24 24"><path d="M3 7V5h12v2M9 19h0M9 5v14M17 17v-8M14 14h6"/></svg>
                </div>
                <div class="st-r-text">
                  <div class="st-r-t1">字号大小</div>
                  <div class="st-r-t2">global font size</div>
                </div>
                <div class="st-slider-val" id="stFontSizeVal">100%</div>
              </div>
              <input type="range" class="st-slider" id="stFontSizeSlider" min="80" max="140" value="100" step="5">
              <div class="st-slider-marks"><span>80</span><span>90</span><span>100</span><span>110</span><span>120</span><span>130</span><span>140</span></div>
            </div>
          </div>

          <div class="st-sec">
            <span class="st-sec-mark"></span>
            <span class="st-sec-en">About</span>
            <span class="st-sec-cn">关于 · 02</span>
            <span class="st-sec-meta">2 items</span>
          </div>
          <div class="st-list">
            <div class="st-row">
              <div class="st-r-icon stone">
                <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/></svg>
              </div>
              <div class="st-r-text">
                <div class="st-r-t1">关于本机</div>
                <div class="st-r-t2">about · v 1.0.3</div>
              </div>
              <div class="st-r-right">
                <span class="st-r-arrow"><svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg></span>
              </div>
            </div>
            <div class="st-row">
              <div class="st-r-icon peach">
                <svg viewBox="0 0 24 24"><path d="M21 12a9 9 0 11-3-6.7L21 8"/><path d="M21 3v5h-5"/></svg>
              </div>
              <div class="st-r-text">
                <div class="st-r-t1">恢复默认</div>
                <div class="st-r-t2">reset to default</div>
              </div>
              <div class="st-r-right">
                <span class="st-r-arrow"><svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg></span>
              </div>
            </div>
          </div>

        </div>

        <div class="st-tabbar">
          <div class="st-tab active">
            <svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.5 3.5-7 8-7s8 2.5 8 7"/></svg>
          </div>
          <div class="st-tab">
            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5"/></svg>
          </div>
          <div class="st-tab center">
            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 01-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 010-4h.1A1.7 1.7 0 004.6 9a1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 014 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 010 4h-.1a1.7 1.7 0 00-1.5 1z"/></svg>
          </div>
          <div class="st-tab">
            <svg viewBox="0 0 24 24"><path d="M12 2L4 6v6c0 5 3.5 9.5 8 10 4.5-.5 8-5 8-10V6l-8-4z"/></svg>
          </div>
          <div class="st-tab">
            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/></svg>
          </div>
        </div>

        <div class="st-icon-modal" id="stIconModal">
          <div class="st-icon-modal-mask" id="stIconModalMask"></div>
          <div class="st-icon-modal-card">
            <div class="st-icon-modal-head">
              <div class="st-icon-modal-titles">
                <div class="st-icon-modal-eyebrow">⋆ APP ICONS ⋆</div>
                <div class="st-icon-modal-title">图标外观</div>
              </div>
              <button class="st-icon-modal-close" id="stIconModalClose" type="button">×</button>
            </div>
            <div class="st-icon-modal-body" id="stIconModalBody"></div>
          </div>
        </div>

      </div>
    `;
  }

  function open() { if (panel) panel.classList.add('open'); }
  function close() { if (panel) panel.classList.remove('open'); }

  function updateTime() {
    const el = document.getElementById('stTime');
    if (!el) return;
    const now = new Date();
    el.textContent = `${now.getHours()}:${now.getMinutes().toString().padStart(2,'0')}`;
  }

  async function init() {
    const screen = document.querySelector('.phone-screen');
    if (!screen) return;
    screen.insertAdjacentHTML('beforeend', buildHTML());
    panel = document.getElementById('settingsPanel');

    document.getElementById('stBack').addEventListener('click', (e) => {
      e.stopPropagation();
      close();
    });

    // 颜色循环切换
    const btnColor = document.getElementById('stBtnColor');
    function applyBgColor(c) {
      panel.style.background = c;
      panel.style.setProperty('--st-bg', c);
    }
    const savedColor = (await HomeDB.getItem('setting_bg_color')) || COLORS[0];
    applyBgColor(savedColor);
    btnColor.addEventListener('click', async (e) => {
      e.stopPropagation();
      let curHex = panel.style.backgroundColor || COLORS[0];
      const toHex = (c) => {
        if (c.startsWith('#')) return c.toLowerCase();
        const m = c.match(/\d+/g);
        if (!m) return COLORS[0];
        return '#' + m.slice(0,3).map(x => parseInt(x).toString(16).padStart(2,'0')).join('');
      };
      const idx = COLORS.findIndex(c => c.toLowerCase() === toHex(curHex));
      const next = COLORS[(idx + 1) % COLORS.length];
      applyBgColor(next);
      await HomeDB.setItem('setting_bg_color', next);
    });

    // 全屏磁贴
    const tileFs = document.getElementById('stTileFs');
    const fsStatus = document.getElementById('stFsStatus');
    const phoneFrame = document.getElementById('phoneFrame');

    function applyFullscreen(on) {
      phoneFrame.classList.toggle('no-frame', on);
      tileFs.classList.toggle('dark', on);
      fsStatus.textContent = on ? 'ON' : 'OFF';
    }

    const savedFs = await HomeDB.getItem('setting_fullscreen');
    applyFullscreen(!!savedFs);

    tileFs.addEventListener('click', async (e) => {
      e.stopPropagation();
      const next = !phoneFrame.classList.contains('no-frame');
      applyFullscreen(next);
      await HomeDB.setItem('setting_fullscreen', next);
    });

    // 壁纸上传 / 恢复默认
    const wallpaperEl = document.querySelector('.wallpaper');
    function applyWallpaper(dataUrl) {
      if (!wallpaperEl) return;
      if (dataUrl) {
        wallpaperEl.style.backgroundImage = `url("${dataUrl}")`;
        wallpaperEl.style.backgroundSize = 'cover';
        wallpaperEl.style.backgroundPosition = 'center';
        wallpaperEl.style.backgroundRepeat = 'no-repeat';
        wallpaperEl.classList.add('has-image');
      } else {
        wallpaperEl.style.backgroundImage = '';
        wallpaperEl.style.backgroundSize = '';
        wallpaperEl.style.backgroundPosition = '';
        wallpaperEl.classList.remove('has-image');
      }
    }
    const savedWp = await HomeDB.getItem('bg_wallpaper');
    if (savedWp) applyWallpaper(savedWp);

    const wpUpload = document.getElementById('stWpUpload');
    const wpReset = document.getElementById('stWpReset');
    wpUpload.addEventListener('click', (e) => {
      e.stopPropagation();
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.style.display = 'none';
      document.body.appendChild(input);
      input.addEventListener('change', () => {
        const file = input.files && input.files[0];
        input.remove();
        if (!file) return;
        const fr = new FileReader();
        fr.onload = async () => {
          applyWallpaper(fr.result);
          await HomeDB.setItem('bg_wallpaper', fr.result);
        };
        fr.readAsDataURL(file);
      });
      input.click();
    });
    wpReset.addEventListener('click', async (e) => {
      e.stopPropagation();
      applyWallpaper(null);
      await HomeDB.setItem('bg_wallpaper', null);
    });

    // ===== 状态栏 / 灵动岛 隐藏（仅 visibility，不改布局） =====
    const tStatus = document.getElementById('stToggleStatusbar');
    const tIsland = document.getElementById('stToggleIsland');

    function applyHideStatus(on) {
      document.body.classList.toggle('hide-statusbar', on);
      tStatus.classList.toggle('on', on);
    }
    function applyHideIsland(on) {
      document.body.classList.toggle('hide-island', on);
      tIsland.classList.toggle('on', on);
    }

    const savedHideStatus = await HomeDB.getItem('hide_statusbar');
    const savedHideIsland = await HomeDB.getItem('hide_island');
    applyHideStatus(!!savedHideStatus);
    applyHideIsland(!!savedHideIsland);

    tStatus.addEventListener('click', async (e) => {
      e.stopPropagation();
      const next = !document.body.classList.contains('hide-statusbar');
      applyHideStatus(next);
      await HomeDB.setItem('hide_statusbar', next);
    });
    tIsland.addEventListener('click', async (e) => {
      e.stopPropagation();
      const next = !document.body.classList.contains('hide-island');
      applyHideIsland(next);
      await HomeDB.setItem('hide_island', next);
    });

    // ===== 图标外观（每个 app 独立上传 + 恢复默认） =====
    const iconDefaults = new Map();

    function getAppItems() {
      return Array.from(document.querySelectorAll('.app-item'));
    }
    function getKey(item) {
      const lbl = item.querySelector('.app-label');
      return lbl ? lbl.textContent.trim() : null;
    }
    function applyCustomIcon(item, dataUrl) {
      const icon = item.querySelector('.app-icon');
      if (!icon) return;
      if (dataUrl) {
        icon.style.backgroundImage = `url("${dataUrl}")`;
        icon.classList.add('custom');
      } else {
        icon.style.backgroundImage = '';
        icon.classList.remove('custom');
      }
    }
    // 缓存每个 app 的默认 .app-icon innerHTML
    getAppItems().forEach(item => {
      const key = getKey(item);
      const icon = item.querySelector('.app-icon');
      if (key && icon && !iconDefaults.has(key)) {
        iconDefaults.set(key, icon.innerHTML);
      }
    });
    // 恢复已保存的图标
    for (const item of getAppItems()) {
      const key = getKey(item);
      if (!key) continue;
      const saved = await HomeDB.getItem('icon_' + key);
      if (saved) applyCustomIcon(item, saved);
    }

    const iconModal = document.getElementById('stIconModal');
    const iconBody = document.getElementById('stIconModalBody');
    const iconClose = document.getElementById('stIconModalClose');
    const iconMask = document.getElementById('stIconModalMask');

    function buildIconCard(key, item) {
      const icon = item.querySelector('.app-icon');
      const isCustom = icon && icon.classList.contains('custom');

      const card = document.createElement('div');
      card.className = 'st-icon-card';
      card.dataset.key = key;

      const preview = document.createElement('div');
      preview.className = 'st-icon-preview';
      if (isCustom && icon && icon.style.backgroundImage) {
        preview.style.backgroundImage = icon.style.backgroundImage;
      } else if (icon) {
        preview.innerHTML = icon.innerHTML;
      }
      card.appendChild(preview);

      const name = document.createElement('div');
      name.className = 'st-icon-card-name';
      name.textContent = key;
      card.appendChild(name);

      const actions = document.createElement('div');
      actions.className = 'st-icon-card-actions';
      actions.innerHTML = `
        <button class="st-mini-btn outline" data-act="reset" type="button" title="恢复默认">
          <svg viewBox="0 0 24 24"><path d="M21 12a9 9 0 11-3-6.7L21 8M21 3v5h-5"/></svg>
        </button>
        <button class="st-mini-btn" data-act="upload" type="button" title="上传">
          <svg viewBox="0 0 24 24"><path d="M12 5v14M5 12l7-7 7 7"/></svg>
        </button>
      `;
      card.appendChild(actions);

      return card;
    }
    function renderIconList() {
      const items = getAppItems();
      const seen = new Set();
      const grid = document.createElement('div');
      grid.className = 'st-icon-grid';
      items.forEach(item => {
        const key = getKey(item);
        if (!key || seen.has(key)) return;
        seen.add(key);
        grid.appendChild(buildIconCard(key, item));
      });
      iconBody.innerHTML = '';
      iconBody.appendChild(grid);
    }
    function findItemByKey(key) {
      return getAppItems().find(it => getKey(it) === key);
    }
    function openIconModal() {
      renderIconList();
      iconModal.classList.add('open');
    }
    function closeIconModal() {
      iconModal.classList.remove('open');
    }

    document.getElementById('stTileAppearance').addEventListener('click', (e) => {
      e.stopPropagation();
      openIconModal();
    });
    iconClose.addEventListener('click', (e) => { e.stopPropagation(); closeIconModal(); });
    iconMask.addEventListener('click', (e) => { e.stopPropagation(); closeIconModal(); });
    iconBody.addEventListener('click', (e) => {
      e.stopPropagation();
      const btn = e.target.closest('button[data-act]');
      if (!btn) return;
      const card = btn.closest('.st-icon-card');
      const key = card && card.dataset.key;
      if (!key) return;
      const item = findItemByKey(key);
      if (!item) return;
      const act = btn.dataset.act;
      if (act === 'upload') {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.style.display = 'none';
        document.body.appendChild(input);
        input.addEventListener('change', () => {
          const file = input.files && input.files[0];
          input.remove();
          if (!file) return;
          const fr = new FileReader();
          fr.onload = async () => {
            applyCustomIcon(item, fr.result);
            await HomeDB.setItem('icon_' + key, fr.result);
            renderIconList();
          };
          fr.readAsDataURL(file);
        });
        input.click();
      } else if (act === 'reset') {
        const icon = item.querySelector('.app-icon');
        const def = iconDefaults.get(key);
        if (icon && def !== undefined) {
          icon.innerHTML = def;
        }
        applyCustomIcon(item, null);
        HomeDB.setItem('icon_' + key, null);
        renderIconList();
      }
    });

    // ===== 字体管理 =====
    const fontExpandHead = document.getElementById('stFontExpandHead');
    const fontExpand = document.getElementById('stFontExpand');
    const fontArrow = document.getElementById('stFontArrow');
    const fontPresetList = document.getElementById('stFontPresetList');
    const fontUrlInput = document.getElementById('stFontUrlInput');
    const fontAddUrl = document.getElementById('stFontAddUrl');
    const fontUploadBtn = document.getElementById('stFontUploadBtn');
    const fontSizeSlider = document.getElementById('stFontSizeSlider');
    const fontSizeVal = document.getElementById('stFontSizeVal');
    const fontCurrentName = document.getElementById('stFontCurrentName');
    const toggleSysFont = document.getElementById('stToggleSysFont');

    let fontPresets = [];
    let activeFontKey = null;
    let fontStyleEl = document.getElementById('globalFontStyle');
    if (!fontStyleEl) {
      fontStyleEl = document.createElement('style');
      fontStyleEl.id = 'globalFontStyle';
      document.head.appendChild(fontStyleEl);
    }

    function applyGlobalFont() {
      let css = '';
      const sysOn = document.body.classList.contains('use-system-font');
      const scale = fontSizeSlider ? (parseInt(fontSizeSlider.value) / 100) : 1;

      if (sysOn) {
        css += `.phone-screen, .phone-screen * { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif !important; }\n`;
      } else if (activeFontKey) {
        const preset = fontPresets.find(p => p.key === activeFontKey);
        if (preset) {
          css += `@font-face { font-family: 'UserCustomFont'; src: url('${preset.url}'); font-display: swap; }\n`;
          css += `.phone-screen, .phone-screen * { font-family: 'UserCustomFont', -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif !important; }\n`;
        }
      }

      if (scale !== 1) {
        const s = scale;
        css += `.phone-screen { --fs: ${s}; }\n`;
        css += `.status-time { font-size: calc(15px * ${s}); }\n`;
        css += `.profile-cross { font-size: calc(16px * ${s}); }\n`;
        css += `.profile-handle { font-size: calc(11px * ${s}); }\n`;
        css += `.profile-bio { font-size: calc(11px * ${s}); }\n`;
        css += `.profile-loc span { font-size: calc(10px * ${s}); }\n`;
        css += `.widget-title-small { font-size: calc(9px * ${s}); }\n`;
        css += `.widget-content-text { font-size: calc(11px * ${s}); }\n`;
        css += `.app-label { font-size: calc(11px * ${s}); }\n`;
        css += `.cl-tb-title { font-size: calc(30px * ${s}); }\n`;
        css += `.cl-tb-eyebrow { font-size: calc(8px * ${s}); }\n`;
        css += `.cl-tb-sub { font-size: calc(9px * ${s}); }\n`;
        css += `.cl-name { font-size: calc(12.5px * ${s}); }\n`;
        css += `.cl-msg { font-size: calc(11px * ${s}); }\n`;
        css += `.cl-time { font-size: calc(10.5px * ${s}); }\n`;
        css += `.cl-badge { font-size: calc(10px * ${s}); }\n`;
        css += `.cl-filter-chip { font-size: calc(12.5px * ${s}); }\n`;
        css += `.cl-group-title-l { font-size: calc(12px * ${s}); }\n`;
        css += `.cl-search input { font-size: calc(13px * ${s}); }\n`;
        css += `.cl-tab span { font-size: calc(10px * ${s}); }\n`;
        css += `.st-title-main { font-size: calc(22px * ${s}); }\n`;
        css += `.st-eyebrow { font-size: calc(8px * ${s}); }\n`;
        css += `.st-me-name { font-size: calc(17px * ${s}); }\n`;
        css += `.st-me-handle { font-size: calc(10.5px * ${s}); }\n`;
        css += `.st-me-bio { font-size: calc(11.5px * ${s}); }\n`;
        css += `.st-t-title { font-size: calc(12px * ${s}); }\n`;
        css += `.st-t-sub { font-size: calc(8px * ${s}); }\n`;
        css += `.st-t-status { font-size: calc(10.5px * ${s}); }\n`;
        css += `.st-sec-en { font-size: calc(15px * ${s}); }\n`;
        css += `.st-sec-cn { font-size: calc(9px * ${s}); }\n`;
        css += `.st-r-t1 { font-size: calc(12.5px * ${s}); }\n`;
        css += `.st-r-t2 { font-size: calc(8px * ${s}); }\n`;
        css += `.st-r-val { font-size: calc(10px * ${s}); }\n`;
        css += `.st-font-presets-title { font-size: calc(8.5px * ${s}); }\n`;
        css += `.st-fp-name { font-size: calc(11.5px * ${s}); }\n`;
        css += `.st-fp-sample { font-size: calc(13px * ${s}); }\n`;
        css += `.st-font-input { font-size: calc(11px * ${s}); }\n`;
        css += `.st-font-btn { font-size: calc(11px * ${s}); }\n`;
        css += `.st-slider-val { font-size: calc(13px * ${s}); }\n`;
        css += `.search-btn { font-size: calc(13px * ${s}); }\n`;
      }

      fontStyleEl.textContent = css;
    }

    async function loadFontSettings() {
      const saved = await HomeDB.getItem('font_presets');
      if (saved && Array.isArray(saved)) fontPresets = saved;
      activeFontKey = await HomeDB.getItem('font_active');
      const sysFont = await HomeDB.getItem('font_use_system');
      if (sysFont) { document.body.classList.add('use-system-font'); toggleSysFont.classList.add('on'); }
      const savedSize = await HomeDB.getItem('font_size');
      if (savedSize && fontSizeSlider) { fontSizeSlider.value = savedSize; fontSizeVal.textContent = savedSize + '%'; }
      renderFontPresets();
      applyGlobalFont();
    }

    function renderFontPresets() {
      fontPresetList.innerHTML = '';
      const activePreset = fontPresets.find(p => p.key === activeFontKey);
      fontCurrentName.textContent = activePreset ? activePreset.name : '默认';
      fontPresets.forEach(p => {
        const div = document.createElement('div');
        div.className = 'st-font-preset' + (p.key === activeFontKey ? ' active' : '');
        div.innerHTML = `
          <div class="st-fp-info">
            <div class="st-fp-name">${p.name} <span class="st-fp-tag">${p.type}</span></div>
            <div class="st-fp-sample" style="font-family:'${p.name}',serif">The double joy of stars 0123</div>
          </div>
          <div class="st-fp-actions">
            <button class="st-mini-btn${p.key === activeFontKey ? ' outline' : ''}" data-act="activate" data-key="${p.key}" type="button" title="启用">
              <svg viewBox="0 0 24 24"><path d="M5 12l5 5L20 7"/></svg>
            </button>
            <button class="st-mini-btn danger" data-act="delete" data-key="${p.key}" type="button" title="删除">
              <svg viewBox="0 0 24 24"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/></svg>
            </button>
          </div>
        `;
        fontPresetList.appendChild(div);
      });
    }

    async function addFontPreset(name, url, type) {
      const key = 'f_' + Date.now();
      fontPresets.push({ key, name, url, type });
      activeFontKey = key;
      await HomeDB.setItem('font_presets', fontPresets);
      await HomeDB.setItem('font_active', activeFontKey);
      renderFontPresets();
      applyGlobalFont();
    }

    fontExpandHead.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = fontExpand.classList.contains('open');
      fontExpand.classList.toggle('open');
      fontArrow.classList.toggle('expanded', !isOpen);
    });

    toggleSysFont.addEventListener('click', async (e) => {
      e.stopPropagation();
      const next = !document.body.classList.contains('use-system-font');
      document.body.classList.toggle('use-system-font', next);
      toggleSysFont.classList.toggle('on', next);
      await HomeDB.setItem('font_use_system', next);
      applyGlobalFont();
    });

    fontSizeSlider.addEventListener('input', async () => {
      fontSizeVal.textContent = fontSizeSlider.value + '%';
      applyGlobalFont();
      await HomeDB.setItem('font_size', fontSizeSlider.value);
    });

    fontAddUrl.addEventListener('click', async (e) => {
      e.stopPropagation();
      const url = fontUrlInput.value.trim();
      if (!url) return;
      const name = url.split('/').pop().split('.')[0] || 'Custom';
      await addFontPreset(name, url, 'URL');
      fontUrlInput.value = '';
    });

    fontUploadBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.ttf,.otf,.woff,.woff2';
      input.style.display = 'none';
      document.body.appendChild(input);
      input.addEventListener('change', () => {
        const file = input.files && input.files[0];
        input.remove();
        if (!file) return;
        const name = file.name.split('.')[0] || 'Custom';
        const type = file.name.split('.').pop().toUpperCase();
        const fr = new FileReader();
        fr.onload = async () => {
          await addFontPreset(name, fr.result, type);
        };
        fr.readAsDataURL(file);
      });
      input.click();
    });

    fontPresetList.addEventListener('click', async (e) => {
      e.stopPropagation();
      const btn = e.target.closest('button[data-act]');
      if (!btn) return;
      const key = btn.dataset.key;
      if (btn.dataset.act === 'activate') {
        activeFontKey = key;
        await HomeDB.setItem('font_active', key);
        renderFontPresets();
        applyGlobalFont();
      } else if (btn.dataset.act === 'delete') {
        fontPresets = fontPresets.filter(p => p.key !== key);
        if (activeFontKey === key) activeFontKey = null;
        await HomeDB.setItem('font_presets', fontPresets);
        await HomeDB.setItem('font_active', activeFontKey);
        renderFontPresets();
        applyGlobalFont();
      }
    });

    loadFontSettings();

    // 底部 tab 切换
    const tabs = panel.querySelectorAll('.st-tab');
    tabs.forEach(t => t.addEventListener('click', (e) => {
      e.stopPropagation();
      tabs.forEach(x => x.classList.remove('active'));
      t.classList.add('active');
    }));

    updateTime();
    setInterval(updateTime, 1000);

    // Settings 图标点击 → 打开（编辑模式不打开）
    document.querySelectorAll('.app-item').forEach(item => {
      const label = item.querySelector('.app-label');
      if (!label || label.textContent.trim() !== 'Settings') return;
      item.addEventListener('click', (e) => {
        if (document.querySelector('.app-grid.edit-mode-active')) return;
        e.stopPropagation();
        open();
      });
    });

    // ===== API 设置页 =====
    const apiCSS = `
      .st-api-page {
        position:absolute; inset:0; z-index:600;
        background:#f3f3f5;
        display:flex; flex-direction:column;
        transform:translateX(100%);
        transition:transform 0.35s cubic-bezier(0.25,0.46,0.45,0.94);
        overflow:hidden;
      }
      .st-api-page.open { transform:translateX(0); }
      .st-api-topbar {
        flex-shrink:0; padding:60px 20px 14px;
        display:flex; align-items:center; gap:12px;
      }
      .st-api-back {
        width:32px; height:32px; border-radius:50%;
        background:#fff; display:flex; align-items:center; justify-content:center;
        cursor:pointer; box-shadow:0 1px 4px rgba(0,0,0,0.06);
      }
      .st-api-back svg { width:13px; height:13px; fill:#1c1c1c; }
      .st-api-titles { flex:1; }
      .st-api-eyebrow { font-size:8px; font-weight:600; color:#b0b0b8; letter-spacing:2.5px; text-transform:uppercase; margin-bottom:2px; }
      .st-api-title { font-size:22px; font-weight:900; color:#1c1c1c; letter-spacing:-0.5px; }
      .st-api-scroll { flex:1; overflow-y:auto; padding:0 18px 30px; -webkit-overflow-scrolling:touch; }
      .st-api-scroll::-webkit-scrollbar { display:none; }

      .st-api-sec { display:flex; align-items:center; gap:8px; padding:20px 4px 10px; }
      .st-api-sec-mark { width:3px; height:14px; border-radius:2px; background:linear-gradient(to bottom,#1c1c1c,#b0b0b8); }
      .st-api-sec-en { font-size:15px; font-weight:800; color:#1c1c1c; letter-spacing:-0.3px; }
      .st-api-sec-cn { font-size:9px; font-weight:500; color:#b0b0b8; letter-spacing:1px; margin-left:4px; }
      .st-api-sec-meta { margin-left:auto; font-size:8px; font-weight:600; color:#c8c8cc; letter-spacing:1px; text-transform:uppercase; }

      .st-api-list { background:#fff; border-radius:16px; overflow:hidden; box-shadow:0 1px 4px rgba(0,0,0,0.03); margin-bottom:4px; }
      .st-api-row { display:flex; align-items:center; gap:12px; padding:14px 14px; }
      .st-api-row + .st-api-row { border-top:1px solid rgba(0,0,0,0.04); }
      .st-api-r-icon { width:34px; height:34px; border-radius:10px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
      .st-api-r-icon svg { width:17px; height:17px; fill:none; stroke:#fff; stroke-width:1.8; stroke-linecap:round; stroke-linejoin:round; }
      .st-api-r-icon.i1 { background:#1c1c1c; }
      .st-api-r-icon.i2 { background:#555; }
      .st-api-r-icon.i3 { background:#888; }
      .st-api-r-icon.i4 { background:#aaa; }
      .st-api-r-icon.i5 { background:#333; }
      .st-api-r-text { flex:1; min-width:0; }
      .st-api-r-t1 { font-size:12.5px; font-weight:650; color:#1c1c1c; margin-bottom:1px; }
      .st-api-r-t2 { font-size:8px; font-weight:500; color:#b0b0b8; letter-spacing:0.5px; }
      .st-api-r-right { display:flex; align-items:center; gap:6px; flex-shrink:0; }
      .st-api-r-badge { font-size:9px; font-weight:700; padding:2px 8px; border-radius:8px; }
      .st-api-r-badge.on { background:#e8e8e8; color:#1c1c1c; }
      .st-api-r-badge.off { background:#f5f5f5; color:#ccc; }
      .st-api-r-val { font-size:10px; font-weight:600; color:#b0b0b8; }

      .st-api-input-row { padding:10px 14px; }
      .st-api-input-row + .st-api-input-row { border-top:1px solid rgba(0,0,0,0.04); }
      .st-api-input-label { font-size:9px; font-weight:600; color:#b0b0b8; margin-bottom:5px; letter-spacing:0.5px; }
      .st-api-input {
        width:100%; height:40px; border-radius:10px;
        border:1px solid #ededef; background:#f9f9fb;
        padding:0 12px; font-size:13px; color:#1c1c1c;
        outline:none; transition:border-color 0.2s;
      }
      .st-api-input:focus { border-color:#1c1c1c; background:#fff; }
      .st-api-input::placeholder { color:#d0d0d0; }

      .st-api-test-row { padding:10px 14px 14px; }
      .st-api-test-btn {
        width:100%; height:40px; border-radius:10px;
        border:none; background:#1c1c1c;
        font-size:11px; font-weight:700; color:#fff;
        cursor:pointer; display:flex; align-items:center; justify-content:center; gap:6px;
      }
      .st-api-test-btn:active { opacity:0.7; }
      .st-api-test-btn svg { width:13px; height:13px; fill:none; stroke:#fff; stroke-width:2; stroke-linecap:round; stroke-linejoin:round; }

      /* 预设 */
      .st-api-preset { display:flex; align-items:center; gap:10px; padding:12px 14px; cursor:pointer; }
      .st-api-preset + .st-api-preset { border-top:1px solid rgba(0,0,0,0.04); }
      .st-api-preset:active { background:rgba(0,0,0,0.02); }
      .st-api-preset.active { background:#f5f5f7; }
      .st-api-preset-radio { width:16px; height:16px; border-radius:50%; border:2px solid #ddd; flex-shrink:0; display:flex; align-items:center; justify-content:center; }
      .st-api-preset.active .st-api-preset-radio { border-color:#1c1c1c; }
      .st-api-preset.active .st-api-preset-radio::after { content:''; width:7px; height:7px; border-radius:50%; background:#1c1c1c; }
      .st-api-preset-info { flex:1; min-width:0; }
      .st-api-preset-name { font-size:12px; font-weight:700; color:#1c1c1c; }
      .st-api-preset-url { font-size:9px; color:#bbb; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
      .st-api-preset-del { width:22px; height:22px; border-radius:50%; background:#f0f0f0; display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:10px; color:#999; flex-shrink:0; }
      .st-api-preset-add { display:flex; align-items:center; justify-content:center; gap:5px; padding:12px 14px; cursor:pointer; font-size:11px; font-weight:600; color:#999; border-top:1px solid rgba(0,0,0,0.04); }
      .st-api-preset-add:active { background:rgba(0,0,0,0.02); }
      .st-api-preset-add svg { width:12px; height:12px; fill:none; stroke:#999; stroke-width:2; stroke-linecap:round; }

      /* 搜索 */
      .st-api-search { padding:10px 14px 6px; }
      .st-api-search-input {
        width:100%; height:36px; border-radius:10px;
        border:1px solid #ededef; background:#f9f9fb;
        padding:0 12px; font-size:12px; color:#1c1c1c; outline:none;
      }
      .st-api-search-input:focus { border-color:#1c1c1c; background:#fff; }
      .st-api-search-input::placeholder { color:#d0d0d0; }

      /* 收藏 */
      .st-api-fav-sec { padding:6px 14px 10px; }
      .st-api-fav-list { display:flex; flex-wrap:wrap; gap:6px; }
      .st-api-fav-chip {
        display:flex; align-items:center; gap:4px;
        padding:6px 10px; border-radius:10px;
        background:#f5f5f7; font-size:10px; font-weight:600; color:#1c1c1c;
        cursor:pointer;
      }
      .st-api-fav-chip:active { background:#e8e8ea; }
      .st-api-fav-chip svg { width:10px; height:10px; fill:#1c1c1c; stroke:none; }
      .st-api-fav-empty { font-size:10px; color:#ccc; padding:4px 0; }

      /* 模型分组 */
      .st-api-model-group { border-top:1px solid rgba(0,0,0,0.04); }
      .st-api-model-group:first-child { border-top:none; }
      .st-api-model-header { display:flex; align-items:center; gap:10px; padding:12px 14px; cursor:pointer; }
      .st-api-model-header:active { background:rgba(0,0,0,0.02); }
      .st-api-model-badge { width:24px; height:24px; border-radius:7px; display:flex; align-items:center; justify-content:center; font-size:9px; font-weight:800; color:#fff; background:#1c1c1c; }
      .st-api-model-badge.g2 { background:#333; }
      .st-api-model-badge.g3 { background:#555; }
      .st-api-model-badge.g4 { background:#777; }
      .st-api-model-badge.g5 { background:#999; }
      .st-api-model-badge.g6 { background:#444; }
      .st-api-model-gname { font-size:12.5px; font-weight:700; color:#1c1c1c; flex:1; }
      .st-api-model-gcount { font-size:9px; color:#ccc; font-weight:600; }
      .st-api-model-arrow { width:12px; height:12px; transition:transform 0.2s; }
      .st-api-model-arrow svg { width:100%; height:100%; fill:none; stroke:#ccc; stroke-width:2; stroke-linecap:round; stroke-linejoin:round; }
      .st-api-model-group.expanded .st-api-model-arrow { transform:rotate(90deg); }
      .st-api-model-list { display:none; padding:0 10px 10px; }
      .st-api-model-group.expanded .st-api-model-list { display:block; }
      .st-api-model-item { display:flex; align-items:center; gap:10px; padding:9px 12px; border-radius:10px; cursor:pointer; }
      .st-api-model-item:active { background:rgba(0,0,0,0.03); }
      .st-api-model-item.selected { background:#f0f0f2; }
      .st-api-model-radio { width:16px; height:16px; border-radius:50%; border:2px solid #ddd; flex-shrink:0; display:flex; align-items:center; justify-content:center; transition:border-color 0.2s; }
      .st-api-model-item.selected .st-api-model-radio { border-color:#1c1c1c; }
      .st-api-model-item.selected .st-api-model-radio::after { content:''; width:7px; height:7px; border-radius:50%; background:#1c1c1c; }
      .st-api-model-iname { font-size:11.5px; font-weight:600; color:#1c1c1c; flex:1; }
      .st-api-model-star { width:18px; height:18px; cursor:pointer; flex-shrink:0; }
      .st-api-model-star svg { width:100%; height:100%; fill:none; stroke:#ccc; stroke-width:1.8; }
      .st-api-model-star.fav svg { fill:#1c1c1c; stroke:#1c1c1c; }
      .st-api-empty { text-align:center; padding:24px 14px; font-size:11px; color:#ccc; }
      .st-api-selected { display:flex; align-items:center; gap:10px; padding:12px 14px; margin-top:8px; background:#ededef; border-radius:12px; }
      .st-api-selected.hidden { display:none; }
      .st-api-selected-label { font-size:9px; color:#999; }
      .st-api-selected-name { font-size:12px; font-weight:700; color:#1c1c1c; flex:1; }
      .st-api-selected-clear { width:18px; height:18px; border-radius:50%; background:#ddd; display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:9px; color:#999; line-height:1; }
      .st-api-param-input { width:60px; height:32px; border-radius:8px; border:1px solid #ededef; background:#f9f9fb; padding:0 8px; font-size:12px; color:#1c1c1c; text-align:center; outline:none; }
      .st-api-param-input:focus { border-color:#1c1c1c; background:#fff; }
    `;

    if (!document.getElementById('stApiStyles')) {
      const s = document.createElement('style');
      s.id = 'stApiStyles';
      s.textContent = apiCSS;
      document.head.appendChild(s);
    }

    const apiHTML = `
      <div class="st-api-page" id="stApiPage">
        <div class="st-api-topbar">
          <div class="st-api-back" id="stApiBack"><svg viewBox="0 0 24 24"><path d="M14.7 5.3a1 1 0 010 1.4L9.4 12l5.3 5.3a1 1 0 11-1.4 1.4l-6-6a1 1 0 010-1.4l6-6a1 1 0 011.4 0z"/></svg></div>
          <div class="st-api-titles">
            <div class="st-api-eyebrow">⋆ CONNECTIVITY ⋆</div>
            <div class="st-api-title">API</div>
          </div>
        </div>
        <div class="st-api-scroll">
          <div class="st-api-sec"><span class="st-api-sec-mark"></span><span class="st-api-sec-en">Status</span><span class="st-api-sec-cn">连接 · 01</span><span class="st-api-sec-meta">realtime</span></div>
          <div class="st-api-list">
            <div class="st-api-row"><div class="st-api-r-icon i1"><svg viewBox="0 0 24 24"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg></div><div class="st-api-r-text"><div class="st-api-r-t1">连接状态</div><div class="st-api-r-t2" id="stApiStatusText">未连接 · waiting</div></div><div class="st-api-r-right"><span class="st-api-r-badge off" id="stApiBadge">OFF</span></div></div>
            <div class="st-api-row"><div class="st-api-r-icon i2"><svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="3"/><path d="M9 9h6M9 12h6M9 15h4"/></svg></div><div class="st-api-r-text"><div class="st-api-r-t1">当前模型</div><div class="st-api-r-t2" id="stApiCurrentModel">未选择</div></div><div class="st-api-r-right"><span class="st-api-r-val" id="stApiProvider">—</span></div></div>
          </div>

          <div class="st-api-sec"><span class="st-api-sec-mark"></span><span class="st-api-sec-en">Presets</span><span class="st-api-sec-cn">预设 · 02</span><span class="st-api-sec-meta">quick switch</span></div>
          <div class="st-api-list" id="stApiPresetList">
            <div class="st-api-preset-add" id="stApiPresetAdd"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>添加预设</div>
          </div>

          <div class="st-api-sec"><span class="st-api-sec-mark"></span><span class="st-api-sec-en">Config</span><span class="st-api-sec-cn">配置 · 03</span><span class="st-api-sec-meta">endpoint</span></div>
          <div class="st-api-list">
            <div class="st-api-input-row"><div class="st-api-input-label">API URL</div><input class="st-api-input" type="text" placeholder="https://api.openai.com/v1" id="stApiUrl" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"></div>
            <div class="st-api-input-row"><div class="st-api-input-label">API Key</div><input class="st-api-input" type="text" placeholder="sk-xxxxxxxxxxxxxxxx" id="stApiKey" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"></div>
            <div class="st-api-test-row"><button class="st-api-test-btn" id="stApiTestBtn"><svg viewBox="0 0 24 24"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>测试连接 & 获取模型</button></div>
          </div>

          <div class="st-api-sec"><span class="st-api-sec-mark"></span><span class="st-api-sec-en">Models</span><span class="st-api-sec-cn">模型 · 04</span><span class="st-api-sec-meta" id="stApiModelCount">0 loaded</span></div>
          <div class="st-api-list">
            <div class="st-api-search"><input class="st-api-search-input" type="text" placeholder="搜索模型..." id="stApiSearch" autocomplete="off"></div>
            <div class="st-api-fav-sec" id="stApiFavSec"><div class="st-api-fav-list" id="stApiFavList"><div class="st-api-fav-empty">暂无收藏</div></div></div>
            <div id="stApiModelList"><div class="st-api-empty">填写配置并测试连接后<br>模型将自动加载</div></div>
          </div>
          <div class="st-api-selected hidden" id="stApiSelectedBar"><div><div class="st-api-selected-label">已选模型</div><div class="st-api-selected-name" id="stApiSelectedName">—</div></div><div class="st-api-selected-clear" id="stApiClearModel">×</div></div>

          <div class="st-api-sec"><span class="st-api-sec-mark"></span><span class="st-api-sec-en">Parameters</span><span class="st-api-sec-cn">参数 · 05</span><span class="st-api-sec-meta">tuning</span></div>
          <div class="st-api-list">
            <div class="st-api-row"><div class="st-api-r-icon i3"><svg viewBox="0 0 24 24"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4"/></svg></div><div class="st-api-r-text"><div class="st-api-r-t1">Temperature</div><div class="st-api-r-t2">creativity control</div></div><div class="st-api-r-right"><input class="st-api-param-input" type="text" value="0.7" id="stApiTemp" autocomplete="off"></div></div>
            <div class="st-api-row"><div class="st-api-r-icon i4"><svg viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h10"/></svg></div><div class="st-api-r-text"><div class="st-api-r-t1">Max Tokens</div><div class="st-api-r-t2">response length</div></div><div class="st-api-r-right"><input class="st-api-param-input" type="text" value="4096" id="stApiMaxTokens" autocomplete="off" style="width:70px;"></div></div>
            <div class="st-api-row"><div class="st-api-r-icon i5"><svg viewBox="0 0 24 24"><path d="M12 3v18M3 12h18"/></svg></div><div class="st-api-r-text"><div class="st-api-r-t1">Top P</div><div class="st-api-r-t2">nucleus sampling</div></div><div class="st-api-r-right"><input class="st-api-param-input" type="text" value="1.0" id="stApiTopP" autocomplete="off"></div></div>
          </div>
        </div>
      </div>
    `;
    panel.insertAdjacentHTML('beforeend', apiHTML);

    let stApiSelectedModel = null;
    let stApiPresets = [];
    let stApiFavModels = [];
    let stApiAllModels = {};

    // 加载保存的数据
    (async () => {
      const saved = await HomeDB.getItem('api_config');
      if (saved) {
        if (saved.url) document.getElementById('stApiUrl').value = saved.url;
        if (saved.key) document.getElementById('stApiKey').value = saved.key;
        if (saved.model) { stApiSelectedModel = saved.model; document.getElementById('stApiCurrentModel').textContent = saved.model; document.getElementById('stApiSelectedName').textContent = saved.model; document.getElementById('stApiSelectedBar').classList.remove('hidden'); }
        if (saved.temp) document.getElementById('stApiTemp').value = saved.temp;
        if (saved.maxTokens) document.getElementById('stApiMaxTokens').value = saved.maxTokens;
        if (saved.topP) document.getElementById('stApiTopP').value = saved.topP;
      }
      const savedPresets = await HomeDB.getItem('api_presets');
      if (savedPresets) stApiPresets = savedPresets;
      const savedFavs = await HomeDB.getItem('api_fav_models');
      if (savedFavs) stApiFavModels = savedFavs;
      renderApiPresets();
      renderApiFavs();
    })();

    async function saveApiConfig() {
      await HomeDB.setItem('api_config', {
        url: document.getElementById('stApiUrl').value.trim(),
        key: document.getElementById('stApiKey').value.trim(),
        model: stApiSelectedModel,
        temp: document.getElementById('stApiTemp').value.trim(),
        maxTokens: document.getElementById('stApiMaxTokens').value.trim(),
        topP: document.getElementById('stApiTopP').value.trim(),
      });
    }

    // ===== 预设 =====
    function renderApiPresets() {
      const container = document.getElementById('stApiPresetList');
      const addBtn = container.querySelector('.st-api-preset-add');
      container.querySelectorAll('.st-api-preset').forEach(el => el.remove());
      stApiPresets.forEach((p, i) => {
        const active = document.getElementById('stApiUrl').value.trim() === p.url && document.getElementById('stApiKey').value.trim() === p.key;
        const div = document.createElement('div');
        div.className = 'st-api-preset' + (active ? ' active' : '');
        div.innerHTML = `<div class="st-api-preset-radio"></div><div class="st-api-preset-info"><div class="st-api-preset-name">${p.name}</div><div class="st-api-preset-url">${p.url}</div></div><div class="st-api-preset-del" data-idx="${i}">×</div>`;
        div.addEventListener('click', (e) => {
          if (e.target.closest('.st-api-preset-del')) return;
          document.getElementById('stApiUrl').value = p.url;
          document.getElementById('stApiKey').value = p.key;
          renderApiPresets();
          saveApiConfig();
        });
        div.querySelector('.st-api-preset-del').addEventListener('click', async (e) => {
          e.stopPropagation();
          stApiPresets.splice(i, 1);
          await HomeDB.setItem('api_presets', stApiPresets);
          renderApiPresets();
        });
        container.insertBefore(div, addBtn);
      });
    }

    document.getElementById('stApiPresetAdd').addEventListener('click', async (e) => {
      e.stopPropagation();
      const name = prompt('预设名称：');
      if (!name || !name.trim()) return;
      const url = document.getElementById('stApiUrl').value.trim();
      const key = document.getElementById('stApiKey').value.trim();
      if (!url || !key) { alert('请先填写 URL 和 Key'); return; }
      stApiPresets.push({ name: name.trim(), url, key });
      await HomeDB.setItem('api_presets', stApiPresets);
      renderApiPresets();
    });

    // ===== 收藏模型 =====
    function renderApiFavs() {
      const container = document.getElementById('stApiFavList');
      if (stApiFavModels.length === 0) {
        container.innerHTML = '<div class="st-api-fav-empty">暂无收藏</div>';
        return;
      }
      container.innerHTML = stApiFavModels.map(m => `<div class="st-api-fav-chip" data-model="${m}"><svg viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>${m}</div>`).join('');
      container.querySelectorAll('.st-api-fav-chip').forEach(chip => {
        chip.addEventListener('click', () => {
          stApiSelectedModel = chip.dataset.model;
          document.getElementById('stApiSelectedName').textContent = stApiSelectedModel;
          document.getElementById('stApiSelectedBar').classList.remove('hidden');
          document.getElementById('stApiCurrentModel').textContent = stApiSelectedModel;
          document.querySelectorAll('.st-api-model-item').forEach(i => i.classList.toggle('selected', i.dataset.model === stApiSelectedModel));
          saveApiConfig();
        });
      });
    }

    async function toggleFav(modelId) {
      const idx = stApiFavModels.indexOf(modelId);
      if (idx >= 0) stApiFavModels.splice(idx, 1);
      else stApiFavModels.push(modelId);
      await HomeDB.setItem('api_fav_models', stApiFavModels);
      renderApiFavs();
      renderApiModels(stApiAllModels);
    }

    // 盾牌 tab 打开
    tabs[3].addEventListener('click', (e) => {
      e.stopPropagation();
      document.getElementById('stApiPage').classList.add('open');
    });

    document.getElementById('stApiBack').addEventListener('click', (e) => {
      e.stopPropagation();
      document.getElementById('stApiPage').classList.remove('open');
      saveApiConfig();
    });

    // 测试连接
    document.getElementById('stApiTestBtn').addEventListener('click', async (e) => {
      e.stopPropagation();
      const url = document.getElementById('stApiUrl').value.trim();
      const key = document.getElementById('stApiKey').value.trim();
      if (!url || !key) { alert('请填写 URL 和 Key'); return; }

      document.getElementById('stApiStatusText').textContent = '连接中...';
      document.getElementById('stApiBadge').textContent = '...';
      document.getElementById('stApiBadge').className = 'st-api-r-badge off';

      try {
        const res = await fetch(url.replace(/\/$/, '') + '/models', { headers: { 'Authorization': 'Bearer ' + key } });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const data = await res.json();
        const models = data.data || data.models || [];

        document.getElementById('stApiBadge').textContent = 'ON';
        document.getElementById('stApiBadge').className = 'st-api-r-badge on';
        document.getElementById('stApiStatusText').textContent = `已连接 · ${models.length} models`;
        document.getElementById('stApiModelCount').textContent = models.length + ' loaded';

        const groups = {};
        models.forEach(m => {
          const id = (m.id || m.name || '').toLowerCase();
          let cat = '其他';
          if (id.includes('gemini')) cat = 'Gemini';
          else if (id.includes('gpt') || id.includes('o1') || id.includes('o3') || id.includes('chatgpt')) cat = 'OpenAI';
          else if (id.includes('claude')) cat = 'Claude';
          else if (id.includes('deepseek')) cat = 'DeepSeek';
          else if (id.includes('qwen')) cat = 'Qwen';
          else if (id.includes('mistral') || id.includes('mixtral')) cat = 'Mistral';
          if (!groups[cat]) groups[cat] = [];
          groups[cat].push(m.id || m.name);
        });

        document.getElementById('stApiProvider').textContent = Object.keys(groups).find(k => k !== '其他') || 'API';
        stApiAllModels = groups;
        renderApiModels(groups);
        saveApiConfig();
      } catch (err) {
        document.getElementById('stApiBadge').textContent = 'ERR';
        document.getElementById('stApiBadge').className = 'st-api-r-badge off';
        document.getElementById('stApiStatusText').textContent = '失败 · ' + err.message;
      }
    });

    function renderApiModels(groups, filter) {
      const container = document.getElementById('stApiModelList');
      const bl = { Gemini:'G', OpenAI:'O', Claude:'C', DeepSeek:'D', Qwen:'Q', Mistral:'M', '其他':'?' };
      const bg = { Gemini:'', OpenAI:'g2', Claude:'g3', DeepSeek:'g4', Qwen:'g5', Mistral:'g6', '其他':'g4' };
      let html = '';
      Object.entries(groups).forEach(([cat, models]) => {
        let filtered = models;
        if (filter) filtered = models.filter(id => id.toLowerCase().includes(filter.toLowerCase()));
        if (filtered.length === 0) return;
        html += `<div class="st-api-model-group"><div class="st-api-model-header"><div class="st-api-model-badge ${bg[cat]||''}">${bl[cat]||'?'}</div><div class="st-api-model-gname">${cat}</div><div class="st-api-model-gcount">${filtered.length}</div><div class="st-api-model-arrow"><svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg></div></div><div class="st-api-model-list">${filtered.map(id => `<div class="st-api-model-item${stApiSelectedModel===id?' selected':''}" data-model="${id}"><div class="st-api-model-radio"></div><div class="st-api-model-iname">${id}</div><div class="st-api-model-star${stApiFavModels.includes(id)?' fav':''}" data-fav="${id}"><svg viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg></div></div>`).join('')}</div></div>`;
      });
      if (!html) html = '<div class="st-api-empty">无匹配模型</div>';
      container.innerHTML = html;

      container.querySelectorAll('.st-api-model-header').forEach(h => { h.addEventListener('click', () => h.parentElement.classList.toggle('expanded')); });
      container.querySelectorAll('.st-api-model-item').forEach(item => {
        item.addEventListener('click', (e) => {
          if (e.target.closest('.st-api-model-star')) return;
          container.querySelectorAll('.st-api-model-item').forEach(i => i.classList.remove('selected'));
          item.classList.add('selected');
          stApiSelectedModel = item.dataset.model;
          document.getElementById('stApiSelectedName').textContent = stApiSelectedModel;
          document.getElementById('stApiSelectedBar').classList.remove('hidden');
          document.getElementById('stApiCurrentModel').textContent = stApiSelectedModel;
          saveApiConfig();
        });
      });
      container.querySelectorAll('.st-api-model-star').forEach(star => {
        star.addEventListener('click', (e) => { e.stopPropagation(); toggleFav(star.dataset.fav); });
      });
    }

    // 搜索
    document.getElementById('stApiSearch').addEventListener('input', (e) => {
      const val = e.target.value.trim();
      if (Object.keys(stApiAllModels).length > 0) renderApiModels(stApiAllModels, val);
    });

    // 清除选择
    document.getElementById('stApiClearModel').addEventListener('click', (e) => {
      e.stopPropagation();
      stApiSelectedModel = null;
      document.getElementById('stApiSelectedBar').classList.add('hidden');
      document.getElementById('stApiCurrentModel').textContent = '未选择';
      document.querySelectorAll('.st-api-model-item').forEach(i => i.classList.remove('selected'));
      saveApiConfig();
    });

    panel.addEventListener('click', (e) => { e.stopPropagation(); });
  }

  return { init, open, close };
})();

window.addEventListener('DOMContentLoaded', () => {
  SettingsPage.init();
});
