var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class rect {
    constructor(container, val, x, y) {
        this.container = container;
        this.myDiv = document.createElement("div");
        this.myDiv.classList.add("box");
        this.val = val;
        this.myDiv.innerHTML = String(val);
        this.setPosition(x || 0, y || 0);
        container.appendChild(this.myDiv);
    }
    setPosition(x, y) {
        this.x = x;
        this.y = y;
        this.myDiv.style.translate = `${x}px ${y}px`;
    }
    exchange(anotherRect) {
        let ax = anotherRect.x;
        let ay = anotherRect.y;
        let tx = this.x;
        let ty = this.y;
        this.setPosition(ax, ay);
        anotherRect.setPosition(tx, ty);
    }
    clear() {
        this.myDiv.remove();
    }
}
class Heap {
    cmpFlag(a, b) {
        return this.flag ? a.val > b.val : a.val < b.val;
    }
    sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
    // false代表小根堆，true代表大根堆
    constructor(arr, flag = false) {
        this.heapList = arr;
        this.heapLen = arr.length;
        this.flag = flag;
        for (let ele of arr) {
            ele.myDiv.classList.add("out-heap");
        }
        this.heapify();
    }
    // 用于交换
    swap(i, j) {
        return __awaiter(this, void 0, void 0, function* () {
            [this.heapList[i], this.heapList[j]] = [this.heapList[j], this.heapList[i]];
            this.heapList[i].exchange(this.heapList[j]);
            yield this.sleep(1200);
        });
    }
    // 用于堆初始化
    heapify() {
        return __awaiter(this, void 0, void 0, function* () {
            this.heapList[0].myDiv.classList.remove("out-heap");
            for (let process = 1; process < this.heapLen; process++) {
                let cur = this.heapList[process];
                cur.myDiv.classList.remove("out-heap");
                yield this.heapUp(process);
            }
        });
    }
    // 堆初始化的辅助函数，将新加入元素向上冒
    heapUp(i) {
        return __awaiter(this, void 0, void 0, function* () {
            if (i === 0) {
                return;
            }
            let father = Math.floor((i - 1) / 2);
            if (this.cmpFlag(this.heapList[i], this.heapList[father])) {
                yield this.swap(i, father);
                yield this.heapUp(father); // 使用 await 关键字
            }
        });
    }
    // 将堆元素一个个弹出实现排序，之后堆就无了
    heapSort() {
        return __awaiter(this, void 0, void 0, function* () {
            while (this.heapLen >= 2) {
                yield this.heapPop(); // 使用 await 关键字
            }
            this.heapList[0].myDiv.classList.add("out-heap");
            this.heapLen = 0;
        });
    }
    // 辅助函数，逻辑判断有点麻烦
    heapDown(i) {
        return __awaiter(this, void 0, void 0, function* () {
            let left = 2 * i + 1;
            let right = left + 1;
            if (left >= this.heapLen)
                left = -1;
            if (right >= this.heapLen)
                right = -1;
            let target = -1;
            if (left !== -1 && this.cmpFlag(this.heapList[left], this.heapList[i])) {
                if (right !== -1 &&
                    this.cmpFlag(this.heapList[right], this.heapList[left])) {
                    target = right;
                }
                else {
                    target = left;
                }
            }
            else if (right !== -1 &&
                this.cmpFlag(this.heapList[right], this.heapList[i])) {
                target = right;
            }
            if (target === -1)
                return;
            yield this.swap(i, target);
            yield this.heapDown(target); // 使用 await 关键字
        });
    }
    heapPop() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.heapLen <= 1) {
                this.heapLen = 0;
                return null;
            }
            let res = this.heapList[0];
            yield this.swap(this.heapLen - 1, 0);
            this.heapLen--;
            res.myDiv.classList.add("out-heap");
            yield this.heapDown(0); // 使用 await 关键字
            return res;
        });
    }
}
// let numArr=[1,2,3,4,5,6,7,8];
let numArr = Array.from({ length: 31 }, () => Math.round(Math.random() * 100));
let rect_width = 50;
let rect_height = 30;
let rect_margin_x = 350;
let rect_margin_y = 20;
let top_offset_x = 500;
let top_offset_y = 40;
const container = document.getElementById("main-cantainer");
function get_posi(num) {
    if (num < 0)
        return [-1, -1];
    let layer = 0;
    while (num > Math.pow(2, (layer + 1)) - 2)
        layer++;
    return [layer, num - (Math.pow(2, layer) - 1)];
}
let rectArr;
function make_rectArr() {
    rectArr = Array(numArr.length);
    let [max_layer] = get_posi(numArr.length - 1);
    function make_layer() {
        let max_layer_size = Math.pow(2, max_layer);
        let layer_x = Array(max_layer_size);
        // 计算均摊
        let gap = (2 * top_offset_x - max_layer_size * rect_width) / (max_layer_size - 1);
        layer_x[0] = 0;
        for (let i = 1; i < max_layer_size; i++) {
            layer_x[i] = layer_x[i - 1] + rect_width + gap;
        }
        // 最后一层的构建
        let y = top_offset_y + max_layer * (rect_height + rect_margin_y);
        let layer = max_layer;
        let start_i = Math.pow(2, layer) - 1;
        for (let i = start_i; numArr[i] != null; i++) {
            rectArr[i] = new rect(container, numArr[i], layer_x[i - start_i], y);
        }
        // 由下向上构建
        for (; layer >= 1; layer--) {
            let start_i = Math.pow(2, layer) - 1;
            let layer_size = Math.pow(2, layer);
            y = top_offset_y + (layer - 1) * (rect_height + rect_margin_y);
            for (let i = 0; i < layer_size; i += 2) {
                let father = Math.floor((start_i + i - 1) / 2);
                let father_x = (layer_x[i] + layer_x[i + 1]) / 2;
                layer_x[i / 2] = father_x;
                rectArr[father] = new rect(container, numArr[father], father_x, y);
            }
        }
    }
    make_layer();
}
function clear_rectArr() {
    if (rectArr == null)
        return;
    while (rectArr.length > 0) {
        rectArr.pop().clear();
    }
}
let heap_instance;
const arrtext = document.getElementById("arr-text");
arrtext.value = String("[" + numArr + "]");
function set_arr_and_init() {
    try {
        numArr = JSON.parse(arrtext.value);
    }
    catch (e) {
        alert("输入非法，开始随机");
        numArr = Array.from({ length: 31 }, () => Math.round(Math.random() * 100));
        arrtext.value = String("[" + numArr + "]");
    }
    clear_rectArr();
    make_rectArr();
    heap_instance = new Heap(rectArr);
}
set_arr_and_init();
