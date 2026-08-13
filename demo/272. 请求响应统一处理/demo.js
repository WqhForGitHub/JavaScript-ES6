// 272. 请求响应统一处理

async function requestWithHandler(task) {
  try {
    const res = await task();
    return { success: true, data: res.data ?? res };
  } catch (error) {
    return { success: false, message: error.message };
  }
}
requestWithHandler(() => Promise.resolve({ data: [1, 2, 3] })).then(console.log);
