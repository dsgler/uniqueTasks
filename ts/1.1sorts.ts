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
const array = [5, 2, 9, 1, 5, 6,7,9999,22,2,-999];
insertionSort(array)
console.log(array);

class heap{
    private heapList:number[];
    private heapLen:number;

    constructor(arr:number[]){
        this.heapList=arr;
        this.heapLen=arr.length;
        this.heapify();
    }

    private swap(i:number,j:number){
        [this.heapList[i],this.heapList[j]]=[this.heapList[j],this.heapList[i]];
    }

    public heapify():void{
        for (let process=1;process<this.heapLen;process++){
            this.heapUp(process);
        }

    }

    private heapUp(i:number):void{
        if (i===0){
            return;
        }

        let father=Math.floor((i-1)/2);
        if (this.heapList[i]<this.heapList[father]){
            this.swap(i,father);
            this.heapUp(father);
        }
    }

    public heapSort():void{
        while (this.heapLen>=2){
            this.swap(this.heapLen-1,0);
            this.heapLen--;
            this.heapDown(0);
        }
    }

    private heapDown(i:number){
        let left=2*i+1;
        let right=left+1;
        if(left>=this.heapLen) left=-1;
        if(right>=this.heapLen) right=-1;
        let target:number=-1;

        if (left!==-1 && this.heapList[i]>this.heapList[left]){
            if (right!==-1 && this.heapList[left]>this.heapList[right]){
                target=right;
            }else{
                target=left;
            }
        }else if (right!==-1 && this.heapList[i]>this.heapList[right]){
            target=right;
        }

        if (target===-1) return;

        this.swap(i,target);
        this.heapDown(target);
    }
}

const array2 = [5, 2, 9, 1, 5, 6,7,9999,22,2,-999];
let he=new heap(array2);
// console.log(array2);
he.heapSort();
console.log(array2);