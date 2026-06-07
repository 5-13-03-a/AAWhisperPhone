/* ============ WhisperPhone Theater Mode ============ */
(function(){
'use strict';

var DEFAULT_AVATAR = 'https://i.postimg.cc/yNx1KhWN/IMG-20260528-045634.jpg';
var theaterEl = null;
var built = false;
var cId = null;

function esc(s){var d=document.createElement('div');d.textContent=s;return d.innerHTML;}
function timeNow(){var d=new Date();return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');}
function fullTime(){var d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()+' '+timeNow();}

function getContact(id){
  try{var c=JSON.parse(localStorage.getItem('wp_chat_contacts')||'[]');return c.find(function(x){return x.id===id;})||null;}catch(e){return null;}
}
function getAvatar(c){return (c&&c.settings&&c.settings.avatar)?c.settings.avatar:'';}
function loadAvatarSrc(c,cb){
  if(!c||!c.settings||!c.settings.avatar){cb(DEFAULT_AVATAR);return;}
  var av=c.settings.avatar;
  if(av.startsWith('data:')){cb(av);return;}
  if(av.startsWith('avatar_')&&window.WhisperDB){WhisperDB.get(av).then(function(d){cb(d||DEFAULT_AVATAR);});return;}
  cb(DEFAULT_AVATAR);
}
function getMaskName(c){
  if(!c||!c.settings||!c.settings.userMaskId)return '';
  try{var masks=JSON.parse(localStorage.getItem('whisperphone_user_masks')||'[]');var m=masks.find(function(x){return x.id===c.settings.userMaskId;});return m?m.name:'';}catch(e){return '';}
}
function getMask(c){
  if(!c||!c.settings||!c.settings.userMaskId)return null;
  try{var masks=JSON.parse(localStorage.getItem('whisperphone_user_masks')||'[]');return masks.find(function(x){return x.id===c.settings.userMaskId;})||null;}catch(e){return null;}
}
function loadMaskAvatarSrc(mask,cb){
  if(!mask||!mask.avatar){cb(null);return;}
  var av=mask.avatar;
  if(av.startsWith('data:')){cb(av);return;}
  if(av.startsWith('mask_avatar_')&&window.WhisperDB){WhisperDB.get(av).then(function(d){cb(d||null);});return;}
  cb(null);
}
function getCharName(c){return (c&&c.settings)?(c.settings.charName||c.settings.realName||c.name):(c?c.name:'角色');}
function getPrompt(c){
  if(!c)return '';
  var s=c.settings||{};var base=s.prompt||'';
  var info=[];
  var cn=s.charName||s.realName||c.name||'';
  if(cn)info.push('你的名字是「'+cn+'」。');
  if(s.personality)info.push('你的性格：'+s.personality+'。');
  if(s.bio)info.push('你的简介：'+s.bio+'。');
  return info.length>0?info.join('')+'\n\n'+base:base;
}
var AI_COLOR_MAP={
  'purple':'linear-gradient(180deg,rgba(180,160,220,0.35),rgba(171,200,181,0.2),transparent)',
  'green':'linear-gradient(180deg,rgba(171,200,181,0.4),rgba(150,190,160,0.2),transparent)',
  'warm':'linear-gradient(180deg,rgba(200,180,171,0.35),rgba(180,160,150,0.2),transparent)',
  'blue':'linear-gradient(180deg,rgba(160,184,200,0.4),rgba(140,170,190,0.2),transparent)',
  'pink':'linear-gradient(180deg,rgba(200,171,181,0.35),rgba(180,150,165,0.2),transparent)',
  'gray':'linear-gradient(180deg,rgba(180,180,180,0.3),rgba(160,160,160,0.15),transparent)'
};
var USER_COLOR_MAP={
  'warm':'linear-gradient(180deg,rgba(200,180,171,0.3),rgba(180,160,220,0.15),transparent)',
  'purple':'linear-gradient(180deg,rgba(180,160,220,0.3),rgba(160,140,200,0.15),transparent)',
  'green':'linear-gradient(180deg,rgba(171,200,181,0.3),rgba(150,190,160,0.15),transparent)',
  'blue':'linear-gradient(180deg,rgba(160,184,200,0.3),rgba(140,170,190,0.15),transparent)',
  'gray':'linear-gradient(180deg,rgba(180,180,180,0.25),rgba(160,160,160,0.1),transparent)'
};
var NR_COLOR_MAP={
  'purple':'rgba(150,130,180,0.55)',
  'green':'rgba(120,155,130,0.55)',
  'warm':'rgba(170,145,130,0.55)',
  'blue':'rgba(130,145,170,0.55)',
  'gray':'rgba(150,150,150,0.45)'
};
var AI_CARD_BG_MAP={
  'default':'rgba(250,249,253,0.8)',
  'purple':'rgba(248,244,255,0.85)',
  'green':'rgba(246,253,249,0.85)',
  'warm':'rgba(255,251,247,0.85)',
  'blue':'rgba(246,250,255,0.85)',
  'pink':'rgba(255,248,251,0.85)'
};
var USER_CARD_BG_MAP={
  'default':'rgba(252,251,249,0.8)',
  'warm':'rgba(255,251,247,0.85)',
  'purple':'rgba(251,248,255,0.85)',
  'green':'rgba(249,255,251,0.85)',
  'blue':'rgba(249,252,255,0.85)'
};
var AI_NAME_COLOR_MAP={
  'default':'rgba(130,110,170,0.7)',
  'purple':'#7b5eaa','green':'#4e8a5c','warm':'#a07548',
  'blue':'#4a78a8','pink':'#a85878','gray':'#808080'
};
var USER_NAME_COLOR_MAP={
  'default':'rgba(170,140,120,0.6)',
  'warm':'#a07548','purple':'#7b5eaa','green':'#4e8a5c',
  'blue':'#4a78a8','pink':'#a85878','gray':'#808080'
};
var DIALOGUE_TEXT_MAP={
  'default':'#3a3a3c','dark':'#222222','gray':'#666666',
  'purple':'#5a4a7a','green':'#3e6a4c','warm':'#7a5a3c'
};
var LAYER_COLOR_MAP={
  'default':'rgba(150,130,180,0.55)','purple':'#7b5eaa','green':'#4e8a5c',
  'warm':'#a07548','gray':'#999999','gold':'#c9a85a'
};
var QUOTE_MARK_MAP={
  'default':'rgba(150,130,180,0.5)','purple':'#7b5eaa','green':'#4e8a5c',
  'warm':'#a07548','pink':'#a85878','gray':'#999999'
};
var DIALOGUE_BG_HEX_MAP={
  'default':'#f0f0f0','gray':'#e5e5e5','purple':'#ece6f5',
  'green':'#e6f5ec','warm':'#f5efe6','blue':'#e6eef5'
};
function hexToRgbaOpacity(hex,opacity){
  var r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);
  return 'rgba('+r+','+g+','+b+','+(opacity/100)+')';
}

function hexToSideGrad(hex){return 'linear-gradient(180deg,'+hex+','+hex+'66,transparent)';}
function hexToBgRgba(hex){
  var r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);
  return 'rgba('+r+','+g+','+b+',0.12)';
}
function getTheaterColors(){
  var c=getContact(cId);var cfg=(c&&c.settings)||{};
  var aiKey=cfg.theaterAiColor||'purple';
  var userKey=cfg.theaterUserColor||'warm';
  var nrKey=cfg.theaterNrColor||'purple';
  var aiBgKey=cfg.theaterAiCardBg||'default';
  var userBgKey=cfg.theaterUserCardBg||'default';
  var aiNameKey=cfg.theaterAiNameColor||'default';
  var userNameKey=cfg.theaterUserNameColor||'default';
  var dialogueTextKey=cfg.theaterDialogueText||'default';
  var layerKey=cfg.theaterLayerColor||'default';
  var quoteKey=cfg.theaterQuoteMark||'default';
  var dialogueBgKey=cfg.theaterDialogueBg||'default';
  var dialogueBgOpacity=(typeof cfg.theaterDialogueBgOpacity==='number')?cfg.theaterDialogueBgOpacity:8;
  var dbgHex=dialogueBgKey==='custom'&&cfg.theaterDialogueBgCustom?cfg.theaterDialogueBgCustom:(DIALOGUE_BG_HEX_MAP[dialogueBgKey]||DIALOGUE_BG_HEX_MAP.default);
  return {
    ai:aiKey==='custom'&&cfg.theaterAiColorCustom?hexToSideGrad(cfg.theaterAiColorCustom):AI_COLOR_MAP[aiKey]||AI_COLOR_MAP.purple,
    user:userKey==='custom'&&cfg.theaterUserColorCustom?hexToSideGrad(cfg.theaterUserColorCustom):USER_COLOR_MAP[userKey]||USER_COLOR_MAP.warm,
    nr:nrKey==='custom'&&cfg.theaterNrColorCustom?cfg.theaterNrColorCustom:NR_COLOR_MAP[nrKey]||NR_COLOR_MAP.purple,
    aiBg:aiBgKey==='custom'&&cfg.theaterAiCardBgCustom?hexToBgRgba(cfg.theaterAiCardBgCustom):AI_CARD_BG_MAP[aiBgKey]||AI_CARD_BG_MAP.default,
    userBg:userBgKey==='custom'&&cfg.theaterUserCardBgCustom?hexToBgRgba(cfg.theaterUserCardBgCustom):USER_CARD_BG_MAP[userBgKey]||USER_CARD_BG_MAP.default,
    aiName:aiNameKey==='custom'&&cfg.theaterAiNameColorCustom?cfg.theaterAiNameColorCustom:AI_NAME_COLOR_MAP[aiNameKey]||AI_NAME_COLOR_MAP.default,
    userName:userNameKey==='custom'&&cfg.theaterUserNameColorCustom?cfg.theaterUserNameColorCustom:USER_NAME_COLOR_MAP[userNameKey]||USER_NAME_COLOR_MAP.default,
    dialogueText:dialogueTextKey==='custom'&&cfg.theaterDialogueTextCustom?cfg.theaterDialogueTextCustom:(DIALOGUE_TEXT_MAP[dialogueTextKey]||DIALOGUE_TEXT_MAP.default),
    layer:layerKey==='custom'&&cfg.theaterLayerColorCustom?cfg.theaterLayerColorCustom:(LAYER_COLOR_MAP[layerKey]||LAYER_COLOR_MAP.default),
    quote:quoteKey==='custom'&&cfg.theaterQuoteMarkCustom?cfg.theaterQuoteMarkCustom:(QUOTE_MARK_MAP[quoteKey]||QUOTE_MARK_MAP.default),
    dialogueBg:hexToRgbaOpacity(dbgHex,dialogueBgOpacity)
  };
}

function saveTheaterColor(group,colorId,customHex){
  try{
    var contacts=JSON.parse(localStorage.getItem('wp_chat_contacts')||'[]');
    var c=contacts.find(function(x){return x.id===cId;});
    if(!c)return;if(!c.settings)c.settings={};
    if(group==='ai'){c.settings.theaterAiColor=colorId;if(customHex)c.settings.theaterAiColorCustom=customHex;}
    else if(group==='user'){c.settings.theaterUserColor=colorId;if(customHex)c.settings.theaterUserColorCustom=customHex;}
    else if(group==='nr'){c.settings.theaterNrColor=colorId;if(customHex)c.settings.theaterNrColorCustom=customHex;}
    else if(group==='aiBg'){c.settings.theaterAiCardBg=colorId;if(customHex)c.settings.theaterAiCardBgCustom=customHex;}
    else if(group==='userBg'){c.settings.theaterUserCardBg=colorId;if(customHex)c.settings.theaterUserCardBgCustom=customHex;}
    else if(group==='aiName'){c.settings.theaterAiNameColor=colorId;if(customHex)c.settings.theaterAiNameColorCustom=customHex;}
    else if(group==='userName'){c.settings.theaterUserNameColor=colorId;if(customHex)c.settings.theaterUserNameColorCustom=customHex;}
    else if(group==='dialogueText'){c.settings.theaterDialogueText=colorId;if(customHex)c.settings.theaterDialogueTextCustom=customHex;}
    else if(group==='layerColor'){c.settings.theaterLayerColor=colorId;if(customHex)c.settings.theaterLayerColorCustom=customHex;}
    else if(group==='quoteMark'){c.settings.theaterQuoteMark=colorId;if(customHex)c.settings.theaterQuoteMarkCustom=customHex;}
    else if(group==='dialogueBg'){c.settings.theaterDialogueBg=colorId;if(customHex)c.settings.theaterDialogueBgCustom=customHex;}
    localStorage.setItem('wp_chat_contacts',JSON.stringify(contacts));
  }catch(e){}
}

function getAPIConfig(){
  var cfg={key:'',url:'https://api.openai.com/v1/chat/completions',model:'gpt-4o-mini'};
  if(window._wpApiCache){var d=window._wpApiCache;if(d.apiKey)cfg.key=d.apiKey;if(d.baseUrl){var u=d.baseUrl.replace(/\/+$/,'');if(!/\/chat\/completions/.test(u)){if(!/\/v1$/.test(u))u+='/v1';u+='/chat\/completions';}cfg.url=u;}if(d.model)cfg.model=d.model;}
  try{var s=localStorage.getItem('whisperphone_api');if(s){var dd=JSON.parse(s);if(!cfg.key&&dd.key)cfg.key=dd.key;if(dd.url&&!window._wpApiCache)cfg.url=dd.url;if(!cfg.model&&dd.model)cfg.model=dd.model;}}catch(e){}
  return cfg;
}

/* 剧场对话独立存储（IndexedDB / WhisperDB，内存缓存 + 异步持久化） */
var _theaterConvs=null;
var THEATER_DB_KEY='wp_theater_convs';
function loadTheaterConvs(cb){
  if(_theaterConvs){if(cb)cb();return;}
  if(window.WhisperDB){
    WhisperDB.get(THEATER_DB_KEY).then(function(data){
      if(data&&typeof data==='object'){
        _theaterConvs=data;
      } else {
        try{_theaterConvs=JSON.parse(localStorage.getItem(THEATER_DB_KEY)||'{}');}catch(e){_theaterConvs={};}
        if(Object.keys(_theaterConvs).length>0)saveTheaterConvs();
      }
      if(cb)cb();
    }).catch(function(){
      try{_theaterConvs=JSON.parse(localStorage.getItem(THEATER_DB_KEY)||'{}');}catch(e){_theaterConvs={};}
      if(cb)cb();
    });
  } else {
    try{_theaterConvs=JSON.parse(localStorage.getItem(THEATER_DB_KEY)||'{}');}catch(e){_theaterConvs={};}
    if(cb)cb();
  }
}
function saveTheaterConvs(){
  if(!_theaterConvs)return;
  if(window.WhisperDB){
    WhisperDB.set(THEATER_DB_KEY,_theaterConvs).catch(function(){});
  }
  try{localStorage.setItem(THEATER_DB_KEY,JSON.stringify(_theaterConvs));}catch(e){}
}
function getConvs(){return _theaterConvs||{};}
function getMsgs(){var convs=getConvs();return convs[cId]||[];}
function setMsgs(msgs){if(!_theaterConvs)_theaterConvs={};_theaterConvs[cId]=msgs;saveTheaterConvs();}

var SIGN_FONT_STYLE='font-family:\'Dancing Script\',cursive!important;';
function polAvatar(src,size){
  return '<div class="th-pol '+size+'"><div class="th-pol-back"></div><div class="th-pol-front"><img src="'+src+'"><div class="th-pol-sign" style="'+SIGN_FONT_STYLE+'">whisper</div></div></div>';
}
function polLetter(ch,size){
  return '<div class="th-pol '+size+'"><div class="th-pol-back"></div><div class="th-pol-front"><div class="th-pol-letter">'+esc(ch)+'</div><div class="th-pol-sign" style="'+SIGN_FONT_STYLE+'">moment</div></div></div>';
}

function buildHTML(){
  return ''+
  '<div class="th-bg">'+
    '<div class="th-bg-glow1"></div><div class="th-bg-glow2"></div>'+
    '<div class="th-bg-line"></div><div class="th-bg-line2"></div>'+
    '<svg class="th-bg-star th-bg-s1" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>'+
    '<svg class="th-bg-star th-bg-s2" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>'+
    '<svg class="th-bg-star th-bg-s3" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>'+
  '</div>'+
  '<div class="th-header">'+
    '<div class="th-hdr-back" id="thBack"><svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg></div>'+
    '<div class="th-hdr-info"><div class="th-hdr-title" id="thTitle">剧场</div><div class="th-hdr-sub" id="thSub">THEATER</div></div>'+
    '<div class="th-pol sz-h" id="thAvatar"><div class="th-pol-back"></div><div class="th-pol-front"><img src="'+DEFAULT_AVATAR+'" id="thAvatarImg"><div class="th-pol-sign" style="font-family:\'Dancing Script\',cursive!important;">whisper</div></div></div>'+
    '<div class="th-hdr-set" id="thSetBtn"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9c.26.604.852.997 1.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg></div>'+
  '</div>'+
  '<div class="th-panel-mask" id="thPanelMask"><div class="th-panel" id="thPanel"></div></div>'+
  '<div class="th-body" id="thBody"></div>'+
  '<div class="th-input-area">'+
    '<div class="th-input-row">'+
      '<div class="th-invoke-btn" id="thInvoke"><svg viewBox="0 0 24 24"><path d="M9 2l2 4.5 5 .7-3.6 3.3.9 5L9 13l-4.3 2.5.9-5L2 7.2l5-.7L9 2z"/><path d="M18 10l1.2 2.7 3 .4-2.2 2 .5 3-2.5-1.5-2.5 1.5.5-3-2.2-2 3-.4L18 10z" opacity="0.4"/></svg></div>'+
      '<textarea class="th-input-box" id="thInput" placeholder="书写你的故事..." rows="1"></textarea>'+
      '<div class="th-send-btn" id="thSend"><svg viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg></div>'+
    '</div>'+
    '<div class="th-input-hint">'+
      '<div class="th-hint-item" data-hint="narration">✦ 旁白</div>'+
      '<div class="th-hint-item" data-hint="rewrite">⟲ 重写</div>'+
      '<div class="th-hint-item" data-hint="continue">◈ 续写</div>'+
    '</div>'+
  '</div>';
}

function ensure(){
  if(built)return;built=true;
  theaterEl=document.createElement('div');
  theaterEl.className='th-theater';theaterEl.id='thTheater';
  theaterEl.innerHTML=buildHTML();
  document.body.appendChild(theaterEl);
  bindEvents();
}

function bindEvents(){
  theaterEl.querySelector('#thBack').addEventListener('click',closeTheater);
  theaterEl.querySelector('#thSetBtn').addEventListener('click',function(e){e.stopPropagation();theaterEl.querySelector('#thPanelMask').classList.toggle('show');});
  theaterEl.querySelector('#thPanelMask').addEventListener('click',function(e){if(e.target===this)this.classList.remove('show');});
  theaterEl.querySelector('#thSend').addEventListener('click',sendMsg);
  theaterEl.querySelector('#thInvoke').addEventListener('click',invokeAI);

  var inp=theaterEl.querySelector('#thInput');
  inp.addEventListener('input',function(){this.style.height='auto';this.style.height=Math.min(this.scrollHeight,100)+'px';});
  inp.addEventListener('keydown',function(e){
    if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();var t=inp.value.trim();if(!t)return;sendMsg();}
  });

  theaterEl.querySelectorAll('.th-hint-item').forEach(function(h){
    h.addEventListener('click',function(){
      var hint=h.dataset.hint;
      if(hint==='narration'){
        var inp2=theaterEl.querySelector('#thInput');
        var val=inp2.value;
        var openCount=(val.match(/（/g)||[]).length;
        var closeCount=(val.match(/）/g)||[]).length;
        var insertChar=(openCount>closeCount)?'）':'（';
        var start=inp2.selectionStart;
        var end=inp2.selectionEnd;
        inp2.value=val.slice(0,start)+insertChar+val.slice(end);
        var newPos=start+insertChar.length;
        inp2.focus();
        inp2.setSelectionRange(newPos,newPos);
        inp2.style.height='auto';
        inp2.style.height=Math.min(inp2.scrollHeight,100)+'px';
      }
      else if(hint==='rewrite'){retryLast();}
      else if(hint==='continue'){invokeAI();}
    });
  });

  /* 卡片长按 */
  var longTimer,startX,startY,longPressed=false;
  theaterEl.querySelector('#thBody').addEventListener('pointerdown',function(e){
    var card=e.target.closest('.th-card');if(!card||card.classList.contains('narration'))return;
    startX=e.clientX;startY=e.clientY;
    longTimer=setTimeout(function(){
      if(navigator.vibrate)navigator.vibrate(10);
      card.classList.add('act-show');
      longPressed=true;
    },400);
  },{passive:true});
  theaterEl.querySelector('#thBody').addEventListener('pointermove',function(e){
    if(!longTimer)return;
    if(Math.abs(e.clientX-startX)>8||Math.abs(e.clientY-startY)>8){clearTimeout(longTimer);longTimer=null;}
  });
  theaterEl.querySelector('#thBody').addEventListener('pointerup',function(){clearTimeout(longTimer);longTimer=null;});
  document.addEventListener('click',function(e){
    if(longPressed){longPressed=false;return;}
    if(!e.target.closest('.th-card-acts')&&!e.target.closest('.th-card-act')){
      if(theaterEl)theaterEl.querySelectorAll('.th-card.act-show').forEach(function(c){c.classList.remove('act-show');});
    }
  });
}

