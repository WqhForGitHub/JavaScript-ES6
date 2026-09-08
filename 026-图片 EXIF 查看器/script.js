document.getElementById("f").onchange = e => {
  const f = e.target.files[0]; if (!f) return;
  const url = URL.createObjectURL(f);
  const img = new Image(); img.src = url;
  document.getElementById("prev").innerHTML = ""; document.getElementById("prev").appendChild(img);
  EXIF.getData(img, () => {
    const tags = ["Make", "Model", "DateTime", "ExposureTime", "FNumber", "ISOSpeedRatings", "FocalLength", "GPSLatitude", "GPSLongitude", "Orientation", "PixelXDimension", "PixelYDimension"];
    const info = document.getElementById("info");
    info.innerHTML = "<b>EXIF 信息</b><br>" + tags.filter(t => EXIF.getTag(img, t)).map(t => `${t}: <b>${EXIF.getTag(img, t)}</b>`).join("<br>") || "未发现 EXIF 信息";
  });
};