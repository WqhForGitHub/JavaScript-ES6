const v = document.getElementById("v"), res = document.getElementById("res");
const codeReader = new ZXing.BrowserMultiFormatReader();
document.getElementById("start").onclick = async () => {
  if (typeof ZXing === "undefined") return alert("ZXing 库未加载，请联网");
  codeReader.decodeFromVideoDevice(undefined, v, (r, err) => {
    if (r) { res.textContent = "✓ " + r.getText() + " (" + r.getBarcodeFormat() + ")"; res.style.color = "#2ecc71"; }
  });
  document.getElementById("start").textContent = "扫描中...";
};