// ==============================
// 第17章：适配器模式 - 地图渲染
// ==============================

console.log('========== 适配器模式：地图渲染 ==========');

const googleMap = {
  show: function () {
    console.log('开始渲染 Google 地图');
  },
};

const baiduMap = {
  display: function () {
    console.log('开始渲染百度地图');
  },
};

const renderMap = function (map) {
  map.show();
};

console.log('');
console.log('--- 渲染 Google 地图（接口兼容）---');
renderMap(googleMap);

console.log('');
console.log('--- 直接渲染百度地图（接口不兼容，会报错）---');
try {
  renderMap(baiduMap);
} catch (e) {
  console.log('错误：baiduMap.show is not a function');
}

console.log('');
console.log('--- 使用适配器渲染百度地图 ---');

const baiduMapAdapter = {
  show: function () {
    return baiduMap.display();
  },
};

renderMap(baiduMapAdapter);

console.log('');
console.log('--- 同时渲染两个地图 ---');

const maps = [googleMap, baiduMapAdapter];
for (let i = 0; i < maps.length; i++) {
  renderMap(maps[i]);
}
