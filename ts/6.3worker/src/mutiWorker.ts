self.onmessage = (e) => {
    let t = Date.now();
    let data = <{ fileBuffer: ArrayBuffer; start: number ; end: number}>e.data;
    let slicedFile=data.fileBuffer.slice(data.start,data.end);
    (<Worker>(<unknown>self)).postMessage(slicedFile, [slicedFile]);
    console.log("inner:"+(Date.now() - t));
  };
  