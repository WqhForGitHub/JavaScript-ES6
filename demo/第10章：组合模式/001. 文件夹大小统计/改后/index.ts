// 改后：组合模式 -- 文件和文件夹实现同一个接口，"部分"与"整体"用法一致

// ========== 组件接口：叶子和容器都必须实现 ==========
interface FileSystemNode {
  getName(): string;
  getSize(): number;
}

// ========== 叶子：单个文件 ==========
class FileNode implements FileSystemNode {
  constructor(
    private name: string,
    private size: number,
  ) {}

  getName(): string {
    return this.name;
  }

  getSize(): number {
    return this.size;
  }
}

// ========== 容器：文件夹，把操作委托给孩子们 ==========
class FolderNode implements FileSystemNode {
  private children: FileSystemNode[] = [];

  constructor(private name: string) {}

  add(node: FileSystemNode): void {
    this.children.push(node);
  }

  getName(): string {
    return this.name;
  }

  // 文件夹的大小 = 所有孩子的大小之和，孩子是文件还是文件夹根本不用关心
  getSize(): number {
    return this.children.reduce((sum, child) => sum + child.getSize(), 0);
  }
}

// ========== 调用方：拿到节点直接调用，完全不用区分类型 ==========
const videos = new FolderNode('视频教程');
videos.add(new FileNode('设计模式.mp4', 800));
videos.add(new FileNode('算法入门.mp4', 600));

const disk = new FolderNode('学习资料');
disk.add(new FileNode('读书笔记.md', 2));
disk.add(videos);
disk.add(new FileNode('面试题.pdf', 5));

console.log(`「${disk.getName()}」总大小：${disk.getSize()} MB`); // 1407

// 单个文件和整个文件夹的调用方式一模一样（部分与整体的一致性）
const singleFile = new FileNode('简历.pdf', 3);
console.log(`「${singleFile.getName()}」大小：${singleFile.getSize()} MB`); // 3

// 优势：
// 1. 调用方统一用 getSize()，不需要 if-else 区分文件还是文件夹
// 2. 递归遍历封装在 FolderNode 内部，只写一遍
// 3. 新增节点类型（如"压缩包"）只要实现同一接口，所有调用代码零修改

export {};
