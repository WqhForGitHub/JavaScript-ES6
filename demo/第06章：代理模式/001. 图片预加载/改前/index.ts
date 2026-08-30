// 改前：直接加载大图，下载完成前用户只能看到一片空白
class ImageLoader {
  private src: string;

  constructor(src: string) {
    console.log(`开始下载大图 ${src}（模拟耗时 2 秒）...`);
    // 下载期间界面空白，用户体验差
    this.src = src;
  }

  display() {
    console.log(`显示图片: ${this.src}`);
  }
}

// 用户一打开页面就要干等大图下载
const image = new ImageLoader('banner.png');
image.display();

// 再次显示同一张图，又会重新下载
const image2 = new ImageLoader('banner.png');
image2.display();

export {};
