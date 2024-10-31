<script setup lang="ts">
import add_img from "../assets/回车.svg";
import { ref, type Ref } from "vue";
let itemStr = ref("");

const emit = defineEmits<{
  add_item: [value: string];
}>();

function add_handler() {
  if (itemStr.value === "") return;
  emit("add_item", itemStr.value);
  itemStr.value = "";
}
</script>

<template>
  <div class="input-container myrow">
    <input v-model.trim="itemStr" @keydown.enter="add_handler" class="new-todo" placeholder="What needs to be done?"
      autofocus="true">
    <img :src="add_img" @click="add_handler" />
  </div>
</template>

<style scoped>
.myrow {
  box-sizing: border-box;
  border: none;
  outline: #c0d3f1 2px solid;
  width: 80%;
  box-shadow: inset 0 -2px 1px rgba(0, 0, 0, 0.03);
  background: rgba(0, 0, 0, 0.003);
}

.input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.new-todo {
  box-sizing: border-box;
  width: 100%;
  font-size: 1.5em;
  height: 2em;
  padding: 16px 16px 16px 60px;
  border: none;
  outline: none;
}

.input-container>img {
  height: 80%;
  position: absolute;
  right: 10px;
  cursor: pointer;
  display: none;
}

.input-container:hover>img {
  display: block;
}

.new-todo:focus {
  box-shadow: 0 0 2px 2px #639ffdb3;
  /* outline: 0; */
}

@media screen and (max-width: 600px) {
  .input-container>img {
    height: 80%;
    position: absolute;
    right: 10px;
    cursor: pointer;
    display: block;
  }
}
</style>
