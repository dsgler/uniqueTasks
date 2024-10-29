import "./style.css";
import todoUl from "./todoUl";

const app = document.getElementById("app")!;
app.innerHTML = `
<div class="app-container">
<h1 class="myhead">MyTodos</h1>
<input
class="new-todo myrow"
placeholder="What needs to be done?"
autofocus=""
/>
<ul class="myul">
</ul>
</div>
`;
const myul=<HTMLElement>document.getElementsByClassName("myul")[0];

let todoUl_instance=new todoUl(myul);
window.todoUl_instance=todoUl_instance;




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