function renderPanel(){
  var c=getContact(cId);var cfg=(c&&c.settings)||{};
  var mask=getMask(c);var maskName=mask?mask.name:'未选择';
  var masks=[];try{masks=JSON.parse(localStorage.getItem('whisperphone_user_masks')||'[]');}catch(e){}
  var books=[];try{books=JSON.parse(localStorage.getItem('whisperphone_worldbooks_v1')||'[]');}catch(e){}
  var enabledWb=(cfg.worldBooks)||[];

  var html='<div class="th-pnl-title">剧场设置</div>';
  html+='<div class="th-pnl-row"><div class="th-pnl-label">AI 回复字数</div><input class="th-pnl-input" id="thWordLimit" type="number" value="'+(cfg.theaterWordLimit||200)+'" min="50" max="2000"><div class="th-pnl-val">字</div></div>';
  html+='<div class="th-pnl-row"><div class="th-pnl-label">聊天室上下文</div><input class="th-pnl-input" id="thChatContext" type="number" value="'+(cfg.contextRounds||20)+'" min="0" max="100"><div class="th-pnl-val">条</div></div>';
  html+='<div class="th-pnl-sep"></div>';

  html+='<div class="th-pnl-sub">用户面具</div>';
  html+='<select class="th-pnl-select" id="thMaskSelect">';
  html+='<option value="">不使用面具</option>';
  masks.forEach(function(m){html+='<option value="'+m.id+'"'+(cfg.userMaskId===m.id?' selected':'')+'>'+esc(m.name)+'</option>';});
  html+='</select>';

  if(books.length>0){
    html+='<div class="th-pnl-sub">世界书</div>';
    books.forEach(function(b){
      var isOn=enabledWb.indexOf(b.id)>=0;
      html+='<div class="th-pnl-row" style="padding:4px 0;"><div class="th-pnl-label">'+esc(b.name)+'</div><div class="th-pnl-sw'+(isOn?' on':'')+'" data-wbid="'+b.id+'"></div></div>';
    });
  }

  html+='<div class="th-pnl-sep"></div>';
  html+='<div class="th-color-master" id="thColorMaster">';
  html+='<div class="th-cm-hdr" id="thColorToggle"><span>颜色设置</span><svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg></div>';
  html+='<div class="th-cm-body">';

  function colorRow(label,groupId,colors,curId,customVal){
    html+='<div class="th-cm-label">'+label+'</div>';
    html+='<div class="th-color-row">';
    colors.forEach(function(c){
      var isCard=c.card;
      html+='<div class="th-color-item'+(isCard?' card':'')+(c.id===curId?' active':'')+'" style="background:'+c.bg+';" data-color="'+c.id+'" data-group="'+groupId+'"></div>';
    });
    var cHex=customVal||'#cccccc';
    html+='<div class="th-color-item custom'+(curId==='custom'?' active':'')+'" style="background:'+(curId==='custom'?cHex:'transparent')+';" data-color="custom" data-group="'+groupId+'">';
    html+='<input type="color" class="th-cpick" value="'+cHex+'" data-group="'+groupId+'">';
    html+='<span class="th-cplus">+</span>';
    html+='</div>';
    html+='</div>';
  }

  colorRow('AI 侧边','ai',[
    {id:'purple',bg:'#b4a0db'},{id:'green',bg:'#8ec5a0'},{id:'warm',bg:'#d4b89c'},
    {id:'blue',bg:'#96b8d8'},{id:'pink',bg:'#d8a0b4'},{id:'gray',bg:'#b8b8b8'}
  ],cfg.theaterAiColor||'purple',cfg.theaterAiColorCustom);

  colorRow('AI 卡片','aiBg',[
    {id:'default',bg:'#f0eef5',card:true},{id:'purple',bg:'#e8ddf8',card:true},{id:'green',bg:'#ddf5e6',card:true},
    {id:'warm',bg:'#f5eddd',card:true},{id:'blue',bg:'#ddeaf5',card:true},{id:'pink',bg:'#f5dde6',card:true}
  ],cfg.theaterAiCardBg||'default',cfg.theaterAiCardBgCustom);

  colorRow('旁白文字','nr',[
    {id:'purple',bg:'#9580b8'},{id:'green',bg:'#6d9e7c'},{id:'warm',bg:'#b09070'},
    {id:'blue',bg:'#7090b0'},{id:'gray',bg:'#909090'}
  ],cfg.theaterNrColor||'purple',cfg.theaterNrColorCustom);

  colorRow('用户侧边','user',[
    {id:'warm',bg:'#d4b89c'},{id:'purple',bg:'#b4a0db'},{id:'green',bg:'#8ec5a0'},
    {id:'blue',bg:'#96b8d8'},{id:'gray',bg:'#b8b8b8'}
  ],cfg.theaterUserColor||'warm',cfg.theaterUserColorCustom);

  colorRow('用户卡片','userBg',[
    {id:'default',bg:'#f2f0ec',card:true},{id:'warm',bg:'#f5eddd',card:true},{id:'purple',bg:'#e8ddf8',card:true},
    {id:'green',bg:'#ddf5e6',card:true},{id:'blue',bg:'#ddeaf5',card:true}
  ],cfg.theaterUserCardBg||'default',cfg.theaterUserCardBgCustom);

  colorRow('AI 名字','aiName',[
    {id:'default',bg:'#8b6eb5'},{id:'purple',bg:'#7b5eaa'},{id:'green',bg:'#4e8a5c'},
    {id:'warm',bg:'#a07548'},{id:'blue',bg:'#4a78a8'},{id:'pink',bg:'#a85878'},{id:'gray',bg:'#808080'}
  ],cfg.theaterAiNameColor||'default',cfg.theaterAiNameColorCustom);

  colorRow('用户名字','userName',[
    {id:'default',bg:'#a08060'},{id:'warm',bg:'#a07548'},{id:'purple',bg:'#7b5eaa'},
    {id:'green',bg:'#4e8a5c'},{id:'blue',bg:'#4a78a8'},{id:'pink',bg:'#a85878'},{id:'gray',bg:'#808080'}
  ],cfg.theaterUserNameColor||'default',cfg.theaterUserNameColorCustom);

  colorRow('说话文字','dialogueText',[
    {id:'default',bg:'#3a3a3c'},{id:'dark',bg:'#222222'},{id:'gray',bg:'#666666'},
    {id:'purple',bg:'#5a4a7a'},{id:'green',bg:'#3e6a4c'},{id:'warm',bg:'#7a5a3c'}
  ],cfg.theaterDialogueText||'default',cfg.theaterDialogueTextCustom);

  colorRow('层级标记','layerColor',[
    {id:'default',bg:'#9682b4'},{id:'purple',bg:'#7b5eaa'},{id:'green',bg:'#4e8a5c'},
    {id:'warm',bg:'#a07548'},{id:'gray',bg:'#999999'},{id:'gold',bg:'#c9a85a'}
  ],cfg.theaterLayerColor||'default',cfg.theaterLayerColorCustom);

  colorRow('说话引号','quoteMark',[
    {id:'default',bg:'#9682b4'},{id:'purple',bg:'#7b5eaa'},{id:'green',bg:'#4e8a5c'},
    {id:'warm',bg:'#a07548'},{id:'pink',bg:'#a85878'},{id:'gray',bg:'#999999'}
  ],cfg.theaterQuoteMark||'default',cfg.theaterQuoteMarkCustom);

  colorRow('说话底色','dialogueBg',[
    {id:'default',bg:'#f0f0f0',card:true},{id:'gray',bg:'#e5e5e5',card:true},{id:'purple',bg:'#ece6f5',card:true},
    {id:'green',bg:'#e6f5ec',card:true},{id:'warm',bg:'#f5efe6',card:true},{id:'blue',bg:'#e6eef5',card:true}
  ],cfg.theaterDialogueBg||'default',cfg.theaterDialogueBgCustom);

  var curOpacity=(typeof cfg.theaterDialogueBgOpacity==='number')?cfg.theaterDialogueBgOpacity:8;
  html+='<div class="th-cm-label">说话底色透明度</div>';
  html+='<div class="th-opacity-row"><input type="range" class="th-opacity-slider" id="thDlgBgOpacity" min="0" max="100" value="'+curOpacity+'"><span class="th-opacity-val" id="thDlgBgOpacityVal">'+curOpacity+'%</span></div>';

  html+='</div></div>';

  html+='<div class="th-pnl-sep"></div>';
  html+='<div class="th-pnl-sub">记忆</div>';
  html+='<div class="th-pnl-row" style="padding:4px 0;"><div class="th-pnl-label">自动总结</div><div class="th-pnl-sw'+(cfg.memAutoSumm?' on':'')+'" id="thAutoSumm"></div></div>';
  html+='<div class="th-pnl-row" style="padding:4px 0;"><div class="th-pnl-label">滑落条数</div><input class="th-pnl-input" id="thSlide" type="number" value="'+(cfg.memSlideCount||30)+'" min="5" max="200"></div>';
  html+='<div style="padding-top:8px;"><div class="th-pnl-btn" id="thManualSumm">手动总结</div></div>';
  html+='<div style="padding-top:6px;"><div class="th-pnl-btn" id="thMemLib">进入记忆库</div></div>';

  theaterEl.querySelector('#thPanel').innerHTML=html;

  /* 绑定面板事件 */
  theaterEl.querySelectorAll('#thPanel .th-pnl-sw').forEach(function(sw){
    sw.addEventListener('click',function(){sw.classList.toggle('on');});
  });
  var colorToggle=theaterEl.querySelector('#thColorToggle');
  if(colorToggle){
    colorToggle.addEventListener('click',function(){
      theaterEl.querySelector('#thColorMaster').classList.toggle('open');
    });
  }
  theaterEl.querySelectorAll('#thPanel .th-color-item:not(.custom)').forEach(function(item){
    item.addEventListener('click',function(e){
      e.stopPropagation();
      var row=item.parentElement;
      row.querySelectorAll('.th-color-item').forEach(function(c){c.classList.remove('active');});
      item.classList.add('active');
      var colorGroup=item.dataset.group;
      var colorId=item.dataset.color;
      saveTheaterColor(colorGroup,colorId);
      renderMsgs();
    });
  });
  theaterEl.querySelectorAll('#thPanel .th-color-item.custom').forEach(function(item){
    var picker=item.querySelector('.th-cpick');
    item.addEventListener('click',function(e){
      e.stopPropagation();
      picker.click();
    });
    picker.addEventListener('click',function(e){e.stopPropagation();});
    picker.addEventListener('input',function(e){
      e.stopPropagation();
      var hex=picker.value;
      item.style.background=hex;
      var row=item.parentElement;
      row.querySelectorAll('.th-color-item').forEach(function(c){c.classList.remove('active');});
      item.classList.add('active');
      var colorGroup=item.dataset.group;
      saveTheaterColor(colorGroup,'custom',hex);
      renderMsgs();
    });
  });

  /* 说话底色透明度滑块 */
  var opacitySlider=theaterEl.querySelector('#thDlgBgOpacity');
  var opacityVal=theaterEl.querySelector('#thDlgBgOpacityVal');
  if(opacitySlider){
    opacitySlider.addEventListener('input',function(){
      if(opacityVal)opacityVal.textContent=opacitySlider.value+'%';
    });
    opacitySlider.addEventListener('change',function(){
      try{
        var contacts=JSON.parse(localStorage.getItem('wp_chat_contacts')||'[]');
        var contact=contacts.find(function(x){return x.id===cId;});
        if(!contact)return;if(!contact.settings)contact.settings={};
        contact.settings.theaterDialogueBgOpacity=parseInt(opacitySlider.value,10);
        localStorage.setItem('wp_chat_contacts',JSON.stringify(contacts));
        renderMsgs();
      }catch(e){}
    });
  }
  var memLib=theaterEl.querySelector('#thMemLib');
  if(memLib)memLib.addEventListener('click',function(){
    theaterEl.querySelector('#thPanelMask').classList.remove('show');
    if(typeof window.openMemoryLibrary==='function')window.openMemoryLibrary(cId);
    else if(typeof window.openChatSettings==='function')window.openChatSettings(cId);
  });

  /* 自动总结开关 + 滑落条数（与聊天室共用同一份设置） */
  var autoSummSw=theaterEl.querySelector('#thAutoSumm');
  if(autoSummSw){
    autoSummSw.addEventListener('click',function(){
      saveTheaterMemSetting('memAutoSumm',autoSummSw.classList.contains('on'));
    });
  }
  var slideEl=theaterEl.querySelector('#thSlide');
  if(slideEl){
    slideEl.addEventListener('change',function(){
      var sc=parseInt(slideEl.value,10);
      saveTheaterMemSetting('memSlideCount',isNaN(sc)?30:Math.max(5,Math.min(200,sc)));
    });
  }
  /* 手动总结 */
  var manualSumm=theaterEl.querySelector('#thManualSumm');
  if(manualSumm)manualSumm.addEventListener('click',function(){
    showTheaterSummaryModal();
  });

  /* 保存字数和上下文设置 */
  var wordLimitEl=theaterEl.querySelector('#thWordLimit');
  var chatContextEl=theaterEl.querySelector('#thChatContext');
  function saveTheaterSettings(){
    try{
      var contacts=JSON.parse(localStorage.getItem('wp_chat_contacts')||'[]');
      var contact=contacts.find(function(x){return x.id===cId;});
      if(!contact)return;if(!contact.settings)contact.settings={};
      if(wordLimitEl){
        var wl=parseInt(wordLimitEl.value,10);
        contact.settings.theaterWordLimit=isNaN(wl)?200:Math.max(50,Math.min(2000,wl));
      }
      if(chatContextEl){
        var cc=parseInt(chatContextEl.value,10);
        contact.settings.contextRounds=isNaN(cc)?20:Math.max(0,Math.min(100,cc));
      }
      localStorage.setItem('wp_chat_contacts',JSON.stringify(contacts));
    }catch(e){}
  }
  if(wordLimitEl)wordLimitEl.addEventListener('change',saveTheaterSettings);
  if(chatContextEl)chatContextEl.addEventListener('change',saveTheaterSettings);

  /* 面具选择保存 */
  var maskSelect=theaterEl.querySelector('#thMaskSelect');
  if(maskSelect){
    maskSelect.addEventListener('change',function(){
      try{
        var contacts=JSON.parse(localStorage.getItem('wp_chat_contacts')||'[]');
        var contact=contacts.find(function(x){return x.id===cId;});
        if(!contact)return;if(!contact.settings)contact.settings={};
        contact.settings.userMaskId=maskSelect.value;
        localStorage.setItem('wp_chat_contacts',JSON.stringify(contacts));
        renderMsgs();
      }catch(e){}
    });
  }
}

