class MyPromise {
    constructor(executor) {
      this.state = 'pending'; // 初始状态为 pending
      this.value = undefined; // 成功的结果值
      this.handlers = []; // 成功回调队列
  
      try {
        executor(this._resolve, this._reject);
      } catch (err) {
        this._reject(err);
      }
    }
  
    _resolve = (value) => {
      // 如果不是 pending 状态，忽略
      if (this.state !== 'pending') return;
  
      // 模拟真实的 Promise 行为，使用 setTimeout 来异步执行
      setTimeout(() => {
        if (value instanceof MyPromise) {
          return value.then(this._resolve, this._reject);
        }
  
        this.state = 'fulfilled'; // 状态变为 fulfilled
        this.value = value;
  
        // 执行所有的成功回调
        this.handlers.forEach((h) => this._handle(h));
      });
    };
  
    _reject = (error) => {
      if (this.state !== 'pending') return;
  
      this.state = 'rejected'; // 状态变为 rejected
      this.value = error;
  
      // 执行所有的失败回调
      this.handlers.forEach((h) => this._handle(h));
    };
  
    _handle(handler) {
      if (this.state === 'pending') {
        // 如果当前状态是 pending，将回调加入队列
        this.handlers.push(handler);
      } else {
        // 否则立即执行回调
        if (this.state === 'fulfilled' && typeof handler.onFulfilled === 'function') {
          handler.onFulfilled(this.value);
        }
        if (this.state === 'rejected' && typeof handler.onRejected === 'function') {
          handler.onRejected(this.value);
        }
      }
    }
  
    then(onFulfilled, onRejected) {
      return new MyPromise((resolve, reject) => {
        this._handle({
          onFulfilled: value => {
            // 提供默认处理函数
            if (!onFulfilled) {
              resolve(value);
            } else {
              try {
                resolve(onFulfilled(value));
              } catch (err) {
                reject(err);
              }
            }
          },
          onRejected: error => {
            if (!onRejected) {
              reject(error);
            } else {
              try {
                resolve(onRejected(error));
              } catch (err) {
                reject(err);
              }
            }
          }
        });
      });
    }
  
    catch(onRejected) {
      return this.then(null, onRejected);
    }
  }
  
  // 使用示例
  const asyncTask = () => new MyPromise((resolve, reject) => {
    setTimeout(() => {
      resolve('Operation completed!');
    }, 1000);
  });
  
  asyncTask()
    .then(result => console.log(result))
    .catch(error => console.error(error));