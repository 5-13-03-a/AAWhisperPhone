/* ============ WhisperPhone Chat Settings Logic ============ */
(function(){
'use strict';

var AVATAR = 'https://i.postimg.cc/yNx1KhWN/IMG-20260528-045634.jpg';
var settingsEl = null;
var built = false;
var currentContactId = null;

function buildHTML(){
  return ''+
  '<div class="cs-deco-layer">'+
    '<div class="cs-glow-1"></div><div class="cs-glow-2"></div><div class="cs-glow-3"></div>'+
    '<div class="cs-noise"></div>'+
    '<div class="cs-line-deco-1"></div><div class="cs-line-deco-2"></div>'+
    '<div class="cs-ring-deco"></div><div class="cs-ring-deco-2"></div>'+
    '<div class="cs-cross cs-cross-1"></div><div class="cs-cross cs-cross-2"></div><div class="cs-cross cs-cross-3"></div>'+
    '<div class="cs-diamond cs-diamond-1"></div><div class="cs-diamond cs-diamond-2"></div>'+
  '</div>'+
  '<div class="cs-sidebar">'+
    '<div class="cs-side-back" data-action="cs-back"><svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg></div>'+
    '<div class="cs-side-nav">'+
      '<div class="cs-side-item active" data-sec="csInfo"><svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg><div class="cs-tip">资料</div></div>'+
      '<div class="cs-side-item" data-sec="csPersona"><svg viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg><div class="cs-tip">人设</div></div>'+
      '<div class="cs-side-item" data-sec="csChat"><svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg><div class="cs-tip">聊天</div></div>'+
      '<div class="cs-side-item" data-sec="csLook"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg><div class="cs-tip">外观</div></div>'+
      '<div class="cs-side-item" data-sec="csApi"><svg viewBox="0 0 24 24"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg><div class="cs-tip">世界书</div></div>'+
    '</div>'+
  '</div>'+
  '<div class="cs-main">'+
    '<div class="cs-stars-layer">'+
      '<svg class="cs-star cs-s1" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>'+
      '<svg class="cs-star cs-s2" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>'+
      '<svg class="cs-star cs-s3" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>'+
      '<svg class="cs-star cs-s4" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>'+
      '<svg class="cs-star cs-s5" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>'+
      '<svg class="cs-star cs-s6" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>'+
      '<svg class="cs-star cs-s7" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>'+
      '<svg class="cs-star cs-s8" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>'+
      '<svg class="cs-star cs-s9" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>'+
    '</div>'+
    '<div class="cs-hero">'+
      '<div class="cs-hero-dots"></div>'+
      '<div class="cs-avatar-area" data-action="cs-avatar">'+
        '<div class="cs-avatar-heart"><svg viewBox="0 0 50 44"><path d="M25 40 C25 40 4 28 4 16 C4 9 9 4 15.5 4 C20 4 23.5 7 25 10 C26.5 7 30 4 34.5 4 C41 4 46 9 46 16 C46 28 25 40 25 40Z"/></svg></div>'+
        '<div class="cs-avatar-ring"><img class="cs-avatar-img" id="csAvatarImg" src="'+AVATAR+'"></div>'+
        '<div class="cs-avatar-badge"><svg viewBox="0 0 24 24"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg></div>'+
      '</div>'+
      '<div class="cs-hero-name" id="csHeroName">联系人</div>'+
      '<div class="cs-hero-sub" id="csHeroSub">离线</div>'+
      '<div class="cs-hero-gradient-line"></div>'+
    '</div>'+
    '<div class="cs-body">'+
      '<div class="cs-section active" id="csInfo">'+
        '<div class="cs-tile"><div class="cs-tile-label">基本信息</div>'+
          '<div class="cs-field"><div class="cs-field-label">真实名</div><input class="cs-field-input" id="csRealName" placeholder="角色的真实名字"></div>'+
          '<div class="cs-field"><div class="cs-field-label">备注名</div><input class="cs-field-input" id="csName" placeholder="显示的备注名..."></div>'+
          '<div class="cs-field"><div class="cs-field-label">签名</div><input class="cs-field-input" id="csBio" placeholder="一句话介绍..."></div>'+
        '</div>'+
        '<div class="cs-tile"><div class="cs-tile-label">偏好</div>'+
          '<div class="cs-item"><div class="cs-item-dot"></div><div class="cs-item-label">在线显示</div><div class="cs-sw on" id="csOnline"></div></div>'+
          '<div class="cs-item"><div class="cs-item-dot"></div><div class="cs-item-label">消息通知</div><div class="cs-sw on"></div></div>'+
          '<div class="cs-item"><div class="cs-item-dot"></div><div class="cs-item-label">置顶</div><div class="cs-sw" id="csPin"></div></div>'+
          '<div class="cs-item"><div class="cs-item-dot"></div><div class="cs-item-label">上下文轮数</div>'+
            '<input class="cs-context-input" id="csContextRounds" type="number" min="1" max="100" placeholder="20">'+
          '</div>'+
        '</div>'+
      '</div>'+
      '<div class="cs-section" id="csPersona">'+
        '<div class="cs-tile"><div class="cs-tile-label">角色</div>'+
          '<div class="cs-field"><div class="cs-field-label">名称</div><input class="cs-field-input" id="csCharName" placeholder="角色叫什么..."></div>'+
          '<div class="cs-field"><div class="cs-field-label">性格</div><textarea class="cs-field-textarea" id="csCharPersonality" placeholder="温柔、俏皮..."></textarea></div>'+
          '<div class="cs-field"><div class="cs-field-label">开场白</div><input class="cs-field-input" id="csGreeting" placeholder="第一句话..."></div>'+
        '</div>'+
        '<div class="cs-tile">'+
          '<div class="cs-item cs-fold-trigger" data-action="cs-fold"><div class="cs-item-dot" style="background:rgba(180,160,220,0.2);"></div><div class="cs-item-label">系统 Prompt</div><svg class="cs-fold-arrow" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg></div>'+
          '<div class="cs-fold" id="csFold"><div style="padding:10px 0 4px;"><textarea class="cs-field-textarea" id="csPrompt" style="min-height:140px;" placeholder="输入系统提示词..."></textarea></div></div>'+
        '</div>'+
        '<div class="cs-tile cs-mask-card">'+
          '<div class="cs-mask-header">'+
            '<div class="cs-mask-header-icon" id="csMaskIcon"><svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6 2 10.5c0 1.5.5 3 1.4 4.2L2 22l5-2.5c1.5.7 3.2 1 5 1 5.52 0 10-4 10-8.5S17.52 2 12 2z"/><circle cx="8.5" cy="10" r="1.2"/><circle cx="15.5" cy="10" r="1.2"/></svg></div>'+
            '<div class="cs-mask-header-text">'+
              '<div class="cs-mask-header-title">我的面具</div>'+
              '<div class="cs-mask-header-sub">让 AI 知道你是谁</div>'+
            '</div>'+
          '</div>'+
          '<div class="cs-mask-active empty" id="csMaskActive">'+
            '<div class="cs-mask-active-avatar" id="csMaskActiveAvatar"><svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></div>'+
            '<div class="cs-mask-active-info">'+
              '<div class="cs-mask-active-name" id="csMaskActiveName">未选择面具</div>'+
              '<div class="cs-mask-active-desc" id="csMaskActiveDesc">AI 将不知道你是谁</div>'+
            '</div>'+
            '<div class="cs-mask-active-change" id="csMaskToggle">切换</div>'+
          '</div>'+
          '<div class="cs-mask-picker" id="csMaskPicker">'+
            '<div class="cs-mask-list-inner" id="csMaskList"></div>'+
            '<div class="cs-mask-add-row"><div class="cs-mask-add-btn" id="csMaskAddBtn"><svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg><span>新建面具</span></div></div>'+
          '</div>'+
        '</div>'+
      '</div>'+
      '<div class="cs-section" id="csChat">'+
        '<div class="cs-tile"><div class="cs-tile-label">输入栏</div>'+
          '<div class="cs-item"><div class="cs-item-dot"></div><div class="cs-item-label">悬浮胶囊</div><input type="radio" name="csBar" value="capsule" checked style="accent-color:#b5c8ab;"></div>'+
          '<div class="cs-item"><div class="cs-item-dot"></div><div class="cs-item-label">底部白块</div><input type="radio" name="csBar" value="block" style="accent-color:#b5c8ab;"></div>'+
        '</div>'+
        '<div class="cs-tile"><div class="cs-tile-label">消息</div>'+
          '<div class="cs-item"><div class="cs-item-dot"></div><div class="cs-item-label">提示音</div><div class="cs-sw on"></div></div>'+
          '<div class="cs-item"><div class="cs-item-dot"></div><div class="cs-item-label">显示已读</div><div class="cs-sw"></div></div>'+
          '<div class="cs-item"><div class="cs-item-dot"></div><div class="cs-item-label">消息时间</div><div class="cs-sw on"></div></div>'+
          '<div class="cs-item"><div class="cs-item-dot"></div><div class="cs-item-label">时间感知</div><div class="cs-sw" id="csTimeAware"></div></div>'+
        '</div>'+
        '<div class="cs-tile"><div class="cs-tile-label">预览</div>'+
          '<div class="cs-bp"><div class="cs-bp-row l"><div class="cs-bp-b">你好呀 👋</div></div><div class="cs-bp-row r"><div class="cs-bp-b">嗨～</div></div><div class="cs-bp-row l"><div class="cs-bp-b">出去走走吧</div></div></div>'+
        '</div>'+
      '</div>'+
      '<div class="cs-section" id="csLook">'+
        '<div class="cs-tile">'+
          '<div class="cs-item cs-fold-trigger" data-action="cs-fold-wp"><div class="cs-item-dot" style="background:rgba(180,160,220,0.2);"></div><div class="cs-item-label">壁纸</div><svg class="cs-fold-arrow" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg></div>'+
          '<div class="cs-fold" id="csFoldWp">'+
            '<div style="padding:10px 0 4px;">'+
              '<div class="cs-wp-grid">'+
                '<div class="cs-wp-cell cs-wp-a active"></div>'+
                '<div class="cs-wp-cell cs-wp-b"></div>'+
                '<div class="cs-wp-cell cs-wp-c"></div>'+
                '<div class="cs-wp-cell cs-wp-d"></div>'+
                '<div class="cs-wp-cell cs-wp-e"></div>'+
                '<div class="cs-wp-cell cs-wp-custom" id="csWpCustom"><svg viewBox="0 0 24 24" style="width:16px;height:16px;stroke:#ccc;fill:none;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></div>'+
              '</div>'+
            '</div>'+
          '</div>'+
        '</div>'+
        '<div class="cs-tile"><div class="cs-tile-label">字体</div>'+
          '<div class="cs-fontsize-row">'+
            '<div class="cs-fontsize-btn" data-fontsize="small">小</div>'+
            '<div class="cs-fontsize-btn active" data-fontsize="normal">标准</div>'+
            '<div class="cs-fontsize-btn" data-fontsize="large">大</div>'+
          '</div>'+
        '</div>'+
      '</div>'+
      '<div class="cs-section" id="csApi">'+
        '<div class="cs-tile"><div class="cs-tile-label">世界书</div>'+
          '<div class="cs-wb-list" id="csWbList"></div>'+
          '<div class="cs-wb-empty" id="csWbEmpty" style="font-size:11px;color:#ccc;text-align:center;padding:16px 0;">暂无世界书</div>'+
        '</div>'+
        '<div class="cs-tile cs-memory-card" id="csMemoryCard">'+
          '<div class="cs-tile-label">记忆库</div>'+
          '<div class="cs-item"><div class="cs-item-dot"></div><div class="cs-item-label">自动总结</div><div class="cs-sw" id="csMemAutoSumm"></div></div>'+
          '<div class="cs-item"><div class="cs-item-dot"></div><div class="cs-item-label">滑落条数</div><input class="cs-context-input" id="csMemSlide" type="number" min="5" max="200" placeholder="30"></div>'+
          '<div class="cs-item cs-mem-manual" id="csMemManualBtn"><div class="cs-item-dot" style="background:rgba(181,200,171,0.3);"></div><div class="cs-item-label">手动总结</div><svg viewBox="0 0 24 24" style="width:14px;height:14px;stroke:#bbb;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;"><polyline points="9 18 15 12 9 6"/></svg></div>'+
          '<div class="cs-item cs-mem-open" id="csMemOpenBtn"><div class="cs-item-dot" style="background:rgba(160,184,200,0.3);"></div><div class="cs-item-label">进入记忆库</div><svg viewBox="0 0 24 24" style="width:14px;height:14px;stroke:#bbb;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;"><polyline points="9 18 15 12 9 6"/></svg></div>'+
        '</div>'+
      '</div>'+
    '</div>'+
    '<div class="cs-footer"><div class="cs-footer-line"></div><div class="cs-footer-text">WHISPERPHONE</div><div class="cs-footer-stars">✦ ✦ ✦</div></div>'+
  '</div>';
}

function ensure(){
  if(built) return;
  built = true;
  settingsEl = document.createElement('div');
  settingsEl.className = 'ca-settings';
  settingsEl.id = 'caChatSettings';
  settingsEl.innerHTML = buildHTML();
  document.body.appendChild(settingsEl);
  bind();
}

function bind(){
  settingsEl.addEventListener('click', function(e){
    var action = e.target.closest('[data-action]');
    if(action){
      var a = action.dataset.action;
      if(a === 'cs-back') close();
      if(a === 'cs-avatar') uploadAvatar();
      if(a === 'cs-fold'){
        action.classList.toggle('open');
        settingsEl.querySelector('#csFold').classList.toggle('open');
      }
      if(a === 'cs-fold-wp'){
        action.classList.toggle('open');
        settingsEl.querySelector('#csFoldWp').classList.toggle('open');
      }
    }
    var maskToggle = e.target.closest('#csMaskToggle');
    if(maskToggle){ settingsEl.querySelector('#csMaskPicker').classList.toggle('open'); return; }
    var maskMore = e.target.closest('.cs-mask-opt-more');
    if(maskMore){ var mid=maskMore.dataset.maskId; var masks=getUserMasks(); var mk=masks.find(function(m){return m.id===mid;}); if(mk) showMaskActionSheet(mk); return; }
    var wpCustom = e.target.closest('#csWpCustom');
    if(wpCustom){ uploadWallpaper(); return; }
    var barRadio = e.target.closest('[name="csBar"]');
    if(barRadio){ saveContactSettings(); liveRefresh(); }
    var sideItem = e.target.closest('.cs-side-item');
    if(sideItem){
      settingsEl.querySelectorAll('.cs-side-item').forEach(function(i){i.classList.remove('active');});
      sideItem.classList.add('active');
      settingsEl.querySelectorAll('.cs-section').forEach(function(s){s.classList.remove('active');});
      var sec = settingsEl.querySelector('#'+sideItem.dataset.sec);
      if(sec) sec.classList.add('active');
    }
    var wbCheck = e.target.closest('.cs-wb-check');
    if(wbCheck){
      syncWorldBookBinding(wbCheck.dataset.wbid, wbCheck.classList.contains('on'));
    }
    var sw = e.target.closest('.cs-sw');
    if(sw && !wbCheck){ sw.classList.toggle('on'); saveContactSettings(); liveRefresh(); }
    var wp = e.target.closest('.cs-wp-cell');
    if(wp){
      settingsEl.querySelectorAll('.cs-wp-cell').forEach(function(c){c.classList.remove('active');});
      wp.classList.add('active');
      saveContactSettings();
      liveRefresh();
    }
    var fsItem = e.target.closest('[data-fontsize]');
    if(fsItem){
      settingsEl.querySelectorAll('[data-fontsize]').forEach(function(f){
        f.classList.remove('active');
      });
      fsItem.classList.add('active');
      saveContactSettings();
      liveRefresh();
    }
    var maskHero = e.target.closest('#csMaskHero');
    if(maskHero){
      var scrollEl = settingsEl.querySelector('#csMaskList');
      var addEl = settingsEl.querySelector('.cs-mask-add-btn');
      if(scrollEl){
        var isOpen = scrollEl.classList.contains('open');
        scrollEl.classList.toggle('open');
        if(addEl) addEl.classList.toggle('open');
        var arrow = maskHero.querySelector('.cs-mask-hero-arrow');
        if(arrow) arrow.classList.toggle('open', !isOpen);
      }
    }
  });

  /* 实时保存 + 渲染（防抖，避免长文本输入卡顿） */
  var saveTimer = null;
  settingsEl.querySelectorAll('.cs-field-input, .cs-field-textarea').forEach(function(el){
    el.addEventListener('input', function(){
      if(saveTimer) clearTimeout(saveTimer);
      saveTimer = setTimeout(function(){
        saveContactSettings();
        liveRefresh();
      }, 400);
    });
  });

  bindMemoryEvents();
}

function renderWbList(contactId, cfg){
  var listEl = settingsEl.querySelector('#csWbList');
  var emptyEl = settingsEl.querySelector('#csWbEmpty');
  if(!listEl) return;

  var books = [];
  try{ books = JSON.parse(localStorage.getItem('whisperphone_worldbooks_v1')||'[]'); }catch(e){}

  if(books.length === 0){
    listEl.innerHTML = '';
    if(emptyEl) emptyEl.style.display = '';
    return;
  }
  if(emptyEl) emptyEl.style.display = 'none';

  var enabled = (cfg && cfg.worldBooks) ? cfg.worldBooks : [];

  var html = '';
  books.forEach(function(b, bi){
    /* 书被勾选，或书内有条目绑定到当前联系人 → 都视为勾选 */
    var hasBoundEntry = (b.entries||[]).some(function(e){
      return e.contacts && e.contacts.length > 0 && e.contacts.indexOf(contactId) >= 0;
    });
    var isOn = enabled.indexOf(b.id) >= 0 || hasBoundEntry;
    var count = b.entries ? b.entries.length : 0;
    var enabledCount = b.entries ? b.entries.filter(function(e){return e.enabled;}).length : 0;
    html += '<div class="cs-wb-book" data-wbi="'+bi+'">'+
      '<div class="cs-item">'+
        '<div class="cs-item-dot" style="background:'+(isOn?'#aaa':'#e5e5e5')+';"></div>'+
        '<div class="cs-item-label cs-wb-book-name">'+escSettings(b.name)+'<span style="font-size:9px;color:#ccc;margin-left:6px;">'+enabledCount+'/'+count+'</span></div>'+
        '<svg class="cs-wb-arrow" viewBox="0 0 24 24" style="width:12px;height:12px;stroke:#ccc;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;flex-shrink:0;transition:transform 0.3s;"><polyline points="6 9 12 15 18 9"/></svg>'+
        '<div class="cs-wb-check'+(isOn?' on':'')+'" data-wbid="'+b.id+'"></div>'+
      '</div>'+
      '<div class="cs-wb-entries" data-wbi="'+bi+'" style="max-height:0;overflow:hidden;transition:max-height 0.4s cubic-bezier(0.16,1,0.3,1);">';
    (b.entries||[]).forEach(function(e){
      var kws = (e.keywords||[]).slice(0,3).map(function(k){return escSettings(k);}).join(', ');
      html += '<div class="cs-wb-ent">'+
        '<div class="cs-wb-ent-bar" style="background:'+(e.enabled?'#b5c8ab':'#e0e0e0')+';"></div>'+
        '<div class="cs-wb-ent-body">'+
          '<div class="cs-wb-ent-name">'+escSettings(e.name||'未命名')+'</div>'+
          '<div class="cs-wb-ent-kw">'+(kws||'无关键词')+'</div>'+
        '</div>'+
      '</div>';
    });
    if(count === 0){
      html += '<div style="font-size:10px;color:#ddd;text-align:center;padding:10px 0;">暂无条目</div>';
    }
    html += '</div></div>';
  });
  listEl.innerHTML = html;

  /* 开关点击 */
  listEl.querySelectorAll('.cs-wb-check').forEach(function(sw){
    sw.addEventListener('click', function(ev){
      ev.stopPropagation();
      sw.classList.toggle('on');
      var dot = sw.closest('.cs-item').querySelector('.cs-item-dot');
      if(dot) dot.style.background = sw.classList.contains('on') ? '#aaa' : '#e5e5e5';
      saveContactSettings();
      liveRefresh();
    });
  });

  /* 点击书名展开/收起条目 */
  listEl.querySelectorAll('.cs-wb-book-name').forEach(function(nameEl){
    nameEl.addEventListener('click', function(ev){
      ev.stopPropagation();
      var bookDiv = nameEl.closest('.cs-wb-book');
      var entriesDiv = bookDiv.querySelector('.cs-wb-entries');
      var arrow = bookDiv.querySelector('.cs-wb-arrow');
      if(entriesDiv.style.maxHeight && entriesDiv.style.maxHeight !== '0px'){
        entriesDiv.style.maxHeight = '0px';
        if(arrow) arrow.style.transform = '';
      } else {
        entriesDiv.style.maxHeight = entriesDiv.scrollHeight + 'px';
        if(arrow) arrow.style.transform = 'rotate(180deg)';
      }
    });
  });
}

function escSettings(s){var d=document.createElement('div');d.textContent=s;return d.innerHTML;}

/* 勾选/取消世界书时，把当前联系人写进/移出该书所有条目的 contacts，实现双向同步 */
function syncWorldBookBinding(bookId, isOn){
  if(!bookId || !currentContactId) return;
  try{
    var wbStore = JSON.parse(localStorage.getItem('whisperphone_worldbooks_v1')||'[]');
    var changed = false;
    wbStore.forEach(function(b){
      if(b.id !== bookId) return;
      (b.entries||[]).forEach(function(e){
        if(!e.contacts) e.contacts = [];
        var has = e.contacts.indexOf(currentContactId) >= 0;
        if(isOn && !has){ e.contacts.push(currentContactId); changed = true; }
        else if(!isOn && has){
          e.contacts = e.contacts.filter(function(id){ return id !== currentContactId; });
          changed = true;
        }
      });
    });
    if(changed) localStorage.setItem('whisperphone_worldbooks_v1', JSON.stringify(wbStore));
  }catch(e){}
}

function uploadWallpaper(){
  var inp = document.createElement('input');
  inp.type='file'; inp.accept='image/*';
  inp.addEventListener('change', function(){
    var f = inp.files && inp.files[0]; if(!f) return;
    var r = new FileReader();
    r.onload = function(){
      var dataUrl = r.result;
      if(!currentContactId) return;
      var wpKey = 'wallpaper_' + currentContactId;
      if(window.WhisperDB){
        WhisperDB.set(wpKey, dataUrl).then(function(){
          var contacts = [];
          try{ contacts = JSON.parse(localStorage.getItem('wp_chat_contacts')||'[]'); }catch(e){}
          var c = contacts.find(function(x){return x.id === currentContactId;});
          if(c){
            if(!c.settings) c.settings = {};
            c.settings.wallpaper = 'cs-wp-custom';
            c.settings.wallpaperKey = wpKey;
            localStorage.setItem('wp_chat_contacts', JSON.stringify(contacts));
          }
          /* 选中自定义壁纸 */
          settingsEl.querySelectorAll('.cs-wp-cell').forEach(function(c){c.classList.remove('active');});
          var customEl = settingsEl.querySelector('#csWpCustom');
          if(customEl){
            customEl.classList.add('active');
            customEl.style.backgroundImage = 'url('+dataUrl+')';
            customEl.style.backgroundSize = 'cover';
            customEl.style.backgroundPosition = 'center';
            customEl.innerHTML = '';
          }
          liveRefresh();
        });
      }
    };
    r.readAsDataURL(f);
  });
  inp.click();
}

function uploadAvatar(){
  var inp = document.createElement('input');
  inp.type='file'; inp.accept='image/*';
  inp.addEventListener('change', function(){
    var f = inp.files && inp.files[0]; if(!f) return;
    var r = new FileReader();
    r.onload = function(){
      var dataUrl = r.result;
      settingsEl.querySelector('#csAvatarImg').src = dataUrl;
      if(!currentContactId) return;
      var avatarKey = 'avatar_' + currentContactId;
      if(window.WhisperDB){
        WhisperDB.set(avatarKey, dataUrl).then(function(){
          var contacts = [];
          try{ contacts = JSON.parse(localStorage.getItem('wp_chat_contacts')||'[]'); }catch(e){}
          var c = contacts.find(function(x){return x.id === currentContactId;});
          if(c){
            if(!c.settings) c.settings = {};
            c.settings.avatar = avatarKey;
            localStorage.setItem('wp_chat_contacts', JSON.stringify(contacts));
          }
          liveRefresh();
        });
      }
    };
    r.readAsDataURL(f);
  });
  inp.click();
}

function loadContactSettings(contactId){
  currentContactId = contactId;
  var contacts = [];
  try{ contacts = JSON.parse(localStorage.getItem('wp_chat_contacts')||'[]'); }catch(e){}
  var c = contacts.find(function(x){return x.id === contactId;});
  if(!c) return;

  var cfg = c.settings || {};
  settingsEl.querySelector('#csHeroName').textContent = c.name;
  settingsEl.querySelector('#csHeroSub').innerHTML = c.online ? '<span class="dot-on"></span>在线' : '离线';
  settingsEl.querySelector('#csRealName').value = cfg.realName || cfg.charName || c.name || '';
  settingsEl.querySelector('#csContextRounds').value = cfg.contextRounds || '20';

  var onlineSw = settingsEl.querySelector('#csOnline');
  if(onlineSw){ if(c.online) onlineSw.classList.add('on'); else onlineSw.classList.remove('on'); }
  var pinSw = settingsEl.querySelector('#csPin');
  if(pinSw){ if(cfg.pinned) pinSw.classList.add('on'); else pinSw.classList.remove('on'); }
  var timeSw = settingsEl.querySelector('#csTimeAware');
  if(timeSw){ if(cfg.timeAware) timeSw.classList.add('on'); else timeSw.classList.remove('on'); }
  var memAutoSw = settingsEl.querySelector('#csMemAutoSumm');
  if(memAutoSw){ if(cfg.memAutoSumm) memAutoSw.classList.add('on'); else memAutoSw.classList.remove('on'); }
  var memSlideEl = settingsEl.querySelector('#csMemSlide');
  if(memSlideEl) memSlideEl.value = cfg.memSlideCount || '30';

  var avatarEl = settingsEl.querySelector('#csAvatarImg');
  avatarEl.src = AVATAR;
  if(cfg.avatar && cfg.avatar.startsWith('avatar_') && window.WhisperDB){
    WhisperDB.get(cfg.avatar).then(function(data){
      if(data) avatarEl.src = data;
    });
  } else if(cfg.avatar && cfg.avatar.startsWith('data:')){
    avatarEl.src = cfg.avatar;
  }
  settingsEl.querySelector('#csName').value = c.name || '';
  settingsEl.querySelector('#csBio').value = cfg.bio || '';
  settingsEl.querySelector('#csCharName').value = cfg.charName || cfg.realName || c.name || '';
  settingsEl.querySelector('#csCharPersonality').value = cfg.personality || '';
  settingsEl.querySelector('#csGreeting').value = cfg.greeting || '';
  settingsEl.querySelector('#csPrompt').value = cfg.prompt || '';

  var wp = cfg.wallpaper || 'cs-wp-a';
  settingsEl.querySelectorAll('.cs-wp-cell').forEach(function(c){c.classList.remove('active');});
  if(wp === 'cs-wp-custom'){
    var customEl = settingsEl.querySelector('#csWpCustom');
    if(customEl){
      customEl.classList.add('active');
      var wpKey2 = cfg.wallpaperKey || ('wallpaper_' + currentContactId);
      if(window.WhisperDB){
        WhisperDB.get(wpKey2).then(function(data){
          if(data){
            customEl.style.backgroundImage = 'url('+data+')';
            customEl.style.backgroundSize = 'cover';
            customEl.style.backgroundPosition = 'center';
            customEl.innerHTML = '';
          }
        });
      }
    }
  } else {
    var wpEl = settingsEl.querySelector('.'+wp);
    if(wpEl) wpEl.classList.add('active');
  }

  var barStyle = cfg.inputBarStyle || 'capsule';
  settingsEl.querySelectorAll('[name="csBar"]').forEach(function(r){ r.checked = (r.value === barStyle); });

  var fs = cfg.fontSize || 'normal';
  settingsEl.querySelectorAll('[data-fontsize]').forEach(function(f){
    f.classList.remove('active');
    f.style.background='';f.style.color='';
  });
  var fsEl = settingsEl.querySelector('[data-fontsize="'+fs+'"]');
  if(fsEl) fsEl.classList.add('active');

  renderWbList(contactId, cfg);
  renderMaskList(contactId, cfg);
}

function saveContactSettings(){
  if(!currentContactId) return;
  var contacts = [];
  try{ contacts = JSON.parse(localStorage.getItem('wp_chat_contacts')||'[]'); }catch(e){}
  var c = contacts.find(function(x){return x.id === currentContactId;});
  if(!c) return;

  c.name = settingsEl.querySelector('#csName').value.trim() || c.name;
  if(!c.settings) c.settings = {};
  c.settings.realName = settingsEl.querySelector('#csRealName').value.trim();
  c.settings.bio = settingsEl.querySelector('#csBio').value.trim();
  c.settings.charName = settingsEl.querySelector('#csCharName').value.trim() || c.settings.realName;
  c.settings.personality = settingsEl.querySelector('#csCharPersonality').value.trim();
  c.settings.greeting = settingsEl.querySelector('#csGreeting').value.trim();
  c.settings.prompt = settingsEl.querySelector('#csPrompt').value.trim();
  var cr = parseInt(settingsEl.querySelector('#csContextRounds').value, 10);
  c.settings.contextRounds = isNaN(cr) ? 20 : Math.max(1, cr);

  c.online = settingsEl.querySelector('#csOnline').classList.contains('on');
  c.settings.pinned = settingsEl.querySelector('#csPin').classList.contains('on');c.settings.timeAware = settingsEl.querySelector('#csTimeAware').classList.contains('on');c.settings.memAutoSumm = settingsEl.querySelector('#csMemAutoSumm').classList.contains('on');
  var memSlide = parseInt(settingsEl.querySelector('#csMemSlide').value, 10);
  c.settings.memSlideCount = isNaN(memSlide) ? 30 : Math.max(5, memSlide);

  var activeWp = settingsEl.querySelector('.cs-wp-cell.active');
  if(activeWp){
    if(activeWp.id === 'csWpCustom'){
      c.settings.wallpaper = 'cs-wp-custom';
      c.settings.wallpaperKey = 'wallpaper_' + currentContactId;
    } else {
      var cls = Array.from(activeWp.classList).find(function(cl){return cl.startsWith('cs-wp-') && cl!=='cs-wp-cell';});
      c.settings.wallpaper = cls || 'cs-wp-a';
      c.settings.wallpaperKey = '';
    }
  }
  var activeBar = settingsEl.querySelector('[name="csBar"]:checked');
  c.settings.inputBarStyle = activeBar ? activeBar.value : 'capsule';
  var activeFs = settingsEl.querySelector('[data-fontsize].active');
  c.settings.fontSize = activeFs ? activeFs.dataset.fontsize : 'normal';

  var activeMaskOpt = settingsEl.querySelector('.cs-mask-opt.active');
  c.settings.userMaskId = activeMaskOpt ? (activeMaskOpt.dataset.maskId || '') : (c.settings.userMaskId || '');

  /* 保存勾选的世界书（仅当世界书列表已渲染时才覆盖，避免误清空绑定） */
  var wbChecks = settingsEl.querySelectorAll('.cs-wb-check');
  if(wbChecks.length > 0){
    var checkedWbs = [];
    settingsEl.querySelectorAll('.cs-wb-check.on').forEach(function(sw){
      if(sw.dataset.wbid) checkedWbs.push(sw.dataset.wbid);
    });
    c.settings.worldBooks = checkedWbs;
  }

  localStorage.setItem('wp_chat_contacts', JSON.stringify(contacts));

  settingsEl.querySelector('#csHeroName').textContent = c.name;
  settingsEl.querySelector('#csHeroSub').innerHTML = c.online ? '<span class="dot-on"></span>在线' : '离线';
}

function liveRefresh(){
  if(typeof window._wpRefreshChat === 'function') window._wpRefreshChat();
  if(typeof window._wpChatRefresh === 'function') window._wpChatRefresh();
  updateHeroFromData();
}

function updateHeroFromData(){
  if(!settingsEl || !currentContactId) return;
  var contacts = [];
  try{ contacts = JSON.parse(localStorage.getItem('wp_chat_contacts')||'[]'); }catch(e){}
  var c = contacts.find(function(x){return x.id === currentContactId;});
  if(!c) return;
  settingsEl.querySelector('#csHeroName').textContent = c.name;
  settingsEl.querySelector('#csHeroSub').innerHTML = c.online ? '<span class="dot-on"></span>在线' : '离线';
}

function open(contactId){
  ensure();
  loadContactSettings(contactId);
  settingsEl.classList.add('active');
}

function showSavedToast(){
  var old = document.getElementById('csSavedToast');
  if(old) old.parentNode.removeChild(old);
  var toast = document.createElement('div');
  toast.id = 'csSavedToast';
  toast.textContent = 'Settings saved';
  toast.style.cssText = 'position:fixed;left:50%;bottom:40px;transform:translateX(-50%) translateY(10px);'+
    'background:#9a9a9e;border:1px solid #7a7a7e;color:#fff;'+
    'font-size:12px;font-weight:600;letter-spacing:0.4px;'+
    'padding:9px 20px;border-radius:50px;z-index:1200;'+
    'box-shadow:0 4px 16px rgba(0,0,0,0.08);'+
    'opacity:0;transition:opacity 0.25s ease,transform 0.25s ease;'+
    'pointer-events:none;font-family:-apple-system,BlinkMacSystemFont,sans-serif;';
  document.body.appendChild(toast);
  requestAnimationFrame(function(){
    toast.style.opacity = '0.45';
    toast.style.transform = 'translateX(-50%) translateY(0)';
  });
  setTimeout(function(){
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(10px)';
    setTimeout(function(){ if(toast.parentNode) toast.parentNode.removeChild(toast); }, 300);
  }, 1600);
}

function close(){
  if(!settingsEl) return;
  var cid = currentContactId;
  saveContactSettings();
  /* 先让设置页所有输入框失焦，防止焦点残留拦截键盘事件 */
  settingsEl.querySelectorAll('input,textarea,select,[contenteditable]').forEach(function(el){
    el.blur();
  });
  if(document.activeElement && settingsEl.contains(document.activeElement)){
    document.activeElement.blur();
  }
  settingsEl.classList.remove('active');
  if(window._wpChatConvs){
    try{ localStorage.setItem('wp_chat_messages', JSON.stringify(window._wpChatConvs)); }catch(e){}
  }
  liveRefresh();
  if(cid && typeof window._wpRestoreChatId === 'function'){
    window._wpRestoreChatId(cid);
  }
  /* 延迟聚焦聊天输入框，确保设置页完全隐藏后焦点回到聊天室 */
  setTimeout(function(){
    var cdInput = document.getElementById('cdInput');
    if(cdInput) cdInput.focus();
  }, 100);
  showSavedToast();
}

/*── 手动总结弹窗（设置消息范围让AI总结） ── */
function showManualSummaryModal(){
  var old = document.getElementById('csMemSummModal');
  if(old) old.parentNode.removeChild(old);

  /* 获取消息总数和上次总结到第几条 */
  var convs = {};
  try{ convs = JSON.parse(localStorage.getItem('wp_chat_messages')||'{}'); }catch(e){}
  var msgs = convs[currentContactId] || [];
  var totalCount = msgs.length;
  var memKey = 'wp_memory_' + currentContactId;
  var memories = [];
  try{ memories = JSON.parse(localStorage.getItem(memKey) || '[]'); }catch(e){}
  var lastSummIdx = 0;
  for(var i = memories.length - 1; i >= 0; i--){
    if(memories[i].source === 'manual-ai' && memories[i].msgRange){
      lastSummIdx = memories[i].msgRange.end;
      break;
    }
  }

  var modal = document.createElement('div');
  modal.id = 'csMemSummModal';
  modal.className = 'cs-mem-modal-mask';
  modal.innerHTML =
    '<div class="cs-mem-modal">'+
      '<div class="cs-mem-modal-title">手动总结</div>'+
      '<div style="font-size:10px;color:#999;margin-bottom:10px;">消息总数：'+totalCount+' 条 · 上次总结到第 '+lastSummIdx+' 条</div>'+
      '<div class="cs-field"><div class="cs-field-label">从第几条</div><input class="cs-field-input" id="csMemSummFrom" type="number" value="'+(lastSummIdx+1)+'" min="1" max="'+totalCount+'" placeholder="'+(lastSummIdx+1)+'"></div>'+
      '<div class="cs-field"><div class="cs-field-label">到第几条</div><input class="cs-field-input" id="csMemSummTo" type="number" value="'+totalCount+'" min="1" max="'+totalCount+'" placeholder="'+totalCount+'"></div>'+
      '<div class="cs-mem-modal-btns">'+
        '<button class="cd-edit-confirm-btn cancel" id="csMemSummCancel">取消</button>'+
        '<button class="cd-edit-confirm-btn confirm" id="csMemSummSave">开始总结</button>'+
      '</div>'+
      '<div id="csMemSummStatus" style="font-size:10px;color:#b5c8ab;text-align:center;margin-top:8px;display:none;">正在总结中...</div>'+
    '</div>';
  document.body.appendChild(modal);
  requestAnimationFrame(function(){ modal.classList.add('show'); });

  modal.querySelector('#csMemSummCancel').addEventListener('click', function(){
    modal.classList.remove('show');
    setTimeout(function(){ if(modal.parentNode) modal.parentNode.removeChild(modal); }, 300);
  });
  modal.addEventListener('click', function(e){ if(e.target === modal){ modal.classList.remove('show'); setTimeout(function(){ if(modal.parentNode) modal.parentNode.removeChild(modal); }, 300); }});

  modal.querySelector('#csMemSummSave').addEventListener('click', function(){
    var from = parseInt(modal.querySelector('#csMemSummFrom').value, 10) || 1;
    var to = parseInt(modal.querySelector('#csMemSummTo').value, 10) || totalCount;
    if(from < 1) from = 1;
    if(to > totalCount) to = totalCount;
    if(from > to) return;

    var statusEl = modal.querySelector('#csMemSummStatus');
    statusEl.style.display = '';
    statusEl.textContent = '正在总结中...';
    modal.querySelector('#csMemSummSave').disabled = true;

    /* 取出范围内消息 */
    var rangeMsgs = msgs.slice(from - 1, to);
    var chatContent = rangeMsgs.map(function(m, idx){
      var time = m.time || '';
      return '['+(from+idx)+']['+time+'] '+(m.role==='user'?'用户':'角色')+': '+m.text;
    }).join('\n');

    /* 调用API让AI总结 */
    var cfg = {key:'',url:'https://api.openai.com/v1/chat/completions',model:'gpt-4o-mini'};
    if(window._wpApiCache){
      var d = window._wpApiCache;
      if(d.apiKey) cfg.key = d.apiKey;
      if(d.baseUrl){
        var u = d.baseUrl.replace(/\/+$/, '');
        if(!/\/chat\/completions/.test(u)){
          if(!/\/v1$/.test(u)) u += '/v1';
          u += '/chat/completions';
        }
        cfg.url = u;
      }
      if(d.model) cfg.model = d.model;
    }
    try{
      var s = localStorage.getItem('whisperphone_api');
      if(s){var dd=JSON.parse(s);if(!cfg.key&&dd.key)cfg.key=dd.key;if(dd.url&&!window._wpApiCache)cfg.url=dd.url;if(!cfg.model&&dd.model)cfg.model=dd.model;}
    }catch(e){}

    if(!cfg.key){
      statusEl.textContent = '错误：未配置API Key';
      modal.querySelector('#csMemSummSave').disabled = false;
      return;
    }

    var summaryPrompt = '[记忆区维护规则]\n你是总结机器人，不是角色本人，必须用第三人称视角总结。\n\n1.将当前事件添加到记忆列表。以最重要的开始记录排列。事件必须有起因、经过、结果。例如：01.02...排列。\n2.必须用[年月日精确时间]来当做每个事件前缀，且要写明事件从几点到几点。\n3.禁止删除/删减/省略任何已有记忆，每条记忆永久保留。\n4.遇到重大剧情点（如关键决定、事件转折）时，在该条前标注【重要节点】。\n5.用第三人称描述，如"用户做了..."、"角色回应了..."，禁止用"我"或"你"。\n6.禁止输出任何开场白、解释、确认语句，直接输出记忆条目列表，不要说"好的"、"这是..."等。\n\n以下是第'+from+'条到第'+to+'条的对话记录：\n'+chatContent;

    fetch(cfg.url,{
      method:'POST',
      headers:{'Content-Type':'application/json','Authorization':'Bearer '+cfg.key},
      body:JSON.stringify({model:cfg.model,messages:[
        {role:'system',content:'你是一个专业的对话总结机器人，负责用第三人称视角将聊天记录整理成结构化的记忆条目。'},
        {role:'user',content:summaryPrompt}
      ]})
    })
    .then(function(r){return r.json();})
    .then(function(data){
      var result = '';
      if(data.choices && data.choices[0] && data.choices[0].message){
        result = data.choices[0].message.content;
      }
      if(result){
        var now = new Date();
        var timeStr = now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0')+'-'+String(now.getDate()).padStart(2,'0')+' '+String(now.getHours()).padStart(2,'0')+':'+String(now.getMinutes()).padStart(2,'0');
        memories.push({ id:'mem_'+Date.now(), text:result, level:1, date:timeStr, source:'manual-ai', msgRange:{from:from, end:to} });
        try{ localStorage.setItem(memKey, JSON.stringify(memories)); }catch(e){}
        statusEl.textContent = '总结完成！已保存到记忆库';
        setTimeout(function(){
          modal.classList.remove('show');
          setTimeout(function(){ if(modal.parentNode) modal.parentNode.removeChild(modal); }, 300);
          showSavedToast();
        }, 1200);
      } else {
        statusEl.textContent = '总结失败：'+(data.error?data.error.message:'无返回');modal.querySelector('#csMemSummSave').disabled = false;
      }
    })
    .catch(function(err){
      statusEl.textContent = '请求失败：'+err.message;
      modal.querySelector('#csMemSummSave').disabled = false;
    });
  });
}

/* ── 记忆库全屏界面 ── */
function openMemoryLibrary(){
  var old = document.getElementById('csMemLibrary');
  if(old) old.parentNode.removeChild(old);
  var memKey = 'wp_memory_' + currentContactId;
  var memories = [];
  try{ memories = JSON.parse(localStorage.getItem(memKey) || '[]'); }catch(e){}

  var lib = document.createElement('div');
  lib.id = 'csMemLibrary';
  lib.className = 'cs-mem-library';
  var listHtml = '';
  if(memories.length === 0){
    listHtml = '<div class="cs-mem-empty">暂无记忆</div>';
  } else {
    memories.forEach(function(m, i){
      var levelLabels = ['短期','长期','重要','核心'];
      var levelColors = ['#ccc','#b5c8ab','#c8b5ab','#c8abb5'];
      var lv = (typeof m.level === 'number') ? m.level : 1;
      listHtml += '<div class="cs-mem-item" data-idx="'+i+'">'+
        '<div class="cs-mem-item-bar" style="background:'+levelColors[lv]+';"></div>'+
        '<div class="cs-mem-item-body">'+
          '<div class="cs-mem-item-head">'+
            '<span class="cs-mem-item-level" style="color:'+levelColors[lv]+';">'+levelLabels[lv]+'</span>'+
            '<span class="cs-mem-item-date">'+escSettings(m.date||'')+'</span>'+
          '</div>'+
          '<div class="cs-mem-item-text">'+escSettings(m.text||'').substring(0,120)+(m.text&&m.text.length>120?'…':'')+'</div>'+
        '</div>'+
        '<div class="cs-mem-item-actions">'+
          '<div class="cs-mem-act-btn cs-mem-edit" data-idx="'+i+'"><svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg></div>'+
          '<div class="cs-mem-act-btn cs-mem-del" data-idx="'+i+'"><svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg></div>'+
        '</div>'+
      '</div>';
    });
  }
  lib.innerHTML =
    '<div class="cs-mem-lib-header">'+
      '<div class="cs-mem-lib-back" id="csMemLibBack"><svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg></div>'+
      '<div class="cs-mem-lib-title">记忆库</div>'+
      '<div class="cs-mem-lib-count">'+memories.length+' 条</div>'+
    '</div>'+
    '<div class="cs-mem-lib-list">'+listHtml+'</div>';
  document.body.appendChild(lib);
  requestAnimationFrame(function(){ lib.classList.add('active'); });

  lib.querySelector('#csMemLibBack').addEventListener('click', function(){
    lib.classList.remove('active');
    setTimeout(function(){ if(lib.parentNode) lib.parentNode.removeChild(lib); }, 350);
  });

  lib.querySelectorAll('.cs-mem-del').forEach(function(btn){
    btn.addEventListener('click', function(){
      var idx = parseInt(btn.dataset.idx, 10);
      memories.splice(idx, 1);
      try{ localStorage.setItem(memKey, JSON.stringify(memories)); }catch(e){}
      openMemoryLibrary();
    });
  });

  lib.querySelectorAll('.cs-mem-edit').forEach(function(btn){
    btn.addEventListener('click', function(){
      var idx = parseInt(btn.dataset.idx, 10);
      var mem = memories[idx]; if(!mem) return;
      showMemoryEditModal(mem, idx, memKey, memories);
    });
  });
}

/* ── 记忆编辑弹窗 ── */
function showMemoryEditModal(mem, idx, memKey, memories){
  var old = document.getElementById('csMemEditModal');
  if(old) old.parentNode.removeChild(old);

  var levelLabels = ['短期','长期','重要','核心'];
  var lv = (typeof mem.level === 'number') ? mem.level : 1;

  var modal = document.createElement('div');
  modal.id = 'csMemEditModal';
  modal.className = 'cs-mem-modal-mask';
  modal.innerHTML =
    '<div class="cs-mem-modal" style="max-width:320px;">'+
      '<div class="cs-mem-modal-title">编辑记忆</div>'+
      '<div class="cs-field" style="margin-bottom:12px;">'+
        '<div class="cs-field-label">记忆等级</div>'+
        '<div class="cs-mem-level-btns" style="display:flex;gap:6px;">'+
          '<div class="cs-mem-level-btn'+(lv===0?' active':'')+'" data-lv="0">短期</div>'+
          '<div class="cs-mem-level-btn'+(lv===1?' active':'')+'" data-lv="1">长期</div>'+
          '<div class="cs-mem-level-btn'+(lv===2?' active':'')+'" data-lv="2">重要</div>'+
          '<div class="cs-mem-level-btn'+(lv===3?' active':'')+'" data-lv="3">核心</div>'+
        '</div>'+
      '</div>'+
      '<div class="cs-field" style="margin-bottom:12px;">'+
        '<div class="cs-field-label">时间标记</div>'+
        '<input class="cs-field-input" id="csMemEditDate" value="'+escSettings(mem.date||'')+'" placeholder="年-月-日 时:分">'+
      '</div>'+
      '<div class="cs-field">'+
        '<div class="cs-field-label">记忆内容</div>'+
        '<textarea class="cs-field-textarea" id="csMemEditText" style="min-height:120px;">'+escSettings(mem.text||'')+'</textarea>'+
      '</div>'+
      '<div class="cs-mem-modal-btns">'+
        '<button class="cd-edit-confirm-btn cancel" id="csMemEditCancel">取消</button>'+
        '<button class="cd-edit-confirm-btn confirm" id="csMemEditSave">保存</button>'+
      '</div>'+
    '</div>';
  document.body.appendChild(modal);
  requestAnimationFrame(function(){ modal.classList.add('show'); });

  var selectedLevel = lv;

  modal.querySelectorAll('.cs-mem-level-btn').forEach(function(btn){
    btn.addEventListener('click', function(){
      modal.querySelectorAll('.cs-mem-level-btn').forEach(function(b){ b.classList.remove('active'); });
      btn.classList.add('active');
      selectedLevel = parseInt(btn.dataset.lv, 10);
    });
  });

  function closeModal(){
    modal.classList.remove('show');
    setTimeout(function(){ if(modal.parentNode) modal.parentNode.removeChild(modal); }, 300);
  }

  modal.querySelector('#csMemEditCancel').addEventListener('click', closeModal);
  modal.addEventListener('click', function(e){ if(e.target === modal) closeModal(); });

  modal.querySelector('#csMemEditSave').addEventListener('click', function(){
    var newText = modal.querySelector('#csMemEditText').value.trim();
    var newDate = modal.querySelector('#csMemEditDate').value.trim();
    if(!newText){ closeModal(); return; }

    memories[idx].text = newText;
    memories[idx].level = selectedLevel;
    if(newDate) memories[idx].date = newDate;

    try{ localStorage.setItem(memKey, JSON.stringify(memories)); }catch(e){}
    closeModal();
    showSavedToast();
    refreshMemoryLibraryList(memKey, memories);
  });
}

/* ── 刷新记忆库列表（无动画） ── */
function refreshMemoryLibraryList(memKey, memories){
  var lib = document.getElementById('csMemLibrary');
  if(!lib) return;
  
  var listEl = lib.querySelector('.cs-mem-lib-list');
  var countEl = lib.querySelector('.cs-mem-lib-count');
  if(!listEl) return;
  
  if(countEl) countEl.textContent = memories.length + ' 条';
  
  var listHtml = '';
  if(memories.length === 0){
    listHtml = '<div class="cs-mem-empty">暂无记忆</div>';
  } else {
    memories.forEach(function(m, i){
      var levelLabels = ['短期','长期','重要','核心'];
      var levelColors = ['#ccc','#b5c8ab','#c8b5ab','#c8abb5'];
      var lv = (typeof m.level === 'number') ? m.level : 1;
      listHtml += '<div class="cs-mem-item" data-idx="'+i+'">'+
        '<div class="cs-mem-item-bar" style="background:'+levelColors[lv]+';"></div>'+
        '<div class="cs-mem-item-body">'+
          '<div class="cs-mem-item-head">'+
            '<span class="cs-mem-item-level" style="color:'+levelColors[lv]+';">'+levelLabels[lv]+'</span>'+
            '<span class="cs-mem-item-date">'+escSettings(m.date||'')+'</span>'+
          '</div>'+
          '<div class="cs-mem-item-text">'+escSettings(m.text||'').substring(0,120)+(m.text&&m.text.length>120?'…':'')+'</div>'+
        '</div>'+
        '<div class="cs-mem-item-actions">'+
          '<div class="cs-mem-act-btn cs-mem-edit" data-idx="'+i+'"><svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg></div>'+
          '<div class="cs-mem-act-btn cs-mem-del" data-idx="'+i+'"><svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg></div>'+
        '</div>'+
      '</div>';
    });
  }
  listEl.innerHTML = listHtml;
  /* 重新绑定事件 */
  lib.querySelectorAll('.cs-mem-del').forEach(function(btn){
    btn.addEventListener('click', function(){
      var idx = parseInt(btn.dataset.idx, 10);
      memories.splice(idx, 1);
      try{ localStorage.setItem(memKey, JSON.stringify(memories)); }catch(e){}
      refreshMemoryLibraryList(memKey, memories);
    });
  });

  lib.querySelectorAll('.cs-mem-edit').forEach(function(btn){
    btn.addEventListener('click', function(){
      var idx = parseInt(btn.dataset.idx, 10);
      var mem = memories[idx]; if(!mem) return;
      showMemoryEditModal(mem, idx, memKey, memories);
    });
  });
}

/* 绑定记忆库按钮事件 */
function bindMemoryEvents(){
  var manualBtn = settingsEl.querySelector('#csMemManualBtn');
  if(manualBtn) manualBtn.addEventListener('click', showManualSummaryModal);
  var openBtn = settingsEl.querySelector('#csMemOpenBtn');
  if(openBtn) openBtn.addEventListener('click', openMemoryLibrary);
  var maskAddBtn = settingsEl.querySelector('#csMaskAddBtn');
  if(maskAddBtn) maskAddBtn.addEventListener('click', function(){ showMaskEditModal(null); });
}

/* ── 用户面具系统 ── */
function getUserMasks(){
  try{ return JSON.parse(localStorage.getItem('whisperphone_user_masks')||'[]'); }catch(e){ return []; }
}
function saveUserMasks(masks){
  try{ localStorage.setItem('whisperphone_user_masks', JSON.stringify(masks)); }catch(e){}
}

function renderMaskList(contactId, cfg){
  var listEl = settingsEl.querySelector('#csMaskList');
  var activeEl = settingsEl.querySelector('#csMaskActive');
  var activeAvEl = settingsEl.querySelector('#csMaskActiveAvatar');
  var activeNameEl = settingsEl.querySelector('#csMaskActiveName');
  var activeDescEl = settingsEl.querySelector('#csMaskActiveDesc');
  var iconEl = settingsEl.querySelector('#csMaskIcon');
  if(!listEl) return;
  var masks = getUserMasks();
  var selectedId = (cfg && cfg.userMaskId) || '';
  var selected = masks.find(function(m){return m.id === selectedId;});

  if(selected){
    if(activeEl) activeEl.classList.remove('empty');
    if(activeAvEl){
      activeAvEl.innerHTML = escSettings(selected.name.charAt(0));
      if(selected.avatar && window.WhisperDB){
        var avKey = selected.avatar;
        if(avKey.startsWith('data:')){
          activeAvEl.innerHTML = '<img src="'+avKey+'" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">';
        } else if(avKey.startsWith('mask_avatar_')){
          WhisperDB.get(avKey).then(function(d){
            if(d) activeAvEl.innerHTML = '<img src="'+d+'" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">';
          });
        }
      }
    }
    if(activeNameEl) activeNameEl.textContent = selected.name;
    if(activeDescEl) activeDescEl.textContent = (selected.persona||'').substring(0,35)+(selected.persona&&selected.persona.length>35?'…':'');
    if(iconEl) iconEl.classList.add('has');
  } else {
    if(activeEl) activeEl.classList.add('empty');
    if(activeAvEl) activeAvEl.innerHTML = '<svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
    if(activeNameEl) activeNameEl.textContent = '未选择面具';
    if(activeDescEl) activeDescEl.textContent = 'AI 将不知道你是谁';
    if(iconEl) iconEl.classList.remove('has');
  }

  var html = '';
  html += '<div class="cs-mask-opt'+(selectedId===''?' active':'')+'" data-mask-id="">'+
    '<div class="cs-mask-opt-radio"></div>'+
    '<div class="cs-mask-opt-info"><div class="cs-mask-opt-name" style="color:#bbb;">不使用面具</div><div class="cs-mask-opt-desc">AI 将不知道用户的身份</div></div>'+
  '</div>';
  if(masks.length > 0) html += '<div class="cs-mask-sep"></div>';
  masks.forEach(function(m){
    var isActive = m.id === selectedId;
    var avHtml = m.avatar ? '<img class="cs-mask-opt-av-img" data-avkey="'+escSettings(m.avatar)+'" src="" style="width:100%;height:100%;object-fit:cover;border-radius:50%;display:none;">'+escSettings(m.name.charAt(0)) : escSettings(m.name.charAt(0));
    html += '<div class="cs-mask-opt'+(isActive?' active':'')+'" data-mask-id="'+m.id+'">'+
      '<div class="cs-mask-opt-radio"></div>'+
      '<div class="cs-mask-opt-avatar">'+avHtml+'</div>'+
      '<div class="cs-mask-opt-info">'+
        '<div class="cs-mask-opt-name">'+escSettings(m.name)+'</div>'+
        '<div class="cs-mask-opt-desc">'+escSettings((m.persona||'').substring(0,40))+(m.persona&&m.persona.length>40?'…':'')+'</div>'+
      '</div>'+
      '<div class="cs-mask-opt-more" data-mask-id="'+m.id+'"><svg viewBox="0 0 24 24"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg></div>'+
    '</div>';
  });
  listEl.innerHTML = html;

  /* 异步加载面具头像 */
  if(window.WhisperDB){
    listEl.querySelectorAll('.cs-mask-opt-av-img').forEach(function(img){
      var key = img.dataset.avkey;
      if(!key) return;
      if(key.startsWith('data:')){
        img.src = key; img.style.display = '';
        var txt = img.nextSibling; if(txt && txt.nodeType === 3) txt.textContent = '';
      } else if(key.startsWith('mask_avatar_')){
        WhisperDB.get(key).then(function(d){
          if(d){ img.src = d; img.style.display = ''; var txt = img.nextSibling; if(txt && txt.nodeType === 3) txt.textContent = ''; }
        });
      }
    });
  }

  listEl.querySelectorAll('.cs-mask-opt').forEach(function(opt){
    opt.addEventListener('click', function(e){
      if(e.target.closest('.cs-mask-opt-more')) return;
      listEl.querySelectorAll('.cs-mask-opt').forEach(function(o){o.classList.remove('active');});
      opt.classList.add('active');
      var mid = opt.dataset.maskId;
      var sel = masks.find(function(m){return m.id === mid;});
      if(sel){
        if(activeEl) activeEl.classList.remove('empty');
        if(activeAvEl) activeAvEl.textContent = sel.name.charAt(0);
        if(activeNameEl) activeNameEl.textContent = sel.name;
        if(activeDescEl) activeDescEl.textContent = (sel.persona||'').substring(0,35);
        if(iconEl) iconEl.classList.add('has');
      } else {
        if(activeEl) activeEl.classList.add('empty');
        if(activeAvEl) activeAvEl.innerHTML = '<svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
        if(activeNameEl) activeNameEl.textContent = '未选择面具';
        if(activeDescEl) activeDescEl.textContent = 'AI 将不知道你是谁';
        if(iconEl) iconEl.classList.remove('has');
      }
      saveContactSettings();
      liveRefresh();
    });
  });
}

function showMaskActionSheet(mask){
  var old = document.getElementById('csMaskActionSheet');
  if(old) old.parentNode.removeChild(old);
  var sheet = document.createElement('div');
  sheet.id = 'csMaskActionSheet';
  sheet.className = 'cs-mask-sheet-mask';
  sheet.innerHTML =
    '<div class="cs-mask-sheet">'+
      '<div class="cs-mask-sheet-handle"></div>'+
      '<div class="cs-mask-sheet-title">'+escSettings(mask.name)+'</div>'+
      '<div class="cs-mask-sheet-btn edit" id="csMaskSheetEdit"><svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg><span>编辑面具</span></div>'+
      '<div class="cs-mask-sheet-btn del" id="csMaskSheetDel"><svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg><span>删除面具</span></div>'+
      '<div class="cs-mask-sheet-btn cancel" id="csMaskSheetCancel"><span>取消</span></div>'+
    '</div>';
  document.body.appendChild(sheet);
  requestAnimationFrame(function(){ sheet.classList.add('show'); });
  function closeSheet(){
    sheet.classList.remove('show');
    setTimeout(function(){ if(sheet.parentNode) sheet.parentNode.removeChild(sheet); }, 350);
  }
  sheet.addEventListener('click', function(e){ if(e.target === sheet) closeSheet(); });
  sheet.querySelector('#csMaskSheetCancel').addEventListener('click', closeSheet);
  sheet.querySelector('#csMaskSheetEdit').addEventListener('click', function(){
    closeSheet();
    setTimeout(function(){ showMaskEditModal(mask); }, 200);
  });
  sheet.querySelector('#csMaskSheetDel').addEventListener('click', function(){
    closeSheet();
    var masks = getUserMasks();
    var newMasks = masks.filter(function(m){return m.id !== mask.id;});
    saveUserMasks(newMasks);
    var contacts = [];
    try{ contacts = JSON.parse(localStorage.getItem('wp_chat_contacts')||'[]'); }catch(ex){}
    var c = contacts.find(function(x){return x.id === currentContactId;});
    if(c && c.settings && c.settings.userMaskId === mask.id){
      c.settings.userMaskId = '';
      localStorage.setItem('wp_chat_contacts', JSON.stringify(contacts));
    }
    renderMaskList(currentContactId, c ? c.settings : {});
  });
}

function showMaskEditModal(mask){
  var isNew = !mask;
  if(isNew) mask = { id: 'mask_'+Date.now(), name: '', persona: '', avatar: '' };
  var old = document.getElementById('csMaskEditModal');
  if(old) old.parentNode.removeChild(old);
  var avatarKey = mask.avatar || '';
  var modal = document.createElement('div');
  modal.id = 'csMaskEditModal';
  modal.className = 'cs-mem-modal-mask';
  modal.innerHTML =
    '<div class="cs-mem-modal" style="max-width:320px;">'+
      '<div class="cs-mem-modal-title">'+(isNew?'新建面具':'编辑面具')+'</div>'+
      '<div class="cs-mask-avatar-upload" id="csMaskAvatarArea">'+
        '<div class="cs-mask-avatar-ring" id="csMaskAvatarRing">'+
          '<img class="cs-mask-avatar-img" id="csMaskAvatarImg" src="" style="display:none;">'+
          '<div class="cs-mask-avatar-placeholder" id="csMaskAvatarPh">'+
            '<svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>'+
          '</div>'+
        '</div>'+
        '<div class="cs-mask-avatar-badge"><svg viewBox="0 0 24 24"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg></div>'+
      '</div>'+
      '<div class="cs-field" style="margin-bottom:12px;">'+
        '<div class="cs-field-label">面具名称</div>'+
        '<input class="cs-field-input" id="csMaskEditName" value="'+escSettings(mask.name)+'" placeholder="例如：小明、旅行者...">'+
      '</div>'+
      '<div class="cs-field">'+
        '<div class="cs-field-label">用户人设</div>'+
        '<textarea class="cs-field-textarea" id="csMaskEditPersona" style="min-height:120px;" placeholder="描述你扮演的角色设定、性格、背景等...">'+escSettings(mask.persona||'')+'</textarea>'+
      '</div>'+
      '<div class="cs-mem-modal-btns">'+
        '<button class="cd-edit-confirm-btn cancel" id="csMaskEditCancel">取消</button>'+
        '<button class="cd-edit-confirm-btn confirm" id="csMaskEditSave">保存</button>'+
      '</div>'+
    '</div>';
  document.body.appendChild(modal);
  requestAnimationFrame(function(){ modal.classList.add('show'); });

  /* 加载已有头像 */
  var imgEl = modal.querySelector('#csMaskAvatarImg');
  var phEl = modal.querySelector('#csMaskAvatarPh');
  var pendingAvatarData = null;
  if(avatarKey){
    if(avatarKey.startsWith('data:')){
      imgEl.src = avatarKey; imgEl.style.display = ''; phEl.style.display = 'none';
      pendingAvatarData = avatarKey;
    } else if(avatarKey.startsWith('mask_avatar_') && window.WhisperDB){
      WhisperDB.get(avatarKey).then(function(data){
        if(data){ imgEl.src = data; imgEl.style.display = ''; phEl.style.display = 'none'; pendingAvatarData = data; }
      });
    }
  }

  /* 点击上传头像 */
  modal.querySelector('#csMaskAvatarArea').addEventListener('click', function(){
    var inp = document.createElement('input');
    inp.type = 'file'; inp.accept = 'image/*';
    inp.addEventListener('change', function(){
      var f = inp.files && inp.files[0]; if(!f) return;
      var reader = new FileReader();
      reader.onload = function(){
        pendingAvatarData = reader.result;
        imgEl.src = pendingAvatarData;
        imgEl.style.display = '';
        phEl.style.display = 'none';
      };
      reader.readAsDataURL(f);
    });
    inp.click();
  });

  function closeModal(){
    modal.classList.remove('show');
    setTimeout(function(){ if(modal.parentNode) modal.parentNode.removeChild(modal); }, 300);
  }
  modal.querySelector('#csMaskEditCancel').addEventListener('click', closeModal);
  modal.addEventListener('click', function(e){ if(e.target === modal) closeModal(); });
  modal.querySelector('#csMaskEditSave').addEventListener('click', function(){
    var name = modal.querySelector('#csMaskEditName').value.trim();
    var persona = modal.querySelector('#csMaskEditPersona').value.trim();
    if(!name) return;

    function doSave(avatarRef){
      var masks = getUserMasks();
      var existing = masks.find(function(m){return m.id === mask.id;});
      if(existing){ existing.name = name; existing.persona = persona; existing.avatar = avatarRef || existing.avatar || ''; }
      else { masks.push({ id: mask.id, name: name, persona: persona, avatar: avatarRef || '' }); }
      saveUserMasks(masks);
      closeModal();
      var contacts = [];
      try{ contacts = JSON.parse(localStorage.getItem('wp_chat_contacts')||'[]'); }catch(ex){}
      var c = contacts.find(function(x){return x.id === currentContactId;});
      renderMaskList(currentContactId, c ? c.settings : {});
    }

    if(pendingAvatarData && window.WhisperDB){
      var key = 'mask_avatar_' + mask.id;
      WhisperDB.set(key, pendingAvatarData).then(function(){
        doSave(key);
      });
    } else {
      doSave(mask.avatar || '');
    }
  });
}

window.openChatSettings = open;
window.closeChatSettings = close;
window.openMemoryLibrary = function(contactId){
  if(contactId) currentContactId = contactId;
  openMemoryLibrary();
};

})();
