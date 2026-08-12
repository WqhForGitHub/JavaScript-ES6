const inp = document.getElementById("c"), hex = document.getElementById("hex"), rgb = document.getElementById("rgb"), hsl = document.getElementById("hsl"), prev = document.getElementById("prev");
function toRGB(h) { const n = parseInt(h.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
function toHSL(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
  let h = 0, s, l = (mx + mn) / 2;
  if (mx === mn) h = s = 0;
  else { const d = mx - mn; s = l > .5 ? d / (2 - mx - mn) : d / (mx + mn); if (mx === r) h = (g - b) / d + (g < b ? 6 : 0); else if (mx === g) h = (b - r) / d + 2; else h = (r - g) / d + 4; h *= 60; }
  return [Math.round(h), Math.round(s * 100), Math.round(l * 100)];
}
function sync(v) {
  inp.value = v; prev.style.background = v;
  const [r, g, b] = toRGB(v);
  hex.value = v.toUpperCase();
  rgb.value = `rgb(${r}, ${g}, ${b})`;
  hsl.value = `hsl(${...toHSL(r, g, b).map(x => x + "")})`.replace(",", "°,").replace(",", "%,").replace(")", "%)");
}
inp.oninput = () => sync(inp.value);
hex.onchange = () => /^#[0-9a-f]{6}$/i.test(hex.value) && sync(hex.value);
sync(inp.value);