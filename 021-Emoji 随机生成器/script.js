const data = {
  "表情": "😀😁😂🤣😊😍😎🤩🥳😘🤔🤨😴😭😡🥶😱🤯🥺",
  "动物": "🐶🐱🐭🐹🐰🦊🐻🐼🐨🐯🦁🐮🐷🐸🐵🐔🦄🦋🐝🐢🐙🦈",
  "食物": "🍎🍐🍊🍌🍉🍇🍓🍅🥑🥕🌽🍔🍕🌭🍟🍩🍪🎂🍰☕🍷🍺",
  "物品": "⚽🏀🏈⚾🎾🎳⛳🎯🎮🎲🧩🎨🎸🎺🎻🚗✈️🚀🚁⌚📱💻",
  "自然": "🌸🌼🌻🌹🌷🍀🍁🌾🌿☘️🌱🌲🌴🌵🌍🌙⭐⚡🔥🌈❄️☀️"
};
const cat = document.getElementById("cat");
Object.keys(data).forEach(k => cat.add(new Option(k)));
document.getElementById("gen").onclick = () => {
  const list = data[cat.value].match(/[\uD800-\uDBFF][\uDC00-\uDFFF]|./g);
  const n = Math.min(parseInt(document.getElementById("n").value) || 6, 30);
  const grid = document.getElementById("grid");
  grid.innerHTML = "";
  let res = "";
  for (let i = 0; i < n; i++) {
    const e = list[Math.floor(Math.random() * list.length)];
    res += e;
    const d = document.createElement("div"); d.textContent = e; grid.appendChild(d);
  }
  document.getElementById("emoji").textContent = list[Math.floor(Math.random() * list.length)];
  grid.dataset.text = res;
};
document.getElementById("copy").onclick = () => navigator.clipboard && navigator.clipboard.writeText(document.getElementById("grid").dataset.text || "");
document.getElementById("gen").click();