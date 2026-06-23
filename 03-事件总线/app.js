/**
 * EventBus 交互示例
 * 演示 on / once / off / emit / 通配符
 */
const logPanel = document.getElementById('logPanel');

function log(event, msg) {
  const time = new Date().toLocaleTimeString('zh-CN', { hour12: false });
  const line = document.createElement('div');
  line.className = 'log-line';
  line.innerHTML =
    `<span class="time">[${time}]</span> <span class="event">${event}</span> → <span class="msg">${msg}</span>`;
  logPanel.appendChild(line);
  logPanel.scrollTop = logPanel.scrollHeight;
}

// 通配符监听：所有事件都会触发
const wildcardOff = bus.on('*', (event, ...args) => {
  log('*', `捕获到事件 "${event}"，数据: ${JSON.stringify(args)}`);
});

// 存储订阅的回调引用，方便 off
const subscribers = {}; // event -> fn

document.getElementById('subscribeBtn').addEventListener('click', () => {
  const event = document.getElementById('eventName').value.trim();
  if (!event || event === '*') {
    log('错误', '请输入具体事件名（不能用 *）');
    return;
  }
  const fn = (...args) => {
    log(event, `收到数据: ${JSON.stringify(args)}`);
  };
  if (!subscribers[event]) subscribers[event] = [];
  subscribers[event].push(fn);
  bus.on(event, fn);
  log('系统', `已订阅事件 "${event}"，当前订阅数: ${subscribers[event].length}`);
});

document.getElementById('onceBtn').addEventListener('click', () => {
  const event = document.getElementById('eventName').value.trim();
  if (!event) return;
  const fn = (...args) => {
    log(event, `[once] 收到数据: ${JSON.stringify(args)}（仅触发一次）`);
  };
  bus.once(event, fn);
  log('系统', `已用 once 订阅事件 "${event}"`);
});

document.getElementById('unsubscribeBtn').addEventListener('click', () => {
  const event = document.getElementById('eventName').value.trim();
  if (subscribers[event] && subscribers[event].length > 0) {
    const fn = subscribers[event].shift();
    bus.off(event, fn);
    log('系统', `已取消订阅 "${event}"，剩余订阅数: ${subscribers[event].length}`);
  } else {
    bus.off(event);
    log('系统', `已移除事件 "${event}" 的全部订阅`);
  }
});

document.getElementById('emitBtn').addEventListener('click', () => {
  const event = document.getElementById('emitName').value.trim();
  const dataStr = document.getElementById('emitData').value.trim();
  let data;
  try {
    data = JSON.parse(dataStr);
  } catch (e) {
    data = dataStr;
  }
  log('emit', `触发事件 "${event}"`);
  bus.emit(event, data);
});

document.getElementById('clearBtn').addEventListener('click', () => {
  bus.clear();
  Object.keys(subscribers).forEach(k => delete subscribers[k]);
  bus.on('*', (event, ...args) => {
    log('*', `捕获到事件 "${event}"，数据: ${JSON.stringify(args)}`);
  });
  log('系统', '已清空所有事件订阅（通配符已重新注册）');
});

log('系统', 'EventBus 已初始化，通配符 * 正在监听所有事件');
