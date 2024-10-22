type arrNode={
    key: number;
    value:number;
};
class LRUCache {
    arr:(arrNode | null | undefined)[];
    queue:number[];
    capacity:number;
    doubleCapacity:number;
    size:number;
    constructor(capacity: number) {
        this.size=0;
        this.capacity=capacity;
        this.doubleCapacity=2*capacity;
        this.arr=Array(2*capacity);
        this.queue=[];
    }

    // get(key: number): number {
        
    // }

    put(key: number, value: number): void {
        
    }

    hashSet(key:number,value: number){
        let index=key % this.doubleCapacity;
        let t=1;
        while (this.arr[index]!=null){
            if (this.arr[index].key===key){
                this.arr[index].value=value;
                return;
            }
            index=(index + t*t) % this.doubleCapacity;
            t++;
        }
        this.arr[index]={key,value};
    }

    hashGet(key:number):number{
        let index=key % this.doubleCapacity;
        let t=1;
        while (this.arr[index]!=null){
            if (this.arr[index].key===key){
                return this.arr[index].value;
            }
            index=(index + t*t) % this.doubleCapacity;
            t++;
        }
        return -1;
    }
}

let d=new LRUCache(100);
console.log()
