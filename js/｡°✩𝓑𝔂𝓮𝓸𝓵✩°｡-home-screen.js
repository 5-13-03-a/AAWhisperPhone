// ==========================================
// 时间更新
// ==========================================
function updateTime() {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, '0');
  document.getElementById('statusTime').textContent = `${hours}:${minutes}`;
}
updateTime();
setInterval(updateTime, 1000);

// ==========================================
// 页面指示器切换
// ==========================================
document.querySelectorAll('.page-dots .dot').forEach((dot) => {
  dot.addEventListener('click', () => {
    document.querySelectorAll('.page-dots .dot').forEach(d => d.classList.remove('active'));
    dot.classList.add('active');
  });
});

// ==========================================
// 触摸拖拽系统 + iOS 动画反馈
// ==========================================
let isEditMode = false;
let pressTimer = null;
let draggedElement = null;
let draggedClone = null;
let touchStartX = 0;
let touchStartY = 0;
let touchCurrentX = 0;
let touchCurrentY = 0;
let dragStartTime = 0;
let originalZIndex = null;

// ===== 动画样式 =====
const animationStyle = document.createElement('style');
animationStyle.textContent = `
/* ===== 翻页过渡 ===== */

/* ===== 2️⃣ 跳跃摇晃（活泼） ===== */
@keyframes wiggle {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  25% { transform: translateY(-3px) rotate(-2deg); }
  50% { transform: translateY(0) rotate(0deg); }
  75% { transform: translateY(-3px) rotate(2deg); }
}

  /* 长按反馈 - 缩小然后弹回 */
  @keyframes pressDown {
    0% { transform: scale(1); }
    50% { transform: scale(0.92); }
    100% { transform: scale(1); }
  }
  
  /* 进入编辑模式的所有图标 */
  .edit-mode-active .app-item {
    animation: wiggle 0.4s ease-in-out infinite;
  }
  
  /* 被拖拽的图标 */
  .app-item.dragging-original {
    opacity: 0.2 !important;
    filter: blur(1px);
  }
  
  /* 拖拽克隆体 - 纯净的图标 */
  .dragging-clone {
    position: fixed;
    pointer-events: none;
    z-index: 99999;
    width: 56px;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0;
    padding: 0;
    background: transparent;
    border: none;
    cursor: grabbing;
  }
  
  /* 克隆体的图标 */
  .dragging-clone .app-icon {
    width: 56px !important;
    height: 56px !important;
    border-radius: 17px !important;
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;
    position: relative !important;
    background: rgba(255, 255, 255, 0.94) !important;
    backdrop-filter: blur(20px) !important;
    -webkit-backdrop-filter: blur(20px) !important;
    border: 1px solid rgba(255, 255, 255, 0.9) !important;
    box-shadow: 
      0 0 0 0.5px rgba(0, 0, 0, 0.04) inset, 
      0 1.5px 0 rgba(255, 255, 255, 1) inset, 
      0 3px 10px rgba(0, 0, 0, 0.02), 
      0 8px 20px rgba(0, 0, 0, 0.02),
      0 10px 30px rgba(0, 0, 0, 0.15) !important;
    overflow: hidden !important;
    margin: 0 !important;
    padding: 0 !important;
    transform: scale(1.15) rotate(5deg) !important;
    opacity: 0.95 !important;
  }
  
  .dragging-clone .app-icon::before {
    display: none !important;
  }
  
  .dragging-clone .app-icon::after {
    display: none !important;
  }
  
  /* 交换时的动画 */
  @keyframes swapIn {
    0% { 
      opacity: 0.5;
      transform: scale(0.9);
    }
    100% { 
      opacity: 1;
      transform: scale(1);
    }
  }
  
  .app-item.swap-animate {
    animation: swapIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  
  /* 悬停效果 */
  .app-item.hover-target {
    transform: scale(1.08);
    opacity: 0.6;
  }
  
  /* 退出编辑模式动画 */
  @keyframes exitEdit {
    0% {
      transform: scale(1) rotate(-1.5deg);
      animation-timing-function: ease-in;
    }
    100% {
      transform: scale(1) rotate(0deg);
    }
  }
  
  .edit-mode-active.exiting .app-item {
    animation: exitEdit 0.4s ease-out forwards;
  }
`;
document.head.appendChild(animationStyle);

