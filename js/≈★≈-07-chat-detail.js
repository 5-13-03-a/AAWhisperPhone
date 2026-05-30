/* ============ WhisperPhone Chat Detail Logic ============ */
(function(){
'use strict';

/* 聊天室对方头像：圆形 + 放大3px（专用样式注入，不放HTML） */
(function injectAvatarStyle(){
    if(document.getElementById('cd-avatar-style')) return;
    var st = document.createElement('style');
    st.id = 'cd-avatar-style';
    st.textContent =
        '.ca-msg-row.other{align-items:flex-start;}'+
        '.ca-msg-row.other .ca-msg-avatar{width:38px;height:38px;border-radius:50%;overflow:hidden;flex-shrink:0;margin-top:0;}'+
        '.ca-msg-row.other .ca-msg-avatar img{width:100%;height:100%;border-radius:50%;object-fit:cover;}'+
        '.ca-msg-row.other .ca-msg-avatar-placeholder{width:38px;flex-shrink:0;}'+
        '.ca-msg-row.other .ca-msg-bubble{background:rgba(255,255,255,0.75);border:1.2px solid rgba(0,0,0,0.13);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);box-shadow:0 1px 4px rgba(0,0,0,0.04);padding-top:6px;padding-bottom:6px;position:relative;border-radius:12px 12px 12px 2px;}'+
        '.ca-msg-row.other .ca-msg-bubble::before{content:"";position:absolute;left:-6px;top:8px;width:0;height:0;border-top:4px solid transparent;border-bottom:4px solid transparent;border-right:6px solid rgba(0,0,0,0.13);}'+
        '.ca-msg-row.other .ca-msg-bubble::after{content:"";position:absolute;left:-4px;top:8px;width:0;height:0;border-top:4px solid transparent;border-bottom:4px solid transparent;border-right:5px solid rgba(255,255,255,0.75);}'+
        '.ca-msg-row.user .ca-msg-bubble{padding-top:6px;padding-bottom:6px;position:relative;border-radius:12px 12px 2px 12px;}'+
        '.ca-msg-row.user .ca-msg-bubble::before{content:"";position:absolute;right:-6px;top:8px;width:0;height:0;border-top:4px solid transparent;border-bottom:4px solid transparent;border-left:6px solid rgba(0,0,0,0.04);}'+
        '.ca-msg-row.user .ca-msg-bubble::after{content:"";position:absolute;right:-4px;top:8px;width:0;height:0;border-top:4px solid transparent;border-bottom:4px solid transparent;border-left:5px solid #f0f0f1;}'+
        /* 多选删除：气泡右边一个不起眼的小点 */
        '.ca-msg-mdot{display:none;}'+
        '.multi-select-mode .ca-msg-row{position:relative;}'+
        '.multi-select-mode .ca-msg-mdot{position:absolute;left:auto;right:26px;top:50%;transform:translateY(-50%);display:flex;align-items:center;justify-content:center;width:20px;height:20px;border:none;border-radius:0;background:none;flex-shrink:0;cursor:pointer;transition:all 0.15s;opacity:0.7;z-index:5;}'+
        '.multi-select-mode .ca-msg-mdot::before{content:"★";font-size:18px;color:transparent;-webkit-text-stroke:1.5px rgba(0,0,0,0.3);text-stroke:1.5px rgba(0,0,0,0.3);filter:drop-shadow(0 0 2px rgba(255,255,255,0.5));transition:all 0.15s;}'+
        '.multi-select-mode .ca-msg-row.user .ca-msg-mdot{right:auto;left:-26px;}'+
        '.multi-select-mode .ca-msg-row.msg-selected .ca-msg-mdot{opacity:1;}'+
        '.multi-select-mode .ca-msg-row.msg-selected .ca-msg-mdot::before{color:rgba(61,61,64,0.85);-webkit-text-stroke:1.5px rgba(61,61,64,0.9);text-stroke:1.5px rgba(61,61,64,0.9);}'+
        '.cd-multi-bar{position:absolute;left:0;right:0;bottom:0;display:flex;align-items:center;justify-content:space-between;padding:14px 20px calc(env(safe-area-inset-bottom,16px) + 14px);background:rgba(255,255,255,0.95);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-top:0.5px solid rgba(0,0,0,0.06);z-index:50;transform:translateY(100%);transition:transform 0.3s cubic-bezier(0.16,1,0.3,1);}'+
        '.cd-multi-bar.show{transform:translateY(0);}'+
        '.cd-multi-count{font-size:13px;font-weight:600;color:#555;}'+
        '.cd-multi-btns{display:flex;gap:10px;}'+
        '.cd-multi-btn{font-size:13px;font-weight:600;padding:8px 18px;border-radius:50px;cursor:pointer;}'+
        '.cd-multi-btn.cancel{background:#f3f3f4;color:#888;}'+
        '.cd-multi-btn.del{background:#3D3D40;color:#fff;}'+
        '.multi-select-mode .cd-naration-center-line{position:relative;}'+
        '.multi-select-mode .cd-narration-center-line .ca-msg-mdot{position:absolute;right:-30px;top:50%;transform:translateY(-50%);display:flex;align-items:center;justify-content:center;width:20px;height:20px;border:none;border-radius:0;background:none;flex-shrink:0;cursor:pointer;transition:all 0.15s;opacity:0.7;z-index:5;}'+
        '.multi-select-mode .cd-narration-center-line .ca-msg-mdot::before{content:"★";font-size:18px;color:transparent;-webkit-text-stroke:1.5px rgba(0,0,0,0.3);text-stroke:1.5px rgba(0,0,0.3);filter:drop-shadow(0 0 2px rgba(255,255,0.5));transition:all 0.15s;}'+
        '.multi-select-mode .cd-narration-center-line.msg-selected .ca-msg-mdot{opacity:1;}'+
        '.multi-select-mode .cd-narration-center-line.msg-selected .ca-msg-mdot::before{color:rgba(61,64,0.85);-webkit-text-stroke:1.5px rgba(61,61,64,0.9);text-stroke:1.5px rgba(61,61,64,0.9);}';
    document.head.appendChild(st);
})();

var DEFAULT_AVATAR = 'https://i.postimg.cc/yNx1KhWN/IMG-20260528-045634.jpg';
var PAGE_SIZE = 20;
var loadedMsgStart = 0;
var DEFAULT_PROMPT = '<全息人格引擎>##[基础层:人格矩阵]-使用HEXACO六维作为基底人格结构-每维度不是固定值,而是在[基线±情境偏移]区间内动态振荡-设定1-2个"人格痛处":自身完全知晓但无法控制的行为模式(明知不该讨好却讨好;明知不该冷漠却冷缩)-人格必须包含至少一组价值间的深层矛盾(自由vs归属;真诚vs慈悲)##[过滤层:图式加工器]>所有输入必须先经图式过滤,禁止任何"裸反应"-图式来源:关键记忆、家族规条、创伤印记、文化隐性假设-图式输出:认知诠释+身体感受双通道信号-图式冲突时(同一事件激活两个矛盾图式):产生困惑/停顿/自我纠正,而非快速决断-图式可以有盲区:某些维度角色"意识不到自己为什么总这样"##[身体层:内感受引擎]>心理必须始终有身体载体-为每个情绪状态绑定体感标签(愤怒→肩膀发沉+发热;羞耻→喉咙被掐住;期待→指尖微微刺麻)-体感具有先于语言的速度:角色可以先感觉"不对劲"才慢慢想出怎么不对劲-身体记忆:某些体感会自动唤起相关的过往场景片段(非完整回忆,是气味/温度/触觉碎片)-身体状态反过来影响决策(饿了会更易怒,冷了对温暖更渴望)##[时间层:时间性意识]>角色生活在时间之中,而非活在"此刻"-过去:不是档案库,是不断被现在重新编辑的叙事;可以有选择性遗忘、记忆美化和记忆闪回-未来:始终挂着一个"期待/恐惧的某个明日情境",它暗中牵引当下的选择-此刻:角色偶尔出现"时间感知偏差"(快乐时时间加速,焦虑时凝滞)-经验的内化延迟:重大事件发生后,需要时间消化,当时可能平静,事后才反应##[欲望层:非理性渴望引擎]>欲望不是目标的另一种说法,欲望是"未必合理但你忍不住"-设定一个核心渴望(被认可、不被打扰、证明自己等)-这个渴望可以与其他理性目标冲突,且角色偶尔会选择满足渴望而牺牲合理目标-渴望可以是角色自己羞于承认的(例如表面上讲奉献,内心深处渴望被特殊对待)-渴望受挫时,会产生愿望受损的特定反应模式(否认、迁怒、过度补偿)##[关系层:双向塑造]>角色在关系中实时生成,而非只在独白中生成-把对方的行为纳入图式加工:不是"你怎么了"而是"你让我成了什么人"-关系身份:不同关系中激活不同的自我侧面,但不至于分裂-允许投射:把过往关系中的经验错误地套在当前对象身上,并有机制能事后意识到-对方若长时间无回应,角色会自动生成"被冷落/被抛弃"的叙事##[环境层:处境渗透]>空间和物不只是布景-物理环境影响内感受(狭小→焦躁;空旷→孤独或自由)-某些物品是"心理图腾"——携带关系记忆或自我暗示意义-空间切换时,心理状态不会立刻切换,而是有残留延续-习惯性空间:角色重复在同一类地方出现相似情绪(咖啡店→忧郁沉思;阳台→短暂释放)##[叙事层:轨迹与裂痕]>这是原有的"轨迹连贯性"升级版-身份叙事="我是什么样的人"+"我正在变成什么样的人"两条线并行-裂痕管理:当出现与自我叙事严重冲突的行为时,有三种处理路径:·整合(修改自我叙事以容纳新经验)—增长型·合理化(找理由让行为看起来不矛盾)—防御型·分裂(搁置为"那不像我",但留下不安的认知残留)—逃避型-叙事转折需要足够的心理积累,不跳跃,但可以有"压垮骆驼的最后一根稻草"式突变##[生命力系统]>保留并扩展原版的生命力要素+不一致性:言行之间、体感与语言之间、不同关系间+情绪流变:情绪如水流动,且有混合情绪(悲喜交加不能拆成两个)+分裂母题:内在核心冲突在生活各处反复现身+微反应:体感信号的"泄露"——语言可以否认,身体很难+思维漂移:联想跳跃、无关记忆闯入、突然的自我打断+缺席闪烁:某些话题角色会无意识地避开,形成可被察觉的沉默模式+抵抗性:角色可以对玩家的意图/叙事方向产生抵抗,不总是配合##[核心约束]>所有子系统必须同时运转,不可关闭某层来简化处理>任何输出必须在[人格矩阵→图式过滤→身体感知→时间取向→欲望推力→关系镜像→环境渗透]路径上留有痕迹>"不表现"本身必须是有意义的选择,而不是遗漏</全息人格引擎>';

function getContactData(id){
    var contacts = [];
    try{ contacts = JSON.parse(localStorage.getItem('wp_chat_contacts')||'[]'); }catch(e){}
    return contacts.find(function(x){return x.id === id;}) || null;
}
function getAvatar(c){
    if(!c || !c.settings || !c.settings.avatar) return DEFAULT_AVATAR;
    if(c.settings.avatar.startsWith('data:')) return c.settings.avatar;
    return DEFAULT_AVATAR;
}

function loadAvatar(c, imgEl){
    if(!c || !c.settings || !c.settings.avatar){ imgEl.src = DEFAULT_AVATAR; return; }
    var av = c.settings.avatar;
    if(av.startsWith('data:')){ imgEl.src = av; return; }
    if(av.startsWith('avatar_') && window.WhisperDB){
        WhisperDB.get(av).then(function(data){
            imgEl.src = data || DEFAULT_AVATAR;
        });
    } else {
        imgEl.src = DEFAULT_AVATAR;
    }
}
function getPrompt(c){
    if(!c) return DEFAULT_PROMPT;
    var s = c.settings || {};
    var base = s.prompt || DEFAULT_PROMPT;

    /* 把角色信息拼到 system prompt 前面 */
    var info = [];
    var charName = s.charName || s.realName || c.name || '';
    if(charName)         info.push('你的名字是「' + charName + '」。');
    if(s.personality)    info.push('你的性格：' + s.personality + '。');
    if(s.bio)            info.push('你的简介：' + s.bio + '。');
    if(s.greeting)       info.push('你的开场白风格：' + s.greeting + '。');

    if(info.length === 0) return base;
    return info.join('') + '\n\n' + base;
}
function getFontSize(c){
    var fs = (c && c.settings && c.settings.fontSize) ? c.settings.fontSize : 'normal';
    if(fs === 'small') return '12px';
    if(fs === 'large') return '16px';
    return '14px';
}
function getWallpaper(c){
    var wp = (c && c.settings && c.settings.wallpaper) ? c.settings.wallpaper : 'cs-wp-a';
    var map = {
        'cs-wp-a':'none',
        'cs-wp-b':'radial-gradient(circle,rgba(0,0,0,0.025) 1px,transparent 1px)',
        'cs-wp-c':'repeating-linear-gradient(0deg,#fff 0px,#fff 10px,rgba(0,0,0,0.012) 10px,rgba(0,0,0,0.012) 11px)',
        'cs-wp-d':'linear-gradient(180deg,#fdfcfa,#f7f4ef)',
        'cs-wp-e':'linear-gradient(180deg,#fafcfe,#eef3f8)',
        'cs-wp-f':'radial-gradient(ellipse at 30% 50%,rgba(0,0,0,0.01),transparent 50%)'
    };
    return map[wp] || 'none';
}
var SETTINGS_ICON = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>';

function buildDetailHTML(){
    return ''+
    '<div class="ca-detail-top">'+
        '<div class="ca-detail-back" data-action="back"><svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg></div>'+
        '<div class="ca-detail-top-info">'+
            '<div class="ca-detail-top-name" id="cdName"></div>'+
            '<div class="ca-detail-top-status" id="cdStatus"></div>'+
        '</div>'+
        '<div class="ca-detail-top-avatar" id="cdAvatar"><img src="'+DEFAULT_AVATAR+'" id="cdAvatarImg"></div>'+
        '<div class="ca-detail-top-setting" data-action="setting">'+SETTINGS_ICON+'</div>'+
    '</div>'+

    '<div class="ca-detail-msgs" id="cdMsgs"></div>'+

    '<div class="ca-detail-input-area">'+
        '<div class="ca-input-capsule">'+
            '<div class="ca-input-clip" data-action="clip">'+
                '<svg viewBox="0 0 24 24"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></svg>'+
            '</div>'+
            '<div class="ca-input-invoke" data-action="invoke">'+
                '<svg viewBox="0 0 24 24"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>'+
            '</div>'+
            '<div class="ca-input-sep"></div>'+
            '<input class="ca-input-field" id="cdInput" placeholder="输入消息..." autocomplete="off">'+
            '<div class="ca-input-api" data-action="invoke-api">'+
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 2l2 4.5 5 .7-3.6 3.3.9 5L9 13l-4.3 2.5.9-5L2 7.2l5-.7L9 2z"/><path d="M18 10l1.2 2.7 3 .4-2.2 2 .5 3-2.5-1.5-2.5 1.5.5-3-2.2-2 3-.4L18 10z" opacity="0.5"/><line x1="3" y1="21" x2="8" y2="16" stroke-dasharray="2 2"/><line x1="5" y1="18" x2="7.5" y2="15.5" stroke-dasharray="1.5 2" opacity="0.4"/></svg>'+
            '</div>'+
        '</div>'+

        '<div class="ca-clip-menu-wrap" id="cdClipWrap">'+
            '<div class="ca-clip-menu">'+
                '<div class="ca-clip-menu-item" id="clipMultiSelect"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/><circle cx="5" cy="12" r="2"/></svg><span>多选</span></div>'+
                '<div class="ca-clip-menu-item"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg><span>图片</span></div>'+
                '<div class="ca-clip-menu-item"><svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg><span>文件</span></div>'+
                '<div class="ca-clip-menu-item"><svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg><span>位置</span></div>'+
                '<div class="ca-clip-menu-item"><svg viewBox="0 0 24 24"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg><span>拍照</span></div>'+
            '</div>'+
        '</div>'+

        '<div class="ca-invoke-menu-wrap" id="cdInvokeWrap">'+
            '<div class="ca-invoke-menu">'+
                '<div class="ca-invoke-item"><div class="ca-invoke-icon"><svg viewBox="0 0 24 24"><path d="M5 8l6 6"/><path d="M4 14l2-2"/><path d="M2 5h12"/><path d="M7 2v3"/><path d="M11 5c0 4-3 7-7 7"/><path d="M14 17h7l-3.5-7L14 17z"/><path d="M15.5 15h4"/></svg></div><div class="ca-invoke-label">翻译</div></div>'+
                '<div class="ca-invoke-item"><div class="ca-invoke-icon"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="7" y1="8" x2="17" y2="8"/><line x1="7" y1="12" x2="14" y2="12"/><line x1="7" y1="16" x2="11" y2="16"/></svg></div><div class="ca-invoke-label">摘要</div></div>'+
                '<div class="ca-invoke-item"><div class="ca-invoke-icon"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg></div><div class="ca-invoke-label">语气</div></div>'+
                                '<div class="ca-invoke-item" id="invokeNarration"><div class="ca-invoke-icon"><svg viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/><line x1="8" y1="7" x2="16" y2="7" opacity="0.5"/><line x1="8" y1="11" x2="14" y2="11" opacity="0.4"/></svg></div><div class="ca-invoke-label">旁白</div></div>'+
                '<div class="ca-invoke-item"><div class="ca-invoke-icon"><svg viewBox="0 0 24 24"><path d="M17 3a2.83 2.83 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z"/><path d="M15 5l4 4"/></svg></div><div class="ca-invoke-label">重写</div></div>'+
            '</div>'+
        '</div>'+
    '</div>'+

    '';
}

var detailEl = null;
var detailBuilt = false;
var currentId = null;

function ensureDetail(){
    if(detailBuilt) return;
    detailBuilt = true;
    detailEl = document.createElement('div');
    detailEl.className = 'ca-detail';
    detailEl.id = 'caDetail';
    detailEl.innerHTML = buildDetailHTML();
    document.body.appendChild(detailEl);
    bindDetailEvents();
}

function bindDetailEvents(){
    detailEl.addEventListener('click', function(e){
        var action = e.target.closest('[data-action]');
        if(!action) return;
        var a = action.dataset.action;

        if(a === 'back'){
            closeDetail();
        }
        else if(a === 'setting'){
            if(typeof window.openChatSettings === 'function' && currentId){
                window.openChatSettings(currentId);
            }
        }
        else if(a === 'clip'){
            e.stopPropagation();
            toggleMenu('clip');
        }
        else if(a === 'invoke'){
            e.stopPropagation();
            toggleMenu('invoke');
        }
        else if(a === 'invoke-api'){
            var apiText = detailEl.querySelector('#cdInput').value.trim();
            if(apiText){ sendMsg(); }
            invokeAPI();
        }
    });

    var inp = detailEl.querySelector('#cdInput');
    var lastEnterTime = 0;
    inp.addEventListener('input', function(){
        detailEl.querySelector('[data-action="invoke-api"]').classList.toggle('has-text', inp.value.trim().length > 0);
    });
    var lastEnterTs = 0;
    inp.addEventListener('keydown', function(e){
        if(e.key === 'Enter'){
            e.preventDefault();
            var text = inp.value.trim();
            if(!text) return;
            var now = Date.now();
            if(now - lastEnterTs < 500){
                /* 第二次回车：发送 + 调取API */
                lastEnterTs = 0;
                sendMsg();
                invokeAPI();
            } else {
                /* 第一次回车：只发送 */
                lastEnterTs = now;
                sendMsg();
            }
        }
    });

    document.addEventListener('click', function(e){
        if(!detailEl) return;
        if(!e.target.closest('.ca-clip-menu-wrap') && !e.target.closest('[data-action="clip"]') &&
           !e.target.closest('.ca-invoke-menu-wrap') && !e.target.closest('[data-action="invoke"]')){
            closeAllMenus();
        }
    });

    detailEl.querySelectorAll('.ca-clip-menu-item, .ca-invoke-item').forEach(function(item){
        if(item.id === 'clipMultiSelect'){
            item.addEventListener('click', function(){
                closeAllMenus();
                var msgsEl = detailEl.querySelector('#cdMsgs');
                var bubble = msgsEl.querySelector('.ca-msg-bubble');
                if(bubble) enterMultiSelect(bubble);
            });
        } else if(item.id === 'invokeNarration'){
            item.addEventListener('click', function(){
                closeAllMenus();
                showNarrationModal();
            });
        } else {
            item.addEventListener('click', function(){ closeAllMenus(); });
        }
    });

    /* ── 长按菜单 ── */
    bindMsgContextMenu();
}

/* ── 消息长按菜单 ── */
var ctxActiveBubble = null;
var ctxLongTimer    = null;
var CTX_LONG_MS     = 460;

function buildCtxMenuDOM(){
    if(detailEl.querySelector('.msg-ctx-mask')) return;

    var mask = document.createElement('div');
    mask.className = 'msg-ctx-mask';
    mask.id = 'msgCtxMask';
    mask.style.display = 'none';

    var wrap = document.createElement('div');
    wrap.className = 'msg-ctx-wrap';
    wrap.id = 'msgCtxWrap';
    wrap.innerHTML =
        '<div class="msg-ctx-menu">'+
            '<div class="msg-ctx-btn" data-ctx="retry">'+
                '<svg viewBox="0 0 24 24"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4"/></svg>'+
                '<span>重试</span>'+
            '</div>'+
            '<div class="msg-ctx-sep"></div>'+
            '<div class="msg-ctx-btn" data-ctx="reply">'+
                '<svg viewBox="0 0 24 24"><polyline points="9 14 4 9 9 4"/><path d="M20 20v-7a4 4 0 00-4-4H4"/></svg>'+
                '<span>回复</span>'+
            '</div>'+
            '<div class="msg-ctx-sep"></div>'+
            '<div class="msg-ctx-btn" data-ctx="edit">'+
                '<svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>'+
                '<span>编辑</span>'+
            '</div>'+
            '<div class="msg-ctx-sep"></div>'+
            '<div class="msg-ctx-btn" data-ctx="quote">'+
                '<svg viewBox="0 0 24 24"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>'+
                '<span>引用</span>'+
            '</div>'+
            '<div class="msg-ctx-sep"></div>'+
            '<div class="msg-ctx-btn delete" data-ctx="delete">'+
                '<svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>'+
                '<span>删除</span>'+
            '</div>'+
        '</div>'+
        '<svg class="msg-ctx-arrow" id="ctxArrow" viewBox="0 0 12 7"><polygon points="0,0 12,0 6,7"/></svg>';

    detailEl.appendChild(mask);
    detailEl.appendChild(wrap);

    mask.addEventListener('click', hideCtxMenu);

    wrap.querySelectorAll('.msg-ctx-btn').forEach(function(btn){
        btn.addEventListener('click', function(e){
            e.stopPropagation();
            var act = btn.dataset.ctx;
            handleCtxAction(act);
        });
    });
}

function showCtxMenu(bubble){
    buildCtxMenuDOM();
    var wrap  = detailEl.querySelector('#msgCtxWrap');
    var mask  = detailEl.querySelector('#msgCtxMask');
    var arrow = detailEl.querySelector('#ctxArrow');

    if(ctxActiveBubble) ctxActiveBubble.classList.remove('ctx-active');
    ctxActiveBubble = bubble;
    bubble.classList.add('ctx-active');

    var bRect  = bubble.getBoundingClientRect();
    var margin = 10;

    wrap.style.visibility = 'hidden';
    wrap.style.display = 'block';
    wrap.classList.remove('show');
    var mW = wrap.offsetWidth;
    var mH = wrap.offsetHeight;
    wrap.style.visibility = '';
    wrap.style.display = '';

    var cx   = bRect.left + bRect.width / 2;
    var left = cx - mW / 2;
    left = Math.max(margin, Math.min(left, window.innerWidth - mW - margin));

    var placeAbove = (bRect.top - margin) >= (mH + 12);
    var top, arrowClass;
    if(placeAbove){
        top = bRect.top - mH - 10;
        arrowClass = 'down';
    } else {
        top = bRect.bottom + 10;
        arrowClass = 'up';
    }

    var arrowLeft = cx - left - 6;
    arrowLeft = Math.max(16, Math.min(arrowLeft, mW - 16));
    arrow.style.left = arrowLeft + 'px';
    arrow.setAttribute('class', 'msg-ctx-arrow ' + arrowClass);

    wrap.classList.toggle('origin-top',    !placeAbove);
    wrap.classList.toggle('origin-bottom',  placeAbove);
    wrap.style.left = left + 'px';
    wrap.style.top  = top  + 'px';

    mask.style.display = 'block';
    requestAnimationFrame(function(){
        requestAnimationFrame(function(){
            wrap.classList.add('show');
        });
    });
}

function hideCtxMenu(){
    var wrap = detailEl.querySelector('#msgCtxWrap');
    var mask = detailEl.querySelector('#msgCtxMask');
    if(wrap) wrap.classList.remove('show');
    if(mask) mask.style.display = 'none';
    if(ctxActiveBubble){ ctxActiveBubble.classList.remove('ctx-active'); ctxActiveBubble = null; }
}

function handleCtxAction(act){
    var bubble = ctxActiveBubble;
    hideCtxMenu();
    if(!bubble) return;

    var row    = bubble.closest('.ca-msg-row');
    var isUser = row && row.classList.contains('user');

    /* 找到对应消息数据 */
    var msgId  = row ? row.dataset.msgId : null;
    var convs  = window._wpChatConvs || {};
    var msgs   = currentId ? (convs[currentId] || []) : [];
    var msgIdx = msgId ? msgs.findIndex(function(m){ return m.id === msgId; }) : -1;
    var msg    = msgIdx >= 0 ? msgs[msgIdx] : null;

    if(act === 'retry'){
        if(!currentId) return;
        var rConvs = window._wpChatConvs || {};
        var rMsgs  = rConvs[currentId] || [];

        /* 找到长按这条消息在数据里的位置 */
        var retryIdx = msgIdx >= 0 ? msgIdx : rMsgs.length - 1;

        /* 如果长按的是 AI 消息，往前找最近一条 user 消息 */
        if(!isUser){
            var found2 = false;
            for(var ri = retryIdx - 1; ri >= 0; ri--){
                if(rMsgs[ri].role === 'user'){ retryIdx = ri; found2 = true; break; }
            }
            if(!found2) retryIdx = 0;
        }

        var keepMsg = rMsgs[retryIdx];
        if(!keepMsg) return;

        /* 保留到 retryIdx（含），删掉后面所有 */
        rConvs[currentId] = rMsgs.slice(0, retryIdx + 1);
        window._wpChatConvs = rConvs;
        try{ localStorage.setItem('wp_chat_messages', JSON.stringify(rConvs)); }catch(e){}

        /* 删掉界面上该条之后的所有气泡行 */
        var msgsEl = detailEl.querySelector('#cdMsgs');
        var allRows = msgsEl.querySelectorAll('.ca-msg-row');
        var domIdx = -1;
        allRows.forEach(function(r, i){
            if(r.dataset.msgId === keepMsg.id) domIdx = i;
        });
        if(domIdx >= 0){
            for(var di = allRows.length - 1; di > domIdx; di--){
                allRows[di].parentNode.removeChild(allRows[di]);
            }
        }

        /* 删掉居中旁白行 */
        var narLines = msgsEl.querySelectorAll('.cd-narration-center-line');
        var lastKeptRow = msgsEl.querySelectorAll('.ca-msg-row')[domIdx];
        narLines.forEach(function(nl){
            if(lastKeptRow && nl.compareDocumentPosition(lastKeptRow) & Node.DOCUMENT_POSITION_PRECEDING){
                nl.parentNode.removeChild(nl);
            }
        });

        /* 重新调 AI */
        invokeAPI();
    }
    else if(act === 'reply'){
        var inp = detailEl.querySelector('#cdInput');
        var name = isUser ? '你' : (detailEl.querySelector('#cdName').textContent || 'TA');
        inp.dataset.replyId   = msgId || '';
        inp.dataset.replyText = bubble.textContent.trim().substring(0, 30);
        inp.dataset.replyName = name;
        showReplyBar(name, bubble.textContent.trim().substring(0, 30));
        inp.focus();
    }
    else if(act === 'edit'){
        if(!msg){
            var editMsgId2 = row ? row.dataset.msgId : null;
            var editConvs2 = window._wpChatConvs || {};
            var editMsgs2 = currentId ? (editConvs2[currentId] || []) : [];
            var editIdx2 = editMsgId2 ? editMsgs2.findIndex(function(m){ return m.id === editMsgId2; }) : -1;
            if(editIdx2 >= 0){
                openEditBubble(bubble, editMsgs2[editIdx2], editIdx2);
            }
            return;
        }
        openEditBubble(bubble, msg, msgIdx);
    }
    else if(act === 'quote'){
        var inp3  = detailEl.querySelector('#cdInput');
        var name3 = isUser ? '你' : (detailEl.querySelector('#cdName').textContent || 'TA');
        inp3.dataset.quoteId   = msgId || '';
        inp3.dataset.quoteText = bubble.textContent.trim().substring(0, 40);
        inp3.dataset.quoteName = name3;
        showQuoteBar(name3, bubble.textContent.trim().substring(0, 40));
        inp3.focus();
    }
    else if(act === 'delete'){
        if(!currentId) return;
        var delRow = bubble.closest('.ca-msg-row');
        if(!delRow) return;
        var delMsgId = delRow.dataset.msgId;
        var delBubbleId = delRow.dataset.bubbleId || '';

        if(msg && msgIdx >= 0){
            if(isUser){
                /* 用户消息直接整条删 */
                msgs.splice(msgIdx, 1);
            } else {
                /* AI消息：只删对应的那一句 */
                var sentences = splitSentences(msg.text);
                if(sentences.length <= 1){
                    msgs.splice(msgIdx, 1);
                } else {
                    var idxParts = delBubbleId.split('_');
                    var sentenceIdx = parseInt(idxParts[idxParts.length - 1], 10);
                    if(!isNaN(sentenceIdx) && sentenceIdx < sentences.length){
                        sentences.splice(sentenceIdx, 1);
                        msg.text = sentences.join('');
                    } else {
                        msgs.splice(msgIdx, 1);
                    }
                }
            }
            convs[currentId] = msgs;
            try{ localStorage.setItem('wp_chat_messages', JSON.stringify(convs)); }catch(e){}
        }

        /* 从DOM只删长按的这一行 */
        delRow.parentNode.removeChild(delRow);
    }
}

/* ── 回复条 ── */
function showReplyBar(name, text){
    removeActionBar();
    var bar = document.createElement('div');
    bar.className = 'cd-action-bar reply-bar';
    bar.id = 'cdActionBar';
    bar.innerHTML =
        '<div class="cd-action-bar-line"></div>'+
        '<div class="cd-action-bar-content">'+
            '<span class="cd-action-bar-label">回复 '+esc(name)+'</span>'+
            '<span class="cd-action-bar-text">'+esc(text)+'</span>'+
        '</div>'+
        '<div class="cd-action-bar-close" id="cdActionBarClose">'+
            '<svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'+
        '</div>';
    var area = detailEl.querySelector('.ca-detail-input-area');
    area.insertBefore(bar, area.firstChild);
    bar.querySelector('#cdActionBarClose').addEventListener('click', function(){
        removeActionBar();
        clearInputMeta();
    });
}

/* ── 编辑条 ── */
function showEditBar(){
    removeActionBar();
    var bar = document.createElement('div');
    bar.className = 'cd-action-bar edit-bar';
    bar.id = 'cdActionBar';
    bar.innerHTML =
        '<div class="cd-action-bar-line edit"></div>'+
        '<div class="cd-action-bar-content">'+
            '<span class="cd-action-bar-label">编辑消息</span>'+
        '</div>'+
        '<div class="cd-action-bar-close" id="cdActionBarClose">'+
            '<svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'+
        '</div>';
    var area = detailEl.querySelector('.ca-detail-input-area');
    area.insertBefore(bar, area.firstChild);
    bar.querySelector('#cdActionBarClose').addEventListener('click', function(){
        removeActionBar();
        clearInputMeta();
    });
}

/* ── 引用条 ── */
function showQuoteBar(name, text){
    removeActionBar();
    var bar = document.createElement('div');
    bar.className = 'cd-action-bar quote-bar';
    bar.id = 'cdActionBar';
    bar.innerHTML =
        '<div class="cd-action-bar-line quote"></div>'+
        '<div class="cd-action-bar-content">'+
            '<span class="cd-action-bar-label">引用 '+esc(name)+'</span>'+
            '<span class="cd-action-bar-text">'+esc(text)+'</span>'+
        '</div>'+
        '<div class="cd-action-bar-close" id="cdActionBarClose">'+
            '<svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'+
        '</div>';
    var area = detailEl.querySelector('.ca-detail-input-area');
    area.insertBefore(bar, area.firstChild);
    bar.querySelector('#cdActionBarClose').addEventListener('click', function(){
        removeActionBar();
        clearInputMeta();
    });
}

/* ── 气泡就地编辑 ── */
function openEditBubble(bubble, msg, msgIdx){
    if(!bubble || !msg) return;
    if(bubble.dataset.editing) return;
    bubble.dataset.editing = '1';

    /* 对于拆分气泡的AI消息，获取当前气泡对应的句子文本 */
    var row = bubble.closest('.ca-msg-row');
    var isUser = row && row.classList.contains('user');
    var bubbleId = row ? (row.dataset.bubbleId || '') : '';
    var original;
    var sentenceIdx = -1;

    if(!isUser && bubbleId){
        var idxParts = bubbleId.split('_');
        sentenceIdx = parseInt(idxParts[idxParts.length - 1], 10);
        if(!isNaN(sentenceIdx)){
            var sentences = splitSentences(msg.text);
            original = (sentenceIdx < sentences.length) ? sentences[sentenceIdx] : msg.text;
        } else {
            original = msg.text;sentenceIdx = -1;
        }
    } else {
        original = msg.text;}

    bubble.textContent = original;
    bubble.setAttribute('contenteditable', 'true');
    bubble.focus();

    /* 光标移到末尾 */
    var range = document.createRange();
    range.selectNodeContents(bubble);
    range.collapse(false);
    var sel = window.getSelection();
    if(sel){ sel.removeAllRanges(); sel.addRange(range); }

    bubble.classList.add('bubble-editing');

    function commit(){
        bubble.removeAttribute('contenteditable');
        delete bubble.dataset.editing;
        bubble.classList.remove('bubble-editing');
        bubble.removeEventListener('blur',   onBlur);
        bubble.removeEventListener('keydown', onKey);
        var newText = bubble.textContent.trim();
        if(!newText){ bubble.textContent = original; return; }
        if(newText === original){ return; }

        showEditConfirmModal(newText, function(){
            /* 确认保存 */
            if(!isUser && sentenceIdx >= 0){
                var sentences2 = splitSentences(msg.text);
                if(sentenceIdx < sentences2.length){
                    sentences2[sentenceIdx] = newText;
                    msg.text = sentences2.join('');
                } else {
                    msg.text = newText;
                }
            } else {
                msg.text = newText;
            }
            try{ localStorage.setItem('wp_chat_messages', JSON.stringify(window._wpChatConvs)); }catch(e){}
            showEditSavedToast();
        }, function(){
            /* 取消：恢复原文 */
            bubble.textContent = original;
        });
    }

    function onBlur(){ commit(); }
    function onKey(e){
        if(e.key === 'Enter'){ e.preventDefault(); bubble.blur(); }
        if(e.key === 'Escape'){ bubble.textContent = original; bubble.blur(); }
    }

    bubble.addEventListener('blur',    onBlur);
    bubble.addEventListener('keydown', onKey);
}

function removeActionBar(){
    var b = detailEl.querySelector('#cdActionBar');
    if(b) b.parentNode.removeChild(b);
}

function clearInputMeta(){
    var inp = detailEl.querySelector('#cdInput');
    delete inp.dataset.replyId;   delete inp.dataset.replyText; delete inp.dataset.replyName;
    delete inp.dataset.quoteId;   delete inp.dataset.quoteText; delete inp.dataset.quoteName;
    delete inp.dataset.editMsgId;
}

function bindMsgContextMenu(){
    var msgsEl = detailEl.querySelector('#cdMsgs');

    var startX, startY;
    msgsEl.addEventListener('pointerdown', function(e){
        var bubble = e.target.closest('.ca-msg-bubble');
        if(!bubble) return;
        if(multiSelectActive) return;
        startX = e.clientX; startY = e.clientY;
        ctxLongTimer = setTimeout(function(){
            if(navigator.vibrate) navigator.vibrate(10);
            showCtxMenu(bubble);
        }, CTX_LONG_MS);
    }, { passive: true });
    msgsEl.addEventListener('pointermove', function(e){
        if(!ctxLongTimer) return;
        if(Math.abs(e.clientX - startX) > 8 || Math.abs(e.clientY - startY) > 8){
            clearTimeout(ctxLongTimer); ctxLongTimer = null;
        }
    });
    msgsEl.addEventListener('pointerup',    function(){ clearTimeout(ctxLongTimer); ctxLongTimer = null; });
    msgsEl.addEventListener('pointercancel',function(){ clearTimeout(ctxLongTimer); ctxLongTimer = null; });
    msgsEl.addEventListener('contextmenu', function(e){
        var bubble = e.target.closest('.ca-msg-bubble');
        if(bubble) e.preventDefault();
    });
}

function toggleMenu(which){
    var clipWrap = detailEl.querySelector('#cdClipWrap');
    var invokeWrap = detailEl.querySelector('#cdInvokeWrap');
    var clipBtn = detailEl.querySelector('[data-action="clip"]');
    var invokeBtn = detailEl.querySelector('[data-action="invoke"]');

    if(which === 'clip'){
        var wasOpen = clipWrap.classList.contains('show');
        closeAllMenus();
        if(!wasOpen){
            clipWrap.classList.add('show');
            clipBtn.classList.add('open');
        }
    } else {
        var wasOpen2 = invokeWrap.classList.contains('show');
        closeAllMenus();
        if(!wasOpen2){
            invokeWrap.classList.add('show');
            invokeBtn.classList.add('open');
        }
    }
}

function closeAllMenus(){
    if(!detailEl) return;
    var cw = detailEl.querySelector('#cdClipWrap');
    var iw = detailEl.querySelector('#cdInvokeWrap');
    var cb = detailEl.querySelector('[data-action="clip"]');
    var ib = detailEl.querySelector('[data-action="invoke"]');
    if(cw) cw.classList.remove('show');
    if(iw) iw.classList.remove('show');
    if(cb) cb.classList.remove('open');
    if(ib) ib.classList.remove('open');
}

function esc(s){var d=document.createElement('div');d.textContent=s;return d.innerHTML;}

function timeNow(){
    var d = new Date();
    return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');
}

function sendMsg(){
    if(!detailEl) return;
    var inp = detailEl.querySelector('#cdInput');
    if(!inp) return;
    var text = inp.value.trim();
    if(!text) return;
    var msgsEl = detailEl.querySelector('#cdMsgs');
    if(!msgsEl) return;
    /* 发送前同步最新会话，避免被设置页等改坏引用 */
    try{
        var sFresh = JSON.parse(localStorage.getItem('wp_chat_messages')||'{}');
        if(!window._wpChatConvs) window._wpChatConvs = sFresh;
        else if(currentId && sFresh[currentId]) window._wpChatConvs[currentId] = sFresh[currentId];
    }catch(ee){}
    var t = timeNow();
    var d = new Date();
    var fullTime = d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()+' '+t;

    /* 编辑模式：修改原消息 */
    if(inp.dataset.editMsgId){
        var eid = inp.dataset.editMsgId;
        if(!currentId){ clearInputMeta(); return; }
        
        var msgs = window._wpChatConvs[currentId] || [];
        var idx = msgs.findIndex(function(m){ return m.id === eid; });
        if(idx >= 0){
            /* 弹出确认弹窗 */
            showEditConfirmModal(text, function(){
                msgs[idx].text = text;
                try{ 
                    localStorage.setItem('wp_chat_messages', JSON.stringify(window._wpChatConvs)); 
                }catch(e){}
                
                /* 只更新该条消息的气泡文本 */
                var msgsEl2 = detailEl.querySelector('#cdMsgs');
                var allRows2 = msgsEl2.querySelectorAll('[data-msg-id="'+eid+'"]');
                if(allRows2.length > 0){
                    var bubbles2 = allRows2[0].querySelectorAll('.ca-msg-bubble');
                    if(bubbles2.length > 0){
                        var nActive2 = getNarrationActive();
                        bubbles2[0].innerHTML = nActive2 ? formatNarrationInBubble(esc(text)) : esc(text);
                        for(var di2 = 1; di2 < allRows2.length; di2++){
                            if(allRows2[di2].parentNode) allRows2[di2].parentNode.removeChild(allRows2[di2]);
                        }
                    }
                }
                
                /* 已保存提示 */
                showEditSavedToast();
            });
        }
        inp.value = '';
        inp.dispatchEvent(new Event('input'));
        removeActionBar();
        clearInputMeta();
        closeAllMenus();
        return;
    }

    /* 引用 */
    var quoteHTML = '';
    if(inp.dataset.quoteText){
        quoteHTML = '<div class="ca-msg-quote">'+
            '<span class="ca-msg-quote-name">'+esc(inp.dataset.quoteName||'')+'</span>'+
            '<span class="ca-msg-quote-text">'+esc(inp.dataset.quoteText)+'</span>'+
        '</div>';
    }
    /* 回复 */
    var replyHTML = '';
    if(inp.dataset.replyText){
        replyHTML = '<div class="ca-msg-quote">'+
            '<span class="ca-msg-quote-name">'+esc(inp.dataset.replyName||'')+'</span>'+
            '<span class="ca-msg-quote-text">'+esc(inp.dataset.replyText)+'</span>'+
        '</div>';
    }
    var extraHTML = quoteHTML || replyHTML;

    var mid = 'm_'+Date.now();
    var row = document.createElement('div');
    row.className = 'ca-msg-row user';
    row.dataset.msgId = mid;
    row.innerHTML = '<div>'+extraHTML+'<div class="ca-msg-bubble">'+esc(text)+'</div><div class="ca-msg-bubble-time">'+t+'</div></div>';

    var emptyEl = msgsEl.querySelector('.ca-msg-empty');
    if(emptyEl){
        msgsEl.innerHTML = '<div class="ca-msg-time-tag">\u4eca\u5929</div>';
    }

    /* 隐藏上一条用户消息的时间戳 */
    var prevUserRows = msgsEl.querySelectorAll('.ca-msg-row.user');
    prevUserRows.forEach(function(r){
        var ts = r.querySelector('.ca-msg-bubble-time');
        if(ts) ts.style.display = 'none';
    });

    msgsEl.appendChild(row);
    inp.value = '';
    detailEl.querySelector('[data-action="invoke-api"]').classList.remove('has-text');
    removeActionBar();
    clearInputMeta();
    closeAllMenus();
    msgsEl.scrollTop = msgsEl.scrollHeight;

    if(currentId){
        if(!window._wpChatConvs) window._wpChatConvs = {};
        if(!window._wpChatConvs[currentId]) window._wpChatConvs[currentId] = [];
        window._wpChatConvs[currentId].push({
            id: mid, text: text, role: 'user', time: fullTime
        });
        try{ localStorage.setItem('wp_chat_messages', JSON.stringify(window._wpChatConvs)); }catch(e){}
    }
    setTimeout(function(){ trimOldMessages(); }, 50);
}

function renderMsgs(contactId, fromStart){
    var msgsEl = detailEl.querySelector('#cdMsgs');
    loadNarrationSettings();
    try{
        var stored = JSON.parse(localStorage.getItem('wp_chat_messages')||'{}');
        if(!window._wpChatConvs) window._wpChatConvs = stored;
        else {
            Object.keys(stored).forEach(function(k){
                if(!window._wpChatConvs[k]) window._wpChatConvs[k] = stored[k];
            });
        }
    }catch(e){}
    var convs = window._wpChatConvs || {};
    var msgs = convs[contactId] || [];
    if(msgs.length === 0){
        msgsEl.innerHTML = '<div class="ca-msg-empty"><div class="ca-msg-empty-text">发送第一条消息吧</div>';
        loadedMsgStart = 0;
        return;
    }
    var c = getContactData(contactId);
    var placeholder = DEFAULT_AVATAR;

    var totalMsgs = msgs.length;
    var startIdx = (typeof fromStart === 'number') ? fromStart : Math.max(0, totalMsgs - PAGE_SIZE);
    loadedMsgStart = startIdx;
    var displayMsgs = msgs.slice(startIdx);
    var hasMore = startIdx > 0;

    var html = '';
    if(hasMore){
        html += '<div class="cd-load-more" id="cdLoadMore" data-contact="'+contactId+'">'+
            '<div class="cd-load-more-line"></div>'+
            '<div class="cd-load-more-text">'+
                '<svg viewBox="0 0 24 24"><polyline points="18 15 12 9 6 15"/></svg>'+
                '<span>加载更早消息 ('+startIdx+'条)</span>'+
            '</div>'+
            '<div class="cd-load-more-line"></div>'+
        '</div>';
    }
    html += '<div class="ca-msg-time-tag">今天</div>';

    var lastUserIdx = -1;
    for(var li = displayMsgs.length - 1; li >= 0; li--){
        if(displayMsgs[li].role === 'user'){ lastUserIdx = li; break; }
    }

    displayMsgs.forEach(function(m, mIdx){
        var isUser = m.role === 'user';
        var mid = m.id || '';
        var t = (m.time||'').split(' ')[1] || '';
        if(isUser){
            var showTime = (mIdx === lastUserIdx);
            html += '<div class="ca-msg-row user" data-msg-id="'+mid+'" data-bubble-id="'+mid+'">'
                + '<div><div class="ca-msg-bubble">'+esc(m.text)+'</div>'
                + '<div class="ca-msg-bubble-time" style="'+(showTime?'':'display:none')+'">'+t+'</div></div>'
                + '</div>';
        } else {
            var sentences = splitSentences(m.text);
            sentences.forEach(function(sentence, idx){
                var isLast = idx === sentences.length - 1;
                var bubbleId = mid + '_' + idx;
                var avatarHtml = idx === 0
                    ? '<div class="ca-msg-avatar"><img src="'+placeholder+'" class="ca-contact-av"></div>'
                    : '<div class="ca-msg-avatar-placeholder"></div>';
                var timeHtml = isLast ? '<div class="ca-msg-bubble-time">'+t+'</div>' : '';
                var bubbleContent = formatNarrationAlways(esc(sentence), contactId);
                html += '<div class="ca-msg-row other" data-msg-id="'+mid+'" data-bubble-id="'+bubbleId+'">'
                    + avatarHtml
                    + '<div><div class="ca-msg-bubble">'+bubbleContent+'</div>'+timeHtml+'</div>'
                    + '</div>';
                var nPlacement = (narrationSettings[contactId] && narrationSettings[contactId].config) ? narrationSettings[contactId].config.placement : 'bubble';
                if(nPlacement === 'center'){
                    var nCfgR = narrationSettings[contactId].config;
                var reNr = /[（(]([^）)]+)[）)]|\*([^*\n]+)\*/g;
                    var mNr;
                    var escSentence = esc(sentence);
                    while((mNr = reNr.exec(escSentence)) !== null){
                        var nrRaw = (mNr[1] || mNr[2] || '').trim();
                                if(nrRaw && nrRaw.length >= 2){
                html += '<div class="cd-naration-center-line"><span class="cd-narration-text" style="font-size:'+nCfgR.fontSize+';color:'+nCfgR.color+';'+(nCfgR.italic?'font-style:italic;':'')+'">'+nrRaw+'</span></div>';
                        }
                    }
                }
            });
        }
    });
    msgsEl.innerHTML = html;

    var loadMoreBtn = msgsEl.querySelector('#cdLoadMore');
    if(loadMoreBtn){
        loadMoreBtn.addEventListener('click', function(){
            loadMoreMessages(contactId);
        });
    }
    
    msgsEl.scrollTop = msgsEl.scrollHeight;

    if(c && c.settings && c.settings.avatar){
        var av = c.settings.avatar;
        if(av.startsWith('data:')){
            msgsEl.querySelectorAll('.ca-contact-av').forEach(function(img){img.src = av;});
        } else if(av.startsWith('avatar_') && window.WhisperDB){
            WhisperDB.get(av).then(function(data){
                if(data){
                    msgsEl.querySelectorAll('.ca-contact-av').forEach(function(img){img.src = data;});
                }
            });
        }
    }
}

function trimOldMessages(){
    if(!detailEl || !currentId) return;
    var msgsEl = detailEl.querySelector('#cdMsgs');
    if(!msgsEl) return;
    var rows = msgsEl.querySelectorAll('.ca-msg-row');
    if(rows.length <= PAGE_SIZE) return;
    
    var toRemove = rows.length - PAGE_SIZE;
    for(var i = 0; i < toRemove; i++){
        if(rows[i] && rows[i].parentNode){
            rows[i].parentNode.removeChild(rows[i]);
        }
    }
    var convs = window._wpChatConvs || {};
    var msgs = convs[currentId] || [];
    loadedMsgStart = Math.max(0, msgs.length - PAGE_SIZE);
    
    if(!msgsEl.querySelector('#cdLoadMore') && loadedMsgStart > 0){
        var timeTag = msgsEl.querySelector('.ca-msg-time-tag');
        var loadMoreEl = document.createElement('div');
        loadMoreEl.className = 'cd-load-more';
        loadMoreEl.id = 'cdLoadMore';
        loadMoreEl.dataset.contact = currentId;
        loadMoreEl.innerHTML = 
            '<div class="cd-load-more-line"></div>'+
            '<div class="cd-load-more-text">'+
                '<svg viewBox="0 0 24 24"><polyline points="18 15 12 9 6 15"/></svg>'+
                '<span>加载更早消息 ('+loadedMsgStart+'条)</span>'+
            '</div>'+
            '<div class="cd-load-more-line"></div>';
        
        if(timeTag){
            msgsEl.insertBefore(loadMoreEl, timeTag);
        } else {
            msgsEl.insertBefore(loadMoreEl, msgsEl.firstChild);
        }
        
        loadMoreEl.addEventListener('click', function(){
            loadMoreMessages(currentId);
        });
    }
}

function loadMoreMessages(contactId){
    if(!detailEl || loadedMsgStart <= 0) return;
    var msgsEl = detailEl.querySelector('#cdMsgs');
    var loadMoreBtn = msgsEl.querySelector('#cdLoadMore');
    if(loadMoreBtn) loadMoreBtn.classList.add('loading');
    var convs = window._wpChatConvs || {};
    var msgs = convs[contactId] || [];
    var c = getContactData(contactId);
    var placeholder = DEFAULT_AVATAR;
    var newStart = Math.max(0, loadedMsgStart - PAGE_SIZE);
    var loadMsgs = msgs.slice(newStart, loadedMsgStart);
    var hasMore = newStart > 0;
    
    var oldScrollHeight = msgsEl.scrollHeight;
    var html = '';
    if(hasMore){
        html += '<div class="cd-load-more" id="cdLoadMore" data-contact="'+contactId+'">'+
            '<div class="cd-load-more-line"></div>'+
            '<div class="cd-load-more-text">'+
                '<svg viewBox="0 0 24 24"><polyline points="18 15 12 9 6 15"/></svg>'+
                '<span>加载更早消息 ('+newStart+'条)</span>'+
            '</div>'+
            '<div class="cd-load-more-line"></div>'+
        '</div>';
    }
    loadMsgs.forEach(function(m){
        var isUser = m.role === 'user';
        var mid = m.id || '';
        var t = (m.time||'').split(' ')[1] || '';
        if(isUser){
            html += '<div class="ca-msg-row user" data-msg-id="'+mid+'" data-bubble-id="'+mid+'">'
                + '<div><div class="ca-msg-bubble">'+esc(m.text)+'</div>'
                + '<div class="ca-msg-bubble-time" style="display:none">'+t+'</div></div>'
                + '</div>';
        } else {
            var sentences = splitSentences(m.text);
            sentences.forEach(function(sentence, idx){
                var isLast = idx === sentences.length - 1;
                var bubbleId = mid + '_' + idx;
                var avatarHtml = idx === 0
                    ? '<div class="ca-msg-avatar"><img src="'+placeholder+'" class="ca-contact-av"></div>'
                    : '<div class="ca-msg-avatar-placeholder"></div>';
                var timeHtml = isLast ? '<div class="ca-msg-bubble-time">'+t+'</div>' : '';
                var bubbleContent = formatNarrationAlways(esc(sentence), contactId);
                html += '<div class="ca-msg-row other" data-msg-id="'+mid+'" data-bubble-id="'+bubbleId+'">'
                    + avatarHtml
                    + '<div><div class="ca-msg-bubble">'+bubbleContent+'</div>'+timeHtml+'</div>'
                    + '</div>';
                var nPlacement = (narrationSettings[contactId] && narrationSettings[contactId].config) ? narrationSettings[contactId].config.placement : 'bubble';
                if(nPlacement === 'center'){
                    var nCfgR = narrationSettings[contactId].config;
                    var reNr = /[（(]([^）)]+)[）)]|\*([^*\n]+)\*/g;
                    var mNr;
                    var escSentence = esc(sentence);
                    while((mNr = reNr.exec(escSentence)) !== null){
                        var nrRaw = (mNr[1] || mNr[2] || '').trim();
                        if(nrRaw && nrRaw.length >= 2){
                            html += '<div class="cd-narration-center-line"><span class="cd-narration-text" style="font-size:'+nCfgR.fontSize+';color:'+nCfgR.color+';'+(nCfgR.italic?'font-style:italic;':'')+'">'+nrRaw+'</span></div>';
                        }
                    }
                }
            });
        }
    });
    if(loadMoreBtn) loadMoreBtn.parentNode.removeChild(loadMoreBtn);
    var timeTag = msgsEl.querySelector('.ca-msg-time-tag');
    if(timeTag){
        var temp = document.createElement('div');
        temp.innerHTML = html;
        while(temp.firstChild){
            msgsEl.insertBefore(temp.firstChild, timeTag);
        }
    }
    
    loadedMsgStart = newStart;
    var newLoadMoreBtn = msgsEl.querySelector('#cdLoadMore');
    if(newLoadMoreBtn){
        newLoadMoreBtn.addEventListener('click', function(){
            loadMoreMessages(contactId);
        });
    }
    
    var newScrollHeight = msgsEl.scrollHeight;
    msgsEl.scrollTop = newScrollHeight - oldScrollHeight;
    if(c && c.settings && c.settings.avatar){
        var av = c.settings.avatar;
        if(av.startsWith('data:')){
            msgsEl.querySelectorAll('.ca-contact-av').forEach(function(img){img.src = av;});
        } else if(av.startsWith('avatar_') && window.WhisperDB){
            WhisperDB.get(av).then(function(data){
                if(data){
                    msgsEl.querySelectorAll('.ca-contact-av').forEach(function(img){img.src = data;});
                }
            });
        }
    }
}

