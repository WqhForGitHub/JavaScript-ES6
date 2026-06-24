/**
 * 手写 HTTP 请求路由
 *
 * 作用：实现一个轻量级 HTTP 路由器，支持：
 *         - 按 method + path 匹配
 *         - 路径参数（如 /users/:id）
 *         - 通配符（如 /api/*）
 *         - 中间件（middleware）
 *         - 子路由（router 嵌套）
 *         - 404 处理
 *
 * 实现思路：
 *   1. Router 维护一个 routes 数组，每项 { method, pattern, handler, params }
 *   2. get/post/put/delete 等方法注册路由
 *   3. 路径模式编译为正则，提取参数名
 *   4. handle(req, res) 遍历 routes，第一个匹配的执行
 *   5. 中间件 next 机制：用回调链串联
 *   6. 支持挂载子路由 use(prefix, subRouter)
 */

// 路由类
class Router {
  constructor() {
    this.routes = [];
    this.middlewares = [];
  }

  // 注册路由
  _addRoute(method, pattern, ...handlers) {
    const { regex, keys } = compilePattern(pattern);
    this.routes.push({ method: method.toUpperCase(), pattern, regex, keys, handlers });
    return this;
  }

  get(pattern, ...handlers) {
    return this._addRoute('GET', pattern, ...handlers);
  }
  post(pattern, ...handlers) {
    return this._addRoute('POST', pattern, ...handlers);
  }
  put(pattern, ...handlers) {
    return this._addRoute('PUT', pattern, ...handlers);
  }
  delete(pattern, ...handlers) {
    return this._addRoute('DELETE', pattern, ...handlers);
  }
  all(pattern, ...handlers) {
    return this._addRoute('*', pattern, ...handlers);
  }

  // 中间件
  use(middlewareOrPrefix, subRouter) {
    if (typeof middlewareOrPrefix === 'function') {
      // 全局中间件
      this.middlewares.push(middlewareOrPrefix);
    } else if (typeof middlewareOrPrefix === 'string' && subRouter instanceof Router) {
      // 挂载子路由
      const prefix = middlewareOrPrefix.replace(/\/$/, '');
      for (const route of subRouter.routes) {
        const newPattern = prefix + route.pattern;
        const { regex, keys } = compilePattern(newPattern);
        this.routes.push({ ...route, pattern: newPattern, regex, keys });
      }
    }
    return this;
  }

  // 处理请求
  handle(req, res, done) {
    const { method, pathname } = req;
    const middlewares = this.middlewares.slice();
    let mwIdx = 0;

    const runMiddleware = () => {
      if (mwIdx < middlewares.length) {
        const mw = middlewares[mwIdx++];
        mw(req, res, runMiddleware);
      } else {
        this._dispatch(req, res, done);
      }
    };
    runMiddleware();
  }

  _dispatch(req, res, done) {
    const { method, pathname } = req;
    let idx = 0;

    const next = (err) => {
      if (err) {
        if (done) return done(err);
        res.statusCode = 500;
        res.end('Internal Server Error');
        return;
      }

      if (idx >= this.routes.length) {
        if (done) return done();
        res.statusCode = 404;
        res.end('Not Found');
        return;
      }

      const route = this.routes[idx++];
      const isMethodMatch = route.method === '*' || route.method === method;

      if (!isMethodMatch) {
        return next();
      }

      const match = route.regex.exec(pathname);
      if (!match) {
        return next();
      }

      // 提取参数
      req.params = req.params || {};
      for (let i = 0; i < route.keys.length; i++) {
        req.params[route.keys[i]] = decodeURIComponent(match[i + 1]);
      }

      // 执行 handlers（链式）
      let hIdx = 0;
      const runHandler = (e) => {
        if (e) return next(e);
        if (hIdx >= route.handlers.length) return;
        const handler = route.handlers[hIdx++];
        handler(req, res, runHandler);
      };
      runHandler();
    };

    next();
  }
}

// 编译路径模式为正则
function compilePattern(pattern) {
  const keys = [];
  // 标准化：去掉结尾 /
  if (pattern.length > 1 && pattern.endsWith('/')) pattern = pattern.slice(0, -1);

  // 按段处理，逐段生成正则片段
  const segments = pattern.split('/');
  const regexParts = [];
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    if (seg === '*') {
      // 通配符，捕获剩余路径
      keys.push('0');
      regexParts.push('(.*)');
    } else if (seg === '') {
      // 开头的空段（来自前导 /）或连续斜杠，保留分隔符语义
      if (i === 0) regexParts.push('');
      else regexParts.push('/');
    } else if (seg[0] === ':') {
      // 命名参数 :name
      const name = seg.slice(1);
      keys.push(name);
      regexParts.push('/([^/]+)');
    } else {
      // 普通段，转义特殊字符
      regexParts.push('/' + seg.replace(/[.+?^${}()|[\]\\]/g, '\\$&'));
    }
  }

  const regexStr = regexParts.join('');
  const regex = new RegExp('^' + regexStr + '/?$');
  return { regex, keys };
}

// ===== 模拟 req/res =====
function makeReq(method, url) {
  const qIdx = url.indexOf('?');
  const pathname = qIdx === -1 ? url : url.slice(0, qIdx);
  return { method, url, pathname, headers: {}, params: {}, query: {} };
}
function makeRes() {
  return {
    statusCode: 200,
    headers: {},
    body: '',
    setHeader(n, v) { this.headers[n] = v; },
    writeHead(sc, h) { this.statusCode = sc; if (h) Object.assign(this.headers, h); },
    end(b) { if (b) this.body = b; this.ended = true; },
  };
}

// ===== 测试 =====

const router = new Router();

// 中间件
router.use((req, res, next) => {
  req.startTime = Date.now();
  next();
});

router.get('/', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Home');
});

router.get('/users/:id', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ userId: req.params.id }));
});

router.get('/users/:id/posts/:postId', (req, res) => {
  res.writeHead(200);
  res.end(JSON.stringify({ userId: req.params.id, postId: req.params.postId }));
});

router.post('/users', (req, res) => {
  res.writeHead(201);
  res.end('User created');
});

router.all('/health', (req, res) => {
  res.writeHead(200);
  res.end('OK');
});

// 通配符
router.get('/files/*', (req, res) => {
  res.writeHead(200);
  res.end('File: ' + req.params['0']);
});

// 子路由
const apiRouter = new Router();
apiRouter.get('/list', (req, res) => res.end('API List'));
apiRouter.get('/item/:id', (req, res) => res.end('API Item ' + req.params.id));
router.use('/api', apiRouter);

// 测试用例
function test(method, url, expected) {
  const req = makeReq(method, url);
  const res = makeRes();
  router.handle(req, res);
  console.log(`${method} ${url} -> ${res.statusCode} | ${res.body} | expect: ${expected}`);
}

test('GET', '/', 'Home');
test('GET', '/users/42', '{"userId":"42"}');
test('GET', '/users/42/posts/7', '{"userId":"42","postId":"7"}');
test('POST', '/users', 'User created');
test('GET', '/health', 'OK');
test('POST', '/health', 'OK'); // all 方法
test('GET', '/files/docs/readme.md', 'File: docs/readme.md');
test('GET', '/api/list', 'API List');
test('GET', '/api/item/99', 'API Item 99');
test('GET', '/not-exist', 'Not Found'); // 404

// 错误：方法不匹配返回 404
test('DELETE', '/users', 'Not Found');
