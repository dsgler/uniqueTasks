self.onmessage = async(e) => {
  let t = Date.now();
  let data = <{ fileBuffer: ArrayBuffer; cnt: number }>e.data;
  let slicedFiles=await slice(data);
  (<Worker>(<unknown>self)).postMessage(slicedFiles, slicedFiles);
  console.log("inner:"+(Date.now() - t));
};

async function slice(data: { fileBuffer: ArrayBuffer; cnt: number }): Promise<ArrayBuffer[]>{
    let slicedFiles:ArrayBuffer[] = [];
    let preSize = ~~(data.fileBuffer.byteLength / data.cnt);
    let acc = 0;
    let ps:Promise<any>[] =[];
    for (let i = 0; i <= data.cnt - 1; i++) {
        ps.push(new Promise(rs=>{
            slicedFiles.push(data.fileBuffer.slice(acc, i!==data.cnt - 1? acc + preSize:undefined));
            rs(undefined);
        }))
      acc += preSize;
    }
    await Promise.all(ps);
    return slicedFiles;
}