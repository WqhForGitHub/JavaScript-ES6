// 256. HTTP状态码处理器

function handleStatus(status) {
  if (status >= 200 && status < 300) return "success";
  if (status === 401) return "unauthorized";
  if (status === 404) return "not found";
  if (status >= 500) return "server error";
  return "unknown";
}
[200, 401, 404, 500].forEach((code) => console.log(code, handleStatus(code)));
