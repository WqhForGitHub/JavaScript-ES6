/**
 * 手写简易持续集成脚本
 *
 * 功能：模拟 CI/CD 流水线
 *   1. 安装依赖
 *   2. 代码检查
 *   3. 单元测试
 *   4. 构建
 *   5. 部署
 *
 * 实现思路：
 *   1. 定义 Pipeline 阶段
 *   2. 每个阶段有步骤
 *   3. 失败时中断流水线
 *   4. 支持并行步骤
 *   5. 生成报告
 */

const { execSync } = require('child_process');

class CIScript {
  constructor() {
    this.stages = [];
    this.currentStage = null;
    this.report = { stages: [], startTime: null, endTime: null, success: true };
  }

  // 添加阶段
  stage(name, steps) {
    this.stages.push({ name, steps: Array.isArray(steps) ? steps : [steps], parallel: false });
    return this;
  }

  // 添加并行阶段
  parallelStage(name, steps) {
    this.stages.push({ name, steps, parallel: true });
    return this;
  }

  // 执行步骤
  async runStep(step) {
    const stepName = typeof step === 'string' ? step : step.name;
    const command = typeof step === 'string' ? step : step.command;
    const startTime = Date.now();

    console.log('  -> Running: ' + stepName);
    try {
      if (command && !command.includes('mock-fail')) {
        console.log('     $ ' + command);
      }
      // 模拟执行
      await new Promise(r => setTimeout(r, 100));
      const duration = Date.now() - startTime;
      console.log('     ✓ Passed (' + duration + 'ms)');
      return { name: stepName, success: true, duration };
    } catch (e) {
      const duration = Date.now() - startTime;
      console.log('     ✗ Failed (' + duration + 'ms)');
      return { name: stepName, success: false, duration, error: e.message };
    }
  }

  // 执行阶段
  async runStage(stage) {
    console.log('\n=== Stage: ' + stage.name + ' ===');
    const startTime = Date.now();
    let stageSuccess = true;
    const stepResults = [];

    if (stage.parallel) {
      const results = await Promise.all(stage.steps.map(s => this.runStep(s)));
      stepResults.push(...results);
      stageSuccess = results.every(r => r.success);
    } else {
      for (const step of stage.steps) {
        const result = await this.runStep(step);
        stepResults.push(result);
        if (!result.success) {
          stageSuccess = false;
          break; // 串联步骤失败则中断
        }
      }
    }

    const duration = Date.now() - startTime;
    console.log(stageSuccess ? '  Stage PASSED (' + duration + 'ms)' : '  Stage FAILED (' + duration + 'ms)');

    this.report.stages.push({ name: stage.name, success: stageSuccess, duration, steps: stepResults });
    return stageSuccess;
  }

  // 运行流水线
  async run() {
    console.log('🚀 Starting CI Pipeline...');
    this.report.startTime = new Date();

    for (const stage of this.stages) {
      const success = await this.runStage(stage);
      if (!success) {
        this.report.success = false;
        console.log('\n❌ Pipeline FAILED at stage: ' + stage.name);
        break;
      }
    }

    this.report.endTime = new Date();
    const totalDuration = this.report.endTime - this.report.startTime;
    console.log('\n' + (this.report.success ? '✅ Pipeline SUCCESS' : '❌ Pipeline FAILED') + ' (' + totalDuration + 'ms)');

    this.printReport();
    return this.report;
  }

  printReport() {
    console.log('\n=== CI Report ===');
    console.log('Total stages:', this.report.stages.length);
    console.log('Passed:', this.report.stages.filter(s => s.success).length);
    console.log('Failed:', this.report.stages.filter(s => !s.success).length);
    console.log('Duration:', (this.report.endTime - this.report.startTime) + 'ms');
  }
}

// ===== 测试 =====
const ci = new CIScript();

ci.stage('Install', [
  { name: 'npm ci', command: 'npm ci' },
]);

ci.parallelStage('Quality', [
  { name: 'Lint', command: 'npm run lint' },
  { name: 'Type Check', command: 'npm run type-check' },
  { name: 'Security Audit', command: 'npm audit' },
]);

ci.stage('Test', [
  { name: 'Unit Tests', command: 'npm test' },
  { name: 'Integration Tests', command: 'npm run test:integration' },
]);

ci.stage('Build', [
  { name: 'Build Production', command: 'npm run build' },
  { name: 'Generate Docs', command: 'npm run docs' },
]);

ci.stage('Deploy', [
  { name: 'Deploy to Staging', command: 'npm run deploy:staging' },
]);

await ci.run();
