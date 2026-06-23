/**
 * 无限滚动 + 虚拟列表 App
 */
const scrollContainer = document.getElementById('scrollContainer');
const contentEl = document.getElementById('content');
const sentinel = document.getElementById('sentinel');
const totalCountEl = document.getElementById('totalCount');
const renderCountEl = document.getElementById('renderCount');
const scrollPosEl = document.getElementById('scrollPos');

const ITEM_HEIGHT = 80;
const PAGE_SIZE = 20;
const MAX_ITEMS = 1000;
const COLORS = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c', '#e67e22'];

let allItems = [];
let mode = 'normal'; // normal | virtual

// 模拟数据
function generateItems(start, count) {
  const items = [];
  for (let i = start; i < start + count && i < MAX_ITEMS; i++) {
    items.push({
      id: i,
      name: `用户 ${i + 1}`,
      desc: `这是第 ${i + 1} 条数据，用于演示无限滚动与虚拟列表性能`,
      color: COLORS[i % COLORS.length],
    });
  }
  return items;
}

function renderItem(item, index) {
  if (mode === 'virtual') {
    // 虚拟列表模式：返回单独的元素
    const el = document.createElement('div');
    el.className = 'list-item';
    el.innerHTML = `
      <div class="item-avatar" style="background:${item.color}">${item.name.slice(-2)}</div>
      <div class="item-content">
        <div class="item-title">${item.name}</div>
        <div class="item-desc">${item.desc}</div>
      </div>
    `;
    return el;
  }
  // 普通模式
  const el = document.createElement('div');
  el.className = 'list-item';
  el.innerHTML = `
    <div class="item-avatar" style="background:${item.color}">${item.name.slice(-2)}</div>
    <div class="item-content">
      <div class="item-title">${item.name}</div>
      <div class="item-desc">${item.desc}</div>
    </div>
  `;
  return el;
}

// ============ 虚拟列表实例 ============
const virtualList = new VirtualList({
  container: scrollContainer,
  itemHeight: ITEM_HEIGHT,
  bufferSize: 5,
  renderItem: (item, index) => renderItem(item, index),
});

virtualList.onUpdate = ({ renderedCount }) => {
  renderCountEl.textContent = renderedCount;
};

// ============ 加载更多 ============
let loading = false;
async function loadMore() {
  if (loading || allItems.length >= MAX_ITEMS) return;
  loading = true;
  showLoading();

  // 模拟网络延迟
  await new Promise(r => setTimeout(r, 600));

  const newItems = generateItems(allItems.length, PAGE_SIZE);
  allItems = allItems.concat(newItems);
  totalCountEl.textContent = allItems.length;

  if (mode === 'virtual') {
    virtualList.setItems(allItems);
  } else {
    newItems.forEach(item => contentEl.appendChild(renderItem(item)));
    renderCountEl.textContent = contentEl.children.length;
  }

  hideLoading();
  loading = false;

  if (allItems.length >= MAX_ITEMS) {
    showEndTip();
  }
}

function showLoading() {
  let indicator = document.getElementById('loadingIndicator');
  if (!indicator) {
    indicator = document.createElement('div');
    indicator.id = 'loadingIndicator';
    indicator.className = 'loading-indicator';
    indicator.innerHTML = '加载中<span class="dots"></span>';
    scrollContainer.appendChild(indicator);
  }
}

function hideLoading() {
  const indicator = document.getElementById('loadingIndicator');
  if (indicator) indicator.remove();
}

function showEndTip() {
  let tip = document.getElementById('endTip');
  if (!tip) {
    tip = document.createElement('div');
    tip.id = 'endTip';
    tip.className = 'end-tip';
    tip.textContent = '已加载全部数据';
    scrollContainer.appendChild(tip);
  }
}

// ============ IntersectionObserver 滚动加载 ============
const observer = new IntersectionObserver(
  (entries) => {
    if (entries[0].isIntersecting) {
      loadMore();
    }
  },
  { root: scrollContainer, threshold: 0 }
);
observer.observe(sentinel);

// ============ 滚动位置追踪 ============
scrollContainer.addEventListener('scroll', () => {
  scrollPosEl.textContent = Math.round(scrollContainer.scrollTop);
}, { passive: true });

// ============ 模式切换 ============
function switchMode(newMode) {
  mode = newMode;
  document.getElementById('modeNormal').classList.toggle('active', mode === 'normal');
  document.getElementById('modeVirtual').classList.toggle('active', mode === 'virtual');

  // 清空
  contentEl.innerHTML = '';
  scrollContainer.innerHTML = '';

  if (mode === 'virtual') {
    virtualList.enable();
    virtualList.setItems(allItems);
  } else {
    virtualList.disable();
    scrollContainer.appendChild(contentEl);
    allItems.forEach(item => contentEl.appendChild(renderItem(item)));
    scrollContainer.appendChild(sentinel);
    renderCountEl.textContent = contentEl.children.length;
    // 重新观察 sentinel
    observer.observe(sentinel);
  }
}

document.getElementById('modeNormal').addEventListener('click', () => switchMode('normal'));
document.getElementById('modeVirtual').addEventListener('click', () => switchMode('virtual'));

// ============ 初始化 ============
loadMore();
