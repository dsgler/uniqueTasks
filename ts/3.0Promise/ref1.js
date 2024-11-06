const PENDING = "PENDING";
const FULFILLED = "FULFILLED";
const REJECTED = "REJECTED";

// 将 onFufilled 的返回值进行判断取值处理，把最后获得的普通值放入最外面那层的 Promise 的 resolve 函数中
const resolvePromise = (promise2, x, resolve, reject) => {
  // 自己等待自己完成是错误的实现，用一个循环引用的类型错误，结束掉 promise  Promise/A+ 2.3.1
  if (promise2 === x) {
    return reject(
      new TypeError("Chaining cycle detected for promise #<Promise>")
    );
  }
  // 只能调用一次，为了判断resolve过的就不用再reject了，（比如有reject和resolve的时候）Promise/A+ 2.3.3.3.3
  let called;
  // 如果 x 不是null，是对象或者方法
  if ((typeof x === "object" && x != null) || typeof x === "function") {
    try {
      // 这个首先存储对 x.then 的引用，然后测试该引用
      let then = x.then;
      if (typeof then === "function") {
        // 那我们就认为他是promise,call他,因为then方法中的this来自自己的promise对象
        // 不要写成 x.then，直接 then.call 就可以了 因为 x.then 会再次取值，Object.defineProperty  Promise/A+ 2.3.3.3
        // 第一个参数是将x这个promise方法作为this指向，后两个参数分别为成功失败回调
        then.call(
          x,
          (y) => {
            // 根据 promise 的状态决定是成功还是失败
            if (called) return;
            called = true;
            // 递归解析的过程（因为可能 promise 中还有 promise） Promise/A+ 2.3.3.3.1
            resolvePromise(promise2, y, resolve, reject);
          },
          (r) => {
            // 只要失败就失败 Promise/A+ 2.3.3.3.2
            if (called) return;
            called = true;
            reject(r);
          }
        );
      } else {
        // 如果 x.then 是个普通值就直接返回 resolve 作为结果  Promise/A+ 2.3.3.4
        resolve(x);
      }
    } catch (e) {
      // Promise/A+ 2.3.3.2
      if (called) return;
      called = true;
      reject(e);
    }
  } else {
    // 如果 x 是个普通值就直接返回 resolve 作为结果  Promise/A+ 2.3.4
    resolve(x);
  }
};

class Promise {
  constructor(executor) {
    this.status = PENDING;   
    this.value = undefined;
    this.reason = undefined;
    this.onResolvedCallbacks = [];
    this.onRejectedCallbacks = [];

    let resolve = (value) => {
      if (this.status === PENDING) {
        this.status = FULFILLED;
        this.value = value;
        this.onResolvedCallbacks.forEach((fn) => fn());
      }
    };

    let reject = (reason) => {
      if (this.status === PENDING) {
        this.status = REJECTED;
        this.reason = reason;
        this.onRejectedCallbacks.forEach((fn) => fn());
      }
    };

    try {
      executor(resolve, reject);
    } catch (error) {
      reject(error);
    }
  }

  then(onFulfilled, onRejected) {
    //解决 onFufilled，onRejected 没有传值的问题
    //Promise/A+ 2.2.1 / Promise/A+ 2.2.5 / Promise/A+ 2.2.7.3 / Promise/A+ 2.2.7.4
    onFulfilled = typeof onFulfilled === "function" ? onFulfilled : (v) => v;
    //因为错误的值要让后面访问到，所以这里也要抛出个错误，不然会在之后 then 的 resolve 中捕获
    onRejected =
      typeof onRejected === "function"
        ? onRejected
        : (err) => {
            throw err;
          };
    // 每次调用 then 都返回一个新的 promise  Promise/A+ 2.2.7
    // 使用箭头函数，让this指向了原promise
    let promise2 = new Promise((resolve, reject) => {
      if (this.status === FULFILLED) {
        //Promise/A+ 2.2.2
        //Promise/A+ 2.2.4 --- setTimeout 宏任务模拟异步
        setTimeout(() => {
          try {
            //Promise/A+ 2.2.7.1
            // 因为有的时候需要判断then中的方法是否返回一个promise对象，所以需要判断
            // 如果返回值为promise对象，则需要取出结果当作promise2的resolve结果
            // 如果不是，直接作为promise2的resolve结果
            let x = onFulfilled(this.value);
            // x可能是一个proimise
            // 抽离出一个公共方法来判断他们是否为promise对象
            resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            //Promise/A+ 2.2.7.2
            reject(e);
          }
        }, 0);
      }

      if (this.status === REJECTED) {
        //Promise/A+ 2.2.3
        setTimeout(() => {
          try {
            let x = onRejected(this.reason);
            resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        }, 0);
      }

      if (this.status === PENDING) {
        this.onResolvedCallbacks.push(() => {
          setTimeout(() => {
            try {
              let x = onFulfilled(this.value);
              resolvePromise(promise2, x, resolve, reject);
            } catch (e) {
              reject(e);
            }
          }, 0);
        });

        this.onRejectedCallbacks.push(() => {
          setTimeout(() => {
            try {
              let x = onRejected(this.reason);
              resolvePromise(promise2, x, resolve, reject);
            } catch (e) {
              reject(e);
            }
          }, 0);
        });
      }
    });

    return promise2;
  }

  static deferred() {
    let ret= {};
    ret.promise = new Promise((resolve, reject) => {
      ret.resolve = resolve;
      ret.reject = reject;
    });
    return ret;
  }
}

module.exports = Promise;


let thenable = {
  then: function (resolve, reject) {
    setTimeout(() => {
      resolve(42);
      console.log("time resolve");
    }, 1000);
  },
};

// let aaa=Promise.resolve(thenable);
let aaa=new Promise((resolve)=>resolve(666))
aaa=aaa.then((data)=>{
  console.log(data);
  return new Promise((resolve)=>{
    debugger;
    setTimeout(()=>{debugger;resolve("inner")},2000)
  })
})
aaa.then((data)=>{
  console.log(data)
})