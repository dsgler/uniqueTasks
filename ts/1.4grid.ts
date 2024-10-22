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
