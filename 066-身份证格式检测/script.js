const reg = ["11北京", "12天津", "13河北", "14山西", "15内蒙古", "21辽宁", "22吉林", "23黑龙江", "31上海", "32江苏", "33浙江", "34安徽", "35福建", "36江西", "37山东", "41河南", "42湖北", "43湖南", "44广东", "45广西", "46海南", "50重庆", "51四川", "52贵州", "53云南", "54西藏", "61陕西", "62甘肃", "63青海", "64宁夏", "65新疆"];
const input = document.getElementById("id"), res = document.getElementById("res"), info = document.getElementById("info");
function verify(id) {
  if (!/^\d{17}[\dX]$/.test(id)) return false;
  const w = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2], c = "10X98765432";
  let s = 0; for (let i = 0; i < 17; i++) s += +id[i] * w[i];
  return c[s % 11] === id[17].toUpperCase();
}
input.oninput = () => {
  const v = input.value.toUpperCase();
  input.value = v;
  if (!v) { res.className = "res idle"; res.textContent = "请输入"; info.innerHTML = ""; return; }
  if (v.length < 18) { res.className = "res idle"; res.textContent = `已输入 ${v.length}/18`; info.innerHTML = ""; return; }
  if (!verify(v)) { res.className = "res bad"; res.textContent = "校验失败：身份证号非法"; info.innerHTML = ""; return; }
  const prov = reg.find(p => p.startsWith(v.substr(0, 2)))?.slice(2) || "未知";
  const b = v.substr(6, 8), bd = `${b.substr(0,4)}-${b.substr(4,2)}-${b.substr(6,2)}`;
  const sex = +v[16] % 2 ? "男" : "女";
  res.className = "res ok"; res.textContent = "✓ 校验通过";
  info.innerHTML = `归属：<b>${prov}</b><br>出生日期：${bd}<br>性别：${sex}`;
};