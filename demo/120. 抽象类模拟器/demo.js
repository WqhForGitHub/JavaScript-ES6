// 120. 抽象类模拟器

class AbstractTask {
  constructor() {
    if (new.target === AbstractTask) throw new Error("abstract");
  }
  run() {
    throw new Error("override");
  }
}
class Task extends AbstractTask {
  run() {
    return "running";
  }
}
console.log(new Task().run());
