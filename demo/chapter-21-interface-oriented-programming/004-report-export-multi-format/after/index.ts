// 改后：接口和面向接口编程 -- 定义 ReportExporter 接口，每种格式一个实现类注册进登记表，新格式只加类、不改老代码

// ========== 报表数据 ==========
interface SalesReport {
  title: string;
  rows: Array<{ region: string; amount: number }>;
}

const report: SalesReport = {
  title: '第三季度销售报表',
  rows: [
    { region: '华南', amount: 120000 },
    { region: '华北', amount: 98000 },
    { region: '华东', amount: 150000 },
  ],
};

// ========== 接口：约定"一个导出器"必须会什么 ==========
interface ReportExporter {
  readonly format: string; // 自己声明支持的格式名
  export(report: SalesReport): string;
}

// ========== CSV 导出器：只管 CSV ==========
class CsvExporter implements ReportExporter {
  readonly format = 'csv';

  export(report: SalesReport): string {
    let content = `标题,${report.title}\n`;
    report.rows.forEach((row) => {
      content += `${row.region},${row.amount}\n`;
    });
    return content;
  }
}

// ========== JSON 导出器：只管 JSON ==========
class JsonExporter implements ReportExporter {
  readonly format = 'json';

  export(report: SalesReport): string {
    return JSON.stringify(report);
  }
}

// ========== HTML 导出器：只管 HTML ==========
class HtmlExporter implements ReportExporter {
  readonly format = 'html';

  export(report: SalesReport): string {
    let content = `<h1>${report.title}</h1><table>`;
    report.rows.forEach((row) => {
      content += `<tr><td>${row.region}</td><td>${row.amount}</td></tr>`;
    });
    return `${content}</table>`;
  }
}

// ========== 登记表：格式名 -> 导出器实现 ==========
const exporters = new Map<string, ReportExporter>();

function registerExporter(exporter: ReportExporter): void {
  exporters.set(exporter.format, exporter);
}

registerExporter(new CsvExporter());
registerExporter(new JsonExporter());
registerExporter(new HtmlExporter());

// ========== 导出入口：只面向 ReportExporter 接口编程 ==========
function exportReport(report: SalesReport, format: string): string {
  const exporter = exporters.get(format);
  if (!exporter) {
    throw new Error(`不支持的格式：${format}`);
  }
  const content = exporter.export(report);
  console.log(`导出 ${format.toUpperCase()}：${content.slice(0, 40)}...`);
  return content;
}

exportReport(report, 'csv');
exportReport(report, 'json');
exportReport(report, 'html');

// ========== 新需求：Markdown 格式，写个新实现类注册即可，上面一行不用改 ==========
class MarkdownExporter implements ReportExporter {
  readonly format = 'markdown';

  export(report: SalesReport): string {
    let content = `# ${report.title}\n\n| 区域 | 金额 |\n| --- | --- |\n`;
    report.rows.forEach((row) => {
      content += `| ${row.region} | ${row.amount} |\n`;
    });
    return content;
  }
}

registerExporter(new MarkdownExporter());
exportReport(report, 'markdown');

// 优势：
// 1. exportReport 只依赖 ReportExporter 接口，与任何具体格式彻底解耦
// 2. 每种格式一个类，可独立开发、独立测试，改 CSV 不可能碰坏 HTML
// 3. 新增格式 = 新实现类 + 注册一行，老代码零修改（对扩展开放）
// 4. "我支持什么格式"由实现类自己声明，登记表自动收纳，不用维护中心化的 if/else 名单

export {};
