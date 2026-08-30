// 改后：单一职责原则 -- 校验、压缩、进度、传输各归一个模块，上传流程由编排函数串联

interface UploadFile {
  name: string;
  type: string; // MIME 类型
  sizeKB: number;
}

// ========== 职责一：校验器 -- 只回答“这个文件能不能传”，规则调整只改这里 ==========
class AvatarFileChecker {
  private readonly allowedTypes = ['image/jpeg', 'image/png'];
  private readonly maxKB = 5 * 1024;

  check(file: UploadFile): string | null {
    if (!this.allowedTypes.includes(file.type)) return `${file.name} 不是 jpg/png 图片`;
    if (file.sizeKB > this.maxKB) return `${file.name} 超过 5MB`;
    return null; // null 表示通过
  }
}

// ========== 职责二：压缩器 -- 只回答“怎么把图片变小”，换策略只改这里 ==========
class ImageCompressor {
  compress(file: UploadFile): UploadFile {
    if (file.sizeKB <= 500) {
      console.log(`跳过压缩：${file.name} 只有 ${file.sizeKB}KB，无需处理`);
      return file;
    }
    const compressed = { ...file, sizeKB: Math.ceil(file.sizeKB / 2) };
    console.log(`压缩：${file.sizeKB}KB -> ${compressed.sizeKB}KB`);
    return compressed;
  }
}

// ========== 职责三：进度条 -- 只负责展示进度，改 UI 样式只改这里 ==========
class UploadProgressBar {
  update(percent: number): void {
    console.log(`进度条：${percent}%`);
  }
}

// ========== 职责四：上传器 -- 只负责传输，换 OSS 直传只改这里 ==========
class AvatarUploader {
  upload(file: UploadFile, onProgress: (percent: number) => void): string {
    onProgress(0);
    onProgress(50);
    console.log(`[请求] PUT /api/avatar ${file.name}（${file.sizeKB}KB）`);
    onProgress(100);
    return `https://cdn.example.com/${file.name}`;
  }
}

// ========== 编排：校验 -> 压缩 -> 上传，进度条只挂在传输这一站 ==========
const checker = new AvatarFileChecker();
const compressor = new ImageCompressor();
const uploader = new AvatarUploader();
const progressBar = new UploadProgressBar();

function uploadAvatar(file: UploadFile): string | null {
  const error = checker.check(file);
  if (error) {
    console.log(`上传失败：${error}`);
    return null;
  }
  const target = compressor.compress(file);
  const url = uploader.upload(target, (percent) => progressBar.update(percent));
  console.log(`上传成功：${file.name}，地址 ${url}`);
  return url;
}

// ========== 使用 ==========
uploadAvatar({ name: '风景照片.bmp', type: 'image/bmp', sizeKB: 300 }); // 类型不合法
uploadAvatar({ name: '高清原图.png', type: 'image/png', sizeKB: 2048 }); // 压缩后上传成功

// ========== 复用：发帖配图只借压缩器，不带走校验规则和上传接口 ==========
console.log('--- 发帖配图，复用压缩器 ---');
compressor.compress({ name: '帖子配图.jpg', type: 'image/jpeg', sizeKB: 900 });

// 优势：
// 1. 四个变化原因各有归属：放宽大小限制只改 checker，换压缩算法只改 compressor，接 OSS 只改 uploader
// 2. 模块按需复用：发帖配图只借压缩器，任何带进度条的场景只借 progressBar，互不拖泥带水
// 3. 校验器是纯逻辑（输入文件、输出失败原因），不发请求不碰界面，单测两三行就能写完

export {};
