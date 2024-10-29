import "./style.css";
import todoUl from "./todoUl";
import add_img from "./回车.svg";

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
</div>
</div>`;

    this.myul = app.querySelector(".myul")!;
    this.myFoot = app.querySelector(".foot-count")!;
    // debugger;
    this.todoUl_instance = new todoUl(this.myul, this.myFoot);

    this.mynewTodo = <HTMLInputElement>app.querySelector(".new-todo")!;
    this.bind_newTodo_Enter(this.mynewTodo);
    this.mynewTodoIcon = <HTMLImageElement>(
      app.querySelector(".input-container>img")!
    );
    this.bind_newTodo_icon(this.mynewTodo, this.mynewTodoIcon);
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
