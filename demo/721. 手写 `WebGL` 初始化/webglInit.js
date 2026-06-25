/**
 * 手写 WebGL 初始化
 *
 * WebGL 作用：
 *   - 基于 OpenGL ES 的浏览器 3D 绘图 API
 *   - 通过着色器（vertex/fragment shader）控制 GPU 渲染
 *
 * 实现思路：
 *   1. getContext("webgl") 获取 WebGLRenderingContext
 *   2. 编译 vertex/fragment shader
 *   3. 链接 program
 *   4. 设置顶点缓冲（VBO）
 *   5. 设置清屏色并绘制
 *   6. Node 环境：用 mock gl 记录调用，验证初始化流程
 */

// 跨环境 mock WebGLRenderingContext
function createMockCanvas() {
  const glCalls = [];
  const gl = {
    createShader: () => ({}),
    shaderSource: (shader, src) =>
      glCalls.push({ method: "shaderSource", src }),
    compileShader: (shader) => glCalls.push({ method: "compileShader" }),
    getShaderParameter: () => true,
    createProgram: () => ({}),
    attachShader: () => glCalls.push({ method: "attachShader" }),
    linkProgram: () => glCalls.push({ method: "linkProgram" }),
    getProgramParameter: () => true,
    useProgram: () => glCalls.push({ method: "useProgram" }),
    createBuffer: () => ({}),
    bindBuffer: () => glCalls.push({ method: "bindBuffer" }),
    bufferData: () => glCalls.push({ method: "bufferData" }),
    getAttribLocation: () => 0,
    enableVertexAttribArray: () =>
      glCalls.push({ method: "enableVertexAttribArray" }),
    vertexAttribPointer: () => glCalls.push({ method: "vertexAttribPointer" }),
    getUniformLocation: () => ({}),
    uniformMatrix4fv: () => glCalls.push({ method: "uniformMatrix4fv" }),
    clearColor: (r, g, b, a) =>
      glCalls.push({ method: "clearColor", r, g, b, a }),
    clear: (mask) => glCalls.push({ method: "clear", mask }),
    enable: () => glCalls.push({ method: "enable" }),
    depthFunc: () => glCalls.push({ method: "depthFunc" }),
    viewport: () => glCalls.push({ method: "viewport" }),
    drawArrays: (mode, first, count) =>
      glCalls.push({ method: "drawArrays", mode, first, count }),
    drawElements: (mode, count, type, offset) =>
      glCalls.push({ method: "drawElements", mode, count }),
    TRIANGLES: 4,
    STATIC_DRAW: 35044,
    COLOR_BUFFER_BIT: 16384,
    DEPTH_BUFFER_BIT: 256,
    LEQUAL: 515,
    DEPTH_TEST: 2929,
    FLOAT: 5126,
    ARRAY_BUFFER: 34962,
    _calls: glCalls,
  };
  const canvas = { width: 300, height: 300, getContext: () => gl };
  return { canvas, gl };
}

function getCanvas() {
  if (typeof document !== "undefined") {
    const c = document.createElement("canvas");
    return c;
  }
  return createMockCanvas().canvas;
}

// 矩阵工具（4x4 列主序）
const mat4 = {
  identity() {
    return new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
  },
  perspective(fov, aspect, near, far) {
    const f = 1 / Math.tan(fov / 2);
    const nf = 1 / (near - far);
    return new Float32Array([
      f / aspect,
      0,
      0,
      0,
      0,
      f,
      0,
      0,
      0,
      0,
      (far + near) * nf,
      -1,
      0,
      0,
      2 * far * near * nf,
      0,
    ]);
  },
  translate(m, x, y, z) {
    const out = new Float32Array(m);
    out[12] = m[0] * x + m[4] * y + m[8] * z + m[12];
    out[13] = m[1] * x + m[5] * y + m[9] * z + m[13];
    out[14] = m[2] * x + m[6] * y + m[10] * z + m[14];
    out[15] = m[3] * x + m[7] * y + m[11] * z + m[15];
    return out;
  },
};

class WebGLRenderer {
  constructor(canvas) {
    this.canvas = canvas || getCanvas();
    this.gl =
      this.canvas.getContext("webgl") ||
      this.canvas.getContext("experimental-webgl");
    if (!this.gl) throw new Error("WebGL 不支持");
  }

  // 编译单个着色器
  _compileShader(type, source) {
    const gl = this.gl;
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      throw new Error("着色器编译失败");
    }
    return shader;
  }

  // 创建程序
  createProgram(vsSource, fsSource) {
    const gl = this.gl;
    const vs = this._compileShader(gl.VERTEX_SHADER, vsSource);
    const fs = this._compileShader(gl.FRAGMENT_SHADER, fsSource);
    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error("程序链接失败");
    }
    gl.useProgram(program);
    this.program = program;
    return program;
  }

  // 创建顶点缓冲
  createBuffer(data) {
    const gl = this.gl;
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
    return buffer;
  }

  // 绑定属性指针
  setAttribute(name, size, stride, offset) {
    const gl = this.gl;
    const loc = gl.getAttribLocation(this.program, name);
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, size, gl.FLOAT, false, stride, offset);
    return loc;
  }

  // 设置清屏并绘制
  render(clearColor = [0, 0, 0, 1], vertexCount = 3) {
    const gl = this.gl;
    gl.clearColor(...clearColor);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, vertexCount);
  }
}

// ===== 测试 =====
(() => {
  const { canvas, gl } = createMockCanvas();
  const renderer = new WebGLRenderer(canvas);

  const vsSource = `
    attribute vec3 aPosition;
    uniform mat4 uModelView;
    void main() {
      gl_Position = uModelView * vec4(aPosition, 1.0);
    }
  `;
  const fsSource = `
    precision mediump float;
    void main() {
      gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
    }
  `;

  renderer.createProgram(vsSource, fsSource);

  // 三角形顶点
  const vertices = [0, 0.5, 0, -0.5, -0.5, 0, 0.5, -0.5, 0];
  renderer.createBuffer(vertices);
  renderer.setAttribute("aPosition", 3, 0, 0);

  // 投影矩阵
  const projection = mat4.perspective(Math.PI / 4, 1, 0.1, 100);
  const modelView = mat4.translate(mat4.identity(), 0, 0, -3);
  const uMV = gl.getUniformLocation(renderer.program, "uModelView");
  gl.uniformMatrix4fv(uMV, false, modelView);

  renderer.render([0.2, 0.3, 0.4, 1.0], 3);

  // 验证调用序列
  const calls = gl._calls.map((c) => c.method);
  console.log("着色器编译:", calls.includes("compileShader")); // true
  console.log("程序链接:", calls.includes("linkProgram")); // true
  console.log("缓冲数据:", calls.includes("bufferData")); // true
  console.log("清屏:", calls.filter((c) => c === "clearColor").length); // 1
  console.log("绘制:", calls.filter((c) => c === "drawArrays").length); // 1
  const drawCall = gl._calls.find((c) => c.method === "drawArrays");
  console.log("绘制顶点数:", drawCall.count); // 3

  console.log("WebGL 初始化演示完成");
})();
