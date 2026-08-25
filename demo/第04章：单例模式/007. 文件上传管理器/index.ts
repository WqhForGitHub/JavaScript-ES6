// 第04章：单例模式 - 007：文件上传管理器
//
// 场景：上传文件要占用带宽和服务器连接数，必须全局限制并发数；
// 上传队列、进度、取消 / 重试也需要统一管理。
// 全局唯一的上传管理器才能对所有模块的上传任务统一排队、限流。

interface UploadTask {
  id: number;
  fileName: string;
  sizeKb: number;
  status: 'pending' | 'uploading' | 'success' | 'cancelled';
  progress: number; // 0 ~ 100
}

class UploadManager {
  private static instance: UploadManager | null = null;

  private readonly maxConcurrent: number;
  private queue: UploadTask[] = [];
  private running = new Map<
    number,
    { task: UploadTask; timer: ReturnType<typeof setInterval> }
  >();
  private nextId = 1;
  private completedCount = 0;

  private constructor(maxConcurrent = 2) {
    this.maxConcurrent = maxConcurrent;
  }

  // 参数只在第一次创建实例时生效
  static getInstance(maxConcurrent?: number): UploadManager {
    if (!UploadManager.instance) {
      UploadManager.instance = new UploadManager(maxConcurrent);
    }
    return UploadManager.instance;
  }

  /** 添加文件到上传队列，立即尝试调度 */
  upload(fileName: string, sizeKb: number): UploadTask {
    const task: UploadTask = {
      id: this.nextId++,
      fileName,
      sizeKb,
      status: 'pending',
      progress: 0,
    };
    this.queue.push(task);
    console.log(`[排队] ${fileName}（${sizeKb}KB）进入队列`);
    this.schedule();
    return task;
  }

  /** 只要还有空闲槽位，就从队列里取出任务开始上传 */
  private schedule(): void {
    while (this.running.size < this.maxConcurrent) {
      const task = this.queue.shift();
      if (!task) return;
      this.start(task);
    }
  }

  private start(task: UploadTask): void {
    task.status = 'uploading';
    console.log(`[开始] ${task.fileName} 开始上传（当前并发：${this.running.size + 1}/${this.maxConcurrent}）`);

    // 用定时器模拟上传进度
    const timer = setInterval(() => {
      task.progress = Math.min(100, task.progress + 25);
      if (task.progress >= 100) {
        clearInterval(timer);
        this.running.delete(task.id);
        task.status = 'success';
        this.completedCount++;
        console.log(`[完成] ${task.fileName} 上传完成`);
        // 完成一个就调度下一个
        this.schedule();
      }
    }, 30);

    this.running.set(task.id, { task, timer });
  }

  /** 取消还在排队的任务（正在上传的不允许取消，简化处理） */
  cancel(task: UploadTask): boolean {
    const index = this.queue.indexOf(task);
    if (index === -1) return false;
    this.queue.splice(index, 1);
    task.status = 'cancelled';
    console.log(`[取消] ${task.fileName} 已从队列移除`);
    return true;
  }

  getSnapshot(): {
    queue: string[];
    uploading: string[];
    completed: number;
  } {
    return {
      queue: this.queue.map((t) => t.fileName),
      uploading: [...this.running.values()].map(
        (r) => `${r.task.fileName} ${r.task.progress}%`
      ),
      completed: this.completedCount,
    };
  }
}

// ============================================================
// 使用演示
// ============================================================

async function main() {
  const managerA = UploadManager.getInstance(2);
  const managerB = UploadManager.getInstance(); // 同一个管理器

  console.log('两个模块拿到的是同一个上传管理器：', managerA === managerB); // true

  console.log('\n--- 一次丢进 5 个文件（全局并发上限 2）---');
  managerA.upload('头像.png', 120);
  managerA.upload('简历.pdf', 800);
  managerB.upload('设计稿.fig', 2000);
  managerB.upload('视频.mp4', 5000);
  const noteTask = managerB.upload('笔记.txt', 3);

  // 排队中的任务允许取消
  managerA.cancel(noteTask);

  // 等待队列全部跑完
  await new Promise((r) => setTimeout(r, 500));

  console.log('\n全部结束，快照：', managerA.getSnapshot());
  console.log('managerB 看到的完成数：', managerB.getSnapshot().completed); // 4
}

main();

export {};
