// 改前：200 个上传任务就 new 200 个进度弹窗，页面卡到打不开

// 上传进度弹窗：真实场景里每个弹窗都是一组 DOM 节点 + 事件监听
class UploadDialog {
  private static nextId = 1;
  readonly id: number;

  constructor(public fileName: string) {
    this.id = UploadDialog.nextId++;
    console.log(`创建弹窗 #${this.id}（真实场景：创建 DOM 树 + 绑定事件，开销不小）`);
  }

  update(percent: number): void {
    console.log(`弹窗 #${this.id}：《${this.fileName}》上传 ${percent}%`);
  }

  close(): void {
    console.log(`销毁弹窗 #${this.id}（真实场景：移除 DOM + 解绑事件）`);
  }
}

// 批量上传 200 个文件，每个任务都配一个专属弹窗
const dialogs: UploadDialog[] = [];
for (let i = 1; i <= 200; i++) {
  dialogs.push(new UploadDialog(`文件${i}.zip`));
}

console.log(`200 个任务同时上传，弹窗对象数：${dialogs.length}`); // 200
dialogs[0].update(50);
dialogs[0].close();

// 问题：
// 1. 弹窗结构完全一样，只是文件名和进度不同，却建了 200 份 DOM
// 2. 同时挂在页面上的 200 个弹窗互相遮挡，浏览器渲染直接卡死
// 3. 任务结束就整个销毁，下一个任务又从零创建，创建/销毁开销反复支付

export {};
