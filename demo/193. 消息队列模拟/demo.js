// 193. 消息队列模拟

class MessageQueue {
  constructor() {
    this.queue = [];
  }
  push(msg) {
    this.queue.push(msg);
  }
  consume() {
    while (this.queue.length) console.log(this.queue.shift());
  }
}
const mq = new MessageQueue();
mq.push("hello");
mq.push("world");
mq.consume();
