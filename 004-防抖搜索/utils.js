/**
 * 防抖 / 节流工具函数
 */

/**
 * 防抖：在停止输入后的 delay ms 才执行
 * @param {function} fn
 * @param {number} delay
 * @returns {function} debounced function（带 .cancel 方法）
 */
function debounce(fn, delay = 300) {
  let timer = null;
  function debounced(...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
      timer = null;
    }, delay);
  }
  debounced.cancel = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  };
  debounced.flush = (...args) => {
    if (timer) clearTimeout(timer);
    fn.apply(this, args);
    timer = null;
  };
  return debounced;
}

/**
 * 节流：固定时间间隔内最多执行一次
 * @param {function} fn
 * @param {number} interval
 */
function throttle(fn, interval = 300) {
  let lastTime = 0;
  let timer = null;
  return function (...args) {
    const now = Date.now();
    const remaining = interval - (now - lastTime);
    if (remaining <= 0) {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      lastTime = now;
      fn.apply(this, args);
    } else if (!timer) {
      timer = setTimeout(() => {
        lastTime = Date.now();
        timer = null;
        fn.apply(this, args);
      }, remaining);
    }
  };
}

/**
 * 可取消的异步请求 + 错误重试
 * 演示用：模拟网络搜索
 */
async function mockSearch(keyword, { signal } = {}) {
  // 模拟网络延迟
  const delay = 400 + Math.random() * 600;
  await new Promise((resolve, reject) => {
    const t = setTimeout(resolve, delay);
    // 支持 AbortController 取消
    if (signal) {
      if (signal.aborted) {
        clearTimeout(t);
        reject(new DOMException('Aborted', 'AbortError'));
        return;
      }
      signal.addEventListener('abort', () => {
        clearTimeout(t);
        reject(new DOMException('Aborted', 'AbortError'));
      });
    }
  });

  // 模拟 20% 失败率（演示重试）
  if (Math.random() < 0.2) {
    throw new Error('网络请求失败（模拟）');
  }

  // 模拟搜索结果
  const data = [
    'JavaScript 防抖与节流详解',
    'JavaScript AbortController 使用指南',
    '前端性能优化最佳实践',
    'React Hooks 深入理解',
    'Vue3 响应式原理剖析',
    'CSS Grid 布局完全教程',
    'TypeScript 高级类型',
    'Node.js 流式处理',
    'Webpack 5 模块联邦',
    'Canvas 动画与游戏开发',
    'Web Worker 多线程编程',
    'Service Worker PWA 实战',
  ];

  const results = data
    .filter((item) => item.toLowerCase().includes(keyword.toLowerCase()))
    .map((text, i) => ({ id: i, title: text, url: `https://example.com/${i}` }));

  return { keyword, results, total: results.length };
}
