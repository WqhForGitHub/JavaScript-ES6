/**
 * 自动生成 README.md 目录
 *
 * 扫描本目录（demo/）下所有 "NNN-名称" 格式的文件夹，
 * 读取每个 demo 的 README 首个 "# NNN - 标题" 作为题目名，
 * 重新生成 README.md 中 <!-- DEMO:START --> 与 <!-- DEMO:END --> 之间的内容。
 *
 * 用法：npm run readme
 */
import fs from 'node:fs';
import path from 'node:path';

const DEMO_ROOT = path.resolve(import.meta.dirname, '..');
const README_PATH = path.join(DEMO_ROOT, 'README.md');
const START = '<!-- DEMO:START -->';
const END = '<!-- DEMO:END -->';

const escapeRegExp = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** 收集所有编号 demo 文件夹 */
function collectDemos() {
  return fs
    .readdirSync(DEMO_ROOT, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && /^\d{3}-/.test(entry.name))
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((entry) => {
      const dir = entry.name;
      const num = dir.slice(0, 3);
      const readmeFile = path.join(DEMO_ROOT, dir, 'README.md');

      // 默认标题 = 文件夹名去掉 "NNN-" 前缀
      let title = dir.replace(/^\d{3}-/, '');

      // 优先读取 demo README 的 "# NNN - 标题"
      if (fs.existsSync(readmeFile)) {
        const match = fs.readFileSync(readmeFile, 'utf8').match(/^#\s+\d+\s*-\s*(.+)$/m);
        if (match) title = match[1].trim();
      }

      return { num, title, link: `./${dir}/` };
    });
}

/** 生成目录区块（Markdown 表格） */
function buildSection(demos) {
  const rows = demos.map((d) => `| ${d.num} | ${d.title} | [查看](${d.link}) |`).join('\n');

  return [
    '<!-- 本区块由 scripts/generate-readme.mjs 自动生成（npm run readme），请勿手动修改 -->',
    '',
    `共 ${demos.length} 道 demo：`,
    '',
    '| # | 题目 | 链接 |',
    '| --- | --- | --- |',
    rows,
  ].join('\n');
}

function main() {
  const demos = collectDemos();
  if (demos.length === 0) {
    console.error(`错误：${DEMO_ROOT} 下未找到 "NNN-名称" 格式的文件夹`);
    process.exit(1);
  }

  let readme;
  try {
    readme = fs.readFileSync(README_PATH, 'utf8');
  } catch {
    // README 不存在时生成骨架
    readme = `# JavaScript 手写代码题\n\n## 目录\n\n${START}\n${END}\n`;
  }

  const pattern = new RegExp(`${escapeRegExp(START)}[\\s\\S]*?${escapeRegExp(END)}`);
  if (!pattern.test(readme)) {
    console.error(`错误：README.md 中缺少 ${START} / ${END} 标记`);
    process.exit(1);
  }

  fs.writeFileSync(
    README_PATH,
    readme.replace(pattern, `${START}\n${buildSection(demos)}\n${END}`),
    'utf8'
  );

  console.log(`README.md 已更新，共 ${demos.length} 道 demo：`);
  demos.forEach((d) => console.log(`  ${d.num}  ${d.title}  ->  ${d.link}`));
}

main();