function renderMsgs(){
  var body=theaterEl.querySelector('#thBody');
  var msgs=getMsgs();
  var c=getContact(cId);
  var charName=getCharName(c);
  var maskName=getMaskName(c)||'我';
  var maskChar=maskName.charAt(0)||'我';

  if(msgs.length===0){
    body.innerHTML='<div class="th-empty"><div class="th-empty-icon"><svg viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg></div><div class="th-empty-text">开始你的故事</div></div>';
    return;
  }

  var html='<div class="th-timestamp">'+msgs[0].time.split(' ')[0]+'</div>';
  var mask=getMask(c);
  loadAvatarSrc(c,function(avSrc){
    loadMaskAvatarSrc(mask,function(maskAvSrc){
      var colors=getTheaterColors();
      msgs.forEach(function(m,i){
        var t=(m.time||'').split(' ')[1]||'';
        var wc=m.text.length;
        if(m.role==='narration'){
          html+='<div class="th-card narration" data-idx="'+i+'"><div class="th-card-text">'+formatNarration(esc(m.text),colors.nr)+'</div></div>';
          return;
        }
        var isUser=(m.role==='user');
        var isAI=(m.role!=='user'&&m.role!=='narration');
        var cls=isUser?'user':'ai';
        var avatar=isUser?(maskAvSrc?polAvatar(maskAvSrc,'sz-c'):polLetter(maskChar,'sz-c')):polAvatar(avSrc,'sz-c');
        var name=isUser?esc(maskName):esc(charName);
        var textHtml=formatNarration(esc(m.text),colors.nr);
        var sideColor=isUser?colors.user:colors.ai;
        var cardBg=isUser?colors.userBg:colors.aiBg;
        var nameColor=isUser?colors.userName:colors.aiName;
        var retryBtn='<div class="th-card-act" data-act="retry" data-idx="'+i+'" title="重新生成"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4"/></svg></div>';
        var layerNo=0;
        for(var li=0;li<=i;li++){
          if(msgs[li].role!=='narration')layerNo++;
        }
        html+='<div class="th-card '+cls+'" data-idx="'+i+'" style="--th-side:'+sideColor+';--th-card-bg:'+cardBg+';--th-dialogue-text:'+colors.dialogueText+';--th-dialogue-bg:'+colors.dialogueBg+';--th-quote-mark:'+colors.quote+';--th-layer:'+colors.layer+';">';
        html+='<div class="th-card-head">'+avatar+'<div class="th-card-name" style="color:'+nameColor+';">'+name+'<span class="th-card-layer"><svg class="th-layer-star" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>'+layerNo+'</span></div><div class="th-card-time">'+t+'</div></div>';
        html+='<div class="th-card-text">'+textHtml+'</div>';
        html+='<div class="th-card-line"></div>';
        html+='<div class="th-card-acts">';
        html+=retryBtn;
        html+='<div class="th-card-act" data-act="rewind" data-idx="'+i+'" title="回溯到此"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 8 14"/></svg></div>';
        html+='<div class="th-card-act" data-act="edit" data-idx="'+i+'" title="编辑"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/></svg></div>';
        html+='<div class="th-card-act del" data-act="delete" data-idx="'+i+'" title="删除"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></div>';
        html+='<div class="th-card-act-sep"></div>';
        html+='<div class="th-card-wc">'+wc+'字</div>';
        html+='</div>';
        html+='</div>';
        if(i<msgs.length-1&&i%4===3){
          html+='<div class="th-divider"><div class="th-divider-line"></div><div class="th-divider-dot"></div><div class="th-divider-dot"></div><div class="th-divider-dot"></div><div class="th-divider-line"></div></div>';
        }
      });
      body.innerHTML=html;
      body.scrollTop=body.scrollHeight;
      bindCardActions();
    });
  });
}

