<template>
  <div>
    <json-view :json="json" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import jsonView from '@/components/jsonView.vue'

const json = ref({
  name: '张三',
  age: 18,
  gender: '男',
  address: {
    province: '北京',
    city: '北京',
    district: '朝阳区',
  },
})
</script>

<style lang="scss" scoped></style>
