// 210. 异步状态机

class AsyncStateMachine {
  constructor() {
    this.state = 'idle';
  }
  async send(event) {
    if (this.state === 'idle' && event === 'start') this.state = 'loading';
    await Promise.resolve();
    if (this.state === 'loading' && event === 'success') this.state = 'success';
    return this.state;
  }
}
const machine = new AsyncStateMachine();
machine
  .send('start')
  .then(() => machine.send('success'))
  .then(console.log);