function formatNarration(text,nrColor){
  var color=nrColor||'rgba(150,130,180,0.55)';
  var paras=text.split(/\n+/);
  var out=[];
  paras.forEach(function(para){
    var p=para.replace(/^\s+|\s+$/g,'');
    if(!p)return;
    var html=p.replace(/[（(]([^）)]+)[）)]/g,'<span class="th-nr" style="color:'+color+';">$1</span>');
    var hasNr=/<span class="th-nr"/.test(html);
    if(hasNr){
      html=html.replace(/(^|<\/span>)([^<]+)/g,function(match,prefix,dialogue){
        var trimmed=dialogue.replace(/^\s+|\s+$/g,'');
        if(!trimmed)return prefix;
        return prefix+'<span class="th-dialogue">'+trimmed+'</span>';
      });
    } else {
      html='<span class="th-dialogue">'+html+'</span>';
    }
    out.push('<span class="th-para">'+html+'</span>');
  });
  return out.join('');
}

function bindCardActions(){
  theaterEl.querySelectorAll('.th-card-act').forEach(function(btn){
    btn.addEventListener('click',function(e){
      e.stopPropagation();
      var act=btn.dataset.act;
      var idx=parseInt(btn.dataset.idx,10);
      if(act==='delete')deleteMsg(idx);
      else if(act==='rewind')rewindTo(idx);
      else if(act==='retry')retryAt(idx);
      else if(act==='edit')editMsg(idx);
    });
  });
}

