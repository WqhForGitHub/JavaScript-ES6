# 025 - 实现一个简单的路由（hash 路由）

> 前端路由两种实现方式：
>
> 1. **hash 路由**：监听 `hashchange` 事件，兼容性好；
> 2. **history 路由**：借助 `pushState` / `popstate`，需要服务端配合。

下面实现一个基于 hash 的简单路由。

## 完整代码（可直接保存为 html 运行）

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>简单 Hash 路由</title>
  </head>
  <body>
    <nav>
      <a href="#/">首页</a> | <a href="#/about">关于</a> |
      <a href="#/user/123">用户 123</a>
    </nav>
    <div id="app"></div>

    <script>
      class Router {
        constructor() {
          this.routes = {}; // path -> 回调
          this.currentPath = '';
          // 监听 hash 变化：点击 a 标签、输入/修改 url、前进后退
          window.addEventListener('hashchange', () => this.load());
        }

        // 注册路由
        register(path, callback) {
          this.routes[path] = callback;
          return this; // 支持链式调用
        }

        // 注册 404
        notFound(callback) {
          this.notFoundCallback = callback;
          return this;
        }

        // 加载当前路由
        load() {
          // location.hash 形如 '#/about'，去掉 '#'
          this.currentPath = location.hash.slice(1) || '/';
          const handler = this.routes[this.currentPath];

          if (handler) {
            handler();
          } else if (this.notFoundCallback) {
            this.notFoundCallback();
          }
        }

        // 跳转
        push(path) {
          location.hash = path;
        }
      }

      // ---- 使用示例 ----
      const app = document.getElementById('app');
      const router = new Router();

      router
        .register('/', () => {
          app.innerHTML = '<h1>首页</h1>';
        })
        .register('/about', () => {
          app.innerHTML = '<h1>关于页面</h1>';
        })
        .register('/user/123', () => {
          app.innerHTML = '<h1>用户详情：123</h1>';
        })
        .notFound(() => {
          app.innerHTML = '<h1>404 - 页面不存在</h1>';
        });

      // 初始加载
      window.addEventListener('load', () => router.load());
    </script>
  </body>
</html>
```

## 支持动态参数的版本（如 /user/:id）

```js
class Router {
  constructor() {
    this.routes = [];
    window.addEventListener('hashchange', () => this.load());
  }

  register(path, callback) {
    // '/user/:id' -> 正则 /^\/user\/([^/]+)$/
    const keys = [];
    const pattern = path
      .replace(/:[^/]+/g, (key) => {
        keys.push(key.slice(1));
        return '([^/]+)';
      })
      .replace(/\//g, '\\/');

    this.routes.push({
      regExp: new RegExp(`^${pattern}$`),
      keys,
      callback,
    });
    return this;
  }

  load() {
    const path = location.hash.slice(1) || '/';
    for (const route of this.routes) {
      const match = path.match(route.regExp);
      if (match) {
        const params = {};
        route.keys.forEach((key, i) => {
          params[key] = match[i + 1];
        });
        route.callback(params);
        return;
      }
    }
    document.getElementById('app').innerHTML = '<h1>404</h1>';
  }
}

const router = new Router();
router.register('/user/:id', (params) => {
  console.log('用户 id：', params.id);
});
```
