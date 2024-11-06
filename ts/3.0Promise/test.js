// let a=new Promise((rs,rj)=>{
//     rs(new Promise((rs2,rj2)=>{
//         setTimeout(()=>{rj2(1)},10)
//     }))
// }).catch((reason)=>{console.log(reason)})


let deferred=()=>{
    let resolve,reject;
    let promise=new Promise((rs,rj)=>{resolve=rs;reject=rj});
    return {
        promise,
        resolve,
        reject
    }
}

module.exports = {deferred};