function sendMsg(){
  var inp=theaterEl.querySelector('#thInput');
  var text=inp.value.trim();if(!text)return;
  inp.value='';inp.style.height='auto';

  var msgs=getMsgs();
  var isNarration=/^[（(].*[）)]$/.test(text);
  msgs.push({id:'th_'+Date.now(),text:text,role:isNarration?'narration':'user',time:fullTime()});
  setMsgs(msgs);
  renderMsgs();
}

function deleteMsg(idx){
  var msgs=getMsgs();msgs.splice(idx,1);setMsgs(msgs);renderMsgs();
}

function rewindTo(idx){
  var msgs=getMsgs();msgs=msgs.slice(0,idx+1);setMsgs(msgs);renderMsgs();
  addSysNotice('已回溯到此处');
}

function retryAt(idx){
  var msgs=getMsgs();
  var m=msgs[idx];
  if(!m){invokeAI();return;}
  if(m.role==='user'){
    msgs=msgs.slice(0,idx+1);
    setMsgs(msgs);
    invokeAI();
  } else {
    msgs.splice(idx,1);
    setMsgs(msgs);
    invokeAI();
  }
}

function retryLast(){
  var msgs=getMsgs();
  for(var i=msgs.length-1;i>=0;i--){
    if(msgs[i].role==='contact'){msgs=msgs.slice(0,i);setMsgs(msgs);invokeAI();return;}
  }
}

