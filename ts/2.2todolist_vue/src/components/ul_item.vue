<script setup lang="ts">
import unchecked from "../assets/选择_未选择.svg";
import checked from "../assets/选择_已选择.svg";
import deleteIcon from "../assets/删除.svg";
import { computed } from "vue";
import type { liNode } from "./ul.vue";

const props = defineProps<{
  liNode: liNode;
  index: number;
}>();

const emit = defineEmits<{
  remove_item: [index: number];
  finish_toggle: [index: number];
}>();

const classObj = computed(() => ({
  myli: true,
  myrow: true,
  finished: props.liNode.isFinished,
  editing: props.liNode.isEditing,
}));

function remove_item_handler() {
  emit("remove_item", props.index);
}

function finish_toggle_handler() {
  emit("finish_toggle", props.index);
}
</script>

<template>
  <li class="myli myrow">
    <span class="mycheckbox" @click="finish_toggle_handler"><img :src="liNode.isFinished ? checked : unchecked"></span>
    <div class="mylabel">{{ liNode.value }}</div>
    <button @click="remove_item_handler"><img :src="deleteIcon"></button>
  </li>
</template>
