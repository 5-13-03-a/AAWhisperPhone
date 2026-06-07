// ==========================================
// Chat Settings 聊天室设置页
// ==========================================

const ChatSettingsPage = (() => {
  let panel = null;
  let currentContact = null;

  const CSS = `
    /* ===== 背景五角星和波点 ===== */
    .crs-bg {
      position:absolute; inset:0;
      overflow:hidden; pointer-events:none;
      background:
        radial-gradient(circle at 20% 15%, rgba(0,0,0,0.035) 0 1px, transparent 1.2px) 0 0/26px 26px,
        radial-gradient(circle at 75% 22%, rgba(0,0,0,0.025) 0 1px, transparent 1.2px) 0 0/34px 34px,
        radial-gradient(circle at 12% 72%, rgba(0,0,0,0.03) 0 1.3px, transparent 1.5px) 0 0/38px 38px,
        radial-gradient(circle at 82% 74%, rgba(0,0,0,0.02) 0 1px, transparent 1.2px) 0 0/30px 30px,
        linear-gradient(180deg, #fff 0%, #fafafa 100%);
    }
    .crs-star {
      position:absolute; fill:none; stroke:#d8d8dd; stroke-width:1.4; opacity:0.55;
      filter:drop-shadow(0 1px 0 rgba(255,255,255,0.55));
    }
    .crs-star.fill { fill:#ededf2; stroke:#e1e1e7; opacity:0.8; }
    .crs-dot { position:absolute; border-radius:50%; background:rgba(0,0,0,0.05); box-shadow:0 1px 0 rgba(255,255,255,0.8) inset; }
    .crs-dot.dark { background:rgba(0,0,0,0.08); }
    .crs-dot.light { background:rgba(0,0,0,0.03); }

    /* ===== 页面容器 ===== */
    .crs-page {
      position:absolute; inset:0; z-index:300;
      display:flex; flex-direction:column; overflow:hidden;
      background:rgba(255,255,255,0.72); backdrop-filter:blur(1px);
      clip-path: circle(0% at 88% 8%);
      transition: clip-path 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .crs-page.open { clip-path: circle(150% at 88% 8%); }

    .crs-topbar {
      flex-shrink:0; padding:60px 20px 16px;
      display:flex; align-items:center; gap:14px; position:relative; z-index:5;
    }
    .crs-back {
      width:34px; height:34px; border-radius:50%; background:#f7f7fa;
      border:1px solid rgba(0,0,0,0.04);
      display:flex; align-items:center; justify-content:center; cursor:pointer;
      box-shadow:0 1px 3px rgba(0,0,0,0.04);
    }
    .crs-back svg { width:14px; height:14px; fill:none; stroke:#1c1c1c; stroke-width:2.5; stroke-linecap:round; stroke-linejoin:round; }
    .crs-topbar-info { flex:1; }
    .crs-topbar-name { font-size:16px; font-weight:800; color:#1c1c1c; letter-spacing:-0.3px; }
    .crs-topbar-sub { font-size:10px; color:#a7a7ad; margin-top:1px; }
    .crs-topbar-avatar { width:38px; height:38px; border-radius:50%; background:#f2f2f5 center/cover no-repeat; border:2px solid #fff; box-shadow:0 2px 8px rgba(0,0,0,0.08); }

    .crs-tabs { position:absolute; left:0; top:180px; display:flex; flex-direction:column; gap:2px; z-index:10; }
    .crs-tab {
      width:38px; height:38px; display:flex; align-items:center; justify-content:center;
      cursor:pointer; position:relative; border-radius:0 11px 11px 0; transition:background 0.2s;
    }
    .crs-tab svg { width:16px; height:16px; fill:none; stroke:rgba(28,28,28,0.28); stroke-width:1.6; stroke-linecap:round; stroke-linejoin:round; transition:stroke 0.2s; }
    .crs-tab.active { background:rgba(0,0,0,0.03); }
    .crs-tab.active svg { stroke:#1c1c1c; }
    .crs-tab-dot { position:absolute; right:6px; top:6px; width:4px; height:4px; border-radius:50%; background:#cfcfd6; }

    .crs-scroll { flex:1; overflow-y:auto; padding:0 18px 40px; margin-left:38px; -webkit-overflow-scrolling:touch; z-index:5; }
    .crs-scroll::-webkit-scrollbar { display:none; }

    .crs-sec { display:flex; align-items:center; gap:6px; padding:18px 0 10px; }
    .crs-sec-line { width:12px; height:1.5px; background:rgba(0,0,0,0.08); border-radius:1px; }
    .crs-sec-text { font-size:9px; font-weight:700; color:#b2b2b8; letter-spacing:2px; text-transform:uppercase; }

    .crs-card { background:rgba(255,255,255,0.92); border:1px solid rgba(0,0,0,0.04); border-radius:16px; padding:14px; margin-bottom:8px; box-shadow:0 1px 4px rgba(0,0,0,0.03); }
    .crs-row { display:flex; align-items:center; gap:10px; padding:10px 0; }
    .crs-row + .crs-row { border-top:1px solid rgba(0,0,0,0.03); }
    .crs-row-icon { width:28px; height:28px; border-radius:8px; background:#f5f5f7; display:flex; align-items:center; justify-content:center; flex-shrink:0; border:1px solid rgba(0,0,0,0.03); }
    .crs-row-icon svg { width:14px; height:14px; fill:none; stroke:#8f8f97; stroke-width:1.6; stroke-linecap:round; stroke-linejoin:round; }
    .crs-row-text { flex:1; min-width:0; }
    .crs-row-t1 { font-size:12px; font-weight:600; color:#1c1c1c; }
    .crs-row-t2 { font-size:9px; color:#b7b7bd; margin-top:1px; }
    .crs-row-right { display:flex; align-items:center; gap:6px; flex-shrink:0; }

    .crs-sw { width:36px; height:20px; border-radius:10px; background:#ededf2; border:1px solid #dddde3; position:relative; cursor:pointer; transition:background 0.2s, border-color 0.2s; }
    .crs-sw::after { content:''; position:absolute; top:2px; left:2px; width:14px; height:14px; border-radius:50%; background:#fff; box-shadow:0 1px 3px rgba(0,0,0,0.12); transition:transform 0.2s, background 0.2s; }
    .crs-sw.on { background:#1c1c1c; border-color:#1c1c1c; }
    .crs-sw.on::after { transform:translateX(16px); background:#fff; }

    .crs-input { width:100%; height:38px; border-radius:10px; border:1px solid #ececf1; background:#fafafa; padding:0 12px; font-size:12px; color:#1c1c1c; outline:none; transition:border-color 0.2s, background 0.2s; }
    .crs-input:focus { border-color:#1c1c1c; background:#fff; }
    .crs-input::placeholder { color:#d0d0d6; }
    .crs-textarea { width:100%; min-height:80px; border-radius:10px; border:1px solid #ececf1; background:#fafafa; padding:10px 12px; font-size:12px; color:#1c1c1c; outline:none; resize:none; font-family:inherit; line-height:1.6; transition:border-color 0.2s, background 0.2s; }
    .crs-textarea:focus { border-color:#1c1c1c; background:#fff; }
    .crs-textarea::placeholder { color:#d0d0d6; }
    .crs-field { margin-bottom:10px; }
    .crs-field-label { font-size:9px; font-weight:600; color:#b7b7bd; margin-bottom:5px; letter-spacing:0.5px; }

    .crs-num-input { width:54px; height:28px; border-radius:8px; border:1px solid #ececf1; background:#fafafa; padding:0 6px; font-size:11px; color:#1c1c1c; text-align:center; outline:none; }
    .crs-num-input:focus { border-color:#1c1c1c; background:#fff; }

    .crs-section { display:none; }
    .crs-section.active { display:block; }

    .crs-mask-card { background:#fff; border:1px solid rgba(0,0,0,0.04); border-radius:12px; padding:12px; display:flex; align-items:center; gap:10px; cursor:pointer; margin-top:8px; transition:background 0.15s, border-color 0.15s; box-shadow:0 1px 3px rgba(0,0,0,0.03); }
    .crs-mask-card:active { background:#f7f7f9; }
    .crs-mask-avatar { width:36px; height:36px; border-radius:50%; background:#f0f0f4; display:flex; align-items:center; justify-content:center; font-size:14px; color:#a9a9b0; flex-shrink:0; border:1px solid rgba(0,0,0,0.03); }
    .crs-mask-info { flex:1; }
    .crs-mask-name { font-size:12px; font-weight:700; color:#1c1c1c; }
    .crs-mask-desc { font-size:9px; color:#b7b7bd; margin-top:2px; }
    .crs-mask-change { font-size:9px; font-weight:600; color:#8f8f97; padding:4px 10px; border-radius:8px; background:#f5f5f7; border:1px solid rgba(0,0,0,0.03); }

    .crs-mem-row { display:flex; align-items:center; gap:10px; padding:10px 0; cursor:pointer; }
    .crs-mem-row + .crs-mem-row { border-top:1px solid rgba(0,0,0,0.03); }
    .crs-mem-row:active { opacity:0.7; }
    .crs-mem-row svg { width:14px; height:14px; fill:none; stroke:#a9a9b0; stroke-width:1.6; stroke-linecap:round; stroke-linejoin:round; flex-shrink:0; }
    .crs-mem-label { font-size:11px; color:#555; flex:1; }
    .crs-mem-arrow svg { width:10px; height:10px; stroke:#d0d0d6; }

    .crs-anim-opts{display:flex;gap:6px;padding:10px 0 4px;}
    .crs-anim-opt{flex:1;padding:12px 4px;border-radius:12px;background:rgba(0,0,0,0.03);border:1.5px solid transparent;display:flex;flex-direction:column;align-items:center;gap:5px;cursor:pointer;transition:border-color 0.2s,background 0.2s;}
    .crs-anim-opt.active{border-color:#1c1c1c;background:rgba(28,28,28,0.06);}
    .crs-anim-opt svg{width:18px;height:18px;fill:none;stroke:#999;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round;transition:stroke 0.2s;}
    .crs-anim-opt.active svg{stroke:#1c1c1c;}
    .crs-anim-opt span{font-size:8px;font-weight:600;color:#999;letter-spacing:0.3px;transition:color 0.2s;}
    .crs-anim-opt.active span{color:#1c1c1c;}
  `;

  function buildHTML() {
    return `
      <div class="crs-page" id="crsPage">
        <div class="crs-bg" aria-hidden="true">
          <svg class="crs-star fill" style="left:6%;top:12%;width:18px;height:18px;transform:rotate(-8deg);" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          <svg class="crs-star" style="left:18%;top:22%;width:10px;height:10px;transform:rotate(10deg);" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          <svg class="crs-star fill" style="right:10%;top:14%;width:14px;height:14px;transform:rotate(18deg);" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          <svg class="crs-star" style="right:22%;top:28%;width:8px;height:8px;transform:rotate(-22deg);" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          <svg class="crs-star fill" style="left:10%;top:66%;width:22px;height:22px;transform:rotate(12deg);" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          <svg class="crs-star" style="left:28%;top:72%;width:12px;height:12px;transform:rotate(-6deg);" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          <svg class="crs-star fill" style="right:14%;top:64%;width:16px;height:16px;transform:rotate(9deg);" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          <svg class="crs-star" style="right:28%;top:76%;width:9px;height:9px;transform:rotate(-14deg);" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          <svg class="crs-star fill" style="left:52%;top:10%;width:11px;height:11px;transform:rotate(-4deg);" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          <svg class="crs-star" style="left:66%;top:20%;width:15px;height:15px;transform:rotate(16deg);" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          <svg class="crs-star fill" style="left:84%;top:42%;width:12px;height:12px;transform:rotate(-18deg);" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          <svg class="crs-star" style="left:72%;top:78%;width:13px;height:13px;transform:rotate(24deg);" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          <div class="crs-dot light" style="left:8%;top:28%;width:6px;height:6px;"></div>
          <div class="crs-dot dark" style="left:13%;top:36%;width:10px;height:10px;"></div>
          <div class="crs-dot light" style="left:24%;top:14%;width:8px;height:8px;"></div>
          <div class="crs-dot dark" style="left:32%;top:30%;width:5px;height:5px;"></div>
          <div class="crs-dot light" style="left:42%;top:20%;width:7px;height:7px;"></div>
          <div class="crs-dot light" style="right:12%;top:22%;width:9px;height:9px;"></div>
          <div class="crs-dot dark" style="right:18%;top:34%;width:6px;height:6px;"></div>
          <div class="crs-dot light" style="right:24%;top:12%;width:5px;height:5px;"></div>
          <div class="crs-dot dark" style="left:16%;top:60%;width:7px;height:7px;"></div>
          <div class="crs-dot light" style="left:28%;top:54%;width:12px;height:12px;"></div>
          <div class="crs-dot dark" style="left:44%;top:68%;width:5px;height:5px;"></div>
          <div class="crs-dot light" style="right:16%;top:56%;width:10px;height:10px;"></div>
          <div class="crs-dot dark" style="right:30%;top:70%;width:6px;height:6px;"></div>
          <div class="crs-dot light" style="right:42%;top:80%;width:8px;height:8px;"></div>
          <div class="crs-dot dark" style="left:8%;bottom:14%;width:9px;height:9px;"></div>
          <div class="crs-dot light" style="left:20%;bottom:10%;width:6px;height:6px;"></div>
          <div class="crs-dot dark" style="right:10%;bottom:12%;width:7px;height:7px;"></div>
          <div class="crs-dot light" style="right:22%;bottom:6%;width:12px;height:12px;"></div>
        </div>

        <div class="crs-topbar">
          <div class="crs-back" id="crsBack"><svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg></div>
          <div class="crs-topbar-info">
            <div class="crs-topbar-name" id="crsName">Mizuki</div>
            <div class="crs-topbar-sub">角色设置</div>
          </div>
          <div class="crs-topbar-avatar" id="crsAvatar"></div>
        </div>

        <div class="crs-tabs">
          <div class="crs-tab active" data-sec="crsInfo"><svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>
          <div class="crs-tab" data-sec="crsPersona"><svg viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg></div>
          <div class="crs-tab" data-sec="crsChat"><svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg></div>
          <div class="crs-tab" data-sec="crsMem"><svg viewBox="0 0 24 24"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg><span class="crs-tab-dot"></span></div>
        </div>

        <div class="crs-scroll">
          <div class="crs-section active" id="crsInfo">
            <div class="crs-sec"><div class="crs-sec-line"></div><span class="crs-sec-text">基本</span></div>
            <div class="crs-card">
              <div class="crs-field"><div class="crs-field-label">备注名 · 仅影响列表和聊天室显示</div><input class="crs-input" id="crsInputName" placeholder="你给对方起的名字..."></div>
              <div class="crs-field"><div class="crs-field-label">签名</div><input class="crs-input" id="crsInputSub" placeholder="一句话介绍..."></div>
            </div>
            <div class="crs-sec"><div class="crs-sec-line"></div><span class="crs-sec-text">偏好</span></div>
            <div class="crs-card">
              <div class="crs-row"><div class="crs-row-icon"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2"/></svg></div><div class="crs-row-text"><div class="crs-row-t1">在线显示</div><div class="crs-row-t2">online status</div></div><div class="crs-row-right"><div class="crs-sw on"></div></div></div>
              <div class="crs-row"><div class="crs-row-icon"><svg viewBox="0 0 24 24"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg></div><div class="crs-row-text"><div class="crs-row-t1">消息通知</div><div class="crs-row-t2">notifications</div></div><div class="crs-row-right"><div class="crs-sw on"></div></div></div>
              <div class="crs-row"><div class="crs-row-icon"><svg viewBox="0 0 24 24"><path d="M12 2v10l4.5 4.5"/></svg></div><div class="crs-row-text"><div class="crs-row-t1">置顶聊天</div><div class="crs-row-t2">pin to top</div></div><div class="crs-row-right"><div class="crs-sw"></div></div></div>
              <div class="crs-row"><div class="crs-row-icon"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg></div><div class="crs-row-text"><div class="crs-row-t1">上下文轮数</div><div class="crs-row-t2">context rounds</div></div><div class="crs-row-right"><input class="crs-num-input" id="crsInputContextRounds" type="number" value="20" min="1" max="100"></div></div>
              <div class="crs-row"><div class="crs-row-icon"><svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 100 20 10 10 0 000-20z"/><path d="M2 12h20"/></svg></div><div class="crs-row-text"><div class="crs-row-t1">时间感知</div><div class="crs-row-t2">time awareness</div></div><div class="crs-row-right"><div class="crs-sw" id="crsSwTime2"></div></div></div>
            </div>
          </div>

          <div class="crs-section" id="crsPersona">
            <div class="crs-sec"><div class="crs-sec-line"></div><span class="crs-sec-text">角色</span></div>
            <div class="crs-card">
              <div class="crs-field"><div class="crs-field-label">角色名称 · AI 身份认同，不受备注影响</div><input class="crs-input" id="crsInputCharName" placeholder="角色叫什么..."></div>
              <div class="crs-field"><div class="crs-field-label">性格描述</div><textarea class="crs-textarea" id="crsInputDesc" placeholder="温柔、俏皮、占有欲..."></textarea></div>
              <div class="crs-field"><div class="crs-field-label">开场白</div><input class="crs-input" id="crsInputGreeting" placeholder="角色的第一句话..."></div>
            </div>
            <div class="crs-sec"><div class="crs-sec-line"></div><span class="crs-sec-text">系统提示词</span></div>
            <div class="crs-card">
              <div class="crs-field"><textarea class="crs-textarea" id="crsInputSystem" placeholder="System Prompt..." style="min-height:120px;"></textarea></div>
            </div>
            <div class="crs-sec"><div class="crs-sec-line"></div><span class="crs-sec-text">用户面具</span></div>
            <div class="crs-mask-card" id="crsMaskToggleRow" style="cursor:pointer;user-select:none;">
              <div class="crs-mask-avatar" id="crsMaskAvatarEl">?</div>
              <div class="crs-mask-info">
                <div class="crs-mask-name" id="crsMaskNameEl">未选择面具</div>
                <div class="crs-mask-desc" id="crsMaskDescEl">AI 将不知道你是谁</div>
              </div>
              <div class="crs-mask-change" id="crsMaskArrowEl" style="transition:transform 0.3s;">展开</div>
            </div>
            <div id="crsMaskExpandArea" style="max-height:0;overflow:hidden;transition:max-height 0.45s cubic-bezier(0.16,1,0.3,1);margin-top:0;">
              <div style="padding:8px 0 4px;display:flex;flex-direction:column;gap:6px;" id="crsMaskOptList"></div>
            </div>
          </div>

          <div class="crs-section" id="crsChat">
            <div class="crs-sec"><div class="crs-sec-line"></div><span class="crs-sec-text">消息</span></div>
            <div class="crs-card">
              <div class="crs-row"><div class="crs-row-icon"><svg viewBox="0 0 24 24"><path d="M12 2a3 3 0 00-3 3v7a3 3 0 006 0V5a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/></svg></div><div class="crs-row-text"><div class="crs-row-t1">提示音</div><div class="crs-row-t2">sound effect</div></div><div class="crs-row-right"><div class="crs-sw on"></div></div></div>
              <div class="crs-row"><div class="crs-row-icon"><svg viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></div><div class="crs-row-text"><div class="crs-row-t1">显示已读</div><div class="crs-row-t2">read receipts</div></div><div class="crs-row-right"><div class="crs-sw"></div></div></div>
              <div class="crs-row"><div class="crs-row-icon"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg></div><div class="crs-row-text"><div class="crs-row-t1">显示时间</div><div class="crs-row-t2">message timestamp</div></div><div class="crs-row-right"><div class="crs-sw on" id="crsSwTime"></div></div></div>
              <div class="crs-row"><div class="crs-row-icon"><svg viewBox="0 0 24 24"><path d="M4 7V4a2 2 0 012-2h8.5L20 7.5V20a2 2 0 01-2 2H6a2 2 0 01-2-2v-3"/><path d="M14 2v6h6"/><path d="M3 15h12"/></svg></div><div class="crs-row-text"><div class="crs-row-t1">气泡字号</div><div class="crs-row-t2">bubble font size</div></div><div class="crs-row-right"><input class="crs-num-input" id="crsInputFontSize" type="number" value="14" min="1" max="40"></div></div>
              <div class="crs-row" id="crsBgUploadRow" style="cursor:pointer;"><div class="crs-row-icon"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg></div><div class="crs-row-text"><div class="crs-row-t1">聊天背景</div><div class="crs-row-t2">chat background</div></div><div class="crs-row-right"><div id="crsBgThumb" style="width:28px;height:28px;border-radius:6px;background:#f0f0f3 center/cover no-repeat;border:1px solid rgba(0,0,0,0.06);"></div></div></div>
              <input type="file" accept="image/*" id="crsBgFile" style="display:none;">
              <div class="crs-row"><div class="crs-row-icon"><svg viewBox="0 0 24 24"><circle cx="8" cy="18" r="3"/><circle cx="5" cy="22" r="2"/><path d="M21 11a8 8 0 0 0-15 1"/></svg></div><div class="crs-row-text"><div class="crs-row-t1">气泡尾巴</div><div class="crs-row-t2">bubble tail</div></div><div class="crs-row-right"><div class="crs-sw on" id="crsSwTail"></div></div></div>
              <div class="crs-row"><div class="crs-row-icon"><svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="5" rx="2.5"/><rect x="4" y="11" width="16" height="5" rx="2.5"/><rect x="4" y="18" width="10" height="5" rx="2.5"/></svg></div><div class="crs-row-text"><div class="crs-row-t1">气泡堆叠</div><div class="crs-row-t2">stack bubbles</div></div><div class="crs-row-right"><div class="crs-sw" id="crsSwStack"></div></div></div>
            </div>
            <div class="crs-sec"><div class="crs-sec-line"></div><span class="crs-sec-text">自定义样式</span></div>
            <div class="crs-card">
              <div class="crs-field"><div class="crs-field-label">气泡 CSS（粘贴生成器导出的CSS）</div><textarea class="crs-textarea" id="crsInputBubbleCSS" placeholder="粘贴CSS到这里..." style="min-height:100px;font-family:monospace;font-size:10px;"></textarea></div>
            </div>
            <div class="crs-sec"><div class="crs-sec-line"></div><span class="crs-sec-text">动效</span></div>
            <div class="crs-card">
              <div class="crs-row"><div class="crs-row-icon"><svg viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg></div><div class="crs-row-text"><div class="crs-row-t1">消息动效</div><div class="crs-row-t2">message animation</div></div></div>
              <div class="crs-anim-opts" id="crsAnimOpts">
                <div class="crs-anim-opt active" data-anim="1"><svg viewBox="0 0 24 24"><path d="M12 19V5"/><path d="M5 12l7-7 7 7"/></svg><span>滑入</span></div>
                <div class="crs-anim-opt" data-anim="2"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2"/></svg><span>弹出</span></div>
                <div class="crs-anim-opt" data-anim="3"><svg viewBox="0 0 24 24"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg><span>方向</span></div>
                <div class="crs-anim-opt" data-anim="4"><svg viewBox="0 0 24 24"><path d="M4 20c2-4 4-14 8-14s6 10 8 14"/></svg><span>果冻</span></div>
                <div class="crs-anim-opt" data-anim="5"><svg viewBox="0 0 24 24"><path d="M4 12h4M12 12h4M20 12h1"/><circle cx="6" cy="12" r="1"/></svg><span>渐显</span></div>
              </div>
            </div>
            <div class="crs-sec"><div class="crs-sec-line"></div><span class="crs-sec-text">调取动画</span></div>
            <div class="crs-card">
              <div class="crs-row"><div class="crs-row-icon"><svg viewBox="0 0 24 24"><circle cx="6" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="18" cy="12" r="2"/></svg></div><div class="crs-row-text"><div class="crs-row-t1">打字指示器</div><div class="crs-row-t2">typing indicator style</div></div></div>
              <div class="crs-anim-opts" id="crsTypingOpts">
                <div class="crs-anim-opt active" data-typing="1"><svg viewBox="0 0 24 24"><circle cx="6" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="18" cy="12" r="2"/></svg><span>三点</span></div>
                <div class="crs-anim-opt" data-typing="2"><svg viewBox="0 0 24 24"><path d="M2 12c2-3 4 3 6 0s4 3 6 0s4 3 6 0"/></svg><span>波浪</span></div>
                <div class="crs-anim-opt" data-typing="3"><svg viewBox="0 0 24 24"><path d="M4 18V6M8 16V8M12 20V4M16 16V8M20 18V6"/></svg><span>脉冲</span></div>
                <div class="crs-anim-opt" data-typing="4"><svg viewBox="0 0 24 24"><path d="M5 12h10M17 8v8"/></svg><span>光标</span></div>
                <div class="crs-anim-opt" data-typing="5"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/></svg><span>圆环</span></div>
              </div>
            </div>
            <div class="crs-sec"><div class="crs-sec-line"></div><span class="crs-sec-text">危险</span></div>
            <div class="crs-card">
              <div class="crs-row" id="crsClearChat" style="cursor:pointer;"><div class="crs-row-icon"><svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg></div><div class="crs-row-text"><div class="crs-row-t1">清空聊天记录</div><div class="crs-row-t2">delete all messages</div></div><div class="crs-row-right"><svg viewBox="0 0 24 24" style="width:12px;height:12px;fill:none;stroke:#d8d8dd;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;"><path d="M9 6l6 6-6 6"/></svg></div></div>
            </div>
          </div>

          <div class="crs-section" id="crsMem">
            <div class="crs-sec"><div class="crs-sec-line"></div><span class="crs-sec-text">记忆库</span></div>
            <div class="crs-card">
              <div class="crs-row"><div class="crs-row-icon"><svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div><div class="crs-row-text"><div class="crs-row-t1">自动总结</div><div class="crs-row-t2">auto summarize</div></div><div class="crs-row-right"><div class="crs-sw" id="crsSwAutoSum"></div></div></div>
              <div class="crs-row"><div class="crs-row-icon"><svg viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h10"/></svg></div><div class="crs-row-text"><div class="crs-row-t1">滑落条数</div><div class="crs-row-t2">slide window</div></div><div class="crs-row-right"><input class="crs-num-input" id="crsMemSlideCount" type="number" value="30" min="5" max="200"></div></div>
            </div>
            <div class="crs-sec"><div class="crs-sec-line"></div><span class="crs-sec-text">操作</span></div>
            <div class="crs-card">
              <div class="crs-mem-row"><svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg><div class="crs-mem-label">手动总结</div><div class="crs-mem-arrow"><svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg></div></div>
              <div class="crs-mem-row"><svg viewBox="0 0 24 24"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg><div class="crs-mem-label">进入记忆库</div><div class="crs-mem-arrow"><svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg></div></div>
            </div>
          </div>

        </div>
      </div>
    `;
  }

  // ── 读取激活面具 ──
  async function getActiveMask() {
    try {
      const activeId = await HomeDB.getItem('wp_active_mask_id');
      if (!activeId) return null;
      const masks = await HomeDB.getItem('wp_user_masks_v1');
      if (!Array.isArray(masks)) return null;
      return masks.find(x => x.id === activeId) || null;
    } catch(e) { return null; }
  }

  async function getAllMasks() {
    try {
      const masks = await HomeDB.getItem('wp_user_masks_v1');
      return Array.isArray(masks) ? masks : [];
    } catch(e) { return []; }
  }

  // ── 渲染面具卡片 ──
  async function renderMaskCard() {
    const card = document.querySelector('.crs-mask-card');
    if (!card) return;
    const mask = await getActiveMask();
    const avatarEl = card.querySelector('.crs-mask-avatar');
    const nameEl = card.querySelector('.crs-mask-name');
    const descEl = card.querySelector('.crs-mask-desc');
    if (mask) {
      if (mask.avatar) {
        avatarEl.style.cssText = `width:36px;height:36px;border-radius:50%;background:url('${mask.avatar}') center/cover no-repeat;border:1px solid rgba(0,0,0,0.03);flex-shrink:0;`;
        avatarEl.textContent = '';
      } else {
        avatarEl.style.cssText = '';
        avatarEl.textContent = (mask.nick||'?').charAt(0);
      }
      nameEl.textContent = mask.nick || '未命名面具';
      descEl.textContent = (mask.persona || '').substring(0, 30) + (mask.persona && mask.persona.length > 30 ? '…' : '') || 'AI 将了解你的身份';
    } else {
      avatarEl.style.cssText = '';
      avatarEl.textContent = '?';
      nameEl.textContent = '未选择面具';
      descEl.textContent = 'AI 将不知道你是谁';
    }
  }

  // ── 面具选择器 Sheet ──
  async function openMaskPicker() {
    const existing = document.getElementById('crsMaskSheet');
    if (existing) existing.parentNode.removeChild(existing);

    const masks = await getAllMasks();
    const activeId = (await HomeDB.getItem('wp_active_mask_id')) || '';

    const sheet = document.createElement('div');
    sheet.id = 'crsMaskSheet';
    sheet.style.cssText = 'position:absolute;inset:0;z-index:500;background:rgba(0,0,0,0);display:flex;align-items:flex-end;justify-content:center;transition:background 0.35s;';

    const inner = document.createElement('div');
    inner.style.cssText = 'width:100%;background:rgba(250,249,255,0.97);backdrop-filter:blur(40px);-webkit-backdrop-filter:blur(40px);border-radius:20px 20px 0 0;padding:8px 16px 36px;transform:translateY(100%);transition:transform 0.4s cubic-bezier(0.16,1,0.3,1);border-top:0.5px solid rgba(255,255,255,0.8);max-height:70%;overflow-y:auto;';

    const noneActive = activeId === '';
    let html = `
      <div style="width:32px;height:4px;border-radius:2px;background:#e0e0e5;margin:10px auto 14px;"></div>
      <div style="font-size:13px;font-weight:800;color:#1c1c1e;margin-bottom:14px;letter-spacing:-0.3px;">切换面具</div>
      <div style="background:rgba(255,255,255,0.7);border-radius:12px;overflow:hidden;border:0.5px solid rgba(0,0,0,0.05);">
        <div class="crs-mask-opt" data-mask-id="" style="display:flex;align-items:center;gap:10px;padding:12px 12px;cursor:pointer;${noneActive?'background:rgba(181,200,171,0.08);':''}">
          <div style="width:16px;height:16px;border-radius:50%;border:1.5px solid ${noneActive?'#b5c8ab':'rgba(0,0,0,0.1)'};flex-shrink:0;display:flex;align-items:center;justify-content:center;box-sizing:border-box;">
            ${noneActive?'<div style="width:8px;height:8px;border-radius:50%;background:linear-gradient(135deg,#b5c8ab,#9ab891);"></div>':''}
          </div>
          <div style="flex:1;">
            <div style="font-size:12px;font-weight:600;color:#bbb;">不使用面具</div>
            <div style="font-size:9px;color:#ccc;margin-top:1px;">AI 将不了解你是谁</div>
          </div>
        </div>
    `;

    masks.forEach((m, i) => {
      const isActive = m.id === activeId;
      const avHtml = m.avatar
        ? `<div style="width:34px;height:34px;border-radius:50%;background:url('${m.avatar}') center/cover no-repeat;flex-shrink:0;"></div>`
        : `<div style="width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,#c8d0e8,#b0bcd8);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;color:#fff;flex-shrink:0;">${(m.nick||'?').charAt(0)}</div>`;
      const sep = i > 0 || true ? 'border-top:0.5px solid rgba(0,0,0,0.04);' : '';
      html += `
        <div class="crs-mask-opt" data-mask-id="${m.id}" style="display:flex;align-items:center;gap:10px;padding:11px 12px;cursor:pointer;${sep}${isActive?'background:rgba(181,200,171,0.08);':''}">
          <div style="width:16px;height:16px;border-radius:50%;border:1.5px solid ${isActive?'#b5c8ab':'rgba(0,0,0,0.1)'};flex-shrink:0;display:flex;align-items:center;justify-content:center;box-sizing:border-box;">
            ${isActive?'<div style="width:8px;height:8px;border-radius:50%;background:linear-gradient(135deg,#b5c8ab,#9ab891);"></div>':''}
          </div>
          ${avHtml}
          <div style="flex:1;min-width:0;">
            <div style="font-size:12px;font-weight:700;color:#333;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${m.nick||'未命名'}</div>
            <div style="font-size:9px;color:#bbb;margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${(m.persona||'').substring(0,24)}${m.persona&&m.persona.length>24?'…':''}</div>
          </div>
        </div>
      `;
    });

    if (masks.length === 0) {
      html += `<div style="text-align:center;padding:20px;font-size:11px;color:#ccc;">请先在 Me → Moments 创建面具</div>`;
    }

    html += `</div>
      <div style="margin-top:10px;height:44px;border-radius:12px;background:rgba(255,255,255,0.6);border:0.5px solid rgba(0,0,0,0.06);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;font-weight:600;color:#bbb;" id="crsMaskSheetCancel">取消</div>
    `;

    inner.innerHTML = html;
    sheet.appendChild(inner);

    const screenEl = document.querySelector('.phone-screen');
    if (screenEl) screenEl.appendChild(sheet);
    else panel.appendChild(sheet);

    requestAnimationFrame(() => {
      sheet.style.background = 'rgba(0,0,0,0.18)';
      inner.style.transform = 'translateY(0)';
    });

    function closeSheet() {
      sheet.style.background = 'rgba(0,0,0,0)';
      inner.style.transform = 'translateY(100%)';
      setTimeout(() => { if (sheet.parentNode) sheet.parentNode.removeChild(sheet); }, 400);
    }

    sheet.addEventListener('click', e => { if (e.target === sheet) closeSheet(); });
    inner.querySelector('#crsMaskSheetCancel').addEventListener('click', e => { e.stopPropagation(); closeSheet(); });

    inner.querySelectorAll('.crs-mask-opt').forEach(opt => {
      opt.addEventListener('click', async e => {
        e.stopPropagation();
        const mid = opt.dataset.maskId;
        await HomeDB.setItem('wp_active_mask_id', mid || null);
        // 同步 Me 界面头像
        const masks2 = await getAllMasks();
        const activated = masks2.find(x => x.id === mid);
        const avatarUrl = (activated && activated.avatar) ? activated.avatar : '';
        const chatListPanel = document.getElementById('chatListPanel');
        if (chatListPanel) {
          const postImg = chatListPanel.querySelector('.cl-me-uc-post-img');
          if (postImg) { postImg.style.backgroundImage = avatarUrl ? `url("${avatarUrl}")` : ''; postImg.style.backgroundSize = 'cover'; postImg.style.backgroundPosition = 'center'; }
          const tpAvatar = chatListPanel.querySelector('.cl-tp-avatar');
          if (tpAvatar) { tpAvatar.style.backgroundImage = avatarUrl ? `url("${avatarUrl}")` : ''; tpAvatar.style.backgroundSize = 'cover'; tpAvatar.style.backgroundPosition = 'center'; }
        }
        closeSheet();
        await renderMaskCard();
      });
    });
  }

  function init() {
    if (!document.getElementById('crsStyles')) {
      const s = document.createElement('style');
      s.id = 'crsStyles';
      s.textContent = CSS;
      document.head.appendChild(s);
    }
    const screen = document.querySelector('.phone-screen');
    if (screen) screen.insertAdjacentHTML('beforeend', buildHTML());
    panel = document.getElementById('crsPage');

    document.getElementById('crsBack').addEventListener('click', (e) => {
      e.stopPropagation();
      close();
    });

    panel.querySelectorAll('.crs-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        e.stopPropagation();
        panel.querySelectorAll('.crs-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        panel.querySelectorAll('.crs-section').forEach(s => s.classList.remove('active'));
        const sec = document.getElementById(tab.dataset.sec);
        if (sec) sec.classList.add('active');
      });
    });

    panel.querySelectorAll('.crs-sw').forEach(sw => {
      if (sw.id === 'crsSwTail' || sw.id === 'crsSwStack' || sw.id === 'crsSwTime') return;
      sw.addEventListener('click', (e) => {
        e.stopPropagation();
        sw.classList.toggle('on');
      });
    });

    // 实时保存（备注名不实时写入 contact.name，仅在关闭时判断是否变更）
    panel.querySelectorAll('input, textarea').forEach(el => {
      el.addEventListener('input', () => {
        if (currentContact) {
          currentContact.sub = document.getElementById('crsInputSub').value;
          currentContact.charName = document.getElementById('crsInputCharName').value;
          currentContact.description = document.getElementById('crsInputDesc').value;
          currentContact.greeting = document.getElementById('crsInputGreeting').value;
          currentContact.systemPrompt = document.getElementById('crsInputSystem').value;
          const ctxEl = document.getElementById('crsInputContextRounds');
          if (ctxEl) {
            const v = parseInt(ctxEl.value, 10);
            if (!isNaN(v) && v > 0) currentContact.contextRounds = v;
          }
          const fontEl = document.getElementById('crsInputFontSize');
          if (fontEl) {
            const fv = parseInt(fontEl.value, 10);
            if (!isNaN(fv) && fv >= 1 && fv <= 40) currentContact.fontSize = fv;
          }
          // 顶栏预览跟随输入
          const nameVal = document.getElementById('crsInputName').value;
          document.getElementById('crsName').textContent = nameVal || currentContact.name || '未命名';
        }
      });
    });

    // 移除头像上传事件（仅展示）
    const avatarEl = document.getElementById('crsAvatar');
    if (avatarEl) { avatarEl.style.cursor = 'default'; }

    // 清空聊天记录 → 内置确认弹窗
    const clearBtn = document.getElementById('crsClearChat');
    if (clearBtn) {
      clearBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        showClearConfirm();
      });
    }

    // 动效选择
    const animOpts = document.getElementById('crsAnimOpts');
    if (animOpts) {
      animOpts.addEventListener('click', (e) => {
        e.stopPropagation();
        const opt = e.target.closest('.crs-anim-opt');
        if (!opt) return;
        animOpts.querySelectorAll('.crs-anim-opt').forEach(o => o.classList.remove('active'));
        opt.classList.add('active');
        if (currentContact) {
          currentContact.msgAnim = parseInt(opt.dataset.anim, 10) || 1;
          refreshChatroom();
        }
      });
    }

    // 调取动画选择
    const typingOpts = document.getElementById('crsTypingOpts');
    if (typingOpts) {
      typingOpts.addEventListener('click', (e) => {
        e.stopPropagation();
        const opt = e.target.closest('.crs-anim-opt');
        if (!opt) return;
        typingOpts.querySelectorAll('.crs-anim-opt').forEach(o => o.classList.remove('active'));
        opt.classList.add('active');
        if (currentContact) {
          currentContact.typingStyle = parseInt(opt.dataset.typing, 10) || 1;
          autoSave();
        }
      });
    }

    // 字号
    const fontInput = document.getElementById('crsInputFontSize');
    if (fontInput) {
      const handleFont = () => {
        if (currentContact) {
          const v = parseInt(fontInput.value, 10);
          if (!isNaN(v) && v >= 1 && v <= 40) {
            currentContact.fontSize = v;
            refreshChatroom();
            autoSave();
          }
        }
      };
      fontInput.addEventListener('input', handleFont);
      fontInput.addEventListener('change', handleFont);
    }

    // 背景上传
    const bgRow = document.getElementById('crsBgUploadRow');
    const bgFile = document.getElementById('crsBgFile');
    if (bgRow && bgFile) {
      bgRow.addEventListener('click', (e) => {
        e.stopPropagation();
        bgFile.click();
      });
      bgFile.addEventListener('change', () => {
        const file = bgFile.files && bgFile.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
          if (currentContact) {
            currentContact.chatBg = reader.result;
            const thumb = document.getElementById('crsBgThumb');
            if (thumb) thumb.style.backgroundImage = `url('${reader.result}')`;
            refreshChatroom();
            autoSave();
          }
        };
        reader.readAsDataURL(file);
        bgFile.value = '';
      });
    }

    // 气泡CSS
    const bubbleCSSInput = document.getElementById('crsInputBubbleCSS');
    if (bubbleCSSInput) {
      bubbleCSSInput.addEventListener('input', () => {
        if (currentContact) {
          currentContact.bubbleCSS = bubbleCSSInput.value;
          applyBubbleCSS(bubbleCSSInput.value);
          autoSave();
        }
      });
    }

    // 尾巴开关
    const swTail = document.getElementById('crsSwTail');
    if (swTail) {
      swTail.addEventListener('click', (e) => {
        e.stopPropagation();
        swTail.classList.toggle('on');
        if (currentContact) {
          currentContact.showTail = swTail.classList.contains('on');
          refreshChatroom();
          autoSave();
        }
      });
    }
    // 堆叠开关
    const swStack = document.getElementById('crsSwStack');
    if (swStack) {
      swStack.addEventListener('click', (e) => {
        e.stopPropagation();
        swStack.classList.toggle('on');
        if (currentContact) {
          currentContact.stackBubbles = swStack.classList.contains('on');
          refreshChatroom();
          autoSave();
        }
      });
    }
    // 时间开关
    const swTime = document.getElementById('crsSwTime');
    if (swTime) {
      swTime.addEventListener('click', (e) => {
        e.stopPropagation();
        swTime.classList.toggle('on');
        if (currentContact) {
          currentContact.showTime = swTime.classList.contains('on');
          refreshChatroom();
          autoSave();
        }
      });
    }

    // 时间感知开关
    const swTime2 = document.getElementById('crsSwTime2');
    if (swTime2) {
      swTime2.addEventListener('click', (e) => {
        e.stopPropagation();
        swTime2.classList.toggle('on');
        if (currentContact) {
          currentContact.timeAware = swTime2.classList.contains('on');
          autoSave();
        }
      });
    }

    // 自动总结开关
    const swAutoSum = document.getElementById('crsSwAutoSum');
    if (swAutoSum) {
      swAutoSum.addEventListener('click', (e) => {
        e.stopPropagation();
        swAutoSum.classList.toggle('on');
        if (currentContact) {
          currentContact.autoSummary = swAutoSum.classList.contains('on');
          autoSave();
        }
      });
    }

    // 手动总结 + 进入记忆库
    panel.querySelectorAll('.crs-mem-row').forEach((row, i) => {
      if (i === 0) { // 第一个 mem-row 是"手动总结"
        row.addEventListener('click', (e) => {
          e.stopPropagation();
          if (currentContact && window.MemoryPage) {
            showManualSummaryModal();
          }
        });
      }
      if (i === 1) { // 第二个 mem-row 是"进入记忆库"
        row.addEventListener('click', (e) => {
          e.stopPropagation();
          if (currentContact && window.MemoryPage) {
            window.MemoryPage.open(currentContact.id);
          }
        });
      }
    });

    // 面具卡片点击 → 展开/折叠
    let crsMaskExpanded = false;
    const crsMaskToggleRow = panel.querySelector('#crsMaskToggleRow');
    const crsMaskExpandArea = panel.querySelector('#crsMaskExpandArea');
    const crsMaskArrowEl = panel.querySelector('#crsMaskArrowEl');

    async function renderMaskExpand() {
      const masks = await getAllMasks();
      const activeId = (await HomeDB.getItem('wp_active_mask_id')) || '';
      const listEl = panel.querySelector('#crsMaskOptList');
      if (!listEl) return;

      let html = `
        <div class="crs-mask-opt-item" data-mask-id="" style="display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:12px;cursor:pointer;background:${activeId===''?'rgba(181,200,171,0.08)':'rgba(255,255,255,0.6)'};border:1px solid ${activeId===''?'rgba(181,200,171,0.3)':'rgba(0,0,0,0.04)'};margin-bottom:2px;">
          <div style="width:16px;height:16px;border-radius:50%;border:1.5px solid ${activeId===''?'#b5c8ab':'#ddd'};flex-shrink:0;display:flex;align-items:center;justify-content:center;box-sizing:border-box;">
            ${activeId===''?'<div style="width:8px;height:8px;border-radius:50%;background:#b5c8ab;"></div>':''}
          </div>
          <div style="flex:1;"><div style="font-size:12px;font-weight:600;color:#bbb;">不使用面具</div><div style="font-size:9px;color:#ccc;margin-top:1px;">AI 将不了解你是谁</div></div>
        </div>
      `;

      masks.forEach((m) => {
        const isActive = m.id === activeId;
        const avStyle = m.avatar ? `background:url('${m.avatar}') center/cover no-repeat;` : 'background:linear-gradient(135deg,#c8d0e8,#b0bcd8);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;color:#fff;';
        const avInner = m.avatar ? '' : (m.nick||'?').charAt(0);
        html += `
          <div class="crs-mask-opt-item" data-mask-id="${m.id}" style="display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:12px;cursor:pointer;background:${isActive?'rgba(181,200,171,0.08)':'rgba(255,255,255,0.6)'};border:1px solid ${isActive?'rgba(181,200,171,0.3)':'rgba(0,0,0,0.04)'};margin-bottom:2px;">
            <div style="width:16px;height:16px;border-radius:50%;border:1.5px solid ${isActive?'#b5c8ab':'#ddd'};flex-shrink:0;display:flex;align-items:center;justify-content:center;box-sizing:border-box;">
              ${isActive?'<div style="width:8px;height:8px;border-radius:50%;background:#b5c8ab;"></div>':''}
            </div>
            <div style="width:32px;height:32px;border-radius:50%;flex-shrink:0;${avStyle}">${avInner}</div>
            <div style="flex:1;min-width:0;">
              <div style="font-size:12px;font-weight:700;color:#333;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${m.nick||'未命名'}</div>
              <div style="font-size:9px;color:#bbb;margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${(m.persona||'').substring(0,28)}${m.persona&&m.persona.length>28?'…':''}</div>
            </div>
          </div>
        `;
      });

      if (masks.length === 0) {
        html += `<div style="text-align:center;padding:14px;font-size:11px;color:#ccc;">请先在 Me → Moments 创建面具</div>`;
      }

      listEl.innerHTML = html;

      listEl.querySelectorAll('.crs-mask-opt-item').forEach(opt => {
        opt.addEventListener('click', async e => {
          e.stopPropagation();
          const mid = opt.dataset.maskId;
          await HomeDB.setItem('wp_active_mask_id', mid || null);
          // 同步 Me 界面头像
          const masks2 = await getAllMasks();
          const activated = masks2.find(x => x.id === mid);
          const avatarUrl = (activated && activated.avatar) ? activated.avatar : '';
          const chatListPanel = document.getElementById('chatListPanel');
          if (chatListPanel) {
            const postImg = chatListPanel.querySelector('.cl-me-uc-post-img');
            if (postImg) { postImg.style.backgroundImage = avatarUrl ? `url("${avatarUrl}")` : ''; postImg.style.backgroundSize = 'cover'; postImg.style.backgroundPosition = 'center'; }
            const tpAvatar = chatListPanel.querySelector('.cl-tp-avatar');
            if (tpAvatar) { tpAvatar.style.backgroundImage = avatarUrl ? `url("${avatarUrl}")` : ''; tpAvatar.style.backgroundSize = 'cover'; tpAvatar.style.backgroundPosition = 'center'; }
          }
          await renderMaskCard();
          await renderMaskExpand();
        });
      });
    }

    if (crsMaskToggleRow) {
      crsMaskToggleRow.addEventListener('click', async e => {
        e.stopPropagation();
        crsMaskExpanded = !crsMaskExpanded;
        if (crsMaskExpanded) {
          await renderMaskExpand();
          crsMaskExpandArea.style.maxHeight = '500px';
          crsMaskArrowEl.textContent = '收起';
          crsMaskArrowEl.style.transform = 'rotate(0deg)';
        } else {
          crsMaskExpandArea.style.maxHeight = '0';
          crsMaskArrowEl.textContent = '展开';
        }
      });
    }

    // 监听聊天室打开 → 重新渲染持久化的备注通知 + 同步字号
    const _crChatroom = document.getElementById('clChatroom');
    if (_crChatroom) {
      new MutationObserver(() => {
        if (_crChatroom.classList.contains('open')) {
          setTimeout(() => {
            const c = window.currentChatContact || currentContact;
            if (c) {
              const fs = c.fontSize || 14;
              let s = document.getElementById('_bubbleFsStyle');
              if (!s) { s = document.createElement('style'); s.id = '_bubbleFsStyle'; document.head.appendChild(s); }
              s.textContent = '.cl-msg-bubble{font-size:' + fs + 'px!important;}#clChatroomInput{font-size:' + fs + 'px!important;}';
              // 同步尾巴、堆叠、时间
              const container = document.querySelector('.cl-chatroom-messages');
              if (container) {
                container.classList.toggle('tail-off', c.showTail === false);
                container.classList.toggle('stack-on', !!c.stackBubbles);
                container.classList.toggle('time-off', c.showTime === false);
                const animVal = c.msgAnim || 1;
                container.classList.remove('msg-anim-1','msg-anim-2','msg-anim-3','msg-anim-4','msg-anim-5');
                container.classList.add('msg-anim-' + animVal);
              }
              // 同步背景
              const bg = document.querySelector('.cl-chatroom-bg');
              if (bg && c.chatBg) {
                bg.style.backgroundImage = "url('" + c.chatBg + "')";
              }
              // 同步气泡CSS
              applyBubbleCSS(c.bubbleCSS || '');
            }
          }, 100);
        }
      }).observe(_crChatroom, { attributes: true, attributeFilter: ['class'] });
    }
  }

  function open(contact) {
    if (!panel) init();
    currentContact = contact;
    if (contact) {
      document.getElementById('crsName').textContent = contact.name || '未命名';
      document.getElementById('crsAvatar').style.backgroundImage = contact.avatar ? `url('${contact.avatar}')` : 'none';
      document.getElementById('crsInputName').value = contact.name || '';
      document.getElementById('crsInputSub').value = contact.sub || '';
      document.getElementById('crsInputCharName').value = contact.charName || contact.name || '';
      document.getElementById('crsInputDesc').value = contact.description || '';
      document.getElementById('crsInputGreeting').value = contact.greeting || '';
      document.getElementById('crsInputSystem').value = contact.systemPrompt || '';
      const ctxEl = document.getElementById('crsInputContextRounds');
      if (ctxEl) ctxEl.value = contact.contextRounds || 20;
      // 回填动效
      const animOpts = document.getElementById('crsAnimOpts');
      if (animOpts) {
        const cur = contact.msgAnim || 1;
        animOpts.querySelectorAll('.crs-anim-opt').forEach(o => {
          o.classList.toggle('active', parseInt(o.dataset.anim, 10) === cur);
        });
      }
      // 回填调取动画
      const typingOpts = document.getElementById('crsTypingOpts');
      if (typingOpts) {
        const curTyping = contact.typingStyle || 1;
        typingOpts.querySelectorAll('.crs-anim-opt').forEach(o => {
          o.classList.toggle('active', parseInt(o.dataset.typing, 10) === curTyping);
        });
      }
      // 回填时间感知
      const swTime2 = document.getElementById('crsSwTime2');
      if (swTime2) swTime2.classList.toggle('on', !!contact.timeAware);
      // 回填自动总结
      const swAutoSum = document.getElementById('crsSwAutoSum');
      if (swAutoSum) swAutoSum.classList.toggle('on', !!contact.autoSummary);
      // 回填尾巴和堆叠
      const swTail = document.getElementById('crsSwTail');
      if (swTail) swTail.classList.toggle('on', contact.showTail !== false);
      const swStack = document.getElementById('crsSwStack');
      if (swStack) swStack.classList.toggle('on', !!contact.stackBubbles);
      const swTime = document.getElementById('crsSwTime');
      if (swTime) swTime.classList.toggle('on', contact.showTime !== false);
      // 回填字号
      const fontInput = document.getElementById('crsInputFontSize');
      if (fontInput) fontInput.value = contact.fontSize || 14;
      // 回填背景缩略图
      const bgThumb = document.getElementById('crsBgThumb');
      if (bgThumb) bgThumb.style.backgroundImage = contact.chatBg ? `url('${contact.chatBg}')` : 'none';
      // 回填滑落条数
      const slideEl = document.getElementById('crsMemSlideCount');
      if (slideEl) slideEl.value = contact.memSlideCount || 30;
      // 回填气泡CSS
      const bubbleCSSInput = document.getElementById('crsInputBubbleCSS');
      if (bubbleCSSInput) bubbleCSSInput.value = contact.bubbleCSS || '';
    }
    panel.classList.add('open');
    // 打开时刷新面具卡片
    renderMaskCard();
  }

  // 内置清空确认弹窗（替代系统 confirm）
  function showClearConfirm() {
    if (!currentContact) return;
    const existing = document.getElementById('crsClearConfirm');
    if (existing) existing.parentNode.removeChild(existing);

    const overlay = document.createElement('div');
    overlay.id = 'crsClearConfirm';
    overlay.style.cssText = 'position:absolute;inset:0;z-index:600;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0);transition:background 0.25s;';

    const box = document.createElement('div');
    box.style.cssText = 'width:78%;max-width:280px;background:rgba(252,252,255,0.97);backdrop-filter:blur(40px);-webkit-backdrop-filter:blur(40px);border-radius:18px;padding:22px 20px 14px;border:0.5px solid rgba(255,255,255,0.8);box-shadow:0 12px 40px rgba(0,0,0,0.18);transform:scale(0.9);opacity:0;transition:transform 0.28s cubic-bezier(0.34,1.56,0.64,1),opacity 0.22s;text-align:center;';

    const safeName = (currentContact.name || '该角色').replace(/[<>&"']/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&#39;'}[c]));
    box.innerHTML = `
      <div style="font-size:14px;font-weight:800;color:#1c1c1e;margin-bottom:6px;letter-spacing:-0.2px;">清空聊天记录</div>
      <div style="font-size:11px;color:#888;line-height:1.6;margin-bottom:18px;">该操作不可撤销，将删除与<br><span style="color:#1c1c1e;font-weight:600;">${safeName}</span>的所有消息记录</div>
      <div style="display:flex;gap:8px;">
        <div id="crsClearCancel" style="flex:1;height:40px;border-radius:11px;background:rgba(0,0,0,0.04);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:600;color:#999;cursor:pointer;">取消</div>
        <div id="crsClearOk" style="flex:1;height:40px;border-radius:11px;background:linear-gradient(135deg,#e89090,#d07070);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:#fff;cursor:pointer;box-shadow:0 3px 10px rgba(208,112,112,0.28);">清空</div>
      </div>
    `;

    overlay.appendChild(box);
    const screen = document.querySelector('.phone-screen');
    if (screen) screen.appendChild(overlay);
    else panel.appendChild(overlay);

    requestAnimationFrame(() => {
      overlay.style.background = 'rgba(0,0,0,0.32)';
      box.style.transform = 'scale(1)';
      box.style.opacity = '1';
    });

    function closeBox() {
      overlay.style.background = 'rgba(0,0,0,0)';
      box.style.transform = 'scale(0.9)';
      box.style.opacity = '0';
      setTimeout(() => { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); }, 260);
    }

    overlay.addEventListener('click', e => { if (e.target === overlay) closeBox(); });
    box.querySelector('#crsClearCancel').addEventListener('click', e => { e.stopPropagation(); closeBox(); });
    box.querySelector('#crsClearOk').addEventListener('click', async e => {
      e.stopPropagation();
      if (window.ContactsPage && typeof window.ContactsPage.clearContactMessages === 'function') {
        await window.ContactsPage.clearContactMessages(currentContact.id);
        currentContact.messages = [];
      }
      closeBox();
      // 清空成功提示
      const toast = document.createElement('div');
      toast.textContent = '已清空';
      toast.style.cssText = 'position:absolute;left:50%;bottom:80px;transform:translateX(-50%) translateY(8px);background:rgba(40,40,45,0.85);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);color:#fff;font-size:11px;font-weight:600;padding:7px 18px;border-radius:50px;z-index:1200;opacity:0;transition:opacity 0.22s,transform 0.22s;pointer-events:none;';
      const sc = document.querySelector('.phone-screen');
      if (sc) sc.appendChild(toast);
      requestAnimationFrame(() => { toast.style.opacity = '1'; toast.style.transform = 'translateX(-50%) translateY(0)'; });
      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) translateY(8px)';
        setTimeout(() => { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 250);
      }, 1500);
    });
  }

  function applyBubbleCSS(css) {
    let s = document.getElementById('_customBubbleCSS');
    if (!s) { s = document.createElement('style'); s.id = '_customBubbleCSS'; document.head.appendChild(s); }
    s.textContent = css || '';
    const defaultStyle = document.getElementById('chatListStyles');
    if (defaultStyle) {
      if (css && css.trim()) {
        defaultStyle.dataset.bubbleOff = '1';
        if (!document.getElementById('_defaultBubbleOff')) {
          const off = document.createElement('style');
          off.id = '_defaultBubbleOff';
          off.textContent = '.cl-msg-row:nth-child(11n+1).right .cl-msg-bubble,.cl-msg-row:nth-child(11n+2).right .cl-msg-bubble,.cl-msg-row:nth-child(11n+3).right .cl-msg-bubble,.cl-msg-row:nth-child(11n+4).right .cl-msg-bubble,.cl-msg-row:nth-child(11n+5).right .cl-msg-bubble,.cl-msg-row:nth-child(11n+6).right .cl-msg-bubble,.cl-msg-row:nth-child(11n+7).right .cl-msg-bubble,.cl-msg-row:nth-child(11n+8).right .cl-msg-bubble,.cl-msg-row:nth-child(11n+9).right .cl-msg-bubble,.cl-msg-row:nth-child(11n+10).right .cl-msg-bubble,.cl-msg-row:nth-child(11n+11).right .cl-msg-bubble{background:unset!important}.cl-msg-row.left .cl-msg-bubble{background:unset!important;border:unset!important;box-shadow:unset!important;border-radius:unset!important;padding:unset!important;color:unset!important}.cl-msg-row.right .cl-msg-bubble{background:unset!important;border:unset!important;box-shadow:unset!important;border-radius:unset!important;padding:unset!important;color:unset!important}.cl-msg-row.left .cl-msg-bubble::after{display:block!important}.cl-msg-row.right .cl-msg-bubble::after{display:block!important}';
          document.head.appendChild(off);
        }
      } else {
        delete defaultStyle.dataset.bubbleOff;
        const off = document.getElementById('_defaultBubbleOff');
        if (off) off.remove();
      }
    }
  }

  let _autoSaveTimer = null;
  function autoSave() {
    if (_autoSaveTimer) clearTimeout(_autoSaveTimer);
    _autoSaveTimer = setTimeout(() => {
      if (currentContact && window.ContactsPage && window.ContactsPage.saveContact) {
        window.ContactsPage.saveContact(currentContact);
      }
    }, 600);
  }

  function refreshChatroom() {
    const container = document.querySelector('.cl-chatroom-messages');
    if (!container || !currentContact) return;
    // 直接更新 container 上的 class，不重新渲染 DOM
    const animVal = currentContact.msgAnim || 1;
    container.classList.remove('msg-anim-1','msg-anim-2','msg-anim-3','msg-anim-4','msg-anim-5');
    container.classList.add('msg-anim-' + animVal);
    container.classList.toggle('tail-off', currentContact.showTail === false);
    container.classList.toggle('stack-on', !!currentContact.stackBubbles);
    container.classList.toggle('time-off', currentContact.showTime === false);
    // 字号（气泡 + 输入栏同步）
    const fs = currentContact.fontSize || 14;
    let s = document.getElementById('_bubbleFsStyle');
    if (!s) { s = document.createElement('style'); s.id = '_bubbleFsStyle'; document.head.appendChild(s); }
              s.textContent = '.cl-msg-bubble{font-size:' + fs + 'px!important;}#clChatroomInput{font-size:' + fs + 'px!important;}';
    // 背景
    const bg = document.querySelector('.cl-chatroom-bg');
    if (bg && currentContact.chatBg) {
      bg.style.backgroundImage = `url('${currentContact.chatBg}')`;
    }
    // 气泡CSS
    applyBubbleCSS(currentContact.bubbleCSS || '');
  }

  function showSavedToast() {
    let toast = document.getElementById('crsSavedToast');
    if (toast) toast.parentNode.removeChild(toast);
    
    toast = document.createElement('div');
    toast.id = 'crsSavedToast';
    toast.textContent = 'Settings saved';
    toast.style.cssText = 'position:absolute; left:50%; bottom:65px; transform:translateX(-50%) translateY(10px);' +
      'background:#9a9a9e; border:1px solid #7a7a7e; color:#fff;' +
      'font-size:12px; font-weight:600; letter-spacing:0.4px;' +
      'padding:9px 20px; border-radius:50px; z-index:1200;' +
      'box-shadow:0 4px 16px rgba(0,0,0,0.08);' +
      'opacity:0; transition:opacity 0.25s ease, transform 0.25s ease;' +
      'pointer-events:none; font-family:-apple-system,BlinkMacSystemFont,sans-serif;';
      
    const screen = document.querySelector('.phone-screen');
    if (screen) screen.appendChild(toast);

    requestAnimationFrame(() => {
      toast.style.opacity = '0.45';
      toast.style.transform = 'translateX(-50%) translateY(0)';
    });

    setTimeout(() => {
      if (toast) {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) translateY(10px)';
        setTimeout(() => { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 300);
      }
    }, 1600);
  }

  function showManualSummaryModal() {
    if (!currentContact) return;
    const existing = document.getElementById('crsManualSumModal');
    if (existing) existing.remove();

    // 读取上次总结信息
    const lastSumKey = 'byeol_last_summary_' + currentContact.id;
    let lastInfo = null;
    try { lastInfo = JSON.parse(localStorage.getItem(lastSumKey)); } catch(e) {}
    const totalMsgs = (currentContact.messages || []).length;
    const lastCount = lastInfo ? lastInfo.msgCount : 0;
    const newMsgs = totalMsgs - lastCount;
    const lastDate = lastInfo ? lastInfo.date : '从未总结';

    const overlay = document.createElement('div');
    overlay.id = 'crsManualSumModal';
    overlay.style.cssText = 'position:absolute;inset:0;z-index:600;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0);transition:background .25s;';

    overlay.innerHTML = `
      <div id="crsManualSumBox" style="width:80%;max-width:300px;background:#fff;border-radius:22px;padding:22px 20px 18px;box-shadow:0 14px 44px rgba(0,0,0,.15);transform:scale(.92);opacity:0;transition:transform .28s cubic-bezier(.34,1.56,.64,1),opacity .22s;position:relative;overflow:hidden;">
        <svg viewBox="0 0 24 24" style="position:absolute;top:12px;right:14px;width:14px;height:14px;fill:#ededf2;stroke:#e1e1e7;stroke-width:1.4;opacity:.6;"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
        <svg viewBox="0 0 24 24" style="position:absolute;top:40px;right:40px;width:9px;height:9px;fill:none;stroke:#d8d8dd;stroke-width:1.4;opacity:.5;"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
        <svg viewBox="0 0 24 24" style="position:absolute;bottom:16px;left:14px;width:11px;height:11px;fill:#ededf2;stroke:#e1e1e7;stroke-width:1.4;opacity:.5;"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
        <div style="font-size:15px;font-weight:800;color:#1c1c1e;margin-bottom:4px;">手动总结</div>
        <div style="font-size:9px;color:#bbb;margin-bottom:14px;">manual summarize · 归档记忆</div>
        <div style="background:#f8f8fa;border-radius:12px;padding:10px 12px;margin-bottom:14px;border:1px solid rgba(0,0,0,.03);">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px;">
            <span style="font-size:10px;color:#999;font-weight:500;">总消息</span>
            <span style="font-size:11px;color:#1c1c1c;font-weight:700;">${totalMsgs} 条</span>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px;">
            <span style="font-size:10px;color:#999;font-weight:500;">上次总结</span>
            <span style="font-size:10px;color:#666;font-weight:500;">${lastDate}</span>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px;">
            <span style="font-size:10px;color:#999;font-weight:500;">新增未总结</span>
            <span style="font-size:11px;color:#002FA7;font-weight:700;">${newMsgs} 条</span>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <span style="font-size:10px;color:#999;font-weight:500;">已归档条数</span>
            <span style="font-size:10px;color:${lastCount > 0 ? '#d05050' : '#ccc'};font-weight:600;">${lastCount > 0 ? lastCount + ' 条' : '无'}</span>
          </div>
        </div>
        <div style="margin-bottom:14px;">
          <div style="font-size:10px;color:#999;font-weight:600;margin-bottom:6px;">总结范围（第几条 ~ 第几条）</div>
          <div style="display:flex;align-items:center;gap:8px;">
            <input id="crsManualSumFrom" type="number" value="1" min="1" max="${totalMsgs}" style="flex:1;height:38px;border-radius:10px;border:1px solid #ececf1;background:#fafafa;padding:0 12px;font-size:14px;color:#1c1c1c;font-weight:700;text-align:center;outline:none;">
            <span style="font-size:12px;color:#ccc;font-weight:600;">~</span>
            <input id="crsManualSumTo" type="number" value="${totalMsgs}" min="1" max="${totalMsgs}" style="flex:1;height:38px;border-radius:10px;border:1px solid #ececf1;background:#fafafa;padding:0 12px;font-size:14px;color:#1c1c1c;font-weight:700;text-align:center;outline:none;">
          </div>
          <div style="display:flex;justify-content:space-between;margin-top:6px;">
            <span style="font-size:9px;color:#ccc;">第 1 条</span>
            <span style="font-size:9px;color:#ccc;">第 ${totalMsgs} 条</span>
          </div>
        </div>
        <div style="display:flex;gap:8px;">
          <div id="crsManualSumCancel" style="flex:1;height:40px;border-radius:12px;background:#f5f5f7;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:600;color:#999;cursor:pointer;">取消</div>
          <div id="crsManualSumOk" style="flex:1;height:40px;border-radius:12px;background:#1c1c1c;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:#fff;cursor:pointer;">开始总结</div>
        </div>
      </div>
    `;

    const screen = document.querySelector('.phone-screen');
    if (screen) screen.appendChild(overlay);

    requestAnimationFrame(() => {
      overlay.style.background = 'rgba(0,0,0,.32)';
      overlay.querySelector('#crsManualSumBox').style.transform = 'scale(1)';
      overlay.querySelector('#crsManualSumBox').style.opacity = '1';
    });

    // 无需 opts 监听，直接从 input 读取

    function closeModal() {
      overlay.style.background = 'rgba(0,0,0,0)';
      const box = overlay.querySelector('#crsManualSumBox');
      if (box) { box.style.transform = 'scale(.92)'; box.style.opacity = '0'; }
      setTimeout(() => { if (overlay.parentNode) overlay.remove(); }, 260);
    }

    overlay.addEventListener('click', ev => { if (ev.target === overlay) closeModal(); });
    overlay.querySelector('#crsManualSumCancel').addEventListener('click', closeModal);
    overlay.querySelector('#crsManualSumOk').addEventListener('click', () => {
      const fromEl = overlay.querySelector('#crsManualSumFrom');
      const toEl = overlay.querySelector('#crsManualSumTo');
      const from = Math.max(1, Math.min(totalMsgs, parseInt(fromEl.value) || 1));
      const to = Math.max(from, Math.min(totalMsgs, parseInt(toEl.value) || totalMsgs));
      closeModal();
      close();
      localStorage.setItem(lastSumKey, JSON.stringify({ msgCount: totalMsgs, date: new Date().toLocaleString('zh-CN') }));
      if (window.MemoryPage) {
        window.MemoryPage.triggerManualSummary(currentContact.id, from, to);
      }
    });
  }

  function close() {
    if (panel) {
      panel.querySelectorAll('input, textarea').forEach(el => el.blur());
      panel.classList.remove('open');
    }
    // 关闭前确保所有值写入 contact
    if (currentContact) {
      const oldName = currentContact.name;
      const newName = document.getElementById('crsInputName').value.trim();
      if (newName && newName !== oldName) {
        currentContact.name = newName;
        showRemarkNotice(oldName, newName);
      }
      currentContact.sub = document.getElementById('crsInputSub').value;
      currentContact.charName = document.getElementById('crsInputCharName').value;
      currentContact.description = document.getElementById('crsInputDesc').value;
      currentContact.greeting = document.getElementById('crsInputGreeting').value;
      currentContact.systemPrompt = document.getElementById('crsInputSystem').value;
      const ctxEl = document.getElementById('crsInputContextRounds');
      if (ctxEl) { const v = parseInt(ctxEl.value, 10); if (v > 0) currentContact.contextRounds = v; }
      const fontEl = document.getElementById('crsInputFontSize');
      if (fontEl) { const v = parseInt(fontEl.value, 10); if (!isNaN(v) && v >= 1 && v <= 40) currentContact.fontSize = v; }
      const swTail = document.getElementById('crsSwTail');
      if (swTail) currentContact.showTail = swTail.classList.contains('on');
      const swStack = document.getElementById('crsSwStack');
      if (swStack) currentContact.stackBubbles = swStack.classList.contains('on');
      const swTime = document.getElementById('crsSwTime');
      if (swTime) currentContact.showTime = swTime.classList.contains('on');
      const swTime2 = document.getElementById('crsSwTime2');
      if (swTime2) currentContact.timeAware = swTime2.classList.contains('on');
      const swAutoSum = document.getElementById('crsSwAutoSum');
      if (swAutoSum) currentContact.autoSummary = swAutoSum.classList.contains('on');
      const slideEl2 = document.getElementById('crsMemSlideCount');
      if (slideEl2) { const sv = parseInt(slideEl2.value, 10); if (sv >= 5) currentContact.memSlideCount = sv; }
      const bubbleCSSEl = document.getElementById('crsInputBubbleCSS');
      if (bubbleCSSEl) currentContact.bubbleCSS = bubbleCSSEl.value;
      // 同步聊天室顶栏显示名
      const roomName = document.querySelector('.cl-cr-room-name');
      if (roomName && currentContact.name) roomName.textContent = currentContact.name;
    }
    // 触发外部保存
    if (currentContact && window.ContactsPage && typeof window.ContactsPage.saveContact === 'function') {
      window.ContactsPage.saveContact(currentContact);
      showSavedToast();
    }
  }

  function showRemarkNotice(oldName, newName) {
    if (!currentContact) return;
    if (!currentContact.messages) currentContact.messages = [];
    const evtId = 'remark_' + Date.now();
    const noticeMsg = {
      id: evtId,
      role: 'system_notice',
      text: `你将对方的备注改为「${newName}」`,
      ackText: `${currentContact.charName || newName} 已知悉`,
      time: Date.now()
    };
    currentContact.messages.push(noticeMsg);
    autoSave();
    // 动画插入
    setTimeout(() => {
      const container = document.querySelector('.cl-chatroom-messages');
      if (!container) return;
      if (container.querySelector('[data-msg-id="' + evtId + '"]')) return;
      const noticeDiv = document.createElement('div');
      noticeDiv.className = 'cl-msg-row';
      noticeDiv.setAttribute('data-msg-id', evtId);
      noticeDiv.setAttribute('data-notice', '1');
      noticeDiv.style.cssText = 'align-self:center;max-width:100%;margin:10px auto 2px;display:flex;flex-direction:column;align-items:center;gap:3px;position:relative;opacity:0;transform:translateY(10px);transition:opacity .35s ease,transform .35s ease;';
      noticeDiv.innerHTML = '<div style="padding:4px 12px;border-radius:999px;border:1px solid rgba(0,0,0,.18);font-size:9px;color:rgba(0,0,0,.35);font-weight:500;text-align:center;letter-spacing:.3px;">' + noticeMsg.text + '</div>';
      container.appendChild(noticeDiv);
      container.scrollTop = container.scrollHeight;
      requestAnimationFrame(() => { noticeDiv.style.opacity = '1'; noticeDiv.style.transform = 'translateY(0)'; });
      setTimeout(() => {
        const ackDiv = document.createElement('div');
        ackDiv.style.cssText = 'align-self:center;max-width:100%;margin:0 auto 6px;display:flex;align-items:center;justify-content:center;gap:6px;opacity:0;transform:translateY(6px);transition:opacity .4s ease,transform .4s ease;';
        ackDiv.innerHTML = '<span style="width:14px;height:1px;background:rgba(0,0,0,.10);flex-shrink:0;"></span><span style="font-size:8px;color:rgba(0,0,0,.22);font-weight:500;letter-spacing:.4px;">' + (noticeMsg.ackText || '') + '</span><span style="width:14px;height:1px;background:rgba(0,0,0,.10);flex-shrink:0;"></span>';
        container.appendChild(ackDiv);
        container.scrollTop = container.scrollHeight;
        requestAnimationFrame(() => { ackDiv.style.opacity = '1'; ackDiv.style.transform = 'translateY(0)'; });
      }, 2500);
    }, 800);
  }

  function renderSingleRemark(evt, animate) {}
  function renderAllRemarks() {}

  return { init, open, close };
})();

window.ChatSettingsPage = ChatSettingsPage;