// 从数据库加载图标顺序（widget 槽位 + 两页）
async function loadIconOrder() {
  const order = await HomeDB.getItem('icon_order');
  if (!order) return;
  
  const grids = document.querySelectorAll('.app-grid');
  const widgetSlots = document.querySelectorAll('.widget-right-grid .widget-slot');
  const allItems = Array.from(grids[0].children)
    .concat(Array.from(grids[1].children))
    .concat(Array.from(widgetSlots).flatMap(s => Array.from(s.children)))
    .filter(el => el.classList.contains('app-item'));
  
  if (order.widget && Array.isArray(order.widget)) {
    order.widget.forEach((label, i) => {
      if (!label || !widgetSlots[i]) return;
      const item = allItems.find(el => el.querySelector('.app-label').textContent === label);
      if (item) {
        widgetSlots[i].appendChild(item);
      }
    });
  }
  
  if (order.page0 && Array.isArray(order.page0)) {
    order.page0.forEach((label) => {
      const item = allItems.find(el => el.querySelector('.app-label').textContent === label);
      const firstPlaceholder = grids[0].querySelector('.grid-placeholder');
      if (item) {
        if (firstPlaceholder) {
          grids[0].insertBefore(item, firstPlaceholder);
        } else {
          grids[0].appendChild(item);
        }
      }
    });
  }
  
  if (order.page1 && Array.isArray(order.page1)) {
    order.page1.forEach((label) => {
      const item = allItems.find(el => el.querySelector('.app-label').textContent === label);
      const firstPlaceholder = grids[1].querySelector('.grid-placeholder');
      if (item) {
        if (firstPlaceholder) {
          grids[1].insertBefore(item, firstPlaceholder);
        } else {
          grids[1].appendChild(item);
        }
      }
    });
  }
}

// 保存图标顺序到数据库（widget 槽位 + 两页）
async function saveIconOrder() {
  const grids = document.querySelectorAll('.app-grid');
  const widgetSlots = document.querySelectorAll('.widget-right-grid .widget-slot');
  const widget = Array.from(widgetSlots).map(slot => {
    const item = slot.querySelector('.app-item');
    return item ? item.querySelector('.app-label').textContent : null;
  });
  const page0 = Array.from(grids[0].children)
    .filter(item => item.classList.contains('app-item'))
    .map(item => item.querySelector('.app-label').textContent);
  const page1 = Array.from(grids[1].children)
    .filter(item => item.classList.contains('app-item'))
    .map(item => item.querySelector('.app-label').textContent);
  await HomeDB.setItem('icon_order', { widget, page0, page1 });
}

// 进入编辑模式
function enterEditMode() {
  isEditMode = true;
  
  // 两页的 grid 都加上 edit-mode-active
  document.querySelectorAll('.app-grid').forEach(grid => {
    grid.classList.add('edit-mode-active');
  });
  
  // phone-screen 加 editing：触发组件区遮罩
  document.querySelector('.phone-screen').classList.add('editing');
  
  // 所有图标播放进入动画
  document.querySelectorAll('.app-item').forEach((item, index) => {
    item.style.animationDelay = `${index * 0.05}s`;
  });
}

// 退出编辑模式
function exitEditMode() {
  isEditMode = false;
  
  document.querySelectorAll('.app-grid').forEach(grid => {
    grid.classList.add('exiting');
    setTimeout(() => {
      grid.classList.remove('edit-mode-active', 'exiting');
    }, 400);
  });
  
  // 关闭组件区遮罩
  document.querySelector('.phone-screen').classList.remove('editing');
  
  document.querySelectorAll('.app-item').forEach(item => {
    item.style.animationDelay = '0s';
  });
  
  saveIconOrder();
}


