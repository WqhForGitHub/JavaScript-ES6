class ServiceRegistry {
  private static instance: ServiceRegistry;
  services: Map<string, string> = new Map();

  private constructor() { }
  static getInstance(): ServiceRegistry {
    if (!ServiceRegistry.instance) ServiceRegistry.instance = new ServiceRegistry();
    return ServiceRegistry.instance;
  }

  register(name: string, url: string) { this.services.set(name, url); }
}

ServiceRegistry.getInstance().register('user-service', 'http://localhost:8001');
console.log(ServiceRegistry.getInstance().services.get('user-service')); // ✅