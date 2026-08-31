// 改前：每个业务方法里手动写日志，代码又臭又长，业务一多必然漏写
class OrderService {
  createOrder(orderNo: string) {
    console.log(`[LOG] 调用 createOrder，参数: ${orderNo}`);
    console.log(`创建订单 ${orderNo}`);
    console.log('[LOG] createOrder 执行完成');
  }

  cancelOrder(orderNo: string) {
    console.log(`[LOG] 调用 cancelOrder，参数: ${orderNo}`); // 复制粘贴的日志
    console.log(`取消订单 ${orderNo}`);
    console.log('[LOG] cancelOrder 执行完成');
  }
}

const service = new OrderService();
service.createOrder('NO.1001');
service.cancelOrder('NO.1001');

export {};
