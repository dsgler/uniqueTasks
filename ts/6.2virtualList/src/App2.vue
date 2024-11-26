<script setup lang="ts">
import { ref, computed, useTemplateRef, watch, nextTick } from 'vue';
import { rawArr } from './li';
import { lodash } from './assets/debounce';

// 预渲染元素
const preLoadLen=10

const bufferLen=3;
// 虚拟高度
const fakeListHeight = ref(80);
// 记录每个元素的 底部 偏移
// 需要特判 0 的时候
const computedHeight: number[] = Array.from({ length: rawArr.length }, () => 0)
let computedHeightLen = ref(0);

// 根据 startIndex 和 endIndex 确定渲染的列表
const visibleList = computed(() => rawArr.slice(startIndex.value, endIndex.value + 1))
// 虚拟的高度，在渲染完后才是真实高度
const maxHeight = computed(()=>{
    return computedHeight[Math.max(computedHeightLen.value - 1,0)] + fakeListHeight.value * (rawArr.length - computedHeightLen.value)
})

const startIndex = ref(0);
const endIndex = ref(preLoadLen);

const viewdiv = useTemplateRef("viewdiv")
const viewHeight = computed(() => viewdiv.value!.clientHeight)
const view_translate = computed(() => `translate3d(0px, ${startIndex.value>0 ? computedHeight[startIndex.value - 1]: 0}px, 0px)`)

// 二分，找到最近的大于等于； 若为计算，则递增渲染计算
async function eSearch(height: number):Promise<number> {
    if (height <= computedHeight[computedHeightLen.value - 1]) {
        let l = 0, r = computedHeightLen.value - 1;
        let ans = -1;
        while (l <= r) {
            // ~~也可转为整数，网上看到的
            let m = Math.ceil(l + (r - l) / 2);
            if ((await getHeight(m)) < height) {
                l = m + 1;
                continue;
            } else {
                ans = m;
                r = m - 1;
            }
        }
        return ans;
    }else{
        let h;
        do{
            h=await getHeight(computedHeightLen.value);
        }while(height>h);

        updateFakeHeight();
        return computedHeightLen.value;
    }
}

async function _onScroll(e: Event) {
    const target = <HTMLElement>e.target;
    let scrollTop = target.scrollTop;
    let a=await eSearch(scrollTop)
    startIndex.value=Math.max(a-bufferLen,0);

    let scrollBottom = scrollTop + viewHeight.value;
    a=await eSearch(scrollBottom);
    endIndex.value=Math.min(a+bufferLen,rawArr.length);
}

function throttle<T extends (...args: any[]) => void>(func: T, limit: number): (...args: Parameters<T>) => void {
  let inThrottle: boolean | number;
  return function(this: any, ...args: Parameters<T>) {
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    } else {
      cancelAnimationFrame(inThrottle as number);
      inThrottle = requestAnimationFrame(() => {
        func.apply(context, args);
        setTimeout(() => (inThrottle = false), limit);
      });
    }
  };
}

function anify(func:Function){
    let lock=false;
    let f=(...args:any[])=>{
        if (lock){
            return;
        }

        lock=true;
        window.requestAnimationFrame(async () => {
            await func(...args);
            lock=false;
        })
    }
    return f;
}

// 节流
// let onScroll = lodash._.throttle(_onScroll, 0.2, { leading: false, trailing: true })
// let onScroll=throttle(_onScroll,0.2);
let onScroll=anify(_onScroll);

// 用于渲染元素以获取高度
const computeContent = ref("");
const computeArea = useTemplateRef("computeArea");

async function getHeight(n: number): Promise<number> {
    console.assert(n>=-1);
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
    computedHeightLen.value = Math.max(computedHeightLen.value, n + 1);
    return h;
}

// 根据已渲染数据重新计算评价高度
function updateFakeHeight(){
    fakeListHeight.value=computedHeight[computedHeightLen.value-1]/computedHeightLen.value;
}
// (1);
// 我就说要多打分号
// 先获取前10个的高度
(async function () {
    for (let i = 0; i < preLoadLen; i++) {
        await getHeight(i);
    }
    updateFakeHeight();
})();
</script>

<template>
    <!-- 用于显示滑动条 -->
    <div @scroll="onScroll" class="container" style="height: 100vh;overflow-y: scroll;">
        <!-- 用于撑起滑动条长度 -->
        <div class="occu" :style="{ height: maxHeight + 'px', width: '100%' }">
            <!-- 用于偏移 -->
            <div style="width: 100%;height: 100vh;" ref="viewdiv" :style="{ transform: view_translate }">
                <div v-html="v" class="myli" v-for="(v, k) in visibleList" :key="startIndex + k">
                </div>
                <!-- 这是一个不会显示的用于计算高度的元素 -->
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