function editMsg(idx){
  var msgs=getMsgs();var m=msgs[idx];if(!m)return;
  showEditModal(m.text,function(newText){
    if(newText&&newText.trim()){
      var msgs2=getMsgs();
      if(msgs2[idx]){
        msgs2[idx].text=newText.trim();
        setMsgs(msgs2);renderMsgs();
      }
    }
  });
}

function showEditModal(text,onSave){
  var old=document.getElementById('thEditModal');
  if(old)old.parentNode.removeChild(old);
  var modal=document.createElement('div');
  modal.id='thEditModal';
  modal.className='th-edit-mask';
  modal.innerHTML=
    '<div class="th-edit-box">'+
      '<div class="th-edit-title">编辑内容</div>'+
      '<textarea class="th-edit-area" id="thEditArea"></textarea>'+
      '<div class="th-edit-btns">'+
        '<div class="th-edit-btn cancel" id="thEditCancel">取消</div>'+
        '<div class="th-edit-btn save" id="thEditSave">保存</div>'+
      '</div>'+
    '</div>';
  document.body.appendChild(modal);
  var area=modal.querySelector('#thEditArea');
  area.value=text;
  requestAnimationFrame(function(){
    modal.classList.add('show');
    area.focus();
    area.setSelectionRange(area.value.length,area.value.length);
  });

  function closeModal(){
    modal.classList.remove('show');
    setTimeout(function(){if(modal.parentNode)modal.parentNode.removeChild(modal);},280);
  }
  modal.querySelector('#thEditCancel').addEventListener('click',closeModal);
  modal.addEventListener('click',function(e){if(e.target===modal)closeModal();});
  modal.querySelector('#thEditSave').addEventListener('click',function(){
    var val=area.value;
    closeModal();
    if(onSave)onSave(val);
  });
}

function addSysNotice(text){
  var body=theaterEl.querySelector('#thBody');
  var el=document.createElement('div');el.className='th-sys';el.textContent=text;
  body.appendChild(el);body.scrollTop=body.scrollHeight;
  setTimeout(function(){if(el.parentNode)el.parentNode.removeChild(el);},3000);
}

