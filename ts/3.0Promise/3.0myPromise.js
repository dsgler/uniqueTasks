let thenable = {
    then: function (resolve, reject) {
        setTimeout(() => {
            resolve(42);
            console.log("time resolve");
        }, 1000);
    },
};
class myPromise {
    constructor(callback) {
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
        }
        catch (e) {
            this.reject(e);
        }
    }
    resolve(value) {
        if (this.status !== "pending")
            return this;
        this.value = value;
        this.status = "fulfilled";
        // value在func函数里自己会通过this获取，不需要传递
        this.onResolvedCallbacks.forEach((func) => func());
        return this;
    }
    reject(reason) {
        if (this.status !== "pending")
            return;
        this.reason = reason;
        this.status = "rejected";
        this.onRejectedCallbacks.forEach((func) => func());
    }
    then(onFulfilled, onRejected) {
        // 当不是函数时，保持原来的value
        onFulfilled =
            typeof onFulfilled === "function" ? onFulfilled : (value) => value;
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
                    }
                    catch (e) {
                        reject(e);
                    }
                }, 0);
            }
            else if (this.status === "rejected") {
                setTimeout(() => {
                    try {
                        let reason = onRejected(this.reason);
                        myPromise.resolvePromise(newPromise, reason, resolve, reject);
                    }
                    catch (e) {
                        reject(e);
                    }
                }, 0);
            }
            else {
                this.onResolvedCallbacks.push(() => {
                    setTimeout(() => {
                        try {
                            // this指向当前的promise，所以执行时不需要传入value
                            let result = onFulfilled(this.value);
                            myPromise.resolvePromise(newPromise, result, resolve, reject);
                        }
                        catch (e) {
                            reject(e);
                        }
                    }, 0);
                });
                this.onRejectedCallbacks.push(() => {
                    setTimeout(() => {
                        try {
                            let result = onRejected(this.reason);
                            myPromise.resolvePromise(newPromise, result, resolve, reject);
                        }
                        catch (e) {
                            reject(e);
                        }
                    }, 0);
                });
            }
        });
        return newPromise;
    }
    // then的语法糖
    catch(onRejected) {
        return this.then(undefined, onRejected);
    }
    /**
     * @describe 递归解决then的返回值的多种可能
     * @param valueX 可能是thenable,那么就递归解决; 直接值，就包装后返回
     * @returns
     */
    static resolvePromise(superPromise, valueX, superResolve, superReject) {
        // 父过程都结束了还要子Promise干嘛
        if (superPromise.status !== "pending")
            return;
        if (superPromise === valueX) {
            return superReject(new TypeError("Chaining cycle detected for promise #<Promise>"));
        }
        //你这个thenable又不一定又状态，为什么只能调用一次
        let isCalled = false;
        // 只要返回的时obj或者是func就默认是promise了
        // 这合理吗？ 要是我就想返回一个obj怎么办
        // 有then但then不是函数就正常返回，没then就报错？
        // 什么promise怪谈
        if ((typeof valueX === "object" && valueX != null) ||
            typeof valueX === "function") {
            try {
                let then = valueX.then;
                if (typeof then === "function") {
                    then.call(valueX, (valueY) => {
                        if (isCalled)
                            return;
                        isCalled = true;
                        myPromise.resolvePromise(superPromise, valueY, superResolve, superReject);
                    }, (err) => {
                        if (isCalled)
                            return;
                        isCalled = true;
                        superReject(err);
                    });
                }
                else {
                    superResolve(valueX);
                }
            }
            catch (e) {
                if (isCalled)
                    return;
                isCalled = true;
                superReject(e);
            }
        }
        else {
            try {
                superResolve(valueX);
            }
            catch (e) {
                superReject(e);
            }
        }
    }
    static resolve(value) {
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
    finally(callback) {
        return this.then((value) => {
            return Promise.resolve(callback()).then(() => value);
        }, (err) => {
            return Promise.resolve(callback()).then(() => {
                throw err;
            });
        });
    }
    static all(promises) {
        return new myPromise((resolve, reject) => {
            let ret = [];
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
                promise.then(() => {
                    finished++;
                    if (finished === total_size) {
                        resolve(ret);
                    }
                }, () => {
                    reject(ret);
                });
            }
        });
    }
    static race(promises) {
        return new myPromise((resolve, reject) => {
            for (let promise of promises) {
                promise = myPromise.resolve(promise);
                promise.then((data) => {
                    resolve(data);
                    return;
                }, (err) => {
                    reject(err);
                    return;
                });
            }
        });
    }
    // 测试要求
    static deferred() {
        let ret = {};
        ret.promise = new myPromise((resolve, reject) => {
            ret.resolve = resolve;
            ret.reject = reject;
        });
        return ret;
    }
}


module.exports = myPromise;


// const baseOnPromise = promisify(baseOnCallback); //示例
// 整个回调函数出来测试一下效果
// import ajax from "ajax-for-node";
// function baseOnCallback(url, callback) {
//     ajax({
//         url,
//         method: "GET",
//         success: (result, status, xhr) => {
//             callback(null, result);
//         },
//         error: (xhr, status, error) => {
//             callback({ xhr, status, error }, null);
//         },
//     });
// }
// baseOnCallback("https://www.baidu.com", (err, data) => {
//     if (err) {
//         console.log(err);
//     }
//     else {
//         console.log(data);
//     }
// });
// function promisify(baseOnCallback) {
//     let resolve, reject;
//     let promise = new myPromise((rs, rj) => {
//         resolve = rs;
//         reject = rj;
//     });
//     return (...args) => {
//         args.push((err, data) => {
//             if (err) {
//                 reject(err);
//             }
//             else {
//                 resolve(data);
//             }
//         });
//         baseOnCallback.apply(null, args);
//         return promise;
//     };
// }
// const baseOnPromise = promisify(baseOnCallback);
// baseOnPromise("https://www.baidu.com").then((value) => {
//     console.log(value);
// }, (reason) => {
//     console.log(reason);
// });