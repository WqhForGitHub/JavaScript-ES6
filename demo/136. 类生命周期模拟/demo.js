// 136. 类生命周期模拟

class Component {
  mount() {
    console.log('mounted');
  }
  update() {
    console.log('updated');
  }
  destroy() {
    console.log('destroyed');
  }
}
const c = new Component();
c.mount();
c.update();
c.destroy();