// 长按反馈动画
function playPressAnimation(item) {
  const icon = item.querySelector('.app-icon');
  icon.style.animation = 'pressDown 0.3s ease-out';
  setTimeout(() => {
    icon.style.animation = '';
  }, 300);
}

// 开始拖拽
function startDrag(item, e) {
  draggedElement = item;
  originalZIndex = item.style.zIndex;
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
  
  // 标记原始位置
  item.classList.add('dragging-original');
  
  // 创建拖拽克隆体 - 只克隆图标部分
  draggedClone = document.createElement('div');
  draggedClone.classList.add('dragging-clone');
  
  // 复制图标元素
  const iconClone = item.querySelector('.app-icon').cloneNode(true);
  draggedClone.appendChild(iconClone);
  
  // 设置初始位置
  draggedClone.style.left = (touchStartX - 28) + 'px';
  draggedClone.style.top = (touchStartY - 28) + 'px';
  
  document.body.appendChild(draggedClone);
  
  // 监听全局触摸移动
  document.addEventListener('touchmove', handleDragMove, { passive: true });
}

// 拖拽移动
function handleDragMove(e) {
  if (!draggedElement || !draggedClone) return;
  
  touchCurrentX = e.touches[0].clientX;
  touchCurrentY = e.touches[0].clientY;
  
  draggedClone.style.left = (touchCurrentX - 28) + 'px';
  draggedClone.style.top = (touchCurrentY - 28) + 'px';
  
  const screenRect = document.querySelector('.phone-screen').getBoundingClientRect();
  const edgeThreshold = 16;
  const PAGE_FLIP_COOLDOWN = 700;
  const HOLD_TIME_REQUIRED = 400;
  const now = Date.now();
  if (typeof handleDragMove._lastFlip !== 'number') handleDragMove._lastFlip = 0;
  if (typeof handleDragMove._edgeEnter !== 'number') handleDragMove._edgeEnter = 0;
  if (typeof handleDragMove._edgeSide !== 'string') handleDragMove._edgeSide = '';
  
  const onRightEdge = touchCurrentX > screenRect.right - edgeThreshold;
  const onLeftEdge  = touchCurrentX < screenRect.left + edgeThreshold;
  const side = onRightEdge ? 'r' : (onLeftEdge ? 'l' : '');
  
  if (side !== handleDragMove._edgeSide) {
    handleDragMove._edgeSide = side;
    handleDragMove._edgeEnter = side ? now : 0;
  }
  
  const cooldownPassed = now - handleDragMove._lastFlip > PAGE_FLIP_COOLDOWN;
  const heldLongEnough = handleDragMove._edgeEnter && now - handleDragMove._edgeEnter > HOLD_TIME_REQUIRED;
  
  // 拖到右边缘翻页（需停留 + 冷却）
  if (onRightEdge && cooldownPassed && heldLongEnough && currentPage < totalPages - 1) {
    handleDragMove._lastFlip = now;
    handleDragMove._edgeEnter = 0;
    currentPage = currentPage + 1;
    updatePageDots();
    updateGridVisibility();
    saveCurrentPage();
    const targetGrid = document.querySelectorAll('.app-grid')[currentPage];
    if (draggedElement.parentNode !== targetGrid && !draggedElement.parentNode.classList.contains('widget-slot')) {
      targetGrid.appendChild(draggedElement);
    } else if (draggedElement.parentNode.classList.contains('widget-slot')) {
      targetGrid.appendChild(draggedElement);
    }
    return;
  }
  
  // 拖到左边缘翻页（需停留 + 冷却）
  if (onLeftEdge && cooldownPassed && heldLongEnough && currentPage > 0) {
    handleDragMove._lastFlip = now;
    handleDragMove._edgeEnter = 0;
    currentPage = currentPage - 1;
    updatePageDots();
    updateGridVisibility();
    saveCurrentPage();
    const targetGrid = document.querySelectorAll('.app-grid')[currentPage];
    if (draggedElement.parentNode !== targetGrid) {
      targetGrid.appendChild(draggedElement);
    }
    return;
  }
  
  // === Widget 槽位检测（仅第一页有 widget 区）===
  if (currentPage === 0) {
    const widgetSlots = Array.from(document.querySelectorAll('.widget-right-grid .widget-slot'));
    let hitSlot = null;
    let hitSlotDist = Infinity;
    const slotPad = 14; // 命中外扩，便于触发
    widgetSlots.forEach(slot => {
      const rect = slot.getBoundingClientRect();
      const inside =
        touchCurrentX >= rect.left - slotPad &&
        touchCurrentX <= rect.right + slotPad &&
        touchCurrentY >= rect.top - slotPad &&
        touchCurrentY <= rect.bottom + slotPad;
      if (!inside) return;
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const d = Math.hypot(touchCurrentX - cx, touchCurrentY - cy);
      if (d < hitSlotDist) {
        hitSlotDist = d;
        hitSlot = slot;
      }
    });
    if (hitSlot && !hitSlot.contains(draggedElement)) {
      const occupant = hitSlot.querySelector('.app-item');
      const oldParent = draggedElement.parentNode;
      if (occupant) {
        if (oldParent.classList.contains('widget-slot')) {
          // 槽位↔槽位：内容互换
          oldParent.appendChild(occupant);
        } else {
          // 槽位↔grid：被替换的图标推回 grid 的占位前或末尾
          const firstPlaceholder = oldParent.querySelector('.grid-placeholder');
          if (firstPlaceholder) {
            oldParent.insertBefore(occupant, firstPlaceholder);
          } else {
            oldParent.appendChild(occupant);
          }
        }
      }
      hitSlot.appendChild(draggedElement);
      return;
    }
  }
  
  // 收集当前页 grid 容器（widget-right-grid 走单独逻辑，这里不收）
  let containers = [];
  if (currentPage === 0) {
    containers.push(document.querySelectorAll('.app-grid')[0]);
  } else {
    containers.push(document.querySelectorAll('.app-grid')[1]);
  }
  
  // 收集图标 + 占位格子（不含 widget-slot 内的）
  const allItems = [];
  const allPlaceholders = [];
  containers.forEach(c => {
    if (!c) return;
    c.querySelectorAll('.app-item').forEach(it => allItems.push(it));
    c.querySelectorAll('.grid-placeholder').forEach(p => allPlaceholders.push(p));
  });
  
  // 检测最近的图标交换（grid 内）
  allItems.forEach(item => {
    if (item === draggedElement) return;
    
    const rect = item.getBoundingClientRect();
    const itemCenterX = rect.left + rect.width / 2;
    const itemCenterY = rect.top + rect.height / 2;
    
    const distance = Math.hypot(
      touchCurrentX - itemCenterX,
      touchCurrentY - itemCenterY
    );
    
    if (distance < 62) {
      item.classList.add('hover-target');
      
      const draggedFromSlot = draggedElement.parentNode.classList.contains('widget-slot');
      
      if (draggedFromSlot) {
        // 从 widget-slot 拖出来落到 grid 上：直接插到 item 之前
        item.parentNode.insertBefore(draggedElement, item);
      } else {
        const draggedRect = draggedElement.getBoundingClientRect();
        const draggedCenterX = draggedRect.left + draggedRect.width / 2;
        const draggedCenterY = draggedRect.top + draggedRect.height / 2;
        
        if (draggedCenterY < itemCenterY - 10) {
          item.parentNode.insertBefore(draggedElement, item);
        } else if (draggedCenterY > itemCenterY + 10) {
          item.parentNode.insertBefore(draggedElement, item.nextSibling);
        } else if (draggedCenterX < itemCenterX) {
          item.parentNode.insertBefore(draggedElement, item);
        } else {
          item.parentNode.insertBefore(draggedElement, item.nextSibling);
        }
      }
      
      item.classList.add('swap-animate');
      setTimeout(() => {
        item.classList.remove('swap-animate');
      }, 300);
    } else {
      item.classList.remove('hover-target');
    }
  });
  
  // 检测最近占位格子（grid 占位）
  let nearestPlaceholder = null;
  let nearestDistance = Infinity;
  
  allPlaceholders.forEach(ph => {
    const rect = ph.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distance = Math.hypot(touchCurrentX - centerX, touchCurrentY - centerY);
    
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestPlaceholder = ph;
    }
  });
  
  if (nearestPlaceholder && nearestDistance < 68) {
    nearestPlaceholder.parentNode.insertBefore(draggedElement, nearestPlaceholder);
  }
}

