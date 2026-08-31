// 改后：接口和面向接口编程 -- 定义 FileStorage 接口，UserService 只依赖"能上传文件的对象"，具体存到哪由外部注入

// ========== 接口：只约定"能上传、返回地址"，不关心背后是哪家云 ==========
interface FileStorage {
  upload(key: string, data: string): string;
}

// ========== 实现一：阿里云 OSS（生产环境用） ==========
class AliyunOssStorage implements FileStorage {
  constructor(private bucket: string) {}

  upload(key: string, data: string): string {
    // 厂商专有的细节被关在实现内部，业务代码再也看不到
    console.log(`[阿里云OSS] 上传 ${key}（${data.length} 字节）到桶 ${this.bucket}`);
    return `https://${this.bucket}.oss.aliyuncs.com/${key}`;
  }
}

// ========== 实现二：本地磁盘（本地开发用，不花一分钱） ==========
class LocalDiskStorage implements FileStorage {
  upload(key: string, data: string): string {
    console.log(`[本地磁盘] 保存 ${key}（${data.length} 字节）`);
    return `http://localhost:9000/${key}`;
  }
}

// ========== 实现三：测试替身（单元测试用，什么都不真存） ==========
class FakeStorage implements FileStorage {
  lastKey = '';
  lastSize = 0;

  upload(key: string, data: string): string {
    this.lastKey = key; // 只记录调用，方便断言
    this.lastSize = data.length;
    console.log(`[FakeStorage] 记录上传：${key}（${data.length} 字节）`);
    return `fake://${key}`;
  }
}

// ========== 用户服务：只认识 FileStorage 接口，实现从构造函数注入 ==========
class UserService {
  constructor(private storage: FileStorage) {}

  uploadAvatar(userId: number, avatarData: string): string {
    const key = `avatars/${userId}/head.png`;
    // 只调用接口约定的方法，根本不知道背后是哪家云
    const url = this.storage.upload(key, avatarData);
    console.log(`用户 ${userId} 头像已上传：${url}`);
    return url;
  }
}

// 生产环境：注入 OSS 实现
console.log('--- 生产环境：阿里云 OSS ---');
const prodUserService = new UserService(new AliyunOssStorage('avatar-bucket'));
prodUserService.uploadAvatar(1001, '<头像二进制数据>');

// 本地开发：注入本地磁盘，UserService 一行不改
console.log('--- 本地开发：本地磁盘 ---');
const devUserService = new UserService(new LocalDiskStorage());
devUserService.uploadAvatar(1002, '<头像二进制数据>');

// 单元测试：注入替身，跑得飞快还免费
console.log('--- 单元测试：替身 ---');
const fake = new FakeStorage();
const testUserService = new UserService(fake);
testUserService.uploadAvatar(1003, 'test-avatar');
console.log(`断言：刚上传的 key 是 ${fake.lastKey}`);

// 优势：
// 1. UserService 只依赖 FileStorage 接口，不知道也不需要知道背后是哪家云（面向接口，而非面向实现）
// 2. 换厂商、换环境 = 换一个注入的实现类，业务代码零修改
// 3. 单元测试注入替身即可，不联网、不上传、可断言
// 4. 接口是白纸黑字的契约：任何新实现只要满足 upload 方法签名，随时可以顶上

export {};
