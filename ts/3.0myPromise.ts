type myPromiseStatus = "pending" | "fulfilled" | "rejected";

type CallbackType = (
  resolve: (value: any) => void,
  reject: (reason: any) => void
) => any;

interface thenable {
  then: (resolve: (value: any) => void, reject: (reason: any) => void) => any;
}

let thenable = {
  then: function (resolve, reject) {
    setTimeout(() => { resolve(42);console.log("time resolve") }, 1000);
  },
};

class myPromise {
  private status: myPromiseStatus;
  private resolveDate: any;
  private rejectDate: any;

  constructor(callback?: CallbackType) {
    this.status = "pending";
    this.resolve = this.resolve.bind(this);
    this.reject = this.reject.bind(this);
    this.resolveDate = null;
    this.rejectDate = null;
    callback && callback(this.resolve, this.reject);
  }

  static resolve(value?: unknown): myPromise {
    if (value instanceof myPromise) {
      return value;
    }

    let ret: myPromise = new myPromise();

    if (value && typeof value === "object" && "then" in <thenable>value) {
      ret.status = "pending";
      (<thenable>value).then(ret.resolve, ret.reject);
      return ret;
    }

    ret.status = "fulfilled";
    ret.resolveDate = value;
    ret.rejectDate = null;
    return ret;
  }

  static reject(reason: any): myPromise {
    let ret: myPromise = new myPromise();
    ret.status = "rejected";
    ret.rejectDate = reason;
    return ret;
  }

  then(
    then_resolve_func: (data: any) => any,
    then_reject_func?: (reason: any) => any
  ): myPromise {
    if (this.status === "fulfilled") {
      let ret;
      if (then_resolve_func instanceof Function) {
        ret = then_resolve_func(this.resolveDate);
      }
      if (ret instanceof myPromise) return ret;
      return myPromise.resolve(ret);
    } else if (this.status === "rejected") {
      if (then_reject_func instanceof Function) {
        then_reject_func(this.rejectDate);
      }
      return myPromise.reject(this.rejectDate);
    } else {
      this.then_resolve_func = then_resolve_func;
      this.then_reject_func = then_reject_func;
      return this;
    }
  }

  resolve(value?: any) {
    this.resolveDate = value;
    this.status = "fulfilled";
    if (this.then_resolve_func) {
      this.then_resolve_func(value);
    }
  }

  reject(reason?: any) {
    this.rejectDate = reason;
    this.status = "rejected";
    if (this.then_reject_func) {
      this.then_reject_func(reason);
    }
  }
}

let ppp = myPromise.resolve(thenable);
ppp = ppp.then((data) => {
  debugger;
  console.log(data);
  return 2;
});
ppp.then((data) => {
  debugger;
  console.log(data);
});