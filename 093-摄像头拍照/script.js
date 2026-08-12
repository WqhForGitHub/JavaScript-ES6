const v = document.getElementById("v"), c = document.getElementById("c"), shot = document.getElementById("shot"), gallery = document.getElementById("g");
let stream;
document.getElementById("start").onclick = async () => {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: true });
    v.srcObject = stream; shot.disabled = false;
    document.getElementById("start").textContent = "已开启";
  } catch (e) { alert("无法访问摄像头：" + e.message); }
};
shot.onclick = () => {
  c.getContext("2d").drawImage(v, 0, 0, c.width, c.height);
  const url = c.toDataURL("image/png");
  const img = document.createElement("img"); img.src = url;
  img.onclick = () => { const a = document.createElement("a"); a.href = url; a.download = "photo.png"; a.click(); };
  gallery.prepend(img);
};