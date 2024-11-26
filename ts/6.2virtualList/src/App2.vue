<script setup lang="ts">
import { ref, computed, useTemplateRef, watch, nextTick } from 'vue';
import { rawArr } from './li';
import { lodash } from './assets/debounce';

// 虚拟高度
const fakeListHeight = 80;
// 记录每个元素的 底部 偏移
// 需要特判 0 的时候
const computedHeight: number[] = Array.from({ length: rawArr.length }, () => 0)
let computedHeightLen = ref(0);

// 根据 startIndex 和 endIndex 确定渲染的列表
const visibleList = computed(() => rawArr.slice(startIndex.value, endIndex.value + 1))
// 虚拟的高度，在渲染完后才是真实高度
const maxHeight = computed(()=>{
    return computedHeight[Math.max(computedHeightLen.value - 1,0)] + fakeListHeight * (rawArr.length - computedHeightLen.value)
})

const startIndex = ref(0);
const endIndex = ref(10);

const viewdiv = useTemplateRef("viewdiv")
const viewHeight = computed(() => viewdiv.value!.clientHeight)
const view_translate = computed(() => `translate3d(0px, ${startIndex.value>0 ? computedHeight[startIndex.value - 1]: 0}px, 0px)`)

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

        return computedHeightLen.value;
    }
}

async function _onScroll(e: Event) {
    const target = <HTMLElement>e.target;
    let scrollTop = target.scrollTop;
    startIndex.value=await eSearch(scrollTop);

    let scrollBottom = scrollTop + viewHeight.value;
    endIndex.value=await eSearch(scrollBottom);
}

let onScroll = lodash._.throttle(_onScroll, 0.5, { leading: true, trailing: false })

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
    computedHeightLen.value = Math.max(computedHeightLen.value, n + 1);
    return h;
}

// 我就说要多打分号
// 先获取前10个的高度
(async function () {
    for (let i = 0; i < 10; i++) {
        await getHeight(i);
    }
})();
</script>

<template>
    <div @scroll="onScroll" class="container" style="height: 100vh;overflow-y: scroll;">
        <div class="occu" :style="{ height: maxHeight + 'px', width: '100%' }">
            <div style="width: 100%;height: 100vh;" ref="viewdiv" :style="{ transform: view_translate }">
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
