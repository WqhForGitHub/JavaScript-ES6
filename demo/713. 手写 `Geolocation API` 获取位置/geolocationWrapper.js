/**
 * 手写 Geolocation API 获取位置
 *
 * Geolocation API 作用：
 *   - 获取设备地理位置（经纬度）
 *   - getCurrentPosition 一次性获取；watchPosition 持续监听
 *   - 需用户授权
 *
 * 封装目标：
 *   1. Promise 化 getCurrentPosition
 *   2. 提供 watch 封装（返回取消监听函数）
 *   3. 统一错误处理（权限拒绝/超时/不可用）
 *   4. Node 环境：用 mock 数据演示流程
 */

// 跨环境 mock
function getGeolocation() {
  if (typeof navigator !== "undefined" && navigator.geolocation)
    return navigator.geolocation;
  // Node mock：模拟北京坐标 + 漂移
  let baseLat = 39.9042;
  let baseLng = 116.4074;
  return {
    getCurrentPosition(success, error) {
      setTimeout(() => {
        success({
          coords: {
            latitude: baseLat,
            longitude: baseLng,
            accuracy: 20,
            altitude: null,
            altitudeAccuracy: null,
            heading: null,
            speed: null,
          },
          timestamp: Date.now(),
        });
      }, 10);
    },
    watchPosition(success, error, options) {
      let count = 0;
      const id = setInterval(() => {
        count++;
        success({
          coords: {
            latitude: baseLat + count * 0.0001,
            longitude: baseLng + count * 0.0001,
            accuracy: 20,
            altitude: null,
            altitudeAccuracy: null,
            heading: null,
            speed: 1,
          },
          timestamp: Date.now(),
        });
      }, options?.interval || 30);
      return id;
    },
    clearWatch(id) {
      clearInterval(id);
    },
  };
}

class GeolocationWrapper {
  constructor(options = {}) {
    this.geo = getGeolocation();
    this.defaultOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
      ...options,
    };
  }

  // 一次性获取位置
  getCurrent(options = {}) {
    return new Promise((resolve, reject) => {
      this.geo.getCurrentPosition(
        (pos) => resolve(this._format(pos)),
        (err) => reject(this._formatError(err)),
        { ...this.defaultOptions, ...options },
      );
    });
  }

  // 持续监听位置，返回 stop 函数
  watch(onUpdate, onError, options = {}) {
    const id = this.geo.watchPosition(
      (pos) => onUpdate(this._format(pos)),
      (err) => onError(this._formatError(err)),
      { ...this.defaultOptions, ...options },
    );
    return () => this.geo.clearWatch(id);
  }

  // 计算两点间距离（Haversine 公式，单位米）
  static distance(lat1, lng1, lat2, lng2) {
    const R = 6371000; // 地球半径米
    const toRad = (d) => (d * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(a));
  }

  _format(pos) {
    const { coords, timestamp } = pos;
    return {
      latitude: coords.latitude,
      longitude: coords.longitude,
      accuracy: coords.accuracy,
      altitude: coords.altitude,
      speed: coords.speed,
      heading: coords.heading,
      timestamp,
    };
  }

  _formatError(err) {
    const messages = {
      1: "权限被拒绝",
      2: "位置不可用",
      3: "请求超时",
    };
    return new Error(messages[err.code] || err.message);
  }
}

// ===== 测试 =====
(async () => {
  const geo = new GeolocationWrapper();

  // --- 一次性获取 ---
  const pos = await geo.getCurrent();
  console.log("当前位置:", pos.latitude.toFixed(4), pos.longitude.toFixed(4)); // 39.9042 116.4074

  // --- 距离计算 ---
  const d = GeolocationWrapper.distance(39.9042, 116.4074, 31.2304, 121.4737);
  console.log("北京到上海距离:", Math.round(d), "米"); // 约 1067000 米

  // --- 持续监听 ---
  const updates = [];
  const stop = geo.watch(
    (p) => {
      updates.push(p);
      if (updates.length >= 3) stop();
    },
    (err) => console.log("监听错误:", err.message),
  );

  await new Promise((r) => setTimeout(r, 200));
  console.log("监听次数:", updates.length); // 3
  console.log(
    "位置漂移:",
    updates.map((p) => p.latitude.toFixed(6)),
  );
  // ['39.904200', '39.904300', '39.904400']

  console.log("Geolocation 演示完成");
})();
