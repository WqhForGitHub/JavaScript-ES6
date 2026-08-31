// 改后：模板方法模式 -- 导出骨架固定在基类，格式差异交给子类，钩子控制是否通知

interface OrderRow {
  orderNo: string;
  amount: number;
}

// ========== 抽象基类：导出流程骨架 ==========
abstract class ReportExporter {
  // 模板方法：查数据 -> 组装 -> 写文件 -> 视钩子决定要不要通知
  export(): void {
    const rows = this.queryData();
    const content = this.buildContent(rows);
    this.writeFile(content);
    if (this.needNotify()) {
      console.log('发送企业微信：订单报表已导出');
    }
  }

  // 公共步骤：查库逻辑只有一份，绝无「某格式查了旧数据」的可能
  protected queryData(): OrderRow[] {
    return [
      { orderNo: 'O-1001', amount: 199 },
      { orderNo: 'O-1002', amount: 59 },
      { orderNo: 'O-1003', amount: 1288 },
    ];
  }

  // 差异步骤：每种格式组装方式不同
  protected abstract buildContent(rows: OrderRow[]): string;

  // 差异步骤：每种格式落地方式不同
  protected abstract writeFile(content: string): void;

  // 钩子方法：默认不发通知，子类按需打开
  protected needNotify(): boolean {
    return false;
  }
}

// ========== 子类：Excel 导出，只写两个差异步骤 ==========
class ExcelExporter extends ReportExporter {
  protected buildContent(rows: OrderRow[]): string {
    return rows.map((r) => `${r.orderNo}|${r.amount}`).join('|');
  }

  protected writeFile(content: string): void {
    console.log(`生成订单报表.xlsx：${content}`);
  }
}

// ========== 子类：CSV 导出 ==========
class CsvExporter extends ReportExporter {
  protected buildContent(rows: OrderRow[]): string {
    return rows.map((r) => `${r.orderNo},${r.amount}`).join(' / ');
  }

  protected writeFile(content: string): void {
    console.log(`生成订单报表.csv：${content}`);
  }
}

// ========== 覆写钩子的子类：月度大报表导出后要通知运营群 ==========
class MonthlyExcelExporter extends ExcelExporter {
  protected needNotify(): boolean {
    return true;
  }
}

console.log('--- 导出 Excel（日常报表，不通知）---');
new ExcelExporter().export();

console.log('--- 导出 CSV（日常报表，不通知）---');
new CsvExporter().export();

console.log('--- 导出 Excel（月度大报表，钩子打开通知）---');
new MonthlyExcelExporter().export();

// 优势：
// 1. 查数据、通知这类公共步骤只在骨架里出现一次，流程加环节只改基类一处
// 2. 子类只填「组装 + 写文件」两个空，新增 PDF 导出零复制
// 3. 钩子方法让「要不要发通知」成为子类的可选项，不必为开关多写一个分支

export {};
