// 286. 适配器模式实现

class OldLogger {
  write(message) {
    console.log(`old: ${message}`);
  }
}
class LoggerAdapter {
  constructor(oldLogger) {
    this.oldLogger = oldLogger;
  }
  log(message) {
    this.oldLogger.write(message);
  }
}
new LoggerAdapter(new OldLogger()).log("hello");
