/**
 * 访问者模式 (Visitor Pattern)
 *
 * Approach:
 * - Represent an operation to be performed on the elements of an object structure.
 *   Visitor lets you define a new operation without changing the classes of the
 *   elements on which it operates (double dispatch).
 * - Each Element implements an accept(visitor) method that calls
 *   visitor.visitXxx(this). The Visitor has one visitXxx method per concrete
 *   element type. Adding a new operation = new Visitor; adding a new element type
 *   requires changing all visitors (the classic trade-off).
 * - We model a shape hierarchy (Circle, Rectangle, Triangle) and two visitors:
 *   AreaVisitor and JSONExportVisitor — adding export logic without touching shapes.
 */

// ---- Element interface ----
class Shape {
  accept(visitor) {
    throw new Error("abstract");
  }
}

class Circle extends Shape {
  constructor(radius) {
    super();
    this.radius = radius;
  }
  accept(visitor) {
    return visitor.visitCircle(this);
  }
}

class Rectangle extends Shape {
  constructor(width, height) {
    super();
    this.width = width;
    this.height = height;
  }
  accept(visitor) {
    return visitor.visitRectangle(this);
  }
}

class Triangle extends Shape {
  constructor(base, height) {
    super();
    this.base = base;
    this.height = height;
  }
  accept(visitor) {
    return visitor.visitTriangle(this);
  }
}

// ---- Visitor base ----
class Visitor {
  visitCircle() {
    throw new Error("abstract");
  }
  visitRectangle() {
    throw new Error("abstract");
  }
  visitTriangle() {
    throw new Error("abstract");
  }
}

// ---- Concrete visitor: compute area ----
class AreaVisitor extends Visitor {
  visitCircle(c) {
    return Math.PI * c.radius * c.radius;
  }
  visitRectangle(r) {
    return r.width * r.height;
  }
  visitTriangle(t) {
    return 0.5 * t.base * t.height;
  }
}

// ---- Concrete visitor: serialize to JSON-ish ----
class JSONExportVisitor extends Visitor {
  visitCircle(c) {
    return { type: "circle", radius: c.radius };
  }
  visitRectangle(r) {
    return { type: "rectangle", width: r.width, height: r.height };
  }
  visitTriangle(t) {
    return { type: "triangle", base: t.base, height: t.height };
  }
}

// ---- Concrete visitor: render to SVG-ish string ----
class SVGRenderVisitor extends Visitor {
  visitCircle(c) {
    return `<circle r="${c.radius}" />`;
  }
  visitRectangle(r) {
    return `<rect width="${r.width}" height="${r.height}" />`;
  }
  visitTriangle(t) {
    return `<polygon base="${t.base}" height="${t.height}" />`;
  }
}

// A small object structure to walk.
function visitAll(shapes, visitor) {
  return shapes.map((s) => s.accept(visitor));
}

// ---------------- Test cases ----------------
const shapes = [new Circle(3), new Rectangle(4, 5), new Triangle(6, 2)];

console.log(visitAll(shapes, new AreaVisitor()).map((a) => a.toFixed(2)));
// Expected: [ '28.27', '20.00', '6.00' ]

console.log(visitAll(shapes, new JSONExportVisitor()));
// Expected: [
//   { type: 'circle', radius: 3 },
//   { type: 'rectangle', width: 4, height: 5 },
//   { type: 'triangle', base: 6, height: 2 }
// ]

console.log(visitAll(shapes, new SVGRenderVisitor()));
// Expected: [ '<circle r="3" />', '<rect width="4" height="5" />', '<polygon base="6" height="2" />' ]

// Adding a new operation (e.g. max-dimension) requires NO change to Shape classes.
class MaxDimensionVisitor extends Visitor {
  visitCircle(c) {
    return c.radius * 2;
  }
  visitRectangle(r) {
    return Math.max(r.width, r.height);
  }
  visitTriangle(t) {
    return Math.max(t.base, t.height);
  }
}
console.log(visitAll(shapes, new MaxDimensionVisitor()));
// Expected: [ 6, 5, 6 ]
