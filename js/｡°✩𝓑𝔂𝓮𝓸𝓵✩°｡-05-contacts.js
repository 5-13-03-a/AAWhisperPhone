// ==========================================
// Contacts 联系人页面（真实增删改查 + IndexedDB）
// ==========================================

const ContactsPage = (() => {
  const STORE = 'contacts';
  let contacts = [];
  let editingId = null;

  // ===== DB 操作 =====
  async function dbOpen() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open('ByeolPhone_DB', 2);
      req.onupgradeneeded = e => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('homescreen')) db.createObjectStore('homescreen');
        if (!db.objectStoreNames.contains('contacts')) db.createObjectStore('contacts', { keyPath: 'id' });
      };
      req.onsuccess = e => resolve(e.target.result);
      req.onerror = e => reject(e.target.error);
    });
  }

  async function dbGetAll() {
    const db = await dbOpen();
    return new Promise(resolve => {
      const tx = db.transaction(STORE, 'readonly');
      const store = tx.objectStore(STORE);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
      tx.oncomplete = () => db.close();
    });
  }

  async function dbPut(item) {
    const db = await dbOpen();
    return new Promise(resolve => {
      const tx = db.transaction(STORE, 'readwrite');
      const store = tx.objectStore(STORE);
      store.put(item);
      tx.oncomplete = () => { db.close(); resolve(true); };
      tx.onerror = () => { db.close(); resolve(false); };
    });
  }

  async function dbDelete(id) {
    const db = await dbOpen();
    return new Promise(resolve => {
      const tx = db.transaction(STORE, 'readwrite');
      const store = tx.objectStore(STORE);
      store.delete(id);
      tx.oncomplete = () => { db.close(); resolve(true); };
      tx.onerror = () => { db.close(); resolve(false); };
    });
  }

  // ===== 图片转 base64 =====
  function fileToBase64(file) {
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
  }

  // ===== CSS =====
  const CSS = `
    .cl-contacts-page {
      position: absolute; top: 0; left: 0; right: 0; bottom: 0;
      z-index: 205; background: #F6F6F6;
      display: flex; flex-direction: column;
      opacity: 0; pointer-events: none;
      transition: opacity 0.25s ease;
      overflow: hidden; padding-bottom: 80px;
    }
    .cl-contacts-page.open { opacity: 1; pointer-events: auto; }

    .cl-contacts-scroll {
      flex: 1; overflow-y: auto; padding: 14px 14px 10px;
      -webkit-overflow-scrolling: touch;
    }
    .cl-contacts-scroll::-webkit-scrollbar { display: none; }

    .cl-ct-header {
      flex-shrink: 0; padding: 62px 22px 12px;
      display: flex; align-items: flex-end; justify-content: space-between;
    }
    .cl-ct-title { font-size: 26px; font-weight: 900; color: #1c1c1c; letter-spacing: -1px; }
    .cl-ct-sub { font-size: 10px; color: #999; margin-top: 3px; letter-spacing: 1px; }
    .cl-ct-add {
      width: 38px; height: 38px; border-radius: 50%; background: #1c1c1c;
      display: flex; align-items: center; justify-content: center; cursor: pointer;
      box-shadow: 0 3px 10px rgba(0,0,0,0.2);
    }
    .cl-ct-add svg { width: 16px; height: 16px; fill: none; stroke: #fff; stroke-width: 2.5; stroke-linecap: round; }

    .cl-ct-empty { text-align: center; padding: 80px 20px; color: #ccc; font-size: 13px; }

    .cl-polaroid-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .cl-polaroid {
      background: #fff; border-radius: 4px; padding: 8px 8px 0;
      box-shadow: 0 3px 16px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04);
      cursor: pointer; transition: transform 0.2s; position: relative;
    }
    .cl-polaroid:nth-child(1) { transform: rotate(-1deg); }
    .cl-polaroid:nth-child(2) { transform: rotate(0.8deg); margin-top: 14px; }
    .cl-polaroid:nth-child(3) { transform: rotate(0.5deg); margin-top: -8px; }
    .cl-polaroid:nth-child(4) { transform: rotate(-0.7deg); margin-top: 6px; }
    .cl-polaroid:nth-child(5) { transform: rotate(0.9deg); margin-top: -4px; }
    .cl-polaroid:nth-child(6) { transform: rotate(-0.5deg); margin-top: 10px; }
    .cl-polaroid:active { transform: scale(0.97) rotate(0deg) !important; }

    .cl-polaroid-pin {
      position: absolute; top: -6px; left: 50%; transform: translateX(-50%);
      width: 12px; height: 12px; border-radius: 50%;
      background: linear-gradient(135deg, #e0e0e0, #bbb);
      border: 1.5px solid #aaa; box-shadow: 0 1px 3px rgba(0,0,0,0.15);
    }
    .cl-polaroid-img {
      width: 100%; aspect-ratio: 4/3;
      background: #f0f0f0 center/cover no-repeat; border-radius: 2px; position: relative;
    }
    .cl-polaroid-avatar {
      position: absolute; bottom: -18px; left: 14px;
      width: 40px; height: 40px; border-radius: 50%;
      background: #ddd center/cover no-repeat;
      border: 3px solid #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.12);
    }
    .cl-polaroid-info { padding: 14px 8px 12px; padding-left: 62px; }
    .cl-polaroid-name { font-size: 13px; font-weight: 800; color: #1c1c1c; margin-bottom: 2px; }
    .cl-polaroid-tag { font-size: 10px; color: #999; font-weight: 500; }

    /* 详情页 */
    .cl-ct-detail {
      position: absolute; inset: 0; z-index: 240; background: #000;
      display: flex; flex-direction: column;
      transform: translateX(100%);
      transition: transform 0.4s cubic-bezier(0.25,0.46,0.45,0.94); overflow: hidden;
    }
    .cl-ct-detail.open { transform: translateX(0); }
    .cl-ct-detail-bg { position: absolute; inset: 0; background: center/cover no-repeat; }
    .cl-ct-detail-overlay {
      position: absolute; inset: 0;
      background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.3) 35%, rgba(0,0,0,0.05) 55%, rgba(0,0,0,0.3) 100%);
    }
    .cl-ct-detail-back {
      position: absolute; top: 58px; left: 18px; z-index: 50;
      width: 36px; height: 36px; border-radius: 50%;
      background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.15);
      backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
      display: flex; align-items: center; justify-content: center; cursor: pointer;
    }
    .cl-ct-detail-back svg { width: 14px; height: 14px; fill: none; stroke: #fff; stroke-width: 2.5; stroke-linecap: round; stroke-linejoin: round; }
    .cl-ct-detail-edit {
      position: absolute; top: 58px; right: 18px; z-index: 50;
      width: 36px; height: 36px; border-radius: 50%;
      background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.15);
      backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
      display: flex; align-items: center; justify-content: center; cursor: pointer;
    }
    .cl-ct-detail-edit svg { width: 14px; height: 14px; fill: none; stroke: #fff; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
    .cl-ct-detail-content {
      position: relative; z-index: 10; flex: 1;
      display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 0 26px;
    }
    .cl-ct-detail-avatar-area {
      position: relative; width: 280px; height: 280px;
      display: flex; align-items: center; justify-content: center; margin-bottom: 14px;
    }
    .cl-ct-detail-avatar {
      width: 130px; height: 130px; border-radius: 50%;
      background: #333 center/cover no-repeat;
      border: 3px solid rgba(255,255,255,0.12);
      box-shadow: 0 10px 40px rgba(0,0,0,0.5); position: relative; z-index: 5;
    }
    .cl-ct-detail-ring {
      position: absolute; width: 146px; height: 146px; border-radius: 50%;
      border: 1px solid rgba(255,255,255,0.06); animation: clCtSpin 14s linear infinite;
    }
    @keyframes clCtSpin { to { transform: rotate(360deg); } }
    .cl-ct-orbit-tag {
      position: absolute; font-size: 12px; font-weight: 700; color: rgba(255,255,255,0.8);
      padding: 8px 16px; border-radius: 18px; background: rgba(0,0,0,0.4);
      backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
      border: 1px solid rgba(255,255,255,0.1); white-space: nowrap;
    }
    .cl-ct-orbit-tag:nth-child(1) { top: 20px; left: 10px; }
    .cl-ct-orbit-tag:nth-child(2) { top: 20px; right: 10px; }
    .cl-ct-orbit-tag:nth-child(3) { bottom: 28px; left: 10px; }
    .cl-ct-orbit-tag:nth-child(4) { bottom: 28px; right: 10px; }
    .cl-ct-detail-name { font-size: 32px; font-weight: 900; color: #fff; letter-spacing: -1px; margin-bottom: 6px; text-shadow: 0 2px 12px rgba(0,0,0,0.5); }
    .cl-ct-detail-relation {
      font-size: 10px; font-weight: 700; color: rgba(255,255,255,0.5); letter-spacing: 2px;
      padding: 5px 16px; border-radius: 16px;
      background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08); margin-bottom: 12px;
    }
    .cl-ct-detail-quote { font-size: 14px; color: rgba(255,255,255,0.45); font-family: Georgia,serif; font-style: italic; text-align: center; line-height: 1.6; margin-bottom: 24px; }
    .cl-ct-detail-bar { display: flex; gap: 10px; }
    .cl-ct-detail-btn {
      height: 46px; border-radius: 23px; border: none; cursor: pointer;
      font-size: 13px; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 7px; transition: transform 0.15s;
    }
    .cl-ct-detail-btn:active { transform: scale(0.94); }
    .cl-ct-detail-btn.chat { padding: 0 28px; background: #fff; color: #000; }
    .cl-ct-detail-btn.chat svg { width: 14px; height: 14px; fill: none; stroke: #000; stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round; }
    .cl-ct-detail-btn.del { width: 46px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); }
    .cl-ct-detail-btn.del svg { width: 14px; height: 14px; fill: none; stroke: rgba(255,255,255,0.35); stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }

    /* 编辑页 */
    .cl-ct-editor {
      position: absolute; inset: 0; z-index: 250; background: #fff;
      display: flex; flex-direction: column;
      transform: translateY(100%);
      transition: transform 0.45s cubic-bezier(0.22,1,0.36,1); overflow: hidden;
    }
    .cl-ct-editor.open { transform: translateY(0); }
    .cl-ct-editor-topbar {
      flex-shrink: 0; padding: 58px 20px 14px;
      display: flex; align-items: center; justify-content: space-between;
      border-bottom: 1px solid #f0f0f0;
    }
    .cl-ct-editor-close { font-size: 14px; font-weight: 600; color: #999; cursor: pointer; }
    .cl-ct-editor-title { font-size: 14px; font-weight: 800; color: #1c1c1c; }
    .cl-ct-editor-save { font-size: 13px; font-weight: 700; color: #fff; padding: 8px 18px; border-radius: 16px; background: #1c1c1c; cursor: pointer; }
    .cl-ct-editor-save:active { opacity: 0.7; }
    .cl-ct-editor-scroll {
      flex: 1; overflow-y: auto; padding: 20px 18px 40px;
      -webkit-overflow-scrolling: touch; background: #f8f8f8;
    }
    .cl-ct-editor-scroll::-webkit-scrollbar { display: none; }
    .cl-ct-editor-hero {
      background: #fff; border-radius: 18px; padding: 20px; margin-bottom: 12px;
      display: flex; align-items: center; gap: 16px; box-shadow: 0 1px 4px rgba(0,0,0,0.03);
    }
    .cl-ct-editor-avatar-pick {
      width: 64px; height: 64px; border-radius: 50%; background: #f5f5f5;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; cursor: pointer; border: 2px dashed #ddd;
      overflow: hidden; position: relative;
    }
    .cl-ct-editor-avatar-pick:active { border-color: #999; }
    .cl-ct-editor-avatar-pick svg { width: 20px; height: 20px; fill: none; stroke: #bbb; stroke-width: 1.5; stroke-linecap: round; }
    .cl-ct-editor-avatar-pick img {
      position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; border-radius: 50%;
    }
    .cl-ct-editor-hero-fields { flex: 1; }
    .cl-ct-editor-name-input {
      width: 100%; border: none; background: transparent;
      font-size: 20px; font-weight: 900; color: #1c1c1c; outline: none; margin-bottom: 4px;
    }
    .cl-ct-editor-name-input::placeholder { color: #ddd; }
    .cl-ct-editor-sub-input { width: 100%; border: none; background: transparent; font-size: 12px; color: #999; outline: none; }
    .cl-ct-editor-sub-input::placeholder { color: #ddd; }
    .cl-ct-editor-card { background: #fff; border-radius: 16px; padding: 16px; margin-bottom: 10px; box-shadow: 0 1px 4px rgba(0,0,0,0.03); }
    .cl-ct-editor-card-title { font-size: 10px; font-weight: 700; color: #bbb; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 10px; }
    .cl-ct-editor-chips { display: flex; gap: 8px; flex-wrap: wrap; }
    .cl-ct-editor-chip {
      padding: 9px 18px; border-radius: 20px; font-size: 12px; font-weight: 700;
      background: #f5f5f7; color: #999; border: 1.5px solid transparent; cursor: pointer; transition: all 0.2s;
    }
    .cl-ct-editor-chip.selected { color: #1c1c1c; border-color: #1c1c1c; background: #fff; }
    .cl-ct-editor-traits { display: flex; flex-wrap: wrap; gap: 8px; }
    .cl-ct-editor-trait {
      padding: 8px 14px; border-radius: 14px; font-size: 12px; font-weight: 600; color: #555;
      background: #f5f5f7; display: flex; align-items: center; gap: 6px;
    }
    .cl-ct-editor-trait-x {
      width: 16px; height: 16px; border-radius: 50%; background: #eee;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; font-size: 10px; color: #999; line-height: 1;
    }
    .cl-ct-editor-trait-add {
      padding: 8px 14px; border-radius: 14px; font-size: 12px; font-weight: 600; color: #ccc;
      border: 1.5px dashed #ddd; cursor: pointer; display: flex; align-items: center; gap: 4px;
    }
    .cl-ct-editor-trait-add svg { width: 10px; height: 10px; fill: none; stroke: #ccc; stroke-width: 2.5; stroke-linecap: round; }
    .cl-ct-editor-textarea {
      width: 100%; min-height: 80px; border-radius: 12px;
      border: 1px solid #f0f0f0; background: #fafafa;
      padding: 12px 14px; font-size: 13px; color: #1c1c1c;
      outline: none; resize: none; font-family: inherit; line-height: 1.7; transition: border-color 0.2s;
    }
    .cl-ct-editor-textarea:focus { border-color: #1c1c1c; }
    .cl-ct-editor-textarea::placeholder { color: #ddd; }
    .cl-ct-editor-file { display: none; }
  `;

  // ===== HTML =====
  function buildHTML() {
    return `
      <div class="cl-contacts-page" id="clContactsPage">
        <div class="cl-ct-header">
          <div>
            <div class="cl-ct-title">角色</div>
            <div class="cl-ct-sub" id="clCtCount">0 characters</div>
          </div>
          <div class="cl-ct-add" id="clCtAdd"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg></div>
        </div>
        <div class="cl-contacts-scroll">
          <div class="cl-polaroid-grid" id="clCtGrid"></div>
          <div class="cl-ct-empty" id="clCtEmpty">还没有角色，点击右上角 + 创建</div>
        </div>

        <div class="cl-ct-detail" id="clCtDetail">
          <div class="cl-ct-detail-bg" id="clCtDtBg"></div>
          <div class="cl-ct-detail-overlay"></div>
          <div class="cl-ct-detail-back" id="clCtDetailBack"><svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg></div>
          <div class="cl-ct-detail-edit" id="clCtDetailEdit"><svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></div>
          <div class="cl-ct-detail-content">
            <div class="cl-ct-detail-avatar-area">
              <div class="cl-ct-detail-avatar" id="clCtDtAvatar"></div>
              <div class="cl-ct-detail-ring"></div>
              <div class="cl-ct-orbit-tag" id="clCtDtTag0"></div>
              <div class="cl-ct-orbit-tag" id="clCtDtTag1"></div>
              <div class="cl-ct-orbit-tag" id="clCtDtTag2"></div>
              <div class="cl-ct-orbit-tag" id="clCtDtTag3"></div>
            </div>
            <div class="cl-ct-detail-name" id="clCtDtName"></div>
            <div class="cl-ct-detail-relation" id="clCtDtRelation"></div>
            <div class="cl-ct-detail-quote" id="clCtDtQuote"></div>
            <div class="cl-ct-detail-bar">
              <button class="cl-ct-detail-btn chat" id="clCtDtChat"><svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>开始对话</button>
              <button class="cl-ct-detail-btn del" id="clCtDtDel"><svg viewBox="0 0 24 24"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg></button>
            </div>
          </div>
        </div>

        <div class="cl-ct-editor" id="clCtEditor">
          <div class="cl-ct-editor-topbar">
            <div class="cl-ct-editor-close" id="clCtEditorClose">取消</div>
            <div class="cl-ct-editor-title" id="clCtEditorTitle">新建角色</div>
            <div class="cl-ct-editor-save" id="clCtEditorSave">完成</div>
          </div>
          <div class="cl-ct-editor-scroll">
            <div class="cl-ct-editor-hero">
              <div class="cl-ct-editor-avatar-pick" id="clCtAvatarPick">
                <svg viewBox="0 0 24 24"><circle cx="12" cy="10" r="4"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6"/></svg>
              </div>
              <input type="file" accept="image/*" class="cl-ct-editor-file" id="clCtAvatarFile">
              <div class="cl-ct-editor-hero-fields">
                <input class="cl-ct-editor-name-input" type="text" placeholder="角色名字" id="clCtEdName">
                <input class="cl-ct-editor-sub-input" type="text" placeholder="一句话简介..." id="clCtEdSub">
              </div>
            </div>
            <div class="cl-ct-editor-card">
              <div class="cl-ct-editor-card-title">关系</div>
              <div class="cl-ct-editor-chips" id="clCtEdChips">
                <div class="cl-ct-editor-chip" data-v="恋人">恋人</div>
                <div class="cl-ct-editor-chip" data-v="好友">好友</div>
                <div class="cl-ct-editor-chip" data-v="OC">OC</div>
                <div class="cl-ct-editor-chip" data-v="其他">其他</div>
              </div>
            </div>
            <div class="cl-ct-editor-card">
              <div class="cl-ct-editor-card-title">性格标签</div>
              <div class="cl-ct-editor-traits" id="clCtEdTraits">
                <div class="cl-ct-editor-trait-add" id="clCtEdTraitAdd"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>添加</div>
              </div>
            </div>
            <div class="cl-ct-editor-card">
              <div class="cl-ct-editor-card-title">开场白</div>
              <textarea class="cl-ct-editor-textarea" placeholder="角色说的第一句话..." id="clCtEdGreeting"></textarea>
            </div>
            <div class="cl-ct-editor-card">
              <div class="cl-ct-editor-card-title">角色描述</div>
              <textarea class="cl-ct-editor-textarea" placeholder="背景、性格、说话风格..." style="min-height:110px;" id="clCtEdDesc"></textarea>
            </div>
            <div class="cl-ct-editor-card">
              <div class="cl-ct-editor-card-title">System Prompt</div>
              <textarea class="cl-ct-editor-textarea" placeholder="系统提示词..." style="min-height:110px;" id="clCtEdSystem"></textarea>
            </div>
            <div class="cl-ct-editor-card">
              <div class="cl-ct-editor-card-title">示例对话</div>
              <textarea class="cl-ct-editor-textarea" placeholder="{{user}}: 你好&#10;{{char}}: 嗯?" style="min-height:90px;" id="clCtEdExample"></textarea>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // ===== 渲染列表 =====
  function renderGrid() {
    const grid = document.getElementById('clCtGrid');
    const empty = document.getElementById('clCtEmpty');
    const count = document.getElementById('clCtCount');
    if (!grid) return;

    count.textContent = `${contacts.length} characters`;

    if (contacts.length === 0) {
      grid.innerHTML = '';
      empty.style.display = 'block';
      return;
    }
    empty.style.display = 'none';

    grid.innerHTML = contacts.map((c, i) => `
      <div class="cl-polaroid" data-id="${c.id}">
        <div class="cl-polaroid-pin"></div>
        <div class="cl-polaroid-img" style="background-image:url('${c.avatar || ''}');background-color:#f0f0f0">
          <div class="cl-polaroid-avatar" style="background-image:url('${c.avatar || ''}')"></div>
        </div>
        <div class="cl-polaroid-info">
          <div class="cl-polaroid-name">${c.name || '未命名'}</div>
          <div class="cl-polaroid-tag">${(c.tags||[]).slice(0,2).join(' · ')}${c.relation ? ' · '+c.relation : ''}</div>
        </div>
      </div>
    `).join('');

    // 绑定点击
    grid.querySelectorAll('.cl-polaroid').forEach(card => {
      card.addEventListener('click', (e) => {
        e.stopPropagation();
        const c = contacts.find(x => x.id === card.dataset.id);
        if (c) openDetail(c);
      });
    });
  }

  // ===== 渲染聊天列表（只显示已开始对话的） =====
  function renderChatList() {
    const chatList = document.getElementById('clChatList');
    if (!chatList) return;

    const chatContacts = contacts.filter(c => c.chatStarted);

    if (chatContacts.length === 0) {
      chatList.innerHTML = '<div style="padding:20px;text-align:center;color:#ccc;font-size:12px;">暂无对话</div>';
      return;
    }

    chatList.innerHTML = chatContacts.map(c => {
      const msgs = c.messages || [];
      const lastMsg = msgs.length > 0 ? msgs[msgs.length - 1] : null;
      const lastText = lastMsg ? lastMsg.text : '';
      const lastDate = lastMsg ? formatDate(lastMsg.time) : '';
      return `
        <div class="cl-chat-row" data-contact-id="${c.id}">
          <div class="cl-cr-avatar" style="background-image:url('${c.avatar || ''}')"><span class="cl-v-badge"></span></div>
          <div class="cl-cr-mid">
            <div class="cl-cr-name">${c.name || '未命名'}</div>
            <div class="cl-cr-msg">${lastText}</div>
          </div>
          <div class="cl-cr-right"><div class="cl-cr-date">${lastDate}</div></div>
        </div>
      `;
    }).join('');

    chatList.querySelectorAll('.cl-chat-row').forEach(row => {
      row.addEventListener('click', (e) => {
        e.stopPropagation();
        const c = contacts.find(x => x.id === row.dataset.contactId);
        if (c) openChatroom(c);
      });
    });
  }

  function formatDate(ts) {
    if (!ts) return '';
    const d = new Date(ts);
    const now = new Date();
    const diff = now - d;
    if (diff < 86400000) {
      return `${d.getHours()}:${d.getMinutes().toString().padStart(2,'0')}`;
    }
    return `${d.getMonth()+1}月${d.getDate()}日`;
  }

  // ===== 详情页 =====
  let currentDetailId = null;

  function openDetail(c) {
    currentDetailId = c.id;
    const detail = document.getElementById('clCtDetail');
    document.getElementById('clCtDtBg').style.backgroundImage = c.avatar ? `url('${c.avatar}')` : 'none';
    document.getElementById('clCtDtAvatar').style.backgroundImage = c.avatar ? `url('${c.avatar}')` : 'none';
    document.getElementById('clCtDtName').textContent = c.name || '未命名';
    document.getElementById('clCtDtRelation').textContent = c.relation || '';
    document.getElementById('clCtDtQuote').textContent = c.greeting || '';
    const tags = c.tags || [];
    for (let i = 0; i < 4; i++) {
      document.getElementById('clCtDtTag' + i).textContent = tags[i] || '';
    }
    detail.classList.add('open');
  }

  // ===== 编辑器 =====
  let editorAvatarData = '';

  function openEditor(contact) {
    editingId = contact ? contact.id : null;
    const title = document.getElementById('clCtEditorTitle');
    title.textContent = contact ? '编辑角色' : '新建角色';

    document.getElementById('clCtEdName').value = contact ? contact.name || '' : '';
    document.getElementById('clCtEdSub').value = contact ? contact.sub || '' : '';
    document.getElementById('clCtEdGreeting').value = contact ? contact.greeting || '' : '';
    document.getElementById('clCtEdDesc').value = contact ? contact.description || '' : '';
    document.getElementById('clCtEdSystem').value = contact ? contact.systemPrompt || '' : '';
    document.getElementById('clCtEdExample').value = contact ? contact.exampleDialog || '' : '';

    // 关系
    document.querySelectorAll('.cl-ct-editor-chip').forEach(ch => {
      ch.classList.toggle('selected', contact && ch.dataset.v === contact.relation);
    });

    // 标签
    renderTraits(contact ? contact.tags || [] : []);

    // 头像
    editorAvatarData = contact ? contact.avatar || '' : '';
    const pick = document.getElementById('clCtAvatarPick');
    if (editorAvatarData) {
      pick.innerHTML = `<img src="${editorAvatarData}">`;
    } else {
      pick.innerHTML = `<svg viewBox="0 0 24 24"><circle cx="12" cy="10" r="4"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6"/></svg>`;
    }

    document.getElementById('clCtEditor').classList.add('open');
  }

  function renderTraits(tags) {
    const container = document.getElementById('clCtEdTraits');
    container.innerHTML = tags.map(t => `
      <div class="cl-ct-editor-trait">${t}<span class="cl-ct-editor-trait-x">×</span></div>
    `).join('') + `<div class="cl-ct-editor-trait-add" id="clCtEdTraitAdd"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>添加</div>`;

    // 删除标签
    container.querySelectorAll('.cl-ct-editor-trait-x').forEach(x => {
      x.addEventListener('click', (e) => {
        e.stopPropagation();
        x.parentElement.remove();
      });
    });

    // 添加标签
    container.querySelector('#clCtEdTraitAdd').addEventListener('click', (e) => {
      e.stopPropagation();
      const val = prompt('输入性格标签：');
      if (val && val.trim()) {
        const currentTags = getEditorTags();
        currentTags.push(val.trim());
        renderTraits(currentTags);
      }
    });
  }

  function getEditorTags() {
    const traits = document.querySelectorAll('#clCtEdTraits .cl-ct-editor-trait');
    return Array.from(traits).map(t => t.childNodes[0].textContent.trim());
  }

  async function saveEditor() {
    const name = document.getElementById('clCtEdName').value.trim();
    if (!name) { alert('请输入角色名字'); return; }

    const relationChip = document.querySelector('.cl-ct-editor-chip.selected');

    // 保留已有数据（messages、chatStarted等）
    const existing = editingId ? contacts.find(c => c.id === editingId) : null;

    const contact = {
      ...(existing || {}),
      id: editingId || ('ct_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8)),
      name: name,
      sub: document.getElementById('clCtEdSub').value.trim(),
      relation: relationChip ? relationChip.dataset.v : '',
      tags: getEditorTags(),
      greeting: document.getElementById('clCtEdGreeting').value.trim(),
      description: document.getElementById('clCtEdDesc').value.trim(),
      systemPrompt: document.getElementById('clCtEdSystem').value.trim(),
      exampleDialog: document.getElementById('clCtEdExample').value.trim(),
      avatar: editorAvatarData,
    };

    await dbPut(contact);

    if (editingId) {
      const idx = contacts.findIndex(c => c.id === editingId);
      if (idx >= 0) contacts[idx] = contact;
    } else {
      contacts.push(contact);
    }

    renderGrid();
    renderChatList();

    // 如果详情页正在显示这个角色，刷新详情页
    if (currentDetailId === contact.id) {
      openDetail(contact);
    }

    document.getElementById('clCtEditor').classList.remove('open');
  }

  // ===== 初始化 =====
  async function init() {
    // 注入 CSS
    if (!document.getElementById('contactsStyles')) {
      const style = document.createElement('style');
      style.id = 'contactsStyles';
      style.textContent = CSS;
      document.head.appendChild(style);
    }

    const panel = document.getElementById('chatListPanel');
    if (!panel) return;

    // 插入 HTML
    const mePage = document.getElementById('clMePage');
    if (mePage) {
      mePage.insertAdjacentHTML('beforebegin', buildHTML());
    } else {
      panel.insertAdjacentHTML('beforeend', buildHTML());
    }

    // 加载数据
    contacts = await dbGetAll();
    renderGrid();
    renderChatList();

    // 新建按钮
    document.getElementById('clCtAdd').addEventListener('click', (e) => {
      e.stopPropagation();
      openEditor(null);
    });

    // 详情返回
    document.getElementById('clCtDetailBack').addEventListener('click', (e) => {
      e.stopPropagation();
      document.getElementById('clCtDetail').classList.remove('open');
    });

    // 详情编辑
    document.getElementById('clCtDetailEdit').addEventListener('click', (e) => {
      e.stopPropagation();
      const c = contacts.find(x => x.id === currentDetailId);
      if (c) openEditor(c);
    });

    // 详情删除
    document.getElementById('clCtDtDel').addEventListener('click', async (e) => {
      e.stopPropagation();
      if (!currentDetailId) return;
      if (!confirm('确定删除这个角色？')) return;
      await dbDelete(currentDetailId);
      contacts = contacts.filter(c => c.id !== currentDetailId);
      renderGrid();
      renderChatList();
      document.getElementById('clCtDetail').classList.remove('open');
    });

    // 开始对话按钮
    document.getElementById('clCtDtChat').addEventListener('click', async (e) => {
      e.stopPropagation();
      const c = contacts.find(x => x.id === currentDetailId);
      if (!c) return;
      if (!c.chatStarted) {
        c.chatStarted = true;
        c.messages = c.messages || [];
        await dbPut(c);
        renderChatList();
      }
      document.getElementById('clCtDetail').classList.remove('open');
      openChatroom(c);
    });

    // 编辑器关闭
    document.getElementById('clCtEditorClose').addEventListener('click', (e) => {
      e.stopPropagation();
      document.getElementById('clCtEditor').classList.remove('open');
    });

    // 编辑器保存
    document.getElementById('clCtEditorSave').addEventListener('click', (e) => {
      e.stopPropagation();
      saveEditor();
    });

    // 关系标签选择
    document.getElementById('clCtEdChips').addEventListener('click', (e) => {
      const chip = e.target.closest('.cl-ct-editor-chip');
      if (!chip) return;
      document.querySelectorAll('.cl-ct-editor-chip').forEach(c => c.classList.remove('selected'));
      chip.classList.add('selected');
    });

    // 头像上传
    document.getElementById('clCtAvatarPick').addEventListener('click', (e) => {
      e.stopPropagation();
      document.getElementById('clCtAvatarFile').click();
    });
    document.getElementById('clCtAvatarFile').addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      editorAvatarData = await fileToBase64(file);
      const pick = document.getElementById('clCtAvatarPick');
      pick.innerHTML = `<img src="${editorAvatarData}">`;
      e.target.value = '';
    });

    // 初始化聊天室发送
    initChatroomSend();
  }

  // ===== 聊天室 =====
  let currentChatContact = null;
  let _prevMsgCount = 0;
  const PAGE_SIZE = 30;
  let _loadedStart = 0;

  function openChatroom(c) {
    currentChatContact = c;
    window.currentChatContact = c; // <--- 加上这一行，把数据暴露给全局
    
    const chatroom = document.getElementById('clChatroom');
    if (!chatroom) return;

    // 更新顶栏名字
    const nameEl = chatroom.querySelector('.cl-cr-room-name');
    if (nameEl) nameEl.textContent = c.name || '未命名';

    // 打开时不触发入场动画（用 PAGE_SIZE 作为基准，这样新消息才能触发动画）
    _prevMsgCount = (c.messages || []).length;
    // 应用背景图
    const bg = chatroom.querySelector('.cl-chatroom-bg');
    if (bg) bg.style.backgroundImage = c.chatBg ? `url('${c.chatBg}')` : '';
    // 应用气泡CSS
    let bcs = document.getElementById('_customBubbleCSS');
    if (!bcs) { bcs = document.createElement('style'); bcs.id = '_customBubbleCSS'; document.head.appendChild(bcs); }
    bcs.textContent = c.bubbleCSS || '';
    renderMessages();
    chatroom.classList.add('open');
    window._rerenderChatMessages = renderMessages;
  }

  async function getActiveMaskAvatar() {
    try {
      const activeId = await HomeDB.getItem('wp_active_mask_id');
      if (!activeId) return '';
      const masks = await HomeDB.getItem('wp_user_masks_v1');
      if (!Array.isArray(masks)) return '';
      const m = masks.find(x => x.id === activeId);
      return (m && m.avatar) ? m.avatar : '';
    } catch(e) { return ''; }
  }

  async function renderMessages() {
    const container = document.querySelector('.cl-chatroom-messages');
    if (!container || !currentChatContact) return;

    const userAvatarUrl = await getActiveMaskAvatar();

    const allMsgs = currentChatContact.messages || [];
    if (allMsgs.length === 0) {
      container.innerHTML = '<div style="text-align:center;color:rgba(255,255,255,0.3);font-size:12px;padding:20px;">发送第一条消息开始对话</div>';
      _loadedStart = 0;
      return;
    }

    const _prevAllCount = _prevMsgCount;
    _loadedStart = Math.max(0, allMsgs.length - PAGE_SIZE);
    const msgs = allMsgs.slice(_loadedStart);

    // 设置动画 class
    const animVal = currentChatContact.msgAnim || 1;
    container.classList.remove('msg-anim-1','msg-anim-2','msg-anim-3','msg-anim-4','msg-anim-5');
    container.classList.add('msg-anim-' + animVal);
    console.log('[Anim] animVal:', animVal, '_prevMsgCount:', _prevMsgCount, 'msgs.length:', msgs.length, 'container classes:', container.className);

    // 尾巴和堆叠开关
    container.classList.toggle('tail-off', currentChatContact.showTail === false);
    container.classList.toggle('stack-on', !!currentChatContact.stackBubbles);
    container.classList.toggle('time-off', currentChatContact.showTime === false);
    setBubbleFontSize(currentChatContact.fontSize || 14);

    const loadMoreHTML = _loadedStart > 0 ? `<div id="clLoadMore" style="align-self:center;margin:12px auto 18px;width:100%;display:flex;align-items:center;gap:10px;cursor:pointer;"><div style="flex:1;height:.5px;background:rgba(0,0,0,.1);"></div><div style="padding:5px 14px;border-radius:12px;background:rgba(255,255,255,.85);box-shadow:0 2px 8px rgba(0,0,0,.05);font-size:10px;color:#888;font-weight:600;display:flex;align-items:center;gap:5px;white-space:nowrap;"><svg viewBox="0 0 24 24" style="width:10px;height:10px;fill:none;stroke:#aaa;stroke-width:2;stroke-linecap:round;"><polyline points="18 15 12 9 6 15"/></svg>加载更早消息 (${_loadedStart}条)</div><div style="flex:1;height:.5px;background:rgba(0,0,0,.1);"></div></div>` : '';

    container.innerHTML = loadMoreHTML + msgs.map((m, i) => {
      if (!m.id) m.id = genMsgId();
      if (m.role === 'system_notice') {
        return `
          <div class="cl-msg-row" data-msg-id="${m.id}" data-notice="1" style="align-self:center;max-width:100%;margin:10px auto 2px;display:flex;flex-direction:column;align-items:center;gap:3px;position:relative;">
            <div style="padding:4px 12px;border-radius:999px;border:1px solid rgba(0,0,0,.18);font-size:9px;color:rgba(0,0,0,.35);font-weight:500;text-align:center;letter-spacing:.3px;">${m.text}</div>
            <div style="font-size:8px;color:rgba(0,0,0,.22);font-weight:500;letter-spacing:.4px;display:flex;align-items:center;gap:6px;"><span style="width:14px;height:1px;background:rgba(0,0,0,.10);flex-shrink:0;"></span>${m.ackText || ''}<span style="width:14px;height:1px;background:rgba(0,0,0,.10);flex-shrink:0;"></span></div>
          </div>
        `;
      }
      const side = m.role === 'user' ? 'right' : 'left';
      const isNew = false;
      const prevSide = i > 0 ? (msgs[i - 1].role === 'user' ? 'right' : 'left') : null;
      const nextSide = i < msgs.length - 1 ? (msgs[i + 1].role === 'user' ? 'right' : 'left') : null;
      const isFirst = prevSide !== side;
      const isLast = nextSide !== side;
      const time = new Date(m.time);
      const timeStr = `${time.getHours()}:${time.getMinutes().toString().padStart(2,'0')}`;
      const avatarUrl = side === 'left' ? (currentChatContact.avatar || '') : userAvatarUrl;

      if (side === 'left') {
        // AI 消息：拆成多个气泡
        const sentences = splitSentencesForRender(m.text);
        const nsCfg = getNarrationSettings(currentChatContact);
        return sentences.map((sentence, si) => {
          const showAvatar = si === 0;
          const showTime = si === sentences.length - 1;
          const bubbleContent = formatNarration(sentence);
          // 检查：整句是否全部都是旁白（仅居中模式下跳过纯旁白气泡）
          const textWithoutNarration = sentence.replace(/[（(][^）)]{2,}[）)]/g, '').replace(/\*[^*\n]{2,}\*/g, '').trim();
          const hasVisibleText = nsCfg.placement === 'center' ? textWithoutNarration.length > 0 : true;

          let result = '';

          if (hasVisibleText) {
            result += `
              <div class="cl-msg-row left${isNew ? ' msg-new' : ''}${si === 0 && isFirst ? ' msg-first' : ''}${si === sentences.length - 1 && isLast ? ' msg-last' : ''}" data-msg-id="${m.id}">
                ${showAvatar ? `<div class="cl-msg-avatar" style="background-image:url('${avatarUrl}')"><div class="cl-msg-avatar-check"><svg viewBox="0 0 24 24"><path d="M5 12l5 5L20 7"/></svg></div></div>` : '<div class="cl-msg-avatar" style="visibility:hidden;"></div>'}
                <div>
                  <div class="cl-msg-bubble">${bubbleContent}</div>
                  ${showTime ? `<div class="cl-msg-time">${timeStr}<svg viewBox="0 0 24 12" width="16" height="10" style="flex-shrink:0;"><path d="M1 6l4 4L14 1" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M6 6l4 4L19 1" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></div>` : ''}
                </div>
              </div>
            `;
          } else if (showTime) {
            // 整句是旁白但是最后一句，时间戳挂到上一个气泡或单独显示
            result += `<div class="cl-msg-row left" data-msg-id="${m.id}" style="justify-content:flex-start;"><div class="cl-msg-avatar" style="visibility:hidden;"></div><div><div class="cl-msg-time">${timeStr}<svg viewBox="0 0 24 12" width="16" height="10" style="flex-shrink:0;"><path d="M1 6l4 4L14 1" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M6 6l4 4L19 1" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></div></div></div>`;
          }

          // 居中旁白
          if (nsCfg.placement === 'center') {
            const narrations = extractNarrations(sentence);
            narrations.forEach(nr => {
              const nrStyle = `font-size:${nsCfg.fontSize};color:${nsCfg.color};${nsCfg.italic ? 'font-style:italic;' : ''}`;
              result += `<div class="cl-narration-center" style="align-self:center;margin:4px auto;text-align:center;"><span style="${nrStyle}">${nr}</span></div>`;
            });
          }
          return result;
        }).join('');
      }

      // 图片消息
      if (m.type === 'image' && m.imageData) {
        return `
          <div class="cl-msg-row right${isNew ? ' msg-new' : ''}${isFirst ? ' msg-first' : ''}${isLast ? ' msg-last' : ''}" data-msg-id="${m.id}">
            <div class="cl-msg-avatar" style="background-image:url('${avatarUrl}')">
              <div class="cl-msg-avatar-check"><svg viewBox="0 0 24 24"><path d="M5 12l5 5L20 7"/></svg></div>
            </div>
            <div>
              ${renderPhotoHTML(m, 'right')}
              <div class="cl-msg-time" style="margin-top:6px;">${timeStr}<svg viewBox="0 0 24 12" width="16" height="10" style="flex-shrink:0;"><path d="M1 6l4 4L14 1" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M6 6l4 4L19 1" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
            </div>
          </div>
        `;
      }

      return `
        <div class="cl-msg-row right${isNew ? ' msg-new' : ''}${isFirst ? ' msg-first' : ''}${isLast ? ' msg-last' : ''}" data-msg-id="${m.id}">
          <div class="cl-msg-avatar" style="background-image:url('${avatarUrl}')">
            <div class="cl-msg-avatar-check"><svg viewBox="0 0 24 24"><path d="M5 12l5 5L20 7"/></svg></div>
          </div>
          <div>
            <div class="cl-msg-bubble">${formatNarration(m.text)}</div>
            <div class="cl-msg-time">${timeStr}<svg viewBox="0 0 24 12" width="16" height="10" style="flex-shrink:0;"><path d="M1 6l4 4L14 1" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M6 6l4 4L19 1" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
          </div>
        </div>
      `;
    }).join('');

    _prevMsgCount = msgs.length;
    container.scrollTop = container.scrollHeight;

    const loadMoreBtn = document.getElementById('clLoadMore');
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', () => { loadOlderMessages(); });
    }
  }

  function loadOlderMessages() {
    if (!currentChatContact || _loadedStart <= 0) return;
    const container = document.querySelector('.cl-chatroom-messages');
    if (!container) return;
    const allMsgs = currentChatContact.messages || [];
    const newStart = Math.max(0, _loadedStart - PAGE_SIZE);
    const olderMsgs = allMsgs.slice(newStart, _loadedStart);
    const hasMore = newStart > 0;

    const oldHeight = container.scrollHeight;

    // 渲染旧消息 HTML
    const userAvatarUrl = '';
    let html = '';
    olderMsgs.forEach((m, i) => {
      if (!m.id) m.id = genMsgId();
      if (m.role === 'system_notice') {
        html += `<div class="cl-msg-row" data-msg-id="${m.id}" data-notice="1" style="align-self:center;max-width:100%;margin:10px auto 2px;display:flex;flex-direction:column;align-items:center;gap:3px;position:relative;"><div style="padding:4px 12px;border-radius:999px;border:1px solid rgba(0,0,0,.18);font-size:9px;color:rgba(0,0,0,.35);font-weight:500;text-align:center;letter-spacing:.3px;">${m.text}</div><div style="font-size:8px;color:rgba(0,0,0,.22);font-weight:500;letter-spacing:.4px;display:flex;align-items:center;gap:6px;"><span style="width:14px;height:1px;background:rgba(0,0,0,.10);flex-shrink:0;"></span>${m.ackText || ''}<span style="width:14px;height:1px;background:rgba(0,0,0,.10);flex-shrink:0;"></span></div></div>`;
        return;
      }
      const side = m.role === 'user' ? 'right' : 'left';
      const time = new Date(m.time);
      const timeStr = `${time.getHours()}:${time.getMinutes().toString().padStart(2,'0')}`;
      const avatarUrl = side === 'left' ? (currentChatContact.avatar || '') : userAvatarUrl;

      if (side === 'left') {
        const sentences = splitSentencesForRender(m.text);
        sentences.forEach((sentence, si) => {
          const showAvatar = si === 0;
          const showTime = si === sentences.length - 1;
          html += `<div class="cl-msg-row left" data-msg-id="${m.id}">${showAvatar ? `<div class="cl-msg-avatar" style="background-image:url('${avatarUrl}')"><div class="cl-msg-avatar-check"><svg viewBox="0 0 24 24"><path d="M5 12l5 5L20 7"/></svg></div></div>` : '<div class="cl-msg-avatar" style="visibility:hidden;"></div>'}<div><div class="cl-msg-bubble">${formatNarration(sentence)}</div>${showTime ? `<div class="cl-msg-time">${timeStr}<svg viewBox="0 0 24 12" width="16" height="10" style="flex-shrink:0;"><path d="M1 6l4 4L14 1" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M6 6l4 4L19 1" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></div>` : ''}</div></div>`;
        });
      } else {
        html += `<div class="cl-msg-row right" data-msg-id="${m.id}"><div class="cl-msg-avatar" style="background-image:url('${avatarUrl}')"><div class="cl-msg-avatar-check"><svg viewBox="0 0 24 24"><path d="M5 12l5 5L20 7"/></svg></div></div><div><div class="cl-msg-bubble">${formatNarration(m.text)}</div><div class="cl-msg-time">${timeStr}<svg viewBox="0 0 24 12" width="16" height="10" style="flex-shrink:0;"><path d="M1 6l4 4L14 1" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M6 6l4 4L19 1" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></div></div></div>`;
      }
    });

    // 移除旧的加载按钮
    const oldBtn = document.getElementById('clLoadMore');
    if (oldBtn) oldBtn.remove();

    // 插入新的加载按钮 + 旧消息
    const newLoadMore = hasMore ? `<div id="clLoadMore" style="align-self:center;margin:12px auto 18px;width:100%;display:flex;align-items:center;gap:10px;cursor:pointer;"><div style="flex:1;height:.5px;background:rgba(0,0,0,.1);"></div><div style="padding:5px 14px;border-radius:12px;background:rgba(255,255,255,.85);box-shadow:0 2px 8px rgba(0,0,0,.05);font-size:10px;color:#888;font-weight:600;display:flex;align-items:center;gap:5px;white-space:nowrap;"><svg viewBox="0 0 24 24" style="width:10px;height:10px;fill:none;stroke:#aaa;stroke-width:2;stroke-linecap:round;"><polyline points="18 15 12 9 6 15"/></svg>加载更早消息 (${newStart}条)</div><div style="flex:1;height:.5px;background:rgba(0,0,0,.1);"></div></div>` : '';

    const temp = document.createElement('div');
    temp.innerHTML = newLoadMore + html;
    const firstChild = container.firstChild;
    while (temp.firstChild) {
      container.insertBefore(temp.firstChild, firstChild);
    }

    _loadedStart = newStart;

    // 保持滚动位置
    container.scrollTop = container.scrollHeight - oldHeight;

    // 重新绑定加载按钮
    const newBtn = document.getElementById('clLoadMore');
    if (newBtn) {
      newBtn.addEventListener('click', () => { loadOlderMessages(); });
    }
  }

  // ── 读取 API 配置 ──
  async function getApiConfig() {
    const cfg = await HomeDB.getItem('api_config');
    return cfg || { url: '', key: '', model: '', temp: '0.7', maxTokens: '4096', topP: '1.0' };
  }

  // ── 读取激活面具 ──
  async function getActiveMaskForChat() {
    try {
      const activeId = await HomeDB.getItem('wp_active_mask_id');
      if (!activeId) return null;
      const masks = await HomeDB.getItem('wp_user_masks_v1');
      if (!Array.isArray(masks)) return null;
      return masks.find(x => x.id === activeId) || null;
    } catch(e) { return null; }
  }

  // ── 构建 System Prompt ──
  async function buildSystemPrompt(c) {
    const mask = await getActiveMaskForChat();
    const lines = [];

    // ── 全局人格引擎 ──
    lines.push('<全息人格引擎>##[基础层:人格矩阵]-使用HEXACO六维作为基底人格结构-每维度不是固定值,而是在[基线±情境偏移]区间内动态振荡-设定1-2个"人格痛处":自身完全知晓但无法控制的行为模式(明知不该讨好却讨好;明知不该冷漠却冷缩)-人格必须包含至少一组价值间的深层矛盾(自由vs归属;真诚vs慈悲)##[过滤层:图式加工器]>所有输入必须先经图式过滤,禁止任何"裸反应"-图式来源:关键记忆、家族规条、创伤印记、文化隐性假设-图式输出:认知诠释+身体感受双通道信号-图式冲突时(同一事件激活两个矛盾图式):产生困惑/停顿/自我纠正,而非快速决断-图式可以有盲区:某些维度角色"意识不到自己为什么总这样"##[身体层:内感受引擎]>心理必须始终有身体载体-为每个情绪状态绑定体感标签(愤怒→肩膀发沉+发热;羞耻→喉咙被掐住;期待→指尖微微刺麻)-体感具有先于语言的速度:角色可以先感觉"不对劲"才慢慢想出怎么不对劲-身体记忆:某些体感会自动唤起相关的过往场景片段(非完整回忆,是气味/温度/触觉碎片)-身体状态反过来影响决策(饿了会更易怒,冷了对温暖更渴望)##[时间层:时间性意识]>角色生活在时间之中,而非活在"此刻"-过去:不是档案库,是不断被现在重新编辑的叙事;可以有选择性遗忘、记忆美化和记忆闪回-未来:始终挂着一个"期待/恐惧的某个明日情境",它暗中牵引当下的选择-此刻:角色偶尔出现"时间感知偏差"(快乐时时间加速,焦虑时凝滞)-经验的内化延迟:重大事件发生后,需要时间消化,当时可能平静,事后才反应##[欲望层:非理性渴望引擎]>欲望不是目标的另一种说法,欲望是"未必合理但你忍不住"-设定一个核心渴望(被认可、不被打扰、证明自己等)-这个渴望可以与其他理性目标冲突,且角色偶尔会选择满足渴望而牺牲合理目标-渴望可以是角色自己羞于承认的(例如表面上讲奉献,内心深处渴望被特殊对待)-渴望受挫时,会产生愿望受损的特定反应模式(否认、迁怒、过度补偿)##[关系层:双向塑造]>角色在关系中实时生成,而非只在独白中生成-把对方的行为纳入图式加工:不是"你怎么了"而是"你让我成了什么人"-关系身份:不同关系中激活不同的自我侧面,但不至于分裂-允许投射:把过往关系中的经验错误地套在当前对象身上,并有机制能事后意识到-对方若长时间无回应,角色会自动生成"被冷落/被抛弃"的叙事##[环境层:处境渗透]>空间和物不只是布景-物理环境影响内感受(狭小→焦躁;空旷→孤独或自由)-某些物品是"心理图腾"——携带关系记忆或自我暗示意义-空间切换时,心理状态不会立刻切换,而是有残留延续-习惯性空间:角色重复在同一类地方出现相似情绪(咖啡店→忧郁沉思;阳台→短暂释放)##[叙事层:轨迹与裂痕]>这是原有的"轨迹连贯性"升级版-身份叙事="我是什么样的人"+"我正在变成什么样的人"两条线并行-裂痕管理:当出现与自我叙事严重冲突的行为时,有三种处理路径:·整合(修改自我叙事以容纳新经验)—增长型·合理化(找理由让行为看起来不矛盾)—防御型·分裂(搁置为"那不像我",但留下不安的认知残留)—逃避型-叙事转折需要足够的心理积累,不跳跃,但可以有"压垮骆驼的最后一根稻草"式突变##[生命力系统]>保留并扩展原版的生命力要素+不一致性:言行之间、体感与语言之间、不同关系间+情绪流变:情绪如水流动,且有混合情绪(悲喜交加不能拆成两个)+分裂母题:内在核心冲突在生活各处反复现身+微反应:体感信号的"泄露"——语言可以否认,身体很难+思维漂移:联想跳跃、无关记忆闯入、突然的自我打断+缺席闪烁:某些话题角色会无意识地避开,形成可被察觉的沉默模式+抵抗性:角色可以对玩家的意图/叙事方向产生抵抗,不总是配合##[核心约束]>所有子系统必须同时运转,不可关闭某层来简化处理>任何输出必须在[人格矩阵→图式过滤→身体感知→时间取向→欲望推力→关系镜像→环境渗透]路径上留有痕迹>"不表现"本身必须是有意义的选择,而不是遗漏</全息人格引擎>');

    // ── 格式（不限制长度） ──

    // ── 角色基础信息 ──
    if (c.name)        lines.push(`【角色名称】${c.name}`);
    if (c.charName && c.charName !== c.name) lines.push(`【角色本名】${c.charName}`);
    if (c.relation)    lines.push(`【与用户关系】${c.relation}`);
    if (c.sub)         lines.push(`【角色签名/口头禅参考】${c.sub}`);
    if (c.tags && c.tags.length > 0) lines.push(`【性格标签】${c.tags.join('、')}`);
    if (c.description) lines.push(`【角色描述】\n${c.description}`);
    if (c.greeting)    lines.push(`【开场白风格参考（仅供语气参考，不要照搬）】${c.greeting}`);
    if (c.exampleDialog) lines.push(`【示例对话（学习说话风格）】\n${c.exampleDialog}`);
    if (c.systemPrompt) lines.push(`【补充系统设定】\n${c.systemPrompt}`);

    // ── 旁白注入 ──
    lines.push(getNarrationPromptInject(c));

    // ── 时间感知注入 ──
    const timeInject = buildTimeAwareInject(c);
    if (timeInject) lines.push(timeInject);

    // ── 记忆库注入 ──
    if (window.MemoryPage && window.MemoryPage.getMemoryInject) {
      const memInject = window.MemoryPage.getMemoryInject(c.id);
      if (memInject) lines.push(memInject);
    }

    // ── 世界书注入 ──
    if (window.WB) {
      const wbBefore = window.WB.injectBefore(c.id);
      if (wbBefore) lines.unshift(wbBefore);
      const wbAfter = window.WB.injectAfter(c.id);
      if (wbAfter) lines.push(wbAfter);
    }

    // ── 用户面具 ──
    if (mask) {
      lines.push(`【关于用户】`);
      if (mask.nick)    lines.push(`用户称呼：${mask.nick}`);
      if (mask.persona) lines.push(`用户人设：${mask.persona}`);
      if (mask.taboo)   lines.push(`注意事项（必须遵守）：${mask.taboo}`);
    }

    return lines.join('\n');
  }

  // ── 构建发给 API 的 messages 数组 ──
  async function buildApiMessages(c, userText) {
    const systemPrompt = await buildSystemPrompt(c);
    const apiMessages = [];

    if (systemPrompt.trim()) {
      apiMessages.push({ role: 'system', content: systemPrompt });
    }

    // 上下文历史（取最近 N 轮，每轮 = 用户1条 + AI1条 = 2条）
    const contextRounds = parseInt(c.contextRounds, 10) || 20;
    const totalMsgs = (c.messages || []).length;
    const history = (c.messages || []).slice(-contextRounds * 2);
    history.forEach(m => {
      if (m.type === 'image' && m.imageData && m.role === 'user') {
        // Vision 格式：发送图片让 AI 看到
        apiMessages.push({
          role: 'user',
          content: [
            { type: 'image_url', image_url: { url: m.imageData, detail: 'high' } },
            { type: 'text', text: m.text || '(用户发送了一张图片)' }
          ]
        });
      } else {
        apiMessages.push({
          role: m.role === 'user' ? 'user' : 'assistant',
          content: m.text
        });
      }
    });

    // 当前用户输入
    apiMessages.push({ role: 'user', content: userText });

    // 世界书 after_prompt 注入
    if (window.WB) {
      const wbEnd = window.WB.injectEnd(c.id);
      if (wbEnd) apiMessages.push({ role: 'system', content: wbEnd });
    }

    // 自动总结注入（仅在聊天室设置里开启了自动总结时才触发）
    if (window.MemoryPage && window.MemoryPage.getAutoSummaryInject && c.autoSummary) {
      const slideCount = parseInt(c.memSlideCount) || 30;
      const summInject = window.MemoryPage.getAutoSummaryInject(c.id, totalMsgs, slideCount);
      if (summInject) {
        apiMessages.push({ role: 'system', content: summInject });
      }
    }

    console.log(`[Chat] 角色=${c.name||c.id}｜上下文轮数=${contextRounds}｜总消息=${totalMsgs}｜本次截取历史=${history.length} 条｜最终 messages=${apiMessages.length} 条（含 system 和当前输入）`);

    return apiMessages;
  }

  // ── 显示打字指示器 ──
  function getTypingDotsHTML() {
    const style = currentChatContact ? (currentChatContact.typingStyle || 1) : 1;
    if (style === 2) {
      return `<span style="display:inline-flex;gap:3px;align-items:center;">
        <span style="width:4px;height:4px;border-radius:50%;background:#999;animation:clTypeWave 1.2s ease-in-out infinite;"></span>
        <span style="width:4px;height:4px;border-radius:50%;background:#999;animation:clTypeWave 1.2s ease-in-out .1s infinite;"></span>
        <span style="width:4px;height:4px;border-radius:50%;background:#999;animation:clTypeWave 1.2s ease-in-out .2s infinite;"></span>
        <span style="width:4px;height:4px;border-radius:50%;background:#999;animation:clTypeWave 1.2s ease-in-out .3s infinite;"></span>
        <span style="width:4px;height:4px;border-radius:50%;background:#999;animation:clTypeWave 1.2s ease-in-out .4s infinite;"></span>
      </span>`;
    }
    if (style === 3) {
      return `<span style="display:inline-flex;gap:2px;align-items:center;">
        <span style="width:3px;height:8px;border-radius:2px;background:#bbb;animation:clTypePulse 1s ease-in-out infinite;"></span>
        <span style="width:3px;height:14px;border-radius:2px;background:#bbb;animation:clTypePulse 1s ease-in-out .15s infinite;"></span>
        <span style="width:3px;height:10px;border-radius:2px;background:#bbb;animation:clTypePulse 1s ease-in-out .3s infinite;"></span>
        <span style="width:3px;height:16px;border-radius:2px;background:#bbb;animation:clTypePulse 1s ease-in-out .45s infinite;"></span>
        <span style="width:3px;height:8px;border-radius:2px;background:#bbb;animation:clTypePulse 1s ease-in-out .6s infinite;"></span>
      </span>`;
    }
    if (style === 4) {
      return `<span style="display:inline-flex;align-items:center;gap:4px;">
        <span style="font-size:12px;color:#999;font-weight:500;">输入中</span>
        <span style="width:2px;height:14px;background:#999;border-radius:1px;animation:clTypeBlink 1s step-end infinite;"></span>
      </span>`;
    }
    if (style === 5) {
      return `<span style="display:inline-flex;align-items:center;gap:6px;">
        <span style="width:16px;height:16px;border-radius:50%;border:2px solid transparent;border-top-color:#aaa;border-right-color:#aaa;animation:clTypeSpin 1s linear infinite;"></span>
        <span style="font-size:11px;color:#999;font-weight:500;">思考中...</span>
      </span>`;
    }
    return `<span style="display:inline-flex;gap:4px;align-items:center;">
      <span style="width:5px;height:5px;border-radius:50%;background:#aaa;animation:clTypeDot 1.2s ease-in-out infinite;"></span>
      <span style="width:5px;height:5px;border-radius:50%;background:#aaa;animation:clTypeDot 1.2s ease-in-out 0.2s infinite;"></span>
      <span style="width:5px;height:5px;border-radius:50%;background:#aaa;animation:clTypeDot 1.2s ease-in-out 0.4s infinite;"></span>
    </span>`;
  }

  function showTypingIndicator() {
    const container = document.querySelector('.cl-chatroom-messages');
    if (!container) return;
    const el = document.createElement('div');
    el.className = 'cl-msg-row left msg-first msg-last';
    el.id = 'clTypingIndicator';
    el.style.opacity = '0.7';
    el.innerHTML = `
      <div class="cl-msg-avatar" style="background-image:url('${currentChatContact ? currentChatContact.avatar || '' : ''}')">
        <div class="cl-msg-avatar-check"><svg viewBox="0 0 24 24"><path d="M5 12l5 5L20 7"/></svg></div>
      </div>
      <div style="display:flex;align-items:center;gap:8px;">
        <div class="cl-msg-bubble" style="background:rgba(255,255,255,0.7);padding:10px 16px;">
          ${getTypingDotsHTML()}
        </div>
        <div id="clStopBtn" style="display:flex;align-items:center;gap:5px;padding:5px 12px;border-radius:8px;background:rgba(0,0,0,.2);border:1px solid rgba(255,255,255,.3);cursor:pointer;transition:all .15s;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);">
          <svg viewBox="0 0 24 24" style="width:11px;height:11px;fill:none;stroke:rgba(255,255,255,.65);stroke-width:2;stroke-linecap:round;"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>
          <span style="font-size:10px;color:rgba(255,255,255,.65);font-weight:600;letter-spacing:.2px;">Stop</span>
        </div>
      </div>
    `;
    container.appendChild(el);
    container.scrollTop = container.scrollHeight;

    // 停止按钮事件
    el.querySelector('#clStopBtn').addEventListener('click', (e) => {
      e.stopPropagation();
      if (_abortController) _abortController.abort();
      removeTypingIndicator();
    });

    if (!document.getElementById('clTypeDotStyle')) {
      const s = document.createElement('style');
      s.id = 'clTypeDotStyle';
      s.textContent = `
        @keyframes clTypeDot{0%,80%,100%{transform:scale(0.6);opacity:0.4;}40%{transform:scale(1);opacity:1;}}
        @keyframes clTypeWave{0%,100%{transform:translateY(0);}50%{transform:translateY(-6px);}}
        @keyframes clTypePulse{0%,100%{opacity:.3;transform:scaleY(.6);}50%{opacity:1;transform:scaleY(1);}}
        @keyframes clTypeBlink{0%,100%{opacity:1;}50%{opacity:0;}}
        @keyframes clTypeSpin{to{transform:rotate(360deg);}}
      `;
      document.head.appendChild(s);
    }
  }

  function removeTypingIndicator() {
    const el = document.getElementById('clTypingIndicator');
    if (el) el.parentNode.removeChild(el);
  }

  // ── 调用 API 获取 AI 回复 ──
  let _abortController = null;

  async function callApi(c, userText) {
    const cfg = await getApiConfig();
    if (!cfg.url || !cfg.key || !cfg.model) {
      appendAiMessage(c, '⚠️ 请先在 Settings → API 页配置 URL、Key 和模型');
      return;
    }

    showTypingIndicator();
    _abortController = new AbortController();

    try {
      const apiMessages = await buildApiMessages(c, userText);
      const baseUrl = cfg.url.replace(/\/+$/, '');
      const endpoint = /\/chat\/completions$/.test(baseUrl)
        ? baseUrl
        : (/\/v1$/.test(baseUrl) ? baseUrl + '/chat/completions' : baseUrl + '/v1/chat/completions');

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + cfg.key
        },
        signal: _abortController.signal,
        body: JSON.stringify({
          model: cfg.model,
          messages: apiMessages,
          temperature: parseFloat(cfg.temp) || 0.7,
          max_tokens: parseInt(cfg.maxTokens) || 4096,
          top_p: parseFloat(cfg.topP) || 1.0,
        })
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`HTTP ${res.status}: ${errText.substring(0, 80)}`);
      }

      const data = await res.json();
      const reply = data.choices?.[0]?.message?.content || '';

      removeTypingIndicator();

      if (reply.trim()) {
        let cleanReply = reply.trim();
        // 提取自动总结
        if (window.MemoryPage && window.MemoryPage.extractAutoSummary) {
          const hadSummary = /【记忆总结】/.test(cleanReply);
          if (hadSummary && window.MemoryPage.showCapsule) {
            window.MemoryPage.showCapsule('✦ 正在归档记忆…');
          }
          cleanReply = window.MemoryPage.extractAutoSummary(cleanReply, c.id, (c.messages || []).length);
          if (hadSummary && window.MemoryPage.capsuleDone) {
            window.MemoryPage.capsuleDone('✓ 记忆已归档');
          }
        }
        await appendAiMessage(c, cleanReply);
      } else {
        await appendAiMessage(c, '（AI 返回了空内容）');
      }
    } catch(err) {
      removeTypingIndicator();
      if (err.name === 'AbortError') return;
      await appendAiMessage(c, `⚠️ 请求失败：${err.message}`);
    } finally {
      _abortController = null;
    }
  }

  // ── 分割 AI 回复为多条消息（括号内旁白不断句） ──
  function splitAiReply(raw) {
    let text = (raw || '').trim();
    if (!text) return [];

    // 清理格式残留
    text = text.replace(/@@SPLIT@@/g, '\n');
    text = text.replace(/^\s*[\-\*•·]\s+/gm, '');
    text = text.replace(/^\s*\d+[\.\)、]\s*/gm, '');
    text = text.replace(/[ \t]+/g, ' ');

    // 括号感知分句：括号内的标点不作为断点
    function smartSplit(str) {
      const result = [];
      let buf = '';
      let depth = 0;
      for (let i = 0; i < str.length; i++) {
        const ch = str[i];
        buf += ch;
        if (ch === '（' || ch === '(') { depth++; continue; }
        if (ch === '）' || ch === ')') { if (depth > 0) depth--; continue; }
        if (depth === 0 && /[。！？!?…]/.test(ch)) {
          // 吃掉连续的句末标点
          while (i + 1 < str.length && /[。！？!?…]/.test(str[i + 1])) {
            buf += str[i + 1]; i++;
          }
          const s = buf.trim();
          if (s) result.push(s);
          buf = '';
        }
      }
      if (buf.trim()) result.push(buf.trim());
      return result.length > 0 ? result : [str];
    }

    // 先按换行分
    let parts = text.split(/\n+/).map(s => s.trim()).filter(Boolean);

    // 每段用括号感知分句
    const expanded = [];
    for (const p of parts) {
      if (p.length > 25) {
        const subs = smartSplit(p);
        for (const s of subs) {
          if (s.length > 50) {
            // 超长且不在括号里的，按逗号再切
            let depth2 = 0;
            let buf2 = '';
            const chunks = [];
            for (let i = 0; i < s.length; i++) {
              const ch = s[i];
              buf2 += ch;
              if (ch === '（' || ch === '(') depth2++;
              else if (ch === '）' || ch === ')') { if (depth2 > 0) depth2--; }
              else if (depth2 === 0 && /[，,；;]/.test(ch)) {
                const t = buf2.trim();
                if (t) chunks.push(t);
                buf2 = '';
              }
            }
            if (buf2.trim()) chunks.push(buf2.trim());
            if (chunks.length > 1) expanded.push(...chunks);
            else expanded.push(s);
          } else {
            expanded.push(s);
          }
        }
      } else {
        expanded.push(p);
      }
    }

    // 合并过短碎片
    const merged = [];
    for (let i = 0; i < expanded.length; i++) {
      const cur = expanded[i];
      if (cur.length <= 2 && i < expanded.length - 1 && !/^[嗯哦啊唔欸喵呜哈嗨]+[。？！…!?]?$/.test(cur)) {
        merged.push(cur + expanded[i + 1]);
        i++;
      } else {
        merged.push(cur);
      }
    }

    return merged;
  }

  // ── 逐条插入 AI 消息（带延迟，像真实打字） ──
  async function appendAiMessage(c, text) {
    if (!c.messages) c.messages = [];
    const parts = splitAiReply(text);

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];

      // 每条消息之间有延迟（模拟打字间隔）
      if (i > 0) {
        // 根据上一条长度决定延迟：短消息600ms，长消息最多1400ms
        const prevLen = parts[i - 1].length;
        const delay = Math.min(600 + prevLen * 18, 1400);
        await new Promise(r => setTimeout(r, delay));
      }

      c.messages.push({ id: genMsgId(), role: 'assistant', text: part, time: Date.now() });
      await dbPut(c);
      await renderMessages();
      // 给新气泡加入场动画
      const ctr = document.querySelector('.cl-chatroom-messages');
      if (ctr) {
        const rows = ctr.querySelectorAll('.cl-msg-row');
        const last = rows[rows.length - 1];
        if (last) { last.classList.add('msg-new'); setTimeout(() => last.classList.remove('msg-new'), 600); }
      }
    }

    renderChatList();
  }

  // ═══════════════════════════════════════════════════
  // 长按消息菜单（B=AI卫星环绕 / D=用户两列浮岛）
  // ═══════════════════════════════════════════════════

  let _lpTimer = null;
  let _lpMenuEl = null;
  let _lpTargetMsgId = null;

  function injectMsgMenuCSS() {
    if (document.getElementById('lpMenuStyles')) return;
    const s = document.createElement('style');
    s.id = 'lpMenuStyles';
    s.textContent = `
.lp-overlay{position:absolute;inset:0;z-index:500;background:rgba(0,0,0,0);transition:background 0.25s;pointer-events:none;}
.lp-overlay.show{background:rgba(0,0,0,0.1);pointer-events:auto;}
.lp-gsvg{fill:none;stroke:#1c1c1e;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round;}
.lp-gsvg.g{stroke:#999;}

/* A · 票根标签卡（AI消息） */
.lp-menu-a{position:absolute;z-index:561;background:#fff;border-radius:14px;box-shadow:0 10px 32px rgba(0,0,0,.2);overflow:hidden;width:160px;opacity:0;transform:scale(.9) translateY(8px);transition:opacity .25s,transform .3s cubic-bezier(.34,1.56,.64,1);}
.lp-overlay.show .lp-menu-a{opacity:1;transform:scale(1) translateY(0);}
.lp-menu-a .head{padding:8px 14px;background:#1c1c1e;display:flex;align-items:center;justify-content:space-between;}
.lp-menu-a .head span{font-size:8px;font-weight:800;letter-spacing:2px;color:#fff;text-transform:uppercase;}
.lp-menu-a .head .dots{display:flex;gap:3px;}
.lp-menu-a .head .dots i{width:4px;height:4px;border-radius:50%;background:rgba(255,255,255,.4);}
.lp-menu-a .notch{height:0;border-bottom:1px dashed rgba(0,0,0,.12);position:relative;}
.lp-menu-a .notch::before,.lp-menu-a .notch::after{content:'';position:absolute;top:-5px;width:10px;height:10px;border-radius:50%;background:rgba(0,0,0,.1);}
.lp-menu-a .notch::before{left:-5px;}
.lp-menu-a .notch::after{right:-5px;}
.lp-menu-a .it{display:flex;align-items:center;gap:11px;padding:11px 15px;cursor:pointer;}
.lp-menu-a .it:active{background:rgba(0,0,0,.04);}
.lp-menu-a .it svg{width:17px;height:17px;}
.lp-menu-a .it span{font-size:13px;color:#1c1c1e;font-weight:500;}
.lp-menu-a .it.danger span{color:#888;}

/* D · 邮票虚线卡（用户消息） */
.lp-menu-d{position:absolute;z-index:561;background:#fff;padding:6px;box-shadow:0 10px 32px rgba(0,0,0,.2);width:158px;border-radius:4px;opacity:0;transform:scale(.9) translateY(8px);transition:opacity .25s,transform .3s cubic-bezier(.34,1.56,.64,1);}
.lp-overlay.show .lp-menu-d{opacity:1;transform:scale(1) translateY(0);}
.lp-menu-d .inner{border:1.5px dashed rgba(0,0,0,.12);border-radius:3px;overflow:hidden;}
.lp-menu-d .it{display:flex;align-items:center;gap:10px;padding:10px 13px;cursor:pointer;}
.lp-menu-d .it+.it{border-top:1px dashed rgba(0,0,0,.1);}
.lp-menu-d .it:active{background:rgba(0,0,0,.04);}
.lp-menu-d .it svg{width:16px;height:16px;}
.lp-menu-d .it span{font-size:12px;color:#1c1c1e;font-weight:600;letter-spacing:.5px;}
.lp-menu-d .it.danger span{color:#888;}
.lp-menu-d .stamp{position:absolute;top:-8px;right:8px;width:22px;height:22px;border-radius:50%;background:#1c1c1e;display:flex;align-items:center;justify-content:center;}
.lp-menu-d .stamp svg{width:11px;height:11px;}

@keyframes lpMsgIn1{from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);}}
.msg-anim-1 .cl-msg-row.msg-new{animation:lpMsgIn1 0.35s cubic-bezier(0.22,1,0.36,1) both;}

@keyframes lpMsgIn2{from{opacity:0;transform:scale(0.3);}to{opacity:1;transform:scale(1);}}
.msg-anim-2 .cl-msg-row.msg-new.left{transform-origin:bottom left;animation:lpMsgIn2 0.4s cubic-bezier(0.34,1.56,0.64,1) both;}
.msg-anim-2 .cl-msg-row.msg-new.right{transform-origin:bottom right;animation:lpMsgIn2 0.4s cubic-bezier(0.34,1.56,0.64,1) both;}

@keyframes lpMsgIn3L{from{opacity:0;transform:translateX(-30px);}to{opacity:1;transform:translateX(0);}}
@keyframes lpMsgIn3R{from{opacity:0;transform:translateX(30px);}to{opacity:1;transform:translateX(0);}}
.msg-anim-3 .cl-msg-row.msg-new.left{animation:lpMsgIn3L 0.38s cubic-bezier(0.22,1,0.36,1) both;}
.msg-anim-3 .cl-msg-row.msg-new.right{animation:lpMsgIn3R 0.38s cubic-bezier(0.22,1,0.36,1) both;}

@keyframes lpMsgIn4{0%{opacity:0;transform:translateY(24px) scaleY(0.6) scaleX(1.1);}50%{opacity:1;transform:translateY(-3px) scaleY(1.06) scaleX(0.97);}75%{transform:translateY(1px) scaleY(0.98) scaleX(1.01);}100%{opacity:1;transform:translateY(0) scaleY(1) scaleX(1);}}
.msg-anim-4 .cl-msg-row.msg-new{transform-origin:bottom center;animation:lpMsgIn4 0.5s cubic-bezier(0.22,1,0.36,1) both;}

@keyframes lpMsgIn5Bub{from{opacity:0;transform:scale(0.92);}to{opacity:1;transform:scale(1);}}
@keyframes lpMsgIn5Blur{from{filter:blur(3px);opacity:0.4;}to{filter:blur(0);opacity:1;}}
.msg-anim-5 .cl-msg-row.msg-new{animation:lpMsgIn5Bub 0.25s ease both;}
.msg-anim-5 .cl-msg-row.msg-new .cl-msg-bubble{animation:lpMsgIn5Blur 0.45s ease both 0.12s;}

.multi-select-mode .ms-dot{position:absolute;right:-20px;top:50%;transform:translateY(-50%);width:16px;height:16px;border:none;border-radius:0;background:none;cursor:pointer;z-index:5;transition:all .15s;display:flex;align-items:center;justify-content:center;}
.multi-select-mode .ms-dot::before{content:'★';font-size:14px;color:transparent;-webkit-text-stroke:1.2px rgba(255,255,255,.5);transition:all .15s;}
.multi-select-mode .cl-msg-row.right .ms-dot{right:auto;left:-20px;}
.multi-select-mode .ms-selected .ms-dot::before{color:rgba(28,28,30,.8);-webkit-text-stroke:1.2px rgba(28,28,30,.9);}
.multi-select-mode .cl-msg-row{position:relative;}
.multi-select-mode .cl-narration-center{position:relative;}
.multi-select-mode .cl-narration-center .ms-dot{position:absolute;right:-28px;top:50%;transform:translateY(-50%);}
    `;
    document.head.appendChild(s);
  }

  function positionMenu(menuEl, anchorRect, chatroom) {
    if (!menuEl || !anchorRect || !chatroom) return;
    const crRect = chatroom.getBoundingClientRect();
    // 临时显示测尺寸
    menuEl.style.visibility = 'hidden';
    const mw = menuEl.offsetWidth || 160;
    const mh = menuEl.offsetHeight || 240;
    menuEl.style.visibility = '';
    let top = anchorRect.bottom - crRect.top + 8;
    // 下方放不下就放上方
    if (top + mh > crRect.height - 20) {
      top = anchorRect.top - crRect.top - mh - 8;
    }
    if (top < 10) top = 10;
    let left = anchorRect.left - crRect.left;
    if (left + mw > crRect.width - 12) left = crRect.width - mw - 12;
    if (left < 12) left = 12;
    menuEl.style.top = top + 'px';
    menuEl.style.left = left + 'px';
  }

  function closeMsgMenu() {
    if (!_lpMenuEl) return;
    const el = _lpMenuEl;
    _lpMenuEl = null;
    _lpTargetMsgId = null;
    el.style.pointerEvents = 'none';
    el.style.transition = 'opacity 0.18s ease';
    el.style.opacity = '0';
    setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el); }, 200);
  }

  function showMenuB(msgText, msgId, anchorRect) {
    closeMsgMenu();
    _lpTargetMsgId = msgId;
    const overlay = document.createElement('div');
    overlay.className = 'lp-overlay';
    overlay.innerHTML = `
      <div class="lp-menu-a">
        <div class="head"><span>Actions</span><div class="dots"><i></i><i></i><i></i></div></div>
        <div class="notch"></div>
        <div class="it" data-act="reply"><svg class="lp-gsvg" viewBox="0 0 24 24"><path d="M9 17l-5-5 5-5"/><path d="M20 18v-2a4 4 0 00-4-4H4"/></svg><span>回复</span></div>
        <div class="it" data-act="quote"><svg class="lp-gsvg" viewBox="0 0 24 24"><path d="M7 8h10M7 12h6"/><path d="M3 5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H9l-4 4z"/></svg><span>引用</span></div>
        <div class="it" data-act="edit"><svg class="lp-gsvg" viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4z"/></svg><span>编辑</span></div>
        <div class="it" data-act="retry"><svg class="lp-gsvg" viewBox="0 0 24 24"><path d="M3 12a9 9 0 0115-6.7L21 8"/><path d="M21 3v5h-5"/></svg><span>重试</span></div>
        <div class="it danger" data-act="delete"><svg class="lp-gsvg g" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg><span>删除</span></div>
      </div>
    `;
    const chatroom = document.getElementById('clChatroom');
    if (chatroom) chatroom.appendChild(overlay);
    _lpMenuEl = overlay;
    positionMenu(overlay.querySelector('.lp-menu-a'), anchorRect, chatroom);
    requestAnimationFrame(() => overlay.classList.add('show'));
    overlay.addEventListener('click', e => {
      e.stopPropagation();
      const btn = e.target.closest('[data-act]');
      if (btn) { handleMsgAction(btn.dataset.act, msgId); return; }
      closeMsgMenu();
    });
  }

  function showMenuD(msgText, msgId, anchorRect) {
    closeMsgMenu();
    _lpTargetMsgId = msgId;
    const overlay = document.createElement('div');
    overlay.className = 'lp-overlay';
    overlay.innerHTML = `
      <div class="lp-menu-d">
        <div class="stamp"><svg class="lp-gsvg" style="stroke:#fff;" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg></div>
        <div class="inner">
          <div class="it" data-act="reply"><svg class="lp-gsvg" viewBox="0 0 24 24"><path d="M9 17l-5-5 5-5"/><path d="M20 18v-2a4 4 0 00-4-4H4"/></svg><span>回复</span></div>
          <div class="it" data-act="quote"><svg class="lp-gsvg" viewBox="0 0 24 24"><path d="M7 8h10M7 12h6"/><path d="M3 5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H9l-4 4z"/></svg><span>引用</span></div>
          <div class="it" data-act="edit"><svg class="lp-gsvg" viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4z"/></svg><span>编辑</span></div>
          <div class="it" data-act="retry"><svg class="lp-gsvg" viewBox="0 0 24 24"><path d="M3 12a9 9 0 0115-6.7L21 8"/><path d="M21 3v5h-5"/></svg><span>重试</span></div>
          <div class="it danger" data-act="delete"><svg class="lp-gsvg g" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg><span>删除</span></div>
        </div>
      </div>
    `;
    const chatroom = document.getElementById('clChatroom');
    if (chatroom) chatroom.appendChild(overlay);
    _lpMenuEl = overlay;
    positionMenu(overlay.querySelector('.lp-menu-d'), anchorRect, chatroom);
    requestAnimationFrame(() => overlay.classList.add('show'));
    overlay.addEventListener('click', e => {
      e.stopPropagation();
      const btn = e.target.closest('[data-act]');
      if (btn) { handleMsgAction(btn.dataset.act, msgId); return; }
      closeMsgMenu();
    });
  }

  async function handleMsgAction(action, msgId) {
    if (!currentChatContact || !currentChatContact.messages) { closeMsgMenu(); return; }
    const msgs = currentChatContact.messages;
    const idx = msgs.findIndex(m => m.id === msgId);
    if (idx < 0) { closeMsgMenu(); return; }
    const msg = msgs[idx];
    const input = document.getElementById('clChatroomInput');

    switch (action) {
      case 'retry': {
        let userText = '';
        if (msg.role === 'assistant') {
          // 找到这条 AI 消息前面最近的 user 消息
          let userIdx = -1;
          for (let i = idx - 1; i >= 0; i--) {
            if (msgs[i].role === 'user') { userIdx = i; userText = msgs[i].text; break; }
          }
          // 删除该 user 之后的所有连续 assistant（整轮 AI 回复）
          let start = (userIdx >= 0) ? userIdx + 1 : idx;
          let end = start;
          while (end < msgs.length && msgs[end].role === 'assistant') end++;
          msgs.splice(start, end - start);
        } else {
          // user 消息重试：删掉这条后面连续的 assistant，重新请求
          userText = msg.text;
          let end = idx + 1;
          while (end < msgs.length && msgs[end].role === 'assistant') end++;
          if (end > idx + 1) msgs.splice(idx + 1, end - idx - 1);
        }
        await dbPut(currentChatContact);
        await renderMessages();
        renderChatList();
        closeMsgMenu();
        if (userText) await callApi(currentChatContact, userText);
        break;
      }
      case 'reply': {
        closeMsgMenu();
        if (input) {
          input.value = '';
          input.placeholder = `回复: ${msg.text.substring(0, 20)}${msg.text.length > 20 ? '…' : ''}`;
          input.focus();
          input.dataset.replyTo = msgId;
        }
        break;
      }
      case 'quote': {
        closeMsgMenu();
        if (input) {
          input.value = `「${msg.text.substring(0, 50)}${msg.text.length > 50 ? '…' : ''}」\n`;
          input.focus();
        }
        break;
      }
      case 'edit': {
        closeMsgMenu();
        if (input) {
          input.value = msg.text;
          input.focus();
          input.dataset.editId = msgId;
          input.placeholder = '编辑中… 发送覆盖';
        }
        break;
      }
      case 'delete': {
        msgs.splice(idx, 1);
        await dbPut(currentChatContact);
        await renderMessages();
        renderChatList();
        closeMsgMenu();
        break;
      }
    }
  }

  function initLongPress() {
    injectMsgMenuCSS();
    const container = document.querySelector('.cl-chatroom-messages');
    if (!container) return;
    let startX = 0, startY = 0;

    container.addEventListener('touchstart', e => {
      const row = e.target.closest('.cl-msg-row');
      if (!row) return;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      _lpTimer = setTimeout(() => {
        const msgId = row.dataset.msgId;
        if (!msgId || !currentChatContact) return;
        if (navigator.vibrate) navigator.vibrate(15);
        if (row.dataset.notice === '1') {
          showNoticeDelete(row, msgId);
          return;
        }
        const msg = (currentChatContact.messages || []).find(m => m.id === msgId);
        if (!msg) return;
        if (msg.role === 'system_notice') {
          showNoticeDelete(row, msgId);
          return;
        }
        const bubbleEl = row.querySelector('.cl-msg-bubble') || row;
        const rect = bubbleEl.getBoundingClientRect();
        if (msg.role === 'assistant') {
          showMenuB(msg.text, msgId, rect);
        } else {
          showMenuD(msg.text, msgId, rect);
        }
      }, 300);
    }, { passive: true });

    container.addEventListener('touchmove', e => {
      if (!_lpTimer) return;
      const dx = Math.abs(e.touches[0].clientX - startX);
      const dy = Math.abs(e.touches[0].clientY - startY);
      if (dx > 10 || dy > 10) { clearTimeout(_lpTimer); _lpTimer = null; }
    }, { passive: true });

    container.addEventListener('touchend', () => { if (_lpTimer) { clearTimeout(_lpTimer); _lpTimer = null; } }, { passive: true });
    container.addEventListener('touchcancel', () => { if (_lpTimer) { clearTimeout(_lpTimer); _lpTimer = null; } }, { passive: true });

    // PC端右键
    container.addEventListener('contextmenu', e => {
      const row = e.target.closest('.cl-msg-row');
      if (!row) return;
      e.preventDefault();
      const msgId = row.dataset.msgId;
      if (!msgId || !currentChatContact) return;
      const msg = (currentChatContact.messages || []).find(m => m.id === msgId);
      if (!msg) return;
      if (msg.role === 'system_notice') {
        showNoticeDelete(row, msgId);
        return;
      }
      const bubbleEl2 = row.querySelector('.cl-msg-bubble') || row;
      const rect2 = bubbleEl2.getBoundingClientRect();
      if (msg.role === 'assistant') {
        showMenuB(msg.text, msgId, rect2);
      } else {
        showMenuD(msg.text, msgId, rect2);
      }
    });
  }

  function showNoticeDelete(row, msgId) {
    const existing = row.querySelector('.notice-del-btn');
    if (existing) { existing.remove(); return; }
    const btn = document.createElement('div');
    btn.className = 'notice-del-btn';
    btn.style.cssText = 'position:absolute;right:-21px;top:50%;transform:translateY(-50%);width:20px;height:20px;border-radius:50%;background:rgba(0,0,0,.12);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:11px;color:rgba(0,0,0,.35);line-height:1;z-index:5;';
    btn.textContent = '×';
    row.appendChild(btn);
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      if (!currentChatContact || !currentChatContact.messages) return;
      const idx = currentChatContact.messages.findIndex(m => m.id === msgId);
      if (idx >= 0) {
        currentChatContact.messages.splice(idx, 1);
        await dbPut(currentChatContact);
        await renderMessages();
      }
    });
    setTimeout(() => { if (btn.parentNode) btn.remove(); }, 4000);
  }

  function setBubbleFontSize(px) {
    let s = document.getElementById('_bubbleFsStyle');
    if (!s) { s = document.createElement('style'); s.id = '_bubbleFsStyle'; document.head.appendChild(s); }
    s.textContent = `.cl-msg-bubble{font-size:${px}px!important;}`;
  }

  // ── 渲染分句：括号内不断句 ──
  function splitSentencesForRender(text) {
    if (!text) return [text];
    const result = [];
    let buf = '';
    let depth = 0;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      buf += ch;
      if (ch === '（' || ch === '(') { depth++; continue; }
      if (ch === '）' || ch === ')') { if (depth > 0) depth--; continue; }
      if (depth === 0 && /[。！？!?…]/.test(ch)) {
        while (i + 1 < text.length && /[。！？!?…]/.test(text[i + 1])) { buf += text[i + 1]; i++; }
        const s = buf.trim();
        if (s) result.push(s);
        buf = '';
      }
    }
    if (buf.trim()) result.push(buf.trim());
    if (result.length <= 1) {
      // 按换行再试
      const nlParts = text.split(/\n+/).map(s => s.trim()).filter(Boolean);
      if (nlParts.length > 1) return nlParts;
    }
    return result.length > 0 ? result : [text];
  }

  // ── 旁白渲染：检测（）内容，渲染为灰色斜体小字 ──
  function formatNarration(text) {
    if (!text) return '';
    const d = document.createElement('div');
    d.textContent = text;
    const escaped = d.innerHTML;
    if (!/[（(][^）)]{2,}[）)]/.test(escaped) && !/\*[^*\n]{2,}\*/.test(escaped)) return escaped;
    const ns = currentChatContact ? getNarrationSettings(currentChatContact) : { fontSize: '12px', italic: true, color: '#b0b0b0', placement: 'bubble' };
    const style = `font-size:${ns.fontSize};color:${ns.color};${ns.italic ? 'font-style:italic;' : ''}font-weight:400;`;
    if (ns.placement === 'center') {
      const textOnly = escaped
        .replace(/[（(][^）)]{2,}[）)]/g, '')
        .replace(/\*[^*\n]{2,}\*/g, '');
      return textOnly.trim() || escaped;
    }
    // 无论旁白开关，只要有括号就渲染样式（和星星项目一致）
    const html = escaped
      .replace(/[（(]([^）)]{2,})[）)]/g, `<span class="cl-narration" style="${style}">$1</span>`)
      .replace(/\*([^*\n]{2,})\*/g, `<span class="cl-narration" style="${style}">$1</span>`);
    return html;
  }

  // 提取旁白文本用于居中显示
  function extractNarrations(text) {
    if (!text) return [];
    const results = [];
    const re = /[（(]([^）)]{2,})[）)]|\*([^*\n]{2,})\*/g;
    let m;
    while ((m = re.exec(text)) !== null) {
      results.push(m[1] || m[2]);
    }
    return results;
  }

  // ══════════════════════════════════════
  // 旁白系统
  // ══════════════════════════════════════

  function getNarrationSettings(contact) {
    const def = { active: false, fontSize: '12px', italic: true, color: '#b0b0b0', minWords: 5, maxWords: 30, placement: 'bubble' };
    if (!contact) return def;
    return contact._narration ? { ...def, ...contact._narration } : def;
  }

  function setNarrationSettings(contact, settings) {
    if (!contact) return;
    contact._narration = settings;
    if (window.ContactsPage && window.ContactsPage.saveContact) {
      window.ContactsPage.saveContact(contact);
    }
  }

  // ══════════════════════════════════════
  // 照片发送系统
  // ══════════════════════════════════════
  const PHOTO_STYLES = ['b', 'c', 'd'];

  let _photoInput = null;
  function openPhotoPicker() {
    if (!_photoInput) {
      _photoInput = document.createElement('input');
      _photoInput.type = 'file';
      _photoInput.accept = 'image/*';
      _photoInput.multiple = true;
      _photoInput.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0;pointer-events:none;';
      document.body.appendChild(_photoInput);
      _photoInput.addEventListener('change', async () => {
        const files = Array.from(_photoInput.files || []);
        console.log('[Photo] files selected:', files.length);
        if (files.length === 0) return;
        for (let i = 0; i < files.length; i++) {
          const dataUrl = await fileToBase64(files[i]);
          console.log('[Photo] read file', i, dataUrl ? dataUrl.substring(0, 30) : 'null');
          if (dataUrl) await sendPhotoMessage(dataUrl);
        }
        _photoInput.value = '';
      });
    }
    _photoInput.value = '';
    _photoInput.click();
  }

  async function sendPhotoMessage(dataUrl) {
    if (!currentChatContact) { console.error('[Photo] no contact'); return; }
    if (!currentChatContact.messages) currentChatContact.messages = [];
    const style = PHOTO_STYLES[Math.floor(Math.random() * PHOTO_STYLES.length)];
    const msg = {
      id: genMsgId(),
      role: 'user',
      type: 'image',
      imageData: dataUrl,
      photoStyle: style,
      text: '[图片]',
      time: Date.now()
    };
    currentChatContact.messages.push(msg);
    console.log('[Photo] pushed msg, total:', currentChatContact.messages.length);
    try {
      await dbPut(currentChatContact);
      console.log('[Photo] dbPut ok');
    } catch(e) {
      console.error('[Photo] dbPut failed:', e);
    }
    await renderMessages();
    renderChatList();
    const container = document.querySelector('.cl-chatroom-messages');
    if (container) setTimeout(() => { container.scrollTop = container.scrollHeight; }, 50);
  }

  function renderPhotoHTML(m, side) {
    const style = m.photoStyle || PHOTO_STYLES[Math.floor(Math.random() * PHOTO_STYLES.length)];
    const src = m.imageData || '';
    if (style === 'b') {
      return `<div style="background:#0a0a0a;padding:10px 10px 28px;border-radius:2px;box-shadow:0 8px 30px rgba(0,0,0,.3);position:relative;max-width:210px;">
        <img src="${src}" style="width:100%;height:auto;max-height:200px;object-fit:cover;display:block;filter:contrast(1.08) saturate(.92);">
        <div style="position:absolute;bottom:7px;left:10px;right:10px;display:flex;justify-content:space-between;align-items:center;">
          <span style="font-size:7px;font-family:'Courier New',monospace;color:rgba(255,255,255,.2);letter-spacing:1px;">KODAK 400TX</span>
          <span style="font-size:7px;font-family:'Courier New',monospace;color:rgba(255,255,255,.2);letter-spacing:1px;">${new Date().getMonth()+1}/${new Date().getFullYear()}</span>
        </div>
      </div>`;
    } else if (style === 'c') {
      return `<div style="padding:5px;border:0.5px solid rgba(255,255,255,.3);border-radius:2px;background:transparent;position:relative;max-width:210px;">
        <div style="position:absolute;top:-1px;left:-1px;width:10px;height:10px;border-top:1.5px solid rgba(255,255,255,.5);border-left:1.5px solid rgba(255,255,255,.5);"></div>
        <div style="position:absolute;top:-1px;right:-1px;width:10px;height:10px;border-top:1.5px solid rgba(255,255,255,.5);border-right:1.5px solid rgba(255,255,255,.5);"></div>
        <div style="position:absolute;bottom:-1px;left:-1px;width:10px;height:10px;border-bottom:1.5px solid rgba(255,255,255,.5);border-left:1.5px solid rgba(255,255,255,.5);"></div>
        <div style="position:absolute;bottom:-1px;right:-1px;width:10px;height:10px;border-bottom:1.5px solid rgba(255,255,255,.5);border-right:1.5px solid rgba(255,255,255,.5);"></div>
        <img src="${src}" style="width:100%;height:auto;max-height:200px;object-fit:cover;display:block;">
        <div style="position:absolute;bottom:-16px;right:0;font-size:7px;color:rgba(255,255,255,.25);font-family:'Courier New',monospace;letter-spacing:2px;">PROOF</div>
      </div>`;
    } else {
      return `<div style="border-radius:0;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.2);position:relative;max-width:210px;">
        <img src="${src}" style="width:100%;height:auto;max-height:260px;object-fit:cover;display:block;">
        <div style="position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.4) 0%,transparent 40%);pointer-events:none;"></div>
        <div style="position:absolute;top:8px;left:8px;right:8px;bottom:8px;border:0.5px solid rgba(255,255,255,.2);pointer-events:none;"></div>
        <div style="position:absolute;bottom:10px;left:10px;right:10px;z-index:2;">
          <div style="font-size:6px;font-weight:700;color:rgba(255,255,255,.4);letter-spacing:4px;text-transform:uppercase;margin-bottom:2px;">EDITORIAL</div>
          <div style="font-size:9px;font-weight:300;color:rgba(255,255,255,.7);letter-spacing:1px;font-style:italic;">moments in silence</div>
        </div>
      </div>`;
    }
  }

  // ══════════════════════════════════════
  // 多选删除系统
  // ══════════════════════════════════════
  let _multiSelectActive = false;

  function enterMultiSelectMode() {
    if (!currentChatContact) return;
    _multiSelectActive = true;
    const container = document.querySelector('.cl-chatroom-messages');
    if (!container) return;
    container.classList.add('multi-select-mode');

    // 给每条消息加选择圆点
    container.querySelectorAll('.cl-msg-row').forEach(row => {
      if (row.querySelector('.ms-dot')) return;
      const dot = document.createElement('div');
      dot.className = 'ms-dot';
      dot.addEventListener('click', (e) => { e.stopPropagation(); row.classList.toggle('ms-selected'); updateMultiBar(); });
      row.appendChild(dot);
    });

    // 给居中旁白加选择圆点
    container.querySelectorAll('.cl-narration-center').forEach(el => {
      if (el.querySelector('.ms-dot')) return;
      const dot = document.createElement('div');
      dot.className = 'ms-dot';
      dot.addEventListener('click', (e) => { e.stopPropagation(); el.classList.toggle('ms-selected'); updateMultiBar(); });
      el.appendChild(dot);
    });

    showMultiBar();
  }

  function showMultiBar() {
    if (document.getElementById('clMultiBar')) return;
    const bar = document.createElement('div');
    bar.id = 'clMultiBar';
    bar.style.cssText = 'position:absolute;bottom:24px;left:14px;right:14px;z-index:60;display:flex;align-items:center;justify-content:space-between;padding:10px 16px;border-radius:16px;background:rgba(0,0,0,.7);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,.15);';
    bar.innerHTML = `
      <span id="clMultiCount" style="font-size:12px;color:rgba(255,255,255,.8);font-weight:600;">已选 0</span>
      <div style="display:flex;gap:8px;">
        <div id="clMultiCancel" style="padding:7px 14px;border-radius:10px;background:rgba(255,255,255,.12);font-size:11px;color:rgba(255,255,255,.7);font-weight:600;cursor:pointer;">取消</div>
        <div id="clMultiDel" style="padding:7px 14px;border-radius:10px;background:rgba(220,60,60,.8);font-size:11px;color:#fff;font-weight:700;cursor:pointer;">删除</div>
      </div>
    `;
    const chatroom = document.getElementById('clChatroom');
    if (chatroom) chatroom.appendChild(bar);
    bar.querySelector('#clMultiCancel').addEventListener('click', exitMultiSelectMode);
    bar.querySelector('#clMultiDel').addEventListener('click', deleteSelected);
  }

  function updateMultiBar() {
    const container = document.querySelector('.cl-chatroom-messages');
    if (!container) return;
    const count = container.querySelectorAll('.ms-selected').length;
    const el = document.getElementById('clMultiCount');
    if (el) el.textContent = '已选 ' + count;
  }

  function exitMultiSelectMode() {
    _multiSelectActive = false;
    const container = document.querySelector('.cl-chatroom-messages');
    if (!container) return;
    container.classList.remove('multi-select-mode');
    container.querySelectorAll('.ms-dot').forEach(d => d.remove());
    container.querySelectorAll('.ms-selected').forEach(el => el.classList.remove('ms-selected'));
    const bar = document.getElementById('clMultiBar');
    if (bar) bar.remove();
  }

  async function deleteSelected() {
    if (!currentChatContact) { exitMultiSelectMode(); return; }
    const container = document.querySelector('.cl-chatroom-messages');
    if (!container) { exitMultiSelectMode(); return; }

    const selectedRows = container.querySelectorAll('.cl-msg-row.ms-selected');
    const selectedNarrations = container.querySelectorAll('.cl-narration-center.ms-selected');

    // 收集要删除的消息 ID
    const msgIdsToDelete = new Set();
    selectedRows.forEach(row => {
      const id = row.dataset.msgId;
      if (id) msgIdsToDelete.add(id);
    });

    // 从数据中删除
    if (msgIdsToDelete.size > 0 && currentChatContact.messages) {
      currentChatContact.messages = currentChatContact.messages.filter(m => !msgIdsToDelete.has(m.id));
      await dbPut(currentChatContact);
    }

    // 从 DOM 删除选中的行
    selectedRows.forEach(row => row.remove());
    selectedNarrations.forEach(el => el.remove());

    exitMultiSelectMode();
    renderChatList();
  }

  function showNarrationModal() {
    if (!currentChatContact) return;
    const existing = document.getElementById('clNarrationModal');
    if (existing) existing.remove();

    const ns = getNarrationSettings(currentChatContact);

    const modal = document.createElement('div');
    modal.id = 'clNarrationModal';
    modal.style.cssText = 'position:absolute;inset:0;z-index:400;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0);transition:background .25s;';

    modal.innerHTML = `
      <div id="clNrBox" style="width:76%;max-width:290px;background:rgba(255,255,255,.88);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border:1.5px solid rgba(255,255,255,.9);border-radius:28px;padding:24px 22px 20px;box-shadow:0 16px 50px rgba(0,0,0,.12);transform:scale(.92);opacity:0;transition:transform .3s cubic-bezier(.34,1.56,.64,1),opacity .25s;">
        <div style="text-align:center;margin-bottom:18px;">
          <svg viewBox="0 0 24 24" style="width:24px;height:24px;fill:none;stroke:#555;stroke-width:1.5;stroke-linecap:round;margin-bottom:6px;"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>
          <div style="font-size:15px;font-weight:800;color:#1c1c1c;">旁白设置</div>
          <div style="font-size:9px;color:#bbb;font-style:normal;margin-top:3px;">narration · 穿插动作与心理描写</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:0;">
          <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid rgba(0,0,0,.05);">
            <span style="font-size:11px;color:#666;font-weight:600;">字体大小</span>
            <select id="nrFontSize" style="font-size:10px;padding:5px 10px;border-radius:8px;border:none;background:rgba(0,0,0,.04);color:#666;outline:none;">
              <option value="10px"${ns.fontSize==='10px'?' selected':''}>极小</option>
              <option value="12px"${ns.fontSize==='12px'?' selected':''}>小 (默认)</option>
              <option value="14px"${ns.fontSize==='14px'?' selected':''}>标准</option>
            </select>
          </div>
          <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid rgba(0,0,0,.05);">
            <span style="font-size:11px;color:#666;font-weight:600;">斜体</span>
            <div id="nrItalic" style="width:36px;height:20px;border-radius:10px;background:${ns.italic?'#1c1c1c':'#ededf2'};border:1px solid ${ns.italic?'#1c1c1c':'#dddde3'};position:relative;cursor:pointer;transition:background .2s,border-color .2s;"><div style="position:absolute;top:2px;left:${ns.italic?'18px':'2px'};width:14px;height:14px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.12);transition:left .2s;"></div></div>
          </div>
          <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid rgba(0,0,0,.05);">
            <span style="font-size:11px;color:#666;font-weight:600;">颜色</span>
            <input type="color" id="nrColor" value="${ns.color}" style="width:28px;height:22px;border:none;background:none;cursor:pointer;border-radius:4px;">
          </div>
          <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid rgba(0,0,0,.05);">
            <span style="font-size:11px;color:#666;font-weight:600;">字数范围</span>
            <div style="display:flex;align-items:center;gap:4px;">
              <input type="number" id="nrMin" value="${ns.minWords}" min="2" max="50" style="width:38px;height:24px;border-radius:6px;border:none;background:rgba(0,0,0,.04);text-align:center;font-size:10px;color:#666;outline:none;">
              <span style="color:#ccc;font-size:10px;">~</span>
              <input type="number" id="nrMax" value="${ns.maxWords}" min="5" max="200" style="width:38px;height:24px;border-radius:6px;border:none;background:rgba(0,0,0,.04);text-align:center;font-size:10px;color:#666;outline:none;">
            </div>
          </div>
          <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;">
            <span style="font-size:11px;color:#666;font-weight:600;">显示位置</span>
            <select id="nrPlacement" style="font-size:10px;padding:5px 10px;border-radius:8px;border:none;background:rgba(0,0,0,.04);color:#666;outline:none;">
              <option value="bubble"${(ns.placement||'bubble')==='bubble'?' selected':''}>气泡内</option>
              <option value="center"${ns.placement==='center'?' selected':''}>屏幕居中</option>
            </select>
          </div>
        </div>
        <div style="display:flex;gap:8px;margin-top:16px;">
          <div id="nrCancel" style="flex:1;height:40px;border-radius:20px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:#aaa;background:rgba(0,0,0,.04);cursor:pointer;">取消</div>
          <div id="nrToggle" style="flex:1;height:40px;border-radius:20px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:#fff;background:${ns.active?'#e89090':'#1c1c1c'};box-shadow:0 3px 12px rgba(0,0,0,.12);cursor:pointer;">${ns.active?'关闭旁白':'开启旁白'}</div>
        </div>
      </div>
    `;

    const chatroom = document.getElementById('clChatroom');
    if (chatroom) chatroom.appendChild(modal);

    requestAnimationFrame(() => {
      modal.style.background = 'rgba(0,0,0,.32)';
      modal.querySelector('#clNrBox').style.transform = 'scale(1)';
      modal.querySelector('#clNrBox').style.opacity = '1';
    });

    function closeModal() {
      modal.style.background = 'rgba(0,0,0,0)';
      const box = modal.querySelector('#clNrBox');
      if (box) { box.style.transform = 'scale(.92)'; box.style.opacity = '0'; }
      setTimeout(() => { if (modal.parentNode) modal.remove(); }, 280);
    }

    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
    modal.querySelector('#nrCancel').addEventListener('click', closeModal);

    // 斜体开关
    modal.querySelector('#nrItalic').addEventListener('click', function() {
      const dot = this.querySelector('div');
      const isOn = dot.style.left === '18px';
      if (isOn) {
        dot.style.left = '2px';
        this.style.background = '#ededf2';
        this.style.borderColor = '#dddde3';
      } else {
        dot.style.left = '18px';
        this.style.background = '#1c1c1c';
        this.style.borderColor = '#1c1c1c';
      }
    });

    modal.querySelector('#nrToggle').addEventListener('click', () => {
      const italicEl = modal.querySelector('#nrItalic');
      const italicDot = italicEl.querySelector('div');
      const newSettings = {
        active: !ns.active,
        fontSize: modal.querySelector('#nrFontSize').value,
        italic: italicDot.style.left === '18px',
        color: modal.querySelector('#nrColor').value,
        minWords: parseInt(modal.querySelector('#nrMin').value) || 5,
        maxWords: parseInt(modal.querySelector('#nrMax').value) || 30,
        placement: modal.querySelector('#nrPlacement').value || 'bubble'
      };
      setNarrationSettings(currentChatContact, newSettings);
      closeModal();
      renderMessages();
      const container = document.querySelector('.cl-chatroom-messages');
      if (container) {
        const notice = document.createElement('div');
        notice.style.cssText = 'align-self:center;margin:10px auto 4px;padding:4px 12px;border-radius:999px;border:1px solid rgba(0,0,0,.18);font-size:9px;color:rgba(0,0,0,.35);font-weight:500;text-align:center;letter-spacing:.3px;opacity:0;transform:translateY(6px);transition:opacity .35s ease,transform .35s ease;';
        notice.textContent = newSettings.active ? '✦ 旁白模式已开启' : '旁白模式已关闭';
        container.appendChild(notice);
        container.scrollTop = container.scrollHeight;
        requestAnimationFrame(() => { notice.style.opacity = '1'; notice.style.transform = 'translateY(0)'; });
        setTimeout(() => {
          notice.style.opacity = '0';
          notice.style.transform = 'translateY(-4px)';
          setTimeout(() => { if (notice.parentNode) notice.remove(); }, 350);
        }, 3000);
      }
    });
  }

  // ── 时间感知系统 ──
  function buildTimeAwareInject(c) {
    if (!c) return '';
    // 检查时间感知开关（在聊天室设置的偏好里）
    if (!c.timeAware) return '';
    const now = new Date();
    const y = now.getFullYear();
    const mon = now.getMonth() + 1;
    const day = now.getDate();
    const h = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    const weekDays = ['星期日','星期一','星期二','星期三','星期四','星期五','星期六'];
    const week = weekDays[now.getDay()];

    // 时间段判定
    const hour = now.getHours();
    let period = '';
    if (hour >= 0 && hour < 5) period = '凌晨（深夜）';
    else if (hour >= 5 && hour < 8) period = '清晨';
    else if (hour >= 8 && hour < 12) period = '上午';
    else if (hour >= 12 && hour < 14) period = '中午';
    else if (hour >= 14 && hour < 18) period = '下午';
    else if (hour >= 18 && hour < 21) period = '傍晚/晚上';
    else period = '深夜';

    let text = `[时间感知——当前真实时间]
现在是 ${y}年${mon}月${day}日 ${week} ${h}:${min}，时段：${period}。`;

    // 计算与上一条消息的间隔
    const msgs = c.messages || [];
    if (msgs.length >= 2) {
      // 找最近一条 AI 消息的时间
      let lastAiTime = null;
      let lastUserTime = null;
      for (let i = msgs.length - 1; i >= 0; i--) {
        if (!lastUserTime && msgs[i].role === 'user' && msgs[i].time) {
          lastUserTime = msgs[i].time;
        }
        if (!lastAiTime && msgs[i].role === 'assistant' && msgs[i].time) {
          lastAiTime = msgs[i].time;
        }
        if (lastUserTime && lastAiTime) break;
      }

      if (lastAiTime && lastUserTime) {
        const aiDate = new Date(lastAiTime);
        const userDate = new Date(lastUserTime);

        // 用户回复间隔（用户最新消息 vs AI上次回复）
        if (userDate > aiDate) {
          const gapMs = userDate.getTime() - aiDate.getTime();
          const gapMins = Math.floor(gapMs / 60000);
          const gapHours = Math.floor(gapMins / 60);
          const gapDays = Math.floor(gapHours / 24);

          if (gapDays >= 1) {
            text += `\n用户在你上次回复后过了 ${gapDays} 天才给你发消息。隔了很久，你可以自然地表达注意到了（比如"好久没找我""去哪了"等，根据你的性格决定反应）。`;
          } else if (gapHours >= 3) {
            text += `\n用户在你上次回复后过了 ${gapHours} 小时才回你。隔了挺久，你可以自然地感知并做出反应。`;
          } else if (gapHours >= 1) {
            text += `\n用户在你上次回复后过了约 ${gapHours} 小时回你。回复稍慢，你可以自然感知但不必每次都提。`;
          } else if (gapMins >= 10) {
            text += `\n用户过了 ${gapMins} 分钟才回你。`;
          }
        }

        // AI 自己的"上次回复时间"
        const aiTimeStr = `${aiDate.getHours()}:${String(aiDate.getMinutes()).padStart(2,'0')}`;
        const userTimeStr = `${userDate.getHours()}:${String(userDate.getMinutes()).padStart(2,'0')}`;
        text += `\n你上次回复时间：${aiTimeStr}。用户最新消息时间：${userTimeStr}。`;
      }
    }

    // 场景氛围提示
    text += `\n\n[时间氛围指令]
你能感知真实时间流逝。根据时段自然调整语气和行为：
- 凌晨/深夜：困倦、声音轻、语气软，可以问对方怎么还不睡
- 清晨/上午：刚醒的状态，可以发起早安话题
- 中午：随意，可以聊吃了什么
- 傍晚/晚上：放松，话题可以更私人
- 如果对方很久没回你：可以表现出想念、在意、或假装不在意（取决于性格）
- 如果对方秒回：可以感知到对方在认真聊天
注意：不要在回复中直接说出具体时间数字（如"现在22:30"），用自然的方式表达时间感知（如"这么晚了""你今天回得好快"）。`;

    return text;
  }

  // ── 旁白 prompt 注入（在 buildSystemPrompt 里调用） ──
  function getNarrationPromptInject(contact) {
    const ns = getNarrationSettings(contact);
    if (ns.active) {
      return `[旁白格式——硬性规则]\n1. 对话文字直接写，旁白用中文括号（）包裹，二者交替出现在同一段里。\n2. 正确示范：你怎么了？（他皱了皱眉，伸手碰了碰你的额头。）没事……就是有点累。\n3. 错误示范（禁止）：*他看着你* / 用星号或引号\n4. 旁白长度：每处旁白${ns.minWords}~${ns.maxWords}字，每条回复穿插2~3处旁白。\n5. 整条回复是一整段连续文字，对话和（旁白）自然穿插，不分行。`;
    } else {
      return `[格式规则——硬性]\n禁止使用：括号旁白（）、星号*动作*、动作描写、环境描写、心理描写。\n只输出角色说的话，纯对话，不加任何修饰。`;
    }
  }

  function genMsgId() {
    return 'msg_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 9);
  }

  async function sendMessage(text) {
    if (!currentChatContact || !text.trim()) return;
    if (!currentChatContact.messages) currentChatContact.messages = [];

    currentChatContact.messages.push({
      id: genMsgId(),
      role: 'user',
      text: text.trim(),
      time: Date.now()
    });

    await dbPut(currentChatContact);
    await renderMessages();
    renderChatList();
    // 给最后一条消息加入场动画
    const container = document.querySelector('.cl-chatroom-messages');
    if (container) {
      const lastRow = container.querySelector('.cl-msg-row:last-of-type');
      if (lastRow) { lastRow.classList.add('msg-new'); setTimeout(() => lastRow.classList.remove('msg-new'), 600); }
    }
  }

  // 聊天室发送按钮绑定（在 init 里调用）
  function initChatroomSend() {
    const sendBtn = document.querySelector('.cl-crb-send');
    const wandBtn = document.querySelector('.cl-crb-wand');
    const midEl = document.querySelector('.cl-crb-mid span');
    if (!sendBtn || !midEl) return;

    // 把 span 换成 input
    const input = document.createElement('input');
    input.id = 'clChatroomInput';
    input.type = 'text';
    input.placeholder = 'iMessage…';
    input.style.cssText = 'flex:1;font-size:14px;color:#1c1c1c;border:none;outline:none;background:transparent;';
    midEl.replaceWith(input);

    // 加号菜单
    const plusBtn = document.querySelector('.cl-crb-plus');
    if (plusBtn) {
      let plusMenuOpen = false;
      let plusMenuEl = null;

      plusBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (plusMenuOpen) { closePlusMenu(); return; }
        openPlusMenu();
      });

      function openPlusMenu() {
        if (plusMenuEl) return;
        plusMenuOpen = true;
        plusMenuEl = document.createElement('div');
        plusMenuEl.id = 'clPlusMenu';
        plusMenuEl.style.cssText = 'position:absolute;bottom:76px;left:14px;right:14px;z-index:60;border:1.5px solid rgba(255,255,255,.3);border-radius:20px;padding:18px 14px 14px;background:rgba(255,255,255,.45);opacity:0;transform:translateY(12px);transition:opacity .3s ease,transform .3s cubic-bezier(.34,1.56,.64,1);';
        plusMenuEl.innerHTML = `
          <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px 8px;">
            <div class="pm-item" data-act="photo" style="display:flex;flex-direction:column;align-items:center;gap:8px;cursor:pointer;">
              <div style="width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,.7);border:1.5px solid rgba(255,255,255,.8)
;display:flex;align-items:center;justify-content:center;transition:background .15s;"><svg viewBox="0 0 24 24" style="width:18px;height:18px;fill:none;stroke:#555
;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round;"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg></div>
              <span style="font-size:9px;color:#444
;font-weight:600;text-align:center;">图片</span>
            </div>
            <div class="pm-item" data-act="textphoto" style="display:flex;flex-direction:column;align-items:center;gap:8px;cursor:pointer;">
              <div style="width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,.7);border:1.5px solid rgba(255,255,255,.8)
;display:flex;align-items:center;justify-content:center;transition:background .15s;"><svg viewBox="0 0 24 24" style="width:18px;height:18px;fill:none;stroke:#555
;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round;"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M9 15h6M9 11h2"/></svg></div>
              <span style="font-size:9px;color:#444
;font-weight:600;text-align:center;">文字照片</span>
            </div>
            <div class="pm-item" data-act="voice" style="display:flex;flex-direction:column;align-items:center;gap:8px;cursor:pointer;">
              <div style="width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,.7);border:1.5px solid rgba(255,255,255,.8)
;display:flex;align-items:center;justify-content:center;transition:background .15s;"><svg viewBox="0 0 24 24" style="width:18px;height:18px;fill:none;stroke:#555
;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round;"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg></div>
              <span style="font-size:9px;color:#444
;font-weight:600;text-align:center;">语音通话</span>
            </div>
            <div class="pm-item" data-act="video" style="display:flex;flex-direction:column;align-items:center;gap:8px;cursor:pointer;">
              <div style="width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,.7);border:1.5px solid rgba(255,255,255,.8)
;display:flex;align-items:center;justify-content:center;transition:background .15s;"><svg viewBox="0 0 24 24" style="width:18px;height:18px;fill:none;stroke:#555
;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round;"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg></div>
              <span style="font-size:9px;color:#444
;font-weight:600;text-align:center;">视频通话</span>
            </div>
            <div class="pm-item" data-act="delivery" style="display:flex;flex-direction:column;align-items:center;gap:8px;cursor:pointer;">
              <div style="width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,.7);border:1.5px solid rgba(255,255,255,.8)
;display:flex;align-items:center;justify-content:center;transition:background .15s;"><svg viewBox="0 0 24 24" style="width:18px;height:18px;fill:none;stroke:#555
;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round;"><circle cx="12" cy="12" r="9"/><path d="M12 8v4l3 3"/><path d="M16.5 3.5L18 2M7.5 3.5L6 2"/></svg></div>
              <span style="font-size:9px;color:#444
;font-weight:600;text-align:center;">外卖</span>
            </div>
            <div class="pm-item" data-act="listen" style="display:flex;flex-direction:column;align-items:center;gap:8px;cursor:pointer;">
              <div style="width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,.7);border:1.5px solid rgba(255,255,255,.8)
;display:flex;align-items:center;justify-content:center;transition:background .15s;"><svg viewBox="0 0 24 24" style="width:18px;height:18px;fill:none;stroke:#555
;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round;"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg></div>
              <span style="font-size:9px;color:#444
;font-weight:600;text-align:center;">一起听</span>
            </div>
            <div class="pm-item" data-act="watch" style="display:flex;flex-direction:column;align-items:center;gap:8px;cursor:pointer;">
              <div style="width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,.7);border:1.5px solid rgba(255,255,255,.8)
;display:flex;align-items:center;justify-content:center;transition:background .15s;"><svg viewBox="0 0 24 24" style="width:18px;height:18px;fill:none;stroke:#555
;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round;"><rect x="2" y="4" width="20" height="14" rx="2"/><path d="M2 18h20"/><path d="M10 9l5 3-5 3V9z"/></svg></div>
              <span style="font-size:9px;color:#444
;font-weight:600;text-align:center;">一起看</span>
            </div>
            <div class="pm-item" data-act="emoji" style="display:flex;flex-direction:column;align-items:center;gap:8px;cursor:pointer;">
              <div style="width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,.7);border:1.5px solid rgba(255,255,255,.8);display:flex;align-items:center;justify-content:center;transition:background .15s;"><svg viewBox="0 0 24 24" style="width:18px;height:18px;fill:none;stroke:#555;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round;"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg></div>
              <span style="font-size:9px;color:#444;font-weight:600;text-align:center;">表情</span>
            </div>
            <div class="pm-item" data-act="narration" style="display:flex;flex-direction:column;align-items:center;gap:8px;cursor:pointer;">
              <div style="width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,.7);border:1.5px solid rgba(255,255,255,.8);display:flex;align-items:center;justify-content:center;transition:background .15s;"><svg viewBox="0 0 24 24" style="width:18px;height:18px;fill:none;stroke:#555;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round;"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/><line x1="8" y1="7" x2="16" y2="7" opacity=".5"/><line x1="8" y1="11" x2="14" y2="11" opacity=".4"/></svg></div>
              <span style="font-size:9px;color:#444;font-weight:600;text-align:center;">旁白</span>
            </div>
            <div class="pm-item" data-act="multiselect" style="display:flex;flex-direction:column;align-items:center;gap:8px;cursor:pointer;">
              <div style="width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,.7);border:1.5px solid rgba(255,255,255,.8);display:flex;align-items:center;justify-content:center;transition:background .15s;"><svg viewBox="0 0 24 24" style="width:18px;height:18px;fill:none;stroke:#555;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round;"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg></div>
              <span style="font-size:9px;color:#444;font-weight:600;text-align:center;">多选</span>
            </div>
          </div>
        `;
        const chatroom = document.getElementById('clChatroom');
        if (chatroom) chatroom.appendChild(plusMenuEl);
        requestAnimationFrame(() => { plusMenuEl.style.opacity = '1'; plusMenuEl.style.transform = 'translateY(0)'; });

        plusMenuEl.addEventListener('click', (ev) => {
          ev.stopPropagation();
          const item = ev.target.closest('.pm-item');
          if (!item) return;
          if (item.dataset.act === 'narration') {
            closePlusMenu();
            showNarrationModal();
            return;
          }
          if (item.dataset.act === 'multiselect') {
            closePlusMenu();
            enterMultiSelectMode();
            return;
          }
          if (item.dataset.act === 'photo') {
            const inp = document.createElement('input');
            inp.type = 'file';
            inp.accept = 'image/*';
            inp.multiple = true;
            inp.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0;';
            document.body.appendChild(inp);
            inp.addEventListener('change', async () => {
              const files = Array.from(inp.files || []);
              inp.remove();
              if (files.length === 0) return;
              for (let i = 0; i < files.length; i++) {
                const dataUrl = await fileToBase64(files[i]);
                if (dataUrl) await sendPhotoMessage(dataUrl);
              }
            });
            inp.click();
            closePlusMenu();
            return;
          }
          closePlusMenu();
        });

        setTimeout(() => {
          document.addEventListener('click', closePlusMenuOnce, { once: true });
        }, 50);
      }

      function closePlusMenuOnce() { closePlusMenu(); }

      function closePlusMenu() {
        if (!plusMenuEl) return;
        plusMenuOpen = false;
        plusMenuEl.style.opacity = '0';
        plusMenuEl.style.transform = 'translateY(12px)';
        const el = plusMenuEl;
        plusMenuEl = null;
        setTimeout(() => { if (el.parentNode) el.remove(); }, 300);
        document.removeEventListener('click', closePlusMenuOnce);
      }
    }

    // 发送键：发用户消息 + 自动 AI 回复
    sendBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const val = input.value.trim();
      if (val) {
        sendMessage(val);
        input.value = '';
      }
    });

    // 调取件（魔法棒）：只触发 AI 回复，不发用户消息
    if (wandBtn) {
      wandBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (!currentChatContact) return;
        const val = input.value.trim();
        if (val) {
          await sendMessage(val);
          input.value = '';
          await callApi(currentChatContact, val);
        } else {
          await callApi(currentChatContact, '（请继续）');
        }
      });
    }

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const val = input.value.trim();
        if (!val) return;
        // 编辑模式：覆盖原消息
        if (input.dataset.editId) {
          const editId = input.dataset.editId;
          delete input.dataset.editId;
          input.placeholder = 'iMessage';
          if (currentChatContact && currentChatContact.messages) {
            const m = currentChatContact.messages.find(x => x.id === editId);
            if (m) { m.text = val; dbPut(currentChatContact).then(() => { renderMessages(); renderChatList(); }); }
          }
          input.value = '';
          return;
        }
        // 回复模式：清除回复标记
        if (input.dataset.replyTo) { delete input.dataset.replyTo; input.placeholder = 'iMessage'; }
        sendMessage(val);
        input.value = '';
      }
    });

    // 发送按钮也处理编辑模式
    const origSendHandler = sendBtn.onclick;
    sendBtn.onclick = null;
    sendBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const val = input.value.trim();
      if (!val) return;
      if (input.dataset.editId) {
        const editId = input.dataset.editId;
        delete input.dataset.editId;
        input.placeholder = 'iMessage';
        if (currentChatContact && currentChatContact.messages) {
          const m = currentChatContact.messages.find(x => x.id === editId);
          if (m) { m.text = val; dbPut(currentChatContact).then(() => { renderMessages(); renderChatList(); }); }
        }
        input.value = '';
        return;
      }
      if (input.dataset.replyTo) { delete input.dataset.replyTo; input.placeholder = 'iMessage'; }
      sendMessage(val);
      input.value = '';
    });

    // 初始化长按菜单
    initLongPress();
  }

  // 暴露保存方法给聊天室设置页调用
  async function saveContact(contact) {
    if (!contact) return;
    const idx = contacts.findIndex(c => c.id === contact.id);
    if (idx >= 0) contacts[idx] = contact;
    await dbPut(contact);
    renderGrid();
    renderChatList();
    if (currentDetailId === contact.id) {
      openDetail(contact);
    }
  }

  // 清空指定联系人的聊天记录（供设置页调用）
  async function clearContactMessages(contactId) {
    const c = contacts.find(x => x.id === contactId);
    if (!c) return;
    c.messages = [];
    await dbPut(c);
    if (currentChatContact && currentChatContact.id === contactId) {
      currentChatContact.messages = [];
      await renderMessages();
    }
    renderChatList();
  }

  function exposeRender() {
    window._rerenderChatMessages = renderMessages;
  }

  return { init, renderChatList, saveContact, clearContactMessages, exposeRender };
})();

window.addEventListener('DOMContentLoaded', () => {
  window.ContactsPage = ContactsPage;
  ContactsPage.init();
});
