/**
 * 手写简易权限系统（RBAC，基于角色的访问控制）
 * ---------------------------------------------------------------
 * 实现：
 * 1. 用户（User）、角色（Role）、权限（Permission）三层模型
 * 2. 给角色分配权限，给用户分配角色
 * 3. 权限检查：用户是否拥有某权限（直接 or 通过角色继承）
 * 4. 角色继承：admin extends editor extends viewer
 * 5. 资源级权限：article:edit, article:delete 等动作粒度
 * 6. 支持权限通配符（article:* 表示对 article 资源的所有动作）
 *
 * 演示：一套内容管理系统的权限校验。
 */

"use strict";

// ============================================================================
// 1. 权限模型
// ============================================================================

/**
 * Permission：资源 + 动作
 * 例如 { resource: 'article', action: 'edit' }
 * 也可用字符串 'article:edit' 表示
 */
class Permission {
  constructor(resource, action) {
    this.resource = resource;
    this.action = action;
  }

  /** 从字符串 'article:edit' 解析 */
  static parse(str) {
    const [resource, action] = str.split(":");
    return new Permission(resource, action);
  }

  /** 转字符串 */
  toString() {
    return `${this.resource}:${this.action}`;
  }

  /**
   * 判断本权限是否"匹配"另一权限（支持通配符 *）
   * 例如 article:* 匹配 article:edit
   */
  matches(other) {
    const resourceMatch =
      this.resource === "*" || this.resource === other.resource;
    const actionMatch = this.action === "*" || this.action === other.action;
    return resourceMatch && actionMatch;
  }

  equals(other) {
    return this.resource === other.resource && this.action === other.action;
  }
}

// ============================================================================
// 2. 角色模型（支持继承）
// ============================================================================

/**
 * Role：角色，可继承自其他角色，自身拥有一组权限
 */
class Role {
  /**
   * @param {string} name 角色名
   * @param {Role[]} parents 父角色列表（继承其权限）
   */
  constructor(name, parents = []) {
    this.name = name;
    this.parents = parents; // 继承来源
    this.permissions = new Set(); // Permission.toString()
  }

  /** 授予单条权限 */
  grant(permission) {
    const p =
      typeof permission === "string"
        ? Permission.parse(permission)
        : permission;
    this.permissions.add(p.toString());
    return this;
  }

  /** 批量授予 */
  grantAll(permissions) {
    permissions.forEach((p) => this.grant(p));
    return this;
  }

  /** 撤销权限 */
  revoke(permission) {
    const p =
      typeof permission === "string"
        ? Permission.parse(permission)
        : permission;
    this.permissions.delete(p.toString());
    return this;
  }

  /** 获取本角色直接拥有的权限（不含继承） */
  getDirectPermissions() {
    return [...this.permissions].map((s) => Permission.parse(s));
  }

  /**
   * 获取本角色全部权限（含继承，递归 + 去环）
   * 用 visited 集合防止继承环导致无限递归
   */
  getAllPermissions(visited = new Set()) {
    if (visited.has(this.name)) return [];
    visited.add(this.name);
    // 内部统一以字符串形式存储，避免递归返回的 Permission 对象与字符串混用
    const result = new Set(this.permissions);
    for (const parent of this.parents) {
      for (const perm of parent.getAllPermissions(visited)) {
        // perm 是 Permission 对象，转回字符串再合并
        result.add(perm.toString());
      }
    }
    return [...result].map((s) => Permission.parse(s));
  }
}

// ============================================================================
// 3. 用户模型
// ============================================================================

/**
 * User：用户，拥有一组角色 + 可选的直接权限
 */
class User {
  constructor(id, name) {
    this.id = id;
    this.name = name;
    this.roles = []; // Role[]
    this.directPermissions = new Set(); // 直接授予的权限（绕过角色）
  }

  /** 分配角色 */
  assignRole(role) {
    if (!this.roles.includes(role)) this.roles.push(role);
    return this;
  }

  /** 直接授予权限（特殊场景：临时权限） */
  grant(permission) {
    const p =
      typeof permission === "string"
        ? Permission.parse(permission)
        : permission;
    this.directPermissions.add(p.toString());
    return this;
  }

  /** 撤销直接授予的权限 */
  revoke(permission) {
    const p =
      typeof permission === "string"
        ? Permission.parse(permission)
        : permission;
    this.directPermissions.delete(p.toString());
    return this;
  }

  /** 获取用户全部权限（角色继承 + 直接） */
  getAllPermissions() {
    const result = new Set(this.directPermissions);
    for (const role of this.roles) {
      for (const perm of role.getAllPermissions()) {
        result.add(perm.toString());
      }
    }
    return [...result].map((s) => Permission.parse(s));
  }

  /** 获取用户全部角色名（含继承） */
  getAllRoleNames() {
    const names = new Set();
    const collect = (role) => {
      if (names.has(role.name)) return;
      names.add(role.name);
      role.parents.forEach(collect);
    };
    this.roles.forEach(collect);
    return [...names];
  }
}

