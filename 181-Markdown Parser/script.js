function mdToHTML(md) {
  md = md.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const lines = md.split("\n");
  let html = "", inList = false, inQuote = false, inCode = false;
  const inline = s => s.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\*(.+?)\*/g, "<em>$1</em>").replace(/`(.+?)`/g, "<code>$1</code>").replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank">$1</a>');
  for (const line of lines) {
    if (line.startsWith("```")) { html += inCode ? "</code></pre>" : "<pre><code>"; inCode = !inCode; continue; }
    if (inCode) { html += line + "\n"; continue; }
    if (line.startsWith("# ")) { html += `<h1>${inline(line.slice(2))}</h1>`; continue; }
    if (line.startsWith("## ")) { html += `<h2>${inline(line.slice(3))}</h2>`; continue; }
    if (line.startsWith("- ")) { if (!inList) { html += "<ul>"; inList = true; } html += `<li>${inline(line.slice(2))}</li>`; continue; }
    else if (inList) { html += "</ul>"; inList = false; }
    if (line.startsWith("&gt; ")) { if (!inQuote) { html += "<blockquote>"; inQuote = true; } html += inline(line.slice(5)) + " "; continue; }
    else if (inQuote) { html += "</blockquote>"; inQuote = false; }
    html += line.trim() ? `<p>${inline(line)}</p>` : "";
  }
  if (inList) html += "</ul>"; if (inQuote) html += "</blockquote>"; if (inCode) html += "</code></pre>";
  return html;
}
const md = document.getElementById("md"), prev = document.getElementById("prev");
function render() { prev.innerHTML = mdToHTML(md.value); }
md.oninput = render; render();