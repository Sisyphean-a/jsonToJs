<script setup>
import { RouterView } from 'vue-router'
import GlobalShortcuts from './components/GlobalShortcuts.vue'
</script>

<template>
  <RouterView v-slot="{ Component }">
    <keep-alive>
      <component :is="Component" />
    </keep-alive>
  </RouterView>
  <GlobalShortcuts />
</template>

<style scoped></style>
