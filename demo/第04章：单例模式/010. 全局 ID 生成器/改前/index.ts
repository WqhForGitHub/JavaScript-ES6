class IdGenerator {
  private counter = 0;
  nextId(): number { return ++this.counter; }
}

const g1 = new IdGenerator();
const g2 = new IdGenerator();
console.log(g1.nextId(), g2.nextId()); // 1, 1 —— ID 重复！

export { }