<script setup lang="ts">
import new_todo from './components/new_todo.vue';
import myul from "./components/ul.vue"
import type { liNode } from "./components/ul.vue";
import { ref } from 'vue';
import type { Ref } from 'vue';
let liArr: Ref<{
  value: string;
  isFinished: boolean;
  isEditing: boolean;
}[]> = ref([]);
function add_handler(value: string) {
  liArr.value.push({ value, isEditing: false, isFinished: false });
}
</script>

<template>
  <div class="app-container">
    <h1 class="myhead">MyTodos</h1>
    <new_todo @add_item="add_handler" />
    <myul :liArr="liArr" />
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
