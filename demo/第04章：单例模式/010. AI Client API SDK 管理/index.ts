// 第04章：单例模式 - 010：AI Client / API SDK 管理
//
// 场景：调用 AI / 第三方 API 的 SDK 通常要携带 apiKey、baseUrl、超时等配置，
// 还要做全局限流（每分钟最多 N 次请求）。
// 如果每个页面都 new 一个 client，密钥会散落各处、限流窗口也各算各的，形同虚设。
// 正确姿势：应用启动时初始化一次，全局复用同一个 client。

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatOptions {
  model?: string;
  temperature?: number;
}

interface AIClientConfig {
  apiKey: string;
  baseUrl?: string;
  model?: string;
}

class AIClient {
  private static instance: AIClient | null = null;

  private apiKey: string;
  private baseUrl: string;
  private model: string;

  // 简易限流：滑动窗口内最多 maxPerMinute 次请求
  private readonly maxPerMinute = 3;
  private timestamps: number[] = [];
  private requestCount = 0;

  private constructor(config: AIClientConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl ?? 'https://api.ai.example.com/v1';
    this.model = config.model ?? 'glm-4.5';
    console.log(`[AIClient] 初始化完成：${this.baseUrl}，默认模型 ${this.model}`);
  }

  /**
   * 首次调用必须传入 apiKey（完成初始化）；
   * 之后任何模块都可以不带参数直接拿到同一个实例。
   */
  static getInstance(config?: AIClientConfig): AIClient {
    if (!AIClient.instance) {
      if (!config?.apiKey) {
        throw new Error('首次初始化必须提供 apiKey');
      }
      AIClient.instance = new AIClient(config);
    }
    return AIClient.instance;
  }

  /** 滑动窗口限流：只统计最近 1 分钟内的请求 */
  private tryAcquireQuota(): boolean {
    const now = Date.now();
    this.timestamps = this.timestamps.filter((t) => now - t < 60_000);
    if (this.timestamps.length >= this.maxPerMinute) {
      return false;
    }
    this.timestamps.push(now);
    return true;
  }

  async chat(messages: ChatMessage[], options?: ChatOptions): Promise<string> {
    if (!this.tryAcquireQuota()) {
      return '（被限流：本分钟的请求额度已用完，请稍后再试）';
    }
    this.requestCount++;

    // 模拟发起 HTTP 请求
    console.log(
      `[请求 #${this.requestCount}] POST ${this.baseUrl}/chat/completions ` +
        `model=${options?.model ?? this.model} ` +
        `Authorization=Bearer ${this.apiKey.slice(0, 8)}...`
    );
    await new Promise((r) => setTimeout(r, 30));

    const lastMsg = messages[messages.length - 1].content;
    return `（AI 回复）你刚才说的是「${lastMsg}」，这是一条模拟回复。`;
  }

  getRequestCount(): number {
    return this.requestCount;
  }
}

// ============================================================
// 使用演示
// ============================================================

async function main() {
  // 应用启动时初始化一次（真实项目中 apiKey 来自环境变量，绝不硬编码）
  const ai = AIClient.getInstance({ apiKey: 'sk-demo-1234567890' });

  // 业务模块直接复用，不需要（也不能）再传 apiKey
  const chatModule = AIClient.getInstance();
  const translateModule = AIClient.getInstance();

  console.log(
    '\n三个引用是否是同一个 client：',
    ai === chatModule && chatModule === translateModule
  ); // true

  console.log('\n--- 聊天模块 ---');
  console.log(await chatModule.chat([{ role: 'user', content: '用一句话解释单例模式' }]));

  console.log('\n--- 翻译模块（共享同一个限流窗口）---');
  console.log(await translateModule.chat([{ role: 'user', content: 'translate: hello' }]));
  console.log(await ai.chat([{ role: 'user', content: '写一首关于秋天的诗' }], { temperature: 0.9 }));

  console.log('\n--- 第 4 次请求触发限流 ---');
  console.log(await chatModule.chat([{ role: 'user', content: '再来一个问题' }]));

  console.log('\n实际发出的请求数：', ai.getRequestCount()); // 3
}

main();

export {};
