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