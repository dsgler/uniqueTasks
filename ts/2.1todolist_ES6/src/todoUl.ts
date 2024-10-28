export default class todoUl {
  li: HTMLElement[];
  finished: number[];
  myul: HTMLElement;
  constructor(myul: HTMLElement) {
    this.li = [];
    this.finished = [];
    this.myul = myul;
    this.add("你好，世界");
  }

  add(value: string) {
    let li = document.createElement("li");
    li.classList.add("myli", "myrow");
    li.innerHTML = `<span class="mycheckbox"><img src="./src/选择_未选择.svg"></span>
            <div class="mylabel">${value}</div>
            <button><img src="./src/删除.svg"></button>`;

    this.fn_edit(li.querySelector(".mylabel")!);
    this.myul.appendChild(li);
    this.li.push(li);
  }

  fn_edit(e: Element) {
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
}
