// ==========================================
// Memory 记忆库系统
// ==========================================

const MemoryPage = (() => {
  let memPage = null;
  let currentContactId = null;
  let memories = [];

  const LEVEL_LABELS = ['短期', '长期', '重要', '核心'];
  const LEVEL_COLORS = ['#c8d4e8', '#7a9fd4', '#3366b8', '#002FA7'];
  const LEVEL_BG = ['rgba(200,212,232,.2)', 'rgba(122,159,212,.12)', 'rgba(51,102,184,.1)', 'rgba(0,47,167,.08)'];
  const LEVEL_TEXT = ['#8aa0c0', '#5a85b8', '#2855a0', '#002FA7'];
  const STAR_SVG = '<svg viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';

  function getMemKey(contactId) { return 'byeol_memory_' + contactId; }

  function loadMemories(contactId) {
    currentContactId = contactId;
    try {
      // 优先读 Byeol 格式
      let data = localStorage.getItem(getMemKey(contactId));
      if (data) { memories = JSON.parse(data); return; }
      // 兼容星星项目格式
      data = localStorage.getItem('wp_memory_' + contactId);
      if (data) { memories = JSON.parse(data); return; }
      // 兼容迁移后的 ID
      const allKeys = Object.keys(localStorage);
      for (const k of allKeys) {
        if (k.startsWith('wp_memory_') && k.includes(contactId.replace('mig_', '').split('_')[0])) {
          data = localStorage.getItem(k);
          if (data) { memories = JSON.parse(data); return; }
        }
      }
      memories = [];
    } catch(e) { memories = []; }
  }

  function saveMemories() {
    if (!currentContactId) return;
    localStorage.setItem(getMemKey(currentContactId), JSON.stringify(memories));
    // 同时写星星兼容 key
    localStorage.setItem('wp_memory_' + currentContactId, JSON.stringify(memories));
  }

  function nowStr() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  }

  function escH(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

  function starsHTML(level) {
    let html = '';
    for (let i = 0; i < 4; i++) {
      const filled = i <= level;
      html += `<svg viewBox="0 0 24 24" style="width:11px;height:11px;fill:${filled ? LEVEL_COLORS[level] : 'none'};stroke:${LEVEL_COLORS[level]};stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round;"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;
    }
    return html;
  }

  const CSS = `
    .mem-page{position:absolute;inset:0;z-index:350;background:#F6F6F6;display:flex;flex-direction:column;transform:translateX(100%);transition:transform .4s cubic-bezier(.25,.46,.45,.94);overflow:hidden;}
    .mem-page.open{transform:translateX(0);}
    .mem-topbar{flex-shrink:0;padding:58px 20px 14px;display:flex;align-items:center;gap:14px;position:sticky;top:0;z-index:10;background:rgba(246,246,246,.88);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);}
    .mem-back{width:34px;height:34px;border-radius:50%;background:#fff;border:1px solid rgba(0,0,0,.04);display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 1px 4px rgba(0,0,0,.04);}
    .mem-back svg{width:14px;height:14px;fill:none;stroke:#1c1c1c;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round;}
    .mem-topbar-info{flex:1;}
    .mem-topbar-title{font-size:17px;font-weight:800;color:#1c1c1c;letter-spacing:-.3px;}
    .mem-topbar-sub{font-size:10px;color:#aaa;margin-top:2px;}
    .mem-add{width:34px;height:34px;border-radius:50%;background:#1c1c1c;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.15);}
    .mem-add svg{width:14px;height:14px;fill:none;stroke:#fff;stroke-width:2.5;stroke-linecap:round;}
    .mem-filters{flex-shrink:0;padding:6px 20px 14px;display:flex;gap:8px;overflow-x:auto;-webkit-overflow-scrolling:touch;}
    .mem-filters::-webkit-scrollbar{display:none;}
    .mem-chip{padding:7px 14px;border-radius:20px;font-size:11px;font-weight:600;color:#999;background:#fff;border:1px solid rgba(0,0,0,.04);white-space:nowrap;cursor:pointer;transition:all .2s;flex-shrink:0;}
    .mem-chip.active{color:#002FA7;border-color:#002FA7;background:rgba(0,47,167,.04);}
    .mem-list{flex:1;overflow-y:auto;padding:0 16px 40px;-webkit-overflow-scrolling:touch;}
    .mem-list::-webkit-scrollbar{display:none;}
    .mem-card{background:rgba(255,255,255,.92);border:1px solid rgba(0,0,0,.03);border-radius:16px;padding:14px 16px;margin-bottom:10px;box-shadow:0 1px 4px rgba(0,0,0,.03);position:relative;overflow:hidden;}
    .mem-card::before{content:'';position:absolute;left:0;top:0;bottom:0;width:3px;border-radius:2px;}
    .mem-card-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;}
    .mem-card-meta{display:flex;align-items:center;gap:8px;}
    .mem-card-stars{display:flex;gap:1px;}
    .mem-card-level{font-size:8px;font-weight:700;letter-spacing:.5px;padding:3px 8px;border-radius:6px;}
    .mem-card-date{font-size:9px;color:#ccc;font-weight:500;}
    .mem-card-actions{display:flex;gap:6px;}
    .mem-card-btn{width:26px;height:26px;border-radius:50%;background:#f5f5f7;border:1px solid rgba(0,0,0,.03);display:flex;align-items:center;justify-content:center;cursor:pointer;}
    .mem-card-btn svg{width:12px;height:12px;fill:none;stroke:#bbb;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;}
    .mem-card-btn.del svg{stroke:#d08080;}
    .mem-card-text{font-size:13px;color:#333;line-height:1.7;word-break:break-word;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;cursor:pointer;transition:all .2s;}
    .mem-card-text.expanded{-webkit-line-clamp:unset;display:block;}
    .mem-card-source{margin-top:8px;font-size:9px;color:#ccc;display:flex;align-items:center;gap:4px;}
    .mem-card-source svg{width:10px;height:10px;fill:none;stroke:#ccc;stroke-width:1.5;}
    .mem-empty{text-align:center;padding:80px 30px;}
    .mem-empty-icon{font-size:36px;margin-bottom:12px;opacity:.4;}
    .mem-empty-title{font-size:14px;font-weight:700;color:#bbb;margin-bottom:6px;}
    .mem-empty-sub{font-size:11px;color:#ccc;line-height:1.6;}
  `;

  function buildHTML() {
    return `<div class="mem-page" id="memPage">
      <div class="mem-topbar">
        <div class="mem-back" id="memBack"><svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg></div>
        <div class="mem-topbar-info"><div class="mem-topbar-title">记忆库</div><div class="mem-topbar-sub" id="memSub">0 条记忆</div></div>
        <div class="mem-add" id="memAdd"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg></div>
      </div>
      <div class="mem-filters" id="memFilters">
        <div class="mem-chip active" data-lv="-1">全部</div>
        <div class="mem-chip" data-lv="0">短期</div>
        <div class="mem-chip" data-lv="1">长期</div>
        <div class="mem-chip" data-lv="2">重要</div>
        <div class="mem-chip" data-lv="3">核心</div>
      </div>
      <div class="mem-list" id="memList"></div>
    </div>`;
  }

  function render(filterLevel) {
    const list = document.getElementById('memList');
    const sub = document.getElementById('memSub');
    if (!list) return;

    const filtered = filterLevel < 0 ? memories : memories.filter(m => m.level === filterLevel);
    sub.textContent = `${memories.length} 条记忆`;

    if (filtered.length === 0) {
      list.innerHTML = `<div class="mem-empty"><div class="mem-empty-icon">☆</div><div class="mem-empty-title">暂无记忆</div><div class="mem-empty-sub">点击右上角 + 手动添加<br>或开启自动总结让 AI 记住重要事</div></div>`;
      return;
    }

    const sorted = filtered.slice().sort((a, b) => (b.level || 0) - (a.level || 0));

    list.innerHTML = sorted.map(m => {
      const lv = typeof m.level === 'number' ? m.level : 1;
      const sourceIcon = m.source === 'auto-ai'
        ? '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2"/></svg>'
        : '<svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4 9.5-9.5z"/></svg>';
      const sourceText = m.source === 'auto-ai' ? 'AI 自动总结' : '手动添加';
      return `<div class="mem-card" data-id="${m.id}" style="border-left:3px solid ${LEVEL_COLORS[lv]};">
        <div class="mem-card-header">
          <div class="mem-card-meta">
            <div class="mem-card-stars">${starsHTML(lv)}</div>
            <div class="mem-card-level" style="background:${LEVEL_BG[lv]};color:${LEVEL_TEXT[lv]};">${LEVEL_LABELS[lv]}</div>
            <div class="mem-card-date">${m.date || ''}</div>
          </div>
          <div class="mem-card-actions">
            <div class="mem-card-btn edit-btn" data-id="${m.id}"><svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4 9.5-9.5z"/></svg></div>
            <div class="mem-card-btn del" data-id="${m.id}"><svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg></div>
          </div>
        </div>
        <div class="mem-card-text">${escH(m.text)}</div>
        <div class="mem-card-source">${sourceIcon}${sourceText}</div>
      </div>`;
    }).join('');

    // 绑定事件
    list.querySelectorAll('.del').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const id = btn.dataset.id;
        memories = memories.filter(m => m.id !== id);
        saveMemories();
        render(getCurrentFilter());
      });
    });

    list.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const id = btn.dataset.id;
        const m = memories.find(x => x.id === id);
        if (m) showAddModal(m);
      });
    });

    // 点击文本展开/收起
    list.querySelectorAll('.mem-card-text').forEach(el => {
      el.addEventListener('click', e => {
        e.stopPropagation();
        el.classList.toggle('expanded');
      });
    });
  }

  function getCurrentFilter() {
    const active = document.querySelector('#memFilters .mem-chip.active');
    return active ? parseInt(active.dataset.lv) : -1;
  }

  function showAddModal(existing) {
    const old = document.getElementById('memAddModal');
    if (old) old.remove();

    const m = existing || { text: '', level: 1 };
    const isEdit = !!existing;

    const modal = document.createElement('div');
    modal.id = 'memAddModal';
    modal.style.cssText = 'position:absolute;inset:0;z-index:400;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0);transition:background .25s;';
    modal.innerHTML = `
      <div id="memAddBox" style="width:85%;max-width:320px;background:#fff;border-radius:22px;padding:22px 20px 18px;box-shadow:0 16px 50px rgba(0,0,0,.15);transform:scale(.92);opacity:0;transition:transform .3s cubic-bezier(.34,1.56,.64,1),opacity .25s;">
        <div style="font-size:15px;font-weight:800;color:#1c1c1c;margin-bottom:14px;">${isEdit ? '编辑记忆' : '新建记忆'}</div>
        <div style="margin-bottom:12px;">
          <div style="font-size:9px;font-weight:600;color:#bbb;letter-spacing:.5px;margin-bottom:5px;">记忆内容</div>
          <textarea id="memAddText" style="width:100%;min-height:90px;border-radius:12px;border:1px solid #f0f0f0;background:#fafafa;padding:12px 14px;font-size:13px;color:#1c1c1c;outline:none;resize:none;font-family:inherit;line-height:1.6;" placeholder="输入需要角色记住的事...">${escH(m.text)}</textarea>
        </div>
        <div style="margin-bottom:12px;">
          <div style="font-size:9px;font-weight:600;color:#bbb;letter-spacing:.5px;margin-bottom:5px;">重要程度</div>
          <div id="memAddLevels" style="display:flex;gap:8px;">
            ${[0,1,2,3].map(i => `<div class="mem-lv-opt" data-lv="${i}" style="flex:1;padding:10px 0;border-radius:10px;text-align:center;font-size:10px;font-weight:700;border:1.5px solid ${m.level===i?LEVEL_COLORS[i]:'transparent'};background:${LEVEL_BG[i]};color:${LEVEL_TEXT[i]};cursor:pointer;">${LEVEL_LABELS[i]}</div>`).join('')}
          </div>
        </div>
        <div style="display:flex;gap:8px;margin-top:16px;">
          <div id="memAddCancel" style="flex:1;height:42px;border-radius:12px;background:#f5f5f7;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:#999;cursor:pointer;">取消</div>
          <div id="memAddSave" style="flex:1;height:42px;border-radius:12px;background:#1c1c1c;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:#fff;cursor:pointer;">保存</div>
        </div>
      </div>
    `;

    memPage.appendChild(modal);
    requestAnimationFrame(() => {
      modal.style.background = 'rgba(0,0,0,.32)';
      modal.querySelector('#memAddBox').style.transform = 'scale(1)';
      modal.querySelector('#memAddBox').style.opacity = '1';
    });

    let selectedLevel = m.level;

    modal.querySelectorAll('.mem-lv-opt').forEach(opt => {
      opt.addEventListener('click', () => {
        selectedLevel = parseInt(opt.dataset.lv);
        modal.querySelectorAll('.mem-lv-opt').forEach((o, i) => {
          o.style.borderColor = parseInt(o.dataset.lv) === selectedLevel ? LEVEL_COLORS[i] : 'transparent';
        });
      });
    });

    function closeModal() {
      modal.style.background = 'rgba(0,0,0,0)';
      const box = modal.querySelector('#memAddBox');
      if (box) { box.style.transform = 'scale(.92)'; box.style.opacity = '0'; }
      setTimeout(() => { if (modal.parentNode) modal.remove(); }, 280);
    }

    modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
    modal.querySelector('#memAddCancel').addEventListener('click', closeModal);
    modal.querySelector('#memAddSave').addEventListener('click', () => {
      const text = modal.querySelector('#memAddText').value.trim();
      if (!text) return;
      if (isEdit) {
        existing.text = text;
        existing.level = selectedLevel;
      } else {
        memories.push({
          id: 'mem_' + Date.now(),
          text: text,
          level: selectedLevel,
          date: nowStr(),
          source: 'manual'
        });
      }
      saveMemories();
      closeModal();
      render(getCurrentFilter());
    });
  }

  function init() {
    if (document.getElementById('memStyles')) return;
    const s = document.createElement('style');
    s.id = 'memStyles';
    s.textContent = CSS;
    document.head.appendChild(s);

    const screen = document.querySelector('.phone-screen');
    if (!screen) return;
    screen.insertAdjacentHTML('beforeend', buildHTML());
    memPage = document.getElementById('memPage');

    document.getElementById('memBack').addEventListener('click', e => { e.stopPropagation(); close(); });
    document.getElementById('memAdd').addEventListener('click', e => { e.stopPropagation(); showAddModal(null); });

    document.getElementById('memFilters').addEventListener('click', e => {
      const chip = e.target.closest('.mem-chip');
      if (!chip) return;
      document.querySelectorAll('#memFilters .mem-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      render(parseInt(chip.dataset.lv));
    });
  }

  function open(contactId) {
    if (!memPage) init();
    loadMemories(contactId);
    render(-1);
    memPage.classList.add('open');
  }

  function close() {
    if (memPage) memPage.classList.remove('open');
  }

  // ── 记忆注入到 system prompt ──
  function getMemoryInject(contactId) {
    loadMemories(contactId);
    if (memories.length === 0) return '';
    const sorted = memories.slice().sort((a, b) => (b.level || 0) - (a.level || 0));
    const lines = sorted.map(m => {
      const lv = LEVEL_LABELS[m.level || 1];
      return `[${lv}][${m.date || ''}] ${m.text}`;
    });
    return '[记忆库 - 禁止删除/省略已有记忆]\n' + lines.join('\n');
  }

  // ── 自动总结（调 API 后提取） ──
  function extractAutoSummary(reply, contactId, curMsgCount) {
    const match = reply.match(/【记忆总结】([\s\S]+)$/);
    if (!match) return reply;
    const summaryBlock = match[1].trim();
    const cleanReply = reply.replace(/【记忆总结】[\s\S]+$/, '').trim();
    const _msgCount = curMsgCount || 0;

    if (summaryBlock) {
      loadMemories(contactId);
      const levelMap = { '短期': 0, '长期': 1, '重要': 2, '核心': 3 };

      // 按编号分割：每个 01. 02. 03. 开头的是一条完整记忆
      const entries = summaryBlock.split(/(?=\d{2}\.\s*\[)/).map(s => s.trim()).filter(Boolean);

      let parsed = false;

      if (entries.length > 0) {
        entries.forEach(entry => {
          // 提取等级
          const lvMatch = entry.match(/\[(短期|长期|重要|核心)\]/);
          const level = lvMatch ? (levelMap[lvMatch[1]] ?? 1) : 1;
          // 去掉编号前缀，保留完整内容
          const text = entry.replace(/^\d{2}\.\s*/, '').trim();
          if (text.length >= 20) {
            const isDuplicate = memories.some(mem => {
              if (mem.text.length < 15) return false;
              const a = mem.text.substring(0, 30);
              const b = text.substring(0, 30);
              return mem.text.includes(b) || text.includes(a);
            });
            if (!isDuplicate) {
              memories.push({
                id: 'mem_auto_' + Date.now() + '_' + Math.random().toString(36).slice(2,5),
                text: text,
                level: level,
                date: nowStr(),
                source: 'auto-ai',
                msgCount: _msgCount
              });
              parsed = true;
            }
          }
        });
      }

      // 降级：如果没匹配到编号格式，尝试按 [等级] 开头单行匹配
      if (!parsed) {
        const lines = summaryBlock.split('\n').map(l => l.trim()).filter(Boolean);
        lines.forEach(line => {
          const m = line.match(/^\[?(短期|长期|重要|核心)\]?\s*(.+)$/);
          if (m && m[2].length >= 8) {
            memories.push({
              id: 'mem_auto_' + Date.now() + '_' + Math.random().toString(36).slice(2,5),
              text: m[2].trim(),
              level: levelMap[m[1]] ?? 1,
              date: nowStr(),
              source: 'auto-ai',
              msgCount: _msgCount
            });
            parsed = true;
          }
        });
      }

      // 最终降级：整段存储
      if (!parsed && summaryBlock.length >= 10) {
        memories.push({
          id: 'mem_auto_' + Date.now(),
          text: summaryBlock,
          level: 1,
          date: nowStr(),
          source: 'auto-ai',
          msgCount: _msgCount
        });
      }

      saveMemories();
    }
    return cleanReply || reply;
  }

  // ── 自动总结 prompt 注入 ──
  function getAutoSummaryInject(contactId, msgCount, slideCount) {
    loadMemories(contactId);
    const lastAuto = [...memories].reverse().find(m => m.source === 'auto-ai');
    let shouldSummarize = false;
    if (!lastAuto) {
      if (msgCount >= slideCount) shouldSummarize = true;
    } else {
      const lastCount = lastAuto.msgCount || 0;
      if (msgCount - lastCount >= slideCount) shouldSummarize = true;
    }
    if (!shouldSummarize) return '';
    return `[自动总结指令——系统级任务，与角色扮演无关]
在回复末尾输出记忆总结。当前时间：${nowStr()}。

【记忆总结】
格式（严格遵守，按编号排列）：

01. [等级] [年月日 时:分~时:分] 事件标题。
    · 起因：（什么导致了这件事发生）
    · 经过：（详细描述过程中双方的言行、情绪变化、关键对话）
    · 结果：（最终如何收场，关系有什么变化，得出什么结论）

示例：
01. [重要] [2025-06-19 21:00~22:40] 一起看《你的名字》引发的情感共鸣。
    · 起因：用户提议一起看电影，角色同意后选了《你的名字》。
    · 经过：看到三叶消失的片段时用户突然沉默，随后角色注意到用户在哭。用户说"每次看到这里都会哭"，并透露这是他最喜欢的电影，因为"害怕忘记重要的人"。角色没有安慰，只是把用户拉近了一些。
    · 结果：这是用户第一次在角色面前展露脆弱。此后角色意识到用户对"遗忘"和"分离"极度敏感。

02. [长期] [2025-06-20] 用户的作息与聊天习惯。
    · 起因：观察多日聊天规律后总结。
    · 经过：用户白天几乎不回消息（工作忙），晚上10点后开始活跃，深夜是最话多的时段。周末全天在线。
    · 结果：长期规律，角色应避免白天频繁发消息造成压力。

等级标准：
- [短期]：当天发生的事、临时情绪状态
- [长期]：持续性习惯、偏好、规律性行为模式
- [重要]：有情感意义的事件、承诺、关系转折点、剧情关键节点
- [核心]：绝对禁忌、不可触碰的底线（极少，非常重大才标）

维护规则：
1. 每条记忆必须完整写出起因/经过/结果三段，禁止一句话敷衍
2. 时间精确到事件发生的时间段（不是总结时间）
3. 禁止删除/省略/删减任何已存在于记忆库中的旧记忆
4. 遇到重大剧情转折直接标[重要]或[核心]，不受条数限制
5. 不要重复已有记忆库里的内容
6. 经过部分要包含关键对话原文和情绪描写，越详细越好
7. 按重要性从高到低排列，编号连续（01. 02. 03.…）`;
  }

  // ══════════════════════════════════════
  // 后台总结胶囊
  // ══════════════════════════════════════
  let capsuleEl = null;
  let capsuleTimer = null;

  function injectCapsuleCSS() {
    if (document.getElementById('memCapsuleCSS')) return;
    const s = document.createElement('style');
    s.id = 'memCapsuleCSS';
    s.textContent = `
      .mem-capsule{position:absolute;top:120px;left:50%;transform:translateX(-50%) translateY(10px);z-index:55;padding:6px 16px;border-radius:50px;background:#9a9a9e;border:1px solid #7a7a7e;display:flex;align-items:center;gap:6px;opacity:0;transition:opacity .25s ease,transform .25s ease;pointer-events:none;font-family:-apple-system,BlinkMacSystemFont,sans-serif;}
      .mem-capsule.show{opacity:0.45;transform:translateX(-50%) translateY(0);pointer-events:auto;}
      .mem-capsule-dots{display:flex;gap:3px;align-items:center;}
      .mem-capsule-dots span{width:3px;height:3px;border-radius:50%;background:#fff;animation:memDotPulse 1.4s ease-in-out infinite;}
      .mem-capsule-dots span:nth-child(2){animation-delay:.2s;}
      .mem-capsule-dots span:nth-child(3){animation-delay:.4s;}
      @keyframes memDotPulse{0%,80%,100%{opacity:.3;transform:scale(.7);}40%{opacity:1;transform:scale(1);}}
      .mem-capsule-text{font-size:11px;font-weight:600;color:#fff;letter-spacing:.3px;white-space:nowrap;}
      .mem-capsule-check{display:none;width:12px;height:12px;}
      .mem-capsule-check svg{width:100%;height:100%;fill:none;stroke:#fff;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round;}
      .mem-capsule.done .mem-capsule-dots{display:none;}
      .mem-capsule.done .mem-capsule-check{display:block;}
      .mem-capsule.done .mem-capsule-text{color:#fff;}
    `;
    document.head.appendChild(s);
  }

  function showCapsule(text) {
    injectCapsuleCSS();
    const chatroom = document.getElementById('clChatroom');
    if (!chatroom) return;
    if (capsuleEl) { capsuleEl.remove(); capsuleEl = null; }
    if (capsuleTimer) { clearTimeout(capsuleTimer); capsuleTimer = null; }
    capsuleEl = document.createElement('div');
    capsuleEl.className = 'mem-capsule';
    capsuleEl.innerHTML = `
      <div class="mem-capsule-dots"><span></span><span></span><span></span></div>
      <div class="mem-capsule-check"><svg viewBox="0 0 24 24"><path d="M5 12l5 5L20 7"/></svg></div>
      <div class="mem-capsule-text">${text}</div>
    `;
    chatroom.appendChild(capsuleEl);
    requestAnimationFrame(() => capsuleEl.classList.add('show'));
  }

  function capsuleDone(text) {
    if (!capsuleEl) return;
    capsuleEl.classList.add('done');
    capsuleEl.querySelector('.mem-capsule-text').textContent = text || '✓ 记忆已归档';
    capsuleTimer = setTimeout(() => {
      if (capsuleEl) {
        capsuleEl.classList.remove('show');
        setTimeout(() => { if (capsuleEl) { capsuleEl.remove(); capsuleEl = null; } }, 300);
      }
    }, 2500);
  }

  function capsuleError(text) {
    if (!capsuleEl) return;
    capsuleEl.querySelector('.mem-capsule-dots').style.display = 'none';
    capsuleEl.querySelector('.mem-capsule-text').textContent = text || '总结失败';
    capsuleTimer = setTimeout(() => {
      if (capsuleEl) {
        capsuleEl.style.opacity = '0';
        capsuleEl.style.transform = 'translateX(-50%) translateY(10px)';
        setTimeout(() => { if (capsuleEl) { capsuleEl.remove(); capsuleEl = null; } }, 300);
      }
    }, 3000);
  }

  // ── 手动总结（后台调 API） ──
  async function triggerManualSummary(contactId, fromIdx, toIdx) {
    showCapsule('✦ 正在手动整理记忆…');

    try {
      const cfg = await HomeDB.getItem('api_config');
      if (!cfg || !cfg.url || !cfg.key || !cfg.model) {
        capsuleError('未配置 API');
        return;
      }

      // 读取消息
      const db = await new Promise((resolve, reject) => {
        const req = indexedDB.open('ByeolPhone_DB', 2);
        req.onsuccess = e => resolve(e.target.result);
        req.onerror = e => reject(e.target.error);
      });
      const tx = db.transaction('contacts', 'readonly');
      const store = tx.objectStore('contacts');
      const contact = await new Promise(resolve => {
        const req = store.get(contactId);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => resolve(null);
      });
      db.close();
      if (!contact || !contact.messages || contact.messages.length === 0) {
        capsuleError('无消息可总结');
        return;
      }

      const from = (fromIdx || 1) - 1;
      const to = toIdx || contact.messages.length;
      const msgs = contact.messages.slice(from, to);
      const slideCount = contact.memSlideCount || 30;
      const chatHistory = msgs.map(m => `[${m.role === 'user' ? '用户' : '角色'}][${new Date(m.time).toLocaleString('zh-CN')}] ${m.text}`).join('\n');

      loadMemories(contactId);
      const existingMem = memories.length > 0 ? '\n\n[已有记忆库（禁止重复）]：\n' + memories.map(m => m.text.substring(0, 50)).join('\n') : '';

      const summaryPrompt = `你是记忆归档系统。请总结以下对话中值得记住的事件。${existingMem}

[对话记录]：
${chatHistory}

请按以下格式输出（严格遵守）：

01. [等级] [年月日 时:分~时:分] 事件标题。
    . 起因：（什么导致了这件事发生）
    . 经过：（详细描述过程中双方的言行、情绪变化、关键对话）
    . 结果：（最终如何收场，关系有什么变化）

等级标准：[短期]=当天琐事 [长期]=持续性规律 [重要]=情感事件/转折 [核心]=绝对禁忌/底线
要求：每条必须写完整起因经过结果，禁止一句话敷衍。不重复已有记忆。`;

      const baseUrl = cfg.url.replace(/\/+$/, '');
      const endpoint = /\/chat\/completions$/.test(baseUrl) ? baseUrl : (/\/v1$/.test(baseUrl) ? baseUrl + '/chat/completions' : baseUrl + '/v1/chat/completions');

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + cfg.key },
        body: JSON.stringify({
          model: cfg.model,
          messages: [{ role: 'user', content: summaryPrompt }],
          temperature: parseFloat(cfg.temp) || 0.3,
          max_tokens: parseInt(cfg.maxTokens) || 4096
        })
      });

      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      const reply = data.choices?.[0]?.message?.content || '';

      if (reply.trim()) {
        // 解析总结
        const levelMap = { '短期': 0, '长期': 1, '重要': 2, '核心': 3 };
        const entries = reply.split(/(?=\d{2}\.\s*\[)/).map(s => s.trim()).filter(Boolean);

        loadMemories(contactId);
        let count = 0;
        entries.forEach(entry => {
          const lvMatch = entry.match(/\[(短期|长期|重要|核心)\]/);
          const level = lvMatch ? (levelMap[lvMatch[1]] ?? 1) : 1;
          const text = entry.replace(/^\d{2}\.\s*/, '').trim();
          if (text.length >= 20) {
            const isDuplicate = memories.some(mem => mem.text.substring(0, 30) === text.substring(0, 30));
            if (!isDuplicate) {
              memories.push({ id: 'mem_manual_' + Date.now() + '_' + count, text, level, date: nowStr(), source: 'manual-ai' });
              count++;
            }
          }
        });

        if (count === 0 && reply.length >= 20) {
          memories.push({ id: 'mem_manual_' + Date.now(), text: reply, level: 1, date: nowStr(), source: 'manual-ai' });
          count = 1;
        }

        saveMemories();
        capsuleDone(`✓ 已归档 ${count} 条记忆`);
      } else {
        capsuleError('AI 返回空内容');
      }
    } catch (err) {
      capsuleError('总结失败: ' + err.message);
    }
  }

  window.MemoryPage = { init, open, close, getMemoryInject, extractAutoSummary, getAutoSummaryInject, triggerManualSummary, showCapsule, capsuleDone, capsuleError };
  return { init, open, close, getMemoryInject, extractAutoSummary, getAutoSummaryInject, triggerManualSummary, showCapsule, capsuleDone, capsuleError };
})();

window.addEventListener('DOMContentLoaded', () => { MemoryPage.init(); });
