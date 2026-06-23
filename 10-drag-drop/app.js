/**
 * 拖拽系统 - 原生 JS 实现
 * 三大模式：拖拽排序 · 自由拖动+吸附 · 网格布局
 */

// ============ Tab 切换 ============
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.demo-section').forEach(s => s.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById('section-' + tab.dataset.tab).classList.add('active');
  });
});

// ============ 通用拖拽工具 ============
/**
 * 基于 pointer 事件的通用拖拽
 * 支持 mouse + touch
 */
function makeDraggable(el, options = {}) {
  let startX, startY, origX, origY;
  let dragging = false;

  el.addEventListener('pointerdown', (e) => {
    if (options.disabled) return;
    dragging = true;
    startX = e.clientX;
    startY = e.clientY;
    const rect = el.getBoundingClientRect();
    const parent = el.offsetParent.getBoundingClientRect();
    origX = rect.left - parent.left;
    origY = rect.top - parent.top;

    el.setPointerCapture(e.pointerId);
    if (options.onStart) options.onStart(e, { x: origX, y: origY });
    e.preventDefault();
  });

  el.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    const newX = origX + dx;
    const newY = origY + dy;
    if (options.onMove) {
      options.onMove(e, { x: newX, y: origY + dy, dx, dy });
    } else {
      el.style.left = newX + 'px';
      el.style.top = newY + 'px';
    }
  });

  el.addEventListener('pointerup', (e) => {
    if (!dragging) return;
    dragging = false;
    el.releasePointerCapture(e.pointerId);
    if (options.onEnd) options.onEnd(e);
  });
}

// ============ 1. 拖拽排序 ============
const sortList = document.getElementById('sortList');
const sortItems = [
  { id: 1, label: 'JavaScript 基础' },
  { id: 2, label: 'DOM 操作' },
  { id: 3, label: '事件系统' },
  { id: 4, label: '异步编程' },
  { id: 5, label: 'ES6+ 特性' },
  { id: 6, label: '设计模式' },
];

let dragSrcEl = null;

function renderSortList() {
  sortList.innerHTML = '';
  sortItems.forEach((item, index) => {
    const el = document.createElement('div');
    el.className = 'sort-item';
    el.draggable = true;
    el.dataset.id = item.id;
    el.innerHTML = `
      <span class="handle">⋮⋮</span>
      <span class="index">${index + 1}</span>
      <span class="label">${item.label}</span>
    `;

    // HTML5 Drag API
    el.addEventListener('dragstart', (e) => {
      dragSrcEl = el;
      el.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });

    el.addEventListener('dragend', () => {
      el.classList.remove('dragging');
      sortList.querySelectorAll('.sort-item').forEach(i => i.classList.remove('drag-over'));
      updateSortOrder();
    });

    el.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      const afterEl = getDragAfterElement(sortList, e.clientY);
      sortList.querySelectorAll('.sort-item').forEach(i => i.classList.remove('drag-over'));
      if (afterEl == null) {
        sortList.appendChild(el);
      } else if (afterEl !== el) {
        sortList.insertBefore(el, afterEl);
      }
    });

    sortList.appendChild(el);
  });
}

// 计算应该插入到哪个元素之前
function getDragAfterElement(container, y) {
  const items = [...container.querySelectorAll('.sort-item:not(.dragging)')];
  return items.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    if (offset < 0 && offset > closest.offset) {
      return { offset, element: child };
    }
    return closest;
  }, { offset: -Infinity }).element;
}

function updateSortOrder() {
  const newOrder = [...sortList.querySelectorAll('.sort-item')].map((el, i) => ({
    id: Number(el.dataset.id),
    label: el.querySelector('.label').textContent,
  }));
  sortItems.length = 0;
  sortItems.push(...newOrder);
  // 更新序号
  sortList.querySelectorAll('.sort-item').forEach((el, i) => {
    el.querySelector('.index').textContent = i + 1;
  });
}

renderSortList();

// ============ 2. 自由拖动 + 碰撞吸附 ============
const freeCanvas = document.getElementById('freeCanvas');
let snapEnabled = true;
let snapPoints = [];

// 初始吸附点（圆心位置）
const initSnapPoints = [
  { x: 300, y: 200 },
];

function renderSnapPoints() {
  // 清除旧的吸附点标记
  freeCanvas.querySelectorAll('.snap-point').forEach(el => el.remove());
  snapPoints.forEach(pt => {
    const dot = document.createElement('div');
    dot.className = 'snap-point';
    dot.style.cssText = `
      position: absolute; left: ${pt.x}px; top: ${pt.y}px;
      width: 20px; height: 20px; border-radius: 50%;
      border: 3px solid #2ecc71; background: rgba(46,204,113,0.2);
      transform: translate(-50%, -50%); pointer-events: none;
      z-index: 0;
    `;
    freeCanvas.appendChild(dot);
  });
}

