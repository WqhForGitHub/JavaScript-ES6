/**
 * 建造者模式 (Builder Pattern)
 *
 * Approach:
 * - Separate the construction of a complex object from its representation, so the
 *   same build process can create different representations.
 * - A Director orchestrates the step-by-step build sequence; a Builder exposes
 *   granular methods (reset/buildPartA/buildPartB/getResult). Concrete builders
 *   decide the actual representation.
 * - We also show a fluent (chainable) builder for ergonomic client usage.
 * - Example: build a "Meal" (burger + drink + dessert + toy) with two styles —
 *   "Kids" meal and "Veggie" meal — via the same Director.
 */

class Meal {
  constructor() {
    this.items = [];
    this.tag = 'Meal';
  }
  add(item) {
    this.items.push(item);
  }
  describe() {
    return `${this.tag}: ${this.items.join(', ')}`;
  }
  get price() {
    return this.items.reduce((sum, it) => {
      const m = /(\d+)/.exec(it);
      return sum + (m ? Number(m[1]) : 0);
    }, 0);
  }
}

class MealBuilder {
  constructor() {
    this.meal = new Meal();
  }
  reset() {
    this.meal = new Meal();
    return this;
  }
  buildMain() {
    throw new Error('abstract');
  }
  buildDrink() {
    throw new Error('abstract');
  }
  buildDessert() {
    throw new Error('abstract');
  }
  getResult() {
    const m = this.meal;
    this.meal = new Meal();
    return m;
  }
}

class KidsMealBuilder extends MealBuilder {
  constructor() {
    super();
    this.meal.tag = 'KidsMeal';
  }
  buildMain() {
    this.meal.add('CheeseBurger(5)');
    return this;
  }
  buildDrink() {
    this.meal.add('AppleJuice(2)');
    return this;
  }
  buildDessert() {
    this.meal.add('IceCream(3)');
    return this;
  }
  buildToy() {
    this.meal.add('Toy(0)');
    return this;
  }
}

class VeggieMealBuilder extends MealBuilder {
  constructor() {
    super();
    this.meal.tag = 'VeggieMeal';
  }
  buildMain() {
    this.meal.add('VeggieBurger(6)');
    return this;
  }
  buildDrink() {
    this.meal.add('SparklingWater(2)');
    return this;
  }
  buildDessert() {
    this.meal.add('FruitCup(3)');
    return this;
  }
}

class Director {
  construct(builder) {
    builder.reset();
    builder.buildMain().buildDrink().buildDessert();
    if (typeof builder.buildToy === 'function') builder.buildToy();
    return builder.getResult();
  }
}

// Fluent generic builder for ad-hoc objects.
class FluentBuilder {
  constructor() {
    this.obj = {};
  }
  set(key, value) {
    this.obj[key] = value;
    return this;
  }
  build() {
    const o = this.obj;
    this.obj = {};
    return o;
  }
}

// ---------------- Test cases ----------------
const director = new Director();

const kids = director.construct(new KidsMealBuilder());
console.log(kids.describe());
// Expected: KidsMeal: CheeseBurger(5), AppleJuice(2), IceCream(3), Toy(0)
console.log(kids.price);
// Expected: 10

const veggie = director.construct(new VeggieMealBuilder());
console.log(veggie.describe());
// Expected: VeggieMeal: VeggieBurger(6), SparklingWater(2), FruitCup(3)
console.log(veggie.price);
// Expected: 11

// Fluent builder usage
const user = new FluentBuilder()
  .set('name', 'Alice')
  .set('age', 30)
  .set('role', 'admin')
  .build();
console.log(user);
// Expected: { name: 'Alice', age: 30, role: 'admin' }
