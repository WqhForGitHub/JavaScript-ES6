// 260. FormData上传模拟

function createUploadFormData(fields) {
  const fd = new FormData();
  Object.entries(fields).forEach(([k, v]) => fd.append(k, v));
  return fd;
}
if (typeof FormData !== "undefined")
  console.log(
    Array.from(
      createUploadFormData({ name: "demo", file: "content" }).entries(),
    ),
  );
