// 改后：缓存代理 -- 相同参数的查询直接命中缓存，接口只请求一次
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

class CachedProductService {
  private cache = new Map<number, Product>();

  constructor(private realService: ProductService) {}

  getProduct(id: number): Product {
    const cached = this.cache.get(id);
    if (cached) {
      console.log(`商品 ${id} 命中缓存，直接返回（0ms）`);
      return cached;
    }
    const result = this.realService.getProduct(id);
    this.cache.set(id, result);
    return result;
  }
}

const service = new CachedProductService(new ProductService());
service.getProduct(1); // 第一次：请求接口
service.getProduct(1); // 第二次：命中缓存
service.getProduct(2); // 新参数：请求接口

export {};
