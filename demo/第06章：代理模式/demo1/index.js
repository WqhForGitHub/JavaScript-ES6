// 第06章：代理模式 - 虚拟代理-图片预加载

// ========== 不使用代理的 myImage ==========
console.log('===== 不使用代理的 myImage =====');

const myImage = (function () {
  const imgNode = {
    src: '',
    _listeners: {},
  };

  return {
    setSrc: function (src) {
      imgNode.src = src;
      console.log('设置图片 src：', src);
    },
  };
})();

myImage.setSrc('http://img.example.com/real.jpg');

// ========== 使用虚拟代理实现图片预加载 ==========
console.log('\n===== 使用虚拟代理实现图片预加载 =====');

const myImage2 = (function () {
  const imgNode = {
    src: '',
    _listeners: {},
  };

  return {
    setSrc: function (src) {
      imgNode.src = src;
      console.log('设置图片 src：', src);
    },
  };
})();

const proxyImage = (function () {
  const img = new Image();
  img.onload = function () {
    // 图片加载完成后，将真实图片设置给 myImage2
    myImage2.setSrc(img.src);
  };
  return {
    setSrc: function (src) {
      // 先设置 loading 占位图
      myImage2.setSrc('http://img.example.com/loading.gif');
      console.log('正在加载图片，显示占位图...');
      // 通知代理开始加载真实图片
      img.src = src;
    },
  };
})();

// 通过代理设置图片
proxyImage.setSrc('http://img.example.com/real.jpg');

// 模拟图片加载完成（在浏览器中，onload 会在图片加载完成后自动触发）
// 由于没有真实图片，我们手动模拟加载过程
console.log('\n--- 模拟图片加载完成 ---');
setTimeout(function () {
  console.log('真实图片加载完成，替换占位图');
}, 0);

// ========== 代理模式的优势 ==========
console.log('\n===== 代理模式的优势 =====');
console.log('1. myImage2 只负责设置图片 src，不关心预加载逻辑');
console.log('2. proxyImage 负责预加载，加载完成后才将真实 src 传给 myImage2');
console.log('3. 符合单一职责原则，myImage2 和 proxyImage 各司其职');
console.log('4. 如果不需要预加载，直接使用 myImage2.setSrc 即可');
