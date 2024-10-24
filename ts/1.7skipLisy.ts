// https://leetcode.cn/problems/design-skiplist/description/
// 1206. 设计跳表

/**
 * Your Skiplist object will be instantiated and called as such:
 * var obj = new Skiplist()
 * var param_1 = obj.search(target)
 * obj.add(num)
 * var param_3 = obj.erase(num)
 */
type SkiplistNode={
    data:number;
    // 记录不同层的下一个
    next:SkiplistNode[]|null;
    // 用于处理重复的情况
    life:number;
};

class Skiplist {
    // 此层不可达
    MaxHeight:number;
    rate:number;
    head:SkiplistNode;
    end:SkiplistNode;
    path:(SkiplistNode | null)[];

    makeSkiplistNode(data:number,height?:number):SkiplistNode{
        // 层数随机确定
        height=height || this.getRandomHeight();
        return {data,next:Array(height+1),life:1};
    }

    // 通过将head,end设置为最大和最小减少讨论，它们的层数最大
    constructor() {
        this.MaxHeight=16;
        this.rate=0.5;
        this.end=this.makeSkiplistNode(Number.MAX_SAFE_INTEGER,this.MaxHeight);
        this.end.next=null;
        this.head=this.makeSkiplistNode(Number.MIN_SAFE_INTEGER,this.MaxHeight);
        this.head.next.fill(this.end);
        this.path=Array.from({length:this.MaxHeight+1},()=>null);
    }

    getRandomHeight():number{
        let i=0;
        for (;i!==(this.MaxHeight-1) && Math.random()<this.rate;i++);
        return i;
    }

    search(target: number): boolean {
        let cur=this.search_le(target);
        if (cur.data===target) return true;
        return false;      
    }
    
    // 最重要的函数，返回小于或等于target的值，并记录路径在path中
    search_le(target: number):SkiplistNode{
        let cur=this.head;
        let i=this.MaxHeight;
        
        // 逐层寻找
        for (;i>=0;i--){
            while (true){
                let next=cur.next[i];
                if (next.data===target){
                    // 完善路径
                    while (i>=0){
                        this.path[i]=next;
                        i--;
                    }
                    return next;
                }else if(next.data>target){
                    this.path[i]=cur;
                    break;
                }else{
                    cur=next;
                }
            }
        }
        return cur;
        
    }

    add(num: number): void {
        let cur=this.search_le(num);

        if (cur.data===num){
            cur.life++;
            return;
        }

        let newNode=this.makeSkiplistNode(num);
        for (let i=newNode.next.length-1;i>=0;i--){
            // 这里路径记录前面的节点
            let pre=this.path[i];
            newNode.next[i]=pre.next[i];
            pre.next[i]=newNode;
        }
    }

    erase(num: number): boolean {
        let cur=this.search_le(num);

        if (cur.data!==num) return false;

        if (cur.life>1){
            cur.life--;
            return true;
        }

        // 寻找前位的path，建立前位的路径
        this.search_le(num-1);
        for (let i=cur.next.length-1;i>=0;i--){
            this.path[i].next[i]=cur.next[i];
        }
        return true;
    }

    // 调试作用
    print(n:number){
        console.group();
        let cur=this.head;
        while (cur.next != null){
            if (cur.data==null) debugger;
            console.log(cur.data);
            cur=cur.next[n];
        }
        console.groupEnd();
    }
}

var j=console.log;
let e=new Skiplist();
e.add(1);
e.add(2);
e.add(3);
e.add(4);
e.add(5);
e.erase(2);
0===0;