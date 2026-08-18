// 第10章：组合模式 - 文件系统

// ==================== Folder 类（组合对象）====================

const Folder = function (name) {
  this.name = name;
  this.files = [];
  this.parent = null;
};

Folder.prototype.add = function (file) {
  file.parent = this;
  this.files.push(file);
};

Folder.prototype.scan = function () {
  console.log('开始扫描文件夹: ' + this.name);
  for (let i = 0; i < this.files.length; i++) {
    this.files[i].scan();
  }
};

Folder.prototype.remove = function () {
  if (!this.parent) {
    console.log('根目录无法删除');
    return;
  }
  for (let i = 0; i < this.parent.files.length; i++) {
    if (this.parent.files[i] === this) {
      this.parent.files.splice(i, 1);
      break;
    }
  }
};

// ==================== File 类（叶对象）====================

const File = function (name) {
  this.name = name;
  this.parent = null;
};

File.prototype.add = function () {
  throw new Error('文件下面不能再添加文件');
};

File.prototype.scan = function () {
  console.log('  扫描文件: ' + this.name);
};

File.prototype.remove = function () {
  if (!this.parent) {
    console.log('根目录无法删除');
    return;
  }
  for (let i = 0; i < this.parent.files.length; i++) {
    if (this.parent.files[i] === this) {
      this.parent.files.splice(i, 1);
      break;
    }
  }
};

// ==================== 构建文件树 ====================

const learningFolder = new Folder('学习资料');
const jsFolder = new Folder('JavaScript');
const nodeFolder = new Folder('Node.js');

const designPatternFile = new File('设计模式');
const jqueryFile = new File('精通jQuery');

jsFolder.add(designPatternFile);
jsFolder.add(jqueryFile);

learningFolder.add(jsFolder);
learningFolder.add(nodeFolder);

// ==================== 扫描整个文件树 ====================

console.log('=== 组合模式 - 文件系统 ===');

console.log('\n--- 扫描学习资料文件夹 ---');
learningFolder.scan();

// ==================== 添加更多文件 ====================

console.log('\n--- 添加 Node.js 文件夹下的文件 ---');
const nodeInActionFile = new File('Node.js实战');
nodeFolder.add(nodeInActionFile);

learningFolder.scan();

// ==================== 尝试在文件下添加 ====================

console.log('\n--- 尝试在文件下添加文件 ---');
try {
  designPatternFile.add(new File('子文件'));
} catch (e) {
  console.log('错误: ' + e.message);
}

// ==================== 删除操作 ====================

console.log('\n--- 删除 jQuery 文件后重新扫描 ---');
jqueryFile.remove();
learningFolder.scan();

console.log('\n--- 删除 JavaScript 文件夹后重新扫描 ---');
jsFolder.remove();
learningFolder.scan();
