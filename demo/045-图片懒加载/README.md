# 045 - JS + HTML 实现图片懒加载

> 懒加载：图片进入可视区域后再加载，减少首屏请求，提升性能。
> 关键属性：`data-src` 存真实地址，进入视口后赋值给 `src`。

## 完整代码（可直接保存为 html 运行）

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>图片懒加载</title>
  <style>
    .img-item {
      width: 100%;
      height: 400px;
      margin-bottom: 20px;
      background: #eee;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #999;
      font-size: 20px;
    }
    .img-item img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  </style>
</head>
<body>
  <div class="img-item"><img class="lazy" data-src="https://picsum.photos/id/1/800/400" src="" alt="占位" /></div>
  <div class="img-item"><img class="lazy" data-src="https://picsum.photos/id/2/800/400" src="" alt="占位" /></div>
  <div class="img-item"><img class="lazy" data-src="https://picsum.photos/id/3/800/400" src="" alt="占位" /></div>
  <div class="img-item"><img class="lazy" data-src="https://picsum.photos/id/4/800/400" src="" alt="占位" /></div>
  <div class="img-item"><img class="lazy" data-src="https://picsum.photos/id/5/800/400" src="" alt="占位" /></div>

  <script>
    /* ============ 方式一：scroll 事件 + getBoundingClientRect ============ */
    function lazyLoad1() {
      const images = document.querySelectorAll('img.lazy');
      // 视口高度
      const clientHeight = document.documentElement.clientHeight;
      // 兼容写法：滚动距离
      const scrollTop =
        document.documentElement.scrollTop || document.body.scrollTop;

      images.forEach((img) => {
        if (img.src) return; // 已加载过
        // 图片顶部距离页面顶部的距离 < 视口高度 + 滚动距离 => 进入视口
        if (img.getBoundingClientRect().top < clientHeight + scrollTop) {
          img.src = img.dataset.src; // 真实地址赋给 src
          img.classList.remove('lazy');
        }
      });
    }

    // 滚动事件必须配合节流，否则触发过于频繁
    function throttle(fn, interval = 200) {
      let lastTime = 0;
      return function (...args) {
        const now = Date.now();
        if (now - lastTime >= interval) {
          lastTime = now;
          fn.apply(this, args);
        }
      };
    }

    // window.addEventListener('scroll', throttle(lazyLoad1));
    // window.addEventListener('load', lazyLoad1);

    /* ============ 方式二：IntersectionObserver（推荐） ============ */
    function lazyLoad2() {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            // isIntersecting：目标元素是否与视口交叉（可见）
            if (entry.isIntersecting) {
              const img = entry.target;
              img.src = img.dataset.src;
              observer.unobserve(img); // 加载后停止观察
            }
          });
        },
        {
          root: null, // 相对视口
          rootMargin: '0px 0px 200px 0px', // 提前 200px 开始加载
          threshold: 0, // 交叉比例阈值
        }
      );

      document.querySelectorAll('img.lazy').forEach((img) => {
        observer.observe(img); // 逐个观察
      });
    }

    lazyLoad2();
  </script>
</body>
</html>
```

## 核心逻辑说明

```js
// 判断图片是否进入可视区域的几何判断法：
// img.getBoundingClientRect().top < window.innerHeight

// IntersectionObserver 的优势：
// 1. 浏览器原生支持，性能优于 scroll 监听（不阻塞主线程）；
// 2. 无需手动计算位置和节流；
// 3. 支持 rootMargin 提前预加载，体验更好。
```

## 兜底：img loading 属性（原生懒加载）

```html
<!-- 现代浏览器可直接使用原生属性 -->
<img src="https://picsum.photos/id/1/800/400" loading="lazy" alt="懒加载" />
```
