<script setup>
import { DismissCircle12Regular } from "@vicons/fluent";
import { computed } from "vue";
import _ from "lodash/fp";
const props = defineProps(["active", "cardData", "setting"]);
defineEmits(["update:active"]);

const filteredHeaders = computed(() => {
  return _.compose(
    _.tail,
    _.filter((name) => props.cardData[name] || props.cardData[name] === 0)
  )(props.setting.headers);
});
</script>

<template>
  <n-modal :show="active" @update:show="$emit('update:active', $event)">
    <n-card
      style="max-width: 900px"
      :title="cardData[props.setting.headers[0]]"
      :bordered="false"
      size="small"
      role="dialog"
      aria-modal="true"
    >
      <template #header-extra>
        <n-button
          strong
          circle
          type="error"
          size="large"
          @click="$emit('update:active', false)"
        >
          <n-icon size="40">
            <DismissCircle12Regular />
          </n-icon>
        </n-button>
      </template>
      <n-table striped>
        <tbody>
          <tr v-for="name in filteredHeaders">
            <td colspan="2" v-if="_.includes(name, setting.full)">
              {{ cardData[name] }}
            </td>
            <template v-else>
              <td style="word-break: normal; text-transform: capitalize">
                {{ setting.keys[name] }}
              </td>
              <td>{{ cardData[name] }}</td>
            </template>
          </tr>
        </tbody>
      </n-table>
    </n-card>
  </n-modal>
</template>
