<template>
  <ResizableContainer
    :item-count="columnCount"
    direction="horizontal"
    header-component="ColumnHeader"
    :collapsed-size-percentage="4"
    :min-expanded-size-percentage="10"
  >
    <template
      v-for="(_, index) in columnCount"
      :key="index"
      #[`item${index+1}`]
    >
      <slot :name="`column${index + 1}`"></slot>
    </template>
  </ResizableContainer>
</template>

<script setup>
import ResizableContainer from '@/components/ResizableContainer.vue'

const props = defineProps({
  columnCount: {
    type: Number,
    required: true,
    validator: (value) => value >= 1,
  },
})
</script>
