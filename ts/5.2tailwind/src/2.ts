import './style.css'
import './2.css'

const container=document.querySelector(".container")!;
let str=`<div class="row">
          <div class="pic"></div>
          <div class="text-card">
            <div class="title">这是一个标题</div>
            <div class="content">
              正文正文正文正文正文,正文正文正文正文,正文正文正文正文正文正文正文正文,正文正文正文正文,正文正文正文
            </div>
            <div class="date">CCTV 2027</div>
            <div class="path">
              <a href="javascript:void(0)">name</a>
              <a href="javascript:void(0)">road</a>
            </div>
          </div>
        </div>`
for (let i=0;i<3;i++){
    container.innerHTML+=str
}