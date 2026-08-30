// 改前：导出报表的函数把每种格式的内容拼接逻辑全部 if/else 内联，格式越加越多，函数越来越长，改一个分支提心吊胆碰坏另一个

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

// ========== 导出函数：所有格式的拼接逻辑挤成一坨 ==========
function exportReport(report: SalesReport, format: string): string {
  let content = '';

  if (format === 'csv') {
    content = `标题,${report.title}\n`;
    report.rows.forEach((row) => {
      content += `${row.region},${row.amount}\n`;
    });
  } else if (format === 'json') {
    content = JSON.stringify(report);
  } else if (format === 'html') {
    content = `<h1>${report.title}</h1><table>`;
    report.rows.forEach((row) => {
      content += `<tr><td>${row.region}</td><td>${row.amount}</td></tr>`;
    });
    content += '</table>';
  } else {
    throw new Error(`不支持的格式：${format}`);
  }

  console.log(`导出 ${format.toUpperCase()}：${content.slice(0, 40)}...`);
  return content;
}

exportReport(report, 'csv');
exportReport(report, 'json');
exportReport(report, 'html');

// 问题：
// 1. 每加一种格式（PDF、Excel、Markdown...）就得回来改 exportReport，函数越长越难维护
// 2. 各格式的拼接逻辑挤在同一作用域里，改 CSV 分支手一抖可能碰坏 HTML 分支
// 3. 没法针对单个格式做单元测试，一测就是整个大函数
// 4. 每种格式若还有各自的文件名、扩展名、编码逻辑，只能继续往 if/else 里塞

export {};
