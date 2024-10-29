import "./style.css";
import todoUl from "./todoUl";
import add_img from "./回车.svg";

const app = document.getElementById("app")!;
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
</div>
</div>`;
const myul=<HTMLElement>app.getElementsByClassName("myul")[0];
const myFoot:HTMLElement=app.querySelector(".foot-count")!;

let todoUl_instance=new todoUl(myul,myFoot);
window.todoUl_instance=todoUl_instance;

function bind_newTodo_Enter(newTodo:HTMLInputElement){
  newTodo.addEventListener("keydown",(event: KeyboardEvent)=>{
    if (event.key==="Enter"){
      event.preventDefault();
      todoUl_instance.add(newTodo.value);
      newTodo.value="";
    }
  })
}

function bind_newTodo_icon(newTodo:HTMLInputElement,newTodoIcon:HTMLImageElement){
  newTodoIcon.addEventListener("click",()=>{
    todoUl_instance.add(newTodo.value);
    newTodo.value="";
  })
}

const mynewTodo=<HTMLInputElement>app.querySelector(".new-todo")!;
bind_newTodo_Enter(mynewTodo);
const mynewTodoIcon=<HTMLImageElement>app.querySelector(".input-container>img")!;
bind_newTodo_icon(mynewTodo,mynewTodoIcon);

function bind_edit() {
  // document.getElementById
  let labels = document.querySelectorAll(".mylabel");
  labels.forEach(fn_edit);
}

function fn_edit(e: Element) {
  e.addEventListener("dblclick", function (this: HTMLElement) {
    let oldValue: string = this.innerHTML;
    this.innerHTML = "";
    let curli = this.parentElement;
    curli!.classList.add("editing");
    let editInput = document.createElement("input");
    editInput.value = oldValue;
    editInput.addEventListener("blur", function (this: HTMLInputElement) {
      e.innerHTML = this.value == "" ? oldValue : this.value;
      curli!.classList.remove("editing");
      this.remove();
    });
    this.appendChild(editInput);
    editInput.focus();
  });
}

// bind_edit();
