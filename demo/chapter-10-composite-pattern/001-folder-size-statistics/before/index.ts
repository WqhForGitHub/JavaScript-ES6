// 改前：文件和文件夹是两种数据，每个统计功能都要自己写 if-else 递归
interface FileNodeData {
  type: 'file' | 'folder';
  name: string;
  size?: number; // 文件才有
  children?: FileNodeData[]; // 文件夹才有
}

const disk: FileNodeData = {
  type: 'folder',
  name: '学习资料',
  children: [
    { type: 'file', name: '读书笔记.md', size: 2 },
    {
      type: 'folder',
      name: '视频教程',
      children: [
        { type: 'file', name: '设计模式.mp4', size: 800 },
        { type: 'file', name: '算法入门.mp4', size: 600 },
      ],
    },
    { type: 'file', name: '面试题.pdf', size: 5 },
  ],
};

// 统计总大小：必须先判断节点类型再分别处理
function getTotalSize(node: FileNodeData): number {
  if (node.type === 'folder') {
    return (node.children ?? []).reduce((sum, child) => sum + getTotalSize(child), 0);
  }
  return node.size ?? 0;
}

// 想再统计文件个数？又要把同样的"判断类型 + 递归"抄一遍
function getFileCount(node: FileNodeData): number {
  if (node.type === 'folder') {
    return (node.children ?? []).reduce((sum, child) => sum + getFileCount(child), 0);
  }
  return 1;
}

console.log(`「${disk.name}」总大小：${getTotalSize(disk)} MB`); // 1407
console.log(`「${disk.name}」文件数：${getFileCount(disk)} 个`); // 4

// 问题：
// 1. 每个统计功能都要重复"判断类型 + 递归遍历"这套模板代码
// 2. 文件和文件夹的结构知识（size/children）暴露给了每一个调用方
// 3. 新增一种节点（如"快捷方式"），所有统计函数都得加一个 if 分支

export {};
