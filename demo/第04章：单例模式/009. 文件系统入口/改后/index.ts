class FileSystem {
  private static instance: FileSystem;

  private constructor() { console.log('mounting file system... (once)'); }
  static getInstance(): FileSystem {
    if (!FileSystem.instance) FileSystem.instance = new FileSystem();
    return FileSystem.instance;
  }

  read(path: string) { console.log('reading', path); }
}

FileSystem.getInstance().read('/etc/hosts');
FileSystem.getInstance().read('/var/log/syslog'); // 不会再 mount

export { }