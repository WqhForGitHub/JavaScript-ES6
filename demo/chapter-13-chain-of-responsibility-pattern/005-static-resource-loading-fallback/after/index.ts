// 改后：职责链模式（异步）-- 每个加载来源是链上一个节点，加载失败自动传给下一个来源

// ========== 模拟环境：本地缓存 + 网络可用性 ==========
const cache: Record<string, string> = {};
const network: Record<string, 'ok' | 'fail'> = {
  'https://cdn1.example.com/app.js': 'fail', // 主 CDN 故障中
  'https://cdn2.example.com/app.js': 'fail', // 备 CDN 也故障中
  'https://origin.example.com/app.js': 'ok', // 源站正常
};

function fetchScript(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (network[url] === 'ok') resolve(`「app.js」的内容（来自 ${url}）`);
      else reject(new Error(`${url} 访问失败`));
    }, 50);
  });
}

// ========== 抽象加载节点：“加载失败就传给下一个来源”只在基类写一遍 ==========
abstract class SourceLoader {
  private next: SourceLoader | null = null;

  constructor(protected name: string) {}

  setNext(next: SourceLoader): SourceLoader {
    this.next = next;
    return next;
  }

  async load(): Promise<string> {
    try {
      const content = await this.doLoad();
      console.log(`[成功] ${this.name} 命中`);
      return content;
    } catch {
      if (!this.next) {
        throw new Error(`所有来源均不可用（最后尝试：${this.name}）`);
      }
      console.log(`[失败] ${this.name} 不可用，降级到「${this.next.name}」`);
      return this.next.load(); // 异步地把请求传给下一个节点
    }
  }

  // 子类只负责：从自己这里加载，失败就 throw
  protected abstract doLoad(): Promise<string>;
}

// ========== 具体节点 1：本地缓存（只认缓存键） ==========
class LocalCacheLoader extends SourceLoader {
  constructor(private cacheKey: string) {
    super('本地缓存');
  }

  protected async doLoad(): Promise<string> {
    const cached = cache[this.cacheKey];
    if (cached === undefined) throw new Error('缓存未命中');
    return cached;
  }
}

// ========== 具体节点 2：远程加载（主 CDN / 备 CDN / 源站共用同一实现） ==========
class RemoteLoader extends SourceLoader {
  constructor(
    name: string,
    private url: string,
  ) {
    super(name);
  }

  protected doLoad(): Promise<string> {
    return fetchScript(this.url);
  }
}

// ========== 组装加载链：本地缓存 -> 主 CDN -> 备 CDN -> 源站 ==========
const cacheLoader = new LocalCacheLoader('app.js');
const mainCdn = new RemoteLoader('主CDN', 'https://cdn1.example.com/app.js');
const backupCdn = new RemoteLoader('备CDN', 'https://cdn2.example.com/app.js');
const origin = new RemoteLoader('源站', 'https://origin.example.com/app.js');
cacheLoader.setNext(mainCdn).setNext(backupCdn).setNext(origin);

// ========== 调用方：交给链头，等结果就行 ==========
void (async () => {
  // 第一次加载：缓存未命中 -> 主 CDN 挂 -> 备 CDN 挂 -> 源站成功
  const first = await cacheLoader.load();
  console.log(`第一次加载结果：${first}`);
  console.log('---');

  // 写入缓存后，第二次加载直接命中链头节点
  cache['app.js'] = '「app.js」的内容（来自本地缓存）';
  const second = await cacheLoader.load();
  console.log(`第二次加载结果：${second}`);
})();

// 优势：
// 1. 降级逻辑在基类只写一遍，加一个来源 = new 一个节点 + setNext 一下
// 2. 顺序即组装顺序：想在最前面加“本地缓存”节点，原有节点一行不用改
// 3. 天然支持异步：await 失败后把请求转给下一个节点（异步职责链）
// 4. 每个来源可独立替换：换 CDN 服务商只改 RemoteLoader 的 url 参数

export {};