function invokeAI(){
  if(!cId)return;
  var msgs=getMsgs();
  if(msgs.length===0){addSysNotice('请先写点什么');return;}
  var cfg=getAPIConfig();
  if(!cfg.key){addSysNotice('请先配置 API Key');return;}
  var c=getContact(cId);
  var charSettings=(c&&c.settings)||{};
  var mask=getMask(c);

  /* 构建角色人设 */
  var charName=charSettings.charName||charSettings.realName||c.name||'角色';
  var charInfo=[];
  charInfo.push('你扮演的角色名字是「'+charName+'」。');
  if(charSettings.personality)charInfo.push('性格特点：'+charSettings.personality);
  if(charSettings.bio)charInfo.push('简介：'+charSettings.bio);
  if(charSettings.prompt)charInfo.push('\n'+charSettings.prompt);
  var charPrompt=charInfo.join('\n');

  /* 获取字数限制 */
  var wordLimit=charSettings.theaterWordLimit||200;

  var apiMsgs=[{role:'system',content:'你是一个沉浸式小说故事的共同创作者。\n\n[输出格式——必须严格遵守]\n1. 对话部分：直接输出角色说的话，不加引号，不加冒号，不加"他说"之类的对话标签。\n2. 旁白/动作/描写部分：用中文括号（）包裹。旁白写动作、神态、心理、环境。\n3. 对话和旁白交替穿插。示范：（他靠在窗边，指尖无意识地敲着玻璃。）你今天怎么回来这么早？（语气很轻，带着点试探的意味。）\n4. 分自然段：像写小说一样，按场景、动作和对话的节奏分成2~4个自然段，段落之间用空行（两个换行符\\n\\n）隔开，让阅读有呼吸感和层次，不要全部挤成一整段。\n5. 禁止使用：引号「」""、冒号后接对话、*星号旁白*。\n6. 每次回复旁白占比约40-60%，对话占比40-60%，保持平衡。\n\n[字数要求——硬性规则]\n- 目标字数：'+wordLimit+'字。\n- 允许浮动范围：'+ Math.round(wordLimit*0.8) +'~'+ Math.round(wordLimit*1.2) +'字。\n- 在写到目标字数附近时自然收束，不要突然截断也不要大幅超出。\n- 如果目标是200字就写200字左右，不要只写50字也不要写500字。\n\n[叙事要求]\n- 推动剧情发展，不要原地踏步重复已有内容。\n- 注重细节描写：体感、微表情、环境细节。\n- 保持角色性格一致性。\n- 不要输出OOC内容、不要输出系统提示、不要解释自己在做什么。\n\n[角色设定]\n'+charPrompt}];

  /* 用户面具人设 */
  if(mask){
    var userInfo='[用户信息]\n用户扮演的角色名字是「'+mask.name+'」。';
    if(mask.persona)userInfo+='\n用户人设：'+mask.persona;
    apiMsgs.push({role:'system',content:userInfo});
  }

  /* 记忆注入 */
  try{
    var memKey='wp_memory_'+cId;
    var memories=JSON.parse(localStorage.getItem(memKey)||'[]');
    if(memories.length>0){
      var levelLabels=['短期','长期','重要','核心'];
      var memText=memories.map(function(m){
        var lv=(typeof m.level==='number')?levelLabels[m.level]:'长期';
        return '['+lv+']['+m.date+'] '+m.text;
      }).join('\n\n');
      apiMsgs.push({role:'system',content:'[记忆库 - 请参考这些记忆保持剧情连贯]\n'+memText});
    }
  }catch(e){}

  /* 自动总结：检查是否需要触发（与聊天室共享记忆库，独立计数） */
  try{
    if(charSettings.memAutoSumm){
      var slideCount=charSettings.memSlideCount||30;
      var thMemKey='wp_memory_'+cId;
      var thMem=JSON.parse(localStorage.getItem(thMemKey)||'[]');
      var lastThAuto=null;
      for(var tai=thMem.length-1;tai>=0;tai--){
        if(thMem[tai].source==='auto-theater'){lastThAuto=thMem[tai];break;}
      }
      var thShould=false;
      if(!lastThAuto){
        if(msgs.length>=slideCount)thShould=true;
      } else {
        var lastCount=lastThAuto.msgCount||0;
        if(msgs.length-lastCount>=slideCount)thShould=true;
      }
      if(thShould){
        apiMsgs.push({role:'system',content:'[自动总结指令]在回复末尾，用【记忆总结】标记输出对最近'+slideCount+'条消息的总结。格式：【记忆总结】[年月日时间] 事件起因经过结果。按重要性排列，标注时间段。这段总结会被系统提取保存，不要省略关键信息。'});
      }
    }
  }catch(e){}

  /* 世界书注入 */
  if(typeof window._wpGetWorldBookEntries==='function'){
    try{
      var wbEntries=window._wpGetWorldBookEntries(cId,msgs)||[];
      var wbText=wbEntries.map(function(e){return e.content;}).join('\n');
      if(wbText)apiMsgs.push({role:'system',content:'[世界书设定]\n'+wbText});
    }catch(e){}
  }

  /* 读取聊天室历史消息作为背景上下文 */
  try{
    var chatConvs=JSON.parse(localStorage.getItem('wp_chat_messages')||'{}');
    var chatMsgs=chatConvs[cId]||[];
    if(chatMsgs.length>0){
      var contextRounds=charSettings.contextRounds||20;
      var recentChat=chatMsgs.slice(-contextRounds);
      var chatContext=recentChat.map(function(m){
        var role=m.role=='user'?'用户':'角色';
        var time=m.time||'';
        return '['+time+'] '+role+'：'+m.text;
      }).join('\n');
      apiMsgs.push({role:'system',content:'[聊天室历史记录 - 作为背景参考，剧场是独立的故事线]\n'+chatContext});
    }
  }catch(e){}

  /* 剧场对话历史 */
  var rounds=Math.min(msgs.length,40);
  if(rounds>0){
    apiMsgs.push({role:'system',content:'[以下是剧场当前的故事进展]'});
    msgs.slice(-rounds).forEach(function(m){
      if(m.role=='narration')apiMsgs.push({role:'system',content:'[旁白]'+m.text});
      else apiMsgs.push({role:m.role==='user'?'user':'assistant',content:m.text});
    });
  }

  var invokeBtn=theaterEl.querySelector('#thInvoke');
  invokeBtn.classList.add('loading');

  var body=theaterEl.querySelector('#thBody');
  var typing=document.createElement('div');typing.className='th-typing';typing.id='thTyping';
  loadAvatarSrc(c,function(avSrc){
    typing.innerHTML=polAvatar(avSrc,'sz-t')+'<div class="th-typing-dots"><div class="th-typing-dot"></div><div class="th-typing-dot"></div><div class="th-typing-dot"></div></div>';
    body.appendChild(typing);body.scrollTop=body.scrollHeight;
  });

  fetch(cfg.url,{
    method:'POST',
    headers:{'Content-Type':'application/json','Authorization':'Bearer '+cfg.key},
    body:JSON.stringify({model:cfg.model,messages:apiMsgs})
  })
  .then(function(r){return r.json();})
  .then(function(data){
    var el=theaterEl.querySelector('#thTyping');if(el)el.parentNode.removeChild(el);
    invokeBtn.classList.remove('loading');
    var reply='';
    if(data.choices&&data.choices[0]&&data.choices[0].message)reply=data.choices[0].message.content;
    if(reply){
      /* 提取自动总结（如果有），存入共享记忆库 */
      var cleanReply=reply;
      var summaryMatch=reply.match(/【记忆总结】([\s\S]+)$/);
      if(summaryMatch){
        cleanReply=reply.replace(/【记忆总结】[\s\S]+$/,'').trim();
        var summaryText=summaryMatch[1].trim();
        if(summaryText){
          try{
            var thMemKey2='wp_memory_'+cId;
            var thMemArr=JSON.parse(localStorage.getItem(thMemKey2)||'[]');
            thMemArr.push({id:'mem_'+Date.now(),text:summaryText,level:1,date:fullTime(),source:'auto-theater',msgCount:getMsgs().length});
            localStorage.setItem(thMemKey2,JSON.stringify(thMemArr));
          }catch(e){}
        }
      }
      var allMsgs=getMsgs();
      allMsgs.push({id:'th_'+Date.now(),text:cleanReply||reply,role:'contact',time:fullTime()});
      setMsgs(allMsgs);
      renderMsgs();
    } else if(data.error){
      addSysNotice('错误：'+(data.error.message||'请求失败'));
    }
  })
  .catch(function(err){
    var el=theaterEl.querySelector('#thTyping');if(el)el.parentNode.removeChild(el);
    invokeBtn.classList.remove('loading');
    addSysNotice('请求失败：'+err.message);
  });
}

