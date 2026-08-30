// 改后：接口和面向接口编程 -- 约定 WidgetPlugin 接口契约，任何部件满足契约即可挂载，主程序用鸭式辨型在运行时把关

// ========== 接口契约：想上仪表盘，必须提供这四样东西 ==========
interface WidgetPlugin {
  readonly name: string;
  mount(container: string): void; // 渲染进容器
  update(): void; // 刷新数据
  destroy(): void; // 卸载清理
}

// ========== 官方部件一：销售图表，老老实实按契约实现 ==========
class SalesChart implements WidgetPlugin {
  readonly name = 'sales-chart';

  mount(container: string): void {
    console.log(`[销售图表] 挂载到 ${container}，渲染折线图`);
  }

  update(): void {
    console.log('[销售图表] 刷新销售数据');
  }

  destroy(): void {
    console.log('[销售图表] 卸载，清理定时器');
  }
}

// ========== 官方部件二：待办清单 ==========
class TodoList implements WidgetPlugin {
  readonly name = 'todo-list';

  mount(container: string): void {
    console.log(`[待办清单] 挂载到 ${container}，渲染待办列表`);
  }

  update(): void {
    console.log('[待办清单] 拉取最新待办');
  }

  destroy(): void {
    console.log('[待办清单] 卸载');
  }
}

// ========== 第三方部件：外部开发者照着契约就能贡献，主程序一行没改 ==========
class StockAlertWidget implements WidgetPlugin {
  readonly name = 'stock-alert';

  mount(container: string): void {
    console.log(`[库存预警] 第三方插件挂载到 ${container}`);
  }

  update(): void {
    console.log('[库存预警] 检查库存水位');
  }

  destroy(): void {
    console.log('[库存预警] 卸载，退订预警推送');
  }
}

// ========== 鸭式辨型：运行时校验对象是否满足契约 ==========
// "如果它走起来像插件、叫起来像插件，那它就是插件" -- 只认方法结构，不认出身
function isWidgetPlugin(obj: unknown): obj is WidgetPlugin {
  const candidate = obj as Record<string, unknown>;
  return (
    typeof candidate.name === 'string' &&
    typeof candidate.mount === 'function' &&
    typeof candidate.update === 'function' &&
    typeof candidate.destroy === 'function'
  );
}

// ========== 仪表盘主程序：只认 WidgetPlugin 契约，不认识任何具体部件 ==========
class Dashboard {
  private plugins: WidgetPlugin[] = [];

  // 挂载前用鸭式辨型把关：长得不像部件的，拒绝入内
  // 类型标注只是编译期的承诺，运行时来的可能是 JSON、第三方脚本塞进来的任何对象，所以再验一次
  addPlugin(plugin: WidgetPlugin): void {
    const declaredName = plugin.name;
    if (!isWidgetPlugin(plugin)) {
      throw new Error(`「${declaredName}」不满足 WidgetPlugin 契约，禁止挂载`);
    }
    this.plugins.push(plugin);
    plugin.mount('dashboard-root');
  }

  refreshAll(): void {
    this.plugins.forEach((plugin) => plugin.update());
  }

  destroyAll(): void {
    this.plugins.forEach((plugin) => plugin.destroy());
  }
}

const dashboard = new Dashboard();
dashboard.addPlugin(new SalesChart());
dashboard.addPlugin(new TodoList());
dashboard.addPlugin(new StockAlertWidget());

console.log('--- 刷新全部部件 ---');
dashboard.refreshAll();

console.log('--- 卸载全部部件 ---');
dashboard.destroyAll();

// 一个不满足契约的对象想混进来，当场被拦下
const fakeWidget = { name: 'fake', mount: () => {} } as unknown as WidgetPlugin;
try {
  dashboard.addPlugin(fakeWidget); // 缺 update 和 destroy，鸭式辨型不过关
} catch (error) {
  console.log(`拦截成功：${(error as Error).message}`);
}

// 优势：
// 1. 仪表盘只认 WidgetPlugin 契约，不认识任何具体部件，部件再多主程序也不变
// 2. 新部件（包括第三方开发的）只要满足接口，注册即可挂载，主程序零修改
// 3. 鸭式辨型在运行时把关：缺方法的对象当场拦截，报错信息一目了然
// 4. 统一的 update/destroy 约定，让"刷新全部""卸载清理"一键完成，这正是接口作为协作契约的价值

export {};
