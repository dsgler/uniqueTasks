import "./style.css";
import todoUl from "./todoUl";
import add_img from "./回车.svg";
import {footStatusflag} from "./todoUl";

type saveLiNode={
  val:string;
  isFinished: boolean;
  date:Date | string |null;
};

type save_bundle={
  li_un:saveLiNode[];
  li_ed:saveLiNode[];
  footStatus: footStatusflag;
};

export default class todolist {
  app: HTMLElement;
  myul: HTMLElement;
  myFoot: HTMLElement;
  todoUl_instance: todoUl;
  mynewTodo: HTMLInputElement;
  mynewTodoIcon: HTMLImageElement;
  constructor(app: HTMLElement) {
    this.app = app;
    app.innerHTML = `
<div class="app-container">
<h1 class="myhead">MyTodos</h1>
<div class="input-container myrow">
<input
class="new-todo"
placeholder="What needs to be done?"
autofocus=""
/>
<img src="${add_img}">
</div>
<ul class="myul">
</ul>
<div class="foot-count myrow">
<span>总任务数：<span class="total">0</span></span>
<span>未完成：<span class="unfinish">0</span></span>
<span>已完成：<span class="finished">0</span></span>
<span class="clear">清空</span>
</div>
</div>`;

    this.myul = app.querySelector(".myul")!;
    this.myFoot = app.querySelector(".foot-count")!;
    // debugger;
    this.todoUl_instance = new todoUl(this.myul, this.myFoot);
    // 尝试恢复历史
    this.recovery();

    // 绑定一些东西
    this.mynewTodo = <HTMLInputElement>app.querySelector(".new-todo")!;
    this.bind_newTodo_Enter(this.mynewTodo);
    this.mynewTodoIcon = <HTMLImageElement>(
      app.querySelector(".input-container>img")!
    );
    this.bind_newTodo_icon(this.mynewTodo, this.mynewTodoIcon);

    app.querySelector(".clear")!.addEventListener("click",()=>{
      this.clear();
    })

    // 关闭网页自动保存
    window.addEventListener('unload',()=>{this.save();});
    setInterval(()=>{this.save()},10000);
  }

  recovery(){
    let save_bundle_json=localStorage.getItem(`${this.app.id}_save_bundle`);
    try{
      let save_bundle:save_bundle=JSON.parse(save_bundle_json!);
      for (let ele of save_bundle.li_un){
        this.todoUl_instance.add(ele.val,false,ele.isFinished,this.todoUl_instance.li_un,ele.date===null?null:new Date(<string>ele.date));
      }
      for (let ele of save_bundle.li_ed){
        this.todoUl_instance.add(ele.val,false,ele.isFinished,this.todoUl_instance.li_ed,ele.date===null?null:new Date(<string>ele.date));
      }
      this.todoUl_instance.footStatus=save_bundle.footStatus;
      this.todoUl_instance.bind_show();
      this.todoUl_instance.update_foot();
    }catch{
      if (save_bundle_json!=null){
        alert("载入失败");
        this.clear();
      }
      // this.todoUl_instance.add("你好，世界！",true);
    }
  }

  save(){
    let save_liun:saveLiNode[]=[];
    let save_lied:saveLiNode[]=[];
    for (let ele of this.todoUl_instance.li_un){
      save_liun.push({val:ele.li.querySelector(".mylabel")!.innerHTML,isFinished:ele.isFinished,date:ele.date})
    }
    for (let ele of this.todoUl_instance.li_ed){
      save_lied.push({val:ele.li.querySelector(".mylabel")!.innerHTML,isFinished:ele.isFinished,date:ele.date})
    }

    let save_bundle:save_bundle={li_un:save_liun,li_ed:save_lied,footStatus:this.todoUl_instance.footStatus};
    let json=JSON.stringify(save_bundle);
    localStorage.setItem(`${this.app.id}_save_bundle`,json);
  }

  clear(){
    this.todoUl_instance.li_un.length=0;
    this.todoUl_instance.li_ed.length=0;
    localStorage.removeItem(`${this.app.id}_save_bundle`);
    this.todoUl_instance.add("你好，世界！",true);
  }

  bind_newTodo_Enter(newTodo: HTMLInputElement) {
    newTodo.addEventListener("keydown", (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        event.preventDefault();
        this.todoUl_instance.add(newTodo.value);
        newTodo.value = "";
      }
    });
  }

  bind_newTodo_icon(newTodo: HTMLInputElement, newTodoIcon: HTMLImageElement) {
    newTodoIcon.addEventListener("click", () => {
      this.todoUl_instance.add(newTodo.value);
      newTodo.value = "";
    });
  }
}
