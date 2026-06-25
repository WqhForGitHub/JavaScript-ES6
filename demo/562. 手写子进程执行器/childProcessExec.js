/**
 * 手写子进程执行器
 *
 * 功能：封装 child_process.exec，提供 Promise 接口、超时控制与流式输出
 * 实现思路：
 *   1. 调用 child_process.exec 启动子进程执行 shell 命令
 *   2. 收集 stdout/stderr，监听 close 事件得到退出码
 *   3. 超时则强制 kill 子进程(SIGKILL)并 reject
 *   4. 返回 { stdout, stderr, code }；封装 runStream 支持流式处理
 */
const { exec, execFile } = require("child_process");

/**
 * 执行命令并返回 Promise
 * @param {string} command  shell 命令
 * @param {object} options  { timeout(ms), cwd, env, maxBuffer, shell }
 * @returns {Promise<{stdout:string, stderr:string, code:number}>}
 */
function run(command, options = {}) {
  return new Promise((resolve, reject) => {
    const {
      timeout = 0,
      cwd,
      env,
      maxBuffer = 10 * 1024 * 1024,
      shell,
    } = options;

    const child = exec(
      command,
      { cwd, env, maxBuffer, shell, timeout: timeout || undefined },
      (err, stdout, stderr) => {
        if (err) {
          // 附加输出便于排查
          err.stdout = stdout ? stdout.toString() : "";
          err.stderr = stderr ? stderr.toString() : "";
          err.code = err.code != null ? err.code : err.killed ? "SIGKILL" : 1;
          return reject(err);
        }
        resolve({
          stdout: stdout ? stdout.toString() : "",
          stderr: stderr ? stderr.toString() : "",
          code: 0,
        });
      },
    );

    // 自定义超时强制 kill（exec 内置 timeout 用 SIGTERM，这里用 SIGKILL 兜底）
    let timer = null;
    if (timeout > 0) {
      timer = setTimeout(() => {
        try {
          child.kill("SIGKILL");
        } catch (e) {}
      }, timeout);
      child.on("close", () => {
        if (timer) clearTimeout(timer);
      });
    }
  });
}

/**
 * 执行可执行文件（不经过 shell，更安全）
 * @param {string} file  可执行文件路径
 * @param {string[]} args 参数数组
 * @param {object} options 同 run
 */
function runFile(file, args, options = {}) {
  return new Promise((resolve, reject) => {
    const { timeout = 0, cwd, env, maxBuffer = 10 * 1024 * 1024 } = options;
    const child = execFile(
      file,
      args,
      { cwd, env, maxBuffer, timeout: timeout || undefined },
      (err, stdout, stderr) => {
        if (err) {
          err.stdout = stdout ? stdout.toString() : "";
          err.stderr = stderr ? stderr.toString() : "";
          return reject(err);
        }
        resolve({
          stdout: stdout ? stdout.toString() : "",
          stderr: stderr ? stderr.toString() : "",
          code: 0,
        });
      },
    );
    let timer = null;
    if (timeout > 0) {
      timer = setTimeout(() => {
        try {
          child.kill("SIGKILL");
        } catch (e) {}
      }, timeout);
      child.on("close", () => {
        if (timer) clearTimeout(timer);
      });
    }
  });
}

/** 流式执行：返回 child_process 实例，可监听 stdout/stderr */
function runStream(command, options = {}) {
  return exec(command, options);
}

// ===== 测试 =====
console.log("=== 子进程执行器演示 ===");

// 1) 正常执行
run("node -p 6*7")
  .then((r) => {
    console.log("正常执行 stdout:", r.stdout.trim()); // 42
    console.log("退出码:", r.code); // 0
  })
  .catch((e) => console.log("异常:", e.message));

// 2) 执行错误（非零退出码）
run('node -e "process.exit(3)"')
  .then((r) => console.log("不该成功"))
  .catch((e) => {
    console.log("非零退出码:", e.code); // 3
  });

// 3) runFile 执行 node 文件
runFile(process.execPath, ["-p", "10+5"]).then((r) =>
  console.log("runFile stdout:", r.stdout.trim()),
); // 15

// 4) 超时强制 kill
const slow = 'node -e "setTimeout(()=>{},10000)"';
run(slow, { timeout: 300 })
  .then(() => console.log("不该成功(超时)"))
  .catch((e) => {
    console.log("超时捕获:", e.killed ? "killed" : e.message); // killed
  });

// 5) 流式输出
const child = runStream(
  "node -e \"console.log('stream out'); console.error('stream err')\"",
);
let out = "";
child.stdout.on("data", (d) => (out += d));
child.on("close", (code) => {
  console.log("流式输出:", out.trim(), "| code:", code); // stream out | 0
});
