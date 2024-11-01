import { ref, computed } from "vue";
import { defineStore } from "pinia";
import type { Ref } from "vue";

export const useliStore = defineStore(
  "liStore",
  () => {
    let li_un: Ref<liNode[]> = ref([]);
    let li_ed: Ref<liNode[]> = ref([]);
    let val_set: Set<string> = new Set();

    function add_handler(value: string) {
      if (value === "" || val_set.has(value)) return;
      li_un.value.push({ value, isEditing: false, isFinished: false });
      val_set.add(value);
    }

    let unfinish = computed(() => li_un.value.length);
    let finished = computed(() => li_ed.value.length);
    let total = computed(() => unfinish.value + finished.value);

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

    return {
      li_un,
      li_ed,
      val_set,
      footStatus,
      total,
      unfinish,
      finished,
      add_handler,
      clear_finished_handler,
      change_footStatus_handler,
      remove_item_handler,
      finish_toggle_handler,
    };
  },
  {
    persist: true,
  },
);
