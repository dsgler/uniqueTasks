// https://leetcode.cn/problems/binary-tree-inorder-traversal/description/
// 94. 二叉树的中序遍历

// Definition for a binary tree node.
class TreeNode {
    val: number
    left: TreeNode | null
    right: TreeNode | null
    constructor(val?: number, left?: TreeNode | null, right?: TreeNode | null) {
        this.val = (val===undefined ? 0 : val)
        this.left = (left===undefined ? null : left)
        this.right = (right===undefined ? null : right)
    }
}


function inorderTraversal(root: TreeNode | null): number[] {
    if (root===null) return new Array(0);

    let ans:number[]=[];
    f(root,ans);

    return ans;
};

function f(node: TreeNode | null,ans:number[]):void{
    if (node===null) return;

    f(node.left,ans);
    ans.push(node.val);
    f(node.right,ans);
}

// 中序遍历非递归版
// 原理是用栈模拟递归
function f2(root: TreeNode | null):number[]{
    if (root===null) return [];

    let ans:number[]=[];
    let stack:(TreeNode | null)[]=[];
    let cur:TreeNode | null=root;
    // stack.push(cur);

    while (cur!==null || stack.length!==0){
        while (cur !== null){
            stack.push(cur);
            cur=cur.left;
        }

        cur=stack.pop() || null;

        if (cur!==null){
            ans.push(cur.val);
            cur=cur.right;
        }
    }
    return ans;

}

let root=new TreeNode(1);
root.left=new TreeNode(2)
root.right=new TreeNode(3);

console.log(f2(root));

// 层序打印
function levelOrder(root: TreeNode | null): number[][] {
    if (root===null) return [[]];

    let ans:number[][]=[];
    let queue:(TreeNode | null)[]=[];
    let cur:TreeNode | null=root;

    queue.push(cur);
    let cnt=1;
    while (cnt>0){
        let ncnt=0;
        let layer:number[]=[];
        for (let i=0;i<cnt;i++){
            cur=queue.shift() || null;
            // cnt--;
            if (cur!==null){
                layer.push(cur.val);
                queue.push(cur.left);
                queue.push(cur.right);
                ncnt+=2;
            }
        }
        cnt=ncnt;
        if (layer.length!==0){
            ans.push(layer);
        }
    }

    return ans;
};

console.log(levelOrder(root));