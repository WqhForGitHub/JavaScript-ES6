/**
 * 工厂模式 (Factory Pattern)
 *
 * Approach:
 * - Define a factory function/method that decides which concrete class to instantiate
 *   based on input parameters, hiding the `new` keyword and construction details
 *   from the caller.
 * - We model a Vehicle factory that produces Car, Truck and Motorcycle objects.
 * - Each product shares a common interface (drive, describe) so the caller does not
 *   need to know the concrete type.
 * - Includes a registry so new vehicle kinds can be added without modifying the
 *   factory switch (Open/Closed Principle).
 */

class Vehicle {
  constructor(brand, model) {
    this.brand = brand;
    this.model = model;
    this.type = "vehicle";
  }
  describe() {
    return `${this.type}: ${this.brand} ${this.model}`;
  }
  drive() {
    return `${this.describe()} is driving...`;
  }
}

class Car extends Vehicle {
  constructor(brand, model) {
    super(brand, model);
    this.type = "Car";
    this.wheels = 4;
  }
}

class Truck extends Vehicle {
  constructor(brand, model) {
    super(brand, model);
    this.type = "Truck";
    this.wheels = 6;
    this.cargoCapacity = 1000;
  }
  loadCargo(kg) {
    return `Loaded ${kg}kg into ${this.brand} ${this.model}`;
  }
}

class Motorcycle extends Vehicle {
  constructor(brand, model) {
    super(brand, model);
    this.type = "Motorcycle";
    this.wheels = 2;
  }
}

class VehicleFactory {
  static registry = new Map();

  static register(type, Ctor) {
    VehicleFactory.registry.set(type.toLowerCase(), Ctor);
    return VehicleFactory;
  }

  static create(type, brand, model) {
    const Ctor = VehicleFactory.registry.get(String(type).toLowerCase());
    if (!Ctor) throw new Error(`Unknown vehicle type: ${type}`);
    return new Ctor(brand, model);
  }
}

// Register products
VehicleFactory.register("car", Car)
  .register("truck", Truck)
  .register("motorcycle", Motorcycle);

// ---------------- Test cases ----------------
const car = VehicleFactory.create("car", "Toyota", "Camry");
const truck = VehicleFactory.create("truck", "Volvo", "FH16");
const bike = VehicleFactory.create("motorcycle", "Honda", "CBR600");

console.log(car.drive());
// Expected: Car: Toyota Camry is driving...
console.log(truck.drive(), "|", truck.loadCargo(500));
// Expected: Truck: Volvo FH16 is driving... | Loaded 500kg into Volvo FH16
console.log(bike.describe());
// Expected: Motorcycle: Honda CBR600

// Wheels differ per concrete product
console.log([car.wheels, truck.wheels, bike.wheels]);
// Expected: [ 4, 6, 2 ]

// Unknown type throws
try {
  VehicleFactory.create("spaceship", "SpaceX", "Starship");
} catch (e) {
  console.log("Error:", e.message);
  // Expected: Error: Unknown vehicle type: spaceship
}
