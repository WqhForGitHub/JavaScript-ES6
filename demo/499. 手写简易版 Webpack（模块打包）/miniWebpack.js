/**
 * 手写简易版 Webpack（模块打包）
 * Minimal Webpack: parse modules, build a dependency graph, emit a single bundle
 * with a CommonJS-style runtime.
 *
 * Approach:
 * - Input: an entry path and a `readModule(path) -> { code, deps: {requirePath: resolvedPath} }`
 *   hook (in real life these come from the file system + parser).
 * - Walk from the entry, recursively collecting modules keyed by id. Each module's
 *   code is wrapped as `function(module, exports, require) { ...translated... }`.
 * - Translate `require('./x')` calls into `require(<id>)` using the dep map so the
 *   runtime can index by integer id.
 * - Emit a runtime that implements a mini CommonJS `require`, then bootstraps the
 *   entry module. The result is a string you can save as `bundle.js`.
 * - `runBundle(bundle)` evaluates the bundle in a fresh Function scope (Node) and
 *   returns the entry module's exports.
 *
 * Pure JS; no real file system needed because the caller supplies module sources.
 */
function createBundler(entry, readModule) {
  let moduleId = 0;
  const modules = new Map();      // path -> { id, code, deps, mapping }
  const pathToId = new Map();

  function addModule(absolutePath) {
    if (pathToId.has(absolutePath)) return pathToId.get(absolutePath);
    const id = moduleId++;
    const info = readModule(absolutePath);
    const mapping = {};
    const deps = info.deps || {};
    Object.keys(deps).forEach((reqStr) => {
      const depAbs = deps[reqStr];
      const depId = addModule(depAbs);
      mapping[reqStr] = depId;
    });
    const wrapped = {
      id,
      code: info.code,
      deps: mapping,
    };
    modules.set(absolutePath, wrapped);
    pathToId.set(absolutePath, id);
    return id;
  }

  function translate(code, deps) {
    // Replace require('rel') with require(<id>) for known deps.
    return code.replace(/require\(\s*['"]([^'"]+)['"]\s*\)/g, (m, reqStr) => {
      if (deps[reqStr] !== undefined) return `require(${deps[reqStr]})`;
      return m;
    });
  }

  function bundle() {
    const entryId = addModule(entry);
    const modulesArray = [];
    for (const [abs, mod] of modules) {
      const translated = translate(mod.code, mod.deps);
      modulesArray.push(`${mod.id}: function(module, exports, require) {\n${translated}\n}`);
    }
    return `
(function (modules) {
  var cache = {};
  function require(id) {
    if (cache[id]) return cache[id].exports;
    var module = cache[id] = { exports: {} };
    modules[id].call(module.exports, module, module.exports, require);
    return module.exports;
  }
  require(${entryId});
})({
${modulesArray.join(',\n')}
});
`;
  }

  return { bundle, get modules() { return modules; } };
}

function runBundle(bundleSrc) {
  // Evaluate using Function so we don't pollute global scope.
  // eslint-disable-next-line no-new-func
  const fn = new Function(bundleSrc);
  fn();
}

// ---------- Test cases ----------
// A tiny fake file system.
const fakeFs = {
  '/entry.js': {
    code: `var greet = require('./greet'); console.log('entry:', greet('world')); module.exports = greet;`,
    deps: { './greet': '/greet.js' },
  },
  '/greet.js': {
    code: `module.exports = function (name) { return 'Hello, ' + name + '!'; };`,
    deps: {},
  },
};

const bundler = createBundler('/entry.js', (p) => fakeFs[p]);
const bundle = bundler.bundle();
console.log(bundle.indexOf('function(module, exports, require)') > -1); // expected: true
console.log('module count:', bundler.modules.size); // expected: 2

// Execute the bundle (prints "entry: Hello, world!").
runBundle(bundle); // expected console output: entry: Hello, world!