function saveTheaterMemSetting(key,val){
  try{
    var contacts=JSON.parse(localStorage.getItem('wp_chat_contacts')||'[]');
    var c=contacts.find(function(x){return x.id===cId;});
    if(!c)return;if(!c.settings)c.settings={};
    c.settings[key]=val;
    localStorage.setItem('wp_chat_contacts',JSON.stringify(contacts));
  }catch(e){}
}

function showTheaterSummaryModal(){
  if(!cId)return;
  var old=document.getElementById('thSummModal');
  if(old)old.parentNode.removeChild(old);

  var msgs=getMsgs();
  var totalCount=msgs.length;
  var memKey='wp_memory_'+cId;
  var memories=[];
  try{memories=JSON.parse(localStorage.getItem(memKey)||'[]');}catch(e){}
  var lastSummIdx=0;
  for(var i=memories.length-1;i>=0;i--){
    if(memories[i].source==='manual-theater'&&memories[i].msgRange){lastSummIdx=memories[i].msgRange.end;break;}
  }

  var modal=document.createElement('div');
  modal.id='thSummModal';
  modal.className='cs-mem-modal-mask';
  modal.innerHTML=
    '<div class="cs-mem-modal">'+
      '<div class="cs-mem-modal-title">剧场手动总结</div>'+
      '<div style="font-size:10px;color:#999;margin-bottom:10px;">剧场消息总数：'+totalCount+' 条 · 上次总结到第 '+lastSummIdx+' 条</div>'+
      '<div class="cs-field"><div class="cs-field-label">从第几条</div><input class="cs-field-input" id="thSummFrom" type="number" value="'+(lastSummIdx+1)+'" min="1" max="'+totalCount+'"></div>'+
      '<div class="cs-field"><div class="cs-field-label">到第几条</div><input class="cs-field-input" id="thSummTo" type="number" value="'+totalCount+'" min="1" max="'+totalCount+'"></div>'+
      '<div class="cs-mem-modal-btns">'+
        '<button class="cd-edit-confirm-btn cancel" id="thSummCancel">取消</button>'+
        '<button class="cd-edit-confirm-btn confirm" id="thSummSave">开始总结</button>'+
      '</div>'+
      '<div id="thSummStatus" style="font-size:10px;color:#b5c8ab;text-align:center;margin-top:8px;display:none;">正在总结中...</div>'+
    '</div>';
  document.body.appendChild(modal);
  requestAnimationFrame(function(){modal.classList.add('show');});

  function closeModal(){
    modal.classList.remove('show');
    setTimeout(function(){if(modal.parentNode)modal.parentNode.removeChild(modal);},300);
  }
  modal.querySelector('#thSummCancel').addEventListener('click',closeModal);
  modal.addEventListener('click',function(e){if(e.target===modal)closeModal();});

  modal.querySelector('#thSummSave').addEventListener('click',function(){
    var from=parseInt(modal.querySelector('#thSummFrom').value,10)||1;
    var to=parseInt(modal.querySelector('#thSummTo').value,10)||totalCount;
    if(from<1)from=1;
    if(to>totalCount)to=totalCount;
    if(from>to)return;

    var statusEl=modal.querySelector('#thSummStatus');
    statusEl.style.display='';
    statusEl.textContent='正在总结中...';
    modal.querySelector('#thSummSave').disabled=true;

    var rangeMsgs=msgs.slice(from-1,to);
    var chatContent=rangeMsgs.map(function(m,idx){
      var time=m.time||'';
      var roleLabel=m.role==='user'?'用户':(m.role==='narration'?'旁白':'角色');
      return '['+(from+idx)+']['+time+'] '+roleLabel+': '+m.text;
    }).join('\n');

    var cfg=getAPIConfig();
    if(!cfg.key){
      statusEl.textContent='错误：未配置API Key';
      modal.querySelector('#thSummSave').disabled=false;
      return;
    }

    var summaryPrompt='[记忆区维护规则]\n你是总结机器人，不是角色本人，必须用第三人称视角总结。\n\n1.将当前事件添加到记忆列表。以最重要的开始记录排列。事件必须有起因、经过、结果。例如：01.02...排列。\n2.必须用[年月日精确时间]来当做每个事件前缀，且要写明事件从几点到几点。\n3.禁止删除/删减/省略任何已有记忆，每条记忆永久保留。\n4.遇到重大剧情点（如关键决定、事件转折）时，在该条前标注【重要节点】。\n5.用第三人称描述，如"用户做了..."、"角色回应了..."，禁止用"我"或"你"。\n6.禁止输出任何开场白、解释、确认语句，直接输出记忆条目列表，不要说"好的"、"这是..."等。\n\n以下是第'+from+'条到第'+to+'条的对话记录：\n'+chatContent;

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
      var result='';
      if(data.choices&&data.choices[0]&&data.choices[0].message)result=data.choices[0].message.content;
      if(result){
        var now=new Date();
        var timeStr=now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0')+'-'+String(now.getDate()).padStart(2,'0')+' '+String(now.getHours()).padStart(2,'0')+':'+String(now.getMinutes()).padStart(2,'0');
        memories.push({id:'mem_'+Date.now(),text:result,level:1,date:timeStr,source:'manual-theater',msgRange:{from:from,end:to}});
        try{localStorage.setItem(memKey,JSON.stringify(memories));}catch(e){}
        statusEl.textContent='总结完成！已保存到记忆库';
        setTimeout(closeModal,1200);
      } else {
        statusEl.textContent='总结失败：'+(data.error?data.error.message:'无返回');
        modal.querySelector('#thSummSave').disabled=false;
      }
    })
    .catch(function(err){
      statusEl.textContent='请求失败：'+err.message;
      modal.querySelector('#thSummSave').disabled=false;
    });
  });
}

function openTheater(contactId){
  ensure();
  cId=contactId;
  var c=getContact(contactId);
  if(!c)return;
  theaterEl.querySelector('#thTitle').textContent=getCharName(c);
  theaterEl.querySelector('#thSub').textContent='THEATER · '+c.name.toUpperCase();
  loadAvatarSrc(c,function(src){theaterEl.querySelector('#thAvatarImg').src=src;});
  renderPanel();
  loadTheaterConvs(function(){renderMsgs();});
  theaterEl.classList.add('active');
}

function closeTheater(){
  if(!theaterEl)return;
  theaterEl.classList.remove('active');
  cId=null;
}

window.openTheater=openTheater;
window.closeTheater=closeTheater;

})();
