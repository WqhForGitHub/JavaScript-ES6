// 改前：降级顺序硬编码在一个函数里，Promise 嵌套一层层往下坠

// 模拟网络环境：预先约定哪些地址能访问成功
const network: Record<string, 'ok' | 'fail'> = {
  'https://cdn1.example.com/app.js': 'fail', // 主 CDN 故障中
  'https://cdn2.example.com/app.js': 'fail', // 备 CDN 也故障中
  'https://origin.example.com/app.js': 'ok', // 源站正常
};

function fetchScript(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (network[url] === 'ok') {
        resolve(`「app.js」的内容（来自 ${url}）`);
      } else {
        reject(new Error(`${url} 访问失败`));
      }
    }, 50);
  });
}

// 降级逻辑：主 CDN -> 备 CDN -> 源站，顺序写死、嵌套写死
function loadAppScript(): Promise<string> {
  return fetchScript('https://cdn1.example.com/app.js').catch((error: Error) => {
    console.log(`${error.message}，降级到备用 CDN...`);
    return fetchScript('https://cdn2.example.com/app.js').catch((error2: Error) => {
      console.log(`${error2.message}，回源加载...`);
      return fetchScript('https://origin.example.com/app.js').catch(() => {
        throw new Error('所有来源都不可用');
      });
    });
  });
}

void (async () => {
  const content = await loadAppScript();
  console.log(`加载成功：${content}`);
})();

// 问题：
// 1. 每加一个降级来源，就要多嵌套一层 catch，金字塔越垒越高
// 2. 降级顺序写死在函数里，换一个资源想换顺序只能整个重写
// 3. “发起请求”和“降级编排”搅在一起，请求本身无法复用
// 4. 想在链头加“先查本地缓存”这种新策略？没有插入点，只能继续往里塞

export {};
