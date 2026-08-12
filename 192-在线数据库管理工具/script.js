let SQL = null, db = null, curTable = null;
initSqlJs({ locateFile: f => "https://cdn.jsdelivr.net/npm/sql.js@1.8.0/dist/" + f }).then(s => { SQL = s; db = new SQL.Database(); db.run("CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT, age INTEGER); INSERT INTO users VALUES (1,'Alice',30),(2,'Bob',25);"); renderTables(); });
function query(sql) { return db.exec(sql); }
function tables() { return query("SELECT name FROM sqlite_master WHERE type='table'").map(r => r.values.map(v => v[0])).flat(); }
function renderTables() {
  const ul = document.getElementById("tables"); ul.innerHTML = "";
  tables().forEach(t => { const li = document.createElement("li"); li.textContent = "📋 " + t; li.className = t === curTable ? "active" : ""; li.onclick = () => { curTable = t; document.getElementById("cur").textContent = t; renderGrid(); renderTables(); }; ul.appendChild(li); });
  if (curTable) renderGrid(); else document.getElementById("grid").innerHTML = "<p>选择左侧表查看数据</p>";
}
function renderGrid() {
  try {
    const res = query(`SELECT * FROM ${curTable}`);
    if (!res.length) { document.getElementById("grid").innerHTML = "<p>表为空</p>"; return; }
    const cols = res[0].columns, rows = res[0].values;
    document.getElementById("grid").innerHTML = "<table><thead><tr>" + cols.map(c => "<th>" + c + "</th>").join("") + "</tr></thead><tbody>" + rows.map(r => "<tr>" + r.map(c => "<td>" + c + "</td>").join("") + "</tr>").join("") + "</tbody></table>";
  } catch (e) { document.getElementById("grid").innerHTML = "<p style='color:#e74c3c'>" + e.message + "</p>"; }
}
document.getElementById("run").onclick = () => {
  const sql = document.getElementById("sql").value;
  try {
    db.run(sql);
    document.getElementById("log").textContent = "✓ 执行成功";
    renderTables();
  } catch (e) { document.getElementById("log").textContent = "❌ " + e; }
};
document.getElementById("addTable").onclick = () => { const n = prompt("表名", "new_table"); if (!n) return; const cols = prompt("字段（如 id INTEGER PRIMARY KEY, name TEXT）", "id INTEGER PRIMARY KEY, val TEXT"); try { db.run(`CREATE TABLE ${n} (${cols})`); curTable = n; renderTables(); } catch (e) { alert(e); } };
document.getElementById("addRow").onclick = () => { if (!curTable) return alert("先选表"); const vals = prompt("用逗号分隔每个值"); if(!vals) return; const cols = query(`SELECT * FROM ${curTable}`)[0]?.columns || []; try { db.run(`INSERT INTO ${curTable} VALUES (${vals})`); renderGrid(); } catch (e) { alert(e); } };
document.getElementById("dropTable").onclick = () => { if (curTable && confirm("删除表 " + curTable)) { db.run(`DROP TABLE ${curTable}`); curTable = null; renderTables(); } };
document.getElementById("seed").onclick = () => { db.run("CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY, name TEXT, price REAL); INSERT INTO products VALUES (1,'Pen',1.5),(2,'Book',9.9),(3,'Laptop',999.9);"); renderTables(); };