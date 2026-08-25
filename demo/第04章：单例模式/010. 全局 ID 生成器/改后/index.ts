class IdGenerator {
  private static instance: IdGenerator;
  private counter = 0;

  private constructor() { }
  static getInstance(): IdGenerator {
    if (!IdGenerator.instance) IdGenerator.instance = new IdGenerator();
    return IdGenerator.instance;
  }

  nextId(): number { return ++this.counter; }
}

console.log(IdGenerator.getInstance().nextId()); // 1
console.log(IdGenerator.getInstance().nextId()); // 2 ✅