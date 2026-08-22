// 到处 new，文件被并发写乱，实例不统一
class Logger {
  private file: string;
  constructor(file: string) {
    this.file = file;
  }
  log(msg: string) {
    console.log(`[${this.file}] ${msg}`);
  }
}

// 调用方 A
const loggerA = new Logger('app.log');
loggerA.log('user login');

// 调用方 B —— 又 new 了一个，完全不是同一个实例
const loggerB = new Logger('app.log');
loggerB.log('user logout');

console.log(loggerA === loggerB); // false 😱

export {};