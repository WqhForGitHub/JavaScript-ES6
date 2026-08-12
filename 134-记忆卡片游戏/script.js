const emojis = ["🍎","🍌","🍇","🍓","🍕","🍔","⚽","🎨"];
let cards, flipped, matched, step, lock;
function init() {
  const pairs = [...emojis, ...emojis].sort(() => Math.random() - .5);
  flipped = []; matched = 0; step = 0; lock = false;
  document.getElementById("step").textContent = 0;
  const board = document.getElementById("board"); board.innerHTML = "";
  cards = pairs.map((e, i) => {
    const c = document.createElement("div"); c.className = "card-flip";
    c.innerHTML = `<div class="inner"><div class="front">?</div><div class="back">${e}</div></div>`;
    c.onclick = () => flip(i); board.appendChild(c); return { el: c, emoji: e };
  });
}
function flip(i) {
  if (lock || cards[i].el.classList.contains("flip")) return;
  cards[i].el.classList.add("flip"); flipped.push(i);
  if (flipped.length === 2) {
    step++; document.getElementById("step").textContent = step; lock = true;
    const [a, b] = flipped;
    if (cards[a].emoji === cards[b].emoji) { matched++; flipped = []; lock = false; if (matched === emojis.length) setTimeout(() => alert("胜利！步数 " + step), 400); }
    else setTimeout(() => { cards[a].el.classList.remove("flip"); cards[b].el.classList.remove("flip"); flipped = []; lock = false; }, 700);
  }
}
document.getElementById("reset").onclick = init; init();