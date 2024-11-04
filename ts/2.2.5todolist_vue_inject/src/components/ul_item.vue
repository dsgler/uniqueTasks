<script setup lang="ts">
import unchecked from "../assets/选择_未选择.svg";
import checked from "../assets/选择_已选择.svg";
import deleteIcon from "../assets/删除.svg";
import { computed, ref, type Ref, nextTick, inject } from "vue";

const { liNode, index } = defineProps<{
  liNode: liNode;
  index: number;
}>();


const { finish_toggle_handler, remove_item_handler } = inject<liclass>("liclass")!;

let isEditing: Ref<boolean> = ref(false);

const classObj = computed(() => ({
  myli: true,
  myrow: true,
  finished: liNode.isFinished,
  editing: isEditing.value,
}));




let touch_time = Date.now();
let old: string;
async function touch_handler() {
  let now = Date.now();
  if (now - touch_time > 300) {
    touch_time = Date.now();
    return;
  }
  old = liNode.value;
  isEditing.value = true;
  await nextTick();
  inp.value.focus();
}

let inp = ref();
function blur_editor() {
  if (liNode.value === "") {
    liNode.value = old;
  }
  isEditing.value = false;
}

</script>

<template>
  <li :class="classObj">
    <span class="mycheckbox" @click="finish_toggle_handler(index, liNode.isFinished)"><img
        :src="liNode.isFinished ? checked : unchecked"></span>
    <div class="mylabel" @click="touch_handler">
      <input v-if="isEditing" @blur="blur_editor" v-model.lazy="liNode.value" ref="inp">{{
        isEditing ? " " :
          liNode.value }}
    </div>
    <button @click="remove_item_handler(index, liNode.isFinished)"><img :src="deleteIcon"></button>
  </li>
</template>
