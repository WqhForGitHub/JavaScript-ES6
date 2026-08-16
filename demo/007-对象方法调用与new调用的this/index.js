var obj = {
  user: "yupi",
  print: function () {
    console.log(this.user);
  },
};
obj.print();
new obj.print();
