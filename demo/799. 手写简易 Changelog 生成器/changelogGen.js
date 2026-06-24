/**
 * 手写简易 Changelog 生成器
 *
 * 功能：从 git log 生成 CHANGELOG.md
 * 实现思路：
 *   1. 解析 git log 获取提交记录
 *   2. 按 Conventional Commits 规范分类
 *   3. 按版本分组输出 Markdown
 */

const { execSync } = require('child_process');

class ChangelogGenerator {
  constructor() { this.commits = []; }

  // 解析提交类型
  parseCommitType(message) {
    const re = /^(feat|fix|docs|style|refactor|perf|test|chore|build|ci)(?:\(([^)]+)\))?: (.+)/;
    const m = message.match(re);
    if (m) return { type: m[1], scope: m[2] || '', subject: m[3] };
    return { type: 'other', scope: '', subject: message };
  }

  // 添加提交记录
  addCommit(hash, message, date) {
    this.commits.push({ hash, ...this.parseCommitType(message), raw: message, date });
  }

  // 按版本分组
  groupByVersion(version, commits) {
    const groups = { feat: [], fix: [], perf: [], refactor: [], docs: [], test: [], chore: [], other: [] };
    for (const c of commits) {
      if (groups[c.type]) groups[c.type].push(c); else groups.other.push(c);
    }
    return { version, commits, groups };
  }

  // 生成 Markdown
  generate(versions) {
    const lines = ['# Changelog', ''];
    const typeLabels = { feat: 'Features', fix: 'Bug Fixes', perf: 'Performance', refactor: 'Refactor', docs: 'Documentation', test: 'Tests', chore: 'Chores', other: 'Other Changes' };
    for (const v of versions) {
      lines.push('## ' + v.version + ' (' + v.date + ')', '');
      for (const [type, label] of Object.entries(typeLabels)) {
        const items = v.groups[type];
        if (items && items.length) {
          lines.push('### ' + label, '');
          for (const item of items) {
            const scope = item.scope ? '**' + item.scope + '**: ' : '';
            lines.push('- ' + scope + item.subject + ' (' + item.hash + ')');
          }
          lines.push('');
        }
      }
    }
    return lines.join('\n');
  }
}

// ===== 测试 =====
const gen = new ChangelogGenerator();
// 模拟提交记录
gen.addCommit('abc1234', 'feat(auth): add JWT token support', '2024-01-15');
gen.addCommit('def5678', 'fix(api): handle null response', '2024-01-14');
gen.addCommit('ghi9012', 'docs: update README', '2024-01-13');
gen.addCommit('jkl3456', 'feat(ui): add dark mode toggle', '2024-01-12');
gen.addCommit('mno7890', 'fix(auth): token refresh issue', '2024-01-11');
gen.addCommit('pqr1234', 'perf: optimize bundle size', '2024-01-10');
gen.addCommit('stu5678', 'chore: bump dependencies', '2024-01-09');

const v1 = gen.groupByVersion('1.1.0', gen.commits.slice(0, 5));
v1.date = '2024-01-15';
const v2 = gen.groupByVersion('1.0.1', gen.commits.slice(5));
v2.date = '2024-01-10';

console.log(gen.generate([v1, v2]));
