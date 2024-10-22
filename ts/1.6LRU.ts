// https://leetcode.cn/problems/lru-cache/
// 146. LRU 缓存
// 纯手搓 hash，时间击败 99.45%，空间没有多特别多
// 泪目，被自己感动到了

// life记录再 queue 中存在的次数
type arrNode={
    key: number;
    value:number;
    life:number;
};
// 这个类型用来记录 hashGet的返回值，auto需要index
type GetRes={
    node:(arrNode | null);
    index:number;
};
class LRUCache {
    //主hashmap，用于记录数据
    arr:(arrNode | null | undefined)[];
    // 用来记录操作,来确认删除旧的
    queue:number[];
    capacity:number;
    // 开大一倍减少碰撞
    doubleCapacity:number;
    size:number;
    constructor(capacity: number) {
        this.size=0;
        this.capacity=capacity;
        this.doubleCapacity=2*capacity;
        this.arr=Array(this.doubleCapacity);
        this.queue=[];
    }

    get(key: number): number {
        let {node:value,}=this.hashGet(key,true);
        if (value==null){
            return -1;
        }
        this.queue.push(key);
        this.autoKill();
        return value.value;
    }

    put(key: number, value: number): void {
        this.queue.push(key);
        this.hashSet(key,value);
        this.autoKill();
    }

    // 结合Life原理应该很明确了
    autoKill(){
        while (this.size>this.capacity){
            let cur=this.queue.shift();

            let {node:curNode,index:index}=this.hashGet(cur,false);

            if (curNode.life>0){
                curNode.life--;
                continue;
            }

            this.arr[index]=null;
            this.size--;
        }
    }

    // 休眠几个函数的定位方式（偏移i^2）是一样的，可以提出一个函数，但是我懒
    hashSet(key:number,value: number){
        let index=key % this.doubleCapacity;
        let t=1;
        while (this.arr[index]!=null){
            if (this.arr[index].key===key){
                this.arr[index].value=value;
                // 如果已经存在就增加life
                this.arr[index].life++;
                return;
            }
            index=(index + t*t) % this.doubleCapacity;
            t++;
        }
        this.size++;
        this.arr[index]={key,value,life:0};
    }

    // autokill的查询是不更新life的
    hashGet(key:number,update:boolean):GetRes{
        let index=key % this.doubleCapacity;
        let t=1;
        while (this.arr[index]!=null){
            if (this.arr[index].key===key){
                if (update) this.arr[index].life++;
                return {node:this.arr[index],index};
            }
            index=(index + t*t) % this.doubleCapacity;
            t++;
        }
        return {node:null,index:-1};
    }

    // 这个函数没用到
    hashDelete(key:number):boolean{
        let index=key % this.doubleCapacity;
        let t=1;
        while (this.arr[index]!=null){
            if (this.arr[index].key===key){
                this.arr[index]=null;
                return true;
            }
            index=(index + t*t) % this.doubleCapacity;
            t++;
        }
        return false;
    }
}

let d=new LRUCache(1);
// d.put(1,1);
// d.put(2,2);
// // d.get(1);
// d.put(3,3);
// console.log(d.get(1));
// console.log(d.get(2));
// console.log(d.get(3));
let p=console.log;
let act=[[6],[8],[12,1],[2],[15,11],[5,2],[1,15],[4,2],[4],[15,15]];
for (let ele of act){
    if (ele.length===1){
        p(d.get(ele[0]));
    }else{
        p(d.put(ele[0],ele[1]));
    }
}

