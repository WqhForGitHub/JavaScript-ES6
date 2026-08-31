// 改前：点"打印"就直接执行，多台电脑同时提交，打印机立刻乱成一锅粥
interface PrintJob {
  user: string;
  fileName: string;
  pages: number;
}

function print(job: PrintJob): void {
  console.log(`正在打印 ${job.fileName}（${job.pages} 页）-- 占用打印机`);
}

// 三个用户几乎同时点击打印，请求立刻执行，打印机同时收到三个任务
print({ user: '张三', fileName: '合同.pdf', pages: 10 });
print({ user: '李四', fileName: '报表.xlsx', pages: 5 });
print({ user: '王五', fileName: '简历.docx', pages: 2 });

// 问题：
// 1. 打印请求立刻执行，无法排队，并发任务抢占打印机，输出内容交错乱码
// 2. 想取消一个还没打印的任务？请求已经发出去了，根本拦不住
// 3. 无法统计等待中的任务、无法让紧急任务插队，因为"请求"不是可管理的对象

export {};
