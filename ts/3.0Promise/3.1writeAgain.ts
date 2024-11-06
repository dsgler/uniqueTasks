export {};
interface thenable {
  then: (onRs: (value: any) => void, onRj: (reason: any) => void) => any;
}

type PromiseCallbackType = (
  // 这里的resolve会返回本身
  resolve: (value: any) => myPromise2,
  reject: (reason: any) => myPromise2
) => any;

class myPromise2 implements thenable {
  static statusType: {
    pending: number;
    rs: number;
    rj: number;
  } = { pending: 0, rs: 1, rj: 2 };
  status: number;
  value: any;
  reason: any;
  // 里面存的全是开箱即用的函数，自动获取状态和值
  callbacks: Function[];
  isValueSolved: boolean;

  constructor(callback: PromiseCallbackType) {
    this.status = myPromise2.statusType.pending;
    this.resolve = this.resolve.bind(this);
    this.reject = this.reject.bind(this);
    this.isValueSolved = false;
    this.callbacks=[];

    // 在浏览器里是怎么做的
    if (typeof callback !== "function") {
      throw "请提供函数！";
    }

    try {
      callback(this.resolve, this.reject);
    } catch (e) {
      this.reject(e);
    }
  }

  resolve(data: any): myPromise2 {
    if (this.status !== myPromise2.statusType.pending) return this;

    // 解决resolve可能是promise的情况
    if (this.isValueSolved) {
      this.value = data;
      this.status = myPromise2.statusType.rs;
    } else {
      myPromise2.resolvePromise(this, data);
    }

    for (let fn of this.callbacks) {
      fn();
    }
    return this;
  }

  reject(reason: any): myPromise2 {
    if (this.status !== myPromise2.statusType.pending) return this;
    this.reason = reason;
    this.status = myPromise2.statusType.rj;
    for (let fn of this.callbacks) {
      fn();
    }
    return this;
  }

  then(onRs: Function, onRj: Function) {
    onRs = typeof onRs === "function" ? onRs : (value: any) => value;
    onRj =
      typeof onRs === "function"
        ? onRj
        : (err: any) => {
            throw err;
          };

    let thenPromise = new myPromise2(myPromise2.doNothing);
    if (this.status === myPromise2.statusType.rs) {
      setTimeout(() => {
        try {
          let result = onRs(this.value);
          //   myPromise2.resolvePromise(thenPromise, result);
          thenPromise.resolve(result);
        } catch (e) {
          thenPromise.reject(e);
        }
      }, 0);
    } else if (this.status === myPromise2.statusType.rj) {
      setTimeout(() => {
        try {
          let result = onRj(this.reason);
          //   myPromise2.resolvePromise(thenPromise, result);
          thenPromise.resolve(result);
        } catch (e) {
          thenPromise.reject(e);
        }
      }, 0);
    } else {
      this.callbacks.push(() => {
        if (this.status === myPromise2.statusType.rs) {
          setTimeout(() => {
            try {
              let result = onRs(this.value);
              //   myPromise2.resolvePromise(thenPromise, result);
              thenPromise.resolve(result);
            } catch (e) {
              thenPromise.reject(e);
            }
          }, 0);
        }
      });

      this.callbacks.push(() => {
        if (this.status === myPromise2.statusType.rj) {
          setTimeout(() => {
            try {
              let result = onRj(this.reason);
              //   myPromise2.resolvePromise(thenPromise, result);
              thenPromise.resolve(result);
            } catch (e) {
              thenPromise.reject(e);
            }
          }, 0);
        }
      });
    }
  }

  static doNothing() {}

  static resolvePromise(superPromise: myPromise2, valueX: any) {
    if (superPromise.status !== myPromise2.statusType.pending) return;
    if (superPromise === valueX) {
      return superPromise.reject(
        new TypeError("Chaining cycle detected for promise #<Promise>")
      );
    }

    let isCalled = false;

    if (
      (typeof valueX === "object" && valueX != null) ||
      typeof valueX === "function"
    ) {
      try {
        let then = (<thenable>valueX).then;
        if (typeof then === "function") {
          try {
            then.call(
              valueX,
              (valueY: any) => {
                if (isCalled) return;
                isCalled = true;
                myPromise2.resolvePromise(superPromise, valueY);
              },
              (err: any) => {
                if (isCalled) return;
                isCalled = true;
                superPromise.reject(err);
              }
            );
          } catch (e) {
            superPromise.reject(e);
          }
        } else {
          superPromise.resolve(valueX);
        }
      } catch (e) {
        if (isCalled) return;
        isCalled = true;
        superPromise.reject(e);
      }
    } else {
      try {
        superPromise.resolve(valueX);
      } catch (e) {
        superPromise.reject(e);
      }
    }
  }

  static deferred(){
    let promise=new myPromise2(myPromise2.doNothing);
    return {
        promise:promise,
        resolve:promise.resolve,
        reject:promise.reject
    }
  }
}

module.exports = myPromise2;

