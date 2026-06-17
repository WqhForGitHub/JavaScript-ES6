// 199. 事件委托实现

const list = {
  onClick(event) {
    if (event.target.type === "item")
      console.log("click item", event.target.id);
  },
};
list.onClick({ target: { type: "item", id: 2 } });
