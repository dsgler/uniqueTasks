import unchecked from "./选择_未选择.svg";
import checked from "./选择_已选择.svg";
import deleteIcon from "./删除.svg";

export type liNode = {
  li: HTMLElement;
  isFinished: boolean;
};

export type footStatusflag = "total" | "finished" | "unfinish";

export default class todoUl {
  li_un: liNode[];
  li_ed:liNode[];
  myul: HTMLElement;
  myFootNum: {
    total: HTMLElement;
    unfinish: HTMLElement;
    finished: HTMLElement;
  };
  myFootSpan: {
    total: HTMLElement;
    unfinish: HTMLElement;
    finished: HTMLElement;
  };
  footStatus: footStatusflag;
  constructor(myul: HTMLElement, myFoot: HTMLElement) {
    this.li_un = [];
    this.li_ed = [];
    this.myul = myul;
    this.myFootNum = {
      total: myFoot.querySelector(".total")!,
      unfinish: myFoot.querySelector(".unfinish")!,
      finished: myFoot.querySelector(".finished")!,
    };
    this.myFootSpan = {
      total: this.myFootNum.total.parentElement!,
      unfinish: this.myFootNum.unfinish.parentElement!,
      finished: this.myFootNum.finished.parentElement!,
    };
    this.footStatus = "total";
    this.myFootSpan[this.footStatus].classList.add("focus");

    this.myFootSpan.total.addEventListener("click", () => {
      this.bind_show("total");
    });
    this.myFootSpan.finished.addEventListener("click", () => {
      this.bind_show("finished");
    });
    this.myFootSpan.unfinish.addEventListener("click", () => {
      this.bind_show("unfinish");
    });

    // this.add("你好，世界");
  }

  /**
   * @describe 创建liNode,完成对list和DOM操作
   * @param liwho 向哪个表里添加
   * @param is_update 是否更新显示
   */
  add(value: string,is_update:boolean=true,isFinished:boolean=false,liwho:liNode[]=this.li_un) {
    if (this.footStatus === "finished") {
      this.bind_show("total");
    }
    if (value == "") return;
    let li = document.createElement("li");
    li.classList.add("myli", "myrow");
    li.innerHTML = `<span class="mycheckbox"><img src="${unchecked}"></span>
            <div class="mylabel">${value}</div>
            <button><img src="${deleteIcon}"></button>`;

    let liNode: liNode = { li, isFinished: isFinished };
    // this.myul.appendChild(li);
    this.bind_edit(liNode);
    this.bind_finish_toggle(liNode);
    this.bind_delete(liNode);
    liwho.push(liNode);

    if (is_update===true){
      this.bind_show();
      this.update_foot();
    }
  }

  show_append_liNode(liNode: liNode) {
    let li = liNode.li;
    this.myul.appendChild(li);
  }

  /**
   * @describe 分别对list和DOM操作，不同步
   */
  remove(liNode: liNode) {
    this.li_un.splice(this.li_un.indexOf(liNode), 1);
    liNode.li.remove();

    this.update_foot();
  }

  /**
   * @describe 同步底栏数量
   */
  update_foot() {
    let un=this.li_un.length;
    let ed=this.li_ed.length;
    this.myFootNum.total.innerHTML = String(un+ed);
    this.myFootNum.finished.innerHTML = String(ed);
    this.myFootNum.unfinish.innerHTML = String(un);
  }

  /**
   * @describe 同步js列表和DOM的主要函数
   * @param flag 显示那种，有"total" | "finished" | "unfinish"三种
   */
  bind_show(flag?: footStatusflag) {
    if (flag === this.footStatus) return;
    flag = flag || this.footStatus;
    this.myFootSpan[this.footStatus].classList.remove("focus");
    this.footStatus = flag;
    this.myFootSpan[this.footStatus].classList.add("focus");

    this.myul.innerHTML = "";
    if (flag!=="finished"){
      for (let ele of this.li_un){
        this.css_unfinished(ele.li,ele.li.querySelector(".mycheckbox")!)
        this.show_append_liNode(ele);
      }
    }
    if (flag!=="unfinish"){
      for (let ele of this.li_ed){
        this.css_finished(ele.li,ele.li.querySelector(".mycheckbox")!)
        this.show_append_liNode(ele);
      }
    }
  }

  bind_edit(liNode: liNode) {
    let li = liNode.li;
    let mylabel = li.querySelector(".mylabel")!;
    mylabel.addEventListener("dblclick", () => {
      let oldValue: string = mylabel.innerHTML;
      mylabel.innerHTML = "";
      li.classList.add("editing");
      let editInput = document.createElement("input");
      editInput.value = oldValue;
      editInput.addEventListener("blur", () => {
        mylabel.innerHTML = editInput.value == "" ? oldValue : editInput.value;
        li.classList.remove("editing");
        editInput.remove();
      });
      mylabel.appendChild(editInput);
      editInput.focus();
    });
  }

  css_finished(li: HTMLElement, mycheckbox_img: HTMLImageElement) {
    mycheckbox_img.src = checked;
    li.classList.add("finished");
  }

  css_unfinished(li: HTMLElement, mycheckbox_img: HTMLImageElement) {
    mycheckbox_img.src = unchecked;
    li.classList.remove("finished");
  }

  /**
   * @describe 重要函数，改变每行的状态
   */
  bind_finish_toggle(liNode: liNode) {
    let li = liNode.li;
    let mycheckbox = <HTMLImageElement>li.querySelector(".mycheckbox")!;
    let mycheckbox_img = <HTMLImageElement>li.querySelector(".mycheckbox>img")!;

    mycheckbox.addEventListener("click", () => {
      if (liNode.isFinished === true) {
        liNode.isFinished = false;
        this.css_unfinished(li, mycheckbox_img);
        this.li_ed.splice(this.li_ed.indexOf(liNode), 1);
        this.li_un.push(liNode);
        this.bind_show();
      } else {
        liNode.isFinished = true;
        this.css_finished(li, mycheckbox_img);
        this.li_un.splice(this.li_un.indexOf(liNode), 1);
        this.li_ed.push(liNode);
        this.bind_show();
      }
      this.update_foot();
    });
  }

  bind_delete(liNode: liNode) {
    let li = liNode.li;
    let delete_button = li.querySelector("button")!;
    delete_button.addEventListener("click", () => {
      this.remove(liNode);
    });
  }
}
