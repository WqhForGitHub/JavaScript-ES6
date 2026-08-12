/**
 * MiniHTTP 演示应用
 * 演示：拦截器 · 重试 · 超时 · 并发控制
 *
 * 注意：因为 demo 运行在本地，这里用 mock 请求代替真实 fetch，
 * 通过覆盖 http._fetch 来模拟网络请求行为。
 */

const logEl = document.getElementById('log');

function log(msg, type = 'info') {
  const ts = new Date().toLocaleTimeString('zh-CN', { hour12: false });
  const line = document.createElement('div');
  line.className = 'log-line ' + type;
  line.innerHTML = `<span class="ts">[${ts}]</span> ${msg}`;
  logEl.appendChild(line);
  logEl.scrollTop = logEl.scrollHeight;
}

// ============ 注册拦截器 ============
// 请求拦截器：自动添加 token
http.useRequestInterceptor(
  (config) => {
    config.headers = config.headers || {};
    config.headers['Authorization'] = 'Bearer mock-token-xxx';
    log(`📤 请求拦截器：添加 Token → ${config.method} ${config.url}`, 'info');
    return config;
  },
  (err) => {
    log(`📤 请求拦截器错误：${err.message}`, 'error');
    return Promise.reject(err);
  }
);

// 响应拦截器：统一日志 + 错误处理
http.useResponseInterceptor(
  (res) => {
    log(
      `📥 响应拦截器：状态 ${res.status}，数据 ${JSON.stringify(res.data).slice(0, 80)}`,
      'success'
    );
    return res;
  },
  (err) => {
    log(`📥 响应拦截器捕获错误：${err.message}`, 'error');
    return Promise.reject(err);
  }
);

// ============ Mock fetch（模拟网络请求） ============
http._fetch = function (url, method, data, headers, timeout) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const delay = 800 + Math.random() * 1200;

    const timer = setTimeout(
      () => {
        const err = new Error(`请求超时 (${timeout}ms)`);
        err.isTimeout = true;
        reject(err);
      },
      Math.min(delay, timeout)
    );

    // 模拟网络请求完成
    setTimeout(() => {
      clearTimeout(timer);

      // 检查是否被超时抢先 reject
      if (Date.now() - startTime >= timeout) return;

      // 模拟失败率
      const failRate = window._currentFailRate || 0;
      if (Math.random() * 100 < failRate) {
        reject(new Error('网络错误（模拟）'));
        return;
      }

      // 模拟成功响应
      resolve({
        data: {
          ok: true,
          method,
          url,
          echoedData: data || null,
          timestamp: Date.now(),
        },
        status: 200,
        headers: new Map(),
      });
    }, delay);
  });
};

// ============ 拦截器演示 ============
document.getElementById('btnGet').addEventListener('click', async () => {
  log('━━━ GET 请求 ━━━', 'info');
  window._currentFailRate = 0;
  try {
    const res = await http.get('https://api.example.com/users', {
      params: { page: 1, size: 10 },
    });
    log(`✅ 最终结果：${JSON.stringify(res.data)}`, 'success');
  } catch (err) {
    log(`❌ 请求失败：${err.message}`, 'error');
  }
});

document.getElementById('btnPost').addEventListener('click', async () => {
  log('━━━ POST 请求 ━━━', 'info');
  window._currentFailRate = 0;
  try {
    const res = await http.post('https://api.example.com/users', {
      name: 'Alice',
      age: 25,
    });
    log(`✅ 最终结果：${JSON.stringify(res.data)}`, 'success');
  } catch (err) {
    log(`❌ 请求失败：${err.message}`, 'error');
  }
});

document.getElementById('btnError').addEventListener('click', async () => {
  log('━━━ 错误请求演示 ━━━', 'info');
  window._currentFailRate = 100;
  try {
    await http.get('https://api.example.com/error', { retries: 0 });
  } catch (err) {
    log(`❌ 最终捕获：${err.message}`, 'error');
  }
  window._currentFailRate = 0;
});

// ============ 重试 + 超时演示 ============
document.getElementById('btnRetry').addEventListener('click', async () => {
  const retries = parseInt(document.getElementById('retryCount').value);
  const timeout = parseInt(document.getElementById('timeoutMs').value);
  const failRate = parseInt(document.getElementById('failRate').value);
  window._currentFailRate = failRate;

  log(`━━━ 重试请求：retries=${retries}, timeout=${timeout}ms, failRate=${failRate}% ━━━`, 'warn');

  try {
    const res = await http.get('https://api.example.com/unstable', {
      timeout,
      retries,
      retryDelay: 500,
    });
    log(`✅ 请求成功（经过重试）：${JSON.stringify(res.data)}`, 'success');
  } catch (err) {
    log(`❌ 重试 ${retries} 次后仍失败：${err.message}`, 'error');
  }
  window._currentFailRate = 0;
});

// ============ 并发控制演示 ============
document.getElementById('btnConcurrent').addEventListener('click', async () => {
  const maxConc = parseInt(document.getElementById('maxConc').value);
  const total = parseInt(document.getElementById('totalReq').value);

  // 动态调整并发上限
  http.defaults.maxConcurrency = maxConc;
  window._currentFailRate = 0;

  const visEl = document.getElementById('concVis');
  visEl.innerHTML = '';

  // 创建可视化槽位
  const slots = [];
  for (let i = 0; i < maxConc; i++) {
    const slot = document.createElement('div');
    slot.className = 'slot';
    slot.textContent = `slot${i}`;
    visEl.appendChild(slot);
    slots.push({ el: slot, busy: false });
  }

  log(`━━━ 并发控制：maxConc=${maxConc}, total=${total} ━━━`, 'warn');

  // 覆盖 _acquire / _release 来更新可视化
  const originalAcquire = http._acquire.bind(http);
  const originalRelease = http._release.bind(http);

  http._acquire = async function () {
    await originalAcquire();
    // 找一个空闲槽位
    const free = slots.find((s) => !s.busy);
    if (free) {
      free.busy = true;
      free.el.classList.add('active');
    }
  };
  http._release = function () {
    const busy = slots.find((s) => s.busy);
    if (busy) {
      busy.busy = false;
      busy.el.classList.remove('active');
    }
    originalRelease();
  };

  const requests = [];
  for (let i = 0; i < total; i++) {
    requests.push(
      http
        .get(`https://api.example.com/item/${i}`)
        .then((res) => log(`  ✓ 请求 #${i} 完成`, 'success'))
        .catch((err) => log(`  ✗ 请求 #${i} 失败：${err.message}`, 'error'))
    );
    // 显示排队
    const queuedCount = http._queue.length;
    if (queuedCount > 0) {
      log(`  ⏳ 请求 #${i} 排队中（等待 ${queuedCount} 个）`, 'warn');
    }
  }

  await Promise.allSettled(requests);
  log('━━━ 全部请求完成 ━━━', 'info');

  // 恢复
  http._acquire = originalAcquire;
  http._release = originalRelease;
});

log('MiniHTTP 已初始化', 'info');
log('已注册：请求拦截器(token) + 响应拦截器(日志)', 'info');