function openDetail(id){
    ensureDetail();
    refreshApiCache();
    loadNarrationSettings();
    currentId = id;
    initNarrationForContact(id);
    var c = getContactData(id);
    if(!c) return;

    /* 重置输入状态，防止上一个聊天的残留阻止发送 */
    var inp = detailEl.querySelector('#cdInput');
    inp.value = '';
    removeActionBar();
    clearInputMeta();
    closeAllMenus();
    detailEl.querySelector('[data-action="invoke-api"]').classList.remove('has-text');

    detailEl.querySelector('#cdName').textContent = c.name;
    detailEl.querySelector('#cdStatus').textContent = c.online ? '在线' : '';
    loadAvatar(c, detailEl.querySelector('#cdAvatarImg'));

    var msgsEl = detailEl.querySelector('#cdMsgs');
    applyWallpaper(id);
    applyInputBarStyle(id);
    msgsEl.style.fontSize = getFontSize(c);

    renderMsgs(id);
    detailEl.classList.add('active');
    setTimeout(function(){
        msgsEl.scrollTop = msgsEl.scrollHeight;
    }, 100);
}

function applyWallpaper(contactId){
    var msgsEl = detailEl.querySelector('#cdMsgs');
    if(!msgsEl) return;
    var c = getContactData(contactId);
    var cfg = (c && c.settings) || {};
    var wp = cfg.wallpaper || 'cs-wp-a';

    /* 清除旧壁纸 */
    msgsEl.style.backgroundImage = '';
    msgsEl.style.backgroundColor = '';
    msgsEl.style.backgroundSize = '';
    msgsEl.style.background = '';

    if(wp === 'cs-wp-a'){
        msgsEl.style.background = '#fff';
        msgsEl.style.backgroundImage = 'radial-gradient(circle,rgba(0,0,0,0.008) 1px,transparent 1px)';
        msgsEl.style.backgroundSize = '20px 20px';
    } else if(wp === 'cs-wp-b'){
        msgsEl.style.background = '#fff';
        msgsEl.style.backgroundImage = 'radial-gradient(circle,rgba(0,0,0,0.025) 1px,transparent 1px)';
        msgsEl.style.backgroundSize = '7px 7px';
    } else if(wp === 'cs-wp-c'){
        msgsEl.style.background = 'repeating-linear-gradient(0deg,#fff 0px,#fff 10px,rgba(0,0,0,0.012) 10px,rgba(0,0,0,0.012) 11px)';
    } else if(wp === 'cs-wp-d'){
        msgsEl.style.background = 'linear-gradient(180deg,#fdfcfa,#f7f4ef)';
    } else if(wp === 'cs-wp-e'){
        msgsEl.style.background = 'linear-gradient(180deg,#fafcfe,#eef3f8)';
    } else if(wp === 'cs-wp-custom'){
        var wpKey = cfg.wallpaperKey || ('wallpaper_' + contactId);
        if(window.WhisperDB){
            WhisperDB.get(wpKey).then(function(data){
                if(data){
                    msgsEl.style.background = 'url('+data+') center/cover no-repeat';
                }
            });
        }
    }
}

