// 改后：日志代理 -- 用 ES6 Proxy 统一拦截方法调用，日志零侵入业务代码
class OrderService {
  createOrder(orderNo: string) {
    console.log(`创建订单 ${orderNo}`);
  }

  cancelOrder(orderNo: string) {
    console.log(`取消订单 ${orderNo}`);
  }
}

function withLogging<T extends object>(target: T): T {
  return new Proxy(target, {
    get(obj, prop, receiver) {
      const original = Reflect.get(obj, prop, receiver);
      if (typeof original !== 'function') {
        return original;
      }
      return (...args: unknown[]) => {
        console.log(`[LOG] 调用 ${String(prop)}，参数: ${JSON.stringify(args)}`);
        const result = (original as (...a: unknown[]) => unknown).apply(obj, args);
        console.log(`[LOG] ${String(prop)} 执行完成`);
        return result;
      };
    },
  });
}

const service = withLogging(new OrderService());
service.createOrder('NO.1001'); // 日志自动记录
service.cancelOrder('NO.1001'); // 日志自动记录

export {};
