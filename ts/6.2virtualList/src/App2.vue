<script setup lang="ts">
import { ref, computed, useTemplateRef, watch, nextTick } from 'vue';
import { rawArr } from './li';
import { lodash } from './assets/debounce';
const fakeListHeight = 80;
const computedHeight: number[] = Array.from({length:rawArr.length},()=>0)
let computedHeightLen=ref(0);

const visibleList = computed(() => rawArr.slice(startIndex.value, endIndex.value + 1))
const maxHeight = ref(rawArr.length*fakeListHeight)

const startIndex = ref(0);
const endIndex = ref(10);

// computedHeight[computedHeight.length - 1] + fakeListHeight * (rawArr.length - computedHeight.length)

const viewdiv = useTemplateRef("viewdiv")
const viewHeight = computed(() => viewdiv.value!.clientHeight)
const occu_translate = computed(() => `translate3d(0px, ${computedHeight[startIndex.value - 1]}px, 0px)`)

async function _onScroll(e: Event) {
    // console.log(1)
    const target = <HTMLElement>e.target;
    let scrollTop = target.scrollTop;
    for (let i = 0; i < rawArr.length; i++) {
        if ((await getHeight(i - 1)) < scrollTop) {
            if ((await getHeight(i)) >= scrollTop) {
                startIndex.value = i;
                break;
            }
        } else {
            // debugger;
            // startIndex.value=0;
            break;
        }
    }

    let scrollBottom = scrollTop + viewHeight.value;
    for (let i = 1; i < rawArr.length; i++) {
        if ((await getHeight(i - 1)) < scrollBottom) {
            if ((await getHeight(i)) >= scrollBottom) {
                endIndex.value = i;
                break;
            }
        } else {
            // debugger;
            break;
        }
    }
}

let onScroll=lodash._.throttle(_onScroll,0.5,{leading:true,trailing:false})

const computeContent = ref("");
const computeArea = useTemplateRef("computeArea");

async function getHeight(n: number): Promise<number> {
    if (n < -1) {
        debugger;
    }

    if (n === -1) {
        return 0;
    }


    if (n < computedHeightLen.value) {
        return computedHeight[n];
    }
    computeContent.value = rawArr[n];
    await nextTick();
    let h = computeArea.value!.offsetHeight + (await getHeight(n - 1));
    computedHeight[n] = h
    computedHeightLen.value=Math.max(computedHeightLen.value,n+1);
    // maxHeight.value=computedHeight[computedHeightLen - 1] + fakeListHeight * (rawArr.length - computedHeightLen)
    return h;
}

watch(maxHeight, (v, o) => {
    // debugger;
})

watch(computedHeightLen,(v,o)=>{
    if (v>o){
        if (computedHeightLen.value>=99){
            debugger;
        }
        maxHeight.value=computedHeight[computedHeightLen.value - 1] + fakeListHeight * (rawArr.length - computedHeightLen.value)
    }
})

async function a() {
    for (let i = 0; i < 10; i++) {
        await getHeight(i);
    }
}
a()
</script>

<template>
    <div @scroll="onScroll" class="container" style="height: 100vh;overflow: scroll;">
        <div class="occu" :style="{ height: maxHeight + 'px', width: '100%', transform: occu_translate }">
            <div style="width: 100%;height: 100vh;" ref="viewdiv">
                <div v-html="v" class="myli" v-for="(v, k) in visibleList" :key="startIndex + k">
                </div>
                <div v-html="computeContent" class="myli" ref="computeArea"
                    style="visibility: hidden;position: absolute;top: 0px;left: 0px;transform: translate3d(0px,0px,-10px);">
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
    /* height: 50px;
    line-height: 50px; */
    width: 100%;
    box-sizing: border-box;
    border-bottom: grey 1px solid;
}
</style>
