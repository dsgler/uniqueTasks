async function async1() {
  console.log("1");
  await async2();// 3
  console.log("2");
}
async function async2() {
  console.log("3");
}
console.log("4");
setTimeout(() => {
  console.log("5");
}, 0);
async1();
new Promise(function (reslove) {
  console.log("6");
  reslove();
}).then(function () {
  console.log("7");
});
console.log("8");
