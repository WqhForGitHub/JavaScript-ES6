// 284. 工厂模式系统

class ShapeFactory {
  static create(type) {
    const shapes = {
      circle: { draw: () => 'draw circle' },
      square: { draw: () => 'draw square' },
    };
    return shapes[type] || { draw: () => 'unknown' };
  }
}
console.log(ShapeFactory.create('circle').draw());
