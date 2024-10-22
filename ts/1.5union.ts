// 547. 省份数量
// https://leetcode.cn/problems/number-of-provinces/
// 最普通的 find 时优化 king
// 时间薄纱，空间差了点，难道是因为我开了个数组记录 kings ?
function findCircleNum(isConnected: number[][]): number {
    let n=isConnected.length;
    let a=new Unionset(n);
    for (let i=0;i<n;i++){
        for (let j=i+1;j<n;j++){
            if (i===j) continue;
            if (isConnected[i][j]===1){
                a.join(i,j);
            }
        }
    }

    let sum=0;
    for (let i of a.kings){
        if(i) sum++;
    }
    return sum;
};

class Unionset{
    arr:number[];
    len:number;
    kings:boolean[];
    peers:number[];
    peersCap:number;
    constructor(n:number){
        this.len=n;
        // 开始时每个人都是自己的 king
        this.arr=Array.from({length:n},(_,k)=>k);
        this.kings=Array.from({length:n},()=>true);
        this.peers=Array(n);
        // this.peersCap=0;
    }

    findking(n:number):number{
        this.peersCap=0;
        while (this.arr[n]!==n){
            this.peers[this.peersCap++]=n;
            n=this.arr[n];
        }
        // this.kings[n]=true;

        //优化
        while (this.peersCap>0){
            this.arr[this.peers[--this.peersCap]]=n;
        }
        return n;
    }

    join(i:number,j:number){
        if (i===j) return;
        let king1=this.findking(i);
        let king2=this.findking(j);
        if (king1===king2) return;
        this.kings[king1]=false;
        this.arr[king1]=king2;
    }
}

// let c=new Unionset(5);
// console.log(c.arr);
console.log(findCircleNum([[1,1,1],[1,1,1],[1,1,1]]));
