import { lodash } from "./debounce";

let bd = lodash._.debounce(
  () => {
    console.warn(cnt++);
  },
  1000,
  { maxWait: 3000 }
);
let but = <HTMLElement>document.querySelector("#test")!;
let cnt = 0;
but.addEventListener("click", () => {
  bd();
});

let ainput=<HTMLInputElement>document.querySelector("#ainput")!;
let inputcontent=document.querySelector("#inputcontent")!;
let isDebounce=<HTMLInputElement>document.querySelector("#isDebounce")!;

function updateContent(){
  // console.log("???")
  inputcontent.innerHTML=ainput.value;
}
let de=lodash._.debounce(updateContent,1000);
ainput.addEventListener("input",()=>{
  if (isDebounce.checked){
    de();
  }else{
    updateContent()
  }
})