// 结束拖拽
function endDrag() {
  const pageAtDragEnd = currentPage;
  
  if (draggedElement) {
    draggedElement.classList.remove('dragging-original', 'hover-target');
    draggedElement.style.zIndex = originalZIndex;
    
    const parent = draggedElement.parentNode;
    const inWidgetSlot = parent && parent.classList.contains('widget-slot');
    const targetGrid = document.querySelectorAll('.app-grid')[pageAtDragEnd];
    
    // 仅当不在 widget-slot 也不在 app-grid 时才兜底回到 grid
    if (!inWidgetSlot && parent !== targetGrid) {
      targetGrid.appendChild(draggedElement);
    }
  }
  
  if (draggedClone) {
    draggedClone.style.opacity = '0';
    draggedClone.style.transform = 'scale(0.8) rotate(0deg)';
    draggedClone.style.transition = 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
    
    setTimeout(() => {
      draggedClone.remove();
      draggedClone = null;
    }, 300);
  }
  
  draggedElement = null;
  justFinishedDrag = true;
  setTimeout(() => { justFinishedDrag = false; }, 200);
  
  document.removeEventListener('touchmove', handleDragMove);
  
  saveIconOrder();
}

// 初始化拖拽
function initTouchDrag() {
  const appItems = document.querySelectorAll('.app-item');
  
  appItems.forEach((item) => {
    item.addEventListener('touchstart', (e) => {
      if (isEditMode) {
        startDrag(item, e);
      } else {
        dragStartTime = Date.now();
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        
        pressTimer = setTimeout(() => {
          playPressAnimation(item);
          enterEditMode();
          startDrag(item, e);
        }, 600);
      }
    }, { passive: true });
    
    item.addEventListener('touchmove', (e) => {
      if (!isEditMode) {
        const moveX = Math.abs(e.touches[0].clientX - touchStartX);
        const moveY = Math.abs(e.touches[0].clientY - touchStartY);
        
        if (moveX > 10 || moveY > 10) {
          clearTimeout(pressTimer);
        }
      }
    }, { passive: true });
    
    item.addEventListener('touchend', (e) => {
      clearTimeout(pressTimer);
      if (draggedElement) {
        endDrag();
      }
    }, { passive: true });
  });
}

