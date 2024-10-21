// 稳定 O(n^2) O(1)
function insertionSort(arr: number[]): void {
    let len=arr.length;
    //将前i位排序好
    for (let i=1;i<len;i++){
        let j=i;
        // 类似于向前冒泡
        while (j>0 && arr[j]<arr[j-1]){
            //也是用上特性了
            [arr[j],arr[j-1]]=[arr[j-1],arr[j]];
            j--;
        }
    }
}

// 测试
let array = [5, 2, 9, 1, 5, 6,7,9999,22,2,-999];
insertionSort(array)
console.log(array);
/* -------------------------------- */
// 无稳定 O(n log n) O(1)
class Heap{
    private heapList:number[];
    private heapLen:number;
    private flag:boolean;
    private cmpFlag(a:number,b:number):boolean{
        return this.flag?(a>b):(a<b);
    }

    // false代表小根堆，true代表大根堆
    constructor(arr:number[],flag:boolean=false){
        this.heapList=arr;
        this.heapLen=arr.length;
        this.flag=flag;
        this.heapify();
    }

    //用于交换
    private swap(i:number,j:number){
        [this.heapList[i],this.heapList[j]]=[this.heapList[j],this.heapList[i]];
    }

    //用于堆初始化
    public heapify():void{
        for (let process=1;process<this.heapLen;process++){
            this.heapUp(process);
        }

    }

    //堆初始化的辅助函数，将新加入元素向上冒
    private heapUp(i:number):void{
        if (i===0){
            return;
        }

        let father=Math.floor((i-1)/2);
        if (this.cmpFlag(this.heapList[i],this.heapList[father])){
            this.swap(i,father);
            this.heapUp(father);
        }
    }

    //将堆元素一个个弹出实现排序，之后堆就无了
    public heapSort():void{
        while (this.heapLen>=2){
            this.heapPop();
        }
        this.heapLen=0;
    }

    //辅助函数，逻辑判断有点麻烦
    private heapDown(i:number){
        let left=2*i+1;
        let right=left+1;
        if(left>=this.heapLen) left=-1;
        if(right>=this.heapLen) right=-1;
        let target:number=-1;

        if (left!==-1 && this.cmpFlag(this.heapList[left],this.heapList[i])){
            if (right!==-1 && this.cmpFlag(this.heapList[right],this.heapList[left])){
                target=right;
            }else{
                target=left;
            }
        }else if (right!==-1 && this.cmpFlag(this.heapList[right],this.heapList[i])){
            target=right;
        }

        if (target===-1) return;

        this.swap(i,target);
        this.heapDown(target);
    }

    public heapPop():number{
        let res=this.heapList[0];
        this.swap(this.heapLen-1,0);
        this.heapLen--;
        this.heapDown(0);
        return res;
    }
}

let array2 = [5, 2, 9, 1, 5, 6,7,9999,22,2,-999];
let he=new Heap(array2,false);
// console.log(array2);
he.heapSort();
console.log(array2);
/* -------------------------------- */
//用于获取基准数
function getRandomInt(min:number, max:number) {
    // min = Math.ceil(min);
    // max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 时间和空间复杂度与递归深度有关，递归深度与选取基准有关
// 平均为O(n log n)
// 无稳定性
function quickSort(arr:number[],l:number,r:number):void{
    let lRaw=l;
    let rRaw=r;
    if (l>=r) return;

    let base=arr[getRandomInt(l,r)];
    //l记录处理过的数，m分割小于和等于
    let m=l;
    while (l<=r){
        if (arr[l]<base){
            //将等于的分界前移
            swap(arr,l++,m++);
        }else if(arr[l]===base){
            l++;
        }else{
            swap(arr,l,r--);
        }
    }
    //左右递归处理
    quickSort(arr,lRaw,m-1);
    quickSort(arr,r+1,rRaw);
}

function swap(arr:number[],i:number,j:number){
    [arr[i],arr[j]]=[arr[j],arr[i]];
}

let array3 = [5, 2, 9, 1, 5, 6,7,9999,22,2,-999];
quickSort(array3,0,array3.length-1);
console.log(array3);
/* -------------------------------- */
// help数组用于临时储存修改，使空间复杂度变为O(n)
// 有稳定性
function mergeSort(arr:number[],help:number[],l:number,r:number){
    if (l>=r) return;

    let m=Math.floor(l+(r-l)/2);

    mergeSort(arr,help,l,m);
    mergeSort(arr,help,m+1,r);

    let lp=l;
    let rp=m+1;
    let hp=l;

    while (lp <= m && rp <= r){
        if (arr[lp]<=arr[rp]){
            help[hp++]=arr[lp++];
        }else{
            help[hp++]=arr[rp++];
        }
    }

    //善后
    while (lp <= m){
        help[hp++]=arr[lp++];
    }
    while (rp<=r){
        help[hp++]=arr[rp++];
    }

    //回拷
    while (l<=r){
        arr[l]=help[l];
        l++;
    }
}

let array4 = [5, 2, 9, 1, 5, 6,7,9999,22,2,-999];
let help=Array(array4.length);
mergeSort(array4,help,0,array4.length-1);
console.log(array4);
/* -------------------------------- */
// 215. 数组中的第K个最大元素 
// https://leetcode.cn/problems/kth-largest-element-in-an-array/description/

function findKthLargest(nums: number[], k: number): number {
    let he=new Heap(nums,true);
    let ans=0;
    for (let i=0;i<k;i++){
        ans=he.heapPop();
    }
    return ans;
};

let array5 = [5, 2, 9, 1, 5, 6,7,9999,22,2,-999];
console.log(findKthLargest(array5,1));