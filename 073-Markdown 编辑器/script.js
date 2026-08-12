function parse(md) {
  let h = md.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  h = h.replace(/^### (.+)$/gm, "<h3>$1</h3>");
  h = h.replace(/^## (.+)$/gm, "<h2>$1</h2>");
  h = h.replace(/^# (.+)$/gm, "<h1>$1</h1>");
  h = h.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  h = h.replace(/\*(.+?)\*/g, "<em>$1</em>");
  h = h.replace(/`(.+?)`/g, "<code>$1</code>");
  h = h.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank">$1</a>');
  h = h.replace(/^&gt; (.+)$/gm, "<blockquote>$1</blockquote>");
  h = h.replace(/^- (.+)$/gm, "<li>$1</li>");
  h = h.replace(/(<li>.*?<\/li>)(?:\n|$)/gs, "<ul>$1</ul>");
  h = h.replace(/\n\n/g, "<br><br>");
  return h;
}
const md = document.getElementById("md"), prev = document.getElementById("prev");
function render() { prev.innerHTML = parse(md.value); }
md.oninput = render; render();