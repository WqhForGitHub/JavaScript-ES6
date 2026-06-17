// 139. 类扩展插件机制

class App {
  use(plugin) {
    plugin(this);
  }
}
function logger(app) {
  app.log = (msg) => "[log] " + msg;
}
const app = new App();
app.use(logger);
console.log(app.log("ok"));
