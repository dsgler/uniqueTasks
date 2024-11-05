type myPromiseStatus = "pending" | "fulfilled" | "rejected";

type CallbackType = (
  resolve: (value: any) => void,
  reject: (reason: any) => void
) => any;

interface thenable {
  then: (
    onFulfilled: (value: any) => void,
    onRejected: (reason: any) => void
  ) => any;
}

let thenable = {
  then: function (resolve, reject) {
    setTimeout(() => {
      resolve(42);
      console.log("time resolve");
    }, 1000);
  },
};

class myPromise implements thenable {
  status: myPromiseStatus;
  value: any;
  reason: any;
  onResolvedCallbacks: Function[];
  onRejectedCallbacks: Function[];
  constructor(callback: CallbackType) {
    this.status = "pending";
    this.onResolvedCallbacks = [];
    this.onRejectedCallbacks = [];
    this.resolve = this.resolve.bind(this);
    this.reject = this.reject.bind(this);

    try {
      callback(this.resolve, this.reject);
    } catch (e) {
      this.reject(e);
    }
  }

  resolve(value: any) {
    if (this.status !== "pending") return;
    this.value = value;
    this.status = "fulfilled";
    // value在func函数里自己会通过this获取，不需要传递
    this.onResolvedCallbacks.forEach((func) => func());
  }

  reject(reason: any) {
    if (this.status !== "pending") return;
    this.reason = reason;
    this.status = "rejected";
    this.onRejectedCallbacks.forEach((func) => func());
  }

  then(onFulfilled, onRejected?): myPromise {
    // 当不是函数时，保持原来的value
    onFulfilled =
      typeof onFulfilled === "function" ? onFulfilled : (value: any) => value;
    // 当不是函数时，保持原来的reason
    onRejected =
      typeof onRejected === "function"
        ? onRejected
        : (reason) => {
            throw reason;
          };

    // 这里的this是上一个promise
    let newPromise = new myPromise((resolve, reject) => {
      if (this.status === "fulfilled") {
        setTimeout(() => {
          try {
            let result = onFulfilled(this.value);
            myPromise.resolvePromise(newPromise, result, resolve, reject);
          } catch (e) {
            reject(e);
          }
        }, 0);
      } else if (this.status === "rejected") {
        setTimeout(() => {
          try {
            let reason = onRejected(this.reason);
            myPromise.resolvePromise(newPromise, reason, resolve, reject);
          } catch (e) {
            reject(e);
          }
        }, 0);
      } else {
        this.onResolvedCallbacks.push(() => {
          setTimeout(() => {
            try {
              // this指向当前的promise，所以执行时不需要传入value
              let result = onFulfilled(this.value);
              myPromise.resolvePromise(newPromise, result, resolve, reject);
            } catch (e) {
              reject(e);
            }
          }, 0);
        });

        this.onRejectedCallbacks.push(() => {
          setTimeout(() => {
            try {
              let result = onRejected(this.reason);
              myPromise.resolvePromise(newPromise, result, resolve, reject);
            } catch (e) {
              reject(e);
            }
          }, 0);
        });
      }
    });

    return newPromise;
  }

  /**
   * @describe 递归解决then的返回值的多种可能
   * @param valueX 可能是thenable,那么就递归解决; 直接值，就包装后返回
   * @returns
   */
  static resolvePromise(
    superPromise: myPromise,
    valueX,
    superResolve,
    superReject
  ) {
    // 父过程都结束了还要子Promise干嘛
    if (superPromise.status!=="pending") return;
    if (superPromise === valueX) {
      return superReject(
        new TypeError("Chaining cycle detected for promise #<Promise>")
      );
    }

  // 只要返回的时obj或者是func就默认是promise了
  // 这合理吗？ 要是我就想返回一个obj怎么办
  // 有then但then不是函数就正常返回，没then就报错？
  // 什么promise怪谈
  let isCalled=false;
  if ((typeof valueX === "object" && valueX != null) || typeof valueX === "function") {
    try{
      let then=(<thenable>valueX).then;
      if (typeof then==="function"){
        then.call(valueX,(valueY)=>{
          if (isCalled) return;
          isCalled=true;
          myPromise.resolvePromise(superPromise,valueY,superResolve,superReject)
        },(err)=>{
          superReject(err);
        })
      }else{
        superResolve(valueX);
      }
    }catch(e){
      superReject(e);
    }
  }else{
    try{
      superResolve(valueX);
    }catch(e){
      superReject(e);
    }
  }


  }

  static resolve(value?) {
    if (value instanceof myPromise) {
      return value;
    }

    if (typeof value.then === "function") {
      return new myPromise(value.then);
    }

    return new myPromise((resolve) => resolve(value));
  }

  static reject(reason) {
    return new myPromise((resolve, reject) => reject(reason));
  }

  // 测试要求
  static deferred() {
    let ret: any = {};
    ret.promise = new myPromise((resolve, reject) => {
      ret.resolve = resolve;
      ret.reject = reject;
    });
    return ret;
  }
}

module.exports = myPromise;

// let aaa = myPromise.resolve(thenable);
// aaa = aaa.then((data) => {
//   console.log(data);
//   return new myPromise((resolve) => {
//     setTimeout(() => {
//       resolve("inner");
//     }, 2000);
//   });
// });
// aaa = aaa.then((data) => {
//   console.log(data);
//   return thenable;
// });
// aaa.then((data) => {
//   console.log(data);
// });
