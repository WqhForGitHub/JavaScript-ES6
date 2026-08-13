// 299. webpack简化模型

class MiniWebpack {
  constructor(entry, modules) {
    this.entry = entry;
    this.modules = modules;
  }
  build() {
    const graph = Object.keys(this.modules).map((id) => ({
      id,
      code: this.modules[id].toString(),
    }));
    return { entry: this.entry, graph };
  }
}
console.log(new MiniWebpack('main', { main: () => console.log('app') }).build());
