/**
 * axios mini - 极简 HTTP 请求库
 * 实现：request 封装 · 拦截器 · retry · timeout · 并发控制
 *
 * 核心架构：
 * 1. 拦截器链：请求拦截 → 发送请求 → 响应拦截
 * 2. Promise 链式调用
 * 3. 自动重试（可配次数+延迟）
 * 4. 超时控制（AbortController）
 * 5. 并发限制（类似 p-limit）
 */

class AxiosMini {
  constructor() {
    this.interceptors = {
      request: [],  // [{ fulfilled, rejected }]
      response: [],
    };
    this.defaultConfig = {
      baseURL: '',
      timeout: 10000,
      headers: {},
      maxRetries: 0,
      retryDelay: 1000,
    };
  }

  // ============ 拦截器 ============
  useRequestInterceptor(fulfilled, rejected) {
    this.interceptors.request.push({ fulfilled, rejected });
  }

  useResponseInterceptor(fulfilled, rejected) {
    this.interceptors.response.push({ fulfilled, rejected });
  }

  // ============ 核心请求方法 ============
  request(config) {
    config = { ...this.defaultConfig, ...config };
    config.headers = { ...this.defaultConfig.headers, ...(config.headers || {}) };
    config.method = (config.method || 'GET').toUpperCase();

    // 构建完整 URL
    let url = (config.baseURL || '') + config.url;

    // GET 请求拼接 query
    if (config.params) {
      const qs = new URLSearchParams(config.params).toString();
      url += (url.includes('?') ? '&' : '?') + qs;
    }

    const chain = [];

    // 请求拦截器入栈（按注册顺序）
    this.interceptors.request.forEach(i => {
      chain.push(i.fulfilled, i.rejected);
    });

    // 核心发送函数（带 retry）
    chain.push(
      (cfg) => this._dispatchWithRetry(url, cfg),
      undefined
    );

    // 响应拦截器入栈（按注册顺序）
    this.interceptors.response.forEach(i => {
      chain.push(i.fulfilled, i.rejected);
    });

    // 执行 Promise 链
    let promise = Promise.resolve(config);
    while (chain.length) {
      const fulfilled = chain.shift();
      const rejected = chain.shift();
      promise = promise.then(fulfilled, rejected);
    }

    return promise;
  }

  // ============ 带重试的请求分发 ============
  async _dispatchWithRetry(url, config) {
    let lastError;
    const maxRetries = config.maxRetries || 0;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await this._dispatch(url, config);
      } catch (err) {
        lastError = err;
        // 超时类错误或网络错误才重试
        if (attempt < maxRetries && this._shouldRetry(err)) {
          console.log(`[axios-mini] 重试 ${attempt + 1}/${maxRetries}: ${url}`);
          await this._delay(config.retryDelay * (attempt + 1)); // 指数退避
          continue;
        }
        throw err;
      }
    }
    throw lastError;
  }

  _shouldRetry(err) {
    // 网络错误或 5xx 超时才重试
    if (err.isTimeout) return true;
    if (err.response && err.response.status >= 500) return true;
    if (!err.response) return true; // 网络错误
    return false;
  }

  _delay(ms) {
    return new Promise(r => setTimeout(r, ms));
  }

  // ============ 底层 fetch 封装 ============
  _dispatch(url, config) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeout);

    const fetchOptions = {
      method: config.method,
      headers: config.headers,
      signal: controller.signal,
    };

    if (config.body && config.method !== 'GET') {
      fetchOptions.body = typeof config.body === 'string'
        ? config.body
        : JSON.stringify(config.body);
      // 如果没有指定 Content-Type，默认 JSON
      if (!fetchOptions.headers['Content-Type'] && typeof config.body === 'object') {
        fetchOptions.headers['Content-Type'] = 'application/json';
      }
    }

    return fetch(url, fetchOptions).then(async (res) => {
      clearTimeout(timeoutId);
      const data = await res.json().catch(() => res.text());
      const response = { data, status: res.status, headers: res.headers, config };

      if (!res.ok) {
        const error = new Error(`Request failed with status ${res.status}`);
        error.response = response;
        error.config = config;
        throw error;
      }

      return response;
    }).catch((err) => {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        const timeoutErr = new Error(`Timeout of ${config.timeout}ms exceeded`);
        timeoutErr.isTimeout = true;
        timeoutErr.config = config;
        throw timeoutErr;
      }
      throw err;
    });
  }

  // ============ 便捷方法 ============
  get(url, config = {}) { return this.request({ ...config, url, method: 'GET' }); }
  post(url, data, config = {}) { return this.request({ ...config, url, method: 'POST', body: data }); }
  put(url, data, config = {}) { return this.request({ ...config, url, method: 'PUT', body: data }); }
  delete(url, config = {}) { return this.request({ ...config, url, method: 'DELETE' }); }

  // ============ 并发控制 ============
  /**
   * all：类似 Promise.all，并发执行所有请求
   */
  all(promises) {
    return Promise.all(promises);
  }

  /**
   * concurrencyLimit：限制并发数的批量请求
   * @param {Array} configs 请求配置数组
   * @param {number} limit 最大并发数
   * @param {function} onProgress 进度回调 (completed, total)
   */
  async concurrencyLimit(configs, limit = 3, onProgress) {
    const results = new Array(configs.length);
    let completed = 0;
    let index = 0;

    const runNext = async () => {
      while (index < configs.length) {
        const currentIndex = index++;
        try {
          results[currentIndex] = await this.request(configs[currentIndex]);
        } catch (err) {
          results[currentIndex] = { error: err, config: configs[currentIndex] };
        }
        completed++;
        if (onProgress) onProgress(completed, configs.length);
      }
    };

    // 启动 limit 个消费者
    const workers = Array.from({ length: Math.min(limit, configs.length) }, () => runNext());
    await Promise.all(workers);
    return results;
  }
}

// 创建默认实例
const http = new AxiosMini();
