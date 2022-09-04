<script setup>
import { ref, computed, watch, reactive, h } from "vue";
import _ from "lodash/fp";
import { filterItems } from "../search";

const props = defineProps([
  "searchData",
  "setting",
  "maxDisplay",
  "appHeight",
  "appWidth",
]);

const emit = defineEmits(["openItem"]);

// const shortHeaderList = computed(() => {
//   return _.compose(
//     _.map(({ key }) => key),
//     _.reject(({ ellipsis }) => ellipsis)
//   )(props.setting.table);
// });

// const orderItems = _.orderBy(
//   // ["kaszt", "fotipus", "szint"],
//   shortHeaderList.value,
//   // [],
//   _.map(() => "asc")(shortHeaderList.value)
//   //["desc", "desc", "desc"]
// );

const shortList = ref(filterItems(props.setting, {}));

watch(
  () => props.searchData,
  _.debounce(200, (searchData) => {
    shortList.value = filterItems(props.setting, searchData);
  })
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
