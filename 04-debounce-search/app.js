/**
 * 搜索框系统：防抖 + AbortController 取消 + loading + 错误重试
 */
const searchInput = document.getElementById('searchInput');
const searchIcon = document.getElementById('searchIcon');
const statusBar = document.getElementById('statusBar');
const statusText = document.getElementById('statusText');
const retryBtn = document.getElementById('retryBtn');
const resultsEl = document.getElementById('results');

let currentController = null; // 当前请求的 AbortController
let lastKeyword = '';         // 上次搜索的关键词（用于重试）
let retryCount = 0;
const MAX_RETRY = 3;

function setStatus(text, type = '') {
  statusText.textContent = text;
  statusText.className = type;
}

function setLoading(isLoading) {
  if (isLoading) {
    searchIcon.style.display = 'none';
    if (!document.getElementById('spinner')) {
      const spinner = document.createElement('div');
      spinner.id = 'spinner';
      spinner.className = 'spinner';
      searchInput.parentElement.appendChild(spinner);
    }
  } else {
    searchIcon.style.display = '';
    const spinner = document.getElementById('spinner');
    if (spinner) spinner.remove();
  }
}

function renderResults(data) {
  if (!data || data.results.length === 0) {
    resultsEl.innerHTML = '<div class="empty">未找到相关结果</div>';
    return;
  }
  resultsEl.innerHTML = data.results.map(r =>
    `<div class="result-item">
      <div class="result-title">${highlightKeyword(r.title, data.keyword)}</div>
      <div class="result-url">${r.url}</div>
    </div>`
  ).join('');
}

function highlightKeyword(text, keyword) {
  if (!keyword) return text;
  const reg = new RegExp(`(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(reg, '<span class="highlight">$1</span>');
}

/**
 * 核心搜索函数：带取消 + 重试
 */
async function doSearch(keyword, isRetry = false) {
  if (!isRetry) retryCount = 0;
  lastKeyword = keyword;

  // 取消上一次未完成的请求
  if (currentController) {
    currentController.abort();
  }

  currentController = new AbortController();

  setLoading(true);
  retryBtn.style.display = 'none';
  setStatus(`正在搜索 "${keyword}"...`);

  try {
    const data = await mockSearch(keyword, { signal: currentController.signal });
    setLoading(false);
    setStatus(`搜索完成，找到 ${data.total} 条结果`, 'success');
    renderResults(data);
  } catch (err) {
    setLoading(false);

    // AbortError：被新请求取消，不处理
    if (err.name === 'AbortError') return;

    // 其他错误：重试
    retryCount++;
    if (retryCount <= MAX_RETRY) {
      setStatus(`请求失败，自动重试中 (${retryCount}/${MAX_RETRY})...`, 'error');
      setTimeout(() => doSearch(keyword, true), 500 * retryCount);
    } else {
      setStatus(`搜索失败：${err.message}`, 'error');
      retryBtn.style.display = 'inline';
    }
  }
}

// 防抖搜索
const debouncedSearch = debounce((keyword) => {
  if (!keyword) {
    if (currentController) currentController.abort();
    setLoading(false);
    setStatus('输入关键词开始搜索');
    resultsEl.innerHTML = '<div class="empty">暂无结果</div>';
    return;
  }
  doSearch(keyword);
}, 400);

searchInput.addEventListener('input', (e) => {
  debouncedSearch(e.target.value.trim());
});

retryBtn.addEventListener('click', () => {
  retryCount = 0;
  doSearch(lastKeyword);
});

// ============ 防抖 vs 节流可视化对比 ============
const throttleBar = document.getElementById('throttleBar');
const debounceTrack = document.getElementById('debounceTrack');
const throttleTrack = document.getElementById('throttleTrack');
const debounceCountEl = document.getElementById('debounceCount');
const throttleCountEl = document.getElementById('throttleCount');

let debounceCount = 0;
let throttleCount = 0;

const updateDebounceTrack = debounce((x) => {
  debounceTrack.style.left = x + 'px';
  debounceCount++;
  debounceCountEl.textContent = debounceCount;
}, 500);

const updateThrottleTrack = throttle((x) => {
  throttleTrack.style.left = x + 'px';
  throttleCount++;
  throttleCountEl.textContent = throttleCount;
}, 200);

throttleBar.addEventListener('mousemove', (e) => {
  const rect = throttleBar.getBoundingClientRect();
  const x = Math.max(0, Math.min(rect.width - 3, e.clientX - rect.left));
  updateDebounceTrack(x);
  updateThrottleTrack(x);
});
