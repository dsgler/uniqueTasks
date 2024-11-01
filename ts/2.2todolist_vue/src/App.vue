<script setup lang="ts">
import new_todo from './components/new_todo.vue';
import myul from "./components/ul.vue";
import myFoot from "./components/myfoot.vue";
import type { liNode } from "./components/ul.vue";
import type { footStatusflag } from "./components/myfoot.vue"
import { computed, ref } from 'vue';
import type { Ref } from 'vue';

let li_un: Ref<liNode[]> = ref([]);
let li_ed: Ref<liNode[]> = ref([]);
// 为了防止 key 的重复
let val_set: Set<string> = new Set();
function add_handler(value: string) {
  if (val_set.has(value)) return;
  li_un.value.push({ value, isEditing: false, isFinished: false });
  val_set.add(value);
}
let total = computed(() => li_un.value.length + li_ed.value.length);

let unfinish = computed(() => li_un.value.length);

let finished = computed(() => li_ed.value.length);

let footStatus: Ref<footStatusflag> = ref("total");

function clear_finished_handler() {
  li_ed.value.length = 0;
}

function change_footStatus_handler(_footStatus: footStatusflag) {
  footStatus.value = _footStatus;
}

function remove_item_handler(index: number, isFinished: boolean) {
  let value: string;
  if (isFinished) {
    value = li_ed.value.splice(index, 1)[0].value;
  } else {
    value = li_un.value.splice(index, 1)[0].value;
  }
  val_set.delete(value);
}

function finish_toggle_handler(index: number, isFinished: boolean) {
  let li_my = isFinished ? li_ed : li_un;
  let li_other = isFinished ? li_un : li_ed;

  let pop_item = li_my.value.splice(index, 1)[0];
  pop_item.isFinished = !pop_item.isFinished;
  li_other.value.push(pop_item);
}
</script>

<template>
  <div class="app-container">
    <h1 class="myhead">MyTodos</h1>
    <new_todo @add_item="add_handler" />
    <myul :li_un="li_un" :li_ed="li_ed" :footStatus="footStatus" @remove_item="remove_item_handler"
      @finish_toggle="finish_toggle_handler" />
    <my-foot :total="total" :finished="finished" :unfinish="unfinish" :footStatus="footStatus"
      @clear_finished="clear_finished_handler" @change_foot-status="change_footStatus_handler" />
  </div>
</template>

<style scoped>
.app-container {
  padding: 10px;
  background-color: #ffffff;
  width: 100%;
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  align-content: center;
  align-items: center;
}

.myhead {
  display: block;
  font-size: 2em;
  color: #000000e0;
}
</style>
