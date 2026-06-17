// 296. 调试工具控制台

const debugConsole = {
  enabled: true,
  log(...args) {
    if (this.enabled) console.log("[debug]", ...args);
  },
  table(data) {
    if (this.enabled) console.table(data);
  },
};
debugConsole.log("state", { count: 1 });
