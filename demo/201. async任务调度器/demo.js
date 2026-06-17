// 201. async任务调度器

class Scheduler {
  constructor() {
    this.tasks = Promise.resolve();
  }
  add(task) {
    this.tasks = this.tasks.then(task);
    return this.tasks;
  }
}
const scheduler = new Scheduler();
scheduler.add(() => Promise.resolve(console.log("A")));
scheduler.add(() => Promise.resolve(console.log("B")));
