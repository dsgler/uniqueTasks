import "./style.css";
import todolist from "./todolist";

const app = document.getElementById("app")!;
window.todolist_instance=new todolist(app);