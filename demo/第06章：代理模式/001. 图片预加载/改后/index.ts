// 改后：虚拟代理 -- 先显示占位图，大图下载完成后再替换，用户不再面对空白
interface Image {
  display(): void;
}

class RealImage implements Image {
  constructor(private src: string) {
    console.log(`下载大图 ${src}（模拟耗时 2 秒）...`);
  }

  display() {
    console.log(`显示真实图片: ${this.src}`);
  }
}

class ProxyImage implements Image {
  private realImage: RealImage | null = null;

  constructor(private src: string) {}

  display() {
    // 先给用户看占位图，体验丝滑
    if (!this.realImage) {
      console.log('先显示占位图 loading.gif');
      this.realImage = new RealImage(this.src); // 此刻才真正下载
    }
    this.realImage.display();
  }
}

const image = new ProxyImage('banner.png');
image.display(); // 占位图 -> 下载 -> 显示真实图片
image.display(); // 已下载，直接显示

export {};
