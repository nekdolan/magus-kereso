<script setup>
import { ref, computed } from "vue";
import { Search12Regular } from "@vicons/fluent";

const props = defineProps(["title", "search", "width", "setting", "itemCount"]);
const emit = defineEmits(["update:search"]);

const active = ref(false);

const initSearch = { ...props.search };
const clear = () => {
  emit("update:search", initSearch);
};
const update = (key, value) => {
  const search = { ...props.search, [key]: value };
  emit("update:search", search);
};
const fullTitle = computed(() => {
  return `${props.title} (${props.itemCount})`;
});
</script>
<template>
  <n-drawer
    :show="active"
    @update:show="active = $event"
    placement="left"
    :width="Math.min(502, width)"
  >
    <n-drawer-content :title="fullTitle" closable>
      <n-form label-placement="left" size="medium" label-width="auto">
        <n-form-item
          :label-placement="width < 502 ? 'top' : 'left'"
          :label="input.label"
          v-for="input in setting.inputs"
          :key="input.key"
        >
          <component
            :value="search[input.key]"
            @update:value="update(input.key, $event)"
            :is="input.component"
            v-bind="input.props"
            v-if="input.component"
          />
        </n-form-item>
      </n-form>
      <n-button @click="clear">Visszaállítás</n-button>
    </n-drawer-content>
  </n-drawer>
  <n-grid cols="2" responsive="screen">
    <n-grid-item class="top-nav">
      <n-space justify="start">
        <n-button type="primary" @click="active = !active">
          <template #icon>
            <n-icon>
              <Search12Regular />
            </n-icon>
          </template>
          Keresés
        </n-button>
      </n-space>
    </n-grid-item>
    <n-grid-item class="top-nav">
      <n-space justify="end">
        <slot></slot>
      </n-space>
    </n-grid-item>
  </n-grid>
</template>