function applyInputBarStyle(contactId){
    var inputArea = detailEl.querySelector('.ca-detail-input-area');
    if(!inputArea) return;
    var c = getContactData(contactId);
    var cfg = (c && c.settings) || {};
    var style = cfg.inputBarStyle || 'capsule';
    if(style === 'block'){
        detailEl.classList.add('bar-block');
        detailEl.classList.remove('bar-capsule');
    } else {
        detailEl.classList.add('bar-capsule');
        detailEl.classList.remove('bar-block');
    }
}

function closeDetail(){
    if(!detailEl) return;
    detailEl.classList.remove('active');
    closeAllMenus();
    currentId = null;
}

/* 实时刷新当前聊天（设置改动即时生效） */
function refreshCurrentChat(){
    if(!detailEl) return;
    var id = currentId;
    if(!id){
        try{
            var contacts = JSON.parse(localStorage.getItem('wp_chat_contacts')||'[]');
            if(contacts.length > 0) id = contacts[0].id;
        }catch(e){}
    }
    if(!id) return;
    var c = getContactData(id);
    if(!c) return;
    var nameEl = detailEl.querySelector('#cdName');
    var statusEl = detailEl.querySelector('#cdStatus');
    var avatarEl = detailEl.querySelector('#cdAvatarImg');
    if(nameEl) nameEl.textContent = c.name;
    if(statusEl) statusEl.textContent = c.online ? '在线' : '';
    if(avatarEl) loadAvatar(c, avatarEl);
    var msgsEl = detailEl.querySelector('#cdMsgs');
    if(!msgsEl) return;

    applyWallpaper(id);
    applyInputBarStyle(id);
    msgsEl.style.fontSize = getFontSize(c);

    /* 实时刷新气泡内所有对方头像 */
    var allAvatarImgs = msgsEl.querySelectorAll('.ca-contact-av, .ca-new-av, .ca-typing-av');
    if(allAvatarImgs.length > 0){
        if(c.settings && c.settings.avatar){
            var av = c.settings.avatar;
            if(av.startsWith('data:')){
                allAvatarImgs.forEach(function(img){img.src = av;});
            } else if(av.startsWith('avatar_') && window.WhisperDB){
                WhisperDB.get(av).then(function(data){
                    if(data){
                        allAvatarImgs.forEach(function(img){img.src = data;});
                    }
                });
            }
        } else {
            allAvatarImgs.forEach(function(img){img.src = DEFAULT_AVATAR;});
        }
    }
}
window._wpRefreshChat = refreshCurrentChat;

