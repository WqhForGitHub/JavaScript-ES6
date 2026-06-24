/**
 * 手写 async 函数的错误处理包装器
 *
 * 背景：async 函数里频繁写 try/catch 会让代码冗长。常见做法是写一个高阶函数
 *      把 async 函数包一层，把「抛错」转成「返回 [error, data] 元组」
 *      （Go 风格），让调用方用解构优雅地处理错误。
 *
 * 目标：
 *   const [err, data] = await to(fetchUser(id));
 *   if (err) return handleErr(err);
 *   useData(data);
 *
 * 实现：
 *   1. to(promise)：把单个 Promise 转成 [err, data]
 *   2. wrapper(fn)：高阶函数，包装 async 函数，使其返回 [err, data]
 *   3. withHandler(fn, handler)：包装并自带错误处理回调
 */

// 1. 核心：Promise -> [err, data]
function to(promise) {
  return promise.then(
    (data) => [null, data],
    (err) => [err, undefined]
  );
}

// 2. 高阶函数：把 async fn 包装成返回 [err, data] 的函数
function wrapper(fn) {
  return async function (...args) {
    try {
      const data = await fn.apply(this, args);
      return [null, data];
    } catch (err) {
      return [err, undefined];
    }
  };
}

// 3. 自带错误处理：成功返回 data，失败调用 handler 并返回其结果
function withHandler(fn, handler) {
  return async function (...args) {
    try {
      return await fn.apply(this, args);
    } catch (err) {
      return handler(err, ...args);
    }
  };
}

// 4. 可选：带错误转换（把底层错误映射成业务错误）
function mapError(fn, mapper) {
  return async function (...args) {
    try {
      return await fn.apply(this, args);
    } catch (err) {
      throw mapper(err);
    }
  };
}

// ===== 测试 =====

// 模拟可能失败的 async 函数
async function fetchUser(id) {
  if (id < 0) throw new Error("invalid id: " + id);
  return { id, name: "user" + id };
}

(async () => {
  // 1. to(promise) 用法
  const [e1, u1] = await to(fetchUser(1));
  console.log("to success:", e1, u1); // to success: null { id: 1, name: 'user1' }

  const [e2, u2] = await to(fetchUser(-1));
  console.log("to error:", e2 && e2.message, u2); // to error: invalid id: -1 undefined

  // 2. wrapper 高阶函数
  const safeFetchUser = wrapper(fetchUser);
  const [e3, u3] = await safeFetchUser(2);
  console.log("wrapper ok:", e3, u3); // wrapper ok: null { id: 2, name: 'user2' }
  const [e4, u4] = await safeFetchUser(-2);
  console.log("wrapper err:", e4.message); // wrapper err: invalid id: -2

  // 3. withHandler：统一错误处理
  const handledFetch = withHandler(fetchUser, (err, id) => {
    console.log("  [handler] caught for id=" + id + ":", err.message);
    return { id, fallback: true };
  });
  const r5 = await handledFetch(3);
  console.log("handler ok:", r5); // handler ok: { id: 3, name: 'user3' }
  const r6 = await handledFetch(-3);
  console.log("handler fallback:", r6); // handler fallback: { id: -3, fallback: true }

  // 4. mapError：错误转换
  class BusinessError extends Error {
    constructor(msg, code) {
      super(msg);
      this.name = "BusinessError";
      this.code = code;
    }
  }
  const mappedFetch = mapError(fetchUser, (err) =>
    new BusinessError(err.message, "USER_INVALID")
  );
  try {
    await mappedFetch(-4);
  } catch (e) {
    console.log("mapped error:", e.name, e.code, "-", e.message);
    // mapped error: BusinessError USER_INVALID - invalid id: -4
  }
})();
