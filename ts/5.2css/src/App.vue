<script setup lang="ts">
import { ref } from 'vue';
let styleLeft = { transform: "rotateY(240deg) translateZ(var(--distance))" };
let styleCenter = { transform: "translateZ(var(--distance))" };
let styleRight = { transform: "rotateY(120deg) translateZ(var(--distance))" };
let styleArr = ref([styleLeft, styleCenter, styleRight]);

let classArr = ref(["img-left", "img-center", "img-right"])
let pid:number|null=null
function switchClassForward() {
  classArr.value.push(classArr.value.shift()!);
}

function switchClassBackward() {
  classArr.value.unshift(classArr.value.pop()!);
}

let status=ref("播放");
function togglePlay(){
  console.log(pid);
  if (pid===null){
    switchClassForward();
    status.value="停止"
    pid=setInterval(switchClassForward,2000)
  }else{
    status.value="播放"
    clearInterval(pid);
    pid=null
  }
}
</script>

<template>
  <div id="container">
    <div id="main">
      <div class="img-container" :class="classArr[0]">
        <div class="occu"></div>
        <img src="/1688272120155.png" />
      </div>
      <div class="img-container" :class="classArr[1]">
        <div class="occu"></div>
        <img src="/57452059_p1.jpg" />
      </div>
      <div class="img-container" :class="classArr[2]">
        <div class="occu"></div>
        <img src="/67624284_p0.jpg" />
      </div>
      <button @click="togglePlay" class="text-white w-[50px] h-[50px] rounded-full bg-emerald-300 top-[550px] border-none absolute">{{ status }}</button>
      <button @click="()=>{if (pid!==null){togglePlay()};switchClassBackward();}" class="translate-x-[-100px] text-white w-[50px] h-[50px] rounded-full bg-emerald-300 top-[550px] border-none absolute">上一张</button>
      <button @click="()=>{if (pid!==null){togglePlay()};switchClassForward();}" class="translate-x-[100px] text-white w-[50px] h-[50px] rounded-full bg-emerald-300 top-[550px] border-none absolute">下一张</button>
    </div>
  </div>
</template>

<style>
:root {
  --distance: 300px;
}

body {
  margin: 0px;
}

#container {
  width: 100%;
  min-height: 100vh;
  background-color: white;
  display: flex;
  flex-direction: column;
  align-items: center;

  background: linear-gradient(to bottom right, #ead6ee, #a0f1ea);
}

#main {
  margin: 20px;
  position: relative;
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  perspective: 900px;
  transform-style: preserve-3d;
  perspective-origin: 50% 50%;
}

.img-container {
  max-width: 400px;
  aspect-ratio: 16/9;
  overflow: hidden;
  position: absolute;
  margin: 0px auto;
  top: 200px;

  -webkit-box-reflect: below 3px -webkit-linear-gradient(top, rgba(0, 0, 0, 0) 80%, rgba(0, 0, 0, 0.25));

  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 1s ease-in-out;
}

.img-container>img {
  width: 100%;
}

.img-center {
  transform: translateZ(var(--distance));
}

.img-left {
  transform: rotateY(240deg) translateZ(var(--distance));
}

.img-right {
  transform: rotateY(120deg) translateZ(var(--distance));
}

.occu {
  width: 100%;
  height: 100%;
}

@media screen and (max-width: 700px) {
  #main{
    transform: scale(0.5);
  }
}
</style>
