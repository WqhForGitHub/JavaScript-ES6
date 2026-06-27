/**
 * 手写 Mock 函数
 * ===========================================================================
 * 实现 Jest 风格的 mock function（模拟函数）。
 *
 * 功能：
 *   - fn(impl) 创建一个 mock 函数
 *   - mock.calls       记录每次调用的参数（二维数组）
 *   - mock.results     记录每次调用的返回结果（{ type: 'return'|'throw', value }）
 *   - mock.instances   记录用 new 调用时 this 的实例
 *   - mockReturnValue(val)            设置固定返回值
 *   - mockReturnValueOnce(val)        设置一次性返回值（用完即弃）
 *   - mockResolvedValue(val)          返回 Promise.resolve(val)
 *   - mockRejectedValue(err)          返回 Promise.reject(err)
 *   - mockImplementation(impl)        设置实现
 *   - mockImplementationOnce(impl)    设置一次性实现
 *   - mockClear()      清空调用记录（不影响实现）
 *   - mockReset()      清空记录并重置实现为空函数
 *   - mockRestore()    重置并恢复原始实现（如有）
 *
 * 演示：模拟一个 fetch 函数。
 */

// ------------------------------ Mock 函数实现 ------------------------------

/**
 * 创建一个 mock 函数
 * @param {Function} [impl] 默认实现
 * @returns {Function} mock 函数（带 mock 属性）
 */