initTouchDrag();

// ===== 点击空白区域退出编辑模式 =====
document.querySelector('.phone-screen').addEventListener('click', (e) => {
  if (!e.target.closest('.app-item') && isEditMode) {
    exitEditMode();
  }
});

// ==========================================
// 多页面管理
// ==========================================
let currentPage = 0;
const totalPages = 2;

// 从数据库加载当前页面
async function loadCurrentPage() {
  const savedPage = await HomeDB.getItem('current_page');
  if (savedPage !== null) {
    currentPage = savedPage;
    updatePageDots();
    updateGridVisibility();
  }
}

// 保存当前页面到数据库
async function saveCurrentPage() {
  await HomeDB.setItem('current_page', currentPage);
}

// 更新页面指示器
function updatePageDots() {
  document.querySelectorAll('.page-dots .dot').forEach((dot, index) => {
    dot.classList.toggle('active', index === currentPage);
  });
}

// 更新网格可见性
function updateGridVisibility() {
  setWrapperX(getPageX(currentPage), false);
  updateTopWidgets(currentPage, '1');
}

// 翻页处理
let lastPage = 0;
function goToPage(pageIndex) {
  if (pageIndex >= 0 && pageIndex < totalPages && pageIndex !== currentPage) {
    lastPage = currentPage;
    currentPage = pageIndex;
    updatePageDots();
    updateGridVisibility();
    saveCurrentPage();
  }
}

