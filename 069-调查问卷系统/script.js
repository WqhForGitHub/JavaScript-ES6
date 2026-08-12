document.getElementById("f").onsubmit = e => {
  e.preventDefault();
  const f = e.target;
  const q1 = f.q1.value || "未选择";
  const q2 = [...f.querySelectorAll("input[name=q2]:checked")].map(c => c.value);
  const q3 = f.q3.value || "未选择";
  const q4 = f.q4.value.trim() || "（无）";
  document.getElementById("res").style.display = "block";
  document.getElementById("res").innerHTML = `感谢参与！<br><b>性别：</b>${q1}<br><b>偏好语言：</b>${q2.join(", ") || "无"}<br><b>满意度：</b>${q3}<br><b>建议：</b>${q4}`;
};