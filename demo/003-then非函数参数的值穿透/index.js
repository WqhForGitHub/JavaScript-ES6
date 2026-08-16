Promise.resolve("A").then("B").then(Promise.resolve("C")).then(console.log);