// ===== 页面指示器切换 =====
document.querySelectorAll('.page-dots .dot').forEach((dot, index) => {
  dot.addEventListener('click', () => {
    if (!isEditMode && !draggedElement) {
      goToPage(index);
    }
  });
});

// ==========================================
// 流畅滑动翻页功能 - wrapper 跟手效果
// ==========================================
let touchStartPageX = 0;
let touchStartPageY = 0;
let isHorizontalSwipe = false;
let isVerticalScroll = false;
let justFinishedDrag = false;

const phoneScreen = document.querySelector('.phone-screen');
const pagesWrapper = document.querySelector('.pages-wrapper');

function getWrapperX() {
  const transform = pagesWrapper.style.transform;
  if (!transform) return 0;
  const match = transform.match(/translateX\((.+)px\)/);
  return match ? parseFloat(match[1]) : 0;
}

function setWrapperX(x, animate) {
  pagesWrapper.style.transition = animate
    ? 'transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    : 'none';
  pagesWrapper.style.transform = `translateX(${x}px)`;
}

function getPageX(page) {
  const w = phoneScreen.offsetWidth;
  return -page * w;
}

function updateTopWidgets(page, opacity) {
  const profileWidget = document.querySelector('.profile-widget');
  const widgetArea = document.querySelector('.widget-area');
  const phoneScreen = document.querySelector('.phone-screen');
  if (page === 0) {
    profileWidget.style.opacity = opacity;
    widgetArea.style.opacity = opacity;
    profileWidget.style.pointerEvents = opacity === '1' ? 'auto' : 'none';
    widgetArea.style.pointerEvents = opacity === '1' ? 'auto' : 'none';
    phoneScreen.classList.remove('page-1');
  } else {
    profileWidget.style.opacity = '0';
    widgetArea.style.opacity = '0';
    profileWidget.style.pointerEvents = 'none';
    widgetArea.style.pointerEvents = 'none';
    phoneScreen.classList.add('page-1');
  }
}

phoneScreen.addEventListener('touchstart', (e) => {
  if (draggedElement || justFinishedDrag) return;
  touchStartPageX = e.touches[0].clientX;
  touchStartPageY = e.touches[0].clientY;
  isVerticalScroll = false;
  isHorizontalSwipe = false;
  pagesWrapper.style.transition = 'none';
}, { passive: true });

phoneScreen.addEventListener('touchmove', (e) => {
  if (draggedElement || justFinishedDrag) return;

  const moveX = e.touches[0].clientX - touchStartPageX;
  const moveY = e.touches[0].clientY - touchStartPageY;

  if (!isHorizontalSwipe && !isVerticalScroll) {
    if (Math.abs(moveY) > Math.abs(moveX) && Math.abs(moveY) > 12) {
      isVerticalScroll = true;
      return;
    }
    if (Math.abs(moveX) > 4) {
      isHorizontalSwipe = true;
    }
  }

  if (!isHorizontalSwipe) return;

  const baseX = getPageX(currentPage);
  let offset = moveX;

  // 边界阻尼
  if ((currentPage === 0 && moveX > 0) || (currentPage === totalPages - 1 && moveX < 0)) {
    offset = moveX * 0.2;
  }

  setWrapperX(baseX + offset, false);

  // 顶部组件透明度跟随
  const ratio = Math.abs(moveX) / phoneScreen.offsetWidth;
  const profileWidget = document.querySelector('.profile-widget');
  const widgetArea = document.querySelector('.widget-area');
  if (currentPage === 0 && moveX < 0) {
    profileWidget.style.opacity = String(1 - ratio);
    widgetArea.style.opacity = String(1 - ratio);
  } else if (currentPage === 1 && moveX > 0) {
    profileWidget.style.opacity = String(ratio);
    widgetArea.style.opacity = String(ratio);
  }
}, { passive: true });