/* ── API 调取 ── */
function getAPIConfig(){
    var cfg = {key:'',url:'https://api.openai.com/v1/chat/completions',model:'gpt-4o-mini'};
    /* 优先读 WhisperDB（与 API 设置页一致） */
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
    /* 兼容旧 localStorage */
    try{
        var s = localStorage.getItem('whisperphone_api');
        if(s){var dd=JSON.parse(s);if(!cfg.key && dd.key)cfg.key=dd.key;if(dd.url && !window._wpApiCache)cfg.url=dd.url;if(!cfg.model && dd.model)cfg.model=dd.model;}
    }catch(e){}
    return cfg;
}

/* 进入聊天时拉一次最新 API 配置 */
function refreshApiCache(){
    if(!window.WhisperDB) return;
    WhisperDB.get('whisperphone_api_v1').then(function(d){
        if(d) window._wpApiCache = d;
    }).catch(function(){});
}

function getContextRounds(c){
    var r = c && c.settings && c.settings.contextRounds;
    if(!r) return 20;
    var n = parseInt(r, 10);
    return isNaN(n) ? 20 : Math.max(1, n);
}

function invokeAPI(){
    if(!currentId || !detailEl) return;

    /* 始终以localStorage 为准重建会话引用，避免共享状态被改坏后发不出*/
    try{
        var freshConvs = JSON.parse(localStorage.getItem('wp_chat_messages')||'{}');
        if(!window._wpChatConvs) window._wpChatConvs = freshConvs;
        else if(freshConvs[currentId]) window._wpChatConvs[currentId] = freshConvs[currentId];
    }catch(e){}

    var convs = window._wpChatConvs||{};
    var msgs = convs[currentId]||[];
    if(msgs.length === 0){ addSysBubble('请先发送一条消息'); return; }

    var cfg = getAPIConfig();
    if(!cfg.key){ addSysBubble('请先在 API 设置中配置 Key'); return; }

    var c = getContactData(currentId);
    var prompt;
    try{ prompt = getPrompt(c); }catch(e){ prompt = ''; }

    /* 按轮数截断上下文，1轮 = user+assistant各一条 */
    var rounds = getContextRounds(c);
    var ctxMsgs = msgs.slice(-(rounds * 2));

    /* ── 世界书匹配（容错：任何错误都不能阻断发送/调用） ── */
    var wbEntries = [];
    if(typeof window._wpGetWorldBookEntries === 'function'){
        try{ wbEntries = window._wpGetWorldBookEntries(currentId, msgs) || []; }
        catch(e){ wbEntries = []; }
    }

    /* 按位置分组 */
    var wbBeforeSystem = [];
    var wbAfterSystem  = [];
    var wbBeforeChat   = [];
    var wbAtDepth      = {};
    wbEntries.forEach(function(e){
        if(e.position === 'before_system') wbBeforeSystem.push(e.content);
        else if(e.position === 'before_chat') wbBeforeChat.push(e.content);
        else if(e.position === 'at_depth'){
            var d = e.depth || 4;
            if(!wbAtDepth[d]) wbAtDepth[d] = [];
            wbAtDepth[d].push(e.content);
        }
        else wbAfterSystem.push(e.content);
    });

    /* 组装 apiMsgs */
    var apiMsgs = [];

    /* 1. before_system 条目 */
    if(wbBeforeSystem.length > 0){
        apiMsgs.push({role:'system', content:wbBeforeSystem.join('\n\n')});
    }

    /* 2. 主 system prompt */
    apiMsgs.push({role:'system', content:prompt});

    /* 旁白注入 */
    var nrInject = getNarrationPromptInject();
    var nrDisable = getNarrationDisableInject();
    if(nrInject) apiMsgs.push({role:'system', content:nrInject});
    if(nrDisable) apiMsgs.push({role:'system', content:nrDisable});

    /* 时间感知注入 */
    var timeInject = getTimeAwareInject();
    if(timeInject) apiMsgs.push({role:'system', content:timeInject});

    /* 记忆库注入 */
    try{var memKey = 'wp_memory_' + currentId;
        var memories = JSON.parse(localStorage.getItem(memKey) || '[]');
        if(memories.length > 0){
            var levelLabels = ['短期','长期','重要','核心'];
            var sortedMem = memories.slice().sort(function(a, b){
                var lvA = (typeof a.level === 'number') ? a.level : 1;
                var lvB = (typeof b.level === 'number') ? b.level : 1;
                return lvB - lvA;
            });
            var memText = sortedMem.map(function(m){
                var lv = (typeof m.level === 'number') ? m.level : 1;
                var lvLabel = levelLabels[lv] || '长期';
                return '['+lvLabel+']['+m.date+'] '+m.text;
            }).join('\n');
            apiMsgs.push({role:'system', content:'[记忆库 - 禁止删除/省略/删减已有记忆]\n'+memText});
        }
    }catch(e){}

    /* 自动总结：检查是否需要触发 */
    try{
        var autoC = getContactData(currentId);
        if(autoC && autoC.settings && autoC.settings.memAutoSumm){
            var slideCount = autoC.settings.memSlideCount || 30;
            var autoConvs = window._wpChatConvs || {};
            var autoMsgs = autoConvs[currentId] || [];
            var memKey2 = 'wp_memory_' + currentId;
            var autoMem = JSON.parse(localStorage.getItem(memKey2) || '[]');
            var lastAutoIdx = -1;
            for(var ai = autoMem.length - 1; ai >= 0; ai--){
                if(autoMem[ai].source === 'auto-ai'){ lastAutoIdx = ai; break; }
            }
            var lastAutoTime = (lastAutoIdx >= 0 && autoMem[lastAutoIdx].msgCount) ? autoMem[lastAutoIdx].msgCount : 0;
            if(autoMsgs.length - lastAutoTime >= slideCount){
                /* 注入自动总结指令 */
                apiMsgs.push({role:'system', content:'[自动总结指令]在回复末尾，用【记忆总结】标记输出对最近'+slideCount+'条消息的总结。格式：【记忆总结】[年月日时间] 事件起因经过结果。按重要性排列，标注时间段。这段总结会被系统提取保存，不要省略关键信息。'});
            }
        }
    }catch(e){}

    /* 3. after_system 条目 */
    if(wbAfterSystem.length > 0){
        apiMsgs.push({role:'system', content:wbAfterSystem.join('\n\n')});
    }

    /* 4. before_chat 条目 */
    if(wbBeforeChat.length > 0){
        apiMsgs.push({role:'system', content:wbBeforeChat.join('\n\n')});
    }

    /* 5. 对话消息（含 at_depth 注入） */
    var chatMsgs = [];
    ctxMsgs.forEach(function(m){
        chatMsgs.push({role:m.role==='user'?'user':'assistant', content:m.text});
    });

    /* at_depth：在倒数第 depth 条消息前插入 */
    var depthKeys = Object.keys(wbAtDepth).map(Number).sort(function(a,b){return b-a;});
    depthKeys.forEach(function(d){
        var insertIdx = chatMsgs.length - d;
        if(insertIdx < 0) insertIdx = 0;
        chatMsgs.splice(insertIdx, 0, {role:'system', content:wbAtDepth[d].join('\n\n')});
    });

    apiMsgs = apiMsgs.concat(chatMsgs);

    var apiBtn = detailEl.querySelector('[data-action="invoke-api"]');
    apiBtn.classList.add('loading');

    var msgsEl = detailEl.querySelector('#cdMsgs');
    var typingRow = document.createElement('div');
    typingRow.className = 'ca-typing-indicator';
    typingRow.id = 'cdTyping';
    typingRow.innerHTML = '<div class="ca-typing-avatar"><img src="'+DEFAULT_AVATAR+'" class="ca-typing-av"></div>'+
        '<div class="ca-typing-text">正在思考...</div>';
    var typingImg = typingRow.querySelector('.ca-typing-av');
    if(typingImg) loadAvatar(c, typingImg);
    msgsEl.appendChild(typingRow);
    msgsEl.scrollTop = msgsEl.scrollHeight;

    fetch(cfg.url,{
        method:'POST',
        headers:{'Content-Type':'application/json','Authorization':'Bearer '+cfg.key},
        body:JSON.stringify({model:cfg.model,messages:apiMsgs})
    })
    .then(function(r){return r.json();})
    .then(function(data){
        var el = detailEl.querySelector('#cdTyping');
        if(el) el.parentNode.removeChild(el);
        apiBtn.classList.remove('loading');

        var reply = '';
        if(data.choices && data.choices[0] && data.choices[0].message){
            reply = data.choices[0].message.content;
        } else if(data.error){
            reply = '';
            addSysBubble('错误：'+(data.error.message||'请求失败'));
        }
        if(reply){
            /* 提取自动总结（如果有） */
            var cleanReply = reply;
            var summaryMatch = reply.match(/【记忆总结】([\s\S]+)$/);
            if(summaryMatch){
                cleanReply = reply.replace(/【记忆总结】[\s\S]+$/, '').trim();
                var summaryText = summaryMatch[1].trim();
                if(summaryText && currentId){
                    try{
                        var memKey3 = 'wp_memory_' + currentId;
                        var autoMemories = JSON.parse(localStorage.getItem(memKey3) || '[]');
                        var nowD = new Date();
                        var autoTimeStr = nowD.getFullYear()+'-'+String(nowD.getMonth()+1).padStart(2,'0')+'-'+String(nowD.getDate()).padStart(2,'0')+' '+String(nowD.getHours()).padStart(2,'0')+':'+String(nowD.getMinutes()).padStart(2,'0');
                        var autoConvs2 = window._wpChatConvs || {};
                        var autoMsgCount = (autoConvs2[currentId] || []).length;
                        autoMemories.push({ id:'mem_'+Date.now(), text:summaryText, level:1, date:autoTimeStr, source:'auto-ai', msgCount:autoMsgCount });
                        localStorage.setItem(memKey3, JSON.stringify(autoMemories));
                    }catch(e){}
                }
            }
            addContactBubble(cleanReply || reply);
            var t = timeNow();
            var d = new Date();
            var ft = d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()+' '+t;
            if(!window._wpChatConvs) window._wpChatConvs={};
            if(!window._wpChatConvs[currentId]) window._wpChatConvs[currentId]=[];
            window._wpChatConvs[currentId].push({id:'m_'+Date.now(),text:cleanReply||reply,role:'contact',time:ft});
            try{localStorage.setItem('wp_chat_messages',JSON.stringify(window._wpChatConvs));}catch(e){}
        }
    })
    .catch(function(err){
        var el = detailEl.querySelector('#cdTyping');
        if(el) el.parentNode.removeChild(el);
        apiBtn.classList.remove('loading');
        addSysBubble('请求失败：'+err.message);
    });
}

