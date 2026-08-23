class ServiceRegistry {
  services: Map<string, string> = new Map();
  register(name: string, url: string) { this.services.set(name, url); }
}

// 不同模块各维护一份 —— 服务发现不一致
const regA = new ServiceRegistry();
regA.register('user-service', 'http://localhost:8001');
const regB = new ServiceRegistry();
console.log(regB.services.get('user-service')); // undefined

export { }