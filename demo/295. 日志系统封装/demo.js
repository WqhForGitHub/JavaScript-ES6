// 295. 日志系统封装

class Logger {
  log(type, message, data = {}) {
    console.log(`[${type.toUpperCase()}] ${message}`, data);
  }
  info(message, data) {
    this.log("info", message, data);
  }
  error(message, data) {
    this.log("error", message, data);
  }
}
new Logger().info("system ready", { time: Date.now() });