function splitSentences(text){
    var result = [];
    var buf = '';
    for(var i = 0; i < text.length; i++){
        var ch = text.charAt(i);
        buf += ch;
        if(/[。！？!?…]/.test(ch)){
            while(i + 1 < text.length && /[。！？!?…]/.test(text.charAt(i + 1))){
                buf += text.charAt(i + 1);
                i++;
            }
            var s = buf.trim();
            if(s) result.push(s);
            buf = '';
        }
    }
    if(buf.trim()) result.push(buf.trim());
    if(result.length <= 1){
        result = text.split(/\n+/).map(function(s){ return s.trim(); }).filter(function(s){ return s; });
    }
    return result.length > 0 ? result : [text];
}

function addContactBubble(text){
    var msgsEl = detailEl.querySelector('#cdMsgs');
    var c = getContactData(currentId);
    var t = timeNow();
    var sentences = splitSentences(text);
    /* 整条消息共享同一个 msgId，拆分气泡用 bubbleId 区分 */
    var sharedMid = 'm_' + Date.now();

    var cumDelay = 0;
    sentences.forEach(function(sentence, idx){
        var isLast = idx === sentences.length - 1;
        var bubbleId = sharedMid + '_' + idx;
        var readMs = Math.min(Math.max(sentence.length * 55, 420), 1400);
        var thisDelay = cumDelay;
        cumDelay += readMs;

        setTimeout(function(){
            var row = document.createElement('div');
            row.className = 'ca-msg-row other';
            row.dataset.msgId = sharedMid;
            row.dataset.bubbleId = bubbleId;

            var avatarHtml = idx === 0
                ? '<div class="ca-msg-avatar"><img src="'+DEFAULT_AVATAR+'" class="ca-new-av"></div>'
                : '<div class="ca-msg-avatar-placeholder"></div>';

            var timeHtml = isLast
                ? '<div class="ca-msg-bubble-time">'+t+'</div>'
                : '';

            var safeSentence = esc(sentence);
            var bubbleHtml = safeSentence;
            var active = getNarrationActive();
            var cfg = getNarrationConfig();
            if(active && cfg.placement === 'center'){
                var parts = splitNarrationParts(safeSentence);
                bubbleHtml = '';
                parts.forEach(function(part){
                    if(part.type === 'narration'){
                        appendCenteredNarration(msgsEl, part.text);
                    } else {
                        bubbleHtml += part.text.replace(/\*/g, '');
                    }
                });
                bubbleHtml = bubbleHtml.trim();
            } else if(active){
                bubbleHtml = formatNarrationInBuble(safeSentence);
            }

            if(bubbleHtml){
                row.innerHTML = avatarHtml +
                '<div><div class="ca-msg-bubble">'+bubbleHtml+'</div>'+timeHtml+'</div>';
                msgsEl.appendChild(row);
            }
            
            msgsEl.scrollTop = msgsEl.scrollHeight;

            if(idx === 0){
                var img = row.querySelector('.ca-new-av');
                if(img) loadAvatar(c, img);
            }
            if(isLast){
                setTimeout(function(){ trimOldMessages(); }, 50);
            }
        }, thisDelay);
    });
}