// ============================================================================
// 4. RBAC 管理器：注册角色、用户，做权限校验
// ============================================================================

/**
 * RBACManager：权限系统的核心管理器
 */
class RBACManager {
  constructor() {
    this.roles = new Map(); // name -> Role
    this.users = new Map(); // id -> User
  }

  /** 注册角色 */
  registerRole(role) {
    this.roles.set(role.name, role);
    return role;
  }

  /** 获取角色 */
  getRole(name) {
    return this.roles.get(name);
  }

  /** 注册用户 */
  registerUser(user) {
    this.users.set(user.id, user);
    return user;
  }

  /** 获取用户（按 id 或 name 查找，便于演示） */
  getUser(idOrName) {
    if (this.users.has(idOrName)) return this.users.get(idOrName);
    // 按 name 回退查找
    for (const user of this.users.values()) {
      if (user.name === idOrName) return user;
    }
    return undefined;
  }

  /**
   * 检查用户是否拥有某权限
   * @param {string} userId
   * @param {string|Permission} permission 如 'article:edit'
   * @returns {boolean}
   */
  hasPermission(userId, permission) {
    const user = this.getUser(userId);
    if (!user) return false;
    const p =
      typeof permission === "string"
        ? Permission.parse(permission)
        : permission;
    const all = user.getAllPermissions();
    // 任意一条权限（含通配）能匹配即可
    return all.some((perm) => perm.matches(p));
  }

  /**
   * 检查用户是否拥有全部权限
   */
  hasAllPermissions(userId, permissions) {
    return permissions.every((p) => this.hasPermission(userId, p));
  }

  /**
   * 检查用户是否拥有任意一条权限
   */
  hasAnyPermission(userId, permissions) {
    return permissions.some((p) => this.hasPermission(userId, p));
  }

  /**
   * 检查用户是否拥有某角色（含继承）
   */
  hasRole(userId, roleName) {
    const user = this.getUser(userId);
    if (!user) return false;
    return user.getAllRoleNames().includes(roleName);
  }

  /**
   * 断言：必须有权限，否则抛错
   */
  assert(userId, permission) {
    if (!this.hasPermission(userId, permission)) {
      throw new PermissionDeniedError(userId, permission);
    }
    return true;
  }
}

/**
 * 权限不足错误
 */
class PermissionDeniedError extends Error {
  constructor(userId, permission) {
    super(`权限不足：用户 ${userId} 不具备权限 ${permission}`);
    this.name = "PermissionDeniedError";
    this.userId = userId;
    this.permission =
      typeof permission === "string" ? permission : permission.toString();
  }
}

// ============================================================================
// 5. 测试用例：内容管理系统权限
// ============================================================================

