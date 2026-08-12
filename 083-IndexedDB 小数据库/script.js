let db;
const req = indexedDB.open("demoDB", 1);
req.onupgradeneeded = e => { db = e.target.result; if (!db.objectStoreNames.contains("users")) db.createObjectStore("users", { keyPath: "id", autoIncrement: true }); };
req.onsuccess = e => { db = e.target.result; list(); };
function list() {
  const tx = db.transaction("users", "readonly").objectStore("users").getAll();
  tx.onsuccess = () => {
    const ul = document.getElementById("list"); ul.innerHTML = "";
    tx.result.forEach(u => {
      const li = document.createElement("li");
      li.innerHTML = `<span>#${u.id} ${u.name} · ${u.age} 岁</span><button>删除</button>`;
      li.querySelector("button").onclick = () => {
        db.transaction("users", "readwrite").objectStore("users").delete(u.id).onsuccess = list;
      };
      ul.appendChild(li);
    });
  };
}
document.getElementById("f").onsubmit = e => {
  e.preventDefault();
  const name = document.getElementById("name").value.trim();
  const age = parseInt(document.getElementById("age").value);
  if (!name) return;
  db.transaction("users", "readwrite").objectStore("users").add({ name, age }).onsuccess = () => {
    document.getElementById("name").value = ""; document.getElementById("age").value = ""; list();
  };
};