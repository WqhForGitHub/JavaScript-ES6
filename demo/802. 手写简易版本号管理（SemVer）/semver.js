/**
 * 手写简易版本号管理（SemVer）
 *
 * 语义化版本：MAJOR.MINOR.PATCH
 *   MAJOR: 不兼容的 API 修改
 *   MINOR: 向下兼容的功能新增
 *   PATCH: 向下兼容的问题修复
 *
 * 实现：解析、比较、自增、范围匹配
 */

class SemVer {
  constructor(major, minor, patch, prerelease = [], build = []) {
    this.major = major;
    this.minor = minor;
    this.patch = patch;
    this.prerelease = prerelease;
    this.build = build;
  }

  // 从字符串解析
  static parse(str) {
    const m = str.match(/^(\d+)\.(\d+)\.(\d+)(?:-([\dA-Za-z.-]+))?(?:\+([\dA-Za-z.-]+))?$/);
    if (!m) throw new Error('Invalid version: ' + str);
    return new SemVer(
      parseInt(m[1]), parseInt(m[2]), parseInt(m[3]),
      m[4] ? m[4].split('.') : [],
      m[5] ? m[5].split('.') : []
    );
  }

  // 转字符串
  toString() {
    let s = this.major + '.' + this.minor + '.' + this.patch;
    if (this.prerelease.length) s += '-' + this.prerelease.join('.');
    if (this.build.length) s += '+' + this.build.join('.');
    return s;
  }

  // 比较
  compare(other) {
    if (this.major !== other.major) return this.major > other.major ? 1 : -1;
    if (this.minor !== other.minor) return this.minor > other.minor ? 1 : -1;
    if (this.patch !== other.patch) return this.patch > other.patch ? 1 : -1;
    // prerelease 比较
    if (this.prerelease.length === 0 && other.prerelease.length === 0) return 0;
    if (this.prerelease.length === 0) return 1; // 有 prerelease 的优先级低
    if (other.prerelease.length === 0) return -1;
    for (let i = 0; i < Math.max(this.prerelease.length, other.prerelease.length); i++) {
      if (i >= this.prerelease.length) return -1;
      if (i >= other.prerelease.length) return 1;
      const a = this.prerelease[i], b = other.prerelease[i];
      if (a === b) continue;
      const aNum = /^\d+$/.test(a), bNum = /^\d+$/.test(b);
      if (aNum && !bNum) return -1;
      if (!aNum && bNum) return 1;
      if (aNum) return parseInt(a) > parseInt(b) ? 1 : -1;
      return a > b ? 1 : -1;
    }
    return 0;
  }

  // 自增
  inc(type) {
    switch (type) {
      case 'major': return new SemVer(this.major + 1, 0, 0);
      case 'minor': return new SemVer(this.major, this.minor + 1, 0);
      case 'patch': return new SemVer(this.major, this.minor, this.patch + 1);
      case 'prerelease':
        if (this.prerelease.length) {
          const last = this.prerelease[this.prerelease.length - 1];
          if (/^\d+$/.test(last)) this.prerelease[this.prerelease.length - 1] = String(parseInt(last) + 1);
          else this.prerelease.push('1');
          return new SemVer(this.major, this.minor, this.patch, [...this.prerelease]);
        }
        return new SemVer(this.major, this.minor, this.patch + 1, ['0']);
      default: throw new Error('Unknown increment type: ' + type);
    }
  }

  // 满足范围
  satisfies(range) {
    const m = range.match(/^(>=|<=|>|<|~|\^)?(\d+)\.(\d+)\.(\d+)/);
    if (!m) return false;
    const op = m[1] || '=';
    const target = SemVer.parse(m[2] + '.' + m[3] + '.' + m[4]);
    const cmp = this.compare(target);
    switch (op) {
      case '>=': return cmp >= 0;
      case '<=': return cmp <= 0;
      case '>': return cmp > 0;
      case '<': return cmp < 0;
      case '~': return this.major === target.major && this.minor === target.minor && cmp >= 0;
      case '^': return this.major === target.major && cmp >= 0;
      default: return cmp === 0;
    }
  }
}

// ===== 测试 =====
const v1 = SemVer.parse('1.2.3');
console.log('解析:', v1.toString()); // 1.2.3
console.log('major++:', v1.inc('major').toString()); // 2.0.0
console.log('minor++:', v1.inc('minor').toString()); // 1.3.0
console.log('patch++:', v1.inc('patch').toString()); // 1.2.4

const v2 = SemVer.parse('1.2.4-alpha.1');
console.log('\n比较 1.2.3 vs 1.2.4:', v1.compare(SemVer.parse('1.2.4'))); // -1
console.log('比较 1.2.3 vs 1.2.4-alpha.1:', v1.compare(v2)); // 1 (release > prerelease)
console.log('比较 1.2.4-alpha.1 vs 1.2.4-alpha.2:', v2.compare(SemVer.parse('1.2.4-alpha.2'))); // -1

console.log('\n范围匹配:');
console.log('1.2.3 ^1.2.0:', v1.satisfies('^1.2.0')); // true
console.log('1.2.3 ~1.2.0:', v1.satisfies('~1.2.0')); // true
console.log('1.2.3 >=1.3.0:', v1.satisfies('>=1.3.0')); // false
console.log('1.2.3 <2.0.0:', v1.satisfies('<2.0.0')); // true
