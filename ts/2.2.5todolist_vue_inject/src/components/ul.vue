<script setup lang="ts">
import ul_item from "./ul_item.vue";
import { inject } from "vue";

const { li_un, li_ed, footStatus } = inject<liclass>("liclass")!;

</script>

<template>
  <ul class="myul">
    <template v-if="footStatus !== 'finished'">
      <ul_item v-for="(item, index) in li_un" :key="item.value" :liNode="item" :index="index" />
    </template>
    <template v-if="footStatus !== 'unfinish'">
      <ul_item v-for="(item, index) in li_ed" :key="item.value" :liNode="item" :index="index" />
    </template>
  </ul>
</template>

<style scoped>
.editing {
  box-shadow: 0 0 2px 2px #639ffdb3;
  /* outline: 0; */
}

.myul {
  list-style-type: none;
  width: 100%;
  padding: 0px;
  margin: 20px 0px;
  display: flex;
  align-items: center;
  flex-direction: column;
}

.myli {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  height: 2em;
  position: relative;
  margin: 5px 0px;
  transition: all var(--speed) ease;
}

.myrow {
  box-sizing: border-box;
  border: none;
  outline: #c0d3f1 2px solid;
  width: 80%;
  box-shadow: inset 0 -2px 1px rgba(0, 0, 0, 0.03);
  background: rgba(0, 0, 0, 0.003);
}

.myli :deep(>.mycheckbox) {
  width: 2em;
  height: 2em;
  appearance: none;
  cursor: pointer;
  display: flex;
}

.myli.editing :deep(>.mycheckbox) {
  visibility: hidden;
}

.myli :deep(img) {
  width: 100%;
}

.myli :deep(>.mylabel) {
  width: 100%;
  text-align: left;
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-right: 45px;
  transition: all var(--speed) ease;
}

.myli :deep(>.mylabel>input) {
  padding: 0;
  margin: 0;
  width: 100%;
  display: block;
  font-size: inherit;
  font: inherit;
  color: #000000c4;
  border: 0;
  border-bottom: #639ffdb3 1px solid;
  outline: 0;
}

.myli :deep(>button) {
  cursor: pointer;
  display: none;
  height: 90%;
  aspect-ratio: 1 / 1;
  border: none;
  position: absolute;
  right: 0px;
  background: none;
  margin: auto 0px;
}

.myli:hover :deep(>button) {
  display: flex;
  align-items: center;
}

.myli.editing :deep(>button) {
  display: none;
}

.myli.finished {
  outline: #a5a8ac 2px solid;
}

.myli.finished :deep(>.mylabel) {
  color: gray;
  text-decoration: line-through;
}
</style>
