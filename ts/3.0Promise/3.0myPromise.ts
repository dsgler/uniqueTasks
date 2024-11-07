type myPromiseStatus = "pending" | "fulfilled" | "rejected";

type thenCallback = (
  resolve: (value: any) => myPromise,
  reject: (reason: any) => any
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

type onResolvedCallback = (data?: any) => any;
type onRejectedCallback = (reason?: any) => any;

class myPromise implements thenable {
  status: myPromiseStatus;
  value: any;
  reason: any;
  onResolvedCallbacks: onResolvedCallback[];
  onRejectedCallbacks: onRejectedCallback[];
  constructor(callback: thenCallback) {
    this.status = "pending";
    this.onResolvedCallbacks = [];
    this.onRejectedCallbacks = [];
    this.resolve = this.resolve.bind(this);
    this.reject = this.reject.bind(this);

    try {
      callback((value) => {
        myPromise.resolvePromise(this, value, this.resolve, this.reject);
        return this;
      }, this.reject);
    } catch (e) {
      this.reject(e);
    }
  }

  resolve(value: any): myPromise {
    if (this.status !== "pending") return this;
    this.value = value;
    this.status = "fulfilled";
    // value在func函数里自己会通过this获取，不需要传递
    this.onResolvedCallbacks.forEach((func) => func());
    return this;
  }

  reject(reason: any) {
    if (this.status !== "pending") return;
    this.reason = reason;
    this.status = "rejected";
    this.onRejectedCallbacks.forEach((func) => func());
  }

  then(
    onFulfilled?: onResolvedCallback,
    onRejected?: onRejectedCallback
  ): myPromise {
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
    let newPromise: myPromise = new myPromise((resolve, reject) => {
      if (this.status === "fulfilled") {
        setTimeout(() => {
          try {
            let result: any = onFulfilled(this.value);
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
              let result: any = onFulfilled(this.value);
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

  // then的语法糖
  catch(onRejected: (reason: any) => any) {
    return this.then(undefined, onRejected);
  }

  /**
   * @describe 递归解决then的返回值的多种可能
   * @param valueX 可能是thenable,那么就递归解决; 直接值，就包装后返回
   * @returns
   */
  static resolvePromise(
    superPromise: myPromise,
    valueX: any,
    superResolve: (value: any) => myPromise,
    superReject: (reason: any) => any
  ) {
    // 父过程都结束了还要子Promise干嘛
    if (superPromise.status !== "pending") return;
    if (superPromise === valueX) {
      return superReject(
        new TypeError("Chaining cycle detected for promise #<Promise>")
      );
    }
    //你这个thenable又不一定又状态，为什么只能调用一次
    let isCalled = false;

    // 只要返回的时obj或者是func就默认是promise了
    // 这合理吗？ 要是我就想返回一个obj怎么办
    // 有then但then不是函数就正常返回，没then就报错？
    // 什么promise怪谈
    if (
      (typeof valueX === "object" && valueX != null) ||
      typeof valueX === "function"
    ) {
      try {
        let then = (<thenable>valueX).then;
        if (typeof then === "function") {
          then.call(
            valueX,
            (valueY: any) => {
              if (isCalled) return;
              isCalled = true;
              myPromise.resolvePromise(
                superPromise,
                valueY,
                superResolve,
                superReject
              );
            },
            (err: any) => {
              if (isCalled) return;
              isCalled = true;
              superReject(err);
            }
          );
        } else {
          superResolve(valueX);
        }
      } catch (e) {
        if (isCalled) return;
        isCalled = true;
        superReject(e);
      }
    } else {
      try {
        superResolve(valueX);
      } catch (e) {
        superReject(e);
      }
    }
  }

  static resolve(value?) {
    if (value instanceof myPromise) {
      return value;
    }

    if (value && value.then && typeof value.then === "function") {
      return new myPromise((resolve, reject) => {
        setTimeout(() => {
          value.then(resolve, reject);
        }, 0);
      });
    }

    return new myPromise((resolve) => resolve(value));
  }

  static reject(reason) {
    return new myPromise((resolve, reject) => reject(reason));
  }

  finally(callback: Function) {
    return this.then(
      (value) => {
        return Promise.resolve(callback()).then(() => value);
      },
      (err) => {
        return Promise.resolve(callback()).then(() => {
          throw err;
        });
      }
    );
  }

  static all(promises) {
    return new myPromise((resolve, reject) => {
      let ret: any[] = [];
      let total_size = promises.length;
      let finished = 0;
      if (total_size === 0) {
        resolve(ret);
      }

      for (let promise of promises) {
        promise = myPromise.resolve(promise);
        ret.push(promise);
      }

      for (let promise of ret) {
        promise.then(
          () => {
            finished++;
            if (finished === total_size) {
              resolve(ret);
            }
          },
          () => {
            reject(ret);
          }
        );
      }
    });
  }

  static race(promises) {
    return new myPromise((resolve, reject) => {
      for (let promise of promises) {
        promise = myPromise.resolve(promise);
        promise.then(
          (data) => {
            resolve(data);
            return;
          },
          (err) => {
            reject(err);
            return;
          }
        );
      }
    });
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

// module.exports = myPromise;

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

// let a=new myPromise((rs,rj)=>{
//     rs(new myPromise((rs2,rj2)=>{
//         setTimeout(()=>{rs2(1)},10)
//     }))
// }).then((data)=>{console.log(data)})

/* -------------------------------------------------------------- */

type CallbackType = (error: any, data: any) => void;

//基于回调的函数：最后一个参数传入回调
type BaseOnCallbackFunction = (...args: [...any[], CallbackType]) => any;

// baseOnCallback(...args, (error, result) => {}); //示例

//基于promise的函数:
type BaseOnPromiseFunction = (...args: any[]) => Promise<any>;

// baseOnPromise(...args).then(
//     (value) => {},
//     (reason) => {}
// ); //示例

//promisify函数接收一个基于回调的函数，返回一个基于Promise的函数
type PromisifyType = (fn: BaseOnCallbackFunction) => BaseOnPromiseFunction;

// const baseOnPromise = promisify(baseOnCallback); //示例

// 整个回调函数出来测试一下效果
import ajax from "ajax-for-node";

function baseOnCallback(url: string, callback: CallbackType) {
  ajax({
    url,
    method: "GET",
    success: (result, status, xhr) => {
      callback(null, result);
    },
    error: (xhr, status, error) => {
      callback({ xhr, status, error }, null);
    },
  });
}

baseOnCallback("https://www.baidu.com", (err, data) => {
  if (err) {
    console.log(err);
  } else {
    console.log(data);
  }
});

function promisify(baseOnCallback: Function): Function {
  let resolve, reject;
  let promise = new myPromise((rs, rj) => {
    resolve = rs;
    reject = rj;
  });

  return (...args) => {
    args.push((err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
    baseOnCallback.apply(null, args);
    return promise;
  };
}

const baseOnPromise: Function = promisify(baseOnCallback);
baseOnPromise("https://www.baidu.com").then(
  (value) => {
    console.log(value);
  },
  (reason) => {
    console.log(reason);
  }
);
