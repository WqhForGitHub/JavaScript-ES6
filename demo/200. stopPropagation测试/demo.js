// 200. stopPropagation测试

const event = {
  stopped: false,
  stopPropagation() {
    this.stopped = true;
  },
};
function child(e) {
  console.log("child");
  e.stopPropagation();
}
function parent() {
  console.log("parent");
}
child(event);
if (!event.stopped) parent();
