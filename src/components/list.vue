<script setup>
import { ref, computed, watch } from "vue";
import _ from "lodash/fp";
import { filterItems } from "@/search";

const props = defineProps([
  "searchData",
  "setting",
  "maxDisplay",
  "appHeight",
  "appWidth",
]);

const emit = defineEmits(["openItem", "update:index", "update:item-count"]);
const shortList = ref(filterItems(props.setting, {}).list);

watch(
  () => props.searchData,
  _.debounce(200, (searchData) => {
    const filtered = filterItems(props.setting, searchData);
    shortList.value = filtered.list;
    emit("update:index", filtered.index);
    emit("update:item-count", shortList.value.length);
  }),
  { immediate: true }
);

const generateKey = _.compose(
  _.join("_"),
  _.values,
  _.pick(_.take(2, props.setting.headers))
);

const rowProps = (row) => {
  return {
    style: "cursor: pointer",
    onClick: () => {
      emit("openItem", row);
    },
  };
};

const columns = computed(() => {
  return _.compose(
    _.map((data) => {
      return {
        title: _.upperFirst(props.setting.keys[data.key]),
        ...data,
      };
    })
  )(props.setting.table);
});
</script>

<template>
  <n-data-table
    :columns="columns"
    :data="shortList"
    :row-key="generateKey"
    :row-props="rowProps"
    :pagination="{ pageSize: maxDisplay, 'page-slot': 6 }"
    striped
  />
</template>

<style></style>
