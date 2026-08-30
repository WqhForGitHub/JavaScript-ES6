// 改前：直接操作编辑器内容，撤销逻辑靠手写记录每种操作 -- 又乱又难扩展
const editor = {
  content: '',
};

function write(text: string): void {
  editor.content += text;
}

function del(count: number): void {
  editor.content = editor.content.slice(0, -count);
}

// 想支持撤销，只能自己手工记录每一步"是什么操作、参数是什么"
interface HistoryItem {
  type: 'write' | 'del';
  text: string;
}

const history: HistoryItem[] = [];

function doWrite(text: string): void {
  write(text);
  history.push({ type: 'write', text });
}

function doDel(count: number): void {
  const text = editor.content.slice(-count);
  del(count);
  history.push({ type: 'del', text });
}

function undo(): void {
  const item = history.pop();
  if (!item) {
    console.log('没有可撤销的操作');
    return;
  }
  // 撤销时必须对每种操作类型写一段反向逻辑
  if (item.type === 'write') {
    del(item.text.length);
  } else if (item.type === 'del') {
    write(item.text);
  }
}

doWrite('Hello');
doWrite(' World');
doDel(6);
console.log('当前内容：', editor.content); // Hello

undo();
console.log('撤销删除后：', editor.content); // Hello World

// 问题：
// 1. undo 里 if-else 判断操作类型，新增一种操作（如 replace）就得改 undo
// 2. "执行"和"记录"分散在两处，哪个函数忘了记录，哪一步就撤销不了
// 3. 想再做"重做 redo"，又得写一套对称的历史逻辑，代码直接翻倍
// 4. 操作只是散落的函数调用，没法排队、没法回放

export {};