phoneScreen.addEventListener('touchend', (e) => {
  if (draggedElement || justFinishedDrag) {
    touchStartPageX = 0;
    return;
  }

  if (!isHorizontalSwipe) {
    touchStartPageX = 0;
    return;
  }

  const diff = touchStartPageX - e.changedTouches[0].clientX;

  let targetPage = currentPage;
  if (diff > 25 && currentPage < totalPages - 1) {
    targetPage = currentPage + 1;
  } else if (diff < -25 && currentPage > 0) {
    targetPage = currentPage - 1;
  }

  setWrapperX(getPageX(targetPage), true);

  setTimeout(() => {
    currentPage = targetPage;
    updatePageDots();
    saveCurrentPage();
    updateTopWidgets(currentPage, '1');
  }, 350);

  touchStartPageX = 0;
  isHorizontalSwipe = false;
  isVerticalScroll = false;
}, { passive: true });

// ===== 页面加载时恢复图标顺序，默认回到第一页 =====
window.addEventListener('DOMContentLoaded', () => {
  loadIconOrder();
  currentPage = 0;
  updatePageDots();
  updateGridVisibility();
});


// ==========================================
// 头像上传（IndexedDB 持久化）
// ==========================================
const AVATAR_TARGETS = [
  { id: 'profileAvatar', key: 'avatar_main' },
  { id: 'cardAvatar1',   key: 'avatar_card1' },
  { id: 'cardAvatar2',   key: 'avatar_card2' },
  { id: 'profileCover',  key: 'bg_cover' },
  { id: 'profileInfoBg', key: 'bg_info' }
];

function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result);
    fr.onerror = reject;
    fr.readAsDataURL(file);
  });
}

function applyAvatarBg(el, dataUrl) {
  el.style.backgroundImage = `url("${dataUrl}")`;
  el.style.backgroundSize = 'cover';
  el.style.backgroundPosition = 'center';
  el.style.backgroundRepeat = 'no-repeat';
  el.classList.add('has-image');
}

async function loadAvatars() {
  for (const { id, key } of AVATAR_TARGETS) {
    const el = document.getElementById(id);
    if (!el) continue;
    const data = await HomeDB.getItem(key);
    if (data) applyAvatarBg(el, data);
  }
}

function bindAvatarUpload(el, key) {
  el.addEventListener('click', (e) => {
    e.stopPropagation();
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.style.display = 'none';
    document.body.appendChild(input);
    input.addEventListener('change', async () => {
      const file = input.files && input.files[0];
      input.remove();
      if (!file) return;
      try {
        const dataUrl = await fileToDataURL(file);
        applyAvatarBg(el, dataUrl);
        await HomeDB.setItem(key, dataUrl);
      } catch (err) {}
    });
    input.click();
  });
}

window.addEventListener('DOMContentLoaded', () => {
  AVATAR_TARGETS.forEach(({ id, key }) => {
    const el = document.getElementById(id);
    if (el) bindAvatarUpload(el, key);
  });
  loadAvatars();
  initEditableTexts();
});

// ==========================================
// 文案就地编辑（IndexedDB 持久化 + 浮动重置按钮）
// ==========================================
const editDefaults = new Map();
let currentEditingEl = null;

const resetBtn = document.createElement('button');
resetBtn.className = 'edit-reset-btn';
resetBtn.type = 'button';
resetBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 5V1L7 6l5 5V7c3.3 0 6 2.7 6 6s-2.7 6-6 6-6-2.7-6-6H4c0 4.4 3.6 8 8 8s8-3.6 8-8-3.6-8-8-8z"/></svg>重置';
document.body.appendChild(resetBtn);