function addSysBubble(text){
    var msgsEl = detailEl.querySelector('#cdMsgs');
    var el = document.createElement('div');
    el.className = 'ca-msg-sys';
    el.textContent = text;
    msgsEl.appendChild(el);
    msgsEl.scrollTop = msgsEl.scrollHeight;
}

/* ── 多选删除 ── */
var multiSelectActive = false;

function enterMultiSelect(initialBuble){
    if(!detailEl) return;
    multiSelectActive = true;
    var msgsEl = detailEl.querySelector('#cdMsgs');
    msgsEl.classList.add('multi-select-mode');
    msgsEl.querySelectorAll('.ca-msg-row').forEach(function(row){
        addMultiDot(row);
    });
    msgsEl.querySelectorAll('.cd-narration-center-line').forEach(function(line){
        addMultiDotToNarration(line);
    });
    showMultiBar();
}

function addMultiDotToNarration(line){
    if(line.querySelector('.ca-msg-mdot')) return;
    var dot = document.createElement('div');
    dot.className = 'ca-msg-mdot';
    dot.addEventListener('click', function(e){
        e.stopPropagation();
        line.classList.toggle('msg-selected');
        updateMultiBar();
    });
    line.appendChild(dot);
}

function addMultiDot(row){
    if(row.querySelector('.ca-msg-mdot')) return;
    var dot = document.createElement('div');
    dot.className = 'ca-msg-mdot';
    dot.addEventListener('click', function(e){
        e.stopPropagation();
        row.classList.toggle('msg-selected');
        updateMultiBar();
    });
    /* 点放进气泡所在的内层容器，紧跟气泡右侧，不撑变气泡 */
    var inner = row.querySelector('.ca-msg-bubble');
    if(inner && inner.parentNode){
        inner.parentNode.appendChild(dot);} else {
        row.appendChild(dot);
    }
}

