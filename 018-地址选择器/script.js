const data = {
  "广东省": { "广州市": ["天河区", "越秀区", "海珠区"], "深圳市": ["南山区", "福田区", "罗湖区"], "珠海市": ["香洲区", "斗门区"] },
  "江苏省": { "南京市": ["玄武区", "鼓楼区", "秦淮区"], "苏州市": ["姑苏区", "吴中区", "工业园区"], "无锡市": ["梁溪区", "滨湖区"] },
  "浙江省": { "杭州市": ["西湖区", "上城区", "余杭区"], "宁波市": ["海曙区", "江北区"], "温州市": ["鹿城区", "瓯海区"] },
};
const p = document.getElementById("p"), c = document.getElementById("c"), a = document.getElementById("a"), res = document.getElementById("res");
function clear(sel, ph) { sel.innerHTML = `<option value="">${ph}</option>`; }
clear(p, "省"); Object.keys(data).forEach(k => p.add(new Option(k, k)));
function updCity() { clear(c, "市"); clear(a, "区"); if (p.value) Object.keys(data[p.value]).forEach(k => c.add(new Option(k, k))); updArea(); }
function updArea() { clear(a, "区"); if (p.value && c.value) data[p.value][c.value].forEach(k => a.add(new Option(k, k))); out(); }
function out() { res.textContent = [p.value, c.value, a.value].filter(Boolean).join(" / ") || "请选择"; }
p.onclick = updCity; c.onchange = updArea; a.onchange = out;
p.onchange = updCity; updCity();