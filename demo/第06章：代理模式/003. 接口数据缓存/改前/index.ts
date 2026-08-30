// 改前：每次查询商品详情都请求后端，相同参数重复请求，浪费带宽、拖慢响应
interface Product {
  id: number;
  name: string;
  price: number;
}

class ProductService {
  getProduct(id: number): Product {
    console.log(`请求后端接口：GET /api/products/${id}（耗时 500ms）`);
    return { id, name: `商品${id}`, price: 100 * id };
  }
}

const service = new ProductService();
service.getProduct(1); // 请求接口
service.getProduct(1); // 又请求接口（数据明明一模一样）
service.getProduct(1); // 再请求接口...

export {};
