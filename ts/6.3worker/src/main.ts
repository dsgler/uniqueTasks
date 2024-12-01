import "./style.css";

const inp = <HTMLInputElement>document.querySelector("#inp")!;
const B_upload = document.querySelector("#B_upload")!;
B_upload.addEventListener("click", async () => {
  if (!inp.files) {
    alert("请添加文件");
    return;
  }

  let f = inp.files[0];
  let a = await f.arrayBuffer();
  let cnt = 50;
  let data = { fileBuffer: a, cnt };

  // 手动修改实现不同的方法吧
  if (false) {
    let work = new Worker("/src/worker.ts");
    let t = Date.now();
    work.postMessage(data, [a]);

    work.addEventListener("message", (e) => {
      console.log(e.data);
      work.terminate();
      console.log("outer:" + (Date.now() - t));
    });
  } else if (true) {
    let t = Date.now();
    let slicedFiles = slice(data);
    console.log(slicedFiles);
    console.log("direct:" + (Date.now() - t));
  } else {
    let t = Date.now();
    // 先切5片
    data.cnt=5;
    let workerLen=5;
    let preLen=~~(cnt/workerLen);
    let slicedFiles = slice(data);
    // console.log(slicedFiles);


    let workers = Array.from(
      { length: workerLen },
      () => new Worker("/src/worker.ts")
    );
    let wcnt=0;  
    for (let i=0;i<=workerLen-1;i++) {
      let work=workers[i];
      let data: { fileBuffer: ArrayBuffer; cnt: number } = {
        fileBuffer: slicedFiles[i],
        cnt:preLen,
      };
      work.postMessage(data,[slicedFiles[i]])
      work.addEventListener("message",(e)=>{
        console.log(e.data);
        work.terminate();
        wcnt++;
        if (wcnt===workerLen){
          console.log(`muti:${Date.now()-t}`);
        }
      })
    }
  }
});

function slice(data: { fileBuffer: ArrayBuffer; cnt: number }): ArrayBuffer[] {
  let slicedFiles = [];
  let preSize = ~~(data.fileBuffer.byteLength / data.cnt);
  let acc = 0;
  for (let i = 1; i <= data.cnt - 1; i++) {
    slicedFiles.push(data.fileBuffer.slice(acc, acc + preSize));
    acc += preSize;
  }
  slicedFiles.push(data.fileBuffer.slice(acc));
  return slicedFiles;
}
