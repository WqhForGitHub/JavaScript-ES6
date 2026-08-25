class FileSystem {
  constructor() { console.log('mounting file system...'); }
  read(path: string) { console.log('reading', path); }
}

const fs1 = new FileSystem(); // mounting...
const fs2 = new FileSystem(); // mounting again...

export { }