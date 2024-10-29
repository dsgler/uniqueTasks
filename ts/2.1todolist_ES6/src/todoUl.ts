import unchecked from "./选择_未选择.svg";
import checked from "./选择_已选择.svg";

type liNode={
  li: HTMLElement;
  isFinished:boolean;
};

export default class todoUl {
  li: liNode[];
  myul: HTMLElement;
  constructor(myul: HTMLElement) {
    this.li = [];
    this.myul = myul;
    this.add("你好，世界");
  }

  add(value: string) {
    if (value=="") 
      return;
    let li = document.createElement("li");
    li.classList.add("myli", "myrow");
    li.innerHTML = `<span class="mycheckbox"><img src="./src/选择_未选择.svg"></span>
            <div class="mylabel">${value}</div>
            <button><img src="./src/删除.svg"></button>`;

    let liNode:liNode={li,isFinished:false};
    this.myul.appendChild(li);
    this.bind_edit(liNode);
    this.bind_finish_toggle(liNode);
    this.bind_delete(liNode);
    this.li.push(liNode);
  }

  remove(liNode:liNode){
    this.li.splice(this.li.indexOf(liNode),1);
    liNode.li.remove();
  }

  bind_edit(liNode:liNode) {
    let li=liNode.li;
    let mylabel=li.querySelector(".mylabel")!;
    mylabel.addEventListener("dblclick", ()=> {
      let oldValue: string = mylabel.innerHTML;
      mylabel.innerHTML = "";
      li.classList.add("editing");
      let editInput = document.createElement("input");
      editInput.value = oldValue;
      editInput.addEventListener("blur", ()=> {
        mylabel.innerHTML = editInput.value == "" ? oldValue : editInput.value;
        li.classList.remove("editing");
        editInput.remove();
      });
      mylabel.appendChild(editInput);
      editInput.focus();
    });
  }

  css_finished (li: HTMLElement,mycheckbox_img: HTMLImageElement){
    // let li=this.li[index];
    // let mycheckbox_img=<HTMLImageElement>li.querySelector(".mycheckbox>img")!;
    mycheckbox_img.src=checked;
    li.classList.add("finished");
  }

  css_unfinished (li: HTMLElement,mycheckbox_img: HTMLImageElement){
    // let li=this.li[index];
    // let mycheckbox_img=<HTMLImageElement>li.querySelector(".mycheckbox>img")!;
    mycheckbox_img.src=unchecked;
    li.classList.remove("finished");
  }

  bind_finish_toggle(liNode:liNode){
    let li=liNode.li;
    let mycheckbox=<HTMLImageElement>li.querySelector(".mycheckbox")!;
    let mycheckbox_img=<HTMLImageElement>li.querySelector(".mycheckbox>img")!;

    mycheckbox.addEventListener("click",()=>{
      if (liNode.isFinished===true){
        liNode.isFinished=false;
        this.css_unfinished(li,mycheckbox_img);
      }else{
        liNode.isFinished=true;
        this.css_finished(li,mycheckbox_img);
      }
    })
  }

  bind_delete(liNode:liNode){
    let li=liNode.li;
    let delete_button=li.querySelector("button")!;
    delete_button.addEventListener("click",()=>{
      this.remove(liNode);
    })
  }
}
