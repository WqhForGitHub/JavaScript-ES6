/**
 * 手写 Promise 取消机制
 *
 * 背景：原生 Promise 一旦创建无法取消。要实现「可取消」语义，常见做法：
 *   1. 包装一层，用标志位 + reject 表示取消；底层任务仍会运行，但结果被忽略。
 *   2. 暴露一个 cancel() 方法供外部调用。
 *   3. 支持注册 onCleanup 清理回调（如 clearTimeout、abort）。
 *
 * 本实现：CancelablePromise 类
 *   - 内部维护 cancelled 标志、reason、清理回调列表
 *   - then/catch 返回新的 CancelablePromise，链式取消会向上传播
 *   - cancel() 触发 reject(CancelError)，并执行所有清理回调
 */

class CancelError extends Error {
  constructor(reason = "cancelled") {
    super(typeof reason === "string" ? reason : "cancelled");
    this.name = "CancelError";
    this.reason = reason;
  }
}

class CancelablePromise {
  constructor(executor) {
    this._cancelled = false;
    this._cancelReason = undefined;
    this._cleanups = [];

    this._promise = new Promise((resolve, reject) => {
      this._reject = reject;
      const onCleanup = (fn) => this._cleanups.push(fn);

      try {
        executor(
          (value) => {
            if (this._cancelled) return;
            resolve(value);
          },
          (err) => {
            if (this._cancelled) return;
            reject(err);
          },
          onCleanup
        );
      } catch (e) {
        reject(e);
      }
    });
  }

  cancel(reason) {
    if (this._cancelled) return;
    this._cancelled = true;
    this._cancelReason = reason ?? new CancelError();
    // 执行清理回调
    this._cleanups.forEach((fn) => {
      try {
        fn();
      } catch (_) {}
    });
    this._reject(
      reason instanceof Error ? reason : new CancelError(reason)
    );
  }

  get cancelled() {
    return this._cancelled;
  }

  then(onFulfilled, onRejected) {
    const next = new CancelablePromise((resolve, reject, onCleanup) => {
      this._promise.then(
        (v) => {
          if (this._cancelled) return;
          try {
            resolve(onFulfilled ? onFulfilled(v) : v);
          } catch (e) {
            reject(e);
          }
        },
        (e) => {
          if (this._cancelled) {
            reject(e); // 取消原因继续向下传递
            return;
          }
          try {
            resolve(onRejected ? onRejected(e) : undefined);
          } catch (err) {
            reject(err);
          }
        }
      );
      // 把取消能力串起来：父取消 -> 子也取消
      onCleanup(() => next.cancel(this._cancelReason));
    });
    return next;
  }

  catch(onRejected) {
    return this.then(undefined, onRejected);
  }

  // 暴露原生 promise，便于 await
  get promise() {
    return this._promise;
  }
}

// ===== 测试 =====

(async () => {
  // 1. 正常完成
  // executor 第三个参数 onCleanup 用来注册「取消时执行的清理回调」
  const c1 = new CancelablePromise((resolve, _reject, onCleanup) => {
    const t = setTimeout(() => resolve("done"), 30);
    onCleanup(() => clearTimeout(t)); // 取消时清除定时器
  });
  const r1 = await c1.promise;
  console.log("case1 ok:", r1); // case1 ok: done

  // 2. 主动取消 -> reject CancelError
  const c2 = new CancelablePromise((resolve, _reject, onCleanup) => {
    const t = setTimeout(() => resolve("late"), 100);
    onCleanup(() => {
      clearTimeout(t);
      console.log("  cleanup: timer cleared");
    });
  });
  setTimeout(() => c2.cancel("user aborted"), 20);
  try {
    await c2.promise;
    console.log("case2 should not resolve");
  } catch (e) {
    console.log("case2 cancelled:", e.name, "-", e.message);
    // case2 cancelled: CancelError - user aborted
  }

  // 3. 链式 then 后取消
  const c3 = new CancelablePromise((resolve, _reject, onCleanup) => {
    const t = setTimeout(() => resolve(1), 50);
    onCleanup(() => clearTimeout(t));
  });
  const chain = c3.then((v) => {
    console.log("  then got:", v);
    return v + 10;
  });
  setTimeout(() => c3.cancel("abort chain"), 10);
  try {
    await chain.promise;
  } catch (e) {
    console.log("case3 chain cancelled:", e.message); // case3 chain cancelled: abort chain
  }

  // 4. 已完成的不能取消
  const c4 = new CancelablePromise((resolve) => resolve("ok"));
  await c4.promise;
  c4.cancel("too late");
  console.log("case4 cancelled flag after cancel:", c4.cancelled);
  // case4 cancelled flag after cancel: false（因为已完成，cancel 无效）
})();
