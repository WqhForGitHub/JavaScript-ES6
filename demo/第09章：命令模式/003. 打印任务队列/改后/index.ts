// 改后：命令模式 -- 打印请求先封装成命令对象排队，打印机按队列逐个执行
interface PrintJob {
  user: string;
  fileName: string;
  pages: number;
}

// ========== 命令：一次打印请求，自带"撤回"状态 ==========
class PrintCommand {
  private canceled = false;

  constructor(public readonly job: PrintJob) {}

  cancel(): void {
    this.canceled = true;
    console.log(`[取消] ${this.job.user} 撤回了 ${this.job.fileName}`);
  }

  execute(): void {
    if (this.canceled) {
      console.log(`[跳过] ${this.job.fileName} 已被撤回，不打印`);
      return;
    }
    console.log(`[打印] ${this.job.user} 的 ${this.job.fileName}（${this.job.pages} 页）完成`);
  }
}

// ========== 调用者：打印队列，只知道"按顺序执行命令" ==========
class PrintQueue {
  private queue: PrintCommand[] = [];

  add(command: PrintCommand): void {
    this.queue.push(command);
    console.log(`[入队] ${command.job.user} 提交了 ${command.job.fileName}`);
  }

  // 逐个执行队列中的命令（真实场景里由打印机"空闲"信号驱动）
  runAll(): void {
    while (this.queue.length > 0) {
      const command = this.queue.shift();
      if (command) {
        command.execute();
      }
    }
  }
}

const queue = new PrintQueue();
const job1 = new PrintCommand({ user: '张三', fileName: '合同.pdf', pages: 10 });
const job2 = new PrintCommand({ user: '李四', fileName: '报表.xlsx', pages: 5 });
const job3 = new PrintCommand({ user: '王五', fileName: '简历.docx', pages: 2 });

queue.add(job1);
queue.add(job2);
queue.add(job3);

// 李四发现自己拿错了文件，趁还没打印赶紧撤回
job2.cancel();

console.log('--- 打印机开始按队列依次执行 ---');
queue.runAll();

// 优势：
// 1. 请求变成对象才能排队，打印机串行消费，不再被并发抢占
// 2. 命令自带 canceled 状态，还没执行的请求可以随时撤回
// 3. 队列里都是命令对象，还能继续扩展优先级插队、暂停恢复等调度能力

export {};
