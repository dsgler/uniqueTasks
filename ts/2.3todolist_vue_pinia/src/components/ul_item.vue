<script setup lang="ts">
import unchecked from "../assets/选择_未选择.svg";
import checked from "../assets/选择_已选择.svg";
import deleteIcon from "../assets/删除.svg";
import { computed, ref, type Ref, nextTick } from "vue";
import { useliStore } from "../stores/liStore";

let liStore=useliStore();


const props = defineProps<{
  liNode: liNode;
  index: number;
}>();

// const emit = defineEmits<{
//   remove_item: [index: number, isFinished: boolean];
//   finish_toggle: [index: number, isFinished: boolean];
// }>();

let isEditing: Ref<boolean> = ref(false);

const classObj = computed(() => ({
  myli: true,
  myrow: true,
  finished: props.liNode.isFinished,
  editing: isEditing.value,
}));


function remove_item_handler() {
  // emit("remove_item", props.index, props.liNode.isFinished);
  liStore.remove_item_handler(props.index,props.liNode.isFinished);
}

function finish_toggle_handler() {
  // emit("finish_toggle", props.index, props.liNode.isFinished);
  liStore.finish_toggle_handler(props.index,props.liNode.isFinished);
}

let touch_time = Date.now();
let old: string;
async function touch_handler() {
  let now = Date.now();
  if (now - touch_time > 300) {
    touch_time = Date.now();
    return;
  }
  old = props.liNode.value;
  isEditing.value = true;
  await nextTick();
  // debugger;
  // console.log(inp.value);
  inp.value.focus();
}

let inp = ref();
function blur_editor() {
  if (props.liNode.value === "") {
    props.liNode.value = old;
  }
  isEditing.value = false;
}

</script>

<template>
  <li :class="classObj">
    <span class="mycheckbox" @click="finish_toggle_handler"><img :src="liNode.isFinished ? checked : unchecked"></span>
    <div class="mylabel" @click="touch_handler">
      <input v-if="isEditing" @blur="blur_editor" v-model.lazy="liNode.value" ref="inp">{{
        isEditing ? " " :
          liNode.value }}
    </div>
    <button @click="remove_item_handler"><img :src="deleteIcon"></button>
  </li>
</template>
