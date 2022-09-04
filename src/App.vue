<script setup>
import _ from "lodash/fp";
import { computed, ref, onMounted, onUnmounted } from "vue";
import { darkTheme } from "naive-ui";
import { ArrowCircleDown12Regular } from "@vicons/fluent";
import Finder from "./components/finder.vue";
import List from "./components/list.vue";
import Card from "./components/card.vue";
import { itemLists, settings } from "./search";

const settingName = ref(settings[0].name);
const container = ref(null);
const appHeight = ref(480);
const appWidth = ref(640);
let isIframe = false;
let windowHeight = ref(0);
let windowWidth = ref(0);
let cardActive = ref(false);
let cardData = ref(null);

try {
  isIframe =
    window.location !== window.parent.location ||
    document.body.getAttribute("data-imported") !== "false";
} catch (e) {}

isIframe = false;

const handleAppResize = () => {
  if (
    window.innerHeight !== windowHeight.value ||
    window.innerWidth !== windowWidth.value
  ) {
    windowHeight.value = window.innerHeight;
    windowWidth.value = window.innerWidth;
    appHeight.value = container.value ? container.value.clientHeight : 480;
    appWidth.value = container.value ? container.value.clientWidth : 640;
  }
};

const settingOptions = _.map(({ name, label }) => ({ label, key: name }))(
  settings
);

const setting = computed(() => {
  return _.find(["name", settingName.value])(settings);
});

const items = computed(() => {
  return itemLists[settingName.value];
});

const maxDisplay = computed(() => {
  const calculated = Math.round((appHeight.value - 80) / 60);
  return calculated > 15 || calculated < 4 ? 15 : calculated;
});

const searchData = _.compose(
  ref,
  _.fromPairs,
  _.map((setting) => [setting.key, setting.default])
)(setting.value.inputs);

const handleAppResizeBounce = _.debounce(500, handleAppResize);
onMounted(() => {
  handleAppResize();
  window.addEventListener("resize", handleAppResizeBounce);
});
onUnmounted(() => {
  window.removeEventListener("resize", handleAppResizeBounce);
});

function openItem(item) {
  cardData.value = item;
  cardActive.value = true;
}
</script>

<template>
  <n-config-provider
    :theme="isIframe ? undefined : darkTheme"
    :style="`background-color: ${isIframe ? 'transparent' : 'black'}; ${
      isIframe || appWidth < 900 ? '' : 'padding: 10px 20px;'
    }`"
  >
    <n-global-style />
    <card
      v-model:active="cardActive"
      :card-data="cardData"
      :setting="setting"
    />
    <main ref="container" id="vue-container">
      <finder
        title="Kártya Keresés"
        v-model:search="searchData"
        :width="appWidth"
        :items="items"
        :setting="setting"
      >
        <n-h2>
          <n-dropdown
            trigger="click"
            :options="settingOptions"
            @select="settingName = $event"
          >
            <n-button type="info">
              <template #icon>
                <n-icon>
                  <ArrowCircleDown12Regular />
                </n-icon>
              </template>
              {{ setting.label }}
            </n-button>
          </n-dropdown>
        </n-h2>
      </finder>
      <list
        :search-data="searchData"
        :setting="setting"
        :max-display="maxDisplay"
        :app-width="appWidth"
        :app-height="appHeight"
        @open-item="openItem"
      >
      </list>
    </main>
  </n-config-provider>
</template>

<style>
@import "./assets/main.css";

#vue-container {
}
</style>
