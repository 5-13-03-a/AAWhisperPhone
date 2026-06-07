// ==========================================
// Archive 备份系统（CSS + HTML + 功能一体）
// ==========================================

const ArchivePage = (() => {
  let panel = null;

  const CSS = `
    .archive-panel {
      position: absolute; inset: 0; z-index: 200;
      background: #F2F2F7;
      display: flex; flex-direction: column;
      opacity: 0; transform: scale(0.96);
      pointer-events: none;
      transition: opacity 0.3s ease 0.25s, transform 0.4s cubic-bezier(0.34,1.56,0.64,1) 0.25s;
      overflow: hidden; border-radius: inherit;
      font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Helvetica Neue', sans-serif;
    }
    .archive-panel.open { opacity: 1; transform: scale(1); pointer-events: auto; }
    .archive-panel.closing {
      transition: opacity 0.22s ease, transform 0.28s cubic-bezier(0.4,0,0.2,1);
      transition-delay: 0s; opacity: 0; transform: scale(0.96); pointer-events: none;
    }
    .archive-panel * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; user-select: none; }

    .ar-island {
      position: absolute; top: 12px; left: 50%; transform: translateX(-50%);
      width: 126px; height: 36px; background: #000; border-radius: 20px; z-index: 100;
    }

    .ar-statusbar {
      display: flex; justify-content: space-between; align-items: center;
      padding: 14px 28px 6px; height: 50px; color: #1c1c1c;
      flex-shrink: 0; position: relative; z-index: 10;
    }
    .ar-sb-time { font-size: 16px; font-weight: 700; letter-spacing: -0.25px; }
    .ar-sb-right { display: flex; align-items: center; gap: 4px; }
    .ar-sb-dots { display: flex; gap: 1.4px; }
    .ar-sb-dots span { width: 3px; height: 3px; border-radius: 50%; background: #1c1c1c; }
    .ar-sb-4g { font-size: 12px; font-weight: 700; margin-left: 2px; }
    .ar-sb-battery { display: flex; align-items: center; gap: 2px; margin-left: 2px; }
    .ar-sb-battery-body { width: 22px; height: 11px; border-radius: 3px; border: 1.2px solid #1c1c1c; position: relative; overflow: hidden; }
    .ar-sb-battery-body::after { content: ''; position: absolute; inset: 1.5px; width: 65%; border-radius: 1.5px; background: #1c1c1c; }
    .ar-sb-battery-tip { width: 2px; height: 5px; border-radius: 0 1px 1px 0; background: #1c1c1c; }

    .ar-scroll {
      flex: 1; overflow-y: auto; padding: 8px 18px 30px;
      -webkit-overflow-scrolling: touch;
    }
    .ar-scroll::-webkit-scrollbar { display: none; }

    /* 图标飞出 */
    .app-icon.ar-flying {
      transition: transform 0.5s cubic-bezier(0.65,0,0.35,1), opacity 0.2s ease 0.3s !important;
      transform: scale(8) !important; opacity: 0 !important; pointer-events: none;
    }

    /* 存储环 */
    .ar-storage-hero {
      position: relative; border-radius: 30px;
      background: rgba(255,255,255,.82); border: 1px solid rgba(255,255,255,.9);
      box-shadow: 0 8px 30px rgba(0,0,0,.04);
      padding: 28px 20px 24px; margin-bottom: 16px;
      display: flex; align-items: center; gap: 24px;
    }
    .ar-ring-wrap { width: 130px; height: 130px; position: relative; flex-shrink: 0; }
    .ar-ring-wrap svg { width: 100%; height: 100%; transform: rotate(-90deg); }
    .ar-ring-bg { fill: none; stroke: #ececec; stroke-width: 8; }
    .ar-ring-fill {
      fill: none; stroke-width: 8; stroke-linecap: round;
      stroke-dasharray: 339.292;
      transition: stroke-dashoffset .8s cubic-bezier(.4,0,.2,1);
    }
    .ar-ring-a { stroke: #777; }
    .ar-ring-b { stroke: #aaa; }
    .ar-ring-c { stroke: #ccc; }
    .ar-ring-d { stroke: #e0e0e0; }
    .ar-ring-center {
      position: absolute; inset: 0;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
    }
    .ar-ring-num { font-size: 28px; font-weight: 900; color: #1c1c1c; letter-spacing: -1.5px; line-height: 1; }
    .ar-ring-unit { font-size: 9px; font-weight: 700; color: #a0a0a0; letter-spacing: 2px; text-transform: uppercase; margin-top: 4px; }

    .ar-storage-info { flex: 1; min-width: 0; }
    .ar-storage-title { font-size: 18px; font-weight: 900; color: #1c1c1c; letter-spacing: -0.5px; margin-bottom: 4px; }
    .ar-storage-sub { font-size: 11px; color: #999; line-height: 1.5; margin-bottom: 14px; }
    .ar-storage-legend { display: flex; flex-direction: column; gap: 7px; }
    .ar-legend-row { display: flex; align-items: center; gap: 8px; }
    .ar-legend-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    .ar-legend-dot.la { background: #777; }
    .ar-legend-dot.lb { background: #aaa; }
    .ar-legend-dot.lc { background: #ccc; }
    .ar-legend-dot.ld { background: #e0e0e0; }
    .ar-legend-label { font-size: 10px; font-weight: 600; color: #666; flex: 1; }
    .ar-legend-val { font-size: 10px; font-weight: 800; color: #1c1c1c; }

    /* 按钮 */
    .ar-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 16px; }
    .ar-btn {
      border: none; outline: none; height: 50px; border-radius: 16px;
      display: flex; align-items: center; justify-content: center; gap: 8px;
      font: inherit; cursor: pointer; transition: transform .16s ease;
    }
    .ar-btn:active { transform: scale(.97); }
    .ar-btn svg { width: 15px; height: 15px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
    .ar-btn-primary { background: #555; color: #fff; box-shadow: 0 8px 20px rgba(0,0,0,.10); }
    .ar-btn-secondary { background: rgba(255,255,255,.88); color: #1c1c1c; border: 1px solid rgba(0,0,0,.06); box-shadow: 0 6px 16px rgba(0,0,0,.04); }

    /* 进度 */
    .ar-progress-card {
      display: none; margin-bottom: 16px; border-radius: 18px;
      background: rgba(255,255,255,.88); border: 1px solid rgba(0,0,0,.03);
      padding: 14px; box-shadow: 0 8px 20px rgba(0,0,0,.04);
    }
    .ar-progress-card.show { display: block; }
    .ar-progress-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
    .ar-progress-head .left { font-size: 9px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; color: #a3a3a3; }
    .ar-progress-head .right { font-size: 11px; font-weight: 900; color: #1c1c1c; }
    .ar-progress-bar { height: 5px; border-radius: 999px; background: #e8e8e8; overflow: hidden; }
    .ar-progress-fill { width: 0%; height: 100%; border-radius: 999px; background: linear-gradient(90deg,#888,#bbb); transition: width .3s ease; }

    /* 预设 */
    .ar-preset-strip { display: flex; gap: 8px; overflow-x: auto; padding: 0 2px 2px; margin-bottom: 16px; }
    .ar-preset-strip::-webkit-scrollbar { display: none; }
    .ar-preset {
      flex: 0 0 auto; display: flex; align-items: center; gap: 8px;
      padding: 10px 14px; border-radius: 999px;
      background: rgba(255,255,255,.85); border: 1px solid rgba(0,0,0,.04);
      box-shadow: 0 6px 14px rgba(0,0,0,.03);
      cursor: pointer; transition: transform .15s ease, background .15s ease;
    }
    .ar-preset:active { transform: scale(.97); }
    .ar-preset .dot { width: 8px; height: 8px; border-radius: 50%; background: #999; box-shadow: 0 0 0 3px rgba(0,0,0,.04); }
    .ar-preset .name { font-size: 10px; font-weight: 800; letter-spacing: .5px; text-transform: uppercase; color: #555; }
    .ar-preset .sub { font-size: 8px; font-weight: 700; color: #aaa; letter-spacing: 1px; }
    .ar-preset.active { background: #555; }
    .ar-preset.active .name, .ar-preset.active .sub { color: #fff; }
    .ar-preset.active .dot { background: #fff; box-shadow: 0 0 0 3px rgba(255,255,255,.12); }

    /* 分区标题 */
    .ar-section { display: flex; align-items: flex-end; justify-content: space-between; margin: 20px 2px 12px; }
    .ar-section .title { display: flex; flex-direction: column; gap: 4px; }
    .ar-section .title .en { font-size: 11px; font-weight: 900; letter-spacing: 2.4px; text-transform: uppercase; color: #1c1c1c; }
    .ar-section .title .cn { font-size: 9px; font-weight: 600; color: #a5a5a5; letter-spacing: 1px; }
    .ar-section .meta { font-size: 8px; font-weight: 700; letter-spacing: 1.4px; color: #c0c0c0; text-transform: uppercase; }

    /* 瀑布流卡片 */
    .ar-mosaic { display: grid; grid-template-columns: repeat(2,1fr); gap: 10px; margin-bottom: 16px; }
    .ar-mini {
      position: relative; overflow: hidden; border-radius: 22px;
      background: rgba(255,255,255,.88); border: 1px solid rgba(255,255,255,.95);
      box-shadow: 0 8px 22px rgba(0,0,0,.04);
      padding: 14px 13px 13px; min-height: 148px;
      transition: transform .2s ease;
    }
    .ar-mini:active { transform: scale(.98); }
    .ar-mini.wide { grid-column: 1 / -1; min-height: 120px; }
    .ar-mini-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; margin-bottom: 10px; }
    .ar-mini-icon {
      width: 36px; height: 36px; border-radius: 13px; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      background: #888; color: #fff; box-shadow: 0 6px 14px rgba(0,0,0,.08);
    }
    .ar-mini-icon.g2 { background: #a0a0a0; }
    .ar-mini-icon.g3 { background: #b5b5b5; }
    .ar-mini-icon.g4 { background: #c8c8c8; color: #555; }
    .ar-mini-icon.g5 { background: #999; }
    .ar-mini-icon.g6 { background: #aaa; }
    .ar-mini-icon.g7 { background: #bbb; }
    .ar-mini-icon svg { width: 17px; height: 17px; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
    .ar-mini-badge {
      flex-shrink: 0; min-width: 26px; height: 17px; padding: 0 6px;
      border-radius: 999px; background: #e8e8e8; color: #888;
      font-size: 8px; font-weight: 900; display: flex; align-items: center; justify-content: center; letter-spacing: .6px;
    }
    .ar-mini-title { font-size: 13px; font-weight: 800; color: #1c1c1c; letter-spacing: -.1px; margin-bottom: 3px; }
    .ar-mini-desc { font-size: 9px; line-height: 1.5; color: #a2a2a2; margin-bottom: 10px; }
    .ar-mini-tags { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 10px; }
    .ar-tag-pill {
      font-size: 7px; font-weight: 800; letter-spacing: .8px; text-transform: uppercase;
      color: #888; background: #f0f0f0; border: 1px solid rgba(0,0,0,.03);
      padding: 3px 7px; border-radius: 999px;
    }
    .ar-mini-foot { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
    .ar-mini-mini { font-size: 8px; font-weight: 800; letter-spacing: 1.2px; text-transform: uppercase; color: #b5b5b5; }

    /* 开关 */
    .ar-switch {
      width: 44px; height: 25px; border-radius: 999px; background: #dfdfdf;
      position: relative; flex-shrink: 0; cursor: pointer; transition: background .22s ease;
    }
    .ar-switch::after {
      content: ''; position: absolute; top: 2.5px; left: 2.5px;
      width: 20px; height: 20px; border-radius: 50%; background: #fff;
      box-shadow: 0 2px 5px rgba(0,0,0,.10);
      transition: transform .22s cubic-bezier(.34,1.56,.64,1);
    }
    .ar-switch.on { background: #888; }
    .ar-switch.on::after { transform: translateX(19px); }

    /* 历史 */
    .ar-history {
      border-radius: 22px; overflow: hidden;
      background: rgba(255,255,255,.86); border: 1px solid rgba(255,255,255,.95);
      box-shadow: 0 8px 22px rgba(0,0,0,.04); margin-bottom: 16px;
    }
    .ar-history-item {
      display: flex; align-items: center; gap: 12px;
      padding: 14px 15px; border-bottom: 1px solid rgba(0,0,0,.04);
    }
    .ar-history-item:last-child { border-bottom: none; }
    .ar-file {
      width: 40px; height: 40px; border-radius: 13px;
      background: #e0e0e0; color: #888;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; font-size: 15px; font-weight: 800;
      box-shadow: 0 6px 14px rgba(0,0,0,.04);
    }
    .ar-history-text { flex: 1; min-width: 0; }
    .ar-history-name { font-size: 12px; font-weight: 800; color: #1c1c1c; margin-bottom: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .ar-history-meta { font-size: 9px; color: #aaa; letter-spacing: .2px; }
    .ar-history-side { flex-shrink: 0; display: flex; flex-direction: column; align-items: flex-end; gap: 5px; }
    .ar-history-size { font-size: 10px; font-weight: 900; color: #1c1c1c; background: #f0f0f0; padding: 4px 9px; border-radius: 10px; }
    .ar-restore-btn { font-size: 8px; font-weight: 900; letter-spacing: 1px; color: #999; text-transform: uppercase; cursor: pointer; }
    .ar-restore-btn:active { color: #555; }
    .ar-delete-btn { font-size: 8px; font-weight: 900; letter-spacing: 1px; color: #ccc; text-transform: uppercase; cursor: pointer; }
    .ar-delete-btn:active { color: #999; }
    .ar-history-actions { display: flex; gap: 10px; }
    .ar-history-empty { padding: 28px; text-align: center; font-size: 11px; color: #bbb; }

    /* 危险 */
    .ar-danger {
      border-radius: 22px; padding: 16px; display: flex; align-items: center; gap: 12px;
      background: rgba(255,255,255,.84); border: 1px solid rgba(0,0,0,.04);
      box-shadow: 0 8px 22px rgba(0,0,0,.04); cursor: pointer;
    }
    .ar-danger:active { opacity: .85; }
    .ar-danger-mark {
      width: 40px; height: 40px; border-radius: 13px;
      display: flex; align-items: center; justify-content: center;
      background: #d4d4d4; color: #888; flex-shrink: 0;
    }
    .ar-danger-mark svg { width: 18px; height: 18px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; }
    .ar-danger-text { flex: 1; }
    .ar-danger-t1 { font-size: 13px; font-weight: 800; color: #1c1c1c; margin-bottom: 3px; }
    .ar-danger-t2 { font-size: 9px; color: #999; line-height: 1.5; }
    .ar-danger-arrow svg { width: 14px; height: 14px; fill: none; stroke: #bbb; stroke-width: 2.4; stroke-linecap: round; stroke-linejoin: round; }

    .ar-footer {
      margin: 20px 4px 4px; display: flex; align-items: center; justify-content: space-between;
      color: #c0c0c0; font-size: 8px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase;
    }
    .ar-footer .line { flex: 1; height: 1px; margin: 0 10px; background: linear-gradient(90deg,transparent,#d5d5d5,transparent); }

    /* Toast */
    .ar-toast {
      position: absolute; bottom: 60px; left: 50%; transform: translateX(-50%) translateY(8px);
      background: rgba(40,40,45,.82); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
      color: #fff; font-size: 11px; font-weight: 600;
      padding: 7px 16px; border-radius: 50px;
      opacity: 0; pointer-events: none; z-index: 9999;
      transition: opacity .22s, transform .22s; white-space: nowrap;
    }
    .ar-toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }
  `;

  // ===== 备份项定义 =====
  const BACKUP_ITEMS = [
    { key: 'wallpaper', label: 'Wallpaper', desc: '背景图、头像、封面与主页视觉资产', tags: ['media','profile'], icon: 'image', grade: '', badge: 'A1',
      dbKeys: ['bg_wallpaper','bg_cover','bg_info','avatar_main','avatar_card1','avatar_card2'], lsKeys: [] },
    { key: 'icons', label: 'Icon layout', desc: '桌面图标顺序、自定义图标外观', tags: ['layout','icons'], icon: 'grid', grade: 'g2', badge: 'B2',
      dbKeys: ['icon_order','current_page'], lsKeys: [], dbPrefix: 'icon_' },
    { key: 'texts', label: 'Editable texts', desc: '昵称、签名、页面文案与可编辑字段', tags: ['copy','notes','bio'], icon: 'edit', grade: 'g3', badge: 'C3',
      dbKeys: [], lsKeys: ['cl_notice_text'], dbPrefix: 'text_' },
    { key: 'api', label: 'API config', desc: '接口地址、密钥、模型参数', tags: ['api','keys'], icon: 'send', grade: 'g4', badge: 'D4',
      dbKeys: ['api_config','api_presets','api_fav_models'], lsKeys: [] },
    { key: 'masks', label: 'Masks', desc: '面具、人设、禁忌与角色头像', tags: ['persona','mask'], icon: 'user', grade: 'g5', badge: 'E5',
      dbKeys: ['wp_user_masks_v1','wp_active_mask_id'], lsKeys: [] },
    { key: 'fonts', label: 'Fonts', desc: '字体、字号与显示偏好设置', tags: ['font','ui'], icon: 'type', grade: 'g6', badge: 'F6',
      dbKeys: ['font_presets','font_active','font_use_system','font_size','setting_bg_color','setting_fullscreen','hide_statusbar','hide_island'], lsKeys: ['cl_bar_style'] },
    { key: 'chat', label: 'Chat history', desc: '对话记录、消息内容与聊天草稿', tags: ['history','logs','drafts'], icon: 'chat', grade: 'g7', badge: 'G7',
      dbKeys: [], lsKeys: [], dbPrefix: 'chat_' },
  ];

  const ICONS_SVG = {
    image: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="9" cy="9" r="2"/><path d="M21 15l-5-5L5 21"/></svg>',
    grid: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>',
    edit: '<svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>',
    send: '<svg viewBox="0 0 24 24"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>',
    user: '<svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
    type: '<svg viewBox="0 0 24 24"><path d="M5 7V5h14v2M9 19h6M12 5v14"/></svg>',
    chat: '<svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
  };

  let toggleStates = {};
  let storageData = { images: 0, config: 0, masks: 0, others: 0, total: 0 };

  function injectCSS() {
    if (document.getElementById('archiveStyles')) return;
    const s = document.createElement('style');
    s.id = 'archiveStyles';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  // ===== 存储空间计算 =====
  async function calcStorage() {
    const sizes = { images: 0, config: 0, masks: 0, others: 0 };
    const imageKeys = ['bg_wallpaper','bg_cover','bg_info','avatar_main','avatar_card1','avatar_card2'];
    const maskKeys = ['wp_user_masks_v1','wp_active_mask_id'];
    const configKeys = ['api_config','api_presets','api_fav_models','font_presets','font_active','font_use_system','font_size','setting_bg_color','setting_fullscreen','hide_statusbar','hide_island','icon_order','current_page'];

    if (typeof HomeDB !== 'undefined') {
      let allKeys = [];
      if (typeof HomeDB.getAllKeys === 'function') {
        allKeys = await HomeDB.getAllKeys();
      } else {
        const knownKeys = [].concat(imageKeys, maskKeys, configKeys, ['backup_history']);
        const prefixes = ['icon_','text_','chat_'];
        for (const k of knownKeys) {
          const val = await HomeDB.getItem(k);
          if (val !== null && val !== undefined) allKeys.push(k);
        }
        for (const prefix of prefixes) {
          for (let i = 0; i < 200; i++) {
            const testKey = prefix + i;
            const val = await HomeDB.getItem(testKey);
            if (val !== null && val !== undefined) allKeys.push(testKey);
          }
        }
        const editEls = document.querySelectorAll('[data-edit-key]');
        for (const el of editEls) {
          const k = 'text_' + el.dataset.editKey;
          const val = await HomeDB.getItem(k);
          if (val !== null && val !== undefined && !allKeys.includes(k)) allKeys.push(k);
        }
        const appItems = document.querySelectorAll('.app-item .app-label');
        for (const lbl of appItems) {
          const k = 'icon_' + lbl.textContent.trim();
          const val = await HomeDB.getItem(k);
          if (val !== null && val !== undefined && !allKeys.includes(k)) allKeys.push(k);
        }
      }
      for (const k of allKeys) {
        const val = await HomeDB.getItem(k);
        const s = val ? JSON.stringify(val).length : 0;
        if (imageKeys.includes(k) || k.startsWith('icon_')) {
          sizes.images += s;
        } else if (maskKeys.includes(k)) {
          sizes.masks += s;
        } else if (configKeys.includes(k)) {
          sizes.config += s;
        } else {
          sizes.others += s;
        }
      }
    }
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      const v = localStorage.getItem(k) || '';
      sizes.others += v.length;
    }
    sizes.total = sizes.images + sizes.config + sizes.masks + sizes.others;
    storageData = sizes;
    return sizes;
  }

  function fmtSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  function updateStorageUI() {
    const total = storageData.total || 1;
    const el = (id) => document.getElementById(id);
    if (el('arRingNum')) el('arRingNum').textContent = fmtSize(total).split(' ')[0];
    if (el('arRingUnit')) el('arRingUnit').textContent = fmtSize(total).split(' ')[1] + ' USED';
    if (el('arLegImgVal')) el('arLegImgVal').textContent = fmtSize(storageData.images);
    if (el('arLegCfgVal')) el('arLegCfgVal').textContent = fmtSize(storageData.config);
    if (el('arLegMskVal')) el('arLegMskVal').textContent = fmtSize(storageData.masks);
    if (el('arLegOthVal')) el('arLegOthVal').textContent = fmtSize(storageData.others);

    const circ = 339.292;
    const pA = storageData.images / total;
    const pB = storageData.config / total;
    const pC = storageData.masks / total;
    const pD = storageData.others / total;
    const rA = el('arRingA');
    const rB = el('arRingB');
    const rC = el('arRingC');
    const rD = el('arRingD');
    if (rD) rD.style.strokeDashoffset = circ * (1 - (pA + pB + pC + pD));
    if (rC) rC.style.strokeDashoffset = circ * (1 - (pA + pB + pC));
    if (rB) rB.style.strokeDashoffset = circ * (1 - (pA + pB));
    if (rA) rA.style.strokeDashoffset = circ * (1 - pA);
  }

  // ===== 真实导出 =====
  async function collectPrefixKeys(prefix) {
    const keys = [];
    if (typeof HomeDB === 'undefined') return keys;
    if (typeof HomeDB.getAllKeys === 'function') {
      const allKeys = await HomeDB.getAllKeys();
      for (const k of allKeys) {
        if (k.startsWith(prefix)) keys.push(k);
      }
    } else {
      if (prefix === 'text_') {
        const editEls = document.querySelectorAll('[data-edit-key]');
        for (const el of editEls) {
          const k = 'text_' + el.dataset.editKey;
          const val = await HomeDB.getItem(k);
          if (val !== null && val !== undefined) keys.push(k);
        }
      } else if (prefix === 'icon_') {
        const appItems = document.querySelectorAll('.app-item .app-label');
        for (const lbl of appItems) {
          const k = 'icon_' + lbl.textContent.trim();
          const val = await HomeDB.getItem(k);
          if (val !== null && val !== undefined) keys.push(k);
        }
      } else if (prefix === 'chat_') {
        for (let i = 0; i < 100; i++) {
          for (const suffix of ['_history','_settings','_draft']) {
            const k = 'chat_' + i + suffix;
            const val = await HomeDB.getItem(k);
            if (val !== null && val !== undefined) keys.push(k);
          }
        }
      }
    }
    return keys;
  }

  async function doExport(progressCb) {
    const enabledItems = BACKUP_ITEMS.filter(it => toggleStates[it.key] !== false);
    const backup = { _meta: { version: 1, date: new Date().toISOString(), items: enabledItems.map(i => i.key) }, db: {}, ls: {} };
    const totalSteps = enabledItems.length;
    let step = 0;

    for (const item of enabledItems) {
      if (typeof HomeDB !== 'undefined') {
        for (const dk of (item.dbKeys || [])) {
          const val = await HomeDB.getItem(dk);
          if (val !== null && val !== undefined) backup.db[dk] = val;
        }
        if (item.dbPrefix) {
          const prefixKeys = await collectPrefixKeys(item.dbPrefix);
          for (const k of prefixKeys) {
            if (!backup.db.hasOwnProperty(k)) {
              const val = await HomeDB.getItem(k);
              if (val !== null && val !== undefined) backup.db[k] = val;
            }
          }
        }
      }
      for (const lk of (item.lsKeys || [])) {
        const val = localStorage.getItem(lk);
        if (val !== null) backup.ls[lk] = val;
      }
      step++;
      if (progressCb) progressCb(step / totalSteps);
    }

    const json = JSON.stringify(backup);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const now = new Date();
    const ts = `${now.getFullYear()}${(now.getMonth()+1).toString().padStart(2,'0')}${now.getDate().toString().padStart(2,'0')}`;
    a.href = url;
    a.download = `byeol_backup_${ts}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    await saveHistory({ name: a.download, date: now.toISOString(), size: json.length, items: backup._meta.items });
    return json.length;
  }

  // ===== 真实导入 =====
  async function doImport(progressCb) {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.style.display = 'none';
      document.body.appendChild(input);
      input.addEventListener('change', async () => {
        const file = input.files && input.files[0];
        input.remove();
        if (!file) { reject('no file'); return; }
        try {
          const text = await file.text();
          const backup = JSON.parse(text);
          if (!backup._meta) { reject('invalid format'); return; }

          const dbEntries = Object.entries(backup.db || {});
          const lsEntries = Object.entries(backup.ls || {});
          const total = dbEntries.length + lsEntries.length;
          let done = 0;

          if (typeof HomeDB !== 'undefined') {
            for (const [k, v] of dbEntries) {
              await HomeDB.setItem(k, v);
              done++;
              if (progressCb) progressCb(done / total);
            }
          }
          for (const [k, v] of lsEntries) {
            localStorage.setItem(k, v);
            done++;
            if (progressCb) progressCb(done / total);
          }
          resolve({ items: backup._meta.items, count: total });
        } catch (e) { reject(e.message || 'parse error'); }
      });
      input.click();
    });
  }

  // ===== 备份历史（存到 HomeDB） =====
  async function getHistory() {
    if (typeof HomeDB === 'undefined') return [];
    const h = await HomeDB.getItem('backup_history');
    return Array.isArray(h) ? h : [];
  }
  async function saveHistory(entry) {
    const list = await getHistory();
    list.unshift(entry);
    if (list.length > 10) list.length = 10;
    await HomeDB.setItem('backup_history', list);
  }
  async function deleteHistory(idx) {
    const list = await getHistory();
    list.splice(idx, 1);
    await HomeDB.setItem('backup_history', list);
  }

  // ===== 清空所有数据 =====
  async function eraseAll() {
    if (!confirm('确定要清空所有本地数据吗？\n此操作不可逆，建议先导出备份。')) return false;
    if (!confirm('再次确认：所有壁纸、头像、文案、API配置、面具、聊天记录都将被永久删除。')) return false;
    if (typeof HomeDB !== 'undefined') {
      const allKeys = await HomeDB.getAllKeys();
      for (const k of allKeys) { await HomeDB.setItem(k, null); }
    }
    localStorage.clear();
    return true;
  }

  function buildHTML() {
    const items = BACKUP_ITEMS.map((it, i) => {
      const isWide = (i === 2 || i === 6);
      return `
        <div class="ar-mini${isWide ? ' wide' : ''}">
          <div class="ar-mini-head">
            <div class="ar-mini-icon${it.grade ? ' '+it.grade : ''}">${ICONS_SVG[it.icon]}</div>
            <div class="ar-mini-badge">${it.badge}</div>
          </div>
          <div class="ar-mini-title">${it.label}</div>
          <div class="ar-mini-desc">${it.desc}</div>
          <div class="ar-mini-tags">${it.tags.map(t => `<span class="ar-tag-pill">${t}</span>`).join('')}</div>
          <div class="ar-mini-foot">
            <div class="ar-mini-mini" id="arItemSize_${it.key}">—</div>
            <div class="ar-switch${it.key === 'chat' ? '' : ' on'}" data-key="${it.key}"></div>
          </div>
        </div>`;
    }).join('');

    return `
    <div class="archive-panel" id="archivePanel">
      <div class="ar-island"></div>

      <div class="ar-statusbar">
        <span class="ar-sb-time" id="arTime">9:41</span>
        <div class="ar-sb-right">
          <div class="ar-sb-dots"><span></span><span></span><span></span><span></span></div>
          <span class="ar-sb-4g">5G</span>
          <div class="ar-sb-battery"><div class="ar-sb-battery-body"></div><div class="ar-sb-battery-tip"></div></div>
        </div>
      </div>

      <div class="ar-scroll">
        <div style="display:flex;align-items:center;gap:12px;padding:6px 2px 14px;">
          <div id="arBackBtn" style="width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,.85);border:1px solid rgba(0,0,0,.04);box-shadow:0 4px 12px rgba(0,0,0,.04);display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;">
            <svg viewBox="0 0 24 24" style="width:14px;height:14px;fill:#555;"><path d="M14.7 5.3a1 1 0 010 1.4L9.4 12l5.3 5.3a1 1 0 11-1.4 1.4l-6-6a1 1 0 010-1.4l6-6a1 1 0 011.4 0z"/></svg>
          </div>
          <div style="flex:1;">
            <div style="font-size:8px;font-weight:700;color:#b0b0b8;letter-spacing:2.5px;text-transform:uppercase;margin-bottom:2px;">⋆ DATA VAULT ⋆</div>
            <div style="font-size:22px;font-weight:900;color:#1c1c1c;letter-spacing:-.5px;">Archive</div>
          </div>
        </div>
        <section class="ar-storage-hero">
          <div class="ar-ring-wrap">
            <svg viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="54" class="ar-ring-bg"/>
              <circle cx="60" cy="60" r="54" class="ar-ring-fill ar-ring-d" id="arRingD" stroke-dashoffset="339.292"/>
              <circle cx="60" cy="60" r="54" class="ar-ring-fill ar-ring-c" id="arRingC" stroke-dashoffset="339.292"/>
              <circle cx="60" cy="60" r="54" class="ar-ring-fill ar-ring-b" id="arRingB" stroke-dashoffset="339.292"/>
              <circle cx="60" cy="60" r="54" class="ar-ring-fill ar-ring-a" id="arRingA" stroke-dashoffset="339.292"/>
            </svg>
            <div class="ar-ring-center">
              <div class="ar-ring-num" id="arRingNum">—</div>
              <div class="ar-ring-unit" id="arRingUnit">LOADING</div>
            </div>
          </div>
          <div class="ar-storage-info">
            <div class="ar-storage-title">Storage</div>
            <div class="ar-storage-sub">当前数据占用空间</div>
            <div class="ar-storage-legend">
              <div class="ar-legend-row"><div class="ar-legend-dot la"></div><div class="ar-legend-label">Images</div><div class="ar-legend-val" id="arLegImgVal">—</div></div>
              <div class="ar-legend-row"><div class="ar-legend-dot lb"></div><div class="ar-legend-label">Config</div><div class="ar-legend-val" id="arLegCfgVal">—</div></div>
              <div class="ar-legend-row"><div class="ar-legend-dot lc"></div><div class="ar-legend-label">Masks</div><div class="ar-legend-val" id="arLegMskVal">—</div></div>
              <div class="ar-legend-row"><div class="ar-legend-dot ld"></div><div class="ar-legend-label">Others</div><div class="ar-legend-val" id="arLegOthVal">—</div></div>
            </div>
          </div>
        </section>

        <section class="ar-actions">
          <button class="ar-btn ar-btn-primary" id="arExportBtn">
            <svg viewBox="0 0 24 24"><path d="M12 3v12M7 8l5-5 5 5M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/></svg>
            EXPORT
          </button>
          <button class="ar-btn ar-btn-secondary" id="arImportBtn">
            <svg viewBox="0 0 24 24"><path d="M12 21V9M17 14l-5 5-5-5M4 8V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3"/></svg>
            IMPORT
          </button>
        </section>

        <section class="ar-progress-card" id="arProgress">
          <div class="ar-progress-head">
            <div class="left" id="arProgressText">—</div>
            <div class="right" id="arProgressPct">0%</div>
          </div>
          <div class="ar-progress-bar"><div class="ar-progress-fill" id="arProgressFill"></div></div>
        </section>

        <section class="ar-section">
          <div class="title"><div class="en">Preset packs</div><div class="cn">一键打包方案</div></div>
          <div class="meta">quick</div>
        </section>

        <div class="ar-preset-strip" id="arPresetStrip">
          <div class="ar-preset active" data-preset="full"><div class="dot"></div><div><div class="name">Full save</div><div class="sub">完整备份</div></div></div>
          <div class="ar-preset" data-preset="media"><div class="dot"></div><div><div class="name">Media only</div><div class="sub">图片资源</div></div></div>
          <div class="ar-preset" data-preset="config"><div class="dot"></div><div><div class="name">Config only</div><div class="sub">配置项</div></div></div>
          <div class="ar-preset" data-preset="lite"><div class="dot"></div><div><div class="name">Lite copy</div><div class="sub">轻量存档</div></div></div>
        </div>

        <section class="ar-section">
          <div class="title"><div class="en">What to archive</div><div class="cn">想保存哪些内容</div></div>
          <div class="meta">toggle</div>
        </section>

        <section class="ar-mosaic">${items}</section>

        <section class="ar-section">
          <div class="title"><div class="en">Recent snapshots</div><div class="cn">最近存档记录</div></div>
          <div class="meta">history</div>
        </section>

        <section class="ar-history" id="arHistoryList">
          <div class="ar-history-empty">暂无备份记录</div>
        </section>

        <section class="ar-section">
          <div class="title"><div class="en">Import from Whisper</div><div class="cn">从星星项目迁移聊天记录</div></div>
          <div class="meta">migrate</div>
        </section>

        <section class="ar-danger" id="arMigrateBtn" style="background:rgba(255,255,255,.84);border:1px solid rgba(0,0,0,.04);box-shadow:0 8px 22px rgba(0,0,0,.04);">
          <div class="ar-danger-mark" style="background:#e0e0e0;color:#666;">
            <svg viewBox="0 0 24 24" style="width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
          </div>
          <div class="ar-danger-text">
            <div class="ar-danger-t1" style="color:#1c1c1c;">导入星星项目备份</div>
            <div class="ar-danger-t2">选择 WhisperPhone 导出的 JSON 文件，聊天记录注入 Byeol</div>
          </div>
          <div class="ar-danger-arrow"><svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg></div>
        </section>

        <section class="ar-section">
          <div class="title"><div class="en">Danger zone</div><div class="cn">危险操作区域</div></div>
          <div class="meta">careful</div>
        </section>

        <section class="ar-danger" id="arEraseBtn">
          <div class="ar-danger-mark"><svg viewBox="0 0 24 24"><path d="M12 8v5M12 17h.01M10.29 3.86l-8.2 14.2A2 2 0 0 0 3.8 21h16.4a2 2 0 0 0 1.71-2.94l-8.2-14.2a2 2 0 0 0-3.42 0z"/></svg></div>
          <div class="ar-danger-text"><div class="ar-danger-t1">Erase all local data</div><div class="ar-danger-t2">清空所有本地内容，操作不可逆。先备份，再删除。</div></div>
          <div class="ar-danger-arrow"><svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg></div>
        </section>

        <div class="ar-footer">
          <span>archive</span><span class="line"></span><span>backup system</span>
        </div>
      </div>

      <div class="ar-toast" id="arToast"></div>
    </div>`;
  }

  // ===== Toast =====
  let _toastTimer = null;
  function showToast(msg) {
    const el = document.getElementById('arToast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
    if (_toastTimer) clearTimeout(_toastTimer);
    _toastTimer = setTimeout(() => el.classList.remove('show'), 2000);
  }

  // ===== 渲染历史 =====
  async function renderHistory() {
    const list = await getHistory();
    const container = document.getElementById('arHistoryList');
    if (!container) return;
    if (list.length === 0) {
      container.innerHTML = '<div class="ar-history-empty">暂无备份记录</div>';
      return;
    }
    container.innerHTML = list.map((h, i) => {
      const d = new Date(h.date);
      const dateStr = `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}-${d.getDate().toString().padStart(2,'0')} · ${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
      return `<div class="ar-history-item">
        <div class="ar-file">${(i+1).toString().padStart(2,'0')}</div>
        <div class="ar-history-text">
          <div class="ar-history-name">${h.name}</div>
          <div class="ar-history-meta">${dateStr} · ${(h.items||[]).length} items</div>
        </div>
        <div class="ar-history-side">
          <div class="ar-history-size">${fmtSize(h.size)}</div>
          <div class="ar-history-actions">
            <div class="ar-delete-btn" data-idx="${i}">DELETE</div>
          </div>
        </div>
      </div>`;
    }).join('');

    container.querySelectorAll('.ar-delete-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const idx = parseInt(btn.dataset.idx);
        await deleteHistory(idx);
        await renderHistory();
        showToast('记录已删除');
      });
    });
  }

  // ===== 预设方案 =====
  const PRESETS = {
    full: { wallpaper: true, icons: true, texts: true, api: true, masks: true, fonts: true, chat: true },
    media: { wallpaper: true, icons: true, texts: false, api: false, masks: false, fonts: false, chat: false },
    config: { wallpaper: false, icons: false, texts: true, api: true, masks: true, fonts: true, chat: false },
    lite: { wallpaper: false, icons: true, texts: true, api: true, masks: false, fonts: true, chat: false },
  };

  function applyPreset(name) {
    const preset = PRESETS[name];
    if (!preset) return;
    BACKUP_ITEMS.forEach(it => {
      toggleStates[it.key] = !!preset[it.key];
      const sw = panel.querySelector(`.ar-switch[data-key="${it.key}"]`);
      if (sw) sw.classList.toggle('on', toggleStates[it.key]);
    });
  }

  function open(triggerItem) {
    if (!panel) return;
    panel.classList.remove('closing');
    if (triggerItem) {
      const icon = triggerItem.querySelector('.app-icon');
      if (icon) { icon.classList.add('ar-flying'); setTimeout(() => icon.classList.remove('ar-flying'), 700); }
    }
    panel.classList.add('open');
    calcStorage().then(() => { updateStorageUI(); });
    renderHistory();
  }

  function close() {
    if (!panel) return;
    panel.classList.remove('open');
    panel.classList.add('closing');
    setTimeout(() => { if (panel) panel.classList.remove('closing'); }, 320);
  }

  function updateTime() {
    const el = document.getElementById('arTime');
    if (!el) return;
    const now = new Date();
    el.textContent = `${now.getHours()}:${now.getMinutes().toString().padStart(2,'0')}`;
  }

  function init() {
    injectCSS();
    const screen = document.querySelector('.phone-screen');
    if (!screen) return;
    screen.insertAdjacentHTML('beforeend', buildHTML());
    panel = document.getElementById('archivePanel');

    // 初始化开关状态
    BACKUP_ITEMS.forEach(it => { toggleStates[it.key] = it.key !== 'chat'; });

    // 开关点击
    panel.querySelectorAll('.ar-switch').forEach(sw => {
      sw.addEventListener('click', (e) => {
        e.stopPropagation();
        sw.classList.toggle('on');
        toggleStates[sw.dataset.key] = sw.classList.contains('on');
      });
    });

    // 预设切换
    panel.querySelectorAll('.ar-preset').forEach(p => {
      p.addEventListener('click', (e) => {
        e.stopPropagation();
        panel.querySelectorAll('.ar-preset').forEach(x => x.classList.remove('active'));
        p.classList.add('active');
        applyPreset(p.dataset.preset);
      });
    });

    // 导出
    document.getElementById('arExportBtn').addEventListener('click', async (e) => {
      e.stopPropagation();
      const prog = document.getElementById('arProgress');
      const fill = document.getElementById('arProgressFill');
      const pct = document.getElementById('arProgressPct');
      const text = document.getElementById('arProgressText');
      prog.classList.add('show');
      text.textContent = 'Exporting data';
      fill.style.width = '0%';
      pct.textContent = '0%';
      try {
        const size = await doExport((p) => {
          fill.style.width = Math.round(p * 100) + '%';
          pct.textContent = Math.round(p * 100) + '%';
        });
        text.textContent = 'Completed';
        fill.style.width = '100%';
        pct.textContent = '100%';
        showToast('✦ 导出成功 · ' + fmtSize(size));
        await renderHistory();
        setTimeout(() => prog.classList.remove('show'), 1500);
      } catch (err) {
        text.textContent = 'Failed';
        showToast('导出失败: ' + err);
        setTimeout(() => prog.classList.remove('show'), 2000);
      }
    });

    // 导入
    document.getElementById('arImportBtn').addEventListener('click', async (e) => {
      e.stopPropagation();
      const prog = document.getElementById('arProgress');
      const fill = document.getElementById('arProgressFill');
      const pct = document.getElementById('arProgressPct');
      const text = document.getElementById('arProgressText');
      prog.classList.add('show');
      text.textContent = 'Importing data';
      fill.style.width = '0%';
      pct.textContent = '0%';
      try {
        const result = await doImport((p) => {
          fill.style.width = Math.round(p * 100) + '%';
          pct.textContent = Math.round(p * 100) + '%';
        });
        text.textContent = 'Completed';
        fill.style.width = '100%';
        pct.textContent = '100%';
        showToast('✦ 导入成功 · ' + result.count + ' 项');
        await calcStorage();
        updateStorageUI();
        setTimeout(() => {
          prog.classList.remove('show');
          if (confirm('数据已恢复，是否立即刷新页面以应用更改？')) {
            location.reload();
          }
        }, 1500);
      } catch (err) {
        text.textContent = 'Failed';
        showToast('导入失败: ' + err);
        setTimeout(() => prog.classList.remove('show'), 2000);
      }
    });

    // 从星星项目备份文件导入
    document.getElementById('arMigrateBtn').addEventListener('click', async (e) => {
      e.stopPropagation();

      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.style.display = 'none';
      document.body.appendChild(input);

      input.addEventListener('change', async () => {
        const file = input.files && input.files[0];
        input.remove();
        if (!file) return;

        try {
          const text = await file.text();
          const backup = JSON.parse(text);

          // 星星项目备份格式：{ contacts: [...], conversations: {...} } 或 localStorage 全量
          let wpContacts = [];
          let wpConvs = {};

          if (backup.contacts && Array.isArray(backup.contacts)) {
            wpContacts = backup.contacts;
          } else if (backup.wp_chat_contacts) {
            wpContacts = typeof backup.wp_chat_contacts === 'string' ? JSON.parse(backup.wp_chat_contacts) : backup.wp_chat_contacts;
          }

          if (backup.conversations && typeof backup.conversations === 'object') {
            wpConvs = backup.conversations;
          } else if (backup.wp_chat_messages) {
            wpConvs = typeof backup.wp_chat_messages === 'string' ? JSON.parse(backup.wp_chat_messages) : backup.wp_chat_messages;
          }

          // 兼容：如果备份是 { db: {...}, ls: {...} } 格式（Byeol自己的备份格式里可能藏着）
          if (backup.db && backup.db.wp_chat_messages) {
            wpConvs = typeof backup.db.wp_chat_messages === 'string' ? JSON.parse(backup.db.wp_chat_messages) : backup.db.wp_chat_messages;
          }
          if (backup.ls && backup.ls.wp_chat_contacts) {
            wpContacts = typeof backup.ls.wp_chat_contacts === 'string' ? JSON.parse(backup.ls.wp_chat_contacts) : backup.ls.wp_chat_contacts;
          }

          if (wpContacts.length === 0) {
            // 再试一次：整个文件可能就是 localStorage 的 dump
            const keys = Object.keys(backup);
            for (const k of keys) {
              if (k === 'wp_chat_contacts' || k.includes('contacts')) {
                const val = typeof backup[k] === 'string' ? JSON.parse(backup[k]) : backup[k];
                if (Array.isArray(val) && val.length > 0 && val[0].id) { wpContacts = val; break; }
              }
            }
            for (const k of keys) {
              if (k === 'wp_chat_messages' || k.includes('messages')) {
                const val = typeof backup[k] === 'string' ? JSON.parse(backup[k]) : backup[k];
                if (val && typeof val === 'object' && !Array.isArray(val)) { wpConvs = val; break; }
              }
            }
          }

          if (wpContacts.length === 0) {
            alert('未在文件中找到联系人数据。\n\n支持的格式：\n1. { contacts: [...], conversations: {...} }\n2. { wp_chat_contacts: [...], wp_chat_messages: {...} }\n\n请确认这是星星项目的备份文件。');
            return;
          }

          if (!confirm('找到 ' + wpContacts.length + ' 个联系人，' + Object.keys(wpConvs).length + ' 个对话。\n\n确认导入到 Byeol？同名联系人消息会追加。')) return;

          // 打开 Byeol DB
          const byeolDB = await new Promise((resolve, reject) => {
            const req = indexedDB.open('ByeolPhone_DB', 2);
            req.onupgradeneeded = ev => {
              const db = ev.target.result;
              if (!db.objectStoreNames.contains('homescreen')) db.createObjectStore('homescreen');
              if (!db.objectStoreNames.contains('contacts')) db.createObjectStore('contacts', { keyPath: 'id' });
            };
            req.onsuccess = ev => resolve(ev.target.result);
            req.onerror = ev => reject(ev.target.error);
          });

          // 读取已有联系人
          let existingAll = [];
          try {
            const rtx = byeolDB.transaction('contacts', 'readonly');
            const rs = rtx.objectStore('contacts');
            existingAll = await new Promise(resolve => {
              const r = rs.getAll();
              r.onsuccess = () => resolve(r.result || []);
              r.onerror = () => resolve([]);
            });
          } catch(e) {}

          // 写入
          const wtx = byeolDB.transaction('contacts', 'readwrite');
          const ws = wtx.objectStore('contacts');
          let migratedCount = 0;
          let msgCount = 0;

          for (const wc of wpContacts) {
            const wcId = wc.id;
            const wcName = wc.name || (wc.settings && (wc.settings.realName || wc.settings.charName)) || '未命名';
            const wcMsgs = wpConvs[wcId] || [];

            const convertedMsgs = [];
            for (let mi = 0; mi < wcMsgs.length; mi++) {
              const m = wcMsgs[mi];
              let ts = Date.now() - (wcMsgs.length - mi) * 60000;
              if (m.time) {
                try {
                  const parts = (m.time + '').split(' ');
                  if (parts.length >= 2) {
                    const dp = parts[0].split('-');
                    const tp = parts[1].split(':');
                    const parsed = new Date(parseInt(dp[0])||2025, (parseInt(dp[1])||1)-1, parseInt(dp[2])||1, parseInt(tp[0])||0, parseInt(tp[1])||0).getTime();
                    if (!isNaN(parsed) && parsed > 0) ts = parsed;
                  }
                } catch(e) {}
              }
              convertedMsgs.push({
                id: m.id || ('mig_' + mi + '_' + Math.random().toString(36).slice(2,7)),
                role: m.role === 'user' ? 'user' : 'assistant',
                text: m.text || '',
                time: ts
              });
            }

            let existing = existingAll.find(c => c.name === wcName);

            if (existing) {
              if (!existing.messages) existing.messages = [];
              existing.messages = existing.messages.concat(convertedMsgs);
              existing.chatStarted = true;
              ws.put(existing);
            } else {
              const newContact = {
                id: 'mig_' + wcId + '_' + Date.now() + '_' + Math.random().toString(36).slice(2,5),
                name: wcName,
                sub: (wc.settings && wc.settings.personality) || '',
                relation: '',
                tags: [],
                greeting: (wc.settings && wc.settings.greeting) || '',
                description: (wc.settings && wc.settings.personality) || '',
                systemPrompt: (wc.settings && wc.settings.prompt) || '',
                charName: (wc.settings && (wc.settings.charName || wc.settings.realName)) || wcName,
                avatar: (wc.settings && wc.settings.avatar && wc.settings.avatar.startsWith('data:')) ? wc.settings.avatar : '',
                messages: convertedMsgs,
                chatStarted: convertedMsgs.length > 0,
                exampleDialog: ''
              };
              ws.put(newContact);
              existingAll.push(newContact);
            }

            migratedCount++;
            msgCount += convertedMsgs.length;
          }

          await new Promise((resolve, reject) => {
            wtx.oncomplete = () => resolve();
            wtx.onerror = (ev) => reject(ev.target.error);
          });
          byeolDB.close();

          showToast('✦ 导入成功 · ' + migratedCount + ' 个联系人 · ' + msgCount + ' 条消息');
          await calcStorage();
          updateStorageUI();

          if (confirm('数据已导入，是否刷新页面以显示？')) {
            location.reload();
          }

        } catch (err) {
          console.error('[Migrate]', err);
          alert('导入失败:\n' + (err.message || err));
        }
      });

      input.click();
    });

    // 清空
    document.getElementById('arEraseBtn').addEventListener('click', async (e) => {
      e.stopPropagation();
      const ok = await eraseAll();
      if (ok) {
        showToast('所有数据已清除');
        setTimeout(() => location.reload(), 1000);
      }
    });

    // 返回按钮
    document.getElementById('arBackBtn').addEventListener('click', (e) => {
      e.stopPropagation();
      close();
    });

    updateTime();
    setInterval(updateTime, 1000);

    // 入口绑定
    const ENTRY_LABELS = ['Archive', 'archive', '备份'];
    document.querySelectorAll('.app-item').forEach(item => {
      const label = item.querySelector('.app-label');
      if (!label) return;
      const text = label.textContent.trim();
      if (!ENTRY_LABELS.includes(text)) return;
      item.addEventListener('click', (e) => {
        if (document.querySelector('.app-grid.edit-mode-active')) return;
        e.stopPropagation();
        open(item);
      });
    });

    panel.addEventListener('click', (e) => { e.stopPropagation(); });
  }

  return { init, open, close };
})();

window.addEventListener('DOMContentLoaded', () => {
  ArchivePage.init();
});