function runTests() {
  console.log("================ 1. 定义角色继承链 ================");
  const rbac = new RBACManager();

  // viewer：只能查看
  const viewer = rbac.registerRole(new Role("viewer"));
  viewer.grantAll(["article:read", "comment:read"]);

  // editor：继承 viewer，且能编辑文章、发评论
  const editor = rbac.registerRole(new Role("editor", [viewer]));
  editor.grantAll(["article:edit", "comment:create", "comment:edit"]);

  // admin：继承 editor，且能删除、发布、管理用户
  const admin = rbac.registerRole(new Role("admin", [editor]));
  admin.grantAll([
    "article:delete",
    "article:publish",
    "user:manage",
    "article:*",
  ]);

  console.log(
    "viewer 权限:",
    viewer.getAllPermissions().map((p) => p.toString()),
  );
  console.log(
    "editor 权限（含继承）:",
    editor.getAllPermissions().map((p) => p.toString()),
  );
  console.log(
    "admin 权限（含继承）:",
    admin.getAllPermissions().map((p) => p.toString()),
  );

  console.log("\n================ 2. 创建用户并分配角色 ================");
  const alice = rbac.registerUser(new User("u1", "Alice"));
  alice.assignRole(admin);
  const bob = rbac.registerUser(new User("u2", "Bob"));
  bob.assignRole(editor);
  const carol = rbac.registerUser(new User("u3", "Carol"));
  carol.assignRole(viewer);
  const dave = rbac.registerUser(new User("u4", "Dave"));
  dave.assignRole(viewer);
  dave.grant("article:edit"); // 临时直接授权

  console.log("Alice 角色:", alice.getAllRoleNames());
  console.log("Bob 角色:", bob.getAllRoleNames());
  console.log("Carol 角色:", carol.getAllRoleNames());
  console.log(
    "Dave 角色:",
    dave.getAllRoleNames(),
    "(+ 直接权限 article:edit)",
  );

  console.log("\n================ 3. 权限检查 ================");
  const checks = [
    ["Alice", "article:read"], // admin 继承 viewer -> true
    ["Alice", "article:delete"], // admin 直接 -> true
    ["Alice", "article:publish"], // admin 直接 -> true
    ["Alice", "user:manage"], // admin 直接 -> true
    ["Bob", "article:read"], // editor 继承 viewer -> true
    ["Bob", "article:edit"], // editor 直接 -> true
    ["Bob", "article:delete"], // editor 无 -> false
    ["Bob", "article:publish"], // editor 无 -> false
    ["Carol", "article:read"], // viewer 直接 -> true
    ["Carol", "article:edit"], // viewer 无 -> false
    ["Carol", "comment:read"], // viewer 直接 -> true
    ["Carol", "comment:create"], // viewer 无 -> false
    ["Dave", "article:edit"], // viewer 无，但直接授予 -> true
    ["Dave", "article:delete"], // 无 -> false
  ];
  checks.forEach(([user, perm]) => {
    const ok = rbac.hasPermission(user, perm);
    console.log(`  ${user} -> ${perm}: ${ok ? "允许" : "拒绝"}`);
  });

  console.log("\n================ 4. 通配符权限验证 ================");
  // admin 拥有 article:*，能匹配 article 下的任意动作
  console.log(
    "Alice 拥有 article:* => article:create 允许?",
    rbac.hasPermission("Alice", "article:create"),
  );
  console.log(
    "Alice 拥有 article:* => article:archive 允许?",
    rbac.hasPermission("Alice", "article:archive"),
  );
  console.log(
    "Bob 没有 article:* => article:create 允许?",
    rbac.hasPermission("Bob", "article:create"),
  );

  console.log("\n================ 5. 复合检查 ================");
  console.log(
    "Bob 同时拥有 article:read AND article:edit?",
    rbac.hasAllPermissions("Bob", ["article:read", "article:edit"]),
  );
  console.log(
    "Bob 同时拥有 article:read AND article:delete?",
    rbac.hasAllPermissions("Bob", ["article:read", "article:delete"]),
  );
  console.log(
    "Bob 拥有 article:delete OR article:publish?",
    rbac.hasAnyPermission("Bob", ["article:delete", "article:publish"]),
  );
  console.log(
    "Carol 拥有 article:read OR article:edit?",
    rbac.hasAnyPermission("Carol", ["article:read", "article:edit"]),
  );

  console.log("\n================ 6. 角色判断 ================");
  console.log("Alice 是 admin?", rbac.hasRole("Alice", "admin"));
  console.log("Alice 是 editor? (继承)", rbac.hasRole("Alice", "editor"));
  console.log("Alice 是 viewer? (继承)", rbac.hasRole("Alice", "viewer"));
  console.log("Bob 是 admin?", rbac.hasRole("Bob", "admin"));

  console.log("\n================ 7. 断言（抛错） ================");
  try {
    rbac.assert("Carol", "article:edit");
    console.log("  不应到达此处");
  } catch (e) {
    console.log("  Carol 尝试编辑文章被拒绝:", e.message);
  }
  try {
    rbac.assert("Alice", "article:delete");
    console.log("  Alice 删除文章通过权限校验");
  } catch (e) {
    console.log("  不应到达此处:", e.message);
  }

  console.log("\n================ 8. 动态调整权限 ================");
  // 给 editor 增加删除评论的能力
  editor.grant("comment:delete");
  console.log(
    "editor 新增 comment:delete 后，Bob 拥有?",
    rbac.hasPermission("Bob", "comment:delete"),
  );
  // 撤销 Dave 的直接 article:edit
  dave.revoke("article:edit");
  console.log(
    "撤销 Dave 的直接 article:edit 后:",
    rbac.hasPermission("Dave", "article:edit") ? "允许" : "拒绝",
  );

  console.log("\n================ 9. 继承环保护 ================");
  // 构造一个环：a -> b -> a，验证不会无限递归
  const roleA = new Role("roleA");
  const roleB = new Role("roleB", [roleA]);
  roleA.parents = [roleB]; // 制造环
  roleA.grant("test:doA");
  roleB.grant("test:doB");
  const cyclicalUser = rbac.registerUser(new User("u5", "Eve"));
  cyclicalUser.assignRole(roleA);
  console.log(
    "继承环下 Eve 的权限:",
    cyclicalUser.getAllPermissions().map((p) => p.toString()),
  );
  console.log("Eve 拥有 test:doA?", rbac.hasPermission("Eve", "test:doA"));
  console.log("Eve 拥有 test:doB?", rbac.hasPermission("Eve", "test:doB"));

  console.log(
    "\n================ 10. 权限审计：列出某用户完整权限 ================",
  );
  function audit(userId) {
    const user = rbac.getUser(userId);
    console.log(`\n用户 ${user.name} (${userId}) 权限审计:`);
    console.log("  角色（含继承）:", user.getAllRoleNames());
    console.log(
      "  全部权限:",
      user
        .getAllPermissions()
        .map((p) => p.toString())
        .sort(),
    );
    if (user.directPermissions.size > 0) {
      console.log("  其中直接授予:", [...user.directPermissions]);
    }
  }
  audit("u1");
  audit("u2");
  audit("u4");
}

runTests();