function fn(impl) {
  // 默认实现：返回 undefined
  let currentImpl = typeof impl === "function" ? impl : () => undefined;

  // 一次性返回值队列（mockReturnValueOnce）
  const returnValuesOnce = [];
  // 一次性实现队列（mockImplementationOnce）
  const implementationsOnce = [];

  // 持久返回值（mockReturnValue 设置后覆盖 impl）
  let hasPersistentReturn = false;
  let persistentReturnValue;

  // 持久实现（mockImplementation 设置后覆盖原始 impl）
  let hasPersistentImpl = false;
  let persistentImpl;

  // 保存原始实现，用于 mockRestore
  const originalImpl = typeof impl === "function" ? impl : null;

  /**
   * mock 状态对象（即 mockFn.mock）
   * 只包含调用记录，符合 Jest 的 API 设计：
   *   - mockFn.mock.calls / mockFn.mock.results / mockFn.mock.instances
   * 配置方法（mockReturnValue 等）则直接挂在 mockFn 上。
   */
  const mockState = {
    calls: [], // [[...args], [...args], ...]
    results: [], // [{ type, value }, ...]
    instances: [], // new 调用时的 this

    // ---- 统计属性（getter 形式，便于使用） ----
    get length() {
      return this.calls.length;
    },
  };

  /** 清空调用记录（保留实现/返回值配置） */
  function mockClear() {
    mockState.calls = [];
    mockState.results = [];
    mockState.instances = [];
    return mockFn;
  }

  /** 重置：清空记录 + 重置实现为空函数 */
  function mockReset() {
    mockClear();
    currentImpl = () => undefined;
    hasPersistentReturn = false;
    hasPersistentImpl = false;
    returnValuesOnce.length = 0;
    implementationsOnce.length = 0;
    return mockFn;
  }

  /** 恢复到原始实现 */
  function mockRestore() {
    mockReset();
    currentImpl = originalImpl ? originalImpl : () => undefined;
    return mockFn;
  }

  /**
   * 实际的 mock 函数
   * 支持普通调用与 new 调用
   */
  function mockFn(...args) {
    // 记录调用参数
    mockState.calls.push(args);

    // 处理 new 调用：创建 this 实例并记录
    // 注：箭头函数无法用 new，这里用普通 function，this 在 new 时是实例
    // 由于此处 mockFn 是 function 声明，this 会正确指向 new 出的实例
    const isNew = new.target !== undefined;
    if (isNew) {
      // 记录 this（实例）
      mockState.instances.push(this);
    } else {
      mockState.instances.push(undefined);
    }

    // 决定使用哪个实现
    let execFn;
    if (implementationsOnce.length > 0) {
      execFn = implementationsOnce.shift();
    } else if (hasPersistentImpl) {
      execFn = persistentImpl;
    } else {
      execFn = currentImpl;
    }

    // 执行并处理返回值
    try {
      let result;
      if (isNew) {
        // new 调用：在 this 上执行实现
        result = execFn.apply(this, args);
        // 如果实现返回对象则用其作为 new 的结果（JS 语义）
        if (
          result &&
          (typeof result === "object" || typeof result === "function")
        ) {
          // mock 的 results 仍记录实现返回值
        }
      } else {
        result = execFn.apply(this, args);
      }

      // 如果设置了一次性返回值，优先使用
      if (returnValuesOnce.length > 0) {
        const once = returnValuesOnce.shift();
        result = once.value;
      } else if (hasPersistentReturn) {
        result = persistentReturnValue;
      }

      mockState.results.push({ type: "return", value: result });

      // new 调用且实现返回非对象：返回 this
      if (
        isNew &&
        !(
          result &&
          (typeof result === "object" || typeof result === "function")
        )
      ) {
        return this;
      }
      return result;
    } catch (err) {
      mockState.results.push({ type: "throw", value: err });
      throw err;
    }
  }

  // 把 mockState 挂到函数上（只含调用记录）
  mockFn.mock = mockState;

  // ---- 配置方法直接挂在 mockFn 上（符合 Jest 的 API 设计） ----
  mockFn.mockReturnValue = (val) => {
    hasPersistentReturn = true;
    persistentReturnValue = val;
    hasPersistentImpl = false;
    return mockFn;
  };

  mockFn.mockReturnValueOnce = (val) => {
    returnValuesOnce.push({ type: "return", value: val });
    return mockFn;
  };

  mockFn.mockResolvedValue = (val) => {
    hasPersistentReturn = true;
    persistentReturnValue = Promise.resolve(val);
    hasPersistentImpl = false;
    return mockFn;
  };

  mockFn.mockResolvedValueOnce = (val) => {
    returnValuesOnce.push({ type: "return", value: Promise.resolve(val) });
    return mockFn;
  };

  mockFn.mockRejectedValue = (err) => {
    hasPersistentReturn = true;
    persistentReturnValue = Promise.reject(err);
    hasPersistentImpl = false;
    return mockFn;
  };

  mockFn.mockRejectedValueOnce = (err) => {
    returnValuesOnce.push({ type: "return", value: Promise.reject(err) });
    return mockFn;
  };

  mockFn.mockImplementation = (implFn) => {
    hasPersistentImpl = true;
    persistentImpl = implFn;
    hasPersistentReturn = false;
    return mockFn;
  };

  mockFn.mockImplementationOnce = (implFn) => {
    implementationsOnce.push(implFn);
    return mockFn;
  };

  mockFn.mockClear = mockClear;
  mockFn.mockReset = mockReset;
  mockFn.mockRestore = mockRestore;

  // 提供 getMockName / mockName 便于调试（简易）
  mockFn.getMockName = () => "jest.fn()";
  mockFn.mockName = function (name) {
    this._name = name;
    return this;
  };

  return mockFn;
}

// ============================ 测试用例 ============================

console.log("===== 测试 1：基本调用记录 =====");
const mock1 = fn((x, y) => x + y);
mock1(1, 2);
mock1(3, 4);
console.log("calls:", mock1.mock.calls); // [[1,2],[3,4]]
console.log("results:", mock1.mock.results); // [{type:'return',value:3},{type:'return',value:7}]
console.log("length:", mock1.mock.length); // 2

console.log("\n===== 测试 2：mockReturnValue 固定返回值 =====");
const mock2 = fn();
mock2.mockReturnValue("fixed");
console.log(mock2()); // fixed
console.log(mock2()); // fixed

