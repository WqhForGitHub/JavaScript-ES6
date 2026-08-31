// 改前：运营仪表盘把每个部件的渲染方法名写死在主程序里，每接一个新部件就得改一遍主程序，外部开发者想贡献部件根本无从下手

// ========== 各部件：方法名各起各的，没有任何统一约定 ==========
class SalesChart {
  renderSalesChart(): void {
    console.log('[销售图表] 渲染折线图');
  }
}

class TodoList {
  showTodos(): void {
    console.log('[待办清单] 渲染待办列表');
  }
}

class WeatherCard {
  displayWeather(): void {
    console.log('[天气卡片] 渲染今日天气');
  }
}

// ========== 仪表盘主程序：被迫记住每个部件的专有方法名 ==========
class Dashboard {
  private salesChart = new SalesChart();
  private todoList = new TodoList();
  private weatherCard = new WeatherCard();

  renderAll(): void {
    // 三个部件三种调用方式，全靠人脑记
    this.salesChart.renderSalesChart();
    this.todoList.showTodos();
    this.weatherCard.displayWeather();
  }
}

new Dashboard().renderAll();

// 问题：
// 1. 仪表盘认识了每个部件的类名和专有方法名：renderSalesChart、showTodos、displayWeather 没有任何规律
// 2. 新接一个部件（如"库存预警"）必须回来改 Dashboard：加字段、加调用，主程序永远在变
// 3. 外部开发者想贡献部件？没门——没有约定可循，只能改主程序源码
// 4. 想统一给所有部件加"刷新""卸载清理"能力？方法名都不统一，根本没法批量调用

export {};
