// 改后：享元模式（对象池）-- 弹窗用完不销毁、回池复用，200 个任务最多 3 个弹窗

// ========== 弹窗对象：创建一次，反复使用 ==========
class UploadDialog {
  private static nextId = 1;
  readonly id: number;
  private fileName = '';

  constructor() {
    this.id = UploadDialog.nextId++;
    console.log(`创建弹窗 #${this.id}（真实场景：创建 DOM 树 + 绑定事件）`);
  }

  // 外部状态（文件名）借出时注入，弹窗本体不绑定任何任务
  bind(fileName: string): void {
    this.fileName = fileName;
  }

  update(percent: number): void {
    console.log(`弹窗 #${this.id}：《${this.fileName}》上传 ${percent}%`);
  }

  close(): void {
    console.log(`弹窗 #${this.id} 隐藏（DOM 保留，等着复用）`);
  }
}

// ========== 对象池：借出 -> 回收 -> 再借出 ==========
class DialogPool {
  private pool: UploadDialog[] = [];
  private inUse = new Set<UploadDialog>();

  acquire(): UploadDialog {
    // 池里有就用池里的，没有才真正创建
    const dialog = this.pool.pop() ?? new UploadDialog();
    this.inUse.add(dialog);
    return dialog;
  }

  release(dialog: UploadDialog): void {
    dialog.close();
    this.inUse.delete(dialog);
    this.pool.push(dialog);
  }

  total(): number {
    return this.pool.length + this.inUse.size;
  }
}

// ========== 200 个任务循环复用 3 个弹窗 ==========
const pool = new DialogPool();

// 上传队列 200 个任务，界面同一时刻只显示 3 个弹窗
const queue = Array.from({ length: 200 }, (_, i) => `文件${i + 1}.zip`);
const showing: UploadDialog[] = [];

// 任务 1~3：从池里借 3 个弹窗
for (const name of queue.slice(0, 3)) {
  const dialog = pool.acquire();
  dialog.bind(name);
  dialog.update(50);
  showing.push(dialog);
}

// 任务 1 完成：弹窗回池
const finished = showing.shift();
if (finished) {
  pool.release(finished);
}

// 任务 4 开始：从池里借——复用的正是刚回池的那个弹窗
const next = pool.acquire();
next.bind(queue[3]);
next.update(80);

console.log(`队列共 ${queue.length} 个任务，弹窗对象总数：${pool.total()} 个`); // 3
console.log('任务再多，弹窗也只创建 3 个，用完回池排队复用');

// 优势：
// 1. 同构对象创建一次、循环复用，200 个任务只付 3 次创建成本
// 2. 页面同时存在的弹窗数量受控，渲染压力恒定，不再互相遮挡
// 3. acquire/release 的池化协议简单清晰，换成分页列表、tooltip 等场景照样适用

export {};
