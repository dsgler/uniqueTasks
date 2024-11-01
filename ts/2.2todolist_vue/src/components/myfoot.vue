<script setup lang="ts">
import { computed } from 'vue';

export type footStatusflag = "total" | "finished" | "unfinish";
const props = defineProps<{
  total: number;
  unfinish: number;
  finished: number;
  footStatus: footStatusflag;
}>();
const emit = defineEmits<{
  clear_finished: [];
  change_footStatus: [footStatus: footStatusflag];
}>();
const fucus_total = computed(() => props.footStatus === "total");
const fucus_unfinish = computed(() => props.footStatus === "unfinish");
const fucus_finished = computed(() => props.footStatus === "finished");
</script>

<template>
  <div class="foot-count myrow">
    <span @click="$emit('change_footStatus', 'total')" :class="{ focus: fucus_total }">总任务数：<span class="total">{{ total
        }}</span></span>
    <span @click="$emit('change_footStatus', 'unfinish')" :class="{ focus: fucus_unfinish }">未完成：<span
        class="unfinish">{{ unfinish }}</span></span>
    <span @click="$emit('change_footStatus', 'finished')" :class="{ focus: fucus_finished }">已完成：<span
        class="finished">{{ finished }}</span></span>
    <span class="clear" @click="$emit('clear_finished')">清空已完成</span>
  </div>
</template>

<style scoped>
.focus {
  box-shadow: 0 0 2px 2px #639ffdb3;
  /* outline: 0; */
}

.myrow {
  box-sizing: border-box;
  border: none;
  outline: #c0d3f1 2px solid;
  width: 80%;
  box-shadow: inset 0 -2px 1px rgba(0, 0, 0, 0.03);
  background: rgba(0, 0, 0, 0.003);
}

.foot-count {
  display: flex;
  justify-content: space-around;
  flex-direction: row;
  align-items: center;
  height: 2em;
  line-height: 1;
}

.foot-count>span {
  display: block;
  cursor: pointer;
}
</style>
