const drop = document.getElementById("drop");
["dragenter", "dragover"].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add("over"); }));
["dragleave", "drop"].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.remove("over"); }));
drop.addEventListener("drop", e => {
  const files = [...e.dataTransfer.files];
  document.getElementById("list").innerHTML = files.map(f => `<div class="item"><span>${f.name}</span><span>${(f.size / 1024).toFixed(1)} KB</span></div>`).join("");
});