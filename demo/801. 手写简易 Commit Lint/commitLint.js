/**
 * 手写简易 Commit Lint
 *
 * 功能：校验 git commit message 是否符合 Conventional Commits 规范
 * 规范：type(scope): subject
 *   type: feat|fix|docs|style|refactor|perf|test|chore|build|ci
 * 实现思路：正则匹配 + 规则校验
 */

const TYPES = ['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'chore', 'build', 'ci', 'revert'];
const RULES = {
  type: { enum: TYPES, required: true },
  subject: { minLength: 1, maxLength: 72, required: true },
  body: { maxLineLength: 100, optional: true },
};

function lintCommitMessage(message) {
  const errors = [];
  const warnings = [];

  // 解析 header
  const headerRe = /^(\w+)(?:\(([^)]+)\))?!?: (.+)$/;
  const lines = message.split('\n');
  const header = lines[0];
  const match = header.match(headerRe);

  if (!match) {
    errors.push('Header does not follow format: type(scope): subject');
    return { valid: false, errors, warnings };
  }

  const [, type, scope, subject] = match;

  // 校验 type
  if (!TYPES.includes(type)) {
    errors.push('Invalid type: "' + type + '". Allowed: ' + TYPES.join(', '));
  }

  // 校验 subject
  if (subject.length > 72) {
    warnings.push('Subject too long (' + subject.length + ' > 72 chars)');
  }
  if (subject.length === 0) {
    errors.push('Subject is empty');
  }
  if (subject.endsWith('.')) {
    warnings.push('Subject should not end with "."');
  }
  if (subject[0] === subject[0].toUpperCase() && subject[0] !== subject[0].toLowerCase()) {
    warnings.push('Subject should not start with uppercase');
  }

  // 校验 body
  if (lines.length > 1) {
    const bodyLines = lines.slice(2); // skip header + blank line
    bodyLines.forEach((line, i) => {
      if (line.length > 100) warnings.push('Body line ' + (i + 3) + ' too long (' + line.length + ' > 100)');
    });
  }

  return { valid: errors.length === 0, errors, warnings, parsed: { type, scope, subject } };
}

// ===== 测试 =====
const testCases = [
  'feat(auth): add JWT support',
  'fix: resolve null pointer',
  'docs(api): update endpoint docs',
  'invalid message without type',
  'feat: Subject With Uppercase.',
  'unknown: this has invalid type',
  'feat: ' + 'x'.repeat(80) + ' too long subject',
];

testCases.forEach(msg => {
  const result = lintCommitMessage(msg);
  console.log('Message: "' + msg.slice(0, 50) + (msg.length > 50 ? '...' : '') + '"');
  console.log('  Valid:', result.valid);
  if (result.parsed) console.log('  Parsed:', JSON.stringify(result.parsed));
  if (result.errors.length) result.errors.forEach(e => console.log('  ERROR:', e));
  if (result.warnings.length) result.warnings.forEach(w => console.log('  WARN:', w));
  console.log();
});
