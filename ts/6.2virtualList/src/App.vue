<script setup lang="ts">
import { ref, computed,useTemplateRef,watch } from 'vue';
let arr = ref(Array.from({ length: 1000 }, (v, k) => k));
const listHeight = 50;

const visibleList = computed(() => arr.value.slice(startIndex.value,endIndex.value+1))
const maxHeight = computed(() => {
  return listHeight * arr.value.length;
})

const startIndex=ref(0);
const endIndex=ref(0);

const viewdiv=useTemplateRef("viewdiv")
const viewHeight=computed(()=>viewdiv.value!.clientHeight)
const occu_translate=computed(()=>`translate3d(0px, ${listHeight*startIndex.value}px, 0px)`)

function onScroll(e:Event){
  // console.log(1)
  const target = <HTMLElement>e.target;
  startIndex.value = Math.floor(target.scrollTop / listHeight);
  endIndex.value = Math.floor((target.scrollTop + viewHeight.value) / listHeight);
  // debugger;
}

watch(visibleList,(v,o)=>{
  // debugger;
})
</script>

<template>
  <div @scroll="onScroll" class="container" style="height: 100vh;overflow: scroll;">
    <div class="occu" :style="{ height: maxHeight + 'px', width: '100%' , transform:occu_translate}">
      <div style="width: 100%;height: 100vh;" ref="viewdiv">
        <div class="myli" v-for="i in visibleList">
          第{{ i }}行
        </div>
      </div>
    </div>
  </div>

</template>

<style scoped>
.myli {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 50px;
  line-height: 50px;
  width: 100%;
  box-sizing: border-box;
  border-bottom: grey 1px solid;
}
</style>
