import "./2.css"

let E_listLength=document.querySelector("#listLength")!;
let E_app=document.querySelector("#app")!;

let listLength=0;
function addList(n:number){
    let now=Date.now();
    for (let i=0;i<n;i++){
        listLength++;
        let li=document.createElement("li");
        li.classList.add("myli")
        li.innerHTML="这是第"+(listLength)+"个"
        E_app.appendChild(li);
        // E_app.innerHTML+=`<li class="myli">这是第${listLength}个</li>`
        E_listLength.innerHTML=String(listLength);
    }
    console.log("js时间："+(Date.now()-now))
    setTimeout(()=>{
        console.log("渲染时间："+(Date.now()-now))
    },0)
}

let addBut=document.querySelector("#add")!;
addBut.addEventListener("click",()=>{
    addList(10000);
})