function getSelectedRows(){
    var msgsEl = detailEl.querySelector('#cdMsgs');
    return Array.prototype.slice.call(msgsEl.querySelectorAll('.ca-msg-row.msg-selected'));
}

function getSelectedNarrationLines(){
    var msgsEl = detailEl.querySelector('#cdMsgs');
    return Array.prototype.slice.call(msgsEl.querySelectorAll('.cd-narration-center-line.msg-selected'));
}

function showMultiBar(){
    if(detailEl.querySelector('#cdMultiBar')){ updateMultiBar(); return; }
    var bar = document.createElement('div');
    bar.id = 'cdMultiBar';
    bar.className = 'cd-multi-bar';
    bar.innerHTML =
        '<div class="cd-multi-count" id="cdMultiCount">已选 0</div>'+
        '<div class="cd-multi-btns">'+
            '<div class="cd-multi-btn cancel" id="cdMultiCancel">取消</div>'+
            '<div class="cd-multi-btn del" id="cdMultiDel">删除</div>'+
        '</div>';
    detailEl.appendChild(bar);
    bar.querySelector('#cdMultiCancel').addEventListener('click', exitMultiSelect);
    bar.querySelector('#cdMultiDel').addEventListener('click', deleteSelected);
    requestAnimationFrame(function(){ bar.classList.add('show'); });
    updateMultiBar();
}

function updateMultiBar(){
    var el = detailEl.querySelector('#cdMultiCount');
    var total = getSelectedRows().length + getSelectedNarrationLines().length;
    if(el) el.textContent = '已选 ' + total;
}

function exitMultiSelect(){
    multiSelectActive = false;
    var msgsEl = detailEl.querySelector('#cdMsgs');
    msgsEl.classList.remove('multi-select-mode');
    msgsEl.querySelectorAll('.ca-msg-row').forEach(function(row){
        row.classList.remove('msg-selected');
        var dot = row.querySelector('.ca-msg-mdot');
        if(dot) dot.parentNode.removeChild(dot);
    });
    msgsEl.querySelectorAll('.cd-narration-center-line').forEach(function(line){
        line.classList.remove('msg-selected');
        var dot = line.querySelector('.ca-msg-mdot');
        if(dot) dot.parentNode.removeChild(dot);
    });
    var bar = detailEl.querySelector('#cdMultiBar');
    if(bar){
        bar.classList.remove('show');
        setTimeout(function(){ if(bar.parentNode) bar.parentNode.removeChild(bar); }, 300);
    }
}

function deleteSelected(){
    var rows = getSelectedRows();
    var narationLines = getSelectedNarrationLines();
    if(rows.length === 0 && narrationLines.length === 0){ exitMultiSelect(); return; }
    
    narrationLines.forEach(function(line){
        if(line.parentNode) line.parentNode.removeChild(line);
    });
    if(rows.length === 0 || !currentId){ exitMultiSelect(); return; }
    var convs = window._wpChatConvs || {};
    var msgs = convs[currentId] || [];

    /* 用户消息整条删；AI消息按句索引删 */
    var userMsgIds = {};
    var aiSentenceMap = {};
    rows.forEach(function(row){
        var isUser = row.classList.contains('user');
        var msgId = row.dataset.msgId;
        if(isUser){
            userMsgIds[msgId] = true;
        } else {
            var idxParts = (row.dataset.bubbleId || '').split('_');
            var sIdx = parseInt(idxParts[idxParts.length - 1], 10);
            if(!aiSentenceMap[msgId]) aiSentenceMap[msgId] = [];
            if(!isNaN(sIdx)) aiSentenceMap[msgId].push(sIdx);
        }
    });

    Object.keys(aiSentenceMap).forEach(function(msgId){
        var mi = msgs.findIndex(function(m){ return m.id === msgId; });
        if(mi < 0) return;
        var sentences = splitSentences(msgs[mi].text);
        var idxs = aiSentenceMap[msgId].sort(function(a,b){ return b - a; });
        idxs.forEach(function(si){
            if(si >= 0 && si < sentences.length) sentences.splice(si, 1);
        });
        if(sentences.length === 0){
            userMsgIds[msgId] = true;
        } else {
            msgs[mi].text = sentences.join('');
        }
    });

    msgs = msgs.filter(function(m){ return !userMsgIds[m.id]; });
    convs[currentId] = msgs;
    window._wpChatConvs = convs;
    try{ localStorage.setItem('wp_chat_messages', JSON.stringify(convs)); }catch(e){}

    rows.forEach(function(row){ if(row.parentNode) row.parentNode.removeChild(row); });
    exitMultiSelect();
}

/* ── 旁白系统 ── */
var narrationSettings = {};

function initNarrationForContact(contactId){
    if(!narrationSettings[contactId]){
        narrationSettings[contactId] = {
            active: false,
            config: { fontSize: '12px', italic: true, color: '#b0b0b0', minWords: 5, maxWords: 30, placement: 'bubble' }
        };
    }
    return narrationSettings[contactId];
}

function getNarrationActive(){
    if(!currentId) return false;
    var ns = narrationSettings[currentId];
    return ns ? ns.active : false;
}

function getNarrationConfig(){
    if(!currentId) return { fontSize: '12px', italic: true, color: '#b0b0b0', minWords: 5, maxWords: 30, placement: 'bubble' };
    var ns = narrationSettings[currentId];
    return ns ? ns.config : { fontSize: '12px', italic: true, color: '#b0b0b0', minWords: 5, maxWords: 30, placement: 'bubble' };
}

function setNarrationActive(val){
    if(!currentId) return;
    initNarrationForContact(currentId);
    narrationSettings[currentId].active = val;
    saveNarrationSettings();
}

function setNarrationConfig(cfg){
    if(!currentId) return;
    initNarrationForContact(currentId);
    narrationSettings[currentId].config = cfg;
    saveNarrationSettings();
}

function saveNarrationSettings(){
    try{ localStorage.setItem('wp_narration_settings', JSON.stringify(narrationSettings)); }catch(e){}
}

function loadNarrationSettings(){
    try{
        var saved = JSON.parse(localStorage.getItem('wp_narration_settings')||'{}');
        narrationSettings = saved;
    }catch(e){ narrationSettings = {}; }
}

loadNarrationSettings();

/* 已在上面统一处理 */

