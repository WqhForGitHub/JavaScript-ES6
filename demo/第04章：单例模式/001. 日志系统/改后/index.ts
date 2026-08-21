class Logger {
  private static instance: Logger;
  private file: string;

  private constructor(file: string) {
    this.file = file;
  }

  static getInstance(file: string = 'app.log'): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger(file);
    }
    return Logger.instance;
  }

  log(msg: string) {
    console.log(`[${this.file}] ${msg}`);
  }
}

// 全局唯一
const loggerA = Logger.getInstance();
const loggerB = Logger.getInstance();
loggerA.log('user login');
loggerB.log('user logout');
console.log(loggerA === loggerB); // true ✅