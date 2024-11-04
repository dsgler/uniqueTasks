let thenable = {
    then: function (resolve, reject) {
      resolve(42);
    },
  };



Promise.resolve(thenable).then((data)=>{
    console.log(data);
    return 1;
}).then((data)=>{
    console.log(data);
    return data+1;
}).then((data)=>{
    console.log(data)
}).then((data)=>{console.log(data)})