class PrintSpooler {
  jobs: string[] = [];
  addJob(job: string) { this.jobs.push(job); }
}

const spooler1 = new PrintSpooler();
spooler1.addJob('doc1.pdf');
const spooler2 = new PrintSpooler();
spooler2.addJob('doc2.pdf');
// 两个 spooler 各自打印，顺序混乱