function showResetBtn(el) {
  const r = el.getBoundingClientRect();
  const btnW = 60;
  let left = r.right - btnW;
  if (left < 8) left = 8;
  if (left + btnW > window.innerWidth - 8) left = window.innerWidth - btnW - 8;
  let top = r.top - 30;
  if (top < 8) top = r.bottom + 6;
  resetBtn.style.left = left + 'px';
  resetBtn.style.top = top + 'px';
  resetBtn.classList.add('visible');
}

function hideResetBtn() {
  resetBtn.classList.remove('visible');
}

async function initEditableTexts() {
  const els = document.querySelectorAll('[data-edit-key]');
  // 先记录默认值
  els.forEach(el => {
    editDefaults.set(el.dataset.editKey, el.textContent);
  });
  // 从 DB 恢复
  for (const el of els) {
    const saved = await HomeDB.getItem('text_' + el.dataset.editKey);
    if (saved !== null && saved !== undefined) {
      el.textContent = saved;
    }
  }
  // 绑定事件
  els.forEach(el => {
    el.addEventListener('focus', () => {
      currentEditingEl = el;
      showResetBtn(el);
    });
    el.addEventListener('blur', () => {
      setTimeout(() => {
        if (currentEditingEl === el) {
          hideResetBtn();
          currentEditingEl = null;
        }
      }, 200);
    });
    el.addEventListener('input', async () => {
      await HomeDB.setItem('text_' + el.dataset.editKey, el.textContent);
      if (currentEditingEl === el) showResetBtn(el);
    });
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        el.blur();
      }
    });
  });
}

async function resetCurrentEditing() {
  if (!currentEditingEl) return;
  const key = currentEditingEl.dataset.editKey;
  const def = editDefaults.get(key);
  if (def === undefined) return;
  currentEditingEl.textContent = def;
  await HomeDB.setItem('text_' + key, def);
  showResetBtn(currentEditingEl);
}

// mousedown / touchstart 阻止默认，避免 blur 先触发
resetBtn.addEventListener('mousedown', (e) => {
  e.preventDefault();
  resetCurrentEditing();
});
resetBtn.addEventListener('touchstart', (e) => {
  e.preventDefault();
  resetCurrentEditing();
}, { passive: false });

window.addEventListener('scroll', () => {
  if (currentEditingEl) showResetBtn(currentEditingEl);
}, true);
window.addEventListener('resize', () => {
  if (currentEditingEl) showResetBtn(currentEditingEl);
});

// ==========================================
// 编辑模式：组件区域恢复默认（保留头像）
// ==========================================
async function resetWidgetArea() {
  // 仅清空 cover 和 info-bg 的上传图（文案、头像一律不动）
  const cover = document.getElementById('profileCover');
  const infoBg = document.getElementById('profileInfoBg');
  if (cover) {
    cover.style.backgroundImage = '';
    cover.classList.remove('has-image');
  }
  if (infoBg) {
    infoBg.style.backgroundImage = '';
    infoBg.classList.remove('has-image');
  }
  await HomeDB.setItem('bg_cover', null);
  await HomeDB.setItem('bg_info', null);
}

// 捕获阶段拦截，防止冒泡到 phone-screen click 退出编辑模式
document.addEventListener('click', (e) => {
  const btn = e.target.closest('.edit-reset-icon');
  if (!btn) return;
  e.stopPropagation();
  e.preventDefault();
  resetWidgetArea();
}, true);
  // 世界书 App 入口
  document.querySelectorAll('.app-item').forEach(item => {
    const label = item.querySelector('.app-label');
    if (!label) return;
    const text = label.textContent.trim();
    if (text === '小宇宙' || text === 'WorldBook' || text === '世界书') {
      item.addEventListener('click', (e) => {
        if (document.querySelector('.app-grid.edit-mode-active')) return;
        e.stopPropagation();
        if (window.openWorldBook) window.openWorldBook();
      });
    }
  });
