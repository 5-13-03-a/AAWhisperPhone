// ==========================================
// Chat List 聊天列表（CSS + HTML + 交互一体）
// ==========================================

const ChatListPage = (() => {
  let panel = null;

  const CSS = `
    /* === Chat List Panel === */
    .chat-list-panel {
      position: absolute; inset: 0; z-index: 200;
      background: #FAFAFA;
      display: flex; flex-direction: column;
      opacity: 0;
      transform: scale(0.96);
      pointer-events: none;
      transition:
        opacity 0.3s ease 0.25s,
        transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) 0.25s;
      overflow: hidden;
      border-radius: inherit;
      font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif;
    }
    .chat-list-panel.open {
      opacity: 1;
      transform: scale(1);
      pointer-events: auto;
    }
    .chat-list-panel.closing {
      transition:
        opacity 0.22s ease,
        transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
      transition-delay: 0s;
      opacity: 0;
      transform: scale(0.96);
      pointer-events: none;
    }
    .chat-list-panel * {
      box-sizing: border-box;
      -webkit-tap-highlight-color: transparent;
      user-select: none;
    }
    .chat-list-panel input { user-select: text; }

    /* 图标飞出动画 */
    .app-icon.cl-flying {
      transition:
        transform 0.5s cubic-bezier(0.65, 0, 0.35, 1),
        opacity 0.2s ease 0.3s !important;
      transform: scale(8) !important;
      opacity: 0 !important;
      pointer-events: none;
    }

    /* 状态栏 */
    .cl-statusbar {
      display: flex; justify-content: space-between; align-items: center;
      padding: 14px 28px 8px; height: 52px; color: #1c1c1c;
      flex-shrink: 0; position: relative; z-index: 10;
    }
    .cl-sb-left { display: flex; align-items: center; gap: 6px; }
    .cl-sb-time { font-size: 16px; font-weight: 700; letter-spacing: -0.3px; }
    .cl-sb-headphone { width: 16px; height: 16px; }
    .cl-sb-right { display: flex; align-items: center; gap: 4px; }
    .cl-sb-dots { display: flex; gap: 1.5px; }
    .cl-sb-dots span { width: 3px; height: 3px; border-radius: 50%; background: #1c1c1c; }
    .cl-sb-4g { font-size: 12px; font-weight: 700; color: #1c1c1c; margin-left: 2px; }
    .cl-sb-battery { display: flex; align-items: center; gap: 2px; }
    .cl-sb-battery-body { width: 22px; height: 11px; border-radius: 3px; border: 1.2px solid #34c759; position: relative; overflow: hidden; }
    .cl-sb-battery-body::after { content: ''; position: absolute; inset: 1.5px; border-radius: 1.5px; background: #34c759; width: 30%; }
    .cl-sb-battery-tip { width: 2px; height: 5px; border-radius: 0 1px 1px 0; background: #34c759; }
    .cl-sb-battery-pct { font-size: 10px; font-weight: 600; color: #34c759; }
    .cl-island {
      position: absolute; top: 12px; left: 50%; transform: translateX(-50%);
      width: 126px; height: 36px; background: #000; border-radius: 20px; z-index: 100;
    }

    /* 顶部 Profile 行 */
    .cl-top-profile {
      flex-shrink: 0;
      padding: 4px 20px 12px;
      display: flex; align-items: center; justify-content: space-between;
    }
    .cl-tp-left { display: flex; align-items: center; gap: 10px; }
    .cl-tp-avatar {
      width: 40px; height: 40px; border-radius: 50%;
      background: #e8e0e8 center/cover no-repeat;
      border: 2px solid #fff;
      box-shadow: 0 2px 6px rgba(0,0,0,0.08);
      flex-shrink: 0;
      margin-left: 23px;
    }
    .cl-tp-info {}
    .cl-tp-name { font-size: 15px; font-weight: 700; color: #1c1c1c; margin-bottom: 1px; }
    .cl-tp-status { display: flex; align-items: center; gap: 5px; font-size: 11px; color: #999; }
    .cl-tp-status-icon { width: 14px; height: 14px; border-radius: 7px; background: #e8e8eb; display: flex; align-items: center; justify-content: center; }
    .cl-tp-status-icon svg { width: 8px; height: 8px; fill: #999; }
    .cl-tp-right {}
    .cl-tp-equalizer { display: flex; align-items: flex-end; gap: 2px; height: 20px; }
    .cl-tp-equalizer span { width: 3px; border-radius: 1.5px; background: #1c1c1c; opacity: 0.6; }

    /* 搜索栏 */
    .cl-search-bar {
      flex-shrink: 0;
      margin: 0 16px 20px;
      height: 40px;
      border-radius: 20px;
      background: #fff;
      display: flex; align-items: center; gap: 8px;
      padding: 0 16px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.03);
    }
    .cl-search-bar svg { width: 18px; height: 18px; fill: none; stroke: #bbb; stroke-width: 2; stroke-linecap: round; }
    .cl-search-bar input {
      flex: 1; background: transparent; border: none; outline: none;
      font-size: 14px; color: #1c1c1c;
    }
    .cl-search-bar input::placeholder { color: #999; letter-spacing: 0.5px; }

    /* Tab 栏 */
    .cl-tab-card {
      flex-shrink: 0;
      margin: 0 16px 40px;
      background: #fff;
      border-radius: 16px;
      padding: 0 6px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.03);
    }
    .cl-tab-row {
      display: flex; align-items: center;
    }
    .cl-tab-item {
      flex: 1; text-align: center;
      padding: 12px 0 10px;
      font-size: 13px; font-weight: 500; color: #999;
      position: relative; cursor: pointer;
      transition: color 0.2s;
    }
    .cl-tab-item.active { color: #1c1c1c; font-weight: 700; }
    .cl-tab-item.active::after {
      content: '';
      position: absolute;
      bottom: 0; left: 50%; transform: translateX(-50%);
      width: 28px; height: 2.5px;
      background: #1c1c1c; border-radius: 2px;
    }
    .cl-tab-notice {
      display: flex; align-items: center; gap: 10px;
      padding: 10px 14px;
      border-top: 1px solid rgba(0,0,0,0.04);
    }
    .cl-tab-notice-badge {
      width: 36px; height: 36px; border-radius: 50%;
      background: #e8e8eb;
      display: flex; align-items: center; justify-content: center;
      font-size: 11px; font-weight: 700; color: #1c1c1c;
    }
    .cl-tab-notice-text { font-size: 13px; color: #999; }

    /* 聊天列表滚动区 */
    .cl-scroll {
      flex: 1; overflow-y: auto;
      padding: 0 16px 16px;
      -webkit-overflow-scrolling: touch;
      min-height: 0;
    }
    .cl-scroll::-webkit-scrollbar { display: none; }

    .cl-chat-card {
      background: #ffffff;
      border-radius: 20px;
      padding: 6px 16px;
      margin-bottom: 8px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.03);
      position: relative;
      overflow: hidden;
    }
    .cl-chat-card::before {
      content: '';
      position: absolute; top: 0; right: 0; bottom: 0; left: 0; pointer-events: none; z-index: 0;
      background: url("data:image/svg+xml,%3Csvg width='160' height='120' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='dots' x='0' y='0' width='8' height='8' patternUnits='userSpaceOnUse'%3E%3Ccircle cx='2' cy='2' r='1.2' fill='%23b4b4b4'/%3E%3C/pattern%3E%3CradialGradient id='fade' cx='1' cy='0' r='1.2'%3E%3Cstop offset='0%25' stop-color='white' stop-opacity='0.4'/%3E%3Cstop offset='80%25' stop-color='white' stop-opacity='0'/%3E%3C/radialGradient%3E%3Cmask id='mask'%3E%3Crect width='160' height='120' fill='url(%23fade)'/%3E%3C/mask%3E%3C/defs%3E%3Crect width='160' height='120' fill='url(%23dots)' mask='url(%23mask)'/%3E%3Cg fill='%23b4b4b4'%3E%3Cpath d='M5,0 L6.1,3.5 L10,3.5 L6.8,5.7 L7.9,9.1 L5,7 L2.1,9.1 L3.2,5.7 L0,3.5 L3.9,3.5 Z' transform='translate(130, 15) rotate(15) scale(1.1)' opacity='0.4'/%3E%3Cpath d='M5,0 L6.1,3.5 L10,3.5 L6.8,5.7 L7.9,9.1 L5,7 L2.1,9.1 L3.2,5.7 L0,3.5 L3.9,3.5 Z' transform='translate(95, 25) rotate(-25) scale(0.7)' opacity='0.3'/%3E%3Cpath d='M5,0 L6.1,3.5 L10,3.5 L6.8,5.7 L7.9,9.1 L5,7 L2.1,9.1 L3.2,5.7 L0,3.5 L3.9,3.5 Z' transform='translate(140, 55) rotate(40) scale(0.8)' opacity='0.25'/%3E%3Cpath d='M5,0 L6.1,3.5 L10,3.5 L6.8,5.7 L7.9,9.1 L5,7 L2.1,9.1 L3.2,5.7 L0,3.5 L3.9,3.5 Z' transform='translate(70, 10) rotate(-10) scale(0.5)' opacity='0.45'/%3E%3Cpath d='M5,0 L6.1,3.5 L10,3.5 L6.8,5.7 L7.9,9.1 L5,7 L2.1,9.1 L3.2,5.7 L0,3.5 L3.9,3.5 Z' transform='translate(110, 75) rotate(5) scale(0.6)' opacity='0.2'/%3E%3C/g%3E%3C/svg%3E") right top / 160px 120px no-repeat;
    }
    .cl-chat-row {
      display: flex; align-items: center; gap: 12px;
      padding: 10px 0;
      cursor: pointer;
      transition: background 0.15s;
      position: relative;
      z-index: 1;
    }
    .cl-chat-row + .cl-chat-row { border-top: none; }
    .cl-chat-row:active { opacity: 0.7; }

    .cl-cr-avatar {
      width: 50px; height: 50px; border-radius: 50%;
      background: #e8e8eb center/cover no-repeat;
      flex-shrink: 0; position: relative;
    }
    .cl-cr-avatar .cl-v-badge {
      position: absolute; bottom: -1px; right: -1px;
      width: 16px; height: 16px; border-radius: 50%;
      background: #2481cc; border: 2px solid #fff;
      display: flex; align-items: center; justify-content: center;
    }
    .cl-cr-avatar .cl-v-badge::after { content: 'V'; font-size: 8px; font-weight: 700; color: #fff; }

    .cl-cr-mid { flex: 1; min-width: 0; }
    .cl-cr-name {
      font-size: 14px; font-weight: 700; color: #1c1c1c;
      margin-top: -8px;
      margin-bottom: 3px;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .cl-cr-msg {
      font-size: 12px; color: #999;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      line-height: 1.4;
    }
    .cl-cr-msg .cl-red { color: #c84545; font-weight: 500; }

    .cl-cr-right { flex-shrink: 0; text-align: right; align-self: flex-start; margin-top: 0px; }
    .cl-cr-date { font-size: 11px; color: #bbb; }

    /* 水印 */
    .cl-watermark {
      padding: 20px 0;
      text-align: right;
      padding-right: 20px;
      font-size: 12px;
      color: rgba(0,0,0,0.08);
      font-style: italic;
      letter-spacing: 1px;
    }

    /* 底部 TabBar */
    .cl-bottom-tabbar {
      flex-shrink: 0;
      display: flex;
      background: #fff;
      border-top: 1px solid rgba(0,0,0,0.06);
      padding: 6px 0 22px;
    }
    .cl-bt-tab {
      flex: 1;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      gap: 3px; padding: 6px 0 0;
      position: relative; cursor: pointer;
    }
    .cl-bt-tab svg { width: 24px; height: 24px; fill: none; stroke: #999; stroke-width: 1.6; stroke-linecap: round; stroke-linejoin: round; transition: stroke 0.2s; }
    .cl-bt-tab span { font-size: 10px; color: #999; font-weight: 500; transition: color 0.2s; }
    .cl-bt-tab.active svg { stroke: #1c1c1c; }
    .cl-bt-tab.active span { color: #1c1c1c; font-weight: 600; }
    .cl-bt-tab .cl-bt-indicator {
      position: absolute; top: 6px; left: 50%; transform: translateX(8px);
      width: 7px; height: 7px; border-radius: 50%;
      background: #2481cc;
    }
    .cl-bt-tab .cl-bt-line {
      position: absolute; top: 0; left: 50%; transform: translateX(-50%);
      width: 16px; height: 2.5px; border-radius: 2px;
      background: #1c1c1c;
    }

    /* ===== 底栏样式 B（胶囊图标） ===== */
    .cl-tabbar-b {
      flex-shrink: 0;
      padding: 6px 36px 20px;
    }
    .cl-tabbar-b .cl-tb-inner {
      display: flex; align-items: center; justify-content: space-around;
      background: rgba(235,235,237,0.92);
      backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255,255,255,0.6);
      border-radius: 26px;
      padding: 12px 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    }
    .cl-tabbar-b .cl-tb2-tab {
      width: 34px; height: 34px;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; position: relative; border-radius: 50%;
    }
    .cl-tabbar-b .cl-tb2-tab svg { width: 20px; height: 20px; fill: none; stroke: #aaa; stroke-width: 1.6; stroke-linecap: round; stroke-linejoin: round; transition: stroke 0.2s; }
    .cl-tabbar-b .cl-tb2-tab.active svg { stroke: #1c1c1c; }
    .cl-tabbar-b .cl-tb2-tab .cl-tb2-dot { position: absolute; top: 2px; right: 2px; width: 5px; height: 5px; border-radius: 50%; background: #888; }
    .cl-bottom-tabbar, .cl-tabbar-b { position: relative; z-index: 215; }
    .cl-bottom-tabbar.hidden, .cl-tabbar-b.hidden { display: none; }

    /* ===== Me 页面 ===== */
    .cl-me-page {
      position: absolute; top: 0; left: 0; right: 0; bottom: 0;
      z-index: 205;
      background: #F6F6F6;
      display: flex; flex-direction: column;
      opacity: 0; pointer-events: none;
      transition: opacity 0.25s ease;
      overflow: hidden;
      padding-bottom: 80px;
    }
    .cl-me-page.open { opacity: 1; pointer-events: auto; }

    .cl-me-scroll {
      flex: 1; overflow-y: auto; padding: 14px 18px 10px;
      -webkit-overflow-scrolling: touch;
    }
    .cl-me-scroll::-webkit-scrollbar { display: none; }

    .cl-me-title {
      font-size: 26px; font-weight: 800; color: #1c1c1c;
      margin-bottom: 14px; letter-spacing: -0.5px;
      display: flex; align-items: baseline; gap: 5px;
      margin-top: 80px;
    }
    .cl-me-title .cl-me-en { font-family: Georgia, serif; font-weight: 900; color: #999; margin-left: 9px; }
    .cl-me-title .cl-me-dot { color: #999; font-weight: 400; }
    .cl-me-title .cl-me-cn { font-size: 22px; font-weight: 700; }

    .cl-me-card {
      background: #ffffff;
      border-radius: 16px;
      padding: 12px 14px 10px;
      margin-bottom: 10px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    }
    .cl-me-uc-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
    .cl-me-uc-left { display: flex; align-items: center; gap: 9px; }
    .cl-me-uc-avatar { width: 32px; height: 32px; border-radius: 50%; background: #1c1c1c; display: flex; align-items: center; justify-content: center; }
    .cl-me-uc-avatar svg { width: 16px; height: 16px; fill: #fff; }
    .cl-me-uc-name { font-size: 13px; font-weight: 700; color: #1c1c1c; text-transform: uppercase; letter-spacing: 0.5px; }
    .cl-me-uc-handle { font-size: 10px; color: #999; margin-top: 1px; }
    .cl-me-uc-date { font-size: 10px; color: #bbb; text-align: right; line-height: 1.4; }

    .cl-me-uc-post { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-top: 1px solid rgba(0,0,0,0.05); border-bottom: 1px solid rgba(0,0,0,0.05); }
    .cl-me-uc-post-img { width: 64px; height: 64px; border-radius: 50%; background: #ddd center/cover no-repeat; flex-shrink: 0; margin-left: 29px; }
    .cl-me-uc-post-text { flex: 1; font-family: Georgia, serif; font-size: 13px; font-weight: 500; color: #1c1c1c; line-height: 1.55; font-style: italic; }

    .cl-me-uc-footer { display: flex; align-items: center; justify-content: space-between; padding-top: 8px; }
    .cl-me-uc-footer-l { display: flex; align-items: center; gap: 4px; font-size: 10px; color: #ccc; }
    .cl-me-uc-footer-l svg { width: 12px; height: 12px; fill: none; stroke: #ccc; stroke-width: 1.5; }
    .cl-me-uc-footer-r { display: flex; align-items: center; gap: 10px; }
    .cl-me-uc-footer-r svg { width: 14px; height: 14px; fill: none; stroke: #ccc; stroke-width: 1.5; stroke-linecap: round; stroke-linejoin: round; }
    .cl-me-ft-time { font-size: 10px; color: #ccc; display: flex; align-items: center; gap: 3px; }
    .cl-me-ft-time svg { width: 11px; height: 11px; }
    .cl-me-ft-more svg { width: 12px; height: 12px; fill: #ccc; stroke: none; }

    .cl-me-menu {
      background: rgba(255,255,255,0.75);
      border-radius: 14px;
      margin-bottom: 8px;
      border: 1px solid rgba(255,255,255,0.9);
      box-shadow: 0 1px 3px rgba(0,0,0,0.03);
      overflow: hidden;
    }
    .cl-me-menu-row {
      display: flex; align-items: center; gap: 12px;
      padding: 13px 14px; cursor: pointer;
      transition: background 0.15s;
    }
    .cl-me-menu-row:active { background: rgba(0,0,0,0.02); }
    .cl-me-menu-row + .cl-me-menu-row { border-top: 1px solid rgba(0,0,0,0.04); }
    .cl-me-menu-icon { width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .cl-me-menu-icon svg { width: 18px; height: 18px; fill: none; stroke: #888; stroke-width: 1.5; stroke-linecap: round; stroke-linejoin: round; }
    .cl-me-menu-label { flex: 1; font-size: 14px; font-weight: 500; color: #444; letter-spacing: 0.2px; }
    .cl-me-menu-arrow { width: 14px; height: 14px; flex-shrink: 0; }
    .cl-me-menu-arrow svg { width: 100%; height: 100%; fill: none; stroke: #ccc; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }

    /* ===== Me Settings 子页 ===== */
    .cl-me-settings {
      position: absolute; inset: 0; z-index: 220;
      background: #F6F6F6;
      display: flex; flex-direction: column;
      transform: translateX(100%);
      transition: transform 0.35s cubic-bezier(0.25,0.46,0.45,0.94);
      overflow: hidden;
    }
    .cl-me-settings.open { transform: translateX(0); }
    .cl-ms-topbar {
      flex-shrink: 0; padding: 60px 20px 14px;
      display: flex; align-items: center; gap: 12px;
    }
    .cl-ms-back {
      width: 32px; height: 32px; border-radius: 50%;
      background: #fff; display: flex; align-items: center; justify-content: center;
      cursor: pointer; box-shadow: 0 1px 4px rgba(0,0,0,0.06);
    }
    .cl-ms-back svg { width: 14px; height: 14px; fill: #1c1c1c; }
    .cl-ms-title { font-size: 18px; font-weight: 700; color: #1c1c1c; }
    .cl-ms-scroll { flex: 1; overflow-y: auto; padding: 14px 18px; -webkit-overflow-scrolling: touch; }
    .cl-ms-scroll::-webkit-scrollbar { display: none; }
    .cl-ms-sec { font-size: 11px; font-weight: 600; color: #999; letter-spacing: 1.5px; text-transform: uppercase; padding: 8px 4px 10px; font-family: 'Courier New', monospace; }
    .cl-ms-card { background: #fff; border-radius: 14px; margin-bottom: 10px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
    .cl-ms-row { display: flex; align-items: center; gap: 12px; padding: 14px 14px; cursor: pointer; }
    .cl-ms-row + .cl-ms-row { border-top: 1px solid rgba(0,0,0,0.04); }
    .cl-ms-row-text { flex: 1; }
    .cl-ms-row-t1 { font-size: 13px; font-weight: 600; color: #1c1c1c; }
    .cl-ms-row-t2 { font-size: 10px; color: #999; margin-top: 2px; }

    .cl-ms-bar-options { display: flex; gap: 10px; padding: 4px 14px 14px; }
    .cl-ms-bar-opt {
      flex: 1; padding: 12px 10px; border-radius: 12px;
      background: rgba(0,0,0,0.03); border: 2px solid transparent;
      display: flex; flex-direction: column; align-items: center; gap: 6px;
      cursor: pointer; transition: border-color 0.2s, background 0.2s;
    }
    .cl-ms-bar-opt.active { border-color: #1c1c1c; background: rgba(28,28,28,0.06); }
    .cl-ms-bar-prev {
      width: 100%; height: 32px; border-radius: 8px;
      background: #f0f0f0; display: flex; align-items: center; justify-content: center;
    }
    .cl-ms-bar-prev.prev-a { gap: 8px; }
    .cl-ms-bar-prev.prev-a span { display: flex; flex-direction: column; align-items: center; gap: 1px; }
    .cl-ms-bar-prev.prev-a span i { width: 10px; height: 10px; border-radius: 50%; background: #ccc; display: block; }
    .cl-ms-bar-prev.prev-a span em { font-size: 5px; color: #999; font-style: normal; }
    .cl-ms-bar-prev.prev-b { border-radius: 14px; background: #e8e8ea; gap: 10px; }
    .cl-ms-bar-prev.prev-b i { width: 12px; height: 12px; border-radius: 50%; background: #bbb; }
    .cl-ms-bar-label { font-size: 10px; font-weight: 600; color: #666; }

    /* ===== 聊天室页面 ===== */
    .cl-chatroom {
      position: absolute; inset: 0; z-index: 230;
      display: flex; flex-direction: column;
      opacity: 0; pointer-events: none;
      transition: opacity 0.25s ease;
      overflow: hidden;
    }
    .cl-chatroom.open { opacity: 1; pointer-events: auto; }
    .cl-chatroom-bg {
      position: absolute; inset: 0; z-index: 0;
      background: url("https://i.postimg.cc/PqRq8tgX/Image-1771554130740-93.png") center/cover no-repeat;
    }
    .cl-chatroom-topbar {
      position: absolute; top: 0; left: 0; right: 0; z-index: 50;
      padding: 54px 16px 48px;
      display: flex; align-items: center; justify-content: space-between;
      background: transparent;
    }
    .cl-chatroom-topbar::before {
      content: '';
      position: absolute; inset: 0;
      background: rgba(6,8,14,0.22);
      backdrop-filter: blur(18px) saturate(1.05) brightness(0.75);
      -webkit-backdrop-filter: blur(18px) saturate(1.05) brightness(0.75);
      -webkit-mask-image: linear-gradient(to bottom, #000 0%, rgba(0,0,0,0.85) 30%, rgba(0,0,0,0.65) 50%, rgba(0,0,0,0.45) 68%, rgba(0,0,0,0.25) 82%, rgba(0,0,0,0.08) 94%, transparent 100%);
      mask-image: linear-gradient(to bottom, #000 0%, rgba(0,0,0,0.85) 30%, rgba(0,0,0,0.65) 50%, rgba(0,0,0,0.45) 68%, rgba(0,0,0,0.25) 82%, rgba(0,0,0,0.08) 94%, transparent 100%);
      pointer-events: none;
    }
    .cl-cr-btn {
      width: 38px; height: 38px; border-radius: 50%;
      background: rgba(255,255,255,0.13);
      backdrop-filter: blur(20px) saturate(1.4);
      -webkit-backdrop-filter: blur(20px) saturate(1.4);
      border: 1px solid rgba(255,255,255,0.3);
      box-shadow: inset 0 1px 1px rgba(255,255,255,0.3), inset 0 -0.5px 1px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.15);
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; flex-shrink: 0;
      position: relative; z-index: 2;
    }
    .cl-cr-btn::before {
      content: '';
      position: absolute; inset: 0; border-radius: inherit;
      background: linear-gradient(165deg, rgba(255,255,255,0.25) 0%, transparent 45%);
      pointer-events: none;
    }
    .cl-cr-btn svg { width: 15px; height: 15px; fill: none; stroke: #fff; stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round; position: relative; z-index: 1; }
    .cl-cr-center { display: flex; flex-direction: column; align-items: center; gap: 2px; position: relative; z-index: 2; }
    .cl-chatroom .cl-cr-center .cl-cr-room-name { font-size: 15px; font-weight: 600; color: #fff; text-shadow: 0 1px 3px rgba(0,0,0,0.3); }
    .cl-cr-sub { font-size: 10px; color: rgba(255,255,255,0.45); }

    .cl-chatroom-messages {
      position: relative; z-index: 10;
      flex: 1;
      overflow-y: auto;
      padding: 140px 14px 100px;
      display: flex; flex-direction: column;
      gap: 3px;
      -webkit-overflow-scrolling: touch;
    }
    .cl-chatroom-messages::-webkit-scrollbar { display: none; }

    .cl-msg-row { display: flex; align-items: flex-start; gap: 8px; max-width: 78%; margin-top: 12px; }
    .cl-msg-row.left { align-self: flex-start; }
    .cl-msg-row.right { align-self: flex-end; flex-direction: row-reverse; }

    .cl-msg-avatar {
      width: 37px; height: 37px; border-radius: 11px;
      background: rgba(200,200,200,0.9) center/cover no-repeat;
      border: 1.5px solid #fff;
      box-shadow: 0 0 0 1.5px rgba(0,0,0,0.7);
      flex-shrink: 0;
      position: relative;
    }
    .cl-msg-avatar-check {
      position: absolute; bottom: -2px; right: -2px;
      width: 14px; height: 14px; border-radius: 50%;
      background: #1c1c1c;
      border: 1.5px solid #fff;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 1px 3px rgba(0,0,0,0.25);
    }
    .cl-msg-avatar-check svg { width: 8px; height: 8px; fill: none; stroke: #fff; stroke-width: 3; stroke-linecap: round; stroke-linejoin: round; }

    .cl-msg-bubble {
      padding: 7px 12px;
      border-radius: 18px;
      font-size: 11px;
      line-height: 1.45;
      word-break: break-word;
      position: relative;
    }
    .cl-msg-row{margin-top:11px!important}
    .cl-msg-row.left{max-width:78%!important}
    .cl-msg-row.right{max-width:78%!important}
    .cl-msg-avatar{width:34px!important;height:34px!important;border-radius:13px!important}
    .cl-msg-bubble{font-size:12px!important;line-height:1.2!important;letter-spacing:0em!important}
    .cl-msg-row.left .cl-msg-bubble{padding:8px 16px!important;border-radius:3px 10.8px 12.8px 12px!important;background:rgba(255,255,255,0.57)!important;color:#616161!important;border:1.5px solid rgba(255,255,255,1)!important;box-shadow:1px 3px 3px -1px rgba(0,0,0,0.06),inset 0 0 3px 0 rgba(0,0,0,0.03)!important}
    .cl-msg-row.right .cl-msg-bubble{padding:8px 16px!important;border-radius:12.8px 3px 12px 12.8px!important;background:rgba(175,175,175,0.46)!important;color:#666666!important;border:1.3px solid rgba(255,255,255,1)!important;box-shadow:0px 1px 3px 0px rgba(0,0,0,0.08)!important}
    .cl-msg-row:nth-child(11n+1).right .cl-msg-bubble{background:rgba(135,135,135,0.46)!important}
    .cl-msg-row:nth-child(11n+2).right .cl-msg-bubble{background:rgba(215,215,215,0.46)!important}
    .cl-msg-row:nth-child(11n+3).right .cl-msg-bubble{background:rgba(120,120,120,0.46)!important}
    .cl-msg-row:nth-child(11n+4).right .cl-msg-bubble{background:rgba(190,190,190,0.46)!important}
    .cl-msg-row:nth-child(11n+5).right .cl-msg-bubble{background:rgba(175,175,175,0.46)!important}
    .cl-msg-row:nth-child(11n+6).right .cl-msg-bubble{background:rgba(120,120,120,0.46)!important}
    .cl-msg-row:nth-child(11n+7).right .cl-msg-bubble{background:rgba(215,215,215,0.46)!important}
    .cl-msg-row:nth-child(11n+8).right .cl-msg-bubble{background:rgba(135,135,135,0.46)!important}
    .cl-msg-row:nth-child(11n+9).right .cl-msg-bubble{background:rgba(190,190,190,0.46)!important}
    .cl-msg-row:nth-child(11n+10).right .cl-msg-bubble{background:rgba(175,175,175,0.46)!important}
    .cl-msg-row:nth-child(11n+11).right .cl-msg-bubble{background:rgba(120,120,120,0.46)!important}
    .cl-msg-row.left .cl-msg-bubble::after{display:none!important}
    .cl-msg-row.right .cl-msg-bubble::after{display:none!important}
    .cl-msg-row.left .cl-msg-bubble::after {
      content: '';
      position: absolute;
      bottom: 4px;
      left: -5px;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #1c1c1c;
    }
    .cl-msg-row.right .cl-msg-bubble::after {
      content: '';
      position: absolute;
      bottom: 4px;
      right: -5px;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #1c1c1c;
    }
    .cl-msg-row.left .cl-msg-bubble::before,
    .cl-msg-row.right .cl-msg-bubble::before { display: none; }
    /* 尾巴开关 */
    .tail-off .cl-msg-row .cl-msg-bubble::after { display: none !important; }
    /* 堆叠模式 */
    .stack-on .cl-msg-row:not(.msg-last) .cl-msg-bubble::after { display: none !important; }
    .stack-on .cl-msg-row:not(.msg-last) .cl-msg-time { display: none; }
    .stack-on .cl-msg-row:not(.msg-first) .cl-msg-avatar { visibility: hidden; }
    .stack-on .cl-msg-row:not(.msg-first) { margin-top: 2px !important; }
    .cl-msg-row.left .cl-msg-time { margin-top: 5px !important; }
    .stack-on .cl-msg-time { margin-top: 3px !important; }
    .stack-on .cl-msg-row.left .cl-msg-time { margin-top: 4px !important; }
    .tail-off .cl-msg-time { margin-top: 4px !important; }
    .tail-off .cl-msg-row.left .cl-msg-time { margin-top: 4px !important; }
    /* 时间隐藏 */
    .time-off .cl-msg-time { opacity: 0; pointer-events: none; }
    .cl-msg-time {
      font-size: 9.5px;
      color: rgba(0,0,0,0.5);
      margin-top: 5px;
      display: flex; align-items: center; gap: 3px;
    }
    .cl-msg-row.right .cl-msg-time { color: rgba(0,0,0,0.5); justify-content: flex-end; margin-left: 8px; }
    .cl-msg-time svg { width: 10px; height: 10px; fill: none; stroke: currentColor; stroke-width: 2; }
    .cl-msg-sticker { width: 100px; height: 100px; display: flex; align-items: center; justify-content: center; font-size: 60px; }

    /* 聊天室底栏 样式③ */
    .cl-chatroom-bar {
      position: absolute; bottom: 24px; left: 14px; right: 14px; z-index: 50;
      display: flex; align-items: center; gap: 8px;
    }
    .cl-crb-plus {
      width: 38px; height: 38px; border-radius: 50%;
      background: rgba(255,255,255,0.15);
      backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(255,255,255,0.3);
      box-shadow: inset 0 1px 1px rgba(255,255,255,0.3);
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; cursor: pointer;
    }
    .cl-crb-plus svg { width: 18px; height: 18px; fill: none; stroke: #fff; stroke-width: 2; stroke-linecap: round; }
    .cl-crb-mid {
      flex: 1; height: 40px; border-radius: 20px;
      background: rgba(255,255,255,0.88);
      border: 1px solid rgba(255,255,255,0.95);
      box-shadow: 0 4px 14px rgba(0,0,0,0.08), inset 0 1px 0 #fff;
      display: flex; align-items: center;
      padding: 0 6px 0 14px;
      gap: 8px;
    }
    .cl-crb-mid span { flex: 1; font-size: 14px; color: #999; }
    .cl-crb-wand {
      width: 30px; height: 30px; border-radius: 50%;
      background: rgba(0,0,0,0.05);
      display: flex; align-items: center; justify-content: center;
      cursor: pointer;
    }
    .cl-crb-wand svg { width: 15px; height: 15px; fill: none; stroke: #666; stroke-width: 1.6; stroke-linecap: round; stroke-linejoin: round; }
    .cl-crb-send {
      width: 38px; height: 38px; border-radius: 50%;
      background: #1c1c1c;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; cursor: pointer;
      box-shadow: 0 3px 10px rgba(0,0,0,0.25);
    }
    .cl-crb-send svg { width: 14px; height: 14px; fill: none; stroke: #fff; stroke-width: 2.5; stroke-linecap: round; stroke-linejoin: round; }

    /* 旁白样式 */
    .cl-narration {
      font-size: 0.85em;
      font-style: italic;
      color: #b0b0b0;
      font-weight: 400;
    }
    .cl-narration-center {
      max-width: 70%;
      padding: 2px 0;
      font-size: 11px;
      line-height: 1.5;
    }
  `;

  function injectCSS() {
    if (document.getElementById('chatListStyles')) return;
    const style = document.createElement('style');
    style.id = 'chatListStyles';
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  function buildHTML() {
    return `
      <div class="chat-list-panel" id="chatListPanel">
        <div class="cl-island"></div>

        <div class="cl-statusbar">
          <div class="cl-sb-left">
            <span class="cl-sb-time" id="clStatusTime">9:26</span>
            <svg class="cl-sb-headphone" viewBox="0 0 24 24" fill="none" stroke="#1c1c1c" stroke-width="2" stroke-linecap="round"><path d="M3 18v-6a9 9 0 0118 0v6"/><path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z"/></svg>
          </div>
          <div class="cl-sb-right">
            <div class="cl-sb-dots"><span></span><span></span><span></span><span></span></div>
            <span class="cl-sb-4g">4G</span>
            <div class="cl-sb-battery">
              <span class="cl-sb-battery-pct">32</span>
              <div class="cl-sb-battery-body"></div>
              <div class="cl-sb-battery-tip"></div>
            </div>
          </div>
        </div>

        <div class="cl-top-profile">
          <div class="cl-tp-left">
            <div class="cl-tp-avatar"></div>
            <div class="cl-tp-info">
              <div class="cl-tp-name">Pikoale.</div>
              <div class="cl-tp-status">
                <span class="cl-tp-status-icon"><svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg></span>
                <span>刚刚来过</span>
              </div>
            </div>
          </div>
          <div class="cl-tp-right">
            <div class="cl-tp-equalizer">
              <span style="height:6px"></span>
              <span style="height:14px"></span>
              <span style="height:10px"></span>
              <span style="height:18px"></span>
              <span style="height:8px"></span>
            </div>
          </div>
        </div>

        <div class="cl-search-bar">
          <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.5-4.5"/></svg>
          <input type="text" placeholder="☆오늘 밤엔 별을 꿈꿀까♪♫">
        </div>

        <div class="cl-tab-card">
          <div class="cl-tab-row">
            <div class="cl-tab-item active">미리 보기</div>
            <div class="cl-tab-item">미화</div>
            <div class="cl-tab-item">친구</div>
            <div class="cl-tab-item">단체 채팅</div>
            <div class="cl-tab-item">서비스</div>
          </div>
          <div class="cl-tab-notice">
            <div class="cl-tab-notice-badge">
              <svg viewBox="0 0 24 24" style="width:16px; height:16px; fill:#1c1c1c;">
                <circle cx="3.5" cy="11" r="2.6"/>
                <circle cx="8.5" cy="5.5" r="2.6"/>
                <circle cx="15.5" cy="5.5" r="2.6"/>
                <circle cx="20.5" cy="11" r="2.6"/>
                <path transform="rotate(180 12 15)" d="M18.8 12.3c-.6-1.2-2.1-1.8-3.4-1.2L12 12.6l-3.4-1.5c-1.3-.6-2.8 0-3.4 1.2-.6 1.3-.1 2.9 1 3.7 1.4 1 3.3 2.5 5.8 2.5s4.4-1.5 5.8-2.5c1.1-.8 1.6-2.4 1-3.7z"/>
              </svg>
            </div>
            <div class="cl-tab-notice-text" id="clTabNoticeText" contenteditable="true" spellcheck="false" style="outline:none;">∪ㅅ∪✩°｡</div>
          </div>
        </div>

        <div class="cl-scroll">
          <div class="cl-chat-card" id="clChatList">
          </div>

          <div class="cl-watermark">// XiinYuyu.</div>
        </div>

        <div class="cl-bottom-tabbar" id="clTabbarA">
          <div class="cl-bt-tab active" data-tab="chat">
            <span class="cl-bt-line"></span>
            <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
            <span>微信</span>
          </div>
          <div class="cl-bt-tab" data-tab="contacts">
            <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
            <span>通讯录</span>
          </div>
          <div class="cl-bt-tab" data-tab="discover">
            <span class="cl-bt-indicator"></span>
            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18"/></svg>
            <span>发现</span>
          </div>
          <div class="cl-bt-tab" data-tab="me">
            <svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.5 3.5-7 8-7s8 2.5 8 7"/></svg>
            <span>我</span>
          </div>
        </div>

        <div class="cl-tabbar-b hidden" id="clTabbarB">
          <div class="cl-tb-inner">
            <div class="cl-tb2-tab active" data-tab="chat">
              <svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 9h4M7 13h10"/></svg>
            </div>
            <div class="cl-tb2-tab" data-tab="contacts">
              <svg viewBox="0 0 24 24"><rect x="6" y="3" width="12" height="18" rx="2"/><path d="M9 18h6"/></svg>
            </div>
            <div class="cl-tb2-tab" data-tab="discover">
              <span class="cl-tb2-dot"></span>
              <svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>
            </div>
            <div class="cl-tb2-tab" data-tab="me">
              <svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.5 3.5-7 8-7s8 2.5 8 7"/></svg>
            </div>
          </div>
        </div>

        <!-- Me 页面 -->
        <div class="cl-me-page" id="clMePage">
          <div class="cl-me-scroll">
            <div class="cl-me-title">
              <span class="cl-me-en">icity</span>
              <span class="cl-me-dot">·</span>
              <span class="cl-me-cn">我的日记</span>
            </div>
            <div class="cl-me-card">
              <div class="cl-me-uc-header">
                <div class="cl-me-uc-left">
                  <div class="cl-me-uc-avatar"><svg viewBox="0 0 24 24"><path d="M12 21c-1.5 0-3-1.2-3-3 0-1.5 1.2-3.5 3-5 1.8 1.5 3 3.5 3 5 0 1.8-1.5 3-3 3zM7.5 14c-1.2 0-2.2-1.3-2.2-2.8S6.3 8.5 7.5 8.5s2.2 1.2 2.2 2.7S8.7 14 7.5 14zM16.5 14c-1.2 0-2.2-1.3-2.2-2.8s1-2.7 2.2-2.7 2.2 1.2 2.2 2.7-1 2.8-2.2 2.8z"/></svg></div>
                  <div><div class="cl-me-uc-name">OWOZZZ</div><div class="cl-me-uc-handle">@mizukiz117</div></div>
                </div>
                <div class="cl-me-uc-date">6月21日 · 星期六<br>2025</div>
              </div>
              <div class="cl-me-uc-post">
                <div class="cl-me-uc-post-img"></div>
                <div class="cl-me-uc-post-text">Some say love it is a river,<br>That drowns the tender reed.</div>
              </div>
              <div class="cl-me-uc-footer">
                <div class="cl-me-uc-footer-l"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg><span>2025-06-17</span></div>
                <div class="cl-me-uc-footer-r">
                  <svg viewBox="0 0 24 24"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/></svg>
                  <svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z"/></svg>
                  <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                  <div class="cl-me-ft-time"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg><span>18:06</span></div>
                  <div class="cl-me-ft-more"><svg viewBox="0 0 24 24"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg></div>
                </div>
              </div>
            </div>
            <div class="cl-me-menu"><div class="cl-me-menu-row"><div class="cl-me-menu-icon"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M15 9.5c0 1.5-1.5 3-3 3M9 14.5c0-1.5 1.5-3 3-3"/></svg></div><div class="cl-me-menu-label">Pay and Services</div><div class="cl-me-menu-arrow"><svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg></div></div></div>
            <div class="cl-me-menu">
              <div class="cl-me-menu-row"><div class="cl-me-menu-icon"><svg viewBox="0 0 24 24"><rect x="6" y="3" width="12" height="18" rx="2"/><path d="M9 18h6"/></svg></div><div class="cl-me-menu-label">Favorites</div><div class="cl-me-menu-arrow"><svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg></div></div>
              <div id="clMomentsWrapper" style="border-top:1px solid rgba(0,0,0,0.04);">
                <div class="cl-me-menu-row" id="clMomentsToggle" style="border-top:none;">
                  <div class="cl-me-menu-icon"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="12" cy="10" r="3"/><path d="M6 21v-1a6 6 0 0112 0v1"/></svg></div>
                  <div class="cl-me-menu-label">Moments</div>
                  <div class="cl-me-menu-arrow" id="clMomentsArrow"><svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg></div>
                </div>
                <div id="clMomentsExpand" style="max-height:0;overflow:hidden;transition:max-height 0.5s cubic-bezier(0.16,1,0.3,1);"></div>
              </div>
              <div class="cl-me-menu-row"><div class="cl-me-menu-icon"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg></div><div class="cl-me-menu-label">Mizuki</div><div class="cl-me-menu-arrow"><svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg></div></div>
            </div>
            <div class="cl-me-menu"><div class="cl-me-menu-row" id="clMeSettingsBtn"><div class="cl-me-menu-icon"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg></div><div class="cl-me-menu-label">Settings</div><div class="cl-me-menu-arrow"><svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg></div></div></div>
          </div>

          <!-- Me Settings 子页 -->
          <div class="cl-me-settings" id="clMeSettings">
            <div class="cl-ms-topbar">
              <div class="cl-ms-back" id="clMsBack"><svg viewBox="0 0 24 24"><path d="M14.7 5.3a1 1 0 010 1.4L9.4 12l5.3 5.3a1 1 0 11-1.4 1.4l-6-6a1 1 0 010-1.4l6-6a1 1 0 011.4 0z"/></svg></div>
              <div class="cl-ms-title">Settings</div>
            </div>
            <div class="cl-ms-scroll">
              <div class="cl-ms-sec">⋆ Tab Bar Style ⋆</div>
              <div class="cl-ms-card">
                <div class="cl-ms-row"><div class="cl-ms-row-text"><div class="cl-ms-row-t1">底栏样式</div><div class="cl-ms-row-t2">选择全局底栏外观</div></div></div>
              </div>
              <div class="cl-ms-bar-options" id="clMsBarOptions">
                <div class="cl-ms-bar-opt active" data-bar="a">
                  <div class="cl-ms-bar-prev prev-a"><span><i></i><em>微信</em></span><span><i></i><em>通讯</em></span><span><i></i><em>发现</em></span><span><i></i><em>我</em></span></div>
                  <div class="cl-ms-bar-label">经典标签</div>
                </div>
                <div class="cl-ms-bar-opt" data-bar="b">
                  <div class="cl-ms-bar-prev prev-b"><i></i><i></i><i></i><i></i></div>
                  <div class="cl-ms-bar-label">胶囊图标</div>
                </div>
              </div>
              <div class="cl-ms-sec">⋆ Account ⋆</div>
              <div class="cl-ms-card">
                <div class="cl-ms-row"><div class="cl-ms-row-text"><div class="cl-ms-row-t1">隐私</div><div class="cl-ms-row-t2">Privacy settings</div></div></div>
                <div class="cl-ms-row"><div class="cl-ms-row-text"><div class="cl-ms-row-t1">通知</div><div class="cl-ms-row-t2">Notifications</div></div></div>
                <div class="cl-ms-row"><div class="cl-ms-row-text"><div class="cl-ms-row-t1">存储</div><div class="cl-ms-row-t2">Storage & Data</div></div></div>
              </div>
              <div class="cl-ms-sec">⋆ About ⋆</div>
              <div class="cl-ms-card">
                <div class="cl-ms-row"><div class="cl-ms-row-text"><div class="cl-ms-row-t1">关于</div><div class="cl-ms-row-t2">Version 1.0.3</div></div></div>
                <div class="cl-ms-row"><div class="cl-ms-row-text"><div class="cl-ms-row-t1">清除缓存</div><div class="cl-ms-row-t2">Clear cache</div></div></div>
              </div>
            </div>
          </div>
        </div>

        <!-- 聊天室页面 -->
        <div class="cl-chatroom" id="clChatroom">
          <div class="cl-chatroom-bg"></div>
          <div class="cl-chatroom-topbar">
            <div class="cl-cr-btn" id="clChatroomBack"><svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg></div>
            <div class="cl-cr-center">
              <div class="cl-cr-room-name">층ㅇ...🤍 (2)</div>
              <div class="cl-cr-sub">Online</div>
            </div>
            <div class="cl-cr-btn"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.5-4.5"/></svg></div>
          </div>
          <div class="cl-chatroom-messages">
          </div>
          <div class="cl-chatroom-bar">
            <div class="cl-crb-plus"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg></div>
            <div class="cl-crb-mid">
              <span class="cl-crb-placeholder">iMessage…</span>
              <div class="cl-crb-wand"><svg viewBox="0 0 24 24"><path d="M3 21L13.5 10.5M13.5 10.5l3-3 4 4-3 3"/><path d="M15 2l1 2 2 1-2 1-1 2-1-2-2-1 2-1z"/><path d="M6 5l.7 1.3L8 7l-1.3.7L6 9l-.7-1.3L4 7l1.3-.7z"/><path d="M19 14l.5 1 1 .5-1 .5-.5 1-.5-1-1-.5 1-.5z"/></svg></div>
            </div>
            <div class="cl-crb-send"><svg viewBox="0 0 24 24"><path d="M12 19V5M5 12l7-7 7 7"/></svg></div>
          </div>
        </div>

      </div>
    `;
  }

  function open(triggerItem) {
    if (!panel) return;
    panel.classList.remove('closing');
    if (triggerItem) {
      const icon = triggerItem.querySelector('.app-icon');
      if (icon) {
        icon.classList.add('cl-flying');
        setTimeout(() => { icon.classList.remove('cl-flying'); }, 700);
      }
    }
    panel.classList.add('open');
  }

  function close() {
    if (!panel) return;
    panel.classList.remove('open');
    panel.classList.add('closing');
    setTimeout(() => { if (panel) panel.classList.remove('closing'); }, 320);
  }

  function updateTime() {
    const el = document.getElementById('clStatusTime');
    if (!el) return;
    const now = new Date();
    el.textContent = `${now.getHours()}:${now.getMinutes().toString().padStart(2,'0')}`;
  }

  function init() {
    injectCSS();
    const screen = document.querySelector('.phone-screen');
    if (!screen) return;
    screen.insertAdjacentHTML('beforeend', buildHTML());
    panel = document.getElementById('chatListPanel');

    // 返回 - 点击顶部头像区域返回
    panel.querySelector('.cl-tp-avatar').addEventListener('click', (e) => {
      e.stopPropagation();
      close();
    });

    // Tab 切换
    panel.querySelectorAll('.cl-tab-item').forEach(t => {
      t.addEventListener('click', (e) => {
        e.stopPropagation();
        panel.querySelectorAll('.cl-tab-item').forEach(x => x.classList.remove('active'));
        t.classList.add('active');
      });
    });

    // 底部 tab 切换
    panel.querySelectorAll('.cl-bt-tab').forEach(t => {
      t.addEventListener('click', (e) => {
        e.stopPropagation();
        panel.querySelectorAll('.cl-bt-tab').forEach(x => x.classList.remove('active'));
        t.classList.add('active');
      });
    });

    updateTime();
    setInterval(updateTime, 1000);

    // App 入口绑定
    const ENTRY_LABELS = ['Messages', 'QQ', '微信', '消息', 'Chat'];
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

    // ===== 可编辑通知文案持久化 =====
    const noticeTextEl = document.getElementById('clTabNoticeText');
    if (noticeTextEl) {
      const savedNotice = localStorage.getItem('cl_notice_text');
      if (savedNotice) noticeTextEl.textContent = savedNotice;
      
      noticeTextEl.addEventListener('blur', () => {
        localStorage.setItem('cl_notice_text', noticeTextEl.textContent);
      });
      noticeTextEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          noticeTextEl.blur();
        }
      });
    }

    // ===== 底栏 Tab 切换（聊天/Me 页面切换）=====
    const clMePage = document.getElementById('clMePage');
    const clTabbarA = document.getElementById('clTabbarA');
    const clTabbarB = document.getElementById('clTabbarB');
    let clCurrentTab = 'chat';
    let clBarStyle = localStorage.getItem('cl_bar_style') || 'a';

    function clSwitchTab(tab) {
      clCurrentTab = tab;
      if (tab === 'me') {
        clMePage.classList.add('open');
      } else {
        clMePage.classList.remove('open');
      }
      // 联系人页面
      const contactsPage = document.getElementById('clContactsPage');
      if (contactsPage) {
        if (tab === 'contacts') {
          contactsPage.classList.add('open');
        } else {
          contactsPage.classList.remove('open');
        }
      }
      // 更新两套底栏的 active 状态
      panel.querySelectorAll('[data-tab]').forEach(t => {
        t.classList.toggle('active', t.dataset.tab === tab);
      });
    }

    function clSwitchBarStyle(style) {
      clBarStyle = style;
      if (style === 'a') {
        clTabbarA.classList.remove('hidden');
        clTabbarB.classList.add('hidden');
      } else {
        clTabbarB.classList.remove('hidden');
        clTabbarA.classList.add('hidden');
      }
    }

    // 底栏 A 点击
    clTabbarA.querySelectorAll('.cl-bt-tab').forEach(t => {
      t.addEventListener('click', (e) => {
        e.stopPropagation();
        clSwitchTab(t.dataset.tab);
      });
    });
    // 底栏 B 点击
    clTabbarB.querySelectorAll('.cl-tb2-tab').forEach(t => {
      t.addEventListener('click', (e) => {
        e.stopPropagation();
        clSwitchTab(t.dataset.tab);
      });
    });

    // Me Settings 打开/关闭
    document.getElementById('clMeSettingsBtn').addEventListener('click', (e) => {
      e.stopPropagation();
      document.getElementById('clMeSettings').classList.add('open');
    });
    document.getElementById('clMsBack').addEventListener('click', (e) => {
      e.stopPropagation();
      document.getElementById('clMeSettings').classList.remove('open');
    });

    // 初始化底栏样式状态
    clSwitchBarStyle(clBarStyle);
    const clMsBarOptions = document.getElementById('clMsBarOptions');
    if (clMsBarOptions) {
      clMsBarOptions.querySelectorAll('.cl-ms-bar-opt').forEach(o => {
        o.classList.toggle('active', o.dataset.bar === clBarStyle);
      });

      // 底栏样式切换
      clMsBarOptions.addEventListener('click', (e) => {
        e.stopPropagation();
        const opt = e.target.closest('.cl-ms-bar-opt');
        if (!opt) return;
        clMsBarOptions.querySelectorAll('.cl-ms-bar-opt').forEach(o => o.classList.remove('active'));
        opt.classList.add('active');
        clSwitchBarStyle(opt.dataset.bar);
        localStorage.setItem('cl_bar_style', opt.dataset.bar);
      });
    }

    // ===== 聊天室打开/关闭 =====
    const clChatroom = document.getElementById('clChatroom');
    panel.querySelectorAll('.cl-chat-row').forEach(row => {
      row.addEventListener('click', (e) => {
        e.stopPropagation();
        clChatroom.classList.add('open');
      });
    });
    document.getElementById('clChatroomBack').addEventListener('click', (e) => {
      e.stopPropagation();
      clChatroom.classList.remove('open');
    });

    // 聊天室右上角设置按钮
    const crSettingsBtn = clChatroom.querySelector('.cl-cr-btn:last-child');
    if (crSettingsBtn) {
      crSettingsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (window.ChatSettingsPage) {
          window.ChatSettingsPage.open(window.currentChatContact);
        }
      });
    }

    // ═══════════════════════════════════════════
    // Moments 面具系统
    // ═══════════════════════════════════════════
    (function(){
      const MASK_KEY = 'wp_user_masks_v1';
      const ACTIVE_KEY = 'wp_active_mask_id';
      let masks = [];
      let newAvatarData = null;
      let editAvatarData = {};
      let momentsOpen = false;

      // ── IndexedDB 存储（使用 HomeDB）──
      async function loadMasks(){
        const saved = await HomeDB.getItem(MASK_KEY);
        masks = Array.isArray(saved) ? saved : [];
      }
      async function saveMasks(){
        await HomeDB.setItem(MASK_KEY, masks);
      }
      async function getActiveId(){
        return (await HomeDB.getItem(ACTIVE_KEY)) || '';
      }
      async function setActiveId(id){
        await HomeDB.setItem(ACTIVE_KEY, id || null);
      }

      function escH(s){ const d=document.createElement('div');d.textContent=s;return d.innerHTML; }

      const CHIPS = ['禁止问名字','保持距离感','禁用爱意表达','不能哭','保持傲娇','无敌模式'];
      const AV_COLORS = [
        'linear-gradient(135deg,#c8d0e8,#b0bcd8)',
        'linear-gradient(135deg,#c8d8c0,#b0c8a8)',
        'linear-gradient(135deg,#d8c8d0,#c0b0b8)',
        'linear-gradient(135deg,#d8d0c0,#c0b8a8)',
        'linear-gradient(135deg,#c8d8e0,#a8c0c8)',
      ];

      const CSS = `
        .mx-expand-inner{padding:12px 14px 14px;}
        .mx-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;}
        .mx-head-label{font-size:8px;font-weight:700;color:#c5c5ca;letter-spacing:2.5px;text-transform:uppercase;display:flex;align-items:center;gap:6px;}
        .mx-head-label::before{content:'';width:3px;height:10px;border-radius:2px;background:linear-gradient(to bottom,rgba(180,160,220,0.5),rgba(171,200,181,0.5));flex-shrink:0;}
        .mx-add-btn{display:flex;align-items:center;gap:4px;padding:5px 11px;border-radius:50px;background:rgba(255,255,255,0.9);border:0.5px solid rgba(0,0,0,0.06);box-shadow:0 1px 4px rgba(0,0,0,0.04);font-size:9px;font-weight:700;color:#999;cursor:pointer;transition:all 0.2s;-webkit-tap-highlight-color:transparent;}
        .mx-add-btn:active{transform:scale(0.94);}
        .mx-add-btn svg{width:9px;height:9px;stroke:#bbb;fill:none;stroke-width:2.5;stroke-linecap:round;}
        .mx-empty{text-align:center;padding:18px 0 12px;font-size:11px;color:#ccc;font-weight:500;line-height:1.7;display:none;}
        .mx-empty.show{display:block;}
        .mx-empty-icon{font-size:22px;margin-bottom:5px;opacity:0.5;}
        .mx-list{display:flex;flex-direction:column;gap:7px;margin-bottom:8px;}
        .mx-card{background:rgba(255,255,255,0.7);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-radius:13px;border:0.5px solid rgba(255,255,255,0.9);box-shadow:0 2px 8px rgba(0,0,0,0.03);overflow:hidden;}
        .mx-card.mx-active-card{border-color:rgba(181,200,171,0.5);box-shadow:0 2px 12px rgba(181,200,171,0.15);}
        .mx-card-head{display:flex;align-items:center;gap:9px;padding:10px 11px;}
        .mx-card-av{width:36px;height:36px;border-radius:50%;flex-shrink:0;overflow:hidden;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:800;color:#fff;position:relative;cursor:pointer;box-shadow:0 2px 6px rgba(0,0,0,0.1);transition:transform 0.15s;}
        .mx-card-av:active{transform:scale(0.92);}
        .mx-card-av img{width:100%;height:100%;object-fit:cover;position:absolute;inset:0;border-radius:50%;}
        .mx-card-info{flex:1;min-width:0;}
        .mx-card-name{font-size:12.5px;font-weight:700;color:#333;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:1px;}
        .mx-card-preview{font-size:9px;color:#bbb;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        .mx-card-actions{display:flex;gap:5px;flex-shrink:0;}
        .mx-card-btn{width:25px;height:25px;border-radius:50%;background:rgba(255,255,255,0.7);border:0.5px solid rgba(0,0,0,0.05);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all 0.18s;-webkit-tap-highlight-color:transparent;}
        .mx-card-btn:active{transform:scale(0.88);}
        .mx-card-btn svg{width:11px;height:11px;fill:none;stroke:#bbb;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;}
        .mx-card-btn.use-btn svg{stroke:#9ab891;}
        .mx-card-btn.del-btn svg{stroke:#d08080;}
        .mx-card-btn.use-btn.active-btn{background:linear-gradient(135deg,#b5c8ab,#9ab891);border-color:transparent;}
        .mx-card-btn.use-btn.active-btn svg{stroke:#fff;}
        .mx-card-body{max-height:0;overflow:hidden;transition:max-height 0.4s cubic-bezier(0.16,1,0.3,1);}
        .mx-card-body.open{max-height:600px;border-top:0.5px solid rgba(0,0,0,0.04);}
        .mx-card-body-inner{padding:9px 11px 11px;}
        .mx-info-row{display:flex;align-items:flex-start;gap:7px;margin-bottom:7px;}
        .mx-info-row:last-child{margin-bottom:0;}
        .mx-info-tag{font-size:8px;font-weight:700;letter-spacing:0.5px;padding:2px 6px;border-radius:4px;flex-shrink:0;margin-top:1px;white-space:nowrap;}
        .tag-nick{background:rgba(180,160,220,0.12);color:#a090c0;}
        .tag-persona{background:rgba(181,200,171,0.15);color:#8ab080;}
        .tag-taboo{background:rgba(220,160,160,0.12);color:#c09090;}
        .mx-info-val{font-size:10.5px;color:#777;line-height:1.5;word-break:break-word;flex:1;}
        .mx-info-val.empty{color:#ddd;font-style:italic;}
        .mx-edit-form{padding:9px 11px 11px;border-top:0.5px solid rgba(0,0,0,0.04);display:none;}
        .mx-edit-form.show{display:block;}
        .mx-form-row{margin-bottom:9px;}
        .mx-form-row:last-child{margin-bottom:0;}
        .mx-form-label{font-size:8px;font-weight:700;color:#c0c0c5;letter-spacing:0.8px;text-transform:uppercase;margin-bottom:4px;display:flex;align-items:center;gap:5px;}
        .mx-form-label-dot{width:4px;height:4px;border-radius:1px;flex-shrink:0;}
        .dot-nick{background:rgba(180,160,220,0.5);}
        .dot-persona{background:rgba(181,200,171,0.5);}
        .dot-taboo{background:rgba(220,160,160,0.4);}
        .mx-av-upload-row{display:flex;align-items:center;gap:10px;padding:8px 0 4px;}
        .mx-av-upload-circle{width:44px;height:44px;border-radius:50%;background:rgba(0,0,0,0.04);border:1.5px dashed rgba(0,0,0,0.1);display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;overflow:hidden;position:relative;transition:transform 0.15s;-webkit-tap-highlight-color:transparent;}
        .mx-av-upload-circle:active{transform:scale(0.92);}
        .mx-av-upload-circle svg{width:16px;height:16px;stroke:rgba(0,0,0,0.18);fill:none;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round;}
        .mx-av-upload-circle img{width:100%;height:100%;object-fit:cover;position:absolute;inset:0;border-radius:50%;}
        .mx-av-upload-hint{font-size:10px;color:#ccc;font-weight:500;}
        .mx-form-input{width:100%;height:36px;border-radius:9px;border:0.5px solid rgba(0,0,0,0.07);background:rgba(255,255,255,0.7);padding:0 11px;font-size:12px;color:#333;font-weight:500;outline:none;font-family:inherit;transition:all 0.2s;}
        .mx-form-input::placeholder{color:#d5d5d5;}
        .mx-form-input:focus{background:#fff;border-color:rgba(180,160,220,0.4);box-shadow:0 0 0 3px rgba(180,160,220,0.08);}
        .mx-form-textarea{width:100%;min-height:64px;border-radius:9px;border:0.5px solid rgba(0,0,0,0.07);background:rgba(255,255,255,0.7);padding:8px 11px;font-size:11px;color:#333;line-height:1.6;resize:vertical;outline:none;font-family:inherit;transition:all 0.2s;}
        .mx-form-textarea::placeholder{color:#d5d5d5;}
        .mx-form-textarea:focus{background:#fff;border-color:rgba(180,160,220,0.4);box-shadow:0 0 0 3px rgba(180,160,220,0.08);}
        .mx-chips{display:flex;flex-wrap:wrap;gap:4px;margin-top:6px;}
        .mx-chip{padding:3px 8px;border-radius:50px;background:rgba(220,160,160,0.08);border:0.5px solid rgba(220,160,160,0.18);font-size:9px;font-weight:600;color:#c09090;cursor:pointer;transition:all 0.18s;-webkit-tap-highlight-color:transparent;user-select:none;}
        .mx-chip:active{transform:scale(0.94);}
        .mx-chip.active{background:rgba(220,160,160,0.2);border-color:rgba(220,160,160,0.4);}
        .mx-taboo-hint{font-size:9px;color:#d0d0d0;margin-top:5px;line-height:1.5;}
        .mx-form-btns{display:flex;gap:6px;margin-top:10px;}
        .mx-form-btn{flex:1;height:34px;border-radius:9px;border:none;cursor:pointer;font-size:11px;font-weight:700;font-family:inherit;display:flex;align-items:center;justify-content:center;gap:4px;transition:all 0.18s;-webkit-tap-highlight-color:transparent;}
        .mx-form-btn:active{transform:scale(0.97);}
        .mx-form-btn.cancel-btn{background:rgba(255,255,255,0.7);border:0.5px solid rgba(0,0,0,0.06);color:#bbb;}
        .mx-form-btn.save-btn{background:linear-gradient(135deg,#b5c8ab,#9ab891);color:#fff;box-shadow:0 3px 10px rgba(181,200,171,0.28);}
        .mx-form-btn.save-btn svg{width:11px;height:11px;stroke:#fff;fill:none;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round;}
        .mx-new-form{background:rgba(255,255,255,0.5);border-radius:13px;border:1px dashed rgba(0,0,0,0.07);overflow:hidden;display:none;}
        .mx-new-form.show{display:block;}
        .mx-new-form-head{display:flex;align-items:center;gap:9px;padding:10px 11px 8px;}
        .mx-new-av-area{width:36px;height:36px;border-radius:50%;background:rgba(0,0,0,0.04);border:1.5px dashed rgba(0,0,0,0.09);display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;overflow:hidden;position:relative;transition:transform 0.15s;-webkit-tap-highlight-color:transparent;}
        .mx-new-av-area:active{transform:scale(0.92);}
        .mx-new-av-area svg{width:15px;height:15px;stroke:rgba(0,0,0,0.15);fill:none;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round;}
        .mx-new-av-area img{width:100%;height:100%;object-fit:cover;position:absolute;inset:0;display:none;border-radius:50%;}
        .mx-new-form-title{flex:1;font-size:11.5px;font-weight:600;color:#bbb;}
        .mx-new-form-body{padding:0 11px 11px;}
        .mx-toast-inner{position:absolute;bottom:90px;left:50%;transform:translateX(-50%) translateY(8px);background:rgba(40,40,45,0.82);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);color:#fff;font-size:11px;font-weight:600;padding:7px 16px;border-radius:50px;opacity:0;pointer-events:none;z-index:9999;transition:opacity 0.22s,transform 0.22s;white-space:nowrap;}
        .mx-toast-inner.show{opacity:1;transform:translateX(-50%) translateY(0);}
      `;

      if(!document.getElementById('mxMaskStyles')){
        const s=document.createElement('style');
        s.id='mxMaskStyles';s.textContent=CSS;document.head.appendChild(s);
      }

      // Toast
      let toastEl = panel.querySelector('.mx-toast-inner');
      if(!toastEl){
        toastEl=document.createElement('div');
        toastEl.className='mx-toast-inner';
        panel.appendChild(toastEl);
      }
      let _toastTimer=null;
      function showToast(msg){
        toastEl.textContent=msg;toastEl.classList.add('show');
        if(_toastTimer) clearTimeout(_toastTimer);
        _toastTimer=setTimeout(()=>toastEl.classList.remove('show'),1800);
      }

      // ── 同步头像到 Me 卡片 和 消息页顶部 ──
      function syncAvatarUI(dataUrl){
        const postImg = panel.querySelector('.cl-me-uc-post-img');
        if(postImg){
          if(dataUrl){ postImg.style.backgroundImage=`url("${dataUrl}")`;postImg.style.backgroundSize='cover';postImg.style.backgroundPosition='center'; }
          else { postImg.style.backgroundImage=''; }
        }
        const tpAvatar = panel.querySelector('.cl-tp-avatar');
        if(tpAvatar){
          if(dataUrl){ tpAvatar.style.backgroundImage=`url("${dataUrl}")`;tpAvatar.style.backgroundSize='cover';tpAvatar.style.backgroundPosition='center'; }
          else { tpAvatar.style.backgroundImage=''; }
        }
      }

      // ── 重新撑开 expand 高度（render 后内容变了必须更新） ──
      function refreshExpandHeight(){
        const expand = document.getElementById('clMomentsExpand');
        if(!expand || !momentsOpen) return;
        expand.style.maxHeight = 'none';
        const h = expand.scrollHeight;
        expand.style.maxHeight = h + 'px';
      }

      // ── 渲染（async，因为要 await getActiveId） ──
      async function render(){
        const expand = document.getElementById('clMomentsExpand');
        if(!expand) return;
        const activeId = await getActiveId();

        let html = `<div class="mx-expand-inner">`;
        html += `<div class="mx-head"><div class="mx-head-label">⋆ MY MASKS ⋆</div><div class="mx-add-btn" id="mxAddBtn"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>新建面具</div></div>`;
        html += `<div class="mx-empty${masks.length===0?' show':''}" id="mxEmpty"><div class="mx-empty-icon">🎭</div>暂无面具<br><span style="font-size:10px;color:#ddd;">创建面具，让 AI 了解你扮演的角色</span></div>`;
        html += `<div class="mx-list" id="mxList">`;

        masks.forEach((m,i)=>{
          const isActive = m.id === activeId;
          const avStyle = AV_COLORS[i % AV_COLORS.length];
          const avContent = m.avatar
            ? `<img src="${m.avatar}" style="width:100%;height:100%;object-fit:cover;position:absolute;inset:0;border-radius:50%;">`
            : escH((m.nick||'?').charAt(0));
          const preview = [m.nick?'「'+m.nick+'」':'', m.persona?(m.persona.substring(0,16)+(m.persona.length>16?'…':'')):'' ].filter(Boolean).join(' · ') || '暂无内容';

          html += `<div class="mx-card${isActive?' mx-active-card':''}" id="mxCard_${m.id}">
            <div class="mx-card-head">
              <div class="mx-card-av" id="mxAv_${m.id}" style="background:${avStyle}">${avContent}</div>
              <div class="mx-card-info">
                <div class="mx-card-name">${escH(m.nick||'未命名')}</div>
                <div class="mx-card-preview">${escH(preview)}</div>
              </div>
              <div class="mx-card-actions">
                <div class="mx-card-btn use-btn${isActive?' active-btn':''}" data-act="use" data-id="${m.id}">
                  <svg viewBox="0 0 24 24"><path d="M5 12l5 5L20 7"/></svg>
                </div>
                <div class="mx-card-btn" data-act="toggle" data-id="${m.id}">
                  <svg viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                </div>
                <div class="mx-card-btn" data-act="edit" data-id="${m.id}">
                  <svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                </div>
                <div class="mx-card-btn del-btn" data-act="del" data-id="${m.id}">
                  <svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>
                </div>
              </div>
            </div>
            <div class="mx-card-body" id="mxBody_${m.id}">
              <div class="mx-card-body-inner">
                <div class="mx-info-row"><div class="mx-info-tag tag-nick">昵称</div><div class="mx-info-val${m.nick?'':' empty'}">${escH(m.nick)||'未填写'}</div></div>
                <div class="mx-info-row"><div class="mx-info-tag tag-persona">人设</div><div class="mx-info-val${m.persona?'':' empty'}">${escH(m.persona)||'未填写'}</div></div>
                <div class="mx-info-row"><div class="mx-info-tag tag-taboo">禁忌</div><div class="mx-info-val${m.taboo?'':' empty'}">${escH(m.taboo)||'未填写'}</div></div>
              </div>
            </div>
            <div class="mx-edit-form" id="mxEdit_${m.id}">
              <div class="mx-av-upload-row">
                <div class="mx-av-upload-circle" data-act="upload-edit-av" data-id="${m.id}">
                  ${m.avatar ? `<img src="${m.avatar}">` : `<svg viewBox="0 0 24 24"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>`}
                </div>
                <div class="mx-av-upload-hint">点击更换头像</div>
              </div>
              <div class="mx-form-row">
                <div class="mx-form-label"><div class="mx-form-label-dot dot-nick"></div>NICKNAME · 昵称</div>
                <input class="mx-form-input" id="mxEN_${m.id}" value="${escH(m.nick)}" placeholder="你的称呼...">
              </div>
              <div class="mx-form-row">
                <div class="mx-form-label"><div class="mx-form-label-dot dot-persona"></div>PERSONA · 人设</div>
                <textarea class="mx-form-textarea" id="mxEP_${m.id}" placeholder="角色设定、性格、背景...">${escH(m.persona)}</textarea>
              </div>
              <div class="mx-form-row">
                <div class="mx-form-label"><div class="mx-form-label-dot dot-taboo"></div>TABOO · 禁忌</div>
                <textarea class="mx-form-textarea" id="mxET_${m.id}" placeholder="不能做或需注意的事..." style="min-height:58px;">${escH(m.taboo)}</textarea>
                <div class="mx-chips">${CHIPS.map(c=>`<div class="mx-chip" data-chip="${c}" data-target="mxET_${m.id}">${c}</div>`).join('')}</div>
                <div class="mx-taboo-hint">💡 禁忌将注入系统 Prompt</div>
              </div>
              <div class="mx-form-btns">
                <div class="mx-form-btn cancel-btn" data-act="cancel-edit" data-id="${m.id}">取消</div>
                <div class="mx-form-btn save-btn" data-act="save-edit" data-id="${m.id}"><svg viewBox="0 0 24 24"><path d="M5 12l5 5L20 7"/></svg>保存</div>
              </div>
            </div>
          </div>`;
        });

        html += `</div>`; // mx-list

        html += `<div class="mx-new-form" id="mxNewForm">
          <div class="mx-new-form-head">
            <div class="mx-new-av-area" id="mxNewAvArea">
              <svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              <img id="mxNewAvImg">
            </div>
            <div class="mx-new-form-title">新建面具 · 让 AI 认识你</div>
          </div>
          <div class="mx-new-form-body">
            <div class="mx-form-row">
              <div class="mx-form-label"><div class="mx-form-label-dot dot-nick"></div>NICKNAME · 昵称</div>
              <input class="mx-form-input" id="mxNewNick" placeholder="你的称呼，例如：旅行者、小明...">
            </div>
            <div class="mx-form-row">
              <div class="mx-form-label"><div class="mx-form-label-dot dot-persona"></div>PERSONA · 用户人设</div>
              <textarea class="mx-form-textarea" id="mxNewPersona" placeholder="描述你扮演的角色设定、性格、背景..."></textarea>
            </div>
            <div class="mx-form-row">
              <div class="mx-form-label"><div class="mx-form-label-dot dot-taboo"></div>TABOO · 禁忌 / 角色须知</div>
              <textarea class="mx-form-textarea" id="mxNewTaboo" placeholder="角色不能做或需注意的事..." style="min-height:58px;"></textarea>
              <div class="mx-chips">${CHIPS.map(c=>`<div class="mx-chip" data-chip="${c}" data-target="mxNewTaboo">${c}</div>`).join('')}</div>
              <div class="mx-taboo-hint">💡 禁忌将注入系统 Prompt，char 提前知道对用户的约束</div>
            </div>
            <div class="mx-form-btns">
              <div class="mx-form-btn cancel-btn" data-act="cancel-new">取消</div>
              <div class="mx-form-btn save-btn" data-act="save-new"><svg viewBox="0 0 24 24"><path d="M5 12l5 5L20 7"/></svg>保存面具</div>
            </div>
          </div>
        </div>`;

        html += `</div>`; // mx-expand-inner
        expand.innerHTML = html;

        // render 完成后刷新高度
        setTimeout(refreshExpandHeight, 20);

        bindExpandEvents(expand);
      }

      function bindExpandEvents(expand){
        const addBtn = expand.querySelector('#mxAddBtn');
        if(addBtn) addBtn.addEventListener('click', e=>{ e.stopPropagation(); showNewForm(); });

        const newAvArea = expand.querySelector('#mxNewAvArea');
        if(newAvArea) newAvArea.addEventListener('click', e=>{ e.stopPropagation(); uploadNewAvatar(); });

        const listEl = expand.querySelector('#mxList');
        if(listEl){
          listEl.addEventListener('click', async e=>{
            e.stopPropagation();

            // 快捷标签
            const chip = e.target.closest('.mx-chip');
            if(chip){
              chip.classList.toggle('active');
              const ta = document.getElementById(chip.dataset.target);
              if(ta){
                let val=ta.value.trim(); const text=chip.dataset.chip;
                if(chip.classList.contains('active')){ val=val?val+' / '+text:text; }
                else { val=val.split('/').map(s=>s.trim()).filter(s=>s&&s!==text).join(' / '); }
                ta.value=val;
              }
              return;
            }

            const btn = e.target.closest('[data-act]');
            if(!btn) return;
            const act = btn.dataset.act;
            const id  = btn.dataset.id;

            if(act==='use'){
              const curActive = await getActiveId();
              const wasActive = curActive===id;
              await setActiveId(wasActive ? '' : id);
              const m=masks.find(x=>x.id===id);
              syncAvatarUI((!wasActive&&m&&m.avatar)?m.avatar:'');
              showToast(wasActive?'已取消面具':`✦ 已激活「${m?m.nick:id}」`);
              await render();
            }
            else if(act==='toggle'){
              const body=document.getElementById('mxBody_'+id);
              if(body){ body.classList.toggle('open'); setTimeout(refreshExpandHeight,420); }
            }
            else if(act==='edit'){
              expand.querySelectorAll('.mx-edit-form').forEach(f=>f.classList.remove('show'));
              const form=document.getElementById('mxEdit_'+id);
              if(form){ form.classList.add('show'); }
              const body=document.getElementById('mxBody_'+id);
              if(body){ body.classList.add('open'); }
              setTimeout(refreshExpandHeight,420);
            }
            else if(act==='cancel-edit'){
              const form=document.getElementById('mxEdit_'+id);
              if(form) form.classList.remove('show');
              setTimeout(refreshExpandHeight,420);
            }
            else if(act==='save-edit'){
              const m=masks.find(x=>x.id===id);
              if(!m) return;
              m.nick    = (document.getElementById('mxEN_'+id)||{}).value?.trim()||m.nick;
              m.persona = (document.getElementById('mxEP_'+id)||{}).value?.trim()||'';
              m.taboo   = (document.getElementById('mxET_'+id)||{}).value?.trim()||'';
              if(editAvatarData[id]){ m.avatar=editAvatarData[id]; delete editAvatarData[id]; }
              await saveMasks();
              const curActive = await getActiveId();
              if(curActive===id && m.avatar) syncAvatarUI(m.avatar);
              showToast('✦ 面具已更新');
              await render();
            }
            else if(act==='upload-edit-av'){
              const inp=document.createElement('input');
              inp.type='file'; inp.accept='image/*';
              inp.onchange=()=>{
                const f=inp.files&&inp.files[0]; if(!f) return;
                const r=new FileReader();
                r.onload=()=>{
                  editAvatarData[id]=r.result;
                  const circle=expand.querySelector(`[data-act="upload-edit-av"][data-id="${id}"]`);
                  if(circle){ circle.innerHTML=`<img src="${r.result}" style="width:100%;height:100%;object-fit:cover;position:absolute;inset:0;border-radius:50%;">`; }
                  // 同步卡片头像预览
                  const av=document.getElementById('mxAv_'+id);
                  if(av){ av.innerHTML=`<img src="${r.result}" style="width:100%;height:100%;object-fit:cover;position:absolute;inset:0;border-radius:50%;">`; }
                };
                r.readAsDataURL(f);
              };
              inp.click();
            }
            else if(act==='del'){
              masks=masks.filter(x=>x.id!==id);
              delete editAvatarData[id];
              const curActive=await getActiveId();
              if(curActive===id){ await setActiveId(''); syncAvatarUI(''); }
              await saveMasks();
              const card=document.getElementById('mxCard_'+id);
              if(card){
                card.style.transition='opacity 0.22s,transform 0.22s';
                card.style.opacity='0'; card.style.transform='translateX(10px)';
                setTimeout(async()=>await render(),240);
              }
              showToast('已删除');
            }
            else if(act==='cancel-new'){ hideNewForm(); }
            else if(act==='save-new'){ await saveNewMask(); }
          });
        }

        const newForm = expand.querySelector('#mxNewForm');
        if(newForm){
          newForm.addEventListener('click', async e=>{
            e.stopPropagation();
            const chip=e.target.closest('.mx-chip');
            if(chip){
              chip.classList.toggle('active');
              const ta=document.getElementById(chip.dataset.target);
              if(ta){
                let val=ta.value.trim(); const text=chip.dataset.chip;
                if(chip.classList.contains('active')){ val=val?val+' / '+text:text; }
                else { val=val.split('/').map(s=>s.trim()).filter(s=>s&&s!==text).join(' / '); }
                ta.value=val;
              }
              return;
            }
            const btn=e.target.closest('[data-act]');
            if(!btn) return;
            if(btn.dataset.act==='cancel-new') hideNewForm();
            if(btn.dataset.act==='save-new') await saveNewMask();
          });
        }
      }

      function showNewForm(){
        const form=document.getElementById('mxNewForm');
        if(!form) return;
        form.classList.add('show');
        newAvatarData=null;
        // 清空字段
        const nn=document.getElementById('mxNewNick'); if(nn) nn.value='';
        const np=document.getElementById('mxNewPersona'); if(np) np.value='';
        const nt=document.getElementById('mxNewTaboo'); if(nt) nt.value='';
        const img=document.getElementById('mxNewAvImg'); if(img){ img.src=''; img.style.display='none'; }
        const area=document.getElementById('mxNewAvArea'); if(area){ const sv=area.querySelector('svg'); if(sv) sv.style.display=''; }
        document.querySelectorAll('#mxNewForm .mx-chip').forEach(c=>c.classList.remove('active'));
        setTimeout(()=>{ form.scrollIntoView({behavior:'smooth',block:'nearest'}); refreshExpandHeight(); },50);
      }
      function hideNewForm(){
        const form=document.getElementById('mxNewForm');
        if(form) form.classList.remove('show');
        newAvatarData=null;
        setTimeout(refreshExpandHeight,50);
      }

      function uploadNewAvatar(){
        const inp=document.createElement('input');
        inp.type='file'; inp.accept='image/*';
        inp.onchange=()=>{
          const f=inp.files&&inp.files[0]; if(!f) return;
          const r=new FileReader();
          r.onload=()=>{
            newAvatarData=r.result;
            const img=document.getElementById('mxNewAvImg');
            const area=document.getElementById('mxNewAvArea');
            if(img){ img.src=r.result; img.style.display='block'; }
            if(area){ const sv=area.querySelector('svg'); if(sv) sv.style.display='none'; }
          };
          r.readAsDataURL(f);
        };
        inp.click();
      }

      async function saveNewMask(){
        const nick    = (document.getElementById('mxNewNick')||{}).value?.trim()||'';
        const persona = (document.getElementById('mxNewPersona')||{}).value?.trim()||'';
        const taboo   = (document.getElementById('mxNewTaboo')||{}).value?.trim()||'';
        if(!nick){
          const el=document.getElementById('mxNewNick');
          if(el){
            el.style.transition='transform 0.06s';
            const frames=['-6px','6px','-4px','4px','0']; let i=0;
            const go=()=>{ if(i>=frames.length){el.style.transform='';return;} el.style.transform='translateX('+frames[i++]+')'; setTimeout(go,60); };
            go(); el.focus();
          }
          return;
        }
        const m={ id:'mask_'+Date.now(), nick, persona, taboo, avatar:newAvatarData||'' };
        masks.push(m);
        await saveMasks();
        newAvatarData=null;
        showToast('✦ 面具「'+nick+'」已创建');
        await render();
      }

      // ── Moments 展开/折叠 ──
      const momentsToggle = document.getElementById('clMomentsToggle');
      const momentsExpand = document.getElementById('clMomentsExpand');
      const momentsArrow  = document.getElementById('clMomentsArrow');

      if(momentsToggle){
        momentsToggle.addEventListener('click', async e=>{
          e.stopPropagation();
          momentsOpen = !momentsOpen;
          momentsArrow.style.transform = momentsOpen ? 'rotate(90deg)' : '';
          if(momentsOpen){
            await loadMasks();
            await render();
            // render 后再撑开（内容已渲染）
            momentsExpand.style.maxHeight = 'none';
          } else {
            momentsExpand.style.maxHeight = '0';
          }
        });
      }

      // 初始化：加载并同步头像
      (async()=>{
        await loadMasks();
        const activeId = await getActiveId();
        const active = masks.find(m=>m.id===activeId);
        if(active && active.avatar) syncAvatarUI(active.avatar);
      })();

    })();

    panel.addEventListener('click', (e) => { e.stopPropagation(); });
  }

  return { init, open, close };
})();

window.addEventListener('DOMContentLoaded', () => {
  ChatListPage.init();
});
