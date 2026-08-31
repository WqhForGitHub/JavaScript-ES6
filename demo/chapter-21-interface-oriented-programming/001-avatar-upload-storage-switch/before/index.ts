// 改前：用户服务要存头像，直接在代码里 new 了一个阿里云 OSS 客户端，厂商的类名、方法名、桶名全部焊死在业务代码里

// ========== 阿里云 OSS 客户端：第三方 SDK，方法名是厂商说了算 ==========
class AliyunOssClient {
  constructor(private bucket: string) {}

  // 厂商专有方法：putObjectFromData，名字又长又怪
  putObjectFromData(key: string, data: string): string {
    console.log(`[阿里云OSS] 上传 ${key}（${data.length} 字节）到桶 ${this.bucket}`);
    return `https://${this.bucket}.oss.aliyuncs.com/${key}`;
  }
}

// ========== 用户服务：业务代码直接 new 具体厂商类 ==========
class UserService {
  // 焊死的依赖：想换腾讯云 COS？先回来改这里
  private oss = new AliyunOssClient('avatar-bucket');

  uploadAvatar(userId: number, avatarData: string): string {
    // 厂商专有的方法名泄漏进了业务代码
    const key = `avatars/${userId}/head.png`;
    const url = this.oss.putObjectFromData(key, avatarData);
    console.log(`用户 ${userId} 头像已上传：${url}`);
    return url;
  }
}

const userService = new UserService();
userService.uploadAvatar(1001, '<头像二进制数据>');

// 问题：
// 1. UserService 认识了具体厂商：OSS 的类名、方法名、桶名全部写死在业务代码里
// 2. 换存储厂商（腾讯云 COS、七牛），或本地开发想存磁盘省点钱，都必须回来改 UserService
// 3. 单元测试要么真上传文件，要么专门 mock 整个 OSS 客户端，费时费力
// 4. 厂商 SDK 升级改了方法签名，业务代码跟着遭殃

export {};
