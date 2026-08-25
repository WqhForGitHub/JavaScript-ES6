// ==============================
// 第16章：状态模式 - 文件上传
// ==============================

console.log('========== 状态模式：文件上传 ==========');

// 状态工厂：创建状态类并强制子类实现指定方法
const StateFactory = function (methods) {
  const F = function (upload) {
    this.upload = upload;
  };
  for (var i = 0, len = methods.length; i < len; i++) {
    F.prototype[methods[i]] = function () {
      throw new Error('子类必须实现 ' + methods[i] + ' 方法');
    };
  }
  return F;
};

// 定义状态基类，需要实现 clickHandler1 和 clickHandler2
const UploadState = StateFactory(['clickHandler1', 'clickHandler2']);

// ======== 各个状态类 ========

const SignState = function (upload) {
  this.upload = upload;
};
SignState.prototype = new UploadState();
SignState.prototype.clickHandler1 = function () {
  console.log('[SignState] 扫描中，点击无效');
};
SignState.prototype.clickHandler2 = function () {
  console.log('[SignState] 扫描中，点击无效');
};

const UploadingState = function (upload) {
  this.upload = upload;
};
UploadingState.prototype = new UploadState();
UploadingState.prototype.clickHandler1 = function () {
  this.upload.pause();
};
UploadingState.prototype.clickHandler2 = function () {
  console.log('[UploadingState] 正在上传，点击删除');
  this.upload.cancel();
};

const PauseState = function (upload) {
  this.upload = upload;
};
PauseState.prototype = new UploadState();
PauseState.prototype.clickHandler1 = function () {
  this.upload.resume();
};
PauseState.prototype.clickHandler2 = function () {
  console.log('[PauseState] 暂停中，点击删除');
  this.upload.cancel();
};

const DoneState = function (upload) {
  this.upload = upload;
};
DoneState.prototype = new UploadState();
DoneState.prototype.clickHandler1 = function () {
  console.log('[DoneState] 上传已完成，点击重新上传');
  this.upload.sign();
};
DoneState.prototype.clickHandler2 = function () {
  console.log('[DoneState] 上传已完成，点击删除文件');
};

const ErrorState = function (upload) {
  this.upload = upload;
};
ErrorState.prototype = new UploadState();
ErrorState.prototype.clickHandler1 = function () {
  console.log('[ErrorState] 上传出错，点击重新上传');
  this.upload.sign();
};
ErrorState.prototype.clickHandler2 = function () {
  console.log('[ErrorState] 上传出错，点击删除文件');
};

// ======== Upload 类 ========

const Upload = function (fileName) {
  this.fileName = fileName;
  this.signState = new SignState(this);
  this.uploadingState = new UploadingState(this);
  this.pauseState = new PauseState(this);
  this.doneState = new DoneState(this);
  this.errorState = new ErrorState(this);
  this.currState = this.signState;
};

Upload.prototype.sign = function () {
  console.log('>> 进入扫描签名阶段');
  this.setState(this.signState);
};

Upload.prototype.uploading = function () {
  console.log('>> 进入上传阶段');
  this.setState(this.uploadingState);
};

Upload.prototype.pause = function () {
  console.log('>> 暂停上传');
  this.setState(this.pauseState);
};

Upload.prototype.resume = function () {
  console.log('>> 恢复上传');
  this.setState(this.uploadingState);
};

Upload.prototype.done = function () {
  console.log('>> 上传完成');
  this.setState(this.doneState);
};

Upload.prototype.error = function () {
  console.log('>> 上传出错');
  this.setState(this.errorState);
};

Upload.prototype.cancel = function () {
  console.log('>> 取消上传');
};

Upload.prototype.setState = function (newState) {
  this.currState = newState;
};

Upload.prototype.click1 = function () {
  this.currState.clickHandler1();
};

Upload.prototype.click2 = function () {
  this.currState.clickHandler2();
};

// ======== 模拟上传流程 ========

console.log('');
console.log('--- 模拟文件上传流程 ---');

const upload = new Upload('test.jpg');

// 初始：扫描签名阶段
console.log('');
console.log('阶段1：签名扫描中');
upload.click1();
upload.click2();

// 模拟扫描完成，进入上传
setTimeout(function () {
  console.log('');
  console.log('阶段2：扫描完成，开始上传');
  upload.uploading();
  upload.click1(); // 暂停
  upload.click2(); // 删除

  // 模拟暂停后恢复
  setTimeout(function () {
    console.log('');
    console.log('阶段3：暂停后恢复上传');
    upload.resume();

    // 模拟上传完成
    setTimeout(function () {
      console.log('');
      console.log('阶段4：上传完成');
      upload.done();
      upload.click1(); // 重新上传
      upload.click2(); // 删除文件
    }, 1000);
  }, 1000);
}, 1000);
