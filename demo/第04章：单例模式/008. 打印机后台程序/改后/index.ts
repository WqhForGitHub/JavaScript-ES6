class PrintSpooler {
  private static instance: PrintSpooler;
  jobs: string[] = [];

  private constructor() { }
  static getInstance(): PrintSpooler {
    if (!PrintSpooler.instance) PrintSpooler.instance = new PrintSpooler();
    return PrintSpooler.instance;
  }

  addJob(job: string) { this.jobs.push(job); }
  printAll() { console.log('Printing:', this.jobs); }
}

PrintSpooler.getInstance().addJob('doc1.pdf');
PrintSpooler.getInstance().addJob('doc2.pdf');
PrintSpooler.getInstance().printAll(); // 统一调度 ✅

export { }