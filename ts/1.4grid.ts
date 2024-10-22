// https://leetcode.cn/problems/number-of-islands/description/
// 200. 岛屿数量
// 基于邻接表实现有向无环图的数据结构

// 先写dfs吧
// 性能好像不是很好啊
// 把record删了，原地记录，性能好了一点
let row: number, col: number;

function numIslands(grid: string[][]): number {
  row = grid.length;
  col = grid[0].length;

  let ans = 0;
  // 记录访问过的
  let record: boolean[][] = [];
  for (let i = 0; i < row; i++) {
    record.push(new Array(col).fill(false));
  }
  // 逐格遍历
  for (let i = 0; i < row; i++) {
    for (let j = 0; j < col; j++) {
      if (grid[i][j] === "1") {
        //console.log(`i:${i},j:${j}`);
        dfs(i, j, grid);
        ans++;
      }
    }
  }
  return ans;
}

function dfs(i: number, j: number,  grid: string[][]) {
  if (
    i < 0 ||
    i >= row ||
    j < 0 ||
    j >= col ||
    grid[i][j] === "0"
  )
    return;

  grid[i][j] = "0";

  dfs(i + 1, j, grid);
  dfs(i - 1, j, grid);
  dfs(i, j + 1, grid);
  dfs(i, j - 1, grid);
}

let grid = [
  ["1", "1", "1", "1", "0"],
  ["1", "1", "0", "1", "0"],
  ["1", "1", "0", "0", "0"],
  ["0", "0", "0", "0", "0"],
];
console.log(numIslands(grid));

type queueNode = {
  i: number;
  j: number;
};

// 性能好像差不多
function bfs(i: number, j: number, record: boolean[][], grid: string[][]) {
  let queue: queueNode[] = [];
  let cur: queueNode = { i, j };
  queue.push(cur);
  record[i][j] = true;
  const posi = [
    [1, 0],
    [0, 1],
    [-1, 0],
    [0, -1],
  ];

  function isPushable(i: number, j: number) {
    if (
      i < 0 ||
      i >= row ||
      j < 0 ||
      j >= col ||
      record[i][j] == true ||
      grid[i][j] === "0"
    )
      return false;
    return true;
  }

  while (queue.length !== 0) {
    cur = queue.shift();

    for (let ele of posi) {
      let x = cur.i + ele[0];
      let y = cur.j + ele[1];

      if (isPushable(x, y)) {
        queue.push({i:x,j:y});
        record[x][y] = true;
      }
    }
  }
}

/* ------------------------------------------------- */
// https://leetcode.cn/problems/course-schedule/description/
// 207. 课程表
// 挺快的
let num:number;
function canFinish(numCourses: number, prerequisites: number[][]): boolean {
  num=numCourses;
  // 记录关系
  let arr: number[][] = Array.from({ length: numCourses }, () => []);
  // 记录经检验 可 的节点
  let set:number[]=new Array(numCourses).fill(0);
  
  for (let ele of prerequisites){
    arr[ele[0]].push(ele[1]);
  }
  
  let cir:number[]=new Array(numCourses);
  for (let i=0;i<numCourses;i++){
    // 不用New清空数组而是fill的话，时间和空间都会好一点，特别是空间
    cir.fill(0);
    let res=dfs2(arr,set,cir,i);
    if (res===true){
      return false;
    }
  }
  return true;
};

// 返回值是是否重复
function dfs2(arr:number[][],set:number[],cir:number[],n:number):boolean{
  // 只有一个节点的所有分支都可，这个节点才可
  /* function writeback(){
    for (let i=0;i<num;i++){
      if (cir[i]===1) set[i]=1;
    }
  } */

  if (set[n]!==0) {return false;}

  if (cir[n]!==0) return true;

  cir[n]=1;
  // 走到头了，没有重复，回写
  if (arr[n].length===0){return false;}

  for (let k of arr[n]){
    let res=dfs2(arr,set,cir,k);
    if (res===true){
      return true;
    }
    // 回复路径
    cir[k]=0;
  }
  // 你过关！
  set[n]=1;
}

console.log(canFinish(4,[[0,1],[1,2],[0,3],[3,0]]));