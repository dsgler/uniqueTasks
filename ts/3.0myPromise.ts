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
    this.value = value;
    this.status = "fulfilled";
    this.onResolvedCallbacks.forEach((func) => func());
  }

  reject(reason: any) {
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
        : (err) => {
            throw err;
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
            let result = onRejected(this.reason);
            myPromise.resolvePromise(newPromise, result, resolve, reject);
          } catch (e) {
            reject(e);
          }
        }, 0);
      } else {
        this.onResolvedCallbacks.push(() => {
          setTimeout(() => {
            try {
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
   * @param result 可能是thenable,那么就递归解决; 直接值，就包装后返回
   * @returns
   */
  static resolvePromise(
    superPromise: myPromise,
    result,
    superResolve,
    superReject
  ) {
    // 已经解决的不能再改变
    if (superPromise.status !== "pending") {
      return;
    }

    if (superPromise === result) {
      superReject(TypeError("不能等待自己"));
      return;
    }

    if (typeof result.then === "function") {
      try {
        (<thenable>result).then.call(result, superResolve, superReject);
      } catch (e) {
        superReject(e);
      }
    } else {
      superResolve(result);
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

  static deferred(){
    let ret:any={};
    ret.promise=new myPromise((resolve,reject)=>{
      ret.resolve=resolve;
      ret.reject=reject;
    })
    return ret;
  }
}

// export const deferred=myPromise.deferred;
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
