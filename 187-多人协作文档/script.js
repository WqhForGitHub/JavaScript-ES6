const ch = new BroadcastChannel("collab-doc");
const doc = document.getElementById("doc"), countEl = document.getElementById("count");
let clientId = Math.random().toString(36).slice(2);
ch.postMessage({ t: "join", id: clientId });
let peers = { [clientId]: Date.now() };
function broadcast() { ch.postMessage({ t: "update", id: clientId, text: doc.value, peers }); }
doc.oninput = broadcast;
ch.onmessage = e => {
  const m = e.data;
  if (m.t === "join") { peers[m.id] = Date.now(); ch.postMessage({ t: "hello", id: clientId, text: doc.value, peers }); }
  else if (m.t === "hello" || m.t === "update") {
    peers[m.id] = Date.now(); if (m.peers) Object.assign(peers, m.peers);
    if (m.t === "update" && m.id !== clientId) doc.value = m.text; // 简化：远端更新直接覆盖
    else if (m.t === "hello" && m.text && !doc.value) doc.value = m.text;
  }
};
addEventListener("beforeunload", () => ch.postMessage({ t: "leave", id: clientId }));
setInterval(() => { Object.keys(peers).forEach(k => { if (k !== clientId && Date.now() - peers[k] > 10000) delete peers[k]; }); countEl.textContent = Object.keys(peers).length; }, 1000);