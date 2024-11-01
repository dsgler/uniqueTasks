<script setup lang="ts">
import new_todo from './components/new_todo.vue';
import myul from "./components/ul.vue";
import myFoot from "./components/myfoot.vue";
import { computed, ref } from 'vue';
import type { Ref } from 'vue';

</script>

<template>
  <div class="app-container">
    <h1 class="myhead">MyTodos</h1>
    <new_todo />
    <myul />
    <my-foot />
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