console.log("\n===== 测试 3：mockReturnValueOnce 一次性返回值 =====");
const mock3 = fn();
mock3
  .mockReturnValueOnce("first")
  .mockReturnValueOnce("second")
  .mockReturnValue("default");
console.log(mock3()); // first
console.log(mock3()); // second
console.log(mock3()); // default
console.log(mock3()); // default

console.log(
  "\n===== 测试 4：mockImplementation / mockImplementationOnce =====",
);
const mock4 = fn(() => "original");
console.log(mock4()); // original
mock4.mockImplementation(() => "changed");
console.log(mock4()); // changed
mock4.mockImplementationOnce(() => "once-only");
console.log(mock4()); // once-only
console.log(mock4()); // changed（once 用完后回到 persistent）

console.log("\n===== 测试 5：mockResolvedValue 返回 Promise =====");
const mock5 = fn();
mock5.mockResolvedValue({ data: "hello" });
mock5().then((v) => console.log("resolved:", v)); // resolved: { data: 'hello' }

console.log("\n===== 测试 6：mockRejectedValue 返回 reject =====");
const mock6 = fn();
mock6.mockRejectedValue(new Error("失败"));
mock6().catch((e) => console.log("rejected:", e.message)); // rejected: 失败

// 等待异步 Promise 完成
setTimeout(() => {
  console.log("\n===== 测试 7：mockClear / mockReset =====");
  const mock7 = fn((x) => x * 2);
  mock7(1);
  mock7(2);
  console.log("清除前 calls:", mock7.mock.calls.length); // 2
  mock7.mockClear();
  console.log("清除后 calls:", mock7.mock.calls.length); // 0
  console.log("清除后实现仍可用:", mock7(5)); // 10

  mock7.mockReset();
  console.log("reset 后调用:", mock7(5)); // undefined（实现被重置）

  console.log("\n===== 测试 8：记录抛错 =====");
  const mock8 = fn(() => {
    throw new Error("boom");
  });
  try {
    mock8();
  } catch (e) {
    /* swallow */
  }
  console.log("results:", mock8.mock.results); // [{ type:'throw', value: Error }]

  console.log("\n===== 测试 9：new 调用记录 instances =====");
  const MockClass = fn(function (name) {
    this.name = name;
  });
  const instance = new MockClass("Alice");
  console.log("instances:", mock1.mock.instances); // mock1 的实例（undefined，因为普通调用）
  console.log("MockClass instances length:", MockClass.mock.instances.length); // 1
  console.log("MockClass instance.name:", instance.name); // Alice

  console.log("\n===== 测试 10：模拟 fetch 函数（实战演示） =====");
  // 模拟 fetch：第一次返回用户1，第二次返回用户2，之后返回默认
  const mockFetch = fn();
  mockFetch
    .mockResolvedValueOnce({ id: 1, name: "Alice" })
    .mockResolvedValueOnce({ id: 2, name: "Bob" })
    .mockResolvedValue({ id: 0, name: "Unknown" });

  // 业务函数：依赖 fetch
  async function getUser(id) {
    const res = await mockFetch(`/api/users/${id}`);
    return res;
  }

  (async () => {
    const u1 = await getUser(1);
    const u2 = await getUser(2);
    const u3 = await getUser(3);
    console.log("用户1:", u1); // { id:1, name:'Alice' }
    console.log("用户2:", u2); // { id:2, name:'Bob' }
    console.log("用户3:", u3); // { id:0, name:'Unknown' }

    console.log("\nfetch 被调用次数:", mockFetch.mock.length); // 3
    console.log("fetch 调用参数:", mockFetch.mock.calls);
    // [['/api/users/1'], ['/api/users/2'], ['/api/users/3']]

    // 验证 mockFetch 被正确调用
    console.log("第一次调用的参数:", mockFetch.mock.calls[0][0]); // /api/users/1

    console.log("\n所有 Mock 函数测试结束。");
  })();
}, 100);
