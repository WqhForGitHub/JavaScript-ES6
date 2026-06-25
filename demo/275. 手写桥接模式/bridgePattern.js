/**
 * 桥接模式 (Bridge Pattern)
 *
 * Approach:
 * - Decouple an abstraction from its implementation so the two can vary
 *   independently. Instead of an N x M class explosion (e.g. Shape x Color), we
 *   split into two hierarchies connected by composition (a "bridge").
 * - Abstraction: Shape (Circle, Square) holds a reference to an Implementor.
 * - Implementor: Color/Renderer (RedRenderer, BlueRenderer, VectorRenderer,
 *   RasterRenderer). New shapes or new renderers can be added without touching the
 *   other hierarchy.
 */

// ---- Implementor hierarchy ----
class Renderer {
  render(shape) {
    throw new Error("abstract");
  }
}

class VectorRenderer extends Renderer {
  render(shape) {
    return `vector:${shape}`;
  }
}

class RasterRenderer extends Renderer {
  render(shape) {
    return `raster:${shape}`;
  }
}

// Color is also an implementor dimension.
class Color {
  fill() {
    throw new Error("abstract");
  }
}
class RedColor extends Color {
  fill() {
    return "red";
  }
}
class BlueColor extends Color {
  fill() {
    return "blue";
  }
}

// ---- Abstraction hierarchy ----
class Shape {
  constructor(renderer, color) {
    this.renderer = renderer;
    this.color = color;
  }
  name() {
    return "shape";
  }
  draw() {
    return `${this.renderer.render(this.name())} filled with ${this.color.fill()}`;
  }
  resize(factor) {
    return `${this.name()} resized x${factor}`;
  }
}

class Circle extends Shape {
  constructor(renderer, color, radius = 1) {
    super(renderer, color);
    this.radius = radius;
  }
  name() {
    return "circle";
  }
  resize(factor) {
    this.radius *= factor;
    return `circle radius now ${this.radius}`;
  }
}

class Square extends Shape {
  name() {
    return "square";
  }
}

// ---------------- Test cases ----------------
const shapes = [
  new Circle(new VectorRenderer(), new RedColor(), 5),
  new Square(new RasterRenderer(), new BlueColor()),
  new Circle(new RasterRenderer(), new BlueColor()),
];

console.log(shapes.map((s) => s.draw()));
// Expected: [
//   'vector:circle filled with red',
//   'raster:square filled with blue',
//   'raster:circle filled with blue'
// ]

console.log(shapes[0].resize(2));
// Expected: circle radius now 10

// Add a brand-new renderer without touching Shape hierarchy
class SVGRenderer extends Renderer {
  render(shape) {
    return `svg:<${shape}/>`;
  }
}
console.log(new Square(new SVGRenderer(), new RedColor()).draw());
// Expected: svg:<square/> filled with red
