/**
 * MiniHTTP - 极简版 axios
 * 实现：request 封装 · 拦截器(interceptor) · retry 重试 · timeout 超时 · 并发控制
 *
 * 核心架构：Promise 链 + 拦截器队列
 */

class MiniHTTP {
  constructor(config = {}) {
    this.defaults = {
      baseURL: '',
      timeout: 10000,
      headers: { 'Content-Type': 'application/json' },
      retries: 0,
      retryDelay: 1000,
      maxConcurrency: 6,
      ...config,
    };
    // 拦截器：请求 / 响应
    this.interceptors = {
      request: [], // [{ fulfilled, rejected }]
      response: [],
    };
    // 并发控制队列
    this._activeCount = 0;
    this._queue = [];
  }

  // ============ 拦截器注册 ============
  useRequestInterceptor(fulfilled, rejected) {
    this.interceptors.request.push({ fulfilled, rejected });
    return () => this.eject('request', this.interceptors.request.length - 1);
  }

  useResponseInterceptor(fulfilled, rejected) {
    this.interceptors.response.push({ fulfilled, rejected });
    return () => this.eject('response', this.interceptors.response.length - 1);
  }

  eject(type, index) {
    if (this.interceptors[type][index]) {
      this.interceptors[type][index] = null;
    }
  }

  // ============ 并发控制 ============
  _acquire() {
    return new Promise((resolve) => {
      if (this._activeCount < this.defaults.maxConcurrency) {
        this._activeCount++;
        resolve();
      } else {
        this._queue.push(resolve);
      }
    });
  }

  _release() {
    this._activeCount--;
    if (this._queue.length > 0) {
      this._activeCount++;
      const next = this._queue.shift();
      next();
    }
  }

  // ============ 核心请求 ============
  async request(config) {
    // 合并配置
    config = {
      method: 'GET',
      ...this.defaults,
      ...config,
      headers: { ...this.defaults.headers, ...config.headers },
    };

    // 构建完整 URL
    let url = (config.baseURL || '') + config.url;
    const { method, data, params, headers, timeout, retries, retryDelay } = config;

    // params → query string
    if (params) {
      const qs = new URLSearchParams(params).toString();
      url += (url.includes('?') ? '&' : '?') + qs;
    }

    // ====== Promise 链：请求拦截器 → 发请求 → 响应拦截器 ======
    // 组装请求配置链
    const chain = [];

    // 请求拦截器（从后往前执行，类似洋葱模型外层先执行）
    this.interceptors.request
      .filter(Boolean)
      .reverse()
      .forEach((i) => {
        chain.push({ onFulfilled: i.fulfilled, onRejected: i.rejected });
      });

    // 核心请求函数（带重试 + 超时）
    const dispatchRequest = async () => {
      let lastErr;
      const attempts = (retries || 0) + 1;

      for (let attempt = 1; attempt <= attempts; attempt++) {
        await this._acquire();
        try {
          const res = await this._fetch(url, method, data, headers, timeout);
          this._release();
          return res;
        } catch (err) {
          this._release();
          lastErr = err;
          // 超时或网络错误才重试
          const shouldRetry = attempt < attempts && (err.isTimeout || err.name === 'TypeError');
          if (shouldRetry) {
            await new Promise((r) => setTimeout(r, retryDelay * attempt));
          } else {
            throw err;
          }
        }
      }
      throw lastErr;
    };

    chain.push({ onFulfilled: dispatchRequest, onRejected: null });

    // 响应拦截器（正序执行）
    this.interceptors.response.filter(Boolean).forEach((i) => {
      chain.push({ onFulfilled: i.fulfilled, onRejected: i.rejected });
    });

    // 执行链
    let promise = Promise.resolve(config);
    while (chain.length > 0) {
      const { onFulfilled, onRejected } = chain.shift();
      promise = promise.then(onFulfilled, onRejected);
    }

    return promise;
  }

  // ============ 底层 fetch 封装 ============
  _fetch(url, method, data, headers, timeout) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    const options = {
      method: method.toUpperCase(),
      headers,
      signal: controller.signal,
    };

    if (data && method.toUpperCase() !== 'GET') {
      options.body = typeof data === 'string' ? data : JSON.stringify(data);
    }

    return fetch(url, options)
      .then(async (response) => {
        clearTimeout(timer);
        let body;
        const ct = response.headers.get('content-type') || '';
        if (ct.includes('application/json')) {
          body = await response.json();
        } else {
          body = await response.text();
        }
        if (!response.ok) {
          const err = new Error(`HTTP ${response.status}: ${response.statusText}`);
          err.status = response.status;
          err.data = body;
          throw err;
        }
        return { data: body, status: response.status, headers: response.headers };
      })
      .catch((err) => {
        clearTimeout(timer);
        if (err.name === 'AbortError') {
          const timeoutErr = new Error(`请求超时 (${timeout}ms)`);
          timeoutErr.isTimeout = true;
          throw timeoutErr;
        }
        throw err;
      });
  }

  // ============ 便捷方法 ============
  get(url, config = {}) {
    return this.request({ ...config, url, method: 'GET' });
  }
  post(url, data, config = {}) {
    return this.request({ ...config, url, method: 'POST', data });
  }
  put(url, data, config = {}) {
    return this.request({ ...config, url, method: 'PUT', data });
  }
  delete(url, config = {}) {
    return this.request({ ...config, url, method: 'DELETE' });
  }

  // 并发请求（类似 Promise.all）
  all(promises) {
    return Promise.all(promises);
  }
}

// 创建实例
const http = new MiniHTTP();