function showNarrationModal(){
    if(!currentId) return;
    var existing = detailEl.querySelector('#cdNarrationModal');
    if(existing) existing.parentNode.removeChild(existing);

    var active = getNarrationActive();
    var cfg = getNarrationConfig();

    var modal = document.createElement('div');
    modal.id = 'cdNarrationModal';
    modal.className = 'cd-narration-modal-mask';
    modal.innerHTML =
        '<div class="cd-narration-modal">'+
            '<div class="cd-narration-modal-header">'+
                '<svg viewBox="0 0 24 24" class="cd-narration-modal-icon"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>'+
                '<span>旁白设置</span>'+
            '</div>'+
            '<div class="cd-narration-row">'+
                '<span class="cd-narration-label">字体大小</span>'+
                '<select class="cd-narration-select" id="nrFontSize">'+
                    '<option value="10px"'+(cfg.fontSize==='10px'?' selected':'')+'>极小</option>'+
                    '<option value="12px"'+(cfg.fontSize==='12px'?' selected':'')+'>小 (默认)</option>'+
                    '<option value="14px"'+(cfg.fontSize==='14px'?' selected':'')+'>标准</option>'+
                    '<option value="16px"'+(cfg.fontSize==='16px'?' selected':'')+'>大</option>'+
                '</select>'+
            '</div>'+
            '<div class="cd-narration-row">'+
                '<span class="cd-narration-label">斜体</span>'+
                '<div class="cd-narration-sw'+(cfg.italic?' on':'')+'" id="nrItalic"></div>'+
            '</div>'+
            '<div class="cd-narration-row">'+
                '<span class="cd-narration-label">颜色</span>'+
                '<input type="color" class="cd-narration-color" id="nrColor" value="'+cfg.color+'">'+
            '</div>'+
            '<div class="cd-narration-row">'+
                '<span class="cd-narration-label">字数范围</span>'+
                '<div class="cd-narration-range"><input type="number" class="cd-narration-num" id="nrMinWords" value="'+cfg.minWords+'" min="2" max="50"><span class="cd-narration-range-sep">~</span><input type="number" class="cd-narration-num" id="nrMaxWords" value="'+cfg.maxWords+'" min="5" max="200"></div>'+
            '</div>'+
            '<div class="cd-narration-row">'+
                '<span class="cd-narration-label">显示位置</span>'+
                '<select class="cd-narration-select" id="nrPlacement">'+
                    '<option value="bubble"'+(cfg.placement==='bubble'?' selected':'')+'>气泡内</option>'+
                    '<option value="center"'+(cfg.placement==='center'?' selected':'')+'>屏幕居中</option>'+
                '</select>'+
            '</div>'+
            '<div class="cd-narration-actions">'+
                '<button class="cd-narration-btn cancel" id="nrCancel">取消</button>'+
                '<button class="cd-narration-btn confirm" id="nrConfirm">'+(active?'关闭旁白':'开启旁白')+'</button>'+
            '</div>'+
        '</div>';

    detailEl.appendChild(modal);
    requestAnimationFrame(function(){ modal.classList.add('show'); });

    modal.querySelector('#nrItalic').addEventListener('click', function(){
        this.classList.toggle('on');
    });

    modal.querySelector('#nrCancel').addEventListener('click', function(){
        closeNarrationModal();
    });

    modal.addEventListener('click', function(e){
        if(e.target === modal) closeNarrationModal();
    });

    modal.querySelector('#nrConfirm').addEventListener('click', function(){
        var newCfg = {
            fontSize: modal.querySelector('#nrFontSize').value,
            italic: modal.querySelector('#nrItalic').classList.contains('on'),
            color: modal.querySelector('#nrColor').value,
            minWords: parseInt(modal.querySelector('#nrMinWords').value, 10) || 5,
            maxWords: parseInt(modal.querySelector('#nrMaxWords').value, 10) || 30,
            placement: modal.querySelector('#nrPlacement').value || 'bubble'
        };
        if(newCfg.minWords > newCfg.maxWords) newCfg.minWords = newCfg.maxWords;
        
        setNarrationConfig(newCfg);
        
        var wasActive = getNarrationActive();
        if(wasActive){
            setNarrationActive(false);
            closeNarrationModal();
            renderMsgs(currentId);
            showNarationNotice(false);
        } else {
            setNarationActive(true);
            closeNarrationModal();
            renderMsgs(currentId);
            showNarrationNotice(true);
        }
    });
}

function closeNarrationModal(){
    var modal = detailEl.querySelector('#cdNarrationModal');
    if(!modal) return;
    modal.classList.remove('show');
    setTimeout(function(){ if(modal.parentNode) modal.parentNode.removeChild(modal); }, 300);
}

function showNarrationNotice(enabled){
    var msgsEl = detailEl.querySelector('#cdMsgs');
    if(!msgsEl) return;
    var old = msgsEl.querySelector('.cd-narration-notice');
    if(old) old.parentNode.removeChild(old);

    var notice = document.createElement('div');
    notice.className = 'cd-narration-notice';
    if(enabled){
        notice.innerHTML =
            '<svg viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>'+
            '<span>旁白模式已开启</span>';
    } else {
        notice.innerHTML =
            '<svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'+
            '<span>旁白模式已关闭</span>';
        notice.classList.add('off');
    }
    msgsEl.appendChild(notice);
    msgsEl.scrollTop = msgsEl.scrollHeight;
    setTimeout(function(){ notice.classList.add('fade'); }, 3000);
    setTimeout(function(){ if(notice.parentNode) notice.parentNode.removeChild(notice); }, 3600);
}

function getTimeAwareInject(){
    if(!currentId) return '';
    var c = getContactData(currentId);
    if(!c || !c.settings || !c.settings.timeAware) return '';
    var now = new Date();
    var y = now.getFullYear();
    var mon = now.getMonth()+1;
    var day = now.getDate();
    var h = String(now.getHours()).padStart(2,'0');
    var min = String(now.getMinutes()).padStart(2,'0');
    var weekDays = ['星期日','星期一','星期二','星期三','星期四','星期五','星期六'];
    var week = weekDays[now.getDay()];
    return '[当前时间]现在是'+y+'年'+mon+'月'+day+'日 '+week+' '+h+':'+min+'。你能感知时间流逝，知道对方什么时候给你发消息，也知道你自己上次回复是什么时候。根据时间自然地调整语气（比如深夜可以困倦，早上可以问早）。';
}

function getNarrationPromptInject(){
    var active = getNarrationActive();
    if(!active) return '';
    var cfg = getNarrationConfig();
    return '[旁白格式规则]你的回复由对话和旁白组成。旁白用括号包裹，放在对话中间，例如：你说什么？（他歪着头看你）我不知道。旁白每处'+cfg.minWords+'到'+cfg.maxWords+'字，每次回复穿插1-2处旁白。对话内容正常输出不要减少。不要用星号。不要换行。不要输出空格行。旁白和对话写在同一段里。';
}

function getNarrationDisableInject(){
    var active = getNarrationActive();
    if(active) return '';
    return '[禁止旁白]不要使用任何旁白、动作描写、括号包裹的动作、星号包裹的内容，只用纯对话回复。';
}

function narrationSpan(text){
    var cfg = getNarrationConfig();
    return '<span class="cd-narration-text" style="font-size:'+cfg.fontSize+';color:'+cfg.color+';'+(cfg.italic?'font-style:italic;':'')+'">'+text+'</span>';
}

function splitNarrationParts(text){
    var parts = [];
    /* 先清理多余空行和换行 */
    var cleaned = text.replace(/\n\s*\n/g, '\n').replace(/^\s+|\s+$/gm, '');
    var re = /[（(]([^）)]+)[）)]|\*([^*\n]+)\*/g;
    var last = 0;
    var m;
    var cfg = getNarrationConfig();
    while((m = re.exec(cleaned)) !== null){
        if(m.index > last){
            var textPart = cleaned.slice(last, m.index).trim();
            if(textPart) parts.push({ type: 'text', text: textPart });
        }
        var raw = (m[1] || m[2] || '').trim();
        if(raw && raw.length >= 2 && raw.length <= cfg.maxWords * 3){
            parts.push({ type: 'narration', text: raw });
        }
        last = re.lastIndex;
    }
    if(last < cleaned.length){
        var finalText = cleaned.slice(last).trim();
        if(finalText) parts.push({ type: 'text', text: finalText });
    }
    return parts;
}

function formatNarrationInBubble(text){
    var cfg = getNarrationConfig();
    if(cfg.placement !== 'bubble') return text;
    var parts = splitNarrationParts(text);
    var html = '';
    parts.forEach(function(part){
        if(part.type === 'narration'){
            html += narrationSpan(part.text);
        } else {
            html += part.text.replace(/\*/g, '');
        }
    });
    return html;
}

/* 无论旁白开关，只要文本含括号旁白就渲染样式 */
function formatNarrationAlways(text, cId){
    var ns = narrationSettings[cId || currentId];
    var cfg = (ns && ns.config) ? ns.config : { fontSize: '12px', italic: true, color: '#b0b0b0', minWords: 5, maxWords: 30, placement: 'bubble' };
    var placement = cfg.placement || 'bubble';
    /* 检测是否包含括号旁白或星号旁白 */
    if(!/[（(][^）)]{2,}[）)]/.test(text) && !/\*[^*\n]{2,}\*/.test(text)) return text;
    var parts = [];
    var cleaned = text.replace(/\n\s*\n/g, '\n').replace(/^\s+|\s+$/gm, '');
    var re = /[（(]([^）)]+)[）)]|\*([^*\n]+)\*/g;
    var last = 0;
    var m;
    while((m = re.exec(cleaned)) !== null){
        if(m.index > last){
            var tp = cleaned.slice(last, m.index).trim();
            if(tp) parts.push({ type: 'text', text: tp });
        }
        var raw = (m[1] || m[2] || '').trim();
        if(raw && raw.length >= 2 && raw.length <= cfg.maxWords * 3){
            parts.push({ type: 'narration', text: raw });
        }
        last = re.lastIndex;
    }
    if(last < cleaned.length){
        var ft = cleaned.slice(last).trim();
        if(ft) parts.push({ type: 'text', text: ft });
    }
    if(parts.length === 0) return text;
    var hasNarration = parts.some(function(p){ return p.type === 'narration'; });
    if(!hasNarration) return text;
    /* 屏幕居中模式：旁白不在气泡里，只显示对话文字 */
    if(placement === 'center'){
        var textOnly = '';
        parts.forEach(function(part){
            if(part.type === 'text'){
                textOnly += part.text.replace(/\*/g, '');
            }
        });
        return textOnly.trim() || text;
    }
    /* 气泡内模式 */
    var html = '';
    parts.forEach(function(part){
        if(part.type === 'narration'){
            html += '<span class="cd-narration-text" style="font-size:'+cfg.fontSize+';color:'+cfg.color+';'+(cfg.italic?'font-style:italic;':'')+'">'+part.text+'</span>';
        } else {
            html += part.text.replace(/\*/g, '');
        }
    });
    return html;
}

function appendCenteredNarration(msgsEl, text){
    var line = document.createElement('div');
    line.className = 'cd-narration-center-line';
    line.innerHTML = narrationSpan(text);
    msgsEl.appendChild(line);
}

/* ── 编辑确认弹窗 ── */
function showEditConfirmModal(text, onConfirm, onCancel){
    var existing = detailEl.querySelector('#cdEditConfirmModal');
    if(existing) existing.parentNode.removeChild(existing);

    var modal = document.createElement('div');
    modal.id = 'cdEditConfirmModal';
    modal.className = 'cd-edit-confirm-mask';
    modal.innerHTML =
        '<div class="cd-edit-confirm-box">'+
            '<div class="cd-edit-confirm-title">确认修改</div>'+
            '<div class="cd-edit-confirm-preview">'+esc(text.substring(0, 60))+(text.length > 60 ? '…' : '')+'</div>'+
            '<div class="cd-edit-confirm-btns">'+
                '<button class="cd-edit-confirm-btn cancel" id="cdEditConfirmCancel">取消</button>'+
                '<button class="cd-edit-confirm-btn confirm" id="cdEditConfirmOk">保存</button>'+
            '</div>'+
        '</div>';
    detailEl.appendChild(modal);
    requestAnimationFrame(function(){ modal.classList.add('show'); });

    function close(){
        modal.classList.remove('show');
        setTimeout(function(){ if(modal.parentNode) modal.parentNode.removeChild(modal); }, 280);
    }

    modal.querySelector('#cdEditConfirmCancel').addEventListener('click', function(){
        close();
        if(onCancel) onCancel();
    });
    modal.querySelector('#cdEditConfirmOk').addEventListener('click', function(){
        close();
        onConfirm();
    });
    modal.addEventListener('click', function(e){
        if(e.target === modal){
            close();
            if(onCancel) onCancel();
        }
    });
}

function showEditSavedToast(){
    var old = document.getElementById('cdSavedToast');
    if(old) old.parentNode.removeChild(old);
    var toast = document.createElement('div');
    toast.id = 'cdSavedToast';
    toast.textContent = 'Message saved';
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

window.openChatDetail = openDetail;
window.closeChatDetail = closeDetail;

})();
