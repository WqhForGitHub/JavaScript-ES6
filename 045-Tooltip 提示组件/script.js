const txts = { top: "上面出现提示", bottom: "下面出现提示", left: "左边出现提示", right: "右边出现提示" };
document.querySelectorAll(".tip").forEach(t => t.dataset.text = txts[t.dataset.pos]);