/* ============ WhisperPhone Chat Logic ============ */
(function(){
'use strict';

var CONTACTS_KEY = 'wp_chat_contacts';
var MESSAGES_KEY = 'wp_chat_messages';
var AVATAR = 'https://i.postimg.cc/yNx1KhWN/IMG-20260528-045634.jpg';

var contacts = [];
var conversations = {};
var currentChatId = null;
var built = false;

function load(){
    try{ contacts = JSON.parse(localStorage.getItem(CONTACTS_KEY)||'[]'); }catch(e){ contacts=[]; }
    try{ conversations = JSON.parse(localStorage.getItem(MESSAGES_KEY)||'{}'); }catch(e){ conversations={}; }
}
function save(){
    localStorage.setItem(CONTACTS_KEY, JSON.stringify(contacts));
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(conversations));
}
function timeStr(){
    var d=new Date();
    return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()+' '+
           String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');
}
function shortTime(){
    var d=new Date();
    return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');
}

var starSvg='<svg viewBox="0 0 24 24"><polygon points="12,2 15,9 22,9 16.5,13.5 18.5,21 12,16.5 5.5,21 7.5,13.5 2,9 9,9"/></svg>';
var starsHtml='<div class="ca-chat-stars">'+
    '<div class="ca-chat-star">'+starSvg+'</div>'+
    '<div class="ca-chat-star">'+starSvg+'</div>'+
    '<div class="ca-chat-star">'+starSvg+'</div>'+
    '<div class="ca-chat-star">'+starSvg+'</div>'+
    '<div class="ca-chat-star">'+starSvg+'</div>'+
'</div>';

function build(){
    if(built) return;
    built = true;
    var el = document.createElement('div');
    el.className = 'chat-app';
    el.id = 'chatApp';
    el.innerHTML = buildHTML();
    document.body.appendChild(el);
    bindEvents();
}

function buildHTML(){
    return ''+
    /* 消息页 */
    '<div class="ca-page active" id="caPageMsgs">'+
        '<div class="ca-header">'+
            '<div class="ca-header-row">'+
                '<div class="ca-header-title">消息</div>'+
                '<div class="ca-header-actions">'+
                    '<div class="ca-header-btn" id="caBackBtn"><svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg></div>'+
                '</div>'+
            '</div>'+
        '</div>'+
        '<div class="ca-category-bar">'+
            '<div class="ca-category-chip active">全部</div>'+
            '<div class="ca-category-chip">未读</div>'+
            '<div class="ca-category-chip">群聊</div>'+
        '</div>'+
        '<div class="ca-polaroid-bar">'+
            '<div class="ca-polaroid-strip">'+
                '<div class="ca-polaroid-strip-left"></div>'+
                '<div class="ca-polaroid-strip-content">'+
                    '<div class="ca-polaroid-strip-photo"><img src="'+AVATAR+'"></div>'+
                    '<div class="ca-polaroid-strip-info">'+
                        '<div class="ca-polaroid-strip-text" id="caPolaroidText">暂无动态</div>'+
                        '<div class="ca-polaroid-strip-sub" id="caPolaroidSub">创建联系人开始聊天</div>'+
                    '</div>'+
                '</div>'+
            '</div>'+
        '</div>'+
        '<div class="ca-online-section" id="caOnlineSection" style="display:none;">'+
            '<div class="ca-section-label">在线</div>'+
            '<div class="ca-online-scroll" id="caOnlineScroll"></div>'+
        '</div>'+
        '<div id="caChatList" class="ca-chat-list"></div>'+
    '</div>'+

    /* 联系人页 */
    '<div class="ca-page" id="caPageContacts">'+
        '<div class="ca-header">'+
            '<div class="ca-header-row">'+
                '<div class="ca-header-title">联系人</div>'+
                '<div class="ca-header-actions">'+
                    '<div class="ca-header-btn" id="caAddContactBtn"><svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></div>'+
                '</div>'+
            '</div>'+
        '</div>'+
        '<div class="ca-category-bar">'+
            '<div class="ca-category-chip active">全部</div>'+
            '<div class="ca-category-chip">在线</div>'+
        '</div>'+
        '<div id="caContactsList"></div>'+
    '</div>'+

    /* 朋友圈页 */
    '<div class="ca-page" id="caPageMoments">'+
        '<div class="ca-header"><div class="ca-header-row"><div class="ca-header-title">朋友圈</div></div></div>'+
        '<div class="ca-empty">'+
            '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/></svg>'+
            '<div class="ca-empty-text">暂无动态</div>'+
            '<div class="ca-empty-sub">添加联系人后查看朋友圈</div>'+
        '</div>'+
    '</div>'+

    /* 我的页 */
    '<div class="ca-page" id="caPageMe">'+
        '<div class="ca-header"><div class="ca-header-row"><div class="ca-header-title">我</div></div></div>'+
        '<div class="ca-me-profile">'+
            '<div class="ca-me-avatar"><img src="'+AVATAR+'"></div>'+
            '<div><div class="ca-me-name">Whisper</div><div class="ca-me-id">ID：whisper_user</div></div>'+
        '</div>'+
        '<div class="ca-me-section">'+
            '<div class="ca-me-row">'+
                '<div class="ca-me-row-icon"><svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>'+
                '<span class="ca-me-row-label">个人信息</span>'+
                '<svg class="ca-me-row-arrow" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>'+
            '</div>'+
            '<div class="ca-me-row">'+
                '<div class="ca-me-row-icon"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg></div>'+
                '<span class="ca-me-row-label">设置</span>'+
                '<svg class="ca-me-row-arrow" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>'+
            '</div>'+
        '</div>'+
    '</div>'+

    /* 底栏 */
    '<div class="ca-bottom-nav">'+
        '<div class="ca-nav-item active" data-tab="caPageMsgs">'+
            '<div class="ca-nav-icon"><svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg></div>'+
            '<span class="ca-nav-label">消息</span>'+
        '</div>'+
        '<div class="ca-nav-item" data-tab="caPageContacts">'+
            '<div class="ca-nav-icon"><svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg></div>'+
            '<span class="ca-nav-label">联系人</span>'+
        '</div>'+
        '<div class="ca-nav-item" data-tab="caPageMoments">'+
            '<div class="ca-nav-icon"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg></div>'+
            '<span class="ca-nav-label">朋友圈</span>'+
        '</div>'+
        '<div class="ca-nav-item" data-tab="caPageMe">'+
            '<div class="ca-nav-icon"><svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>'+
            '<span class="ca-nav-label">我</span>'+
        '</div>'+
    '</div>'+


    /* 创建联系人弹窗 */
    '<div class="ca-create-mask" id="caCreateMask">'+
        '<div class="ca-create-card">'+
            '<div class="ca-create-title">新建联系人</div>'+
            '<div class="ca-create-field">'+
                '<div class="ca-create-label">真实名称</div>'+
                '<input class="ca-create-input" id="caCreateName" placeholder="角色的真实名字" maxlength="20">'+
            '</div>'+
            '<div class="ca-create-field">'+
                '<div class="ca-create-label">备注名</div>'+
                '<input class="ca-create-input" id="caCreateNick" placeholder="给TA起个备注（可选）" maxlength="20">'+
            '</div>'+
            '<div class="ca-create-field">'+
                '<div class="ca-create-label">性格描述</div>'+
                '<input class="ca-create-input" id="caCreatePersonality" placeholder="温柔、俏皮、傲娇...（可选）" maxlength="100">'+
            '</div>'+
            '<div class="ca-create-field">'+
                '<div class="ca-create-label">系统 Prompt</div>'+
                '<textarea class="ca-create-input" id="caCreatePrompt" placeholder="角色的系统提示词（可选）" style="height:70px;padding:10px 16px;resize:none;border-radius:14px;font-family:inherit;font-size:13px;line-height:1.5;"></textarea>'+
            '</div>'+
            '<div class="ca-create-toggle">'+
                '<span class="ca-create-toggle-label">在线状态</span>'+
                '<div class="ca-create-switch" id="caCreateOnline"></div>'+
            '</div>'+
            '<div class="ca-create-actions">'+
                '<button class="ca-create-btn cancel" id="caCreateCancel">取消</button>'+
                '<button class="ca-create-btn confirm" id="caCreateConfirm">创建</button>'+
            '</div>'+
        '</div>'+
    '</div>';
}

function bindEvents(){
    var app = document.getElementById('chatApp');

    document.getElementById('caBackBtn').addEventListener('click', closeChatApp);

    app.querySelectorAll('.ca-nav-item').forEach(function(tab){
        tab.addEventListener('click', function(){
            var target = tab.dataset.tab;
            app.querySelectorAll('.ca-nav-item').forEach(function(t){t.classList.remove('active');});
            tab.classList.add('active');
            app.querySelectorAll('.ca-page').forEach(function(p){p.classList.remove('active');});
            var page = document.getElementById(target);
            if(page) page.classList.add('active');
        });
    });

    document.getElementById('caAddContactBtn').addEventListener('click', showCreateModal);
    document.getElementById('caCreateCancel').addEventListener('click', hideCreateModal);
    document.getElementById('caCreateMask').addEventListener('click', function(e){
        if(e.target === this) hideCreateModal();
    });
    document.getElementById('caCreateOnline').addEventListener('click', function(){
        this.classList.toggle('on');
    });
    document.getElementById('caCreateConfirm').addEventListener('click', createContact);

}

/* 渲染消息列表 */
function renderMsgs(){
    var list = document.getElementById('caChatList');
    var withMsgs = contacts.filter(function(c){
        return conversations[c.id] && conversations[c.id].length > 0;
    }).sort(function(a,b){
        var ma = conversations[a.id], mb = conversations[b.id];
        var ta = ma[ma.length-1].time, tb = mb[mb.length-1].time;
        return tb > ta ? 1 : -1;
    });

    if(withMsgs.length === 0){
        list.innerHTML = '<div class="ca-empty">'+
            '<svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>'+
            '<div class="ca-empty-text">暂无消息</div>'+
            '<div class="ca-empty-sub">去联系人页创建好友开始聊天</div></div>';
        document.getElementById('caPolaroidText').textContent = '暂无动态';
        document.getElementById('caPolaroidSub').textContent = '创建联系人开始聊天';
        return;
    }

    var polaroidC = withMsgs[0];
    var polaroidMsgs = conversations[polaroidC.id];
    var lastM = polaroidMsgs[polaroidMsgs.length-1];
    document.getElementById('caPolaroidText').textContent = '最近动态 · '+withMsgs.length+'个对话';
    document.getElementById('caPolaroidSub').textContent = '来自 '+polaroidC.name+' · '+lastM.time.split(' ')[1];

    var html = '<div class="ca-chat-list-inner">';
    withMsgs.forEach(function(c){
        var msgs = conversations[c.id];
        var last = msgs[msgs.length-1];
        var preview = (last.role==='user'?'你: ':'')+last.text;
        if(preview.length > 25) preview = preview.substring(0,25)+'...';
        var t = (last.time||'').split(' ')[1]||'';
    html += '<div class="ca-chat-item" data-id="'+c.id+'">'+
            '<div class="ca-chat-avatar"><img src="'+AVATAR+'"data-cid="'+c.id+'"></div>'+

            '<div class="ca-chat-body">'+
                '<div class="ca-chat-top">'+
                    '<div class="ca-chat-name">'+esc(c.name)+'</div>'+
                    '<div class="ca-chat-time">'+t+'</div>'+
                '</div>'+
                '<div class="ca-chat-bottom">'+
                    '<div class="ca-chat-msg">'+esc(preview)+'</div>'+
                '</div>'+
            '</div>'+
            starsHtml+
        '</div>';
    });
    html += '</div>';
    list.innerHTML = html;
    loadListAvatars(list);

    list.querySelectorAll('.ca-chat-item').forEach(function(item){
        item.addEventListener('click', function(){
            openChatDetail(item.dataset.id);
        });
    });
}

/* 异步加载列表头像 */
function loadListAvatars(container){
    if(!window.WhisperDB) return;
    container.querySelectorAll('img[data-cid]').forEach(function(img){
        var cid = img.dataset.cid;
        var c = contacts.find(function(x){return x.id === cid;});
        if(!c || !c.settings || !c.settings.avatar) return;
        var av = c.settings.avatar;
        if(av.startsWith('data:')){
            img.src = av;
        } else if(av.startsWith('avatar_')){
            WhisperDB.get(av).then(function(data){
                if(data) img.src = data;
            });
        }
    });
}

/* 渲染在线 */
function renderOnline(){
    var onlines = contacts.filter(function(c){ return c.settings && c.settings.pinned; });
    var section = document.getElementById('caOnlineSection');
    var scroll = document.getElementById('caOnlineScroll');
    if(onlines.length === 0){ section.style.display = 'none'; return; }
    section.style.display = '';
    var html = '';
    onlines.forEach(function(c){
        html += '<div class="ca-online-item" data-id="'+c.id+'">'+
            '<div class="ca-online-avatar-wrap">'+
                '<div class="ca-online-avatar"><img src="'+AVATAR+'" data-cid="'+c.id+'"></div>'+
            '</div>'+
            '<div class="ca-online-dot"></div>'+
            '<div class="ca-online-name">'+esc(c.name.substring(0,2))+'</div>'+
        '</div>';
    });
    scroll.innerHTML = html;
    loadListAvatars(scroll);
    scroll.querySelectorAll('.ca-online-item').forEach(function(item){
        item.addEventListener('click', function(){
            openChatDetail(item.dataset.id);
        });
    });
}

/* 渲染联系人 */
function renderContacts(){
    var wrap = document.getElementById('caContactsList');
    if(contacts.length === 0){
        wrap.innerHTML = '<div class="ca-empty">'+
            '<svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>'+
            '<div class="ca-empty-text">暂无联系人</div>'+
            '<div class="ca-empty-sub">点击右上角 + 创建联系人</div></div>';
        return;
    }
    var sorted = contacts.slice().sort(function(a,b){
        return a.name.localeCompare(b.name,'zh');
    });
    var html = '';
    sorted.forEach(function(c){
        var dotHtml = c.online ? '<div class="ca-contact-online-dot"></div>' : '';
        html += '<div class="ca-contact-item" data-id="'+c.id+'">'+
            '<div class="ca-contact-avatar"><img src="'+AVATAR+'" data-cid="'+c.id+'"></div>'+
            '<div class="ca-contact-name">'+esc(c.name)+'</div>'+
            dotHtml+
        '</div>';
    });
    wrap.innerHTML = html;
    loadListAvatars(wrap);
    wrap.querySelectorAll('.ca-contact-item').forEach(function(item){
        var longTimer = null;
        item.addEventListener('click', function(){
            openChatDetail(item.dataset.id);
        });
        item.addEventListener('pointerdown', function(e){
            longTimer = setTimeout(function(){
                longTimer = null;
                if(typeof window.openChatSettings === 'function'){
                    window.openChatSettings(item.dataset.id);
                }
            }, 500);
        });
        item.addEventListener('pointerup', function(){ if(longTimer){clearTimeout(longTimer);longTimer=null;} });
        item.addEventListener('pointerleave', function(){ if(longTimer){clearTimeout(longTimer);longTimer=null;} });
    });
}

/* 创建联系人 */
function showCreateModal(){
    document.getElementById('caCreateName').value = '';
    document.getElementById('caCreateNick').value = '';
    document.getElementById('caCreatePersonality').value = '';
    document.getElementById('caCreatePrompt').value = '';
    document.getElementById('caCreateOnline').classList.remove('on');
    document.getElementById('caCreateMask').classList.add('show');
    setTimeout(function(){document.getElementById('caCreateName').focus();},300);
}
function hideCreateModal(){
    document.getElementById('caCreateMask').classList.remove('show');
}
function createContact(){
    var name = document.getElementById('caCreateName').value.trim();
    if(!name) return;
    var nick = document.getElementById('caCreateNick').value.trim();
    var personality = document.getElementById('caCreatePersonality').value.trim();
    var prompt = document.getElementById('caCreatePrompt').value.trim();
    var online = document.getElementById('caCreateOnline').classList.contains('on');
    var c = {
        id: 'c_'+Date.now(),
        name: nick || name,
        online: online,
        created: timeStr(),
        settings: {
            realName: name,
            bio: '',
            charName: name,
            personality: personality,
            greeting: '',
            prompt: prompt
        }
    };
    contacts.push(c);
    save();
    hideCreateModal();
    renderContacts();
    renderOnline();
    renderMsgs();
}

/* 聊天详情 */
function openChatDetail(id){
    try{ contacts = JSON.parse(localStorage.getItem(CONTACTS_KEY)||'[]'); }catch(e){}
    if(window.WhisperDB){
        window.WhisperDB.get('wp_chat_messages').then(function(data){
            if(data && typeof data === 'object'){
                conversations = data;
            } else {
                try{ conversations = JSON.parse(localStorage.getItem(MESSAGES_KEY)||'{}'); }catch(e){}
            }
            window._wpChatConvs = conversations;
            finishOpen();
        }).catch(function(){
            try{ conversations = JSON.parse(localStorage.getItem(MESSAGES_KEY)||'{}'); }catch(e){}
            window._wpChatConvs = conversations;
            finishOpen();
        });
    } else {
        try{ conversations = JSON.parse(localStorage.getItem(MESSAGES_KEY)||'{}'); }catch(e){}
        window._wpChatConvs = conversations;
        finishOpen();
    }
    function finishOpen(){
        window._wpChatSave = function(){
            localStorage.setItem(MESSAGES_KEY, JSON.stringify(window._wpChatConvs));
        };
        window._wpChatRefresh = function(){
            try{ contacts = JSON.parse(localStorage.getItem(CONTACTS_KEY)||'[]'); }catch(e){}
            conversations = window._wpChatConvs || {};
            renderMsgs();
            renderOnline();
            renderContacts();
        };
        if(typeof window.openChatDetail === 'function'){
            window.openChatDetail(id);
        }
    }
}

function esc(s){var d=document.createElement('div');d.textContent=s;return d.innerHTML;}

/* 全部渲染 */
function renderAll(){
    renderMsgs();
    renderOnline();
    renderContacts();
}

/* 打开 / 关闭 */
function openChatApp(){
    build();
    load();
    var el = document.getElementById('chatApp');
    el.classList.remove('closing');
    el.classList.add('active');

    window._wpChatRefresh = function(){
        try{ contacts = JSON.parse(localStorage.getItem(CONTACTS_KEY)||'[]'); }catch(e){}
        if(window._wpChatConvs && Object.keys(window._wpChatConvs).length > 0){
            conversations = window._wpChatConvs;
        } else {
            try{ conversations = JSON.parse(localStorage.getItem(MESSAGES_KEY)||'{}'); }catch(e){ conversations = {}; }
            window._wpChatConvs = conversations;
        }
        renderMsgs();
        renderOnline();
        renderContacts();
    };

    renderAll();
}
function closeChatApp(){
    var el = document.getElementById('chatApp');
    if(!el) return;
    el.classList.remove('active');
    el.classList.add('closing');
    setTimeout(function(){ el.classList.remove('closing'); },350);
}

window.openChatApp = openChatApp;

/* 点击桌面图标 a1 打开 */
document.addEventListener('click', function(e){
    var app = e.target.closest('.g-item.app');
    if(!app) return;
    if(document.body.classList.contains('edit-mode')) return;
    if(app.dataset.id === 'a1'){
        e.stopPropagation();
        openChatApp();
    }
});

})();