snapPoints = [...initSnapPoints];
renderSnapPoints();

const SNAP_THRESHOLD = 35;

freeCanvas.querySelectorAll('.free-item').forEach(item => {
  makeDraggable(item, {
    onStart: (e) => {
      item.style.zIndex = '100';
    },
    onMove: (e, pos) => {
      let x = pos.x;
      let y = pos.y;
      let snapped = false;

      // 碰撞吸附
      if (snapEnabled) {
        for (const pt of snapPoints) {
          const cx = x + item.offsetWidth / 2;
          const cy = y + item.offsetHeight / 2;
          const dist = Math.hypot(cx - pt.x, cy - pt.y);
          if (dist < SNAP_THRESHOLD) {
            x = pt.x - item.offsetWidth / 2;
            y = pt.y - item.offsetHeight / 2;
            snapped = true;
            break;
          }
        }
      }

      // 限制在画布内
      x = Math.max(0, Math.min(freeCanvas.clientWidth - item.offsetWidth, x));
      y = Math.max(0, Math.min(freeCanvas.clientHeight - item.offsetHeight, y));

      item.style.left = x + 'px';
      item.style.top = y + 'px';
      item.classList.toggle('snapped', snapped);
    },
    onEnd: () => {
      item.style.zIndex = '';
    },
  });
});

document.getElementById('toggleSnap').addEventListener('click', function () {
  snapEnabled = !snapEnabled;
  this.textContent = '吸附：' + (snapEnabled ? '开启' : '关闭');
});

document.getElementById('addSnapPoint').addEventListener('click', () => {
  snapPoints.push({
    x: 50 + Math.random() * (freeCanvas.clientWidth - 100),
    y: 50 + Math.random() * (freeCanvas.clientHeight - 100),
  });
  renderSnapPoints();
});

document.getElementById('clearSnap').addEventListener('click', () => {
  snapPoints = [];
  renderSnapPoints();
});

// ============ 3. 网格布局拖拽 ============
const gridCells = document.getElementById('gridCells');
const GRID_COLS = 4;
const GRID_ROWS = 4;
const GRID_TOTAL = GRID_COLS * GRID_ROWS;

// 网格状态：每个格子存放的方块颜色
const gridState = new Array(GRID_TOTAL).fill(null);
// 初始放置几个方块
const blockColors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6'];
blockColors.forEach((color, i) => {
  gridState[i] = { color, label: String.fromCharCode(65 + i) }; // A, B, C...
});

function renderGrid() {
  gridCells.innerHTML = '';
  for (let i = 0; i < GRID_TOTAL; i++) {
    const cell = document.createElement('div');
    cell.className = 'grid-cell';
    cell.dataset.index = i;

    if (gridState[i]) {
      cell.classList.add('has-item');
      const block = document.createElement('div');
      block.className = 'grid-block';
      block.style.background = gridState[i].color;
      block.textContent = gridState[i].label;
      block.draggable = true;
      block.dataset.from = i;

      // 拖拽开始
      block.addEventListener('dragstart', (e) => {
        block.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', String(i));
        // 创建拖拽预览
        setTimeout(() => block.style.opacity = '0.3', 0);
      });

      block.addEventListener('dragend', () => {
        block.classList.remove('dragging');
        block.style.opacity = '';
        renderGrid();
      });

      cell.appendChild(block);
    }

    // 放置目标
    cell.addEventListener('dragover', (e) => {
      e.preventDefault();
      cell.classList.add('hover');
    });

    cell.addEventListener('dragleave', () => {
      cell.classList.remove('hover');
    });

    cell.addEventListener('drop', (e) => {
      e.preventDefault();
      cell.classList.remove('hover');
      const fromIndex = Number(e.dataTransfer.getData('text/plain'));
      const toIndex = Number(cell.dataset.index);

      if (fromIndex === toIndex) return;

      // 交换或移动
      if (gridState[toIndex]) {
        // 交换
        [gridState[fromIndex], gridState[toIndex]] = [gridState[toIndex], gridState[fromIndex]];
      } else {
        // 移动
        gridState[toIndex] = gridState[fromIndex];
        gridState[fromIndex] = null;
      }
      renderGrid();
    });

    gridCells.appendChild(cell);
  }
}

renderGrid();
