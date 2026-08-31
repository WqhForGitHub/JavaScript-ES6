// 改后：适配器模式 -- 给方法名不符的 SDK 各配一个"翻译官"，对外统一说 show()，渲染函数从此只认一种接口

// ========== 目标接口：业务代码唯一认识的"地图"长什么样 ==========
interface MapSdk {
  show(): void;
}

// ========== 被适配者：三家第三方 SDK 方法名各叫各的，但都一行不改 ==========
const googleMap = {
  show(): void {
    console.log('开始渲染谷歌地图');
  },
};

const baiduMap = {
  display(): void {
    console.log('开始渲染百度地图');
  },
};

const gaodeMap = {
  render(): void {
    console.log('开始渲染高德地图');
  },
};

// ========== 适配器：把各家的"方言"翻译成 show ==========
class BaiduMapAdapter implements MapSdk {
  show(): void {
    baiduMap.display(); // 翻译：show -> display
  }
}

class GaodeMapAdapter implements MapSdk {
  show(): void {
    gaodeMap.render(); // 翻译：show -> render
  }
}

// 谷歌本来就提供 show，天然符合目标接口，不需要适配器，直接传入即可

// ========== 渲染函数：只面向 MapSdk 接口编程，if-else 全部消失 ==========
function renderMap(map: MapSdk): void {
  map.show();
}

renderMap(googleMap); // 开始渲染谷歌地图
renderMap(new BaiduMapAdapter()); // 开始渲染百度地图
renderMap(new GaodeMapAdapter()); // 开始渲染高德地图

// ========== 统一类型的副产品：所有地图可以放进同一个数组，一键全部渲染 ==========
const maps: MapSdk[] = [googleMap, new BaiduMapAdapter(), new GaodeMapAdapter()];
console.log('--- 一键渲染全部地图 ---');
maps.forEach((map) => map.show());

// ========== 扩展：新接腾讯地图（只提供 draw），加一个适配器，renderMap 零修改 ==========
const tencentMap = {
  draw(): void {
    console.log('开始渲染腾讯地图');
  },
};

class TencentMapAdapter implements MapSdk {
  show(): void {
    tencentMap.draw(); // 翻译：show -> draw
  }
}

renderMap(new TencentMapAdapter()); // 开始渲染腾讯地图

// 优势：
// 1. renderMap 只依赖 MapSdk 接口，分支判断全部消失，逻辑一眼见底
// 2. 新增地图 = 新增一个适配器类，渲染函数一行不改，符合开放-封闭原则
// 3. 某家 SDK 改方法名，只影响它自己的适配器，业务代码毫发无损
// 4. 所有地图都是同一类型：可入数组、可注入、可替换，测试时还能塞一个"假地图"

export {};
