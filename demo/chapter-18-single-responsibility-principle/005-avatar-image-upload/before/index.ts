// 改前：上传头像的函数一站到底 -- 校验、压缩、进度条、传输四件事挤在一个函数里

interface UploadFile {
  name: string;
  type: string; // MIME 类型
  sizeKB: number;
}

function uploadAvatar(file: UploadFile): void {
  // 职责一：校验（类型 + 大小，规则写死）
  if (!['image/jpeg', 'image/png'].includes(file.type)) {
    console.log(`上传失败：${file.name} 不是 jpg/png 图片`);
    return;
  }
  if (file.sizeKB > 5 * 1024) {
    console.log(`上传失败：${file.name} 超过 5MB`);
    return;
  }

  // 职责二：压缩（超过 500KB 就压一半，策略写死）
  let target = file;
  if (file.sizeKB > 500) {
    target = { ...file, sizeKB: Math.ceil(file.sizeKB / 2) };
    console.log(`压缩：${file.sizeKB}KB -> ${target.sizeKB}KB`);
  }

  // 职责三：进度条（直接在这里更新“DOM”）
  console.log('进度条：0%');
  console.log('进度条：50%');

  // 职责四：上传
  console.log(`[请求] PUT /api/avatar ${target.name}（${target.sizeKB}KB）`);
  console.log('进度条：100%');
  console.log(`上传成功：${target.name}`);
}

// ========== 使用 ==========
uploadAvatar({ name: '风景照片.bmp', type: 'image/bmp', sizeKB: 300 }); // 类型不合法
uploadAvatar({ name: '高清原图.png', type: 'image/png', sizeKB: 2048 }); // 压缩后上传成功

// 问题：
// 1. 四个变化原因挤在一处：放宽大小限制、换压缩策略、接 OSS 直传、进度条改样式，都改同一个函数
// 2. 压缩能力拿不出去复用：发帖配图也想要同一套压缩，只能整段复制过去
// 3. 校验逻辑混着界面输出：测试“10MB 的 png 该被拒绝”时，会连进度条“DOM 操作”一起执行

export {};
