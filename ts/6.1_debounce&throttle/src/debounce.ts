export namespace lodash {
  type debounceOptions = {
    leading?: boolean;
    maxWait?: number;
    trailing?: boolean;
  };

  interface debouncedFunction {
    (...args: any[]): any;
    cancel?: Function;
    flush?: Function;
  }

  export class _ {
    static debounce(
      func: Function,
      wait: number = 0,
      options: debounceOptions = {}
    ) {
      if (typeof options.leading !== "boolean") {
        options.leading = false;
      }
      if (typeof options.trailing !== "boolean") {
        options.trailing = true;
      }
      if (wait < 0) {
        throw Error("wait时间必须大于0");
      }
      if (typeof options.maxWait !== "number" || options.maxWait < wait) {
        options.maxWait = undefined;
      }

      let ID_setTimeout: number | undefined = undefined;
      let isCalledMoreThanOnce = false;
      let ID_MAXsetTimeout: number | undefined = undefined;

      let f: debouncedFunction = (...args: any[]) => {
        if (
          typeof options.maxWait === "number" &&
          ID_MAXsetTimeout === undefined
        ) {
          ID_MAXsetTimeout = <number>(<unknown>setTimeout(() => {
            if (options.trailing) {
              func(...args);
            }
            clearTimeout(ID_setTimeout);
            ID_setTimeout = undefined;
            ID_MAXsetTimeout = undefined;
          }, options.maxWait));
        }

        console.log("调用 " + Date.now());
        if (ID_setTimeout !== undefined) {
          clearTimeout(ID_setTimeout);
          isCalledMoreThanOnce = true;
        } else {
          if (options.leading) {
            // console.log("leading " + Date.now());

            func(...args);
          }
        }

        ID_setTimeout = <number>(<unknown>setTimeout(() => {
          if (options.trailing) {
            if (options.leading === false || isCalledMoreThanOnce) {
              func(...args);
            }
          }
          if (ID_MAXsetTimeout !== undefined) {
            clearTimeout(ID_MAXsetTimeout);
            ID_MAXsetTimeout = undefined;
          }
          ID_setTimeout = undefined;
          isCalledMoreThanOnce = false;
          // console.log("tail " + Date.now());
        }, wait));
      };

      f.cancel = () => {
        if (ID_setTimeout) {
          clearTimeout(ID_setTimeout);
          ID_setTimeout = undefined;
        }

        if (ID_MAXsetTimeout) {
          clearTimeout(ID_MAXsetTimeout);
          ID_MAXsetTimeout = undefined;
        }
      };

      f.flush = (...args: any[]) => {
        // (<any>f).cancel();
        func(...args);
      };

      return f;
    }

    static throttle(func: Function, maxWait: number, options: debounceOptions) {
      return this.debounce(func, maxWait, {
        leading: options.leading,
        trailing: options.trailing,
        maxWait: maxWait,
      });
    }
  }
}
