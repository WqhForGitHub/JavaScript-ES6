let contacts = JSON.parse(localStorage.getItem("contacts") || "[]");
let editId = null;
function save() { localStorage.setItem("contacts", JSON.stringify(contacts)); }
function render() {
  const kw = document.getElementById("search").value.toLowerCase();
  const list = document.getElementById("list"); list.innerHTML = "";
  contacts.filter(c => (c.name + c.phone + c.email).toLowerCase().includes(kw)).forEach(c => {
    const li = document.createElement("li");
    li.innerHTML = `<div class="avatar"></div><div class="info"><b></b><small></small></div><div class="actions"><button class="edit">✎</button><button>✕</button></div>`;
    li.querySelector(".avatar").textContent = c.name.charAt(0).toUpperCase();
    li.querySelector("b").textContent = c.name;
    li.querySelector("small").textContent = `${c.phone} · ${c.email}`;
    li.querySelector(".edit").onclick = () => {
      editId = c.id;
      document.getElementById("name").value = c.name;
      document.getElementById("phone").value = c.phone;
      document.getElementById("email").value = c.email;
    };
    li.querySelector("button:last-child").onclick = () => { contacts = contacts.filter(x => x.id !== c.id); save(); render(); };
    list.appendChild(li);
  });
}
document.getElementById("add").onclick = () => {
  const name = document.getElementById("name").value.trim();
  if (!name) return;
  const data = { name, phone: document.getElementById("phone").value.trim(), email: document.getElementById("email").value.trim() };
  if (editId) { const c = contacts.find(x => x.id === editId); Object.assign(c, data); editId = null; }
  else { contacts.push({ id: Date.now(), ...data }); }
  ["name", "phone", "email"].forEach(i => document.getElementById(i).value = "");
  save(); render();
};
document.getElementById("search").oninput = render;
render();