// 改前：三家地图 SDK 的方法名各不相同，渲染函数被迫为每家写一个分支，多接一家就多改一次

// 谷歌地图 SDK（第三方，对外只提供 show）
const googleMap = {
  show(): void {
    console.log('开始渲染谷歌地图');
  },
};

// 百度地图 SDK（第三方，对外只提供 display）
const baiduMap = {
  display(): void {
    console.log('开始渲染百度地图');
  },
};

// 高德地图 SDK（第三方，对外只提供 render）
const gaodeMap = {
  render(): void {
    console.log('开始渲染高德地图');
  },
};

// ========== 渲染函数：被迫记住每家 SDK 的"方言" ==========
function renderMap(mapType: string): void {
  if (mapType === 'google') {
    googleMap.show();
  } else if (mapType === 'baidu') {
    baiduMap.display(); // 百度家偏偏叫 display
  } else if (mapType === 'gaode') {
    gaodeMap.render(); // 高德家又叫 render
  } else {
    console.log('暂不支持的地图：', mapType);
  }
}

renderMap('google');
renderMap('baidu');
renderMap('gaode');

// 问题：
// 1. 渲染函数堆满 if-else，每家 SDK 的私有方法名都"泄漏"进了业务代码
// 2. 再接一家地图（比如腾讯叫 draw）就得改 renderMap，违背开放-封闭原则
// 3. 某家 SDK 升级改了方法名，业务代码跟着遭殃，回归范围不可控
// 4. "一张地图"没有统一类型，不能放进同一个数组里统一遍历、替换和测试

export {};
