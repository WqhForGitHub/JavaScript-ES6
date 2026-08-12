const rose = document.getElementById("rose"), deg = document.getElementById("deg"), slider = document.getElementById("slider");
function setDir(d) { rose.style.transform = `rotate(${-d}deg)`; deg.textContent = Math.round(d) + "°"; }
slider.oninput = () => setDir(+slider.value);
function handle(event) {
  let d = event.alpha || (event.webkitCompassHeading);
  if (d == null) return;
  if (event.webkitCompassHeading) d = event.webkitCompassHeading;
  setDir(d); slider.value = Math.round(d);
}
if (typeof DeviceOrientationEvent !== "undefined") {
  window.addEventListener("deviceorientation", handle);
  if (DeviceOrientationEvent.requestPermission) {
    document.getElementById("note").textContent = "点击下方按钮请求传感器权限";
    const b = document.createElement("button"); b.textContent = "启用指南针"; b.style.cssText = "padding:10px 20px;border:none;border-radius:8px;background:#e17055;color:#fff;cursor:pointer;margin-bottom:10px;";
    b.onclick = () => DeviceOrientationEvent.requestPermission().then(s => s === "granted" && alert("已启用")).catch(alert);
    document.querySelector(".card").insertBefore(b, slider);
  }
}
setDir(0);