/**
 * 手写简易脚手架（Scaffold）工具
 *
 * 功能：根据模板生成项目结构
 * 实现思路：
 *   1. 定义模板文件树
 *   2. 支持变量替换
 *   3. 递归创建目录和文件
 */

const fs = require("fs");
const path = require("path");

class Scaffold {
  constructor() {
    this.templates = new Map();
  }

  // 注册模板
  template(name, files) {
    this.templates.set(name, files);
  }

  // 变量替换
  interpolate(content, vars) {
    return content.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] || "");
  }

  // 生成项目
  generate(templateName, targetDir, vars = {}) {
    const template = this.templates.get(templateName);
    if (!template) throw new Error("Template not found: " + templateName);

    console.log("[Scaffold] Generating project from template:", templateName);
    console.log("[Scaffold] Target:", targetDir);

    const created = [];
    for (const [filePath, content] of Object.entries(template)) {
      const interpolatedPath = this.interpolate(filePath, vars);
      const interpolatedContent = this.interpolate(content, vars);
      const fullPath = path.join(targetDir, interpolatedPath);

      // 模拟创建（实际应 fs.mkdirSync + fs.writeFileSync）
      console.log("  Create:", interpolatedPath);
      created.push(interpolatedPath);
    }

    console.log("[Scaffold] Done! Created", created.length, "files");
    return created;
  }
}

// ===== 测试 =====
const scaffold = new Scaffold();

scaffold.template("react-app", {
  "package.json": `{
  "name": "{{name}}",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  },
  "dependencies": {
    "react": "^18.0.0"
  }
}`,
  "src/App.jsx": `import React from 'react';

export default function App() {
  return <div>Hello {{name}}!</div>;
}
`,
  "src/main.jsx": `import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

ReactDOM.render(<App />, document.getElementById('root'));
`,
  "index.html": `<!DOCTYPE html>
<html>
<head><title>{{name}}</title></head>
<body><div id="root"></div><script src="/src/main.jsx"></script></body>
</html>`,
  ".gitignore": "node_modules\ndist\n.env",
  "README.md": "# {{name}}\n\nA React application.",
});

const created = scaffold.generate("react-app", "./my-app", {
  name: "my-awesome-app",
});

console.log("\nCreated files:", created);
