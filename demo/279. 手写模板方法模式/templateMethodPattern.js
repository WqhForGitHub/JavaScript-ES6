/**
 * 模板方法模式 (Template Method Pattern)
 *
 * Approach:
 * - Define the skeleton of an algorithm in a base class, deferring some steps to
 *   subclasses. Template Method lets subclasses redefine parts of an algorithm
 *   without changing its structure.
 * - The base class implements a final `run()` (the template method) that calls
 *   primitive operations in a fixed order; subclasses override the primitive ops.
 * - We model a data-processing pipeline: readData() -> validate() -> transform() ->
 *   output(). Concrete subclasses (CsvPipeline, JsonPipeline) customise each step
 *   while sharing the overall flow.
 * - Hooks (optional overrides with default no-op) are also demonstrated.
 */

class DataPipeline {
  // Template method: final structure shared by all subclasses.
  run() {
    const raw = this.readData();
    const valid = this.validate(raw);
    const transformed = this.transform(valid);
    this.beforeOutput(transformed); // hook
    const result = this.output(transformed);
    this.afterOutput(result); // hook
    return result;
  }

  // Primitive operations to be overridden.
  readData() {
    throw new Error("readData not implemented");
  }
  validate(data) {
    throw new Error("validate not implemented");
  }
  transform(data) {
    return data; // default: identity
  }
  output(data) {
    throw new Error("output not implemented");
  }

  // Hooks with default no-op behaviour (optional overrides).
  beforeOutput() {}
  afterOutput() {}
}

class CsvPipeline extends DataPipeline {
  constructor(source) {
    super();
    this.source = source;
  }
  readData() {
    // source like "a,b,c"
    return this.source.split("\n").map((line) => line.split(","));
  }
  validate(rows) {
    return rows.filter((r) => r.length > 0 && r.every((c) => c !== ""));
  }
  transform(rows) {
    return rows.map((r) => r.map((c) => c.trim().toUpperCase()));
  }
  output(rows) {
    return rows.map((r) => r.join("|")).join("\n");
  }
  afterOutput(result) {
    this._lastLen = result.split("\n").length;
  }
}

class JsonPipeline extends DataPipeline {
  constructor(sourceObj) {
    super();
    this.obj = sourceObj;
  }
  readData() {
    return this.obj;
  }
  validate(data) {
    if (!data || typeof data !== "object") throw new Error("Invalid JSON");
    return data;
  }
  transform(data) {
    return Object.entries(data).map(([k, v]) => `${k}=${v}`);
  }
  output(entries) {
    return JSON.stringify(entries);
  }
  beforeOutput(entries) {
    this._count = entries.length;
  }
}

// ---------------- Test cases ----------------
const csv = new CsvPipeline("a, b ,c\nx,y\n,\n1,2,3");
console.log(csv.run());
// Expected:
// A|B|C
// X|Y
// 1|2|3
console.log("rows emitted:", csv._lastLen);
// Expected: rows emitted: 3

const json = new JsonPipeline({ name: "Alice", age: 30, role: "admin" });
console.log(json.run());
// Expected: ["name=Alice","age=30","role=admin"]
console.log("entries:", json._count);
// Expected: entries: 3

// Validate throws for bad input
try {
  new JsonPipeline(null).run();
} catch (e) {
  console.log("Validate error:", e.message);
  // Expected: Validate error: Invalid JSON
}
