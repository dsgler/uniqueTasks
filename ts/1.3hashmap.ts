// 写一个<string,number>的吧
// 用 数组 加 链表 的方式，比较简单
type hashNode={
    key:string;
    value:number;
    next:hashNode | null;
};

class Hashmap{
    size:number;
    arr:(hashNode | null)[];
    cap:number;
    constructor(){
        this.size=0;
        this.cap=1069;
        this.arr=new Array(this.cap);
        this.arr.fill(null);
    }

    public stringToNumber(str:string):number{
        let hashsum:number=0;
        let len=str.length;
        for (let i=0;i<len;i++){
            // 整点质数防碰撞吧，有没有用不知道
            hashsum+=(hashsum*31+str.charCodeAt(i)) % this.cap;
        }
        return hashsum % this.cap;
    }

    public add(key:string,value:number){
        let insertNode:hashNode={key,value,next:null};

        let posi=this.stringToNumber(key);
        let cur=this.arr[posi];
        // 不严格的等于可以判断 null 和 undefined
        if (cur==null){
            this.arr[posi]=insertNode;
            this.size++;
            return;
        }

        while (cur.next!=null){
            cur=cur.next;
        }
        cur.next=insertNode;
        this.size++;
    }

    private preGet(key:string):(hashNode | undefined){
        let posi=this.stringToNumber(key);
        let cur=this.arr[posi];
        while (cur != null){
            if (cur.key===key){
                return cur;
            }
            cur=cur.next;
        }
    }

    public get(key:string):(number | undefined){
        let cur=this.preGet(key);
        if (cur==null){
            return undefined;
        }

        return cur.value;
    }

    public remove(key:string):boolean{
        let posi=this.stringToNumber(key);
        let cur=this.arr[posi];
        if (cur==null || (cur.next==null && cur.key!==key)) return false;

        if (cur.key===key){
            this.arr[posi]=null;
            this.size--;
            return true;
        }

        let last:hashNode=cur;
        cur=cur.next;

        while (cur!=null){
            if (cur.key===key){
                cur=cur.next;
                last.next=cur;
                this.size--;
                return true;
            }

            cur=cur.next;
        }

        return false;
    }

}

// console.log(666);
let a=new Hashmap();

a.add("123",888);
a.add("456",999);
a.add("2",9997);
a.add("1",99981);
a.add("5",9990);
console.log(a.get("123"));
console.log(a.remove("123"));
console.log(a.get("123"